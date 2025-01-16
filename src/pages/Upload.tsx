import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload as UploadIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { uploadMedia } from '@/lib/storage'
import { supabase } from '@/lib/supabase'

export default function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // 验证文件类型
      if (!selectedFile.type.startsWith('image/')) {
        setError('请选择图片文件')
        return
      }
      // 验证文件大小（最大 5MB）
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('文件大小不能超过 5MB')
        return
      }

      setFile(selectedFile)
      setError(null)
      // 创建预览URL
      const previewUrl = URL.createObjectURL(selectedFile)
      setPreview(previewUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !user) return

    try {
      setLoading(true)
      setError(null)

      // 上传文件到 Storage
      const { filePath, publicUrl } = await uploadMedia(file, user.id)

      // 创建媒体记录
      const { error: dbError } = await supabase
        .from('media')
        .insert({
          title,
          description,
          image_url: publicUrl,
          file_path: filePath,
          author_id: user.id
        })

      if (dbError) throw dbError

      // 上传成功，跳转到首页
      navigate('/')
    } catch (err) {
      console.error('Error uploading:', err)
      setError(err instanceof Error ? err.message : '上传失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">上传媒体</h1>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="flex flex-col items-center">
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-64 mb-4" />
            ) : (
              <UploadIcon className="h-12 w-12 text-gray-400 mb-4" />
            )}
            <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              选择文件
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
            <p className="mt-2 text-sm text-gray-500">
              支持 JPG、PNG 格式，文件大小不超过 5MB
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            标题
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            描述
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? '上传中...' : '上传'}
        </button>
      </form>
    </div>
  )
}