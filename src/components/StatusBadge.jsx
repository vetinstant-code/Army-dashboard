function StatusBadge({ status }) {
  const tone = {
    Healthy: 'bg-healthy/15 text-healthy border-healthy/40',
    'At Risk': 'bg-risk/15 text-risk border-risk/40',
    Sick: 'bg-sick/15 text-sick border-sick/40',
    Critical: 'bg-sick/15 text-sick border-sick/40',
    Warning: 'bg-risk/15 text-risk border-risk/40',
    Heat: 'bg-heat/15 text-heat border-heat/40',
  }

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${tone[status] || 'bg-info/15 text-info border-info/40'}`}>
      {status}
    </span>
  )
}

export default StatusBadge
