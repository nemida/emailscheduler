import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true })
  }, [user, loading, navigate])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-10 py-12 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Login</h1>

        <a
          href="/auth/google"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#F0FDF4] text-gray-700 text-sm font-medium hover:bg-green-50 transition-colors border border-green-100"
        >
          <GoogleIcon />
          Login with Google
        </a>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or sign up through email</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <input
          type="text"
          placeholder="Email ID"
          className="w-full px-4 py-2.5 rounded-lg bg-gray-50 text-sm text-gray-700 placeholder-gray-400 mb-3 outline-none focus:ring-1 focus:ring-green-400"
          disabled
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2.5 rounded-lg bg-gray-50 text-sm text-gray-700 placeholder-gray-400 mb-5 outline-none focus:ring-1 focus:ring-green-400"
          disabled
        />

        <button
          disabled
          className="w-full py-2.5 rounded-lg bg-[#22C55E] text-white text-sm font-medium opacity-60 cursor-not-allowed"
        >
          Login
        </button>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.76-2.7.76-2.08 0-3.84-1.4-4.47-3.29H1.82v2.07A8 8 0 0 0 8.98 17z" />
      <path fill="#FBBC05" d="M4.51 10.52A4.8 4.8 0 0 1 4.26 9c0-.53.09-1.04.25-1.52V5.41H1.82A8 8 0 0 0 .98 9c0 1.29.31 2.51.84 3.59l2.69-2.07z" />
      <path fill="#EA4335" d="M8.98 3.58c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.82 5.4L4.5 7.48c.63-1.89 2.4-3.9 4.48-3.9z" />
    </svg>
  )
}
