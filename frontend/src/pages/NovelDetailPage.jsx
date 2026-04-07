import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { getHistory, toArabicNumerals, formatViews, formatDateArabic, getChapterOrder, setChapterOrder } from '../utils/storage'
import { getCachedNovel, cacheNovel, getCachedChapter } from '../db/indexeddb'

export default function NovelDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [novel, setNovel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [chapters, setChapters] = useState([])
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [chapterSearch, setChapterSearch] = useState('')
  const history = getHistory()
  const novelHistory = history[id]

  useEffect(() => {
    const loadNovel = async () => {
      setLoading(true)
      setError('')
      
      try {
        // Try cache first
        let cached = await getCachedNovel(id)
        if (cached) {
          setNovel(cached)
        }

        // Fetch from API
        const data = await api.getNovelById(id)
        setNovel(data)
        await cacheNovel(data)

        // Generate chapter list
        const chapterList = Array.from({ length: data.totalChapters || 0 }, (_, i) => ({
          num: i + 1,
          title: `الفصل ${i + 1}`
        }))
        setChapters(chapterList)
      } catch (err) {
        setError('فشل تحميل تفاصيل الرواية')
      } finally {
        setLoading(false)
      }
    }
    loadNovel()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin inline-block w-8 h-8 border-2 border-sky-gold border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error || !novel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error || 'الرواية غير موجودة'}</p>
      </div>
    )
  }

  const order = getChapterOrder(id)
  const sortedChapters = order === 'asc' ? chapters : [...chapters].reverse()
  const filteredChapters = sortedChapters.filter(ch => 
    chapterSearch === '' || ch.num.toString().includes(chapterSearch)
  )

  const toggleOrder = () => {
    setChapterOrder(id, order === 'asc' ? 'desc' : 'asc')
  }

  const renderCover = () => {
    if (!novel.coverImage || novel.coverImage === '') {
      const initials = novel.title?.slice(0, 2) || '??'
      return (
        <div className="w-full h-[220px] md:h-full bg-sky-card flex items-center justify-center text-sky-gold font-bold text-4xl">
          {initials}
        </div>
      )
    }
    
    const src = novel.coverImage.startsWith('data:image') 
      ? novel.coverImage 
      : novel.coverImage
    
    return (
      <img 
        src={src} 
        alt={novel.title} 
        className="w-full h-[220px] md:h-full object-cover"
      />
    )
  }

  return (
    <div className="min-h-screen">
      {/* Back button */}
      <div className="p-3 md:p-6">
        <button onClick={() => navigate(-1)} className="text-sky-gold mb-4">
          → رجوع
        </button>
      </div>

      {/* Content */}
      <div className="md:flex md:gap-6 md:px-6">
        {/* Cover */}
        <div className="md:w-[30%] mb-4 md:mb-0">
          {renderCover()}
        </div>

        {/* Info Panel */}
        <div className="md:w-[70%] p-3 md:p-0">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{novel.title}</h1>
          {novel.titleEn && <p className="text-gray-400 mb-1">{novel.titleEn}</p>}
          {novel.alternativeTitle && <p className="text-gray-400 mb-3">{novel.alternativeTitle}</p>}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded text-sm ${
              novel.status === 'مكتملة' ? 'bg-green-600' : 'bg-sky-gold text-black'
            }`}>
              {novel.status}
            </span>
            <span className="px-3 py-1 bg-sky-card rounded text-sm">{novel.category}</span>
            <span className="text-gray-400 text-sm">{toArabicNumerals(novel.totalChapters || 0)} فصل</span>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm text-gray-400 mb-3">
            <span>{formatViews(novel.viewsCount || 0)} مشاهدة</span>
            {novel.lastChapterDate && (
              <span>آخر تحديث: {formatDateArabic(novel.lastChapterDate)}</span>
            )}
          </div>

          {/* Tags */}
          {novel.tags && novel.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto scrollbar-hide">
              {novel.tags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-sky-gold/20 text-sky-gold rounded-full text-sm whitespace-nowrap">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <div className={`mb-4 ${!showFullDesc && 'line-clamp-3 md:line-clamp-none'}`}>
            <p className="text-gray-300 whitespace-pre-line">{novel.description}</p>
          </div>
          {!showFullDesc && (
            <button 
              onClick={() => setShowFullDesc(true)}
              className="text-sky-gold text-sm mb-4"
            >
              عرض المزيد ▾
            </button>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={() => navigate(`/novel/${id}/chapter/${novelHistory?.lastChapterRead || 1}`)}
              className="py-3 bg-sky-gold text-black font-bold rounded-lg hover:bg-yellow-500 transition"
            >
              {novelHistory ? `متابعة من الفصل ${toArabicNumerals(novelHistory.lastChapterRead)} →` : 'اقرأ الآن →'}
            </button>
          </div>

          {/* Chapter List */}
          <div className="border-t border-gray-800 pt-4">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                value={chapterSearch}
                onChange={(e) => setChapterSearch(e.target.value)}
                placeholder="ابحث برقم الفصل..."
                className="flex-1 px-4 py-2 bg-sky-card border border-gray-700 rounded-lg focus:outline-none focus:border-sky-gold"
              />
              <button
                onClick={toggleOrder}
                className="px-4 py-2 bg-sky-card border border-gray-700 rounded-lg hover:bg-gray-800"
              >
                {order === 'asc' ? 'تصاعدي ↑' : 'تنازلي ↓'}
              </button>
            </div>

            {/* Chapters */}
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {filteredChapters.map(chapter => {
                const isRead = novelHistory?.chaptersRead?.includes(chapter.num)
                const isCurrent = novelHistory?.lastChapterRead === chapter.num
                
                return (
                  <div
                    key={chapter.num}
                    onClick={() => navigate(`/novel/${id}/chapter/${chapter.num}`)}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer min-h-[48px] ${
                      isCurrent ? 'bg-sky-gold/10 border-r-2 border-sky-gold' : 'hover:bg-gray-800'
                    }`}
                  >
                    <span>{chapter.title}</span>
                    <div className="flex items-center gap-2">
                      {isRead && <span className="text-sky-gold">✓</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
