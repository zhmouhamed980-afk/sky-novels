import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function MobileNav() {
  const location = useLocation()
  
  // Hide on reader page
  if (location.pathname.match(/\/novel\/[^/]+\/chapter\//)) {
    return null
  }

  const tabs = [
    { path: '/', icon: '🏠', label: 'الرئيسية' },
    { path: '/search', icon: '🔍', label: 'بحث' },
    { path: '/downloads', icon: '📥', label: 'تنزيلاتي' },
    { path: '/history', icon: '📖', label: 'سجلي' },
    { path: '/settings', icon: '⚙️', label: 'إعدادات' }
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-sky-bg border-t border-gray-800 z-50 safe-bottom">
      <div className="flex justify-around items-center h-[60px]">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex flex-col items-center justify-center w-full h-full min-h-[44px] min-w-[44px] ${
              isActive(tab.path) ? 'text-sky-gold' : 'text-gray-500'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs mt-0.5">{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
