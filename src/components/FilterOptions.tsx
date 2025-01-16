import React from 'react'
import { Clock, Flame, Star } from 'lucide-react'

type SortOption = 'latest' | 'popular' | 'mostLiked'

interface FilterOptionsProps {
  currentSort: SortOption
  onSortChange: (sort: SortOption) => void
}

export default function FilterOptions({ currentSort, onSortChange }: FilterOptionsProps) {
  return (
    <div className="flex justify-center space-x-4 mb-8">
      <button
        onClick={() => onSortChange('latest')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
          currentSort === 'latest'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <Clock className="h-4 w-4" />
        <span>最新</span>
      </button>
      <button
        onClick={() => onSortChange('popular')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
          currentSort === 'popular'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <Flame className="h-4 w-4" />
        <span>热门</span>
      </button>
      <button
        onClick={() => onSortChange('mostLiked')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
          currentSort === 'mostLiked'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <Star className="h-4 w-4" />
        <span>最多点赞</span>
      </button>
    </div>
  )
} 