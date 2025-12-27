import { useMemo } from 'react'

export function StatsPie({ completed = 0, pending = 0, label }) {
  const total = completed + pending
  const completedPercent = total ? Math.round((completed / total) * 100) : 0

  const style = useMemo(() => {
    if (!total) {
      return {
        background: 'conic-gradient(var(--chart-empty) 0% 100%)',
      }
    }
    return {
      background: `conic-gradient(var(--chart-complete) 0% ${completedPercent}%, var(--chart-pending) ${completedPercent}% 100%)`,
    }
  }, [completedPercent, total])

  return (
    <div
      className="stats-pie"
      style={style}
      role="img"
      aria-label={label}
    >
      <div className="stats-pie__hole">
        <span className="stats-pie__value">{total}</span>
      </div>
    </div>
  )
}
