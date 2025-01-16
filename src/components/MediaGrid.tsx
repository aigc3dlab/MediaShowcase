import React, { useState } from 'react'
import { MediaItem } from '@/types/media'
import ImageModal from './ImageModal'
import CommentList from './CommentList'
import { X } from 'lucide-react'
import LikeButton from './LikeButton'

interface MediaGridProps {
  items: MediaItem[]
}

export default function MediaGrid({ items }: MediaGridProps) {
  const [selectedImage, setSelectedImage] = React.useState<MediaItem | null>(null)
  const [loadedImages, setLoadedImages] = React.useState<Set<string>>(new Set())

  const handleImageLoad = (imageId: string) => {
    setLoadedImages(prev => new Set([...prev, imageId]))
  }

  const handleLikeChange = (mediaId: string, newCount: number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === mediaId ? { ...item, likes: newCount } : item
      )
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-200"
            onClick={() => setSelectedImage(item)}
          >
            <div className="relative aspect-w-4 aspect-h-3">
              <img
                src={item.imageUrl}
                alt={item.title}
                className={`w-full h-48 object-cover transition-opacity duration-300 ${
                  loadedImages.has(item.id) ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => handleImageLoad(item.id)}
              />
              {!loadedImages.has(item.id) && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse" />
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{item.authorName}</span>
                <LikeButton
                  mediaId={item.id}
                  initialLikes={item.likes}
                  onLikeChange={(newCount) => handleLikeChange(item.id, newCount)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl w-full mx-4 bg-white rounded-lg overflow-hidden">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <X size={24} />
            </button>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/3">
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title}
                  className="w-full h-auto"
                />
              </div>
              <div className="md:w-1/3 p-6">
                <h2 className="text-2xl font-bold mb-2">{selectedImage.title}</h2>
                <p className="text-gray-600 mb-4">{selectedImage.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
                  <span>{selectedImage.authorName}</span>
                  <LikeButton
                    mediaId={selectedImage.id}
                    initialLikes={selectedImage.likes}
                    onLikeChange={(newCount) => handleLikeChange(selectedImage.id, newCount)}
                  />
                </div>
                <CommentList mediaId={selectedImage.id} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 