import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { getToken, updateHistory, getFontSize, getReaderBg, getSettings } from '../utils/storage'
import { getCachedChapter, cacheChapter, getCachedNovel } from '../db/indexeddb'

export default function ReaderPage() {
  const { id, num } = useParams()
  const navigate = useNavigate()
  const chapterNum = parseInt(num)
  
  const [chapter, setChapter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [novel, setNovel] = useState(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  
  const contentRef = useRef(null)
  const settings = getSettings()
  const fontSize = getFontSize()
  const readerBg = getReaderBg()

  useEffect(() => {
    const token = getToken()
    if (!token) {
      navigate('/login')
      return
    }
    loadChapter(chapterNum)
  }, [id, chapterNum])

  const loadChapter = async (chapNum) => {
    setLoading(true)
    setError('')
    
    try {
      // Check cache first
      let cached = await getCachedChapter(id, chapNum)
      if (cached) {
        setChapter(cached)
        updateReadingHistory(cached)
        setLoading(false)
        return
      }

      // Fetch from API
      const data = await api.getChapter(id, chapNum)
      setChapter(data)
      
      // Cache the chapter
      await cacheChapter(id, chapNum, data)
      
      // Update history
      updateReadingHistory(data)
    } catch (err) {
      setError(err.message || 'فشل تحميل الفصل')
    } finally {
      setLoading(false)
      setIsNavigating(false)
    }
  }

  const updateReadingHistory = (chapterData) => {
    if (novel) {
      updateHistory(id, chapterNum, {
        title: novel.title,
        titleEn: novel.titleEn,
        coverImage: novel.coverImage,
        totalChapters: novel.totalChapters
      })
    }
  }

  // Load novel metadata
  useEffect(() => {
    const loadNovelMeta = async () => {
      const cached = await getCachedNovel(id)
      if (cached) setNovel(cached)
    }
    loadNovelMeta()
  }, [id])

  // Scroll handling for auto-hide controls
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowControls(false)
      } else {
        setShowControls(true)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Double tap to toggle controls
  useEffect(() => {
    let lastTap = 0
    const handleDoubleTap = (e) => {
      const now = Date.now()
      if (now - lastTap < 300) {
        setShowControls(prev => !prev)
      }
      lastTap = now
    }

    const ref = contentRef.current
    if (ref) {
      ref.addEventListener('touchend', handleDoubleTap)
    }

    return () => {
      if (ref) ref.removeEventListener('touchend', handleDoubleTap)
    }
  }, [])

  const handlePrev = () => {
    if (isNavigating || chapterNum <= 1) return
    setIsNavigating(true)
    navigate(`/novel/${id}/chapter/${chapterNum - 1}`)
  }

  const handleNext = () => {
    if (isNavigating || !novel || chapterNum >= novel.totalChapters) return
    setIsNavigating(true)
    navigate(`/novel/${id}/chapter/${chapterNum + 1}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: readerBg }}>
        <div className="animate-spin inline-block w-8 h-8 border-2 border-sky-gold border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error || !chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: readerBg }}>
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => navigate(-1)} className="text-sky-gold">→ العودة للرواية</button>
        </div>
      </div>
    )
  }

  const lines = chapter.content?.split('\n').filter(line => line.trim()) || []

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: readerBg }}
      ref={contentRef}
    >
      {/* Top Bar */}
      <div 
        className={`fixed top-0 left-0 right-0 bg-sky-card/95 backdrop-blur border-b border-gray-800 p-3 z-50 transition-transform duration-300 ${
          showControls ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <button onClick={() => navigate(-1)} className="text-sky-gold">
            → العودة للرواية
          </button>
          <h2 className="font-bold truncate max-w-[200px]">{chapter.title}</h2>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 pb-24 px-4 max-w-[720px] mx-auto">
        <div 
          className="reader-content text-gray-200"
          style={{ fontSize: `${fontSize}px` }}
        >
          {lines.map((line, idx) => (
            <p key={idx} className="mb-4">{line}</p>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-sky-card/95 backdrop-blur border-t border-gray-800 p-3 z-50 transition-transform duration-300 safe-bottom ${
          showControls ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <button
            onClick={handleNext}
            disabled={isNavigating || !novel || chapterNum >= novel.totalChapters}
            className={`flex-1 py-2 text-right ${
              isNavigating || !novel || chapterNum >= novel.totalChapters
                ? 'opacity-50 pointer-events-none' : 'hover:text-sky-gold'
            }`}
          >
            الفصل التالي ←
          </button>
          
          <span className="px-4 text-sm text-gray-400 whitespace-nowrap">
            الفصل {chapterNum} من {novel?.totalChapters || '?'}
          </span>
          
          <button
            onClick={handlePrev}
            disabled={isNavigating || chapterNum <= 1}
            className={`flex-1 py-2 ${
              isNavigating || chapterNum <= 1
                ? 'opacity-50 pointer-events-none' : 'hover:text-sky-gold'
            }`}
          >
            → الفصل السابق
          </button>
        </div>
      </div>
    </div>
  )
}
