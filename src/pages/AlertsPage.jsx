import { useMemo, useState } from 'react'
import StatusBadge from '../components/StatusBadge'

function AlertsPage({ alerts }) {
  const [filter, setFilter] = useState('All')

  const filtered = useMemo(() => {
    if (filter === 'All') return alerts
    return alerts.filter((item) => item.severity === filter)
  }, [alerts, filter])

  return (
    <section className="app-card rounded-xl p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="app-title text-sm font-semibold">Real-time Alerts</h3>
        <div className="flex gap-2">
          {['All', 'Critical', 'Warning'].map((item) => (
            <button
              key={item}
              className={`rounded-md border px-3 py-1.5 text-xs ${
                filter === item ? 'border-info text-primaryText bg-info/20' : 'border-[#d8dde3] text-[#607488] bg-[#f7f9fb]'
              }`}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="app-table-head text-left border-b border-[#d8dde3]">
              <th className="py-2">Cow ID</th>
              <th>Issue</th>
              <th>Severity</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((alert) => (
              <tr key={alert.id} className="app-body border-b border-[#e3e8ee]">
                <td className="py-2">{alert.cowId}</td>
                <td>{alert.issue}</td>
                <td><StatusBadge status={alert.severity} /></td>
                <td className="app-muted">{alert.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default AlertsPage
