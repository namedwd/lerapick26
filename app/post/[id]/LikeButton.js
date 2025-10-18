'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

export default function LikeButton({ postId, initialCount }) {
  const [likes, setLikes] = useState(initialCount);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 클라이언트에서 로컬스토리지 확인
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const liked = localStorage.getItem(`liked_${postId}`);
      if (liked) setIsLiked(true);
    }
  }, [postId]);

  async function handleLike() {
    if (isLoading || isLiked) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });

      const data = await response.json();

      if (response.ok) {
        setLikes(data.count);
        setIsLiked(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`liked_${postId}`, 'true');
        }
      } else {
        alert(data.error || '이미 추천하셨습니다.');
      }
    } catch (error) {
      console.error('Like error:', error);
      alert('오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleLike}
        disabled={isLoading || isLiked}
        className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition text-sm sm:text-base ${
          isLiked
            ? 'bg-red-100 text-red-600 cursor-not-allowed'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        <Heart 
          className={`w-5 h-5 ${isLiked ? 'fill-red-600' : ''}`}
        />
        <span>{isLiked ? '추천했습니다' : '추천하기'}</span>
      </button>
      <p className="text-sm text-gray-500 mt-2">
        {likes}명이 추천했습니다
      </p>
    </div>
  );
}
