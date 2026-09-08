import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { getEmails, searchEmails } from '../lib/api'
import type { Email } from '../types'
import Sidebar from '../components/layout/Sidebar'
import EmailListItem from '../components/ui/EmailListItem'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'

export default function DashboardPage() {
  const { tab } = useParams<{ tab: 'scheduled' | 'sent' }>()

  const activeTab = tab === 'sent' ? 'sent' : 'scheduled'

  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)

  const [scheduledCount, setScheduledCount] = useState(0)
  const [sentCount, setSentCount] = useState(0)

  const fetchEmails = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getEmails(activeTab)
      setEmails(data)
    } catch {
      setEmails([])
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  const fetchCounts = useCallback(async () => {
    try {
      const [scheduled, sent] = await Promise.all([
        getEmails('scheduled'),
        getEmails('sent'),
      ])
      setScheduledCount(scheduled.length)
      setSentCount(sent.length)
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchEmails()
    fetchCounts()
  }, [fetchEmails, fetchCounts])

  const handleSearch = async (q: string) => {
    setSearchQuery(q)
    if (!q.trim()) {
      fetchEmails()
      return
    }
    setSearching(true)
    try {
      const results = await searchEmails(q)
      setEmails(results)
    } catch {
      setEmails([])
    } finally {
      setSearching(false)
    }
  }

  const handleStarToggle = (id: string, val: boolean) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, isStarred: val } : e))
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar scheduledCount={scheduledCount} sentCount={sentCount} />

      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100">
          <div className="w-[672px] flex items-center gap-2 bg-gray-50 rounded-lg px-3 h-[38px]">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none flex-1"
            />
            {searching && <Spinner className="w-3.5 h-3.5" />}
          </div>

          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3z" />
            </svg>
          </button>

          <button onClick={fetchEmails} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner />
            </div>
          ) : emails.length === 0 ? (
            <EmptyState
              title={activeTab === 'scheduled' ? 'No scheduled emails' : 'No sent emails'}
              description={activeTab === 'scheduled' ? 'Schedule a new email to get started.' : 'Emails you send will appear here.'}
            />
          ) : (
            emails.map(email => (
              <EmailListItem
                key={email.id}
                email={email}
                onStarToggle={handleStarToggle}
              />
            ))
          )}
        </div>
      </main>
    </div>
  )
}
