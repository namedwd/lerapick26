'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc,
  orderBy,
  query,
  serverTimestamp,
  limit 
} from 'firebase/firestore';
import Link from 'next/link';

export default function BoardPage() {
  const [posts, setPosts] = useState([]);
  const [isWriting, setIsWriting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(true);

  // 게시글 목록 불러오기 (최적화: limit 추가)
  const fetchPosts = async () => {
    try {
      const q = query(
        collection(db, 'posts'), 
        orderBy('createdAt', 'desc'),
        limit(50) // 최대 50개만 로드
      );
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toLocaleString('ko-KR') || '방금 전'
      }));
      setPosts(postsData);
    } catch (error) {
      console.error('게시글 불러오기 실패:', error);
      alert('게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 게시글 작성
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !author.trim()) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    try {
      const newPost = {
        title: title.trim(),
        content: content.trim(),
        author: author.trim(),
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'posts'), newPost);

      // 낙관적 업데이트 (Optimistic Update)
      setPosts(prev => [{
        id: 'temp-' + Date.now(),
        ...newPost,
        createdAt: new Date().toLocaleString('ko-KR')
      }, ...prev]);

      setTitle('');
      setContent('');
      setAuthor('');
      setIsWriting(false);
      alert('게시글이 작성되었습니다.');
      
      // 백그라운드에서 실제 데이터 다시 로드
      fetchPosts();
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      alert('게시글 작성에 실패했습니다.');
    }
  };

  // 게시글 삭제 (낙관적 업데이트)
  const handleDelete = async (postId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    // 즉시 UI에서 제거
    setPosts(prev => prev.filter(post => post.id !== postId));

    try {
      await deleteDoc(doc(db, 'posts', postId));
      alert('게시글이 삭제되었습니다.');
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      alert('게시글 삭제에 실패했습니다.');
      // 실패 시 다시 로드
      fetchPosts();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">게시판</h1>
            <button
              onClick={() => setIsWriting(!isWriting)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
            >
              {isWriting ? '취소' : '글쓰기'}
            </button>
          </div>

          {/* 글쓰기 폼 */}
          {isWriting && (
            <form onSubmit={handleSubmit} className="mb-6 p-6 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">작성자</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="작성자 이름을 입력하세요"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="제목을 입력하세요"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">내용</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
                  placeholder="내용을 입력하세요"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition"
              >
                작성 완료
              </button>
            </form>
          )}
        </div>

        {/* 게시글 목록 */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              작성된 게시글이 없습니다.
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-3">
                  <Link href={`/board/${post.id}`} className="flex-1">
                    <h2 className="text-xl font-bold hover:text-blue-600 cursor-pointer">
                      {post.title}
                    </h2>
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="ml-4 text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    삭제
                  </button>
                </div>
                <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{post.author}</span>
                  <span>{post.createdAt}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
