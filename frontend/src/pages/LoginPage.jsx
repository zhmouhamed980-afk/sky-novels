import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../utils/api'
import { setToken, getToken } from '../utils/storage'

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getToken()) {
      navigate('/')
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await api.login(emailOrUsername, password)
      
      if (result.success && result.token) {
        setToken(result.token)
        onLogin()
        navigate('/')
      } else {
        setError('بيانات الدخول غير صحيحة')
      }
    } catch (err) {
      setError('بيانات الدخول غير صحيحة')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-sky-gold mb-2">سماء الروايات</h1>
          <p className="text-gray-400">منصتك المفضلة لقراءة الروايات</p>
        </div>

        {/* Login Card */}
        <div className="bg-sky-card rounded-xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-2">البريد الإلكتروني أو اسم المستخدم</label>
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full px-4 py-3 bg-sky-bg border border-gray-700 rounded-lg focus:outline-none focus:border-sky-gold"
                placeholder="أدخل بريدك أو اسم المستخدم"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-sky-bg border border-gray-700 rounded-lg focus:outline-none focus:border-sky-gold"
                placeholder="أدخل كلمة المرور"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-gold text-black font-bold rounded-lg hover:bg-yellow-500 transition disabled:opacity-50"
            >
              {loading ? 'جاري الدخول...' : 'دخول'}
            </button>
          </form>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-400 hover:text-sky-gold">
            ← العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}
