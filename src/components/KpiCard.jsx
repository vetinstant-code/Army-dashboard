function KpiCard({ title, value, colorClass, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="app-card w-full rounded-xl p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
    >
      <p className="text-xs text-secondaryText">{title}</p>
      <p className={`mt-2 text-3xl font-semibold ${colorClass}`}>{value}</p>
    </button>
  )
}

export default KpiCard
