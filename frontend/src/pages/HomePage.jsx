import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { getHistory, toArabicNumerals, formatViews, formatDateArabic } from '../utils/storage'
import { cacheNovelList, getNovelListFromCache, isCacheFresh, cacheAllNovels, getAllNovelsFromCache } from '../db/indexeddb'

const TAGS = ['الكل', 'خيال', 'اكشن', 'مغامرة', 'ضعيف الى قوي', 'سحر', 'زراعة', 'فنون قتال', 'نظام', 'عالم آخر', 'إعادة ولادة', 'حريم', 'رومانسي', 'عالم حديث', 'شيانشيا', 'شوانهوان', 'حيوان مرافق', 'قوي الى قوي', 'كوميديا', 'غموض', 'لعبة']

export default function HomePage() {
  const navigate = useNavigate()
  const [novels, setNovels] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [selectedTag, setSelectedTag] = useState('الكل')
  const [showTags, setShowTags] = useState(false)
  const [allNovels, setAllNovels] = useState([])
  const [filteredNovels, setFilteredNovels] = useState([])
  const loaderRef = useRef(null)
  const history = getHistory()

  // Fetch all novels in background for filtering
  useEffect(() => {
    const fetchAllNovels = async () => {
      const cached = await getAllNovelsFromCache()
      if (cached.length > 0 && isCacheFresh(Date.now(), 'novels-all')) {
        setAllNovels(cached)
        return
      }

      try {
        const allNovelsData = []
        for (let p = 1; p <= 9; p++) {
          const res = await api.getNovels(p, 100)
          if (res.success && res.data) {
            allNovelsData.push(...res.data)
          }
        }
        await cacheAllNovels(allNovelsData)
        setAllNovels(allNovelsData)
      } catch (err) {
        console.error('Failed to fetch all novels:', err)
      }
    }
    fetchAllNovels()
  }, [])

  // Filter novels by tag
  useEffect(() => {
    if (selectedTag === 'الكل') {
      setFilteredNovels([])
      return
    }
    if (allNovels.length === 0) return
    
    const filtered = allNovels.filter(novel => 
      novel.tags && novel.tags.includes(selectedTag)
    )
    setFilteredNovels(filtered)
  }, [selectedTag, allNovels])

  // Load initial page
  useEffect(() => {
    if (selectedTag !== 'الكل') return
    
    const loadInitialPage = async () => {
      setLoading(true)
      try {
        // Try cache first
        const cached = await getNovelListFromCache(1, 20)
        if (cached && isCacheFresh(cached.cachedAt, 'novel-lists')) {
          setNovels(cached.data)
          setHasMore(cached.pagination.hasNextPage)
          setLoading(false)
          return
        }

        // Fetch from API
        const res = await api.getNovels(1, 20)
        if (res.success) {
          setNovels(res.data || [])
          setHasMore(res.pagination?.hasNextPage ?? false)
          await cacheNovelList(1, 20, res.data || [], res.pagination || {})
        }
      } catch (err) {
        console.error('Failed to load novels:', err)
      } finally {
        setLoading(false)
      }
    }
    loadInitialPage()
  }, [selectedTag])

  // Infinite scroll
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || selectedTag !== 'الكل') return
    
    setLoading(true)
    try {
      const nextPage = page + 1
      const res = await api.getNovels(nextPage, 20)
      if (res.success) {
        setNovels(prev => [...prev, ...(res.data || [])])
        setPage(nextPage)
        setHasMore(res.pagination?.hasNextPage ?? false)
        await cacheNovelList(nextPage, 20, res.data || [], res.pagination || {})
      }
    } catch (err) {
      console.error('Failed to load more:', err)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, page, selectedTag])

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          loadMore()
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [loadMore, loading, hasMore])

  const handleNovelClick = (novelId) => {
    navigate(`/novel/${novelId}`)
  }

  const renderCover = (novel) => {
    if (!novel.coverImage || novel.coverImage === '') {
      const initials = novel.title?.slice(0, 2) || '??'
      return (
        <div className="w-full h-full bg-sky-card flex items-center justify-center text-sky-gold font-bold text-2xl">
          {initials}
        </div>
      )
    }
    
    if (novel.coverImage.startsWith('data:image')) {
      return <img src={novel.coverImage} alt={novel.title} className="w-full h-full object-cover" />
    }
    
    return <img src={novel.coverImage} alt={novel.title} className="w-full h-full object-cover" />
  }

  const getProgressWidth = (novelId) => {
    const entry = history[novelId]
    if (!entry || !entry.totalChapters) return 0
    return (entry.lastChapterRead / entry.totalChapters) * 100
  }

  const displayNovels = selectedTag === 'الكل' ? novels : filteredNovels

  return (
    <div className="min-h-screen">
      {/* Tag filter toggle */}
      <div className="md:hidden px-3 py-2 bg-sky-card border-b border-gray-800">
        <button
          onClick={() => setShowTags(!showTags)}
          className={`flex items-center gap-2 ${selectedTag !== 'الكل' ? 'text-sky-gold' : ''}`}
        >
          <span>🔽</span>
          <span>تصفية</span>
        </button>
      </div>

      {/* Tag chips */}
      {showTags && (
        <div className="bg-sky-card border-b border-gray-800 px-3 py-2 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 whitespace-nowrap">
            {TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTag(tag)
                  setPage(1)
                  setNovels([])
                }}
                className={`px-4 py-1.5 rounded-full text-sm flex-shrink-0 transition ${
                  selectedTag === tag
                    ? 'bg-sky-gold text-black font-bold'
                    : 'bg-sky-bg text-gray-400'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-3 md:p-6">
        {selectedTag !== 'الكل' && allNovels.length === 0 && (
          <div className="text-center py-8">
            <div className="animate-spin inline-block w-8 h-8 border-2 border-sky-gold border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-400">جاري تحميل بيانات التصفية...</p>
          </div>
        )}

        {selectedTag !== 'الكل' && filteredNovels.length > 0 && (
          <p className="mb-4 text-gray-400">
            {toArabicNumerals(filteredNovels.length)} رواية في تصنيف: {selectedTag}
          </p>
        )}

        {/* Novel Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
          {displayNovels.map(novel => (
            <div
              key={novel.id || novel._id}
              onClick={() => handleNovelClick(novel.id || novel._id)}
              className="relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer group hover:scale-[1.03] transition-transform"
            >
              {renderCover(novel)}
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-sky-bg via-transparent to-transparent" style={{ opacity: 0.6 }}></div>
              
              {/* Chapter badge */}
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 rounded text-xs">
                {toArabicNumerals(novel.totalChapters || 0)} فصل
              </div>
              
              {/* Status badge */}
              <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs ${
                novel.status === 'مكتملة' ? 'bg-green-600' : 'bg-sky-gold text-black'
              }`}>
                {novel.status || 'مستمرة'}
              </div>
              
              {/* Title */}
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <h3 className="font-bold text-sm line-clamp-2">{novel.title}</h3>
              </div>
              
              {/* Progress bar */}
              {history[novel.id || novel._id] && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                  <div 
                    className="h-full bg-sky-gold"
                    style={{ width: `${getProgressWidth(novel.id || novel._id)}%` }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Loading / End */}
        <div ref={loaderRef} className="py-8 text-center">
          {loading && (
            <div className="animate-spin inline-block w-8 h-8 border-2 border-sky-gold border-t-transparent rounded-full"></div>
          )}
          {!hasMore && selectedTag === 'الكل' && novels.length > 0 && (
            <p className="text-gray-400">✓ تم عرض جميع الروايات</p>
          )}
          {!loading && selectedTag !== 'الكل' && filteredNovels.length === 0 && allNovels.length > 0 && (
            <p className="text-gray-400">لا توجد روايات في هذا التصنيف</p>
          )}
        </div>
      </div>
    </div>
  )
}
