import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getSenders, scheduleCampaign } from '../lib/api'
import type { Sender } from '../types'
import RichTextEditor from '../components/ui/RichTextEditor'

function parseEmails(text: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g
  const matches = text.match(emailRegex) ?? []
  return [...new Set(matches)]
}

export default function ComposePage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [senders, setSenders] = useState<Sender[]>([])
  const [senderId, setSenderId] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [recipients, setRecipients] = useState<string[]>([])
  const [toInput, setToInput] = useState('')
  const [delaySeconds, setDelaySeconds] = useState(0)
  const [hourlyLimit, setHourlyLimit] = useState(0)
  const [scheduledAt, setScheduledAt] = useState('')
  const [showSchedulePicker, setShowSchedulePicker] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getSenders()
      .then((data: Sender[]) => {
        setSenders(data)
        if (data.length > 0) setSenderId(data[0].id)
      })
      .catch(() => {})
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const parsed = parseEmails(text)
      if (parsed.length === 0) {
        toast.error('No valid email addresses found in file')
        return
      }
      setRecipients(prev => [...new Set([...prev, ...parsed])])
      toast.success(`${parsed.length} email${parsed.length > 1 ? 's' : ''} added`)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleToKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = toInput.trim().replace(/,$/, '')
      if (!val) return
      const parsed = parseEmails(val)
      if (parsed.length > 0) {
        setRecipients(prev => [...new Set([...prev, ...parsed])])
        setToInput('')
      } else {
        toast.error('Invalid email address')
      }
    }
  }

  const removeRecipient = (email: string) => {
    setRecipients(prev => prev.filter(r => r !== email))
  }

  const quickSchedule = (offset: { hours?: number; days?: number; specific?: string }) => {
    const now = new Date()
    if (offset.specific === 'tomorrow-10am') {
      const d = new Date(now)
      d.setDate(d.getDate() + 1)
      d.setHours(10, 0, 0, 0)
      setScheduledAt(d.toISOString().slice(0, 16))
    } else if (offset.days) {
      const d = new Date(now.getTime() + offset.days * 86_400_000)
      setScheduledAt(d.toISOString().slice(0, 16))
    } else if (offset.hours) {
      const d = new Date(now.getTime() + offset.hours * 3_600_000)
      setScheduledAt(d.toISOString().slice(0, 16))
    }
    setShowSchedulePicker(false)
  }

  const handleSubmit = async () => {
    if (!senderId) { toast.error('Select a sender'); return }
    if (!subject.trim()) { toast.error('Subject is required'); return }
    if (!body.trim() || body === '<p></p>') { toast.error('Body is required'); return }
    if (recipients.length === 0) { toast.error('Add at least one recipient'); return }
    if (!scheduledAt) { toast.error('Set a scheduled time'); return }

    setSubmitting(true)
    try {
      await scheduleCampaign({
        senderId,
        subject,
        body,
        recipients,
        scheduledAt: new Date(scheduledAt).toISOString(),
        delaySeconds: delaySeconds || 2,
        hourlyLimit: hourlyLimit || 200,
      })
      toast.success(`Campaign scheduled for ${recipients.length} recipient${recipients.length > 1 ? 's' : ''}`)
      navigate('/dashboard/scheduled')
    } catch {
      toast.error('Failed to schedule campaign')
    } finally {
      setSubmitting(false)
    }
  }

  const visibleRecipients = recipients.slice(0, 3)
  const overflowCount = recipients.length - visibleRecipients.length
  const selectedSender = senders.find(s => s.id === senderId)

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-800 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Compose New Email
        </button>

        <div className="flex items-center gap-2">
          <button type="button" className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
            </svg>
          </button>

          <button type="button" className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
            </svg>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSchedulePicker(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-500 text-green-600 text-sm font-medium hover:bg-green-50 transition-colors"
            >
              Send Later
            </button>

            {showSchedulePicker && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg z-20 p-4">
                <div className="mb-3">
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={e => setScheduledAt(e.target.value)}
                    className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-green-400"
                  />
                </div>

                <div className="flex flex-col gap-0.5 mb-4">
                  {[
                    { label: 'Tomorrow', action: () => quickSchedule({ days: 1 }) },
                    { label: 'Tomorrow, 10:00 AM', action: () => quickSchedule({ specific: 'tomorrow-10am' }) },
                    { label: 'Tomorrow, 11:00 AM', action: () => { const d = new Date(); d.setDate(d.getDate()+1); d.setHours(11,0,0,0); setScheduledAt(d.toISOString().slice(0,16)); setShowSchedulePicker(false) } },
                    { label: 'Tomorrow, 3:00 PM', action: () => { const d = new Date(); d.setDate(d.getDate()+1); d.setHours(15,0,0,0); setScheduledAt(d.toISOString().slice(0,16)); setShowSchedulePicker(false) } },
                  ].map(opt => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={opt.action}
                      className="text-left text-sm text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setScheduledAt(''); setShowSchedulePicker(false) }}
                    className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSchedulePicker(false)}
                    className="px-3 py-1.5 rounded-lg border border-green-500 text-green-600 text-sm font-medium hover:bg-green-50 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 flex flex-col gap-0">
        <div className="flex items-center gap-4 py-3 border-b border-gray-100">
          <span className="text-sm text-gray-400 w-16 shrink-0">From</span>
          <div className="flex items-center">
            <select
              value={senderId}
              onChange={e => setSenderId(e.target.value)}
              className="text-sm text-gray-700 outline-none bg-transparent border border-gray-200 rounded-lg px-3 py-1 pr-7 cursor-pointer appearance-none"
              style={{ backgroundImage: 'none' }}
            >
              {senders.length === 0 ? (
                <option value="">No senders configured</option>
              ) : (
                senders.map(s => (
                  <option key={s.id} value={s.id}>{s.email}</option>
                ))
              )}
            </select>
            {selectedSender && (
              <svg className="-ml-5 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 py-3 border-b border-gray-100">
          <span className="text-sm text-gray-400 w-16 shrink-0">To</span>
          <div className="flex-1 flex flex-wrap items-center gap-1.5 min-w-0">
            {visibleRecipients.map(email => (
              <span
                key={email}
                onClick={() => removeRecipient(email)}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-gray-300 text-xs text-gray-600 cursor-pointer hover:border-red-300 hover:text-red-500 transition-colors"
              >
                {email}
              </span>
            ))}
            {overflowCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-green-300 text-xs text-green-600 font-medium">
                +{overflowCount}
              </span>
            )}
            <input
              type="text"
              value={toInput}
              onChange={e => setToInput(e.target.value)}
              onKeyDown={handleToKeyDown}
              placeholder={recipients.length === 0 ? 'Add recipients...' : ''}
              className="flex-1 min-w-[120px] text-sm text-gray-700 outline-none placeholder-gray-300"
            />
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 transition-colors font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            Upload List
          </button>
          <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
        </div>

        <div className="flex items-center gap-4 py-3 border-b border-gray-100">
          <span className="text-sm text-gray-400 w-16 shrink-0">Subject</span>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Subject"
            className="flex-1 text-sm text-gray-700 outline-none placeholder-gray-300"
          />
        </div>

        <div className="flex items-center gap-8 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 whitespace-nowrap">Delay between 2 emails</span>
            <input
              type="number"
              min={0}
              value={delaySeconds === 0 ? '' : delaySeconds}
              onChange={e => setDelaySeconds(Number(e.target.value))}
              placeholder="00"
              className="w-14 text-sm text-gray-700 text-center border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-green-400 placeholder-gray-300"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 whitespace-nowrap">Hourly Limit</span>
            <input
              type="number"
              min={0}
              value={hourlyLimit === 0 ? '' : hourlyLimit}
              onChange={e => setHourlyLimit(Number(e.target.value))}
              placeholder="00"
              className="w-14 text-sm text-gray-700 text-center border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-green-400 placeholder-gray-300"
            />
          </div>
          {scheduledAt && (
            <div className="flex items-center gap-1.5 ml-auto">
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
              </svg>
              <span className="text-xs text-green-600 font-medium">{new Date(scheduledAt).toLocaleString()}</span>
              <button type="button" onClick={() => setScheduledAt('')} className="text-gray-300 hover:text-gray-500">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="pt-4">
          <RichTextEditor value={body} onChange={setBody} />
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Schedule
          </button>
        </div>
      </div>
    </div>
  )
}
