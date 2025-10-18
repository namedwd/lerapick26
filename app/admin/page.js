'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Image as ImageIcon, Trash2, Heart, Upload, X, LogOut, Edit, Eye } from 'lucide-react';
import TiptapEditor from './TiptapEditor';

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [content, setContent] = useState('');
  const [postLoading, setPostLoading] = useState(false);

  // 수정 모드
  const [editingPost, setEditingPost] = useState(null);

  const [uploading, setUploading] = useState(false);

  // 탭 상태
  const [activeTab, setActiveTab] = useState('write'); // 'write' or 'list'

  useEffect(() => {
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    setLoading(false);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
    }
    
    setAuthLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  async function fetchPosts() {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    setPosts(data || []);
  }

  async function handleImageUpload(file) {
    if (!file) return null;

    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return null;
    }

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return null;
    }

    setUploading(true);

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
      setUploading(false);
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      alert('이미지 업로드에 실패했습니다.');
      setUploading(false);
      return null;
    }
  }

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
    setPostLoading(true);

    if (editingPost) {
      // 수정 모드
      const { error } = await supabase
        .from('posts')
        .update({ 
          title, 
          excerpt, 
          thumbnail_url: thumbnailUrl || null,
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPost.id);

      if (error) {
        alert('Error: ' + error.message);
      } else {
        setTitle('');
        setExcerpt('');
        setThumbnailUrl('');
        setContent('');
        setEditingPost(null);
        fetchPosts();
        alert('글이 수정되었습니다!');
      }
    } else {
      // 새 글 작성
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
    }

    setPostLoading(false);
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
      // 수정 중이던 글을 삭제한 경우
      if (editingPost?.id === id) {
        setEditingPost(null);
        setTitle('');
        setExcerpt('');
        setThumbnailUrl('');
        setContent('');
      }
      fetchPosts();
    }
  }

  function handleEdit(post) {
    setEditingPost(post);
    setTitle(post.title);
    setExcerpt(post.excerpt || '');
    setThumbnailUrl(post.thumbnail_url || '');
    setContent(post.content);
    // 작성 탭으로 전환
    setActiveTab('write');
    // 폼 영역으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setEditingPost(null);
    setTitle('');
    setExcerpt('');
    setThumbnailUrl('');
    setContent('');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">L</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                레라픽 관리자
              </h1>
              <p className="text-sm text-gray-600">
                Supabase 계정으로 로그인하세요
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
              >
                {authLoading ? '로그인 중...' : '로그인'}
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
              <span className="text-sm text-gray-600">{user.email}</span>
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition">
                글 목록
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* 탭 */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('write')}
              className={`px-4 py-2 font-medium transition border-b-2 ${
                activeTab === 'write'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {editingPost ? '글 수정' : '새 글 작성'}
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 font-medium transition border-b-2 ${
                activeTab === 'list'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              발행된 글 ({posts.length})
            </button>
          </div>
        </div>

        {/* 글 작성 탭 */}
        {activeTab === 'write' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPost ? '글 수정' : '새 글 작성'}
              </h2>
              {editingPost && (
                <button
                  onClick={handleCancelEdit}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  취소
                </button>
              )}
            </div>
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
                  내용
                </label>
                <TiptapEditor
                  value={content}
                  onChange={setContent}
                />
              </div>

              <button
                type="submit"
                disabled={postLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
              >
                {postLoading ? (
                  editingPost ? '수정 중...' : '발행 중...'
                ) : (
                  editingPost ? '글 수정' : '글 발행'
                )}
              </button>
            </form>
            </div>
          </div>
        )}

        {/* 글 목록 탭 */}
        {activeTab === 'list' && (
          <div className="max-w-4xl mx-auto">
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
                                <Eye className="w-3 h-3" />
                                {post.view_count || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {post.like_count || 0}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(post)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
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
                  </div>
                ))
              )}
            </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
