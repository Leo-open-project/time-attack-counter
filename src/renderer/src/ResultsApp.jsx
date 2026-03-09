import { useState, useEffect } from 'react'

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ResultsApp() {
  const [results, setResults] = useState([])
  const [attackTypes, setAttackTypes] = useState([])
  const [filterType, setFilterType] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    Promise.all([
      window.api.resultsGet(),
      window.api.attackTypesGet(),
    ]).then(([r, t]) => {
      setResults(r)
      setAttackTypes(t)
    })
  }, [])

  const filtered =
    filterType === 'all' ? results : results.filter((r) => r.type === filterType)

  const typeLabel = (id) => attackTypes.find((t) => t.id === id)?.label ?? id

  async function handleDelete(id) {
    const updated = await window.api.resultsDelete(id)
    setResults(updated)
    if (expanded === id) setExpanded(null)
  }

  async function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
      return
    }
    const updated = await window.api.resultsClear()
    setResults(updated)
    setExpanded(null)
    setConfirmClear(false)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900/90 text-white select-none overflow-hidden rounded-lg border border-gray-700">
      {/* Header */}
      <div
        className="px-3 py-2 bg-gray-800/80 flex items-center justify-between"
        style={{ WebkitAppRegion: 'drag' }}
      >
        <span className="text-xs text-gray-400 font-semibold tracking-wide">
          기록 {filtered.length > 0 && <span className="text-gray-600">({filtered.length})</span>}
        </span>
        <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' }}>
          {results.length > 0 && (
            <button
              onClick={handleClear}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${
                confirmClear
                  ? 'bg-red-600 text-white'
                  : 'text-gray-500 hover:text-red-400'
              }`}
              title="전체 삭제"
            >
              {confirmClear ? '확인?' : '전체 삭제'}
            </button>
          )}
          <button
            onClick={() => window.api.resultsClose()}
            className="text-gray-500 hover:text-red-400 text-sm px-1"
            title="닫기"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 유형 필터 탭 */}
      <div className="flex gap-1 px-2 pt-2 pb-1 flex-wrap">
        <button
          onClick={() => setFilterType('all')}
          className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
            filterType === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:text-white'
          }`}
        >
          전체
        </button>
        {attackTypes.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilterType(t.id)}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              filterType === t.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 기록 목록 */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
        {filtered.length === 0 ? (
          <div className="text-gray-500 text-xs text-center py-10 italic">기록 없음</div>
        ) : (
          filtered.map((r, i) => (
            <div
              key={r.id}
              className="bg-gray-800/60 rounded border border-gray-700/50 overflow-hidden"
            >
              {/* 요약 행 */}
              <div className="flex items-stretch">
                <button
                  className="flex-1 px-3 py-2 flex items-center justify-between text-left hover:bg-gray-700/40 transition-colors"
                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-6 text-right">
                      #{filtered.length - i}
                    </span>
                    <span className="text-xs text-blue-400">{typeLabel(r.type)}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-green-400 tabular-nums">
                      {r.totalFormatted}
                    </div>
                    <div className="text-xs text-gray-500">{formatDate(r.date)}</div>
                  </div>
                </button>
                {/* 개별 삭제 버튼 */}
                <button
                  onClick={() => handleDelete(r.id)}
                  className="px-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors border-l border-gray-700/50 text-xs"
                  title="삭제"
                >
                  ✕
                </button>
              </div>

              {/* 페이즈 상세 */}
              {expanded === r.id && (
                <div className="px-3 pb-2 pt-1 border-t border-gray-700/50 space-y-0.5">
                  {r.phases.map((p) => (
                    <div key={p.number} className="flex justify-between text-xs font-mono">
                      <span className="text-gray-500">Phase {p.number}</span>
                      <span className="text-gray-300 tabular-nums">{p.durationFormatted}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
