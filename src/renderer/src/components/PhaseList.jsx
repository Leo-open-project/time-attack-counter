export default function PhaseList({ phases }) {
  if (phases.length === 0) {
    return (
      <div className="text-gray-500 text-xs text-center py-2 italic">
        ESC로 페이즈 기록
      </div>
    )
  }

  return (
    <ul className="space-y-0.5 max-h-40 overflow-y-auto">
      {[...phases].reverse().map((phase) => (
        <li key={phase.number} className="flex justify-between text-xs font-mono px-1">
          <span className="text-green-400">✓ Phase {phase.number}</span>
          <span className="text-gray-300">{phase.durationFormatted}</span>
        </li>
      ))}
    </ul>
  )
}
