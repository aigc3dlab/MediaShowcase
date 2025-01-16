import React, { useState, useEffect } from 'react'
import { MediaItem } from '@/types/media'
import MediaGrid from '@/components/MediaGrid'
import SearchBar from '@/components/SearchBar'
import FilterOptions from '@/components/FilterOptions'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import { supabase } from '@/lib/supabase'

type SortOption = 'latest' | 'popular' | 'mostLiked'

export default function Home() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('latest')
  const [searchQuery, setSearchQuery] = useState('')

  // 加载媒体数据
  useEffect(() => {
    loadMediaItems()
  }, [sortBy])

  const loadMediaItems = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // 首先检查 Supabase 连接
      const { error: connectionError } = await supabase.from('media').select('count')
      if (connectionError) {
        throw new Error('数据库连接失败')
      }

      let query = supabase
        .from('media')
        .select(`
          *,
          profiles (
            username
          )
        `)

      // 根据排序选项调整查询
      switch (sortBy) {
        case 'latest':
          query = query.order('created_at', { ascending: false })
          break
        case 'popular':
          query = query.order('views', { ascending: false })
          break
        case 'mostLiked':
          query = query.order('likes', { ascending: false })
          break
      }

      const { data, error } = await query

      if (error) throw error

      const items = data?.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.image_url,
        authorId: item.author_id,
        authorName: item.profiles?.username || '未知用户',
        createdAt: item.created_at,
        likes: item.likes || 0
      })) || []

      setMediaItems(items)
      setFilteredItems(items)
    } catch (err) {
      console.error('Error loading media:', err)
      setError(err instanceof Error ? err.message : '加载媒体失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const filtered = mediaItems.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase()) ||
      item.authorName.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredItems(filtered)
  }

  // 处理排序
  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort)
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          分享你的创意视觉
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          上传、分享和发现来自世界各地创作者的精彩照片和视频。
        </p>
        <SearchBar onSearch={handleSearch} />
        <FilterOptions currentSort={sortBy} onSortChange={handleSortChange} />
      </div>
      {filteredItems.length === 0 ? (
        <div className="text-center text-gray-500">
          {searchQuery ? '没有找到相关内容' : '暂无内容'}
        </div>
      ) : (
        <MediaGrid items={filteredItems} />
      )}
    </div>
  )
}