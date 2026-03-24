import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Unidades } from './pages/Unidades'
import { Totens } from './pages/Totens'
import { Questionarios } from './pages/Questionarios'
import { Questoes } from './pages/Questoes'
import { Avaliacoes } from './pages/Avaliacoes'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="unidades" element={<Unidades />} />
          <Route path="totens" element={<Totens />} />
          <Route path="questionarios" element={<Questionarios />} />
          <Route path="questionarios/:id/questoes" element={<Questoes />} />
          <Route path="avaliacoes" element={<Avaliacoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}