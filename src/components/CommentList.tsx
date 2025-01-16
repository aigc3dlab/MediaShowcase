import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Comment } from '@/types/comment'
import { MessageCircle } from 'lucide-react'

interface CommentListProps {
  mediaId: string
}

export default function CommentList({ mediaId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // 加载评论
  useEffect(() => {
    async function loadComments() {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .eq('media_id', mediaId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setComments(data || [])
      } catch (err) {
        console.error('Error loading comments:', err)
        setError('加载评论失败')
      }
    }

    loadComments()
  }, [mediaId])

  // 添加评论
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          media_id: mediaId,
          author_id: user.id,
          author_name: user.email?.split('@')[0] || 'Anonymous'
        })
        .select()
        .single()

      if (error) throw error

      setComments([data, ...comments])
      setNewComment('')
    } catch (err) {
      console.error('Error adding comment:', err)
      setError('添加评论失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <MessageCircle className="h-5 w-5 mr-2" />
        评论 ({comments.length})
      </h3>

      {user && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="添加评论..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? '发送中...' : '发送'}
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium">{comment.author_name}</span>
              <span className="text-sm text-gray-500">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700">{comment.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-gray-500 text-center">暂无评论</p>
        )}
      </div>
    </div>
  )
} 