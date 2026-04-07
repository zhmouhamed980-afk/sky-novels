import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDownloads, deleteDownload } from '../db/indexeddb'
import { toArabicNumerals } from '../utils/storage'

export default function DownloadsPage() {
  const navigate = useNavigate()
  const [downloads, setDownloads] = useState([])

  useEffect(() => {
    loadDownloads()
  }, [])

  const loadDownloads = async () => {
    const data = await getDownloads()
    setDownloads(data || [])
  }

  const handleDelete = async (novelId) => {
    await deleteDownload(novelId)
    loadDownloads()
  }

  const handleDownloadEpub = (download) => {
    if (download.epubBlob) {
      const url = URL.createObjectURL(download.epubBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${download.title}.epub`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const renderCover = (download) => {
    if (!download.coverImage || download.coverImage === '') {
      const initials = download.title?.slice(0, 2) || '??'
      return (
        <div className="w-[80px] h-[120px] bg-sky-card flex items-center justify-center text-sky-gold font-bold rounded">
          {initials}
        </div>
      )
    }
    
    const src = download.coverImage.startsWith('data:image') ? download.coverImage : download.coverImage
    return (
      <img src={src} alt={download.title} className="w-[80px] h-[120px] object-cover rounded" />
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-6 border-b border-gray-800">
        <button onClick={() => navigate(-1)} className="text-sky-gold">→ رجوع</button>
        <h1 className="text-xl font-bold">تنزيلاتي</h1>
      </div>

      {/* Content */}
      <div className="p-3 md:p-6">
        {downloads.length === 0 ? (
          <p className="text-gray-400 text-center py-8">لا توجد تنزيلات محفوظة</p>
        ) : (
          <div className="space-y-3">
            {downloads.map(download => (
              <div key={download.novelId} className="bg-sky-card p-3 rounded-lg">
                <div className="flex gap-3">
                  {renderCover(download)}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">{download.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      الفصول {toArabicNumerals(download.fromChapter)} - {toArabicNumerals(download.toChapter)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{download.fileSize}</p>
                    <p className="text-xs text-green-500 mt-1">✓ متاح بدون إنترنت</p>
                    
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => navigate(`/novel/${download.novelId}`)}
                        className="px-3 py-1.5 bg-sky-gold text-black text-sm rounded hover:bg-yellow-500"
                      >
                        📖 قراءة
                      </button>
                      {download.epubBlob && (
                        <button
                          onClick={() => handleDownloadEpub(download)}
                          className="px-3 py-1.5 bg-gray-700 text-sm rounded hover:bg-gray-600"
                        >
                          ⬇️ EPUB
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(download.novelId)}
                    className="text-gray-400 hover:text-red-500 self-start"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
