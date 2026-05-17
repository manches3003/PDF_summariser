'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '2rem', background: 'var(--bg)'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,106,247,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0
      }} />

      <div className="fade-up" style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.4rem', color: 'var(--accent)', textAlign: 'center', marginBottom: '2rem' }}>
            PageLess
          </div>
        </Link>

        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 20, padding: '2.5rem'
        }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.6rem', marginBottom: '0.4rem' }}>Welcome back</h1>
          <p style={{ color: 'var(--muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Sign in to access your summaries</p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 10, padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.85rem'
              }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Sign up free</Link>
          </p>
        </div>
      </div>
    </main>
  )
}