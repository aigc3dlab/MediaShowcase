import * as React from 'react';
import { supabase } from '@/lib/supabase';
import { MediaItem } from '@/types/media';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

type SortOption = 'latest' | 'popular' | 'mostLiked';

interface FormEvent extends React.ChangeEvent<HTMLInputElement | HTMLSelectElement> {
  target: HTMLInputElement | HTMLSelectElement;
}

const Home: React.FC = () => {
  const [mediaItems, setMediaItems] = React.useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = React.useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<SortOption>('latest');
  const [searchQuery, setSearchQuery] = React.useState('');

  // 加载媒体数据
  React.useEffect(() => {
    loadMediaItems();
  }, [sortBy]);

  const loadMediaItems = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 检查 Supabase 配置
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Supabase 配置缺失');
      }

      // 测试连接
      const { error: connectionError } = await supabase.from('media').select('count');
      if (connectionError) {
        console.error('Connection error:', connectionError);
        throw new Error('数据库连接失败');
      }

      // 获取数据
      const { data, error } = await supabase
        .from('media')
        .select(`
          *,
          profiles (
            username
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Query error:', error);
        throw error;
      }

      const items = (data || []).map(item => ({
        id: item.id,
        title: item.title || '无标题',
        description: item.description || '',
        imageUrl: item.image_url,
        authorId: item.author_id,
        authorName: item.profiles?.username || '未知用户',
        createdAt: item.created_at,
        likes: item.likes || 0
      }));

      setMediaItems(items);
      setFilteredItems(items);
    } catch (err) {
      console.error('Error loading media:', err);
      setError(err instanceof Error ? err.message : '加载媒体失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理搜索
  const handleSearch = (e: FormEvent) => {
    const query = e.target.value;
    setSearchQuery(query);
    const filtered = mediaItems.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase()) ||
      item.authorName.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  // 处理排序
  const handleSortChange = (e: FormEvent) => {
    setSortBy(e.target.value as SortOption);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          分享你的创意视觉
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          上传、分享和发现来自世界各地创作者的精彩照片和视频。
        </p>
        <div className="flex justify-center gap-4 mb-8">
          <input
            type="text"
            placeholder="搜索内容..."
            className="px-4 py-2 border rounded-md w-full max-w-md"
            value={searchQuery}
            onChange={handleSearch}
          />
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="px-4 py-2 border rounded-md"
          >
            <option value="latest">最新</option>
            <option value="popular">最热</option>
            <option value="mostLiked">最多点赞</option>
          </select>
        </div>
      </div>
      {filteredItems.length === 0 ? (
        <div className="text-center text-gray-500">
          {searchQuery ? '没有找到相关内容' : '暂无内容'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">by {item.authorName}</span>
                  <span className="text-sm text-gray-500">❤️ {item.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;