import StatusBadge from '../components/StatusBadge'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

function DiseasePage({ diseaseCases, diseaseDistribution }) {
  return (
    <div className="space-y-4">
      <section className="app-card rounded-xl p-4">
        <h3 className="app-title mb-3 text-sm font-semibold">Disease Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={diseaseDistribution}>
              <CartesianGrid stroke="#e3e8ee" />
              <XAxis dataKey="name" stroke="#607488" />
              <YAxis stroke="#607488" />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d8dde3', color: '#1f3143' }} />
              <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-3">
        {diseaseCases.map((item) => (
          <article key={item.disease} className="app-card rounded-xl p-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="app-title text-sm font-semibold">{item.disease}</h4>
              <StatusBadge status={item.severity} />
            </div>
            <p className="mt-2 text-3xl font-semibold text-info">{item.percentage}%</p>
            <p className="app-muted mt-3 text-xs">Affected cows</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {item.affectedCows.map((cowId) => (
                <span key={cowId} className="app-subcard app-body rounded-md px-2 py-1 text-xs">
                  {cowId}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default DiseasePage
