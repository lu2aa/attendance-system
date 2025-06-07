import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import { useUser } from '@supabase/auth-helpers-react'

export default function Home() {
  const user = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      await supabase.auth.getSession()
      setLoading(false)
    }
    checkSession()
  }, [])

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (error) {
      console.error('Login error:', error.message)
      alert('Login failed: ' + error.message)
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Logout error:', error.message)
      alert('Logout failed: ' + error.message)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Attendance System</h1>
      {user ? (
        <div>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/employees"
              className="p-4 bg-blue-500 text-white rounded text-center"
            >
              Employees
            </Link>
            <Link
              href="/requests"
              className="p-4 bg-blue-500 text-white rounded text-center"
            >
              Requests
            </Link>
            <Link
              href="/evaluation"
              className="p-4 bg-blue-500 text-white rounded text-center"
            >
              Evaluation
            </Link>
            <Link
              href="/schedule"
              className="p-4 bg-blue-500 text-white rounded text-center"
            >
              Schedule
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 p-2 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="border p-2 w-full rounded"
            />
          </div>
          <button
            onClick={handleLogin}
            className="p-2 bg-blue-500 text-white rounded w-full"
          >
            Login
          </button>
        </div>
      )}
    </div>
  )
}