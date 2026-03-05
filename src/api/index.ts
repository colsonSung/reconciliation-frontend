const API_BASE = '/api/v1'

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || 'Request failed')
  }
  
  if (response.status === 204) return null
  return response.json()
}

// Scheduler API
export const schedulerApi = {
  listJobs: () => fetchWithAuth('/scheduler/jobs'),
  getJob: (id: number) => fetchWithAuth(`/scheduler/jobs/${id}`),
  createJob: (data: any) => fetchWithAuth('/scheduler/jobs', { method: 'POST', body: JSON.stringify(data) }),
  updateJob: (id: number, data: any) => fetchWithAuth(`/scheduler/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteJob: (id: number) => fetchWithAuth(`/scheduler/jobs/${id}`, { method: 'DELETE' }),
  toggleJob: (id: number) => fetchWithAuth(`/scheduler/jobs/${id}/toggle`, { method: 'POST' }),
  getStatus: () => fetchWithAuth('/scheduler/status'),
  start: () => fetchWithAuth('/scheduler/start', { method: 'POST' }),
  stop: () => fetchWithAuth('/scheduler/stop', { method: 'POST' }),
  triggerDaily: () => fetchWithAuth('/scheduler/trigger/daily', { method: 'POST' }),
  triggerWeekly: () => fetchWithAuth('/scheduler/trigger/weekly', { method: 'POST' }),
}

// Report Config API
export const reportConfigApi = {
  list: (channelId?: number) => fetchWithAuth(`/report-configs${channelId ? `?channel_id=${channelId}` : ''}`),
  get: (id: number) => fetchWithAuth(`/report-configs/${id}`),
  create: (data: any) => fetchWithAuth('/report-configs', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchWithAuth(`/report-configs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchWithAuth(`/report-configs/${id}`, { method: 'DELETE' }),
  fetch: (id: number) => fetchWithAuth(`/report-configs/${id}/fetch`, { method: 'POST' }),
  test: (id: number) => fetchWithAuth(`/report-configs/${id}/test`, { method: 'POST' }),
}

// Template API
export const templateApi = {
  list: (type?: string) => fetchWithAuth(`/templates${type ? `?template_type=${type}` : ''}`),
  get: (id: number) => fetchWithAuth(`/templates/${id}`),
  create: (data: any) => fetchWithAuth('/templates', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchWithAuth(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchWithAuth(`/templates/${id}`, { method: 'DELETE' }),
  render: (id: number, data: any) => fetchWithAuth(`/templates/${id}/render`, { method: 'POST', body: JSON.stringify(data) }),
}

// Channel API
export const channelApi = {
  list: () => fetchWithAuth('/channels'),
  get: (id: number) => fetchWithAuth(`/channels/${id}`),
  create: (data: any) => fetchWithAuth('/channels', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchWithAuth(`/channels/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchWithAuth(`/channels/${id}`, { method: 'DELETE' }),
}

// Reconciliation API
export const reconciliationApi = {
  list: (channelId?: number) => fetchWithAuth(`/reconciliation${channelId ? `?channel_id=${channelId}` : ''}`),
  get: (id: number) => fetchWithAuth(`/reconciliation/${id}`),
  create: (data: any) => fetchWithAuth('/reconciliation', { method: 'POST', body: JSON.stringify(data) }),
  execute: (id: number) => fetchWithAuth(`/reconciliation/${id}/execute`, { method: 'POST' }),
}

// Reconciliation Annotation API
export const annotationApi = {
  annotate: (detailId: number, reason?: string, annotation?: string) => 
    fetchWithAuth(`/reconciliation/${detailId}/annotate`, { 
      method: 'PATCH', 
      body: JSON.stringify({ reason, annotation }) 
    }),
}
