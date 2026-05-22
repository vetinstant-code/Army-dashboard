import StatusBadge from './StatusBadge'

function AlertCard({ alert }) {
  return (
    <div className="app-subcard rounded-lg p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-primaryText">{alert.cowId}</p>
        <StatusBadge status={alert.severity} />
      </div>
      <p className="mt-2 text-sm text-secondaryText">{alert.issue}</p>
      <p className="mt-1 text-xs text-secondaryText">{alert.timestamp}</p>
    </div>
  )
}

export default AlertCard
