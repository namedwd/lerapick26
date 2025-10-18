import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { notFound } from 'next/navigation';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import ViewCounter from './ViewCounter';
import ContentRenderer from './ContentRenderer';
import Navbar from '../../components/Navbar';

async function getPostData(id) {
  const [postResult, commentsResult, likeCountResult] = await Promise.all([
    supabase.from('posts').select('*').eq('id', id).single(),
    supabase.from('comments').select('*').eq('post_id', id).order('created_at', { ascending: false }),
    supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', id)
  ]);

  if (postResult.error || !postResult.data) {
    return null;
  }

  return {
    post: postResult.data,
    comments: commentsResult.data || [],
    likeCount: likeCountResult.count || 0
  };
}

export default async function PostPage({ params }) {
  const { id } = await params;
  const data = await getPostData(id);

  if (!data) {
    notFound();
  }

  const { post, comments, likeCount } = data;

  // 구조화된 데이터 (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.thumbnail_url || 'https://www.lerapick.com/og-image.png',
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: {
      '@type': 'Organization',
      name: '레라픽',
    },
    publisher: {
      '@type': 'Organization',
      name: '레라픽',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.lerapick.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.lerapick.com/post/${id}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <Navbar />

        {/* Article */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <ViewCounter postId={id} />
          
          {/* Meta */}
          <div className="mb-6 sm:mb-8">
            <time className="text-xs sm:text-sm text-gray-500">
              {new Date(post.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
            
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mt-3 mb-3 sm:mb-4">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500">
              <span>댓글 {comments.length}</span>
            </div>
          </div>

          {/* Thumbnail */}
          {post.thumbnail_url && (
            <div className="mb-8 sm:mb-12">
              <img
                src={post.thumbnail_url} 
                alt={post.title}
                className="w-full rounded-xl"
                style={{ maxHeight: '500px', objectFit: 'contain' }}
                loading="lazy"
              />
            </div>
          )}

          {/* Content */}
          <div className="bg-white rounded-xl p-4 sm:p-8 mb-8 sm:mb-12 border border-gray-200">
            <ContentRenderer content={post.content} />
          </div>

          {/* Like Button */}
          <div className="mb-8 sm:mb-12">
            <LikeButton postId={id} initialCount={likeCount} />
          </div>

          {/* Comments */}
          <div className="bg-white rounded-xl p-4 sm:p-8 border border-gray-200">
            <CommentSection postId={id} initialComments={comments} />
          </div>
        </article>
      </div>
    </>
  );
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await getPostData(id);
  
  if (!data) {
    return {
      title: 'Post Not Found'
    };
  }

  const { post } = data;

  return {
    title: `${post.title} | 레라픽`,
    description: post.excerpt || post.title,
    keywords: post.title.split(' ').slice(0, 10),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      images: post.thumbnail_url ? [post.thumbnail_url] : [],
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at || post.created_at,
      authors: ['레라픽'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.title,
      images: post.thumbnail_url ? [post.thumbnail_url] : [],
    },
    alternates: {
      canonical: `https://www.lerapick.com/post/${id}`,
    },
  };
}

export const revalidate = 60;
