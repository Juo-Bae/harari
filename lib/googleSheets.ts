import { google } from 'googleapis';

// Google Sheets API 클라이언트 초기화
export async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SHEETS_CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  return sheets;
}

// 스프레드시트 ID 가져오기
export function getSpreadsheetId(): string {
  const id = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!id) {
    throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID 환경 변수가 설정되지 않았습니다.');
  }
  return id;
}

// 시트 데이터 읽기
export async function readSheetData(range: string) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  
  return response.data.values || [];
}

// 시트 데이터 쓰기
export async function writeSheetData(range: string, values: any[][]) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  
  const response = await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    resource: {
      values,
    },
  });
  
  return response.data;
}

// 시트 데이터 추가 (append)
export async function appendSheetData(range: string, values: any[][]) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values,
    },
  });
  
  return response.data;
}

// 특정 행 찾기 및 업데이트
export async function findAndUpdateRow(
  sheetName: string,
  searchColumnIndex: number,
  searchValue: string,
  updateColumnIndex: number,
  updateValue: any
) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  
  // 전체 데이터 읽기
  const range = `${sheetName}!A:Z`;
  const data = await readSheetData(range);
  
  if (!data || data.length === 0) {
    throw new Error('데이터를 찾을 수 없습니다.');
  }
  
  // 헤더 제외하고 데이터 검색
  const rowIndex = data.findIndex(
    (row, index) => index > 0 && row[searchColumnIndex] === searchValue
  );
  
  if (rowIndex === -1) {
    throw new Error('해당 데이터를 찾을 수 없습니다.');
  }
  
  // 실제 시트의 행 번호는 1부터 시작 (헤더 포함)
  const actualRowNumber = rowIndex + 1;
  const columnLetter = String.fromCharCode(65 + updateColumnIndex); // A=0, B=1, ...
  const updateRange = `${sheetName}!${columnLetter}${actualRowNumber}`;
  
  // 데이터 업데이트
  await writeSheetData(updateRange, [[updateValue]]);
  
  return { rowIndex: actualRowNumber };
}

// 특정 행 찾기 (여러 컬럼 검색)
export async function findRow(
  sheetName: string,
  searchColumnIndex: number,
  searchValue: string
) {
  const data = await readSheetData(`${sheetName}!A:Z`);
  
  if (!data || data.length === 0) {
    return null;
  }
  
  const rowIndex = data.findIndex(
    (row, index) => index > 0 && row[searchColumnIndex] === searchValue
  );
  
  if (rowIndex === -1) {
    return null;
  }
  
  return {
    rowIndex: rowIndex + 1, // 실제 시트 행 번호 (1부터 시작)
    data: data[rowIndex],
  };
}

// 배치 업데이트 (여러 셀을 한 번에 업데이트)
export async function batchUpdateSheetData(updates: Array<{ range: string; values: any[][] }>) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  
  const data = updates.map(({ range, values }) => ({
    range,
    values,
  }));
  
  const response = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    resource: {
      valueInputOption: 'RAW',
      data,
    },
  });
  
  return response.data;
}

