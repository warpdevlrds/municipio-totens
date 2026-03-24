import { Outlet, NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Building2, 
  Monitor, 
  FileText, 
  ClipboardList,
  BarChart3,
  Settings
} from 'lucide-react'
import './Layout.css'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/unidades', icon: Building2, label: 'Unidades' },
  { to: '/totens', icon: Monitor, label: 'Totens' },
  { to: '/questionarios', icon: FileText, label: 'Questionários' },
  { to: '/avaliacoes', icon: ClipboardList, label: 'Avaliações' },
  { to: '/relatorios', icon: BarChart3, label: 'Relatórios' },
]

export function Layout() {
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Gestão Municipal</h1>
          <span>Totens de Avaliação</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <Settings size={16} />
          <span>Configurações</span>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <h2>Painel Administrativo</h2>
          <div className="user-info">
            <span>Admin</span>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
