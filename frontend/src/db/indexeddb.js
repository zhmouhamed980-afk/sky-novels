const DB_NAME = 'SkyNovelsDB'
const DB_VERSION = 1

const stores = {
  downloads: { keyPath: 'novelId' },
  chapters: { keyPath: 'key' },
  novels: { keyPath: '_id' },
  'novel-lists': { keyPath: 'key' },
  'novels-all': { keyPath: 'key' }
}

export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      
      Object.entries(stores).forEach(([name, config]) => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, config)
        }
      })
    }
  })
}

export const db = {
  async get(storeName, key) {
    const database = await openDB()
    return new Promise((resolve, reject) => {
      const tx = database.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const request = store.get(key)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  },

  async set(storeName, item) {
    const database = await openDB()
    return new Promise((resolve, reject) => {
      const tx = database.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const request = store.put(item)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  },

  async getAll(storeName) {
    const database = await openDB()
    return new Promise((resolve, reject) => {
      const tx = database.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const request = store.getAll()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  },

  async delete(storeName, key) {
    const database = await openDB()
    return new Promise((resolve, reject) => {
      const tx = database.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const request = store.delete(key)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  },

  async clear(storeName) {
    const database = await openDB()
    return new Promise((resolve, reject) => {
      const tx = database.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      const request = store.clear()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }
}

// Cache helpers
const CACHE_FRESHNESS = {
  'novel-lists': 60 * 60 * 1000, // 1 hour
  'novels-all': 6 * 60 * 60 * 1000 // 6 hours
}

export const isCacheFresh = (cachedAt, storeName) => {
  if (!cachedAt) return false
  const maxAge = CACHE_FRESHNESS[storeName] || 60 * 60 * 1000
  return Date.now() - cachedAt < maxAge
}

export const cacheChapter = async (novelId, chapterNum, chapterData) => {
  await db.set('chapters', {
    key: `${novelId}_${chapterNum}`,
    novelId,
    chapterNum,
    title: chapterData.title,
    content: chapterData.content,
    cachedAt: Date.now()
  })
}

export const getCachedChapter = async (novelId, chapterNum) => {
  return await db.get('chapters', `${novelId}_${chapterNum}`)
}

export const cacheNovel = async (novel) => {
  await db.set('novels', {
    ...novel,
    cachedAt: Date.now()
  })
}

export const getCachedNovel = async (novelId) => {
  return await db.get('novels', novelId)
}

export const cacheNovelList = async (page, limit, data, pagination) => {
  await db.set('novel-lists', {
    key: `page_${page}_limit_${limit}`,
    page,
    limit,
    data,
    pagination,
    cachedAt: Date.now()
  })
}

export const getNovelListFromCache = async (page, limit) => {
  return await db.get('novel-lists', `page_${page}_limit_${limit}`)
}

export const cacheAllNovels = async (novels) => {
  await db.set('novels-all', {
    key: 'all',
    data: novels,
    cachedAt: Date.now()
  })
}

export const getAllNovelsFromCache = async () => {
  const result = await db.get('novels-all', 'all')
  return result?.data || []
}

export const saveDownload = async (downloadData) => {
  await db.set('downloads', downloadData)
}

export const getDownloads = async () => {
  return await db.getAll('downloads')
}

export const deleteDownload = async (novelId) => {
  await db.delete('downloads', novelId)
}
