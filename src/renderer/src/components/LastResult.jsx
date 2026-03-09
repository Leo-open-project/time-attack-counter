export default function LastResult({ result, attackTypes, onRestart }) {
  const typeLabel = attackTypes.find((t) => t.id === result.type)?.label ?? result.type

  return (
    <div className="flex-1 flex flex-col gap-1 overflow-hidden">
      {/* 유형 + 완료 표시 */}
      <div className="text-center pt-1">
        <span className="text-xs text-gray-500">{typeLabel}</span>
        <div className="text-xs text-green-500 font-semibold tracking-widest mt-0.5">COMPLETED</div>
      </div>

      {/* 총 시간 */}
      <div className="text-center">
        <div className="text-4xl font-mono font-bold tabular-nums tracking-tight text-green-400">
          {result.totalFormatted}
        </div>
      </div>

      <div className="border-t border-gray-700" />

      {/* 페이즈별 시간 */}
      <div className="flex-1 overflow-y-auto space-y-0.5 px-1">
        {result.phases.map((p) => (
          <div key={p.number} className="flex justify-between text-xs font-mono px-1">
            <span className="text-gray-400">Phase {p.number}</span>
            <span className="text-gray-200 tabular-nums">{p.durationFormatted}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-700" />

      {/* 재시작 버튼 */}
      <div className="pb-1">
        <button
          onClick={onRestart}
          className="w-full py-1 rounded text-xs font-semibold bg-green-700 hover:bg-green-600 transition-colors"
        >
          다시 시작
        </button>
      </div>
    </div>
  )
}
