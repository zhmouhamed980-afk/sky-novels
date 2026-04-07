import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { getToken, getRecentSearches, addRecentSearch, removeRecentSearch, toArabicNumerals } from '../utils/storage'

export default function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const recentSearches = getRecentSearches()

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    const token = getToken()
    if (!token) {
      setError('يجب تسجيل الدخول للبحث')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const data = await api.searchNovels(query)
      setResults(data || [])
      addRecentSearch(query)
    } catch (err) {
      setError('حدث خطأ أثناء البحث')
    } finally {
      setLoading(false)
    }
  }

  const handleRecentClick = (searchQuery) => {
    setQuery(searchQuery)
    handleSearch({ preventDefault: () => {} })
  }

  const renderCover = (novel) => {
    if (!novel.coverImage || novel.coverImage === '') {
      const initials = novel.title?.slice(0, 2) || '??'
      return (
        <div className="w-[60px] h-[80px] bg-sky-card flex items-center justify-center text-sky-gold font-bold rounded">
          {initials}
        </div>
      )
    }
    
    return (
      <img 
        src={novel.coverImage} 
        alt={novel.title} 
        className="w-[60px] h-[80px] object-cover rounded"
      />
    )
  }

  return (
    <div className="min-h-screen bg-sky-bg">
      {/* Top Bar */}
      <div className="flex items-center gap-3 p-3 border-b border-gray-800">
        <button onClick={() => navigate(-1)} className="text-sky-gold">
          → رجوع
        </button>
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن رواية..."
            className="flex-1 px-4 py-2 bg-sky-card border border-gray-700 rounded-lg focus:outline-none focus:border-sky-gold"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setResults([])
              }}
              className="px-3 text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </form>
      </div>

      {/* Content */}
      <div className="p-4">
        {error && (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-sky-gold text-black rounded-lg font-bold"
            >
              تسجيل الدخول
            </button>
          </div>
        )}

        {!error && !query && recentSearches.length > 0 && (
          <div>
            <h3 className="text-gray-400 mb-3">عمليات بحث سابقة</h3>
            <div className="space-y-2">
              {recentSearches.map((search, idx) => (
                <div key={idx} className="flex items-center justify-between bg-sky-card p-3 rounded-lg">
                  <button
                    onClick={() => handleRecentClick(search)}
                    className="flex items-center gap-2 text-right"
                  >
                    <span>🕐</span>
                    <span>{search}</span>
                  </button>
                  <button
                    onClick={() => removeRecentSearch(search)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!error && !query && recentSearches.length === 0 && (
          <p className="text-gray-400 text-center py-8">ابدأ بالكتابة للبحث عن الروايات</p>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin inline-block w-8 h-8 border-2 border-sky-gold border-t-transparent rounded-full"></div>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-3">
            {results.map(novel => (
              <div
                key={novel.id || novel._id}
                onClick={() => navigate(`/novel/${novel.id || novel._id}`)}
                className="flex gap-3 bg-sky-card p-3 rounded-lg cursor-pointer hover:bg-gray-800 transition"
              >
                {renderCover(novel)}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{novel.title}</h3>
                  {novel.titleEn && (
                    <p className="text-sm text-gray-400 truncate">{novel.titleEn}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <span>{toArabicNumerals(novel.totalChapters || 0)} فصل</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      novel.status === 'مكتملة' ? 'bg-green-600' : 'bg-sky-gold text-black'
                    }`}>
                      {novel.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <p className="text-gray-400 text-center py-8">لا توجد نتائج لـ: {query}</p>
        )}
      </div>
    </div>
  )
}
