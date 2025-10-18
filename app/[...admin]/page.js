'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Image as ImageIcon, Trash2, Heart, Lock, Upload, X } from 'lucide-react';

export default function AdminPage({ params }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [adminPath, setAdminPath] = useState('');
  
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  // 이미지 업로드 상태
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    // URL에서 관리자 경로 가져오기
    const path = window.location.pathname.replace('/', '');
    setAdminPath(path);

    // 로컬스토리지에서 인증 상태 확인
    const auth = localStorage.getItem('admin_auth');
    const savedPath = localStorage.getItem('admin_path');
    
    if (auth === 'authenticated' && savedPath === path) {
      setIsAuthenticated(true);
      fetchPosts();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    }
  }, [isAuthenticated]);

  async function handleAuth(e) {
    e.preventDefault();
    setAuthError('');
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, path: adminPath }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAuthenticated(true);
        localStorage.setItem('admin_auth', 'authenticated');
        localStorage.setItem('admin_path', adminPath);
        localStorage.setItem('admin_token', data.token);
        setAuthError('');
      } else {
        setAuthError(data.error || '인증 실패');
        setPassword('');
      }
    } catch (error) {
      setAuthError('서버 오류가 발생했습니다.');
      setPassword('');
    }
  }

  function handleLogout() {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_path');
    localStorage.removeItem('admin_token');
    setPassword('');
  }

  async function fetchPosts() {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    setPosts(data || []);
  }

  // NCP 이미지 업로드 함수
  async function handleImageUpload(file) {
    if (!file) return null;

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return null;
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return null;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('업로드 실패');
      }

      const data = await response.json();
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);

      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      alert('이미지 업로드에 실패했습니다.');
      setUploading(false);
      setUploadProgress(0);
      return null;
    }
  }

  // 썸네일 업로드 핸들러
  async function handleThumbnailUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await handleImageUpload(file);
    if (url) {
      setThumbnailUrl(url);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('posts')
      .insert([{ 
        title, 
        excerpt, 
        thumbnail_url: thumbnailUrl || null,
        content 
      }]);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      setTitle('');
      setExcerpt('');
      setThumbnailUrl('');
      setContent('');
      fetchPosts();
      alert('글이 발행되었습니다!');
    }

    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      fetchPosts();
    }
  }

  // 인증되지 않은 경우 로그인 폼 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 p-4 rounded-full">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              관리자 로그인
            </h1>
            <p className="text-sm text-gray-600 text-center mb-6">
              레라픽 Admin
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="관리자 비밀번호를 입력하세요"
                  required
                  autoFocus
                />
              </div>

              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
              >
                로그인
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                href="/" 
                className="text-sm text-gray-600 hover:text-gray-900 transition"
              >
                ← 블로그로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 인증된 경우 관리자 페이지 표시
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-xl font-bold text-gray-900">레라픽</span>
              <span className="text-sm text-gray-500 ml-2">Admin</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition">
                글 목록
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 글 작성 폼 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">새 글 작성</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="글 제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  요약 (선택)
                </label>
                <input
                  type="text"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="글 요약을 입력하세요"
                />
              </div>

              {/* 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  썸네일 이미지
                </label>
                
                {!thumbnailUrl ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                      id="thumbnail-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="thumbnail-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {uploading ? '업로드 중...' : '이미지 업로드 (최대 5MB)'}
                      </span>
                      {uploading && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={thumbnailUrl} 
                      alt="썸네일"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setThumbnailUrl('')}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  내용 (Markdown)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={12}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Markdown 형식으로 작성하세요..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading ? '발행 중...' : '글 발행'}
              </button>
            </form>
          </div>

          {/* 글 목록 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">발행된 글</h2>
            <div className="space-y-4">
              {posts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  아직 발행된 글이 없습니다.
                </p>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
                  >
                    <div className="flex gap-4">
                      {post.thumbnail_url && (
                        <img 
                          src={post.thumbnail_url}
                          alt={post.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <Link href={`/post/${post.id}`} target="_blank">
                              <h3 className="font-medium text-gray-900 hover:text-blue-600 transition truncate">
                                {post.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(post.created_at).toLocaleDateString('ko-KR')}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {post.like_count || 0}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
