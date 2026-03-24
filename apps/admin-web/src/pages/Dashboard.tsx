import { useState, useEffect } from 'react'
import { Building2, Monitor, ClipboardCheck, Star } from 'lucide-react'
import { supabase } from '@municipio-totens/supabase-client'

interface Stats {
  unidades: number
  totens: number
  totensOnline: number
  avaliacoes: number
  mediaNotas: number
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    unidades: 0,
    totens: 0,
    totensOnline: 0,
    avaliacoes: 0,
    mediaNotas: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [unidadesRes, totensRes, avaliacoesRes] = await Promise.all([
        supabase.from('unidades').select('id', { count: 'exact', head: true }).eq('ativo', true),
        supabase.from('totens').select('*'),
        supabase.from('avaliacoes').select('id', { count: 'exact', head: true })
      ])

      const totens = totensRes.data || []
      const online = totens.filter(t => t.status === 'online').length

      let media = 0
      const respostasRes = await supabase.from('respostas').select('valor_nota').not('valor_nota', 'is', null)
      if (respostasRes.data && respostasRes.data.length > 0) {
        const sum = respostasRes.data.reduce((acc, r) => acc + (r.valor_nota || 0), 0)
        media = Number((sum / respostasRes.data.length).toFixed(1))
      }

      setStats({
        unidades: unidadesRes.count || 0,
        totens: totens.length,
        totensOnline: online,
        avaliacoes: avaliacoesRes.count || 0,
        mediaNotas: media
      })
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Carregando...</div>
  }

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon blue">
            <Building2 size={24} />
          </div>
          <div className="value">{stats.unidades}</div>
          <div className="label">Unidades Ativas</div>
        </div>
        <div className="stat-card">
          <div className="icon green">
            <Monitor size={24} />
          </div>
          <div className="value">{stats.totensOnline}/{stats.totens}</div>
          <div className="label">Totens Online</div>
        </div>
        <div className="stat-card">
          <div className="icon yellow">
            <ClipboardCheck size={24} />
          </div>
          <div className="value">{stats.avaliacoes}</div>
          <div className="label">Avaliações</div>
        </div>
        <div className="stat-card">
          <div className="icon red">
            <Star size={24} />
          </div>
          <div className="value">{stats.mediaNotas > 0 ? stats.mediaNotas.toFixed(1) : '-'}</div>
          <div className="label">Média de Notas</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Bem-vindo ao Painel Administrativo</h3>
        <p style={{ color: '#718096' }}>
          Utilize o menu lateral para navegar entre as funcionalidades do sistema.
          Aqui você pode gerenciar unidades, totens, questionários e visualizar avaliações dos cidadãos.
        </p>
      </div>
    </div>
  )
}