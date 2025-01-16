import React, { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface LikeButtonProps {
  mediaId: string
  initialLikes: number
  onLikeChange?: (newCount: number) => void
}

export default function LikeButton({ mediaId, initialLikes, onLikeChange }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      checkIfLiked()
    } else {
      setLoading(false)
    }
  }, [user, mediaId])

  const checkIfLiked = async () => {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('media_id', mediaId)
        .eq('user_id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setIsLiked(!!data)
    } catch (err) {
      console.error('Error checking like status:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleLike = async () => {
    if (!user || loading) return

    try {
      setLoading(true)
      if (isLiked) {
        // 取消点赞
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('media_id', mediaId)
          .eq('user_id', user.id)

        if (error) throw error
        setLikes(prev => prev - 1)
        setIsLiked(false)
      } else {
        // 添加点赞
        const { error } = await supabase
          .from('likes')
          .insert({
            media_id: mediaId,
            user_id: user.id
          })

        if (error) throw error
        setLikes(prev => prev + 1)
        setIsLiked(true)
      }

      // 更新媒体表中的点赞数
      await supabase
        .from('media')
        .update({ likes: likes + (isLiked ? -1 : 1) })
        .eq('id', mediaId)

      onLikeChange?.(likes + (isLiked ? -1 : 1))
    } catch (err) {
      console.error('Error toggling like:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggleLike}
      disabled={!user || loading}
      className={`flex items-center space-x-1 ${
        user ? 'hover:text-red-500' : 'cursor-not-allowed opacity-50'
      } ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
    >
      <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
      <span>{likes}</span>
    </button>
  )
} 