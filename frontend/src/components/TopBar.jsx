import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getToken, removeToken } from '../utils/storage'

export default function TopBar({ isLoggedIn }) {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const token = getToken()
  const isActuallyLoggedIn = !!token

  const handleLogout = () => {
    removeToken()
    setShowMenu(false)
    navigate('/login')
  }

  return (
    <>
      {/* Desktop Top Bar */}
      <header className="hidden md:flex items-center justify-between h-14 px-4 bg-sky-card border-b border-gray-800">
        <div className="flex items-center gap-4">
          {isActuallyLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-9 h-9 rounded-full bg-sky-gold text-black font-bold flex items-center justify-center"
              >
                {token[0]?.toUpperCase() || 'U'}
              </button>
              {showMenu && (
                <div className="absolute top-full left-0 mt-2 bg-sky-card border border-gray-700 rounded-lg shadow-xl z-50 min-w-[150px]">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-right hover:bg-gray-800 rounded-t-lg"
                  >
                    تسجيل الخروج 🚪
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 bg-sky-gold text-black rounded-lg font-bold"
            >
              دخول 🔐
            </Link>
          )}
        </div>

        <h1 className="text-xl font-bold text-sky-gold">سماء الروايات</h1>

        <div className="flex items-center gap-2">
          <Link to="/search" className="p-2 hover:bg-gray-800 rounded-lg">
            🔍
          </Link>
          <Link to="/settings" className="p-2 hover:bg-gray-800 rounded-lg">
            ⚙️
          </Link>
        </div>
      </header>

      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between h-13 px-3 bg-sky-card border-b border-gray-800 sticky top-0 z-40">
        <div className="w-10">
          {isActuallyLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 rounded-full bg-sky-gold text-black font-bold flex items-center justify-center text-sm"
              >
                {token[0]?.toUpperCase() || 'U'}
              </button>
              {showMenu && (
                <div className="absolute top-full right-0 mt-2 bg-sky-card border border-gray-700 rounded-lg shadow-xl z-50 min-w-[150px]">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-right hover:bg-gray-800 rounded-t-lg"
                  >
                    تسجيل الخروج 🚪
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="text-sm px-3 py-1.5 bg-sky-gold text-black rounded-lg font-bold"
            >
              دخول 🔐
            </Link>
          )}
        </div>

        <h1 className="text-lg font-bold text-sky-gold">سماء الروايات</h1>

        <div className="flex items-center gap-1 w-10 justify-end">
          <Link to="/search" className="p-2 hover:bg-gray-800 rounded-lg">
            🔍
          </Link>
        </div>
      </header>
    </>
  )
}
