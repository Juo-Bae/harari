import { NextRequest, NextResponse } from 'next/server';
import { readSheetData, writeSheetData, findRow, appendSheetData, batchUpdateSheetData } from '@/lib/googleSheets';
import { formatDateToYYYYMMDD } from '@/lib/dateUtils';

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json();

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: '데이터 형식이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    // 1. 재고 시트에서 항목 이름으로 코드와 이름 찾기
    const inventoryData = await readSheetData('재고!A:M');
    const inventoryMap = new Map<string, { 코드: string; 이름: string; rowIndex: number }>();

    // 헤더 제외하고 데이터 매핑
    // 컬럼 순서: 구매 상황(0), 코드(1), 중요도(2), 이름(3), 재고(4), ...
    for (let i = 1; i < inventoryData.length; i++) {
      const row = inventoryData[i];
      const 이름 = row[3]; // 이름 컬럼 (D, 인덱스 3)
      const 코드 = row[1]; // 코드 컬럼 (B, 인덱스 1)
      if (이름 && 코드) {
        inventoryMap.set(이름, { 코드, 이름, rowIndex: i + 1 });
      }
    }

    // 현재 날짜를 YYYY-MM-DD 형식으로 변환
    const now = formatDateToYYYYMMDD(new Date().toISOString());
    const logEntries: any[][] = [];
    
    // 재고조사 시트 데이터 읽기 (한 번만)
    const checkData = await readSheetData('재고조사!A:B');
    
    // 배치 업데이트를 위한 배열 준비
    const batchUpdates: Array<{ range: string; values: any[][] }> = [];

    // 2. 재고조사 데이터 업데이트 및 재고 시트 업데이트 (배치로 수집)
    for (const item of data) {
      const { 항목, 재고 } = item;
      
      // 재고조사 시트 업데이트 범위 찾기
      const checkRowIndex = checkData.findIndex((row, index) => index > 0 && row[0] === 항목);
      
      if (checkRowIndex !== -1) {
        const actualRowIndex = checkRowIndex + 1;
        const 재고Column = 'B'; // 재고는 B 컬럼
        batchUpdates.push({
          range: `재고조사!${재고Column}${actualRowIndex}`,
          values: [[재고]],
        });
      }

      // 재고 시트에서 해당 항목 찾기 (이름으로 검색)
      const inventoryInfo = inventoryMap.get(항목);
      if (inventoryInfo) {
        // 재고 시트의 재고 값 업데이트 (E 컬럼, 인덱스 4)
        const 재고Column = 'E';
        batchUpdates.push({
          range: `재고!${재고Column}${inventoryInfo.rowIndex}`,
          values: [[재고]],
        });

        // 재고로그에 추가할 데이터 준비 (날짜는 YYYY-MM-DD 형식)
        logEntries.push([
          now, // 일시 (YYYY-MM-DD 형식)
          inventoryInfo.코드, // 코드
          inventoryInfo.이름, // 이름
          재고, // 재고
        ]);
      }
    }

    // 배치 업데이트 실행 (한 번의 API 호출로 모든 업데이트 처리)
    if (batchUpdates.length > 0) {
      await batchUpdateSheetData(batchUpdates);
    }

    // 3. 재고로그 시트 업데이트 (실패해도 재고 업데이트는 성공 처리)
    let logUpdateSuccess = false;
    let logUpdateError: string | null = null;
    
    if (logEntries.length > 0) {
      try {
        // 기존 로그 읽기
        const existingLogs = await readSheetData('재고로그!A:D');
        
        // 중복 체크 및 업데이트
        const updatedLogs: any[][] = [];
        const processedCodes = new Set<string>();

        // 새 로그 항목들을 먼저 처리
        for (const newLog of logEntries) {
          const [일시, 코드] = newLog;
          const normalized일시 = formatDateToYYYYMMDD(일시);
          const key = `${normalized일시}_${코드}`;
          
          // 기존 로그에서 동일한 일시와 코드 찾기 (날짜 형식 정규화)
          let found = false;
          for (let i = 1; i < existingLogs.length; i++) {
            const existingLog = existingLogs[i];
            const normalizedExisting일시 = formatDateToYYYYMMDD(existingLog[0]);
            if (normalizedExisting일시 === normalized일시 && existingLog[1] === 코드) {
              // 덮어쓰기 (새 로그의 날짜 형식 사용)
              updatedLogs.push([normalized일시, newLog[1], newLog[2], newLog[3]]);
              found = true;
              processedCodes.add(key);
              break;
            }
          }
          
          if (!found) {
            // 날짜 형식 정규화하여 추가
            updatedLogs.push([normalized일시, newLog[1], newLog[2], newLog[3]]);
            processedCodes.add(key);
          }
        }

        // 나머지 기존 로그 추가 (중복되지 않은 것만, 날짜 형식 정규화)
        for (let i = 1; i < existingLogs.length; i++) {
          const existingLog = existingLogs[i];
          const normalizedExisting일시 = formatDateToYYYYMMDD(existingLog[0]);
          const key = `${normalizedExisting일시}_${existingLog[1]}`;
          if (!processedCodes.has(key)) {
            // 날짜 형식 정규화하여 추가
            updatedLogs.push([
              normalizedExisting일시,
              existingLog[1],
              existingLog[2],
              existingLog[3],
            ]);
          }
        }

        // 날짜 기준으로 내림차순 정렬 (YYYY-MM-DD 형식이므로 문자열 비교 가능)
        updatedLogs.sort((a, b) => {
          // YYYY-MM-DD 형식이므로 문자열 비교로 정렬 가능
          const dateA = formatDateToYYYYMMDD(a[0]);
          const dateB = formatDateToYYYYMMDD(b[0]);
          return dateB.localeCompare(dateA); // 내림차순
        });

        // 전체 로그 시트 업데이트 (헤더 포함)
        const allLogs = [['일시', '코드', '이름', '재고'], ...updatedLogs];
        
        // 시트 범위 계산
        const rowCount = allLogs.length;
        await writeSheetData(`재고로그!A1:D${rowCount}`, allLogs);
        logUpdateSuccess = true;
      } catch (logError: any) {
        logUpdateError = logError.message || '재고로그 업데이트 실패';
        console.error('재고로그 업데이트 오류:', logError);
        
        // 보호된 셀 에러인 경우 명확한 메시지 제공
        if (logError.message?.includes('protected cell') || logError.message?.includes('protected')) {
          logUpdateError = '재고로그 시트가 보호되어 있어 업데이트할 수 없습니다. 스프레드시트 소유자에게 보호를 해제해달라고 요청하세요.';
        }
      }
    }

    // 재고 업데이트는 성공했지만 로그 업데이트가 실패한 경우
    if (!logUpdateSuccess && logUpdateError) {
      return NextResponse.json({
        success: true,
        message: '재고는 성공적으로 업데이트되었습니다.',
        warning: logUpdateError,
      });
    }

    return NextResponse.json({ success: true, message: '재고가 성공적으로 업데이트되었습니다.' });
  } catch (error: any) {
    console.error('Update inventory check error:', error);
    return NextResponse.json(
      { error: '재고 업데이트 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}

