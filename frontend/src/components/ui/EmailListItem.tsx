import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import Badge from './Badge'
import { toggleStar } from '../../lib/api'
import type { Email } from '../../types'

interface EmailListItemProps {
  email: Email
  onStarToggle: (id: string, val: boolean) => void
}

export default function EmailListItem({ email, onStarToggle }: EmailListItemProps) {
  const navigate = useNavigate()

  const handleStar = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await toggleStar(email.id, !email.isStarred)
      onStarToggle(email.id, !email.isStarred)
    } catch {
      // silent
    }
  }

  const timeLabel = email.status === 'sent' && email.sentAt
    ? format(new Date(email.sentAt), 'EEE h:mm a')
    : format(new Date(email.scheduledAt), 'EEE h:mm a')

  const bodyPreview = email.body.replace(/<[^>]*>/g, '').slice(0, 80)

  return (
    <div
      onClick={() => navigate(`/email/${email.id}`)}
      className="flex items-center gap-4 px-6 py-3.5 cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors"
    >
      <div className="flex items-center gap-3 w-44 shrink-0">
        <span className="text-sm font-semibold text-gray-800 truncate">To: {email.recipient.split('@')[0]}</span>
      </div>

      <div className="shrink-0">
        <Badge
          label={email.status === 'scheduled' ? timeLabel : email.status === 'sent' ? 'Sent' : 'Failed'}
          variant={email.status}
        />
      </div>

      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-800 truncate">{email.subject}</span>
        <span className="text-gray-300 shrink-0">-</span>
        <span className="text-sm text-gray-400 truncate">{bodyPreview}</span>
      </div>

      <button
        onClick={handleStar}
        className="shrink-0 text-gray-300 hover:text-yellow-400 transition-colors"
      >
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
    </div>
  )
}
