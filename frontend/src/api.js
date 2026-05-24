const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`
  const opts = {
    method: options.method || 'GET',
    headers: {
      ...(options.headers || {}),
    },
  }

  if (options.token) {
    opts.headers.Authorization = `Bearer ${options.token}`
  }

  if (options.body) {
    if (options.formUrlEncoded) {
      opts.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      opts.body = new URLSearchParams(options.body)
    } else {
      opts.headers['Content-Type'] = 'application/json'
      opts.body = JSON.stringify(options.body)
    }
  }

  const response = await fetch(url, opts)
  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(data?.detail || data?.message || response.statusText || 'Request failed')
  }

  return data
}

export const getCandidates = () => request('/candidates')
export const registerUser = (payload) => request('/register', { method: 'POST', body: payload })
export const loginUser = (payload) =>
  request('/login', {
    method: 'POST',
    body: payload,
    formUrlEncoded: true,
  })
export const castVote = (token, payload) =>
  request('/vote', { method: 'POST', token, body: payload })
export const getResults = () => request('/results')
