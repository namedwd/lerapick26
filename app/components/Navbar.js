'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 현재 로그인 상태 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 로그인 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">L</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">레라픽</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition">
              글 목록
            </Link>
            {user && (
              <Link href="/admin" className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium transition">
                관리자
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
