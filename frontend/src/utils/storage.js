// localStorage keys
const TOKEN_KEY = 'sky_token'
const HISTORY_KEY = 'sky_history'
const SETTINGS_KEY = 'sky_settings'
const FONT_SIZE_KEY = 'sky_font_size'
const READER_BG_KEY = 'sky_reader_bg'
const RECENT_SEARCHES_KEY = 'sky_recent_searches'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const removeToken = () => localStorage.removeItem(TOKEN_KEY)

export const getHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || {}
  } catch {
    return {}
  }
}

export const setHistory = (history) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export const updateHistory = (novelId, chapterNum, novelData) => {
  const history = getHistory()
  const existing = history[novelId] || { chaptersRead: [] }
  
  history[novelId] = {
    novelId,
    title: novelData.title,
    titleEn: novelData.titleEn || '',
    coverImage: novelData.coverImage,
    totalChapters: novelData.totalChapters,
    lastChapterRead: chapterNum,
    lastReadAt: new Date().toISOString(),
    chaptersRead: [...new Set([...(existing.chaptersRead || []), chapterNum])]
  }
  
  setHistory(history)
}

export const getSettings = () => {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {
      infiniteScroll: false,
      fontSize: 19,
      readerBg: '#0d0d14'
    }
  } catch {
    return { infiniteScroll: false, fontSize: 19, readerBg: '#0d0d14' }
  }
}

export const setSettings = (settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export const getFontSize = () => {
  const size = localStorage.getItem(FONT_SIZE_KEY)
  return size ? parseInt(size) : 19
}

export const setFontSize = (size) => {
  localStorage.setItem(FONT_SIZE_KEY, size.toString())
}

export const getReaderBg = () => {
  return localStorage.getItem(READER_BG_KEY) || '#0d0d14'
}

export const setReaderBg = (color) => {
  localStorage.setItem(READER_BG_KEY, color)
}

export const getRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY)) || []
  } catch {
    return []
  }
}

export const addRecentSearch = (query) => {
  const searches = getRecentSearches()
  const filtered = searches.filter(s => s !== query)
  const updated = [query, ...filtered].slice(0, 10)
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
}

export const removeRecentSearch = (query) => {
  const searches = getRecentSearches()
  const filtered = searches.filter(s => s !== query)
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered))
}

export const getChapterOrder = (novelId) => {
  return localStorage.getItem(`sky_chapter_order_${novelId}`) || 'asc'
}

export const setChapterOrder = (novelId, order) => {
  localStorage.setItem(`sky_chapter_order_${novelId}`, order)
}

// Format numbers to Arabic-Indic
export const toArabicNumerals = (num) => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  return num.toString().replace(/\d/g, d => arabicNumerals[d])
}

// Format date to Arabic
export const formatDateArabic = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Format large numbers
export const formatViews = (num) => {
  if (num >= 1000000) {
    return `${toArabicNumerals((num / 1000000).toFixed(1))} مليون`
  }
  if (num >= 1000) {
    return `${toArabicNumerals(Math.floor(num / 1000))} ألف`
  }
  return toArabicNumerals(num)
}
