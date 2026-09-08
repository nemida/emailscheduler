export interface User {
  id: string
  googleId: string
  email: string
  name: string
  avatar: string | null
  slackToken: string | null
  slackChannel: string | null
  createdAt: string
}

export interface Sender {
  id: string
  userId: string
  email: string
  name: string
  smtpHost: string
  smtpPort: number
  smtpUser: string
  createdAt: string
}

export interface Campaign {
  id: string
  userId: string
  senderId: string
  subject: string
  body: string
  scheduledAt: string
  delaySeconds: number
  hourlyLimit: number
  status: 'scheduled' | 'sending' | 'completed' | 'failed'
  totalCount: number
  sentCount: number
  createdAt: string
}

export interface Email {
  id: string
  campaignId: string | null
  userId: string
  senderId: string | null
  recipient: string
  subject: string
  body: string
  scheduledAt: string
  sentAt: string | null
  status: 'scheduled' | 'sent' | 'failed'
  isStarred: boolean
  jobId: string | null
  idempotencyKey: string
  errorMessage: string | null
  createdAt: string
}

export interface ScheduleCampaignPayload {
  senderId: string
  subject: string
  body: string
  recipients: string[]
  scheduledAt: string
  delaySeconds: number
  hourlyLimit: number
}
