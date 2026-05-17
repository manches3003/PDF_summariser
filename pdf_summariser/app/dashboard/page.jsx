'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Upload, LogOut, FileText, Clock, ChevronRight, X } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [summaries, setSummaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      fetchSummaries(data.user.id)
    })
  }, [])

  async function fetchSummaries(userId) {
    const { data, error } = await supabase
      .from('summaries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (!error) setSummaries(data || [])
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return
    if (file.type !== 'application/pdf') { setError('Please upload a PDF file.'); return }
    if (file.size > 10 * 1024 * 1024) { setError('File must be under 10MB.'); return }

    setError('')
    setUploading(true)
    setUploadStatus('Reading PDF...')

    try {
      // Extract text using pdf.js
      const arrayBuffer = await file.arrayBuffer()
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let fullText = ''
      for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        fullText += content.items.map(item => item.str).join(' ') + '\n'
      }

      if (!fullText.trim()) { setError('Could not extract text from this PDF.'); setUploading(false); return }

      setUploadStatus('AI is summarising (this takes ~20 seconds)...')

      // Call our API route
      const res = await fetch('/api/summarise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText, fileName: file.name }),
      })
      const result = await res.json()
      if (!res.ok || result.error) { setError(result.error || 'Summarisation failed.'); setUploading(false); return }

      setUploadStatus('Saving summary...')

      // Save to Supabase
      const { data: savedSummary, error: dbError } = await supabase.from('summaries').insert({
        user_id: user.id,
        file_name: file.name,
        summary: result.summary,
        key_topics: result.keyTopics,
      }).select().single()

      if (dbError) { setError('Failed to save summary.'); setUploading(false); return }

      setSummaries(prev => [savedSummary, ...prev])
      setUploading(false)
      setUploadStatus('')
      router.push(`/summary/${savedSummary.id}`)
    } catch (err) {
      setError('Something went wrong: ' + err.message)
      setUploading(false)
    }
  }, [user])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: false, disabled: uploading
  })

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.25rem 2.5rem', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(12px)'
      }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.3rem', color: 'var(--accent)' }}>PageLess</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{user?.email}</span>
          <button className="btn-outline" onClick={handleLogout} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Upload Zone */}
        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${isDragActive ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 20, padding: '3rem 2rem', textAlign: 'center',
            cursor: uploading ? 'not-allowed' : 'pointer',
            background: isDragActive ? 'rgba(124,106,247,0.05)' : 'var(--surface)',
            transition: 'all 0.2s', marginBottom: '3rem',
            boxShadow: isDragActive ? '0 0 30px rgba(124,106,247,0.2)' : 'none'
          }}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div className="loading-ring" />
              <p style={{ color: 'var(--accent)', fontFamily: 'Syne', fontWeight: 600 }}>{uploadStatus}</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Please don't close this tab</p>
            </div>
          ) : (
            <>
              <div style={{
                width: 60, height: 60, borderRadius: 16, background: 'rgba(124,106,247,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem', color: 'var(--accent)'
              }}>
                <Upload size={28} />
              </div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                {isDragActive ? 'Drop your PDF here!' : 'Upload a PDF'}
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Drag & drop or click to choose · Max 10MB</p>
            </>
          )}
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 12, padding: '1rem 1.25rem', color: '#f87171',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem'
          }}>
            <span>{error}</span>
            <X size={16} style={{ cursor: 'pointer' }} onClick={() => setError('')} />
          </div>
        )}

        {/* Past Summaries */}
        <div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} style={{ color: 'var(--accent)' }} /> Past Summaries
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>Loading...</div>
          ) : summaries.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '3rem', background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 16
            }}>
              <FileText size={40} style={{ color: 'var(--border)', margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--muted)' }}>No summaries yet — upload your first PDF above!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {summaries.map(s => (
                <Link key={s.id} href={`/summary/${s.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 10, background: 'rgba(124,106,247,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0
                      }}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <p style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                          {s.file_name}
                        </p>
                        <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{formatDate(s.created_at)}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} style={{ color: 'var(--muted)' }} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}