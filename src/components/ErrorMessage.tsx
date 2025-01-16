import React from 'react'

interface ErrorMessageProps {
  message: string
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {message}
      </div>
    </div>
  )
} 