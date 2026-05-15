import { useEffect, useState } from 'react'
import { fetchInsights } from '../lib/api'
import type { InsightsData } from '../lib/api'

export default function InsightsDashboard() {
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInsights()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Loading insights…
      </div>
    )

  if (error)
    return (
      <div className="p-8 text-red-400 text-sm">{error}</div>
    )

  if (!data) return null

  const maxTagCount = Math.max(...Object.values(data.top_tags), 1)

  return (
    <div className="p-8 max-w-3xl animate-slide-up bg-white dark:bg-transparent min-h-screen transition-colors">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">Insights</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">A snapshot of your notes activity.</p>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          id="insight-total"
          label="Total Notes"
          value={data.total_notes}
          icon={
            <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          id="insight-recent"
          label="Updated Last 7 Days"
          value={data.recently_updated}
          icon={
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          accent="emerald"
        />
        <StatCard
          id="insight-ai"
          label="Total AI Summaries"
          value={data.ai_usage_count}
          icon={
            <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          accent="amber"
        />
      </div>

      {/* Top tags */}
      <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">Top 5 Tags</h2>
        {Object.keys(data.top_tags).length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No tags used yet.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(data.top_tags)
              .sort(([, a], [, b]) => b - a)
              .map(([tag, count]) => (
                <div key={tag} className="flex items-center gap-3">
                  <span className="tag-pill w-24 text-center justify-center shrink-0 dark:bg-surface-600">{tag}</span>
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-surface-600 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-700"
                      style={{ width: `${(count / maxTagCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 w-6 text-right shrink-0">{count}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface StatCardProps {
  id: string
  label: string
  value: number
  icon: React.ReactNode
  accent?: 'brand' | 'emerald' | 'amber'
}

function StatCard({ id, label, value, icon, accent = 'brand' }: StatCardProps) {
  const ring = 
    accent === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20' : 
    accent === 'amber' ? 'bg-amber-500/10 border-amber-500/20' : 
    'bg-brand-500/10 border-brand-500/20'
  
  return (
    <div id={id} className="bg-white dark:bg-surface-800 border border-slate-100 dark:border-white/10 rounded-xl p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${ring}`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  )
}
