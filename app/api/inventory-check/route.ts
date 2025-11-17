import { NextRequest, NextResponse } from 'next/server';
import { readSheetData } from '@/lib/googleSheets';

export async function GET(request: NextRequest) {
  try {
    // "재고조사" 시트의 데이터 읽기 (A2:B 범위는 헤더 제외한 데이터)
    // 헤더: 항목, 재고
    const data = await readSheetData('재고조사!A2:B');
    
    // 데이터를 객체 배열로 변환
    const inventoryCheck = data.map((row) => ({
      항목: row[0] || '',
      재고: row[1] || '',
    }));
    
    return NextResponse.json({ data: inventoryCheck });
  } catch (error: any) {
    console.error('Error reading inventory check:', error);
    return NextResponse.json(
      { error: '재고조사 데이터를 불러오는데 실패했습니다.', details: error.message },
      { status: 500 }
    );
  }
}

