'use client'
import Link from 'next/link'
import { FileText, Zap, History, Download } from 'lucide-react'

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.25rem 2.5rem', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)'
      }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.3rem', color: 'var(--accent)' }}>
          PageLess
        </span>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/login"><button className="btn-outline">Sign In</button></Link>
          <Link href="/signup"><button className="btn-primary">Get Started</button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '7rem 2rem 5rem', maxWidth: 760, margin: '0 auto' }}>
        <div className="fade-up" style={{ animationDelay: '0s' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(124,106,247,0.12)',
            border: '1px solid rgba(124,106,247,0.3)', borderRadius: 99,
            padding: '0.35rem 1rem', fontSize: '0.8rem', color: 'var(--accent)',
            fontFamily: 'Syne', fontWeight: 600, marginBottom: '1.5rem', letterSpacing: '0.05em'
          }}>
            AI-POWERED PDF SUMMARISER
          </div>
        </div>

        <h1 className="fade-up" style={{
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800,
          lineHeight: 1.1, marginBottom: '1.5rem', animationDelay: '0.1s',
          background: 'linear-gradient(135deg, #f0f0f8 0%, #7c6af7 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Read Less.<br />Understand More.
        </h1>

        <p className="fade-up" style={{
          fontSize: '1.1rem', color: 'var(--muted)', lineHeight: 1.7,
          marginBottom: '2.5rem', animationDelay: '0.2s'
        }}>
          Upload any PDF and get a clean, structured summary with key topics highlighted — in seconds. Never drown in pages again.
        </p>

        <div className="fade-up" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', animationDelay: '0.3s' }}>
          <Link href="/signup"><button className="btn-primary" style={{ fontSize: '1rem', padding: '0.8rem 2rem' }}>Start Summarising Free</button></Link>
          <Link href="/login"><button className="btn-outline" style={{ fontSize: '1rem', padding: '0.8rem 2rem' }}>Sign In</button></Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 2rem 6rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {[
            { icon: <Zap size={22} />, title: 'Instant AI Summaries', desc: 'Powered by Meta BART — one of the most accurate summarisation models available.' },
            { icon: <FileText size={22} />, title: 'Structured Format', desc: 'Key topics, bullet points and clean sections so you grasp every important idea.' },
            { icon: <History size={22} />, title: 'Summary History', desc: 'Every summary you\'ve ever made is saved and searchable in your dashboard.' },
            { icon: <Download size={22} />, title: 'Download as PDF', desc: 'Export any summary as a clean PDF to read, share, or study offline.' },
          ].map((f, i) => (
            <div key={i} className="card fade-up" style={{ animationDelay: `${0.1 * i}s` }}>
              <div style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}