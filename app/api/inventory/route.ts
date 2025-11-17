import { NextRequest, NextResponse } from 'next/server';
import { readSheetData } from '@/lib/googleSheets';

export async function GET(request: NextRequest) {
  try {
    // "재고" 시트의 데이터 읽기 (A2:M 범위는 헤더 제외한 데이터)
    // 헤더: 구매 상황, 코드, 중요도, 이름, 재고, 소비량, 안전, 단위, 체크 요일, 구매처, MOQ, 리드타임, 최근 구매일자
    const data = await readSheetData('재고!A2:M');
    
    // 데이터를 객체 배열로 변환
    const inventory = data.map((row) => ({
      구매상황: row[0] || '',
      코드: row[1] || '',
      중요도: row[2] || '',
      이름: row[3] || '',
      재고: row[4] || '',
      소비량: row[5] || '',
      안전: row[6] || '',
      단위: row[7] || '',
      체크요일: row[8] || '',
      구매처: row[9] || '',
      MOQ: row[10] || '',
      리드타임: row[11] || '',
      최근구매일자: row[12] || '',
    }));
    
    return NextResponse.json({ data: inventory });
  } catch (error: any) {
    console.error('Error reading inventory:', error);
    return NextResponse.json(
      { error: '재고 데이터를 불러오는데 실패했습니다.', details: error.message },
      { status: 500 }
    );
  }
}

