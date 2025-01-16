import React from 'react'
import { X } from 'lucide-react'

interface ImageModalProps {
  imageUrl: string
  title: string
  onClose: () => void
}

export default function ImageModal({ imageUrl, title, onClose }: ImageModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative max-w-4xl w-full mx-4">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300"
        >
          <X size={24} />
        </button>
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-auto rounded-lg"
        />
      </div>
    </div>
  )
} 