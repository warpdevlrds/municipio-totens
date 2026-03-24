import { useState, useEffect } from 'react'
import { Search, Filter, Eye, X, Star, MessageSquare, Calendar, Monitor, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@municipio-totens/supabase-client'

interface AvaliacaoCompleta {
  id: string
  totem_id: string
  totem_codigo: string
  unidade_nome: string
  questionario_nome: string
  status: string
  created_at: string
  respostas: { questao_texto: string; tipo: string; valor_nota?: number; valor_texto?: string }[]
}

interface Filtros {
  search: string
  status: string
  dataInicio: string
  dataFim: string
}

export function Avaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoCompleta[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<AvaliacaoCompleta | null>(null)
  const [showFiltros, setShowFiltros] = useState(false)
  const [filtros, setFiltros] = useState<Filtros>({
    search: '',
    status: '',
    dataInicio: '',
    dataFim: ''
  })
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const perPage = 20

  useEffect(() => {
    loadAvaliacoes()
  }, [page, filtros.status, filtros.dataInicio, filtros.dataFim])

  const loadAvaliacoes = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('avaliacoes')
        .select('id, status, created_at, totem_id, totens(codigo, unidades(nome)), questionarios(nome)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1)

      if (filtros.status) {
        query = query.eq('status', filtros.status)
      }
      if (filtros.dataInicio) {
        query = query.gte('created_at', filtros.dataInicio)
      }
      if (filtros.dataFim) {
        query = query.lte('created_at', filtros.dataFim + 'T23:59:59')
      }

      const { data: avaliacoesData, count } = await query

      if (!avaliacoesData) {
        setAvaliacoes([])
        setTotalCount(0)
        return
      }

      setTotalCount(count || 0)

      const formatted: AvaliacaoCompleta[] = avaliacoesData.map((a: any) => ({
        id: a.id,
        totem_id: a.totem_id,
        totem_codigo: a.totens?.codigo || '-',
        unidade_nome: a.totens?.unidades?.nome || '-',
        questionario_nome: a.questionarios?.nome || '-',
        status: a.status,
        created_at: a.created_at,
        respostas: []
      }))

      setAvaliacoes(formatted)
    } catch (err) {
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadRespostas = async (avaliacaoId: string): Promise<AvaliacaoCompleta['respostas']> => {
    const { data: respostas } = await supabase
      .from('respostas')
      .select('valor_nota, valor_texto, questoes(texto, tipo)')
      .eq('avaliacao_id', avaliacaoId)

    return (respostas || []).map(r => ({
      questao_texto: (r.questoes as any)?.texto || '',
      tipo: (r.questoes as any)?.tipo || 'texto_livre',
      valor_nota: r.valor_nota ?? undefined,
      valor_texto: r.valor_texto ?? undefined
    }))
  }

  const handleViewDetails = async (avaliacao: AvaliacaoCompleta) => {
    const respostas = await loadRespostas(avaliacao.id)
    setSelected({ ...avaliacao, respostas })
  }

  const filtered = filtros.search 
    ? avaliacoes.filter(a => 
        a.totem_codigo.toLowerCase().includes(filtros.search.toLowerCase()) ||
        a.questionario_nome.toLowerCase().includes(filtros.search.toLowerCase()) ||
        a.unidade_nome.toLowerCase().includes(filtros.search.toLowerCase())
      )
    : avaliacoes

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMediaNotas = (respostas: AvaliacaoCompleta['respostas']): number | null => {
    const notas = respostas.filter(r => r.valor_nota !== undefined).map(r => r.valor_nota!)
    if (notas.length === 0) return null
    return notas.reduce((a, b) => a + b, 0) / notas.length
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente'
      case 'processada': return 'Processada'
      case 'erro': return 'Erro'
      default: return status
    }
  }

  const totalPages = Math.ceil(totalCount / perPage)

  const clearFiltros = () => {
    setFiltros({ search: '', status: '', dataInicio: '', dataFim: '' })
    setPage(1)
  }

  if (loading && avaliacoes.length === 0) {
    return <div className="loading">Carregando avaliacoes...</div>
  }

  return (
    <div>
      <div className="page-header">
        <h1>Avaliacoes</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className={`btn ${showFiltros ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setShowFiltros(!showFiltros)}
          >
            <Filter size={18} />
            Filtros
          </button>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por totem, questionario ou unidade..." 
            value={filtros.search}
            onChange={e => setFiltros({ ...filtros, search: e.target.value })}
          />
        </div>
      </div>

      {showFiltros && (
        <div className="card filtros-card">
          <div className="filtros-grid">
            <div className="form-group">
              <label>Status</label>
              <select 
                value={filtros.status} 
                onChange={e => { setFiltros({ ...filtros, status: e.target.value }); setPage(1); }}
              >
                <option value="">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="processada">Processada</option>
                <option value="erro">Erro</option>
              </select>
            </div>
            <div className="form-group">
              <label>Data Inicio</label>
              <input 
                type="date" 
                value={filtros.dataInicio}
                onChange={e => { setFiltros({ ...filtros, dataInicio: e.target.value }); setPage(1); }}
              />
            </div>
            <div className="form-group">
              <label>Data Fim</label>
              <input 
                type="date" 
                value={filtros.dataFim}
                onChange={e => { setFiltros({ ...filtros, dataFim: e.target.value }); setPage(1); }}
              />
            </div>
            <div className="form-group" style={{ alignSelf: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={clearFiltros}>Limpar</button>
            </div>
          </div>
        </div>
      )}

      <div className="avaliacoes-summary">
        <span>{totalCount} avaliacao(es) encontrada(s)</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma avaliacao encontrada.</p>
        </div>
      ) : (
        <>
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Totem</th>
                  <th>Unidade</th>
                  <th>Questionario</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td><span className="badge">{a.totem_codigo}</span></td>
                    <td>{a.unidade_nome}</td>
                    <td>{a.questionario_nome}</td>
                    <td>{formatDate(a.created_at)}</td>
                    <td>
                      <span className={`status-badge ${a.status}`}>
                        {getStatusLabel(a.status)}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleViewDetails(a)}>
                        <Eye size={14} />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="pagination-info">
                Pagina {page} de {totalPages}
              </span>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalhes da Avaliacao</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="avaliacao-meta">
                <div className="meta-item">
                  <Monitor size={16} />
                  <div>
                    <span className="meta-label">Totem</span>
                    <span className="meta-value">{selected.totem_codigo}</span>
                  </div>
                </div>
                <div className="meta-item">
                  <FileText size={16} />
                  <div>
                    <span className="meta-label">Questionario</span>
                    <span className="meta-value">{selected.questionario_nome}</span>
                  </div>
                </div>
                <div className="meta-item">
                  <Calendar size={16} />
                  <div>
                    <span className="meta-label">Data</span>
                    <span className="meta-value">{formatDate(selected.created_at)}</span>
                  </div>
                </div>
                {getMediaNotas(selected.respostas) !== null && (
                  <div className="meta-item highlight">
                    <Star size={16} />
                    <div>
                      <span className="meta-label">Media</span>
                      <span className="meta-value">{getMediaNotas(selected.respostas)!.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>

              <h4 className="respostas-title">Respostas ({selected.respostas.length})</h4>
              
              {selected.respostas.length === 0 ? (
                <p className="empty-text">Nenhuma resposta registrada</p>
              ) : (
                <div className="respostas-list">
                  {selected.respostas.map((r, idx) => (
                    <div key={idx} className="resposta-card">
                      <div className="resposta-questao">{r.questao_texto}</div>
                      <div className="resposta-valor">
                        {r.valor_nota !== undefined && (
                          <div className="nota-display">
                            <Star size={16} className={r.valor_nota >= 7 ? 'star-good' : r.valor_nota >= 4 ? 'star-medium' : 'star-bad'} />
                            <span className={`nota-value ${r.valor_nota >= 7 ? 'good' : r.valor_nota >= 4 ? 'medium' : 'bad'}`}>
                              {r.valor_nota}/10
                            </span>
                          </div>
                        )}
                        {r.valor_texto && (
                          <div className="texto-display">
                            <MessageSquare size={16} />
                            <span>"{r.valor_texto}"</span>
                          </div>
                        )}
                        {!r.valor_nota && !r.valor_texto && (
                          <span className="sem-resposta">Sem resposta</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
