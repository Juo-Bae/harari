import { readSheetData, findRow, writeSheetData } from './googleSheets';
import crypto from 'crypto';

// 토큰 생성 함수
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// AUTH 시트의 컬럼 인덱스
export const AUTH_COLUMNS = {
  이름: 0,
  비밀번호: 1,
  토큰: 2,
  비밀번호변경완료: 3,
  최종로그인시간: 4,
};

// 사용자 정보 타입
export interface User {
  이름: string;
  번호: string;
  비밀번호변경완료: string;
  최종로그인시간: string;
  rowIndex: number;
}

// 로그인 검증
export async function verifyLogin(name: string, number: string): Promise<User | null> {
  try {
    const data = await readSheetData('AUTH!A:E');
    
    if (!data || data.length === 0) {
      return null;
    }
    
    // 헤더 제외하고 데이터 검색 (번호는 비밀번호를 의미)
    const rowIndex = data.findIndex(
      (row, index) => index > 0 && row[AUTH_COLUMNS.이름] === name && row[AUTH_COLUMNS.비밀번호] === number
    );
    
    if (rowIndex === -1) {
      return null;
    }
    
    const row = data[rowIndex];
    return {
      이름: row[AUTH_COLUMNS.이름],
      번호: row[AUTH_COLUMNS.비밀번호], // 번호는 비밀번호를 의미
      비밀번호변경완료: row[AUTH_COLUMNS.비밀번호변경완료] || 'N',
      최종로그인시간: row[AUTH_COLUMNS.최종로그인시간] || '',
      rowIndex: rowIndex + 1, // 실제 시트 행 번호 (1부터 시작)
    };
  } catch (error) {
    console.error('Login verification error:', error);
    return null;
  }
}

// 토큰으로 사용자 찾기
export async function findUserByToken(token: string): Promise<User | null> {
  try {
    const data = await readSheetData('AUTH!A:E');
    
    if (!data || data.length === 0) {
      return null;
    }
    
    const rowIndex = data.findIndex(
      (row, index) => index > 0 && row[AUTH_COLUMNS.토큰] === token
    );
    
    if (rowIndex === -1) {
      return null;
    }
    
    const row = data[rowIndex];
    return {
      이름: row[AUTH_COLUMNS.이름],
      번호: row[AUTH_COLUMNS.비밀번호], // 번호는 비밀번호를 의미
      비밀번호변경완료: row[AUTH_COLUMNS.비밀번호변경완료] || 'N',
      최종로그인시간: row[AUTH_COLUMNS.최종로그인시간] || '',
      rowIndex: rowIndex + 1,
    };
  } catch (error) {
    console.error('Find user by token error:', error);
    return null;
  }
}

// 토큰 업데이트
export async function updateToken(rowIndex: number, token: string): Promise<void> {
  const columnLetter = String.fromCharCode(65 + AUTH_COLUMNS.토큰); // C
  const range = `AUTH!${columnLetter}${rowIndex}`;
  await writeSheetData(range, [[token]]);
}

// 최종 로그인 시간 업데이트
export async function updateLastLoginTime(rowIndex: number): Promise<void> {
  const now = new Date().toISOString();
  const columnLetter = String.fromCharCode(65 + AUTH_COLUMNS.최종로그인시간); // E
  const range = `AUTH!${columnLetter}${rowIndex}`;
  await writeSheetData(range, [[now]]);
}

// 비밀번호 변경 완료 상태 업데이트
export async function updatePasswordChangeComplete(rowIndex: number, value: string): Promise<void> {
  const columnLetter = String.fromCharCode(65 + AUTH_COLUMNS.비밀번호변경완료); // D
  const range = `AUTH!${columnLetter}${rowIndex}`;
  await writeSheetData(range, [[value]]);
}

// 비밀번호 업데이트
export async function updatePassword(rowIndex: number, password: string): Promise<void> {
  const columnLetter = String.fromCharCode(65 + AUTH_COLUMNS.비밀번호); // B
  const range = `AUTH!${columnLetter}${rowIndex}`;
  await writeSheetData(range, [[password]]);
}

