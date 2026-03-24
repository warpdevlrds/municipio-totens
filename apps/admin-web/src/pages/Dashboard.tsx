import { useState, useEffect } from 'react'
import { Building2, Monitor, ClipboardCheck, Star, TrendingUp, TrendingDown, Activity, AlertTriangle, Clock, Wifi, WifiOff } from 'lucide-react'
import { supabase } from '@municipio-totens/supabase-client'

interface Stats {
  unidades: number
  totens: number
  totensOnline: number
  avaliacoes: number
  avaliacoesHoje: number
  avaliacoesSemana: number
  mediaNotas: number
  tendencia: 'up' | 'down' | 'stable'
}

interface TotemStatus {
  id: string
  codigo: string
  status: string
  unidade_nome: string
  last_heartbeat: string | null
}

interface AvaliacaoRecente {
  id: string
  created_at: string
  totem_codigo: string
  questionario_nome: string
  media_notas: number | null
}

interface AvaliacaoPorDia {
  data: string
  total: number
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    unidades: 0,
    totens: 0,
    totensOnline: 0,
    avaliacoes: 0,
    avaliacoesHoje: 0,
    avaliacoesSemana: 0,
    mediaNotas: 0,
    tendencia: 'stable'
  })
  const [totensStatus, setTotensStatus] = useState<TotemStatus[]>([])
  const [avaliacoesRecentes, setAvaliacoesRecentes] = useState<AvaliacaoRecente[]>([])
  const [avaliacoesPorDia, setAvaliacoesPorDia] = useState<AvaliacaoPorDia[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000) // Atualiza a cada 30s
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      const hoje = new Date().toISOString().split('T')[0]
      const semanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const semanaPassada = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const [unidadesRes, totensRes, avaliacoesTotalRes, avaliacoesHojeRes, avaliacoesSemanaRes, avaliacoesSemanaPassadaRes] = await Promise.all([
        supabase.from('unidades').select('id', { count: 'exact', head: true }).eq('ativo', true),
        supabase.from('totens').select('id, codigo, status, last_heartbeat, unidades(nome)'),
        supabase.from('avaliacoes').select('id', { count: 'exact', head: true }),
        supabase.from('avaliacoes').select('id', { count: 'exact', head: true }).gte('created_at', hoje),
        supabase.from('avaliacoes').select('id', { count: 'exact', head: true }).gte('created_at', semanaAtras),
        supabase.from('avaliacoes').select('id', { count: 'exact', head: true }).gte('created_at', semanaPassada).lt('created_at', semanaAtras)
      ])

      const totens = totensRes.data || []
      const online = totens.filter(t => t.status === 'online').length

      // Calcular tendencia
      const semanaAtual = avaliacoesSemanaRes.count || 0
      const semanaPassadaCount = avaliacoesSemanaPassadaRes.count || 0
      let tendencia: 'up' | 'down' | 'stable' = 'stable'
      if (semanaAtual > semanaPassadaCount * 1.1) tendencia = 'up'
      else if (semanaAtual < semanaPassadaCount * 0.9) tendencia = 'down'

      // Media de notas
      let media = 0
      const respostasRes = await supabase.from('respostas').select('valor_nota').not('valor_nota', 'is', null)
      if (respostasRes.data && respostasRes.data.length > 0) {
        const sum = respostasRes.data.reduce((acc, r) => acc + (r.valor_nota || 0), 0)
        media = Number((sum / respostasRes.data.length).toFixed(1))
      }

      // Status dos totens
      const totensFormatted: TotemStatus[] = totens.map((t: any) => ({
        id: t.id,
        codigo: t.codigo,
        status: t.status,
        unidade_nome: t.unidades?.nome || 'Sem unidade',
        last_heartbeat: t.last_heartbeat
      }))

      // Avaliacoes recentes
      const recentesRes = await supabase
        .from('avaliacoes')
        .select('id, created_at, totens(codigo), questionarios(nome)')
        .order('created_at', { ascending: false })
        .limit(5)

      const recentes: AvaliacaoRecente[] = (recentesRes.data || []).map((a: any) => ({
        id: a.id,
        created_at: a.created_at,
        totem_codigo: a.totens?.codigo || '-',
        questionario_nome: a.questionarios?.nome || '-',
        media_notas: null
      }))

      // Avaliacoes por dia (ultimos 7 dias)
      const porDiaRes = await supabase
        .from('avaliacoes')
        .select('created_at')
        .gte('created_at', semanaAtras)

      const porDiaMap: Record<string, number> = {}
      for (let i = 0; i < 7; i++) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        porDiaMap[d] = 0
      }
      (porDiaRes.data || []).forEach(a => {
        const dia = a.created_at.split('T')[0]
        if (porDiaMap[dia] !== undefined) {
          porDiaMap[dia]++
        }
      })
      const porDia = Object.entries(porDiaMap)
        .map(([data, total]) => ({ data, total }))
        .sort((a, b) => a.data.localeCompare(b.data))

      setStats({
        unidades: unidadesRes.count || 0,
        totens: totens.length,
        totensOnline: online,
        avaliacoes: avaliacoesTotalRes.count || 0,
        avaliacoesHoje: avaliacoesHojeRes.count || 0,
        avaliacoesSemana: avaliacoesSemanaRes.count || 0,
        mediaNotas: media,
        tendencia
      })
      setTotensStatus(totensFormatted)
      setAvaliacoesRecentes(recentes)
      setAvaliacoesPorDia(porDia)
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  const formatDayName = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
  }

  const getTimeSinceHeartbeat = (heartbeat: string | null): string => {
    if (!heartbeat) return 'Nunca'
    const diff = Date.now() - new Date(heartbeat).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Agora'
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    return `${Math.floor(hours / 24)}d`
  }

  if (loading) {
    return <div className="loading">Carregando dashboard...</div>
  }

  const maxAvaliacoes = Math.max(...avaliacoesPorDia.map(d => d.total), 1)

  return (
    <div>
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="icon blue">
              <Building2 size={24} />
            </div>
            {stats.tendencia === 'up' && <TrendingUp size={18} className="trend-up" />}
            {stats.tendencia === 'down' && <TrendingDown size={18} className="trend-down" />}
          </div>
          <div className="value">{stats.unidades}</div>
          <div className="label">Unidades Ativas</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="icon green">
              <Monitor size={24} />
            </div>
            {stats.totensOnline < stats.totens && <AlertTriangle size={18} className="trend-warning" />}
          </div>
          <div className="value">{stats.totensOnline}/{stats.totens}</div>
          <div className="label">Totens Online</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="icon yellow">
              <ClipboardCheck size={24} />
            </div>
            <span className="stat-badge">{stats.avaliacoesHoje} hoje</span>
          </div>
          <div className="value">{stats.avaliacoes}</div>
          <div className="label">Avaliacoes Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="icon red">
              <Star size={24} />
            </div>
          </div>
          <div className="value">{stats.mediaNotas > 0 ? stats.mediaNotas.toFixed(1) : '-'}</div>
          <div className="label">Media de Notas</div>
        </div>
      </div>

      {/* Grafico e Informacoes */}
      <div className="dashboard-grid">
        {/* Grafico de Avaliacoes */}
        <div className="card">
          <div className="card-title">
            <Activity size={18} />
            <span>Avaliacoes nos Ultimos 7 Dias</span>
          </div>
          <div className="chart-container">
            <div className="bar-chart">
              {avaliacoesPorDia.map((d, idx) => (
                <div key={d.data} className="bar-column">
                  <div className="bar-value">{d.total > 0 ? d.total : ''}</div>
                  <div 
                    className="bar"
                    style={{ 
                      height: `${(d.total / maxAvaliacoes) * 100}%`,
                      background: idx === avaliacoesPorDia.length - 1 ? '#4299e1' : '#bee3f8'
                    }}
                  />
                  <div className="bar-label">{formatDayName(d.data)}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-summary">
            <span>{stats.avaliacoesSemana} avaliacoes esta semana</span>
          </div>
        </div>

        {/* Status dos Totens */}
        <div className="card">
          <div className="card-title">
            <Monitor size={18} />
            <span>Status dos Totens</span>
          </div>
          <div className="totens-list">
            {totensStatus.length === 0 ? (
              <p className="empty-text">Nenhum totem cadastrado</p>
            ) : (
              totensStatus.slice(0, 5).map(t => (
                <div key={t.id} className="totem-row">
                  <div className="totem-info">
                    {t.status === 'online' ? (
                      <Wifi size={16} className="status-online" />
                    ) : (
                      <WifiOff size={16} className="status-offline" />
                    )}
                    <div>
                      <strong>{t.codigo}</strong>
                      <span>{t.unidade_nome}</span>
                    </div>
                  </div>
                  <div className="totem-heartbeat">
                    <Clock size={14} />
                    <span>{getTimeSinceHeartbeat(t.last_heartbeat)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Avaliacoes Recentes */}
        <div className="card card-full">
          <div className="card-title">
            <ClipboardCheck size={18} />
            <span>Avaliacoes Recentes</span>
          </div>
          {avaliacoesRecentes.length === 0 ? (
            <p className="empty-text">Nenhuma avaliacao registrada</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Totem</th>
                  <th>Questionario</th>
                </tr>
              </thead>
              <tbody>
                {avaliacoesRecentes.map(a => (
                  <tr key={a.id}>
                    <td>{formatDate(a.created_at)}</td>
                    <td><span className="badge">{a.totem_codigo}</span></td>
                    <td>{a.questionario_nome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
