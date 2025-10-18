import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function POST(request) {
  try {
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: '글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // IP 주소 가져오기
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'unknown';

    // 이미 추천했는지 확인
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('ip_address', ip)
      .single();

    if (existingLike) {
      return NextResponse.json(
        { error: '이미 추천하셨습니다.' },
        { status: 400 }
      );
    }

    // 추천 추가
    const { error: insertError } = await supabase
      .from('post_likes')
      .insert([{ post_id: postId, ip_address: ip }]);

    if (insertError) {
      console.error('Like insert error:', insertError);
      return NextResponse.json(
        { error: '추천에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 추천 수 조회
    const { count } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    // posts 테이블의 like_count 업데이트
    await supabase
      .from('posts')
      .update({ like_count: count })
      .eq('id', postId);

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error('Like POST error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
