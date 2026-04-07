import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSettings, setSettings, getFontSize, setFontSize, getReaderBg, setReaderBg, removeToken } from '../utils/storage'

export default function SettingsPage({ onLogout }) {
  const navigate = useNavigate()
  const [settings, setLocalSettings] = useState(getSettings())
  const [fontSize, setLocalFontSize] = useState(getFontSize())
  const [readerBg, setLocalReaderBg] = useState(getReaderBg())

  const handleToggleInfiniteScroll = () => {
    const updated = { ...settings, infiniteScroll: !settings.infiniteScroll }
    setLocalSettings(updated)
    setSettings(updated)
  }

  const handleFontSizeChange = (e) => {
    const size = parseInt(e.target.value)
    setLocalFontSize(size)
    setFontSize(size)
  }

  const handleReaderBgChange = (color) => {
    setLocalReaderBg(color)
    setReaderBg(color)
  }

  const handleLogout = () => {
    removeToken()
    onLogout()
    navigate('/')
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-6 border-b border-gray-800">
        <button onClick={() => navigate(-1)} className="text-sky-gold">→ رجوع</button>
        <h1 className="text-xl font-bold">الإعدادات</h1>
      </div>

      {/* Content */}
      <div className="p-3 md:p-6 space-y-6">
        {/* Infinite Scroll Toggle */}
        <div className="bg-sky-card rounded-lg p-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold">تمرير لانهائي</h3>
            <p className="text-sm text-gray-400 mt-1">تحميل الفصول تلقائياً عند التمرير</p>
          </div>
          <button
            onClick={handleToggleInfiniteScroll}
            className={`w-12 h-6 rounded-full transition ${
              settings.infiniteScroll ? 'bg-sky-gold' : 'bg-gray-700'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transform transition ${
              settings.infiniteScroll ? 'translate-x-6' : 'translate-x-1'
            }`}></div>
          </button>
        </div>

        {/* Font Size Slider */}
        <div className="bg-sky-card rounded-lg p-4">
          <h3 className="font-bold mb-4">حجم الخط</h3>
          <input
            type="range"
            min="14"
            max="24"
            value={fontSize}
            onChange={handleFontSizeChange}
            className="w-full accent-sky-gold"
          />
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>١٤px</span>
            <span style={{ fontSize: `${fontSize}px` }}>{fontSize}px</span>
            <span>٢٤px</span>
          </div>
          <div className="mt-4 p-3 bg-sky-bg rounded text-gray-300" style={{ fontSize: `${fontSize}px` }}>
            نص تجريبي لعرض حجم الخط المختار
          </div>
        </div>

        {/* Reader Background Color */}
        <div className="bg-sky-card rounded-lg p-4">
          <h3 className="font-bold mb-4">لون خلفية القارئ</h3>
          <div className="flex gap-4">
            <button
              onClick={() => handleReaderBgChange('#0d0d14')}
              className={`w-12 h-12 rounded-full border-2 ${
                readerBg === '#0d0d14' ? 'border-sky-gold' : 'border-transparent'
              }`}
              style={{ backgroundColor: '#0d0d14' }}
            ></button>
            <button
              onClick={() => handleReaderBgChange('#1a1a2e')}
              className={`w-12 h-12 rounded-full border-2 ${
                readerBg === '#1a1a2e' ? 'border-sky-gold' : 'border-transparent'
              }`}
              style={{ backgroundColor: '#1a1a2e' }}
            ></button>
            <button
              onClick={() => handleReaderBgChange('#1c1008')}
              className={`w-12 h-12 rounded-full border-2 ${
                readerBg === '#1c1008' ? 'border-sky-gold' : 'border-transparent'
              }`}
              style={{ backgroundColor: '#1c1008' }}
            ></button>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition"
        >
          تسجيل الخروج 🚪
        </button>
      </div>
    </div>
  )
}
