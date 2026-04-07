// Dynamic API base URL
const getApiBase = () => {
  if (typeof window === 'undefined') return 'http://localhost:3001'
  return window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : `http://${window.location.hostname}:3001`
}

const API_BASE = getApiBase()

const getAuthHeaders = () => {
  const token = localStorage.getItem('sky_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const api = {
  // Auth
  async login(emailOrUsername, password) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername, password })
    })
    return res.json()
  },

  // Novels
  async getNovels(page = 1, limit = 20) {
    const res = await fetch(`${API_BASE}/api/novels?page=${page}&limit=${Math.min(limit, 100)}`)
    return res.json()
  },

  async searchNovels(query) {
    const res = await fetch(`${API_BASE}/api/novels/search?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders()
    })
    const data = await res.json()
    // Handle both {data: [...]} and direct array response
    return Array.isArray(data) ? data : (data.data || [])
  },

  async getNovelById(id) {
    const res = await fetch(`${API_BASE}/api/novels/${id}`)
    const data = await res.json()
    const novel = data.data
    // Normalize _id to id
    if (novel && !novel.id && novel._id) {
      novel.id = novel._id
    }
    // Normalize description line endings
    if (novel && novel.description) {
      novel.description = novel.description.replace(/\r\n/g, '\n')
    }
    return novel
  },

  async getChapter(novelId, chapterNum) {
    const res = await fetch(`${API_BASE}/api/novels/${novelId}/chapters/${chapterNum}`, {
      headers: getAuthHeaders()
    })
    const data = await res.json()
    
    if (!res.ok) {
      throw new Error(`فشل تحميل الفصل ${chapterNum}`)
    }
    
    if (data.data && data.data.title === '' && data.data.content === '') {
      throw new Error(`بيانات فارغة للفصل ${chapterNum}`)
    }
    
    // Normalize content line endings
    if (data.data && data.data.content) {
      data.data.content = data.data.content.replace(/\r\n/g, '\n')
    }
    
    return data.data
  }
}
