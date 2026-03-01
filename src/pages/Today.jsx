import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Settings, ChevronRight } from 'lucide-react'
import { useMealPlan } from '../hooks/useMealPlan'
import { getWeekStart, formatDate, getDayOfWeek, addDays, DAYS } from '../lib/dates'

const DEFAULT_DINNER_TIME = '18:30' // 6:30 PM

function calcStartTime(dinnerTime, totalTimeMin) {
  if (!dinnerTime || !totalTimeMin) return null
  const [h, m] = dinnerTime.split(':').map(Number)
  const totalMinutes = h * 60 + m - totalTimeMin
  if (totalMinutes < 0) return null
  const sh = Math.floor(totalMinutes / 60)
  const sm = totalMinutes % 60
  const period = sh >= 12 ? 'PM' : 'AM'
  const hour12 = sh % 12 === 0 ? 12 : sh % 12
  return `${hour12}:${String(sm).padStart(2, '0')} ${period}`
}

function formatTime12(time24) {
  if (!time24) return ''
  const [h, m] = time24.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

export default function Today() {
  const navigate = useNavigate()
  const weekStart = formatDate(getWeekStart())
  const today = getDayOfWeek(new Date())
  const { plan, loading } = useMealPlan(weekStart)

  const [dinnerTime, setDinnerTime] = useState(
    () => localStorage.getItem('dinnerTime') ?? DEFAULT_DINNER_TIME
  )
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    localStorage.setItem('dinnerTime', dinnerTime)
  }, [dinnerTime])

  const dinner = plan[`${today}-dinner`]
  const lunch = plan[`${today}-lunch`]

  const startTime = dinner?.total_time_min
    ? calcStartTime(dinnerTime, dinner.total_time_min)
    : null

  const todayDate = new Date()
  const dateLabel = todayDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Header */}
      <div className="bg-emerald-600 text-white px-4 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-200 text-sm">{dateLabel}</p>
            <h1 className="text-2xl font-bold mt-0.5">Today's Meals</h1>
          </div>
          <button
            onClick={() => setShowSettings((v) => !v)}
            className="p-2 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="mt-4 p-3 bg-emerald-700/60 rounded-xl">
            <label className="text-sm font-medium text-emerald-100 block mb-1">
              Target dinner time
            </label>
            <input
              type="time"
              value={dinnerTime}
              onChange={(e) => setDinnerTime(e.target.value)}
              className="w-full px-3 py-2 bg-emerald-800/60 text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
        )}
      </div>

      <div className="px-4 -mt-2 space-y-4">
        {/* Start cooking banner */}
        {startTime && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <Clock size={20} className="text-amber-600 shrink-0" />
            <div>
              <p className="text-amber-800 font-semibold text-sm">Start cooking by {startTime}</p>
              <p className="text-amber-600 text-xs">
                {dinner.name} takes {dinner.total_time_min} min
                {dinner.prep_time_min ? ` (${dinner.prep_time_min} min prep)` : ''}
              </p>
            </div>
          </div>
        )}

        {/* Dinner card */}
        <MealCard
          label="Dinner"
          meal={dinner}
          loading={loading}
          onTap={dinner ? () => navigate(`/recipes/${dinner.id}`) : () => navigate('/plan')}
          primary
        />

        {/* Lunch card */}
        <MealCard
          label="Lunch"
          meal={lunch}
          loading={loading}
          onTap={lunch ? () => navigate(`/recipes/${lunch.id}`) : () => navigate('/plan')}
          primary={false}
        />

        {/* Dinner time display */}
        <div className="flex items-center justify-between px-1 text-sm text-gray-400">
          <span>Dinner target</span>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1 text-emerald-600 font-medium"
          >
            {formatTime12(dinnerTime)}
          </button>
        </div>
      </div>
    </div>
  )
}

function MealCard({ label, meal, loading, onTap, primary }) {
  if (loading) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${primary ? 'p-5' : 'p-4'} animate-pulse`}>
        <div className="h-4 w-16 bg-gray-100 rounded mb-2" />
        <div className="h-5 w-48 bg-gray-100 rounded" />
      </div>
    )
  }

  return (
    <button
      onClick={onTap}
      className={`w-full text-left bg-white rounded-2xl border shadow-sm transition-all active:scale-[0.98] ${
        primary
          ? 'border-gray-100 p-5 hover:border-emerald-200 hover:shadow-md'
          : 'border-gray-100 p-4 hover:border-gray-200'
      }`}
    >
      <p className={`font-semibold uppercase tracking-wide mb-1 ${primary ? 'text-xs text-emerald-600' : 'text-xs text-gray-400'}`}>
        {label}
      </p>

      {meal ? (
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-gray-900 ${primary ? 'text-lg' : 'text-base'}`}>
              {meal.name}
            </p>
            {meal.description && primary && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{meal.description}</p>
            )}
            {meal.total_time_min != null && (
              <p className="flex items-center gap-1 text-xs text-gray-400 mt-1.5">
                <Clock size={12} />
                {meal.total_time_min} min
                {meal.protein_g != null && ` · ${Math.round(meal.protein_g)}g protein`}
              </p>
            )}
          </div>
          <ChevronRight size={18} className="text-gray-300 shrink-0" />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className={`text-gray-400 ${primary ? 'text-base' : 'text-sm'}`}>
            No {label.toLowerCase()} planned
          </p>
          <ChevronRight size={16} className="text-gray-300" />
        </div>
      )}
    </button>
  )
}
