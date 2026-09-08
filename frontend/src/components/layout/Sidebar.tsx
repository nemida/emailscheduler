import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { logout, getSlackStatus, disconnectSlack } from '../../lib/api'
import toast from 'react-hot-toast'

interface SidebarProps {
  scheduledCount: number
  sentCount: number
}

export default function Sidebar({ scheduledCount, sentCount }: SidebarProps) {
  const { user, refetch } = useAuth()
  const navigate = useNavigate()
  const [showLogout, setShowLogout] = useState(false)
  const [slackConnected, setSlackConnected] = useState(false)
  const [slackLoading, setSlackLoading] = useState(false)

  useEffect(() => {
    getSlackStatus()
      .then((data: { connected: boolean }) => setSlackConnected(data.connected))
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      await refetch()
      navigate('/login', { replace: true })
    } catch {
      toast.error('Failed to logout')
    }
  }

  const handleSlackConnect = () => {
    window.location.href = `/slack/connect`
  }

  const handleSlackDisconnect = async () => {
    setSlackLoading(true)
    try {
      await disconnectSlack()
      setSlackConnected(false)
      toast.success('Slack disconnected')
    } catch {
      toast.error('Failed to disconnect Slack')
    } finally {
      setSlackLoading(false)
    }
  }

  return (
    <aside className="w-[260px] shrink-0 flex flex-col border-r border-gray-100 h-screen">
      <div className="px-5 pt-5 pb-4">
        <span className="text-2xl font-black tracking-tight text-gray-900">ONB</span>
      </div>

      <div className="relative px-3 mb-4">
        <button
          onClick={() => setShowLogout(v => !v)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
          </svg>
        </button>

        {showLogout && (
          <div className="absolute left-3 right-3 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>

      <div className="px-3 mb-5">
        <NavLink
          to="/compose"
          className="flex items-center justify-center w-full py-2 rounded-xl border border-green-500 text-green-600 text-sm font-medium hover:bg-green-50 transition-colors"
        >
          Compose
        </NavLink>
      </div>

      <div className="px-5 mb-2">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Core</p>
      </div>

      <nav className="flex flex-col gap-0.5 px-3">
        <NavLink
          to="/dashboard/scheduled"
          className={({ isActive }) =>
            `flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              isActive ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <span className="flex items-center gap-2.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 6v6l4 2" />
            </svg>
            Scheduled
          </span>
          <span className="text-xs text-gray-400">{scheduledCount}</span>
        </NavLink>

        <NavLink
          to="/dashboard/sent"
          className={({ isActive }) =>
            `flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              isActive ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'
            }`
          }
        >
          <span className="flex items-center gap-2.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
            Sent
          </span>
          <span className="text-xs text-gray-400">{sentCount}</span>
        </NavLink>
      </nav>

      <div className="mt-auto px-3 pb-5">
        <div className="px-3 py-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
              </svg>
              <span className="text-xs font-semibold text-gray-700">Slack</span>
            </div>
            {slackConnected && (
              <span className="text-[10px] text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded-full">Connected</span>
            )}
          </div>
          {slackConnected ? (
            <button
              onClick={handleSlackDisconnect}
              disabled={slackLoading}
              className="w-full py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-white transition-colors disabled:opacity-50"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleSlackConnect}
              className="w-full py-1.5 rounded-lg bg-[#4A154B] text-white text-xs font-medium hover:bg-[#3d1140] transition-colors"
            >
              Connect Slack
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
