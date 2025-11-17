import { NextRequest, NextResponse } from 'next/server';
import { findUserByToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: '토큰이 제공되지 않았습니다.' },
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

    return NextResponse.json({
      user: {
        이름: user.이름,
        번호: user.번호,
        비밀번호변경완료: user.비밀번호변경완료,
        최종로그인시간: user.최종로그인시간,
      },
    });
  } catch (error) {
    console.error('Verify token API error:', error);
    return NextResponse.json(
      { error: '토큰 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

