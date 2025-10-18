import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

// 댓글 작성
export async function POST(request) {
  try {
    const { postId, nickname, password, content } = await request.json();

    if (!postId || !nickname || !password || !content) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: postId,
          nickname: nickname.trim(),
          password: hashedPassword,
          content: content.trim(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Comment insert error:', error);
      return NextResponse.json(
        { error: '댓글 등록에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 비밀번호는 반환하지 않음
    const { password: _, ...commentWithoutPassword } = data;

    return NextResponse.json({ comment: commentWithoutPassword });
  } catch (error) {
    console.error('Comment POST error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 댓글 삭제
export async function DELETE(request) {
  try {
    const { commentId, password } = await request.json();

    if (!commentId || !password) {
      return NextResponse.json(
        { error: '댓글 ID와 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 댓글 조회
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('password')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, comment.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '비밀번호가 일치하지 않습니다.' },
        { status: 403 }
      );
    }

    // 댓글 삭제
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      console.error('Comment delete error:', deleteError);
      return NextResponse.json(
        { error: '댓글 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Comment DELETE error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
