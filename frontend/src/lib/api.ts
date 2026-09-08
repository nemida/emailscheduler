import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

export const authApi = axios.create({
  baseURL: '/',
  withCredentials: true,
})

export const getMe = () => authApi.get('/auth/me').then(r => r.data)
export const logout = () => authApi.post('/auth/logout').then(r => r.data)

export const getCampaigns = () => api.get('/campaigns').then(r => r.data)
export const getCampaign = (id: string) => api.get(`/campaigns/${id}`).then(r => r.data)
export const scheduleCampaign = (payload: object) => api.post('/campaigns', payload).then(r => r.data)

export const getSenders = () => api.get('/senders').then(r => r.data)
export const createSender = (payload: object) => api.post('/senders', payload).then(r => r.data)
export const deleteSender = (id: string) => api.delete(`/senders/${id}`).then(r => r.data)

export const getEmails = (status?: string) =>
  api.get('/emails', { params: status ? { status } : {} }).then(r => r.data)

export const searchEmails = (q: string) =>
  api.get('/emails/search', { params: { q } }).then(r => r.data)

export const toggleStar = (id: string, isStarred: boolean) =>
  api.patch(`/emails/${id}/star`, { isStarred }).then(r => r.data)

export const getSlackStatus = () => authApi.get('/slack/status').then(r => r.data)
export const disconnectSlack = () => authApi.post('/slack/disconnect').then(r => r.data)

export default api
