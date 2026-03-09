export default function TimerDisplay({ running, totalFormatted, phaseFormatted, phaseNumber, totalPhases }) {
  return (
    <div className="text-center py-1">
      <div className={`text-4xl font-mono font-bold tabular-nums tracking-tight ${running ? 'text-green-400' : 'text-gray-300'}`}>
        {totalFormatted}
      </div>
      <div className={`text-lg font-mono tabular-nums tracking-tight mt-1 ${running ? 'text-yellow-300' : 'text-gray-500'}`}>
        {phaseFormatted}
      </div>
      <div className="text-xs text-gray-500 mt-0.5">
        {running ? (
          <>
            Phase <span className="text-gray-300">{phaseNumber}</span>
            {totalPhases ? <span>/{totalPhases}</span> : null}
          </>
        ) : (
          '대기 중'
        )}
      </div>
    </div>
  )
}
