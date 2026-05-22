import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

function HeatPage({ cowsInHeat, heatTrend }) {
  return (
    <div className="space-y-4">
      <section className="app-card rounded-xl p-4">
        <h3 className="app-title mb-3 text-sm font-semibold">Cows In Heat</h3>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {cowsInHeat.slice(0, 9).map((cow) => (
            <article key={cow.id} className="app-subcard rounded-lg p-3">
              <p className="app-title text-sm font-semibold">{cow.id}</p>
              <p className="app-muted mt-1 text-xs">Heat probability</p>
              <p className="text-xl font-semibold text-heat">{cow.heatProbability}%</p>
              <p className="app-muted mt-2 text-xs">Window: {cow.inseminationWindow}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="app-card rounded-xl p-4">
        <h3 className="app-title mb-3 text-sm font-semibold">Heat Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={heatTrend}>
              <CartesianGrid stroke="#e3e8ee" />
              <XAxis dataKey="day" stroke="#607488" />
              <YAxis stroke="#607488" />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d8dde3', color: '#1f3143' }} />
              <Line dataKey="count" stroke="#FB923C" strokeWidth={2.2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}

export default HeatPage
