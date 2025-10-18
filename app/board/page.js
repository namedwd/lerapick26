'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BoardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">게시판</h1>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <p className="text-gray-700 mb-4">게시판 기능은 현재 비활성화되어 있습니다.</p>
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              ← 메인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
