import { NextRequest, NextResponse } from 'next/server';
import { verifyLogin, generateToken, updateToken, updateLastLoginTime } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, number } = await request.json();

    if (!name || !number) {
      return NextResponse.json(
        { error: '이름과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 비밀번호가 6자리 숫자인지 확인
    if (!/^\d{6}$/.test(number)) {
      return NextResponse.json(
        { error: '비밀번호는 6자리 숫자여야 합니다.' },
        { status: 400 }
      );
    }

    // 사용자 검증
    const user = await verifyLogin(name, number);

    if (!user) {
      return NextResponse.json(
        { error: '이름 또는 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    // 토큰 생성
    const token = generateToken();

    // 스프레드시트에 토큰 및 로그인 시간 업데이트
    await updateToken(user.rowIndex, token);
    await updateLastLoginTime(user.rowIndex);

    return NextResponse.json({
      token,
      user: {
        이름: user.이름,
        번호: user.번호,
        비밀번호변경완료: user.비밀번호변경완료,
        최종로그인시간: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

