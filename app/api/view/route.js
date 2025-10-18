import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: '글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 조회수 증가
    const { error } = await supabase.rpc('increment_view_count', {
      post_id: postId,
    });

    if (error) {
      // RPC 함수가 없으면 직접 업데이트
      const { data: post } = await supabase
        .from('posts')
        .select('view_count')
        .eq('id', postId)
        .single();

      if (post) {
        await supabase
          .from('posts')
          .update({ view_count: (post.view_count || 0) + 1 })
          .eq('id', postId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('View count error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
