import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Building2, 
  Monitor, 
  FileText, 
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  User
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import './Layout.css'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/unidades', icon: Building2, label: 'Unidades' },
  { to: '/totens', icon: Monitor, label: 'Totens' },
  { to: '/questionarios', icon: FileText, label: 'Questionarios' },
  { to: '/avaliacoes', icon: ClipboardList, label: 'Avaliacoes' },
  { to: '/relatorios', icon: BarChart3, label: 'Relatorios' },
]

export function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const userEmail = user?.email || 'Admin'
  const userName = userEmail.split('@')[0]

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Gestao Municipal</h1>
          <span>Totens de Avaliacao</span>
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
        <div className="sidebar-bottom">
          <NavLink
            to="/configuracoes"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Settings size={20} />
            <span>Configuracoes</span>
          </NavLink>
          <button className="nav-item logout-btn" onClick={handleSignOut}>
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <h2>Painel Administrativo</h2>
          <div className="user-info">
            <User size={18} />
            <span>{userName}</span>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
