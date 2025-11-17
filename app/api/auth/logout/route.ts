import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // 클라이언트 측에서 토큰을 삭제하므로 서버 측에서는 성공 응답만 반환
  return NextResponse.json({ success: true });
}

