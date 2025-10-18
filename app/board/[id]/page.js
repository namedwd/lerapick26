'use client';

import { useState, useEffect, use } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PostDetailPage({ params }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const docRef = doc(db, 'posts', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPost({
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate().toLocaleString('ko-KR') || '방금 전'
          });
        } else {
          alert('게시글을 찾을 수 없습니다.');
          router.push('/board');
        }
      } catch (error) {
        console.error('게시글 불러오기 실패:', error);
        alert('게시글을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await deleteDoc(doc(db, 'posts', id));
      alert('게시글이 삭제되었습니다.');
      router.push('/board');
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* 헤더 */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div className="flex gap-4">
                <span className="font-medium">{post.author}</span>
                <span>{post.createdAt}</span>
              </div>
            </div>
          </div>

          {/* 내용 */}
          <div className="mb-8">
            <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <Link
              href="/board"
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
            >
              목록으로
            </Link>
            <button
              onClick={handleDelete}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
