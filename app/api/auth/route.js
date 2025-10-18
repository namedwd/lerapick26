import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// 서버 사이드 인증 (안전!)
export async function POST(request) {
  try {
    const { password, path } = await request.json();

    // 환경변수에서 가져오기 (NEXT_PUBLIC_ 없음 - 서버 전용)
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const ADMIN_PATH = process.env.ADMIN_PATH;

    if (!ADMIN_PASSWORD || !ADMIN_PATH) {
      return NextResponse.json(
        { error: '서버 설정 오류' },
        { status: 500 }
      );
    }

    // 경로 확인
    if (path !== ADMIN_PATH) {
      return NextResponse.json(
        { error: '잘못된 접근' },
        { status: 403 }
      );
    }

    // 비밀번호 확인
    if (password === ADMIN_PASSWORD) {
      // JWT 토큰 생성 (간단한 방식)
      const token = Buffer.from(`${ADMIN_PATH}:${Date.now()}`).toString('base64');
      
      return NextResponse.json({ 
        success: true,
        token
      });
    } else {
      return NextResponse.json(
        { error: '비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: '서버 오류' },
      { status: 500 }
    );
  }
}
