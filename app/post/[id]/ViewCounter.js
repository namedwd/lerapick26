'use client';

import { useEffect } from 'react';

export default function ViewCounter({ postId }) {
  useEffect(() => {
    // 조회수 증가 (중복 방지를 위해 sessionStorage 사용)
    const viewedKey = `viewed_${postId}`;
    const hasViewed = sessionStorage.getItem(viewedKey);

    if (!hasViewed) {
      fetch('/api/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      }).then(() => {
        sessionStorage.setItem(viewedKey, 'true');
      });
    }
  }, [postId]);

  return null;
}
