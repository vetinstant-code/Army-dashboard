import KpiCard from '../components/KpiCard'
import AlertCard from '../components/AlertCard'
import { ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip, XAxis, YAxis, BarChart, Bar } from 'recharts'

function DashboardPage({ kpis, healthTrend, alerts, diseaseDistribution, onOpenAnimals }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
        <KpiCard title="Total Cattle" value={kpis.total} colorClass="text-primaryText" onClick={() => onOpenAnimals?.('Total Cattle')} />
        <KpiCard title="Healthy" value={kpis.healthy} colorClass="text-healthy" onClick={() => onOpenAnimals?.('Healthy')} />
        <KpiCard title="At Risk" value={kpis.atRisk} colorClass="text-risk" onClick={() => onOpenAnimals?.('At Risk')} />
        <KpiCard title="Sick" value={kpis.sick} colorClass="text-sick" onClick={() => onOpenAnimals?.('Sick')} />
        <KpiCard title="In Heat" value={kpis.inHeat} colorClass="text-heat" onClick={() => onOpenAnimals?.('In Heat')} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <section className="app-card lg:col-span-2 rounded-xl p-4">
          <h3 className="app-title mb-3 text-sm font-semibold">Health Trend (Last 7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthTrend}>
                <CartesianGrid stroke="#e3e8ee" />
                <XAxis dataKey="day" stroke="#607488" />
                <YAxis stroke="#607488" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d8dde3', color: '#1f3143' }} />
                <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2.5} />
                <Line type="monotone" dataKey="riskIndex" stroke="#FACC15" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="app-card rounded-xl p-4">
          <h3 className="app-title mb-3 text-sm font-semibold">Critical Alerts</h3>
          <div className="space-y-3 max-h-72 overflow-auto pr-1">
            {alerts.slice(0, 5).map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </section>
      </div>

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
    </div>
  )
}

export default DashboardPage
