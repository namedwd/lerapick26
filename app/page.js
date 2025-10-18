import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Heart, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from './components/Navbar';

const POSTS_PER_PAGE = 10;

async function getPosts(page = 1) {
  const start = (page - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE - 1;

  const { count } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true });

  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      excerpt,
      thumbnail_url,
      view_count,
      like_count,
      created_at
    `)
    .order('created_at', { ascending: false })
    .range(start, end);
  
  if (error) {
    console.error('Error fetching posts:', error);
    return { posts: [], totalPages: 0 };
  }

  if (data && data.length > 0) {
    const postIds = data.map(post => post.id);
    const { data: commentsCount } = await supabase
      .from('comments')
      .select('post_id')
      .in('post_id', postIds);

    const commentCountMap = {};
    if (commentsCount) {
      commentsCount.forEach(comment => {
        commentCountMap[comment.post_id] = (commentCountMap[comment.post_id] || 0) + 1;
      });
    }

    const postsWithComments = data.map(post => ({
      ...post,
      comment_count: commentCountMap[post.id] || 0
    }));

    return {
      posts: postsWithComments,
      totalPages: Math.ceil((count || 0) / POSTS_PER_PAGE),
      currentPage: page
    };
  }
  
  return { posts: data || [], totalPages: 0, currentPage: page };
}

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const { posts, totalPages, currentPage } = await getPosts(page);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            모든 글
          </h1>
          <p className="text-gray-600">
            총 {posts.length}개의 글
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">아직 작성된 글이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {posts.map((post) => (
                <Link 
                  key={post.id} 
                  href={`/post/${post.id}`}
                  className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 group"
                >
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6">
                    {post.thumbnail_url && (
                      <div className="flex-shrink-0">
                        <div className="w-full h-48 sm:w-48 sm:h-32 rounded-lg overflow-hidden bg-gray-100">
                          <img 
                            src={post.thumbnail_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <time className="text-sm text-gray-500">
                          {new Date(post.created_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </time>
                      </div>
                      
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition line-clamp-2">
                        {post.title}
                      </h2>
                      
                      {post.excerpt && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Heart className="w-4 h-4" />
                          {post.like_count || 0}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4" />
                          {post.comment_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 sm:mt-12 flex flex-wrap justify-center items-center gap-2">
                {currentPage > 1 ? (
                  <Link
                    href={`/?page=${currentPage - 1}`}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    이전
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed">
                    <ChevronLeft className="w-4 h-4" />
                    이전
                  </span>
                )}

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
                    const showPage = !isMobile || 
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
                    
                    if (showPage) {
                      return (
                        <Link
                          key={pageNum}
                          href={`/?page=${pageNum}`}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition ${
                            pageNum === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return <span key={pageNum} className="text-gray-400 px-2">...</span>;
                    }
                    return null;
                  })}
                </div>

                {currentPage < totalPages ? (
                  <Link
                    href={`/?page=${currentPage + 1}`}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition"
                  >
                    다음
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed">
                    다음
                    <ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-gray-200 mt-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center text-gray-500 text-sm">
          <p>© 2025 레라픽. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export const metadata = {
  title: '레라픽 - 실용적인 IT 정보 블로그',
  description: '윈도우, 스마트폰, 컴퓨터 활용 팁과 문제 해결 방법을 쉽고 정확하게 안내합니다. 일상에서 바로 써먹을 수 있는 실용적인 IT 정보를 제공합니다.',
  openGraph: {
    title: '레라픽 - 실용적인 IT 정보 블로그',
    description: '윈도우, 스마트폰, 컴퓨터 활용 팁과 문제 해결 방법을 쉽고 정확하게 안내합니다.',
    url: 'https://www.lerapick.com',
    siteName: '레라픽',
    locale: 'ko_KR',
    type: 'website',
  },
};

export const revalidate = 60;
