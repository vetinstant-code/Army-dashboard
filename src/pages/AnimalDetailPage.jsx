import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import StatusBadge from '../components/StatusBadge'

function AnimalDetailPage({ cow, trend }) {
  if (!cow) {
    return <p className="text-secondaryText">Select an animal from the Animals page.</p>
  }

  const vitals = [
    { label: 'Temperature', value: `${cow.vitals.temperature} °C` },
    { label: 'Heart Rate', value: `${cow.vitals.heartRate} bpm` },
    { label: 'SpO2', value: `${cow.vitals.spo2} %` },
    { label: 'Respiration', value: `${cow.vitals.respiration} rpm` },
  ]

  return (
    <div className="space-y-4">
      <section className="app-card rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="app-title text-sm font-semibold">Animal Detail</h3>
            <p className="app-muted text-xs">Cow profile and vitals</p>
          </div>
          <StatusBadge status={cow.status} />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="app-subcard rounded-lg p-3">
            <p className="app-muted text-xs">Cow ID</p>
            <p className="app-title mt-1 text-lg font-semibold">{cow.id}</p>
          </div>
          <div className="app-subcard rounded-lg p-3">
            <p className="app-muted text-xs">Breed</p>
            <p className="app-title mt-1 text-lg font-semibold">{cow.breed}</p>
          </div>
          <div className="app-subcard rounded-lg p-3">
            <p className="app-muted text-xs">Age</p>
            <p className="app-title mt-1 text-lg font-semibold">{cow.age} years</p>
          </div>
        </div>
      </section>

      <section className="app-card rounded-xl p-4">
        <h3 className="app-title mb-3 text-sm font-semibold">Vitals</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {vitals.map((vital) => (
            <div key={vital.label} className="app-subcard rounded-lg p-3">
              <p className="app-muted text-xs">{vital.label}</p>
              <p className="app-title mt-1 text-lg font-semibold">{vital.value}</p>
            </div>
          ))}
        </div>

        <div className="app-subcard mt-4 rounded-lg p-3">
          <p className="app-muted text-xs">Health Score</p>
          <p className="mt-1 text-2xl font-semibold text-info">{cow.healthScore}/100</p>
        </div>
      </section>

      <section className="app-card rounded-xl p-4">
        <h3 className="app-title mb-3 text-sm font-semibold">Vitals History</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid stroke="#e3e8ee" />
              <XAxis dataKey="day" stroke="#607488" />
              <YAxis stroke="#607488" />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d8dde3', color: '#1f3143' }} />
              <Line dataKey="score" stroke="#3B82F6" strokeWidth={2.2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}

export default AnimalDetailPage
