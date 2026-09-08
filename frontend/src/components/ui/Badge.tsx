interface BadgeProps {
  label: string
  variant: 'scheduled' | 'sent' | 'failed' | 'sending'
}

const styles: Record<BadgeProps['variant'], string> = {
  scheduled: 'bg-orange-50 text-orange-500 border border-orange-200',
  sent: 'bg-gray-100 text-gray-500 border border-gray-200',
  failed: 'bg-red-50 text-red-500 border border-red-200',
  sending: 'bg-blue-50 text-blue-500 border border-blue-200',
}

export default function Badge({ label, variant }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${styles[variant]}`}>
      {variant === 'scheduled' && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" d="M12 6v6l4 2" />
        </svg>
      )}
      {label}
    </span>
  )
}
