import { Link } from 'react-router-dom'
import { Camera } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Camera className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold">MediaShowcase</span>
          </Link>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/upload" className="hover:text-blue-500">
                  上传
                </Link>
                <Link to="/profile" className="hover:text-blue-500">
                  个人资料
                </Link>
                <button
                  onClick={handleSignOut}
                  className="hover:text-blue-500"
                >
                  退出
                </button>
              </>
            ) : (
              <Link to="/auth" className="hover:text-blue-500">
                登录
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}