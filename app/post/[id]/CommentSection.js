'use client';

import { useState } from 'react';
import { MessageCircle, Trash2 } from 'lucide-react';

export default function CommentSection({ postId, initialComments }) {
  const [comments, setComments] = useState(initialComments);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!nickname.trim() || !password.trim() || !content.trim()) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (nickname.length > 20) {
      alert('닉네임은 20자 이하로 입력해주세요.');
      return;
    }

    if (content.length > 1000) {
      alert('댓글은 1000자 이하로 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, nickname, password, content }),
      });

      const data = await response.json();

      if (response.ok) {
        setComments([data.comment, ...comments]);
        setNickname('');
        setPassword('');
        setContent('');
        alert('댓글이 등록되었습니다.');
      } else {
        alert(data.error || '댓글 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Comment error:', error);
      alert('오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(commentId) {
    const inputPassword = prompt('댓글 비밀번호를 입력하세요:');
    if (!inputPassword) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, password: inputPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setComments(comments.filter(c => c.id !== commentId));
        alert('댓글이 삭제되었습니다.');
      } else {
        alert(data.error || '비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('오류가 발생했습니다.');
    }
  }

  return (
    <div className="border-t border-gray-200 pt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6" />
        댓글 {comments.length}
      </h2>

      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임 (최대 20자)"
            maxLength={20}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            style={{ fontSize: '16px' }}
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            style={{ fontSize: '16px' }}
            required
          />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글을 입력하세요 (최대 1000자)"
          maxLength={1000}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
          style={{ fontSize: '16px' }}
          required
        />
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">
            {content.length} / 1000
          </span>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            {isSubmitting ? '등록 중...' : '댓글 등록'}
          </button>
        </div>
      </form>

      {/* 댓글 목록 */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            첫 댓글을 남겨보세요!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium text-gray-900">
                    {comment.nickname}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    {new Date(comment.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-gray-400 hover:text-red-600 transition"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
