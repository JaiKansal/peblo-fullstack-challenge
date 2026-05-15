import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

type Mode = 'login' | 'signup'

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setInfo('Check your email for a confirmation link.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-brand-900/30 blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">NoteAI</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Your intelligent notes workspace</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-surface-800 border border-slate-100 dark:border-white/10 rounded-2xl p-8 shadow-xl">
          {/* Tab switcher */}
          <div className="flex bg-slate-100 dark:bg-surface-700/60 rounded-lg p-1 mb-6 border border-slate-200 dark:border-white/5">
            {(['login', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                id={`auth-tab-${m}`}
                onClick={() => { setMode(m); setError(null); setInfo(null) }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                  mode === m
                    ? 'bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <input
                id="auth-email"
                type="email"
                required
                className="input bg-slate-50 dark:bg-surface-700 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <input
                id="auth-password"
                type="password"
                required
                minLength={6}
                className="input bg-slate-50 dark:bg-surface-700 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            {info && (
              <div className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                {info}
              </div>
            )}

            <button
              id="auth-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-base mt-2"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : null}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
