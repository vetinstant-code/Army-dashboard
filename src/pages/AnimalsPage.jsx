import { useMemo } from 'react'
import StatusBadge from '../components/StatusBadge'

const filters = ['All', 'Total Cattle', 'Healthy', 'At Risk', 'Sick', 'In Heat']

function AnimalsPage({ cattleData, activeFilter = 'All', onChangeFilter, onSelectCow }) {
  const filtered = useMemo(() => {
    if (activeFilter === 'All') return cattleData
    if (activeFilter === 'Total Cattle') return cattleData
    if (activeFilter === 'In Heat') return cattleData.filter((cow) => cow.status === 'Heat')
    return cattleData.filter((cow) => cow.status === activeFilter)
  }, [activeFilter, cattleData])

  return (
    <div className="space-y-3">
      <div className="text-left">
        <p className="app-muted text-sm font-semibold">Animals List</p>
        <h2 className="app-title mt-1 text-3xl font-bold">{activeFilter}</h2>
      </div>

      <section className="app-card rounded-xl p-4">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`rounded-md border px-3 py-1.5 text-xs ${
                activeFilter === filter
                  ? 'border-info text-primaryText bg-info/20'
                  : 'border-[#d8dde3] text-[#607488] bg-[#f7f9fb]'
              }`}
              onClick={() => onChangeFilter?.(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="app-table-head text-left border-b border-[#d8dde3]">
                <th className="py-2">Cow ID</th>
                <th>Name</th>
                <th>Breed</th>
                <th>Status</th>
                <th>Last Check</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map((cow) => (
                <tr key={cow.id} className="border-b border-[#e3e8ee] app-body">
                  <td className="py-2">{cow.id}</td>
                  <td>{cow.name}</td>
                  <td>{cow.breed}</td>
                  <td><StatusBadge status={cow.status} /></td>
                  <td className="app-muted">{cow.lastCheck}</td>
                  <td>
                    <button
                      onClick={() => onSelectCow(cow)}
                      className="rounded-md border border-info/40 bg-info/10 px-2 py-1 text-xs text-info"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default AnimalsPage
