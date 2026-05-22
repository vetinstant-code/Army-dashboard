import { useMemo, useState } from 'react'
import { FiMenu } from 'react-icons/fi'
import Sidebar from './components/Sidebar'
import DashboardPage from './pages/DashboardPage'
import AnimalsPage from './pages/AnimalsPage'
import AnimalDetailPage from './pages/AnimalDetailPage'
import HeatPage from './pages/HeatPage'
import DiseasePage from './pages/DiseasePage'
import AlertsPage from './pages/AlertsPage'
import HealthRecordsPage from './pages/HealthRecordsPage'
import {
  alerts,
  cattleData,
  cowsInHeat,
  diseaseCases,
  diseaseDistribution,
  getDashboardKpis,
  healthTrend,
} from './data/mockData'

const heatTrend = healthTrend.map((d, i) => ({ day: d.day, count: 8 + i + (i % 2 === 0 ? 2 : 0) }))

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [selectedCow, setSelectedCow] = useState(cattleData[0])
  const [animalFilter, setAnimalFilter] = useState('All')

  const title = useMemo(() => {
    const titles = {
      dashboard: 'Dashboard',
      animals: 'Animals',
      heat: 'Heat Detection',
      disease: 'Disease Dashboard',
      records: 'Health Records',
      alerts: 'Alerts',
    }

    return titles[activePage]
  }, [activePage])

  const kpis = getDashboardKpis()

  return (
    <div className="min-h-screen bg-bg text-primaryText md:flex">
      <Sidebar
        activePage={activePage}
        onChangePage={(page) => {
          if (page === 'animals') {
            setAnimalFilter('All')
          }
          setActivePage(page)
        }}
      />

      <main className="flex-1 p-4 md:p-6">
        <header className="app-card mb-4 flex items-center justify-between rounded-xl p-4">
          <div className="flex items-center gap-3">
            <button className="md:hidden rounded-md border border-border bg-sidebar p-2 text-secondaryText">
              <FiMenu />
            </button>
            <div>
              <p className="text-xs uppercase tracking-wide text-secondaryText">Cattle Health Monitoring System</p>
              <h2 className="app-title text-xl font-semibold">{title}</h2>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button className="rounded-md border border-border bg-sidebar px-3 py-2 text-xs text-secondaryText">Sync Device</button>
            <button className="rounded-md border border-healthy/40 bg-healthy/20 px-3 py-2 text-xs text-healthy">New Checkup</button>
          </div>
        </header>

        {activePage === 'dashboard' && (
          <DashboardPage
            kpis={kpis}
            healthTrend={healthTrend}
            alerts={alerts}
            diseaseDistribution={diseaseDistribution}
            onOpenAnimals={(filterTitle) => {
              setAnimalFilter(filterTitle)
              setActivePage('animals')
            }}
          />
        )}

        {activePage === 'animals' && (
          <div className="space-y-4">
            <AnimalsPage
              cattleData={cattleData}
              activeFilter={animalFilter}
              onChangeFilter={setAnimalFilter}
              onSelectCow={(cow) => {
                setSelectedCow(cow)
                setActivePage('records')
              }}
            />
          </div>
        )}

        {activePage === 'heat' && <HeatPage cowsInHeat={cowsInHeat} heatTrend={heatTrend} />}

        {activePage === 'disease' && (
          <DiseasePage diseaseCases={diseaseCases} diseaseDistribution={diseaseDistribution} />
        )}

        {activePage === 'records' && <AnimalDetailPage cow={selectedCow} trend={healthTrend} />}

        {activePage === 'alerts' && <AlertsPage alerts={alerts} />}
      </main>
    </div>
  )
}

export default App
