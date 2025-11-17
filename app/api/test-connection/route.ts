import { NextResponse } from 'next/server';
import { getGoogleSheetsClient, getSpreadsheetId } from '@/lib/googleSheets';

export async function GET() {
  try {
    // Google Sheets API 연결 테스트
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    // 스프레드시트 메타데이터 조회로 연결 테스트
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    return NextResponse.json({
      success: true,
      message: 'Google Sheets API 연결 성공',
      spreadsheetTitle: response.data.properties?.title,
      spreadsheetId,
    });
  } catch (error: any) {
    console.error('Connection test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Google Sheets API 연결 실패',
        details: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

