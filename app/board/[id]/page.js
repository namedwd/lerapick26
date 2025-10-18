'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PostDetailPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/board');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">리다이렉트 중...</div>
    </div>
  );
}
