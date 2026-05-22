import { FiActivity, FiAlertTriangle, FiClipboard, FiDroplet, FiGrid, FiList, FiThermometer } from 'react-icons/fi'

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: FiGrid },
  { key: 'animals', label: 'Animals', icon: FiList },
  { key: 'heat', label: 'Heat Detection', icon: FiDroplet },
  { key: 'disease', label: 'Disease Dashboard', icon: FiActivity },
  { key: 'records', label: 'Health Records', icon: FiClipboard },
  { key: 'alerts', label: 'Alerts', icon: FiAlertTriangle },
]

function Sidebar({ activePage, onChangePage }) {
  return (
    <aside className="w-full max-w-[260px] bg-sidebar border-r border-border min-h-screen p-4 hidden md:flex md:flex-col">
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-border bg-card p-3">
        <div className="rounded-md bg-info/20 p-2 text-info">
          <FiThermometer />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-primaryText">CattleCare</h1>
          <p className="text-xs text-secondaryText">Health Monitoring</p>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onChangePage(key)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm border transition ${
              activePage === key
                ? 'bg-info/20 text-primaryText border-info/40'
                : 'bg-transparent text-secondaryText border-transparent hover:bg-card hover:text-primaryText'
            }`}
          >
            <Icon className="text-base" />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-xl overflow-hidden border border-border">
        <img src="/assets/sidebar-cattle-online.jpg" alt="Cattle" className="h-44 w-full object-cover" />
      </div>
    </aside>
  )
}

export default Sidebar
