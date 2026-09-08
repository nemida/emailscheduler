import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { getEmails, toggleStar } from '../lib/api'
import type { Email } from '../types'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'

export default function EmailDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [email, setEmail] = useState<Email | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const all = await getEmails()
        const found = all.find((e: Email) => e.id === id)
        setEmail(found ?? null)
      } catch {
        setEmail(null)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleStar = async () => {
    if (!email) return
    try {
      await toggleStar(email.id, !email.isStarred)
      setEmail(prev => prev ? { ...prev, isStarred: !prev.isStarred } : prev)
    } catch {
      // silent
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    )
  }

  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3">
        <p className="text-sm text-gray-500">Email not found.</p>
        <button onClick={() => navigate(-1)} className="text-xs text-green-600 hover:underline">Go back</button>
      </div>
    )
  }

  const displayDate = email.sentAt
    ? format(new Date(email.sentAt), 'MMM d, h:mm a')
    : format(new Date(email.scheduledAt), 'MMM d, h:mm a')

  const senderInitial = email.recipient?.[0]?.toUpperCase() ?? 'A'

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          <span className="font-semibold truncate max-w-xl">{email.subject}</span>
        </button>

        <div className="flex items-center gap-3">
          <button onClick={handleStar} className="text-gray-300 hover:text-yellow-400 transition-colors">
            {email.isStarred ? (
              <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5z" />
              </svg>
            )}
          </button>
          <button className="text-gray-300 hover:text-gray-500 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 px-8 py-6 max-w-3xl w-full">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {senderInitial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-gray-900">{email.recipient}</span>
                <p className="text-xs text-gray-400 mt-0.5">to me</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge label={email.status} variant={email.status} />
                <span className="text-xs text-gray-400">{displayDate}</span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="prose prose-sm max-w-none text-gray-800 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: email.body }}
        />
      </div>
    </div>
  )
}
