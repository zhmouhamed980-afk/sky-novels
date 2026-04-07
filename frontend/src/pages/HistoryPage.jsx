import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHistory, setHistory, toArabicNumerals } from '../utils/storage'

export default function HistoryPage() {
  const navigate = useNavigate()
  const [history, setLocalHistory] = useState({})

  useEffect(() => {
    setLocalHistory(getHistory())
  }, [])

  const handleDelete = (novelId) => {
    const updated = { ...history }
    delete updated[novelId]
    setHistory(updated)
    setLocalHistory(updated)
  }

  const handleDeleteAll = () => {
    setHistory({})
    setLocalHistory({})
  }

  const renderCover = (entry) => {
    if (!entry.coverImage || entry.coverImage === '') {
      const initials = entry.title?.slice(0, 2) || '??'
      return (
        <div className="w-[80px] h-[120px] bg-sky-card flex items-center justify-center text-sky-gold font-bold rounded">
          {initials}
        </div>
      )
    }
    
    const src = entry.coverImage.startsWith('data:image') ? entry.coverImage : entry.coverImage
    return (
      <img src={src} alt={entry.title} className="w-[80px] h-[120px] object-cover rounded" />
    )
  }

  const entries = Object.values(history).sort((a, b) => 
    new Date(b.lastReadAt) - new Date(a.lastReadAt)
  )

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-6 border-b border-gray-800">
        <button onClick={() => navigate(-1)} className="text-sky-gold">→ رجوع</button>
        <h1 className="text-xl font-bold">سجل القراءة</h1>
        {entries.length > 0 && (
          <button onClick={handleDeleteAll} className="text-red-500 text-sm">حذف الكل</button>
        )}
      </div>

      {/* Content */}
      <div className="p-3 md:p-6">
        {entries.length === 0 ? (
          <p className="text-gray-400 text-center py-8">لا يوجد سجل قراءة بعد</p>
        ) : (
          <div className="space-y-3">
            {entries.map(entry => (
              <div
                key={entry.novelId}
                onClick={() => navigate(`/novel/${entry.novelId}/chapter/${entry.lastChapterRead}`)}
                className="flex gap-3 bg-sky-card p-3 rounded-lg cursor-pointer hover:bg-gray-800 transition"
              >
                {renderCover(entry)}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{entry.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    الفصل {toArabicNumerals(entry.lastChapterRead)} من {toArabicNumerals(entry.totalChapters)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(entry.lastReadAt).toLocaleDateString('ar-EG')}
                  </p>
                  
                  {/* Progress bar */}
                  <div className="mt-2 h-1 bg-gray-700 rounded">
                    <div 
                      className="h-full bg-sky-gold rounded"
                      style={{ width: `${(entry.lastChapterRead / entry.totalChapters) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(entry.novelId)
                  }}
                  className="text-gray-400 hover:text-red-500 self-start"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
