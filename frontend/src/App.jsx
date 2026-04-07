import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SearchPage from './pages/SearchPage'
import NovelDetailPage from './pages/NovelDetailPage'
import ReaderPage from './pages/ReaderPage'
import HistoryPage from './pages/HistoryPage'
import DownloadsPage from './pages/DownloadsPage'
import SettingsPage from './pages/SettingsPage'
import MobileNav from './components/MobileNav'
import TopBar from './components/TopBar'
import { getToken } from './utils/storage'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(!!getToken())
  }, [])

  return (
    <div className="min-h-screen bg-sky-bg text-sky-text font-cairo safe-bottom">
      <TopBar isLoggedIn={isLoggedIn} />
      <main className="pb-16 md:pb-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage onLogin={() => setIsLoggedIn(true)} />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/novel/:id" element={<NovelDetailPage />} />
          <Route path="/novel/:id/chapter/:num" element={<ReaderPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/downloads" element={<DownloadsPage />} />
          <Route path="/settings" element={<SettingsPage onLogout={() => setIsLoggedIn(false)} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <MobileNav />
    </div>
  )
}

export default App
