import { NextRequest, NextResponse } from 'next/server';
import { findUserByToken, updatePassword, updatePasswordChangeComplete, AUTH_COLUMNS } from '@/lib/auth';
import { readSheetData } from '@/lib/googleSheets';

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword, token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '현재 비밀번호와 새 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 비밀번호가 6자리 숫자인지 확인
    if (!/^\d{6}$/.test(currentPassword)) {
      return NextResponse.json(
        { error: '현재 비밀번호는 6자리 숫자여야 합니다.' },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(newPassword)) {
      return NextResponse.json(
        { error: '새 비밀번호는 6자리 숫자여야 합니다.' },
        { status: 400 }
      );
    }

    // 토큰으로 사용자 찾기
    const user = await findUserByToken(token);

    if (!user) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    // 현재 비밀번호 확인
    const data = await readSheetData('AUTH!A:E');
    const userRow = data[user.rowIndex - 1];
    const storedPassword = userRow[AUTH_COLUMNS.비밀번호];

    if (storedPassword !== currentPassword) {
      return NextResponse.json(
        { error: '현재 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    // 비밀번호 업데이트
    await updatePassword(user.rowIndex, newPassword);
    await updatePasswordChangeComplete(user.rowIndex, 'Y');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Change password API error:', error);
    return NextResponse.json(
      { error: '비밀번호 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

