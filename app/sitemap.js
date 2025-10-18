import { supabase } from '@/lib/supabase';

export default async function sitemap() {
  const baseUrl = 'https://www.lerapick.com';

  // 모든 게시글 가져오기
  const { data: posts } = await supabase
    .from('posts')
    .select('id, updated_at, created_at')
    .order('created_at', { ascending: false });

  const postUrls = (posts || []).map((post) => ({
    url: `${baseUrl}/post/${post.id}`,
    lastModified: post.updated_at || post.created_at,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/board`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...postUrls,
  ];
}
