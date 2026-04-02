import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, RefreshCw, Clipboard, Plus, Trash2, Check } from 'lucide-react'
import { useMealPlan } from '../hooks/useMealPlan'
import { useShoppingList, SECTION_ORDER } from '../hooks/useShoppingList'
import { useWeekStartDay } from '../hooks/useWeekStartDay'
import { getWeekStart, formatDate, addDays } from '../lib/dates'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Shopping() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [customInput, setCustomInput] = useState('')
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [startDay] = useWeekStartDay()

  const weekParam = searchParams.get('week')
  const weekStart = weekParam ?? formatDate(getWeekStart(new Date(), startDay))

  function setWeek(date) {
    setSearchParams({ week: formatDate(date) })
  }

  const { plan } = useMealPlan(weekStart)
  const { items, loading, generateList, toggleItem, addCustomItem, removeItem, resetList, exportList } =
    useShoppingList(weekStart, plan)

  const weekEnd = addDays(weekStart, 6)
  const rangeLabel = `${formatDate(weekStart, 'MMM D')} – ${formatDate(weekEnd, 'MMM D')}`

  async function handleGenerate() {
    setGenerating(true)
    await generateList()
    setGenerating(false)
  }

  async function handleAddCustom(e) {
    e.preventDefault()
    if (!customInput.trim()) return
    await addCustomItem(customInput)
    setCustomInput('')
  }

  function handleExport() {
    exportList()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Group items by section
  const sections = {}
  for (const item of items) {
    const s = item.section || 'Other'
    if (!sections[s]) sections[s] = []
    sections[s].push(item)
  }

  const checkedCount = items.filter((i) => i.checked).length
  const totalCount = items.length

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Shopping List</h1>
            {totalCount > 0 && (
              <span className="text-sm text-gray-400">
                {checkedCount}/{totalCount} done
              </span>
            )}
          </div>

          {/* Week navigation */}
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={() => setWeek(addDays(weekStart, -7))}
              className="p-1.5 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
            <span className="text-sm font-medium text-gray-600">{rangeLabel}</span>
            <button
              onClick={() => setWeek(addDays(weekStart, 7))}
              className="p-1.5 rounded-lg hover:bg-gray-100"
            >
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex gap-2 px-4 pb-3 border-t border-gray-50 pt-2">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
          >
            <RefreshCw size={15} className={generating ? 'animate-spin' : ''} />
            {generating ? 'Generating…' : 'Generate from Meals'}
          </button>
          <button
            onClick={handleExport}
            disabled={items.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors disabled:opacity-40"
          >
            {copied ? <Check size={15} className="text-emerald-600" /> : <Clipboard size={15} />}
            {copied ? 'Copied!' : 'Export'}
          </button>
          {items.length > 0 && (
            <button
              onClick={resetList}
              className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-colors"
              title="Clear list"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400 px-8">
          <ShoppingBagIcon />
          <p className="text-lg font-medium mt-3">Your list is empty</p>
          <p className="text-sm mt-1">
            Pick your meals and sides for this week, then tap "Generate from Meals" to auto-build your
            shopping list.
          </p>
        </div>
      ) : (
        <div className="px-4 pt-4 space-y-6">
          {SECTION_ORDER.filter((s) => sections[s]?.length > 0).map((section) => (
            <div key={section}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                {section}
              </h2>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {sections[section].map((item, idx) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      idx > 0 ? 'border-t border-gray-50' : ''
                    } ${item.checked ? 'opacity-50' : ''}`}
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        item.checked
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-gray-300 hover:border-emerald-400'
                      }`}
                    >
                      {item.checked && <Check size={11} className="text-white" strokeWidth={3} />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <span className={`text-sm text-gray-800 ${item.checked ? 'line-through' : ''}`}>
                        {item.name}
                      </span>
                      {(item.qty > 0 || item.unit) && (
                        <span className="text-xs text-gray-400 ml-2">
                          {item.qty > 0 ? item.qty : ''}{item.unit ? ' ' + item.unit : ''}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="shrink-0 p-1 hover:text-red-500 text-gray-300 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Custom items in Other not covered by SECTION_ORDER */}
          {sections['Other'] === undefined &&
            items.filter((i) => !SECTION_ORDER.includes(i.section)).length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Other</h2>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {items
                  .filter((i) => !SECTION_ORDER.includes(i.section))
                  .map((item, idx) => (
                    <div key={item.id} className={`flex items-center gap-3 px-4 py-3 ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                      <button onClick={() => toggleItem(item.id)} className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                        {item.checked && <Check size={11} className="text-white" strokeWidth={3} />}
                      </button>
                      <span className={`flex-1 text-sm text-gray-800 ${item.checked ? 'line-through' : ''}`}>{item.name}</span>
                      <button onClick={() => removeItem(item.id)} className="p-1 hover:text-red-500 text-gray-300"><Trash2 size={14} /></button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add custom item */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2">
        <form onSubmit={handleAddCustom} className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Add item…"
            className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            type="submit"
            disabled={!customInput.trim()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-40 flex items-center gap-1"
          >
            <Plus size={16} /> Add
          </button>
        </form>
      </div>
    </div>
  )
}

function ShoppingBagIcon() {
  return (
    <svg className="mx-auto w-16 h-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
    </svg>
  )
}
