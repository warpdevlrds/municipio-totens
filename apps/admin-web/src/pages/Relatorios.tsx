import { useState, useEffect } from 'react'
import { Download, Filter, Calendar, BarChart3, TrendingUp, Users } from 'lucide-react'
import { supabase } from '@municipio-totens/supabase-client'

interface FiltroState {
  dataInicio: string
  dataFim: string
  unidadeId: string
  totemId: string
  questionarioId: string
}

interface ResumoData {
  totalAvaliacoes: number
  mediaGeral: number
  avaliacoesPorDia: { data: string; total: number }[]
  mediasPorUnidade: { unidade: string; media: number; total: number }[]
  distribuicaoNotas: { nota: number; total: number }[]
  topQuestoes: { texto: string; media: number }[]
}

export function Relatorios() {
  const [filtros, setFiltros] = useState<FiltroState>({
    dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
    unidadeId: '',
    totemId: '',
    questionarioId: ''
  })

  const [unidades, setUnidades] = useState<{ id: string; nome: string }[]>([])
  const [totens, setTotens] = useState<{ id: string; codigo: string; unidade_id: string }[]>([])
  const [questionarios, setQuestionarios] = useState<{ id: string; nome: string }[]>([])
  const [resumo, setResumo] = useState<ResumoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFiltros, setShowFiltros] = useState(false)

  useEffect(() => {
    loadFiltrosData()
  }, [])

  useEffect(() => {
    loadResumo()
  }, [filtros])

  const loadFiltrosData = async () => {
    const [unidadesRes, totensRes, questionariosRes] = await Promise.all([
      supabase.from('unidades').select('id, nome').eq('ativo', true).order('nome'),
      supabase.from('totens').select('id, codigo, unidade_id').order('codigo'),
      supabase.from('questionarios').select('id, nome').eq('ativo', true).order('nome')
    ])

    setUnidades(unidadesRes.data || [])
    setTotens(totensRes.data || [])
    setQuestionarios(questionariosRes.data || [])
  }

  const loadResumo = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('avaliacoes')
        .select('id, created_at, totem_id, questionario_id, totens(unidade_id, unidades(nome))')
        .gte('created_at', filtros.dataInicio)
        .lte('created_at', filtros.dataFim + 'T23:59:59')

      if (filtros.totemId) {
        query = query.eq('totem_id', filtros.totemId)
      }
      if (filtros.questionarioId) {
        query = query.eq('questionario_id', filtros.questionarioId)
      }

      const { data: avaliacoes } = await query

      if (!avaliacoes || avaliacoes.length === 0) {
        setResumo({
          totalAvaliacoes: 0,
          mediaGeral: 0,
          avaliacoesPorDia: [],
          mediasPorUnidade: [],
          distribuicaoNotas: [],
          topQuestoes: []
        })
        setLoading(false)
        return
      }

      // Filtrar por unidade se necessário
      let avaliacoesFiltradas = avaliacoes
      if (filtros.unidadeId) {
        avaliacoesFiltradas = avaliacoes.filter((a: any) => 
          a.totens?.unidade_id === filtros.unidadeId
        )
      }

      const avaliacaoIds = avaliacoesFiltradas.map(a => a.id)

      // Buscar respostas
      const { data: respostas } = await supabase
        .from('respostas')
        .select('avaliacao_id, valor_nota, questao_id, questoes(texto)')
        .in('avaliacao_id', avaliacaoIds)
        .not('valor_nota', 'is', null)

      // Calcular estatísticas
      const notasValidas = (respostas || []).filter(r => r.valor_nota !== null)
      const mediaGeral = notasValidas.length > 0
        ? notasValidas.reduce((acc, r) => acc + (r.valor_nota || 0), 0) / notasValidas.length
        : 0

      // Avaliações por dia
      const porDia: Record<string, number> = {}
      avaliacoesFiltradas.forEach(a => {
        const dia = a.created_at.split('T')[0]
        porDia[dia] = (porDia[dia] || 0) + 1
      })
      const avaliacoesPorDia = Object.entries(porDia)
        .map(([data, total]) => ({ data, total }))
        .sort((a, b) => a.data.localeCompare(b.data))

      // Médias por unidade
      const porUnidade: Record<string, { notas: number[]; nome: string }> = {}
      avaliacoesFiltradas.forEach((a: any) => {
        const nomeUnidade = a.totens?.unidades?.nome || 'Sem unidade'
        if (!porUnidade[nomeUnidade]) {
          porUnidade[nomeUnidade] = { notas: [], nome: nomeUnidade }
        }
      })
      notasValidas.forEach(r => {
        const av = avaliacoesFiltradas.find(a => a.id === r.avaliacao_id) as any
        if (av) {
          const nomeUnidade = av.totens?.unidades?.nome || 'Sem unidade'
          if (porUnidade[nomeUnidade]) {
            porUnidade[nomeUnidade].notas.push(r.valor_nota || 0)
          }
        }
      })
      const mediasPorUnidade = Object.values(porUnidade).map(u => ({
        unidade: u.nome,
        media: u.notas.length > 0 ? u.notas.reduce((a, b) => a + b, 0) / u.notas.length : 0,
        total: u.notas.length
      })).sort((a, b) => b.media - a.media)

      // Distribuição de notas
      const distribuicao: Record<number, number> = {}
      for (let i = 1; i <= 10; i++) distribuicao[i] = 0
      notasValidas.forEach(r => {
        const nota = Math.round(r.valor_nota || 0)
        if (nota >= 1 && nota <= 10) {
          distribuicao[nota]++
        }
      })
      const distribuicaoNotas = Object.entries(distribuicao)
        .map(([nota, total]) => ({ nota: Number(nota), total }))

      // Top questões
      const porQuestao: Record<string, { texto: string; notas: number[] }> = {}
      notasValidas.forEach(r => {
        const texto = (r.questoes as any)?.texto || 'Questão'
        if (!porQuestao[r.questao_id]) {
          porQuestao[r.questao_id] = { texto, notas: [] }
        }
        porQuestao[r.questao_id].notas.push(r.valor_nota || 0)
      })
      const topQuestoes = Object.values(porQuestao)
        .map(q => ({
          texto: q.texto,
          media: q.notas.reduce((a, b) => a + b, 0) / q.notas.length
        }))
        .sort((a, b) => b.media - a.media)
        .slice(0, 5)

      setResumo({
        totalAvaliacoes: avaliacoesFiltradas.length,
        mediaGeral,
        avaliacoesPorDia,
        mediasPorUnidade,
        distribuicaoNotas,
        topQuestoes
      })
    } catch (err) {
      console.error('Erro ao carregar relatório:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportarCSV = () => {
    if (!resumo) return

    const linhas = [
      ['Relatório de Avaliações'],
      [`Período: ${filtros.dataInicio} a ${filtros.dataFim}`],
      [],
      ['Total de Avaliações', resumo.totalAvaliacoes.toString()],
      ['Média Geral', resumo.mediaGeral.toFixed(2)],
      [],
      ['Avaliações por Dia'],
      ['Data', 'Total'],
      ...resumo.avaliacoesPorDia.map(d => [d.data, d.total.toString()]),
      [],
      ['Médias por Unidade'],
      ['Unidade', 'Média', 'Total de Respostas'],
      ...resumo.mediasPorUnidade.map(u => [u.unidade, u.media.toFixed(2), u.total.toString()]),
      [],
      ['Distribuição de Notas'],
      ['Nota', 'Total'],
      ...resumo.distribuicaoNotas.map(d => [d.nota.toString(), d.total.toString()])
    ]

    const csvContent = linhas.map(l => l.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `relatorio_${filtros.dataInicio}_${filtros.dataFim}.csv`
    link.click()
  }

  const totensFiltered = filtros.unidadeId
    ? totens.filter(t => t.unidade_id === filtros.unidadeId)
    : totens

  const maxDia = Math.max(...(resumo?.avaliacoesPorDia.map(d => d.total) || [1]))
  const maxNota = Math.max(...(resumo?.distribuicaoNotas.map(d => d.total) || [1]))

  return (
    <div>
      <div className="page-header">
        <h1>Relatórios</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowFiltros(!showFiltros)}>
            <Filter size={18} /> Filtros
          </button>
          <button className="btn btn-primary" onClick={exportarCSV} disabled={!resumo}>
            <Download size={18} /> Exportar CSV
          </button>
        </div>
      </div>

      {showFiltros && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label><Calendar size={14} style={{ marginRight: '0.25rem' }} />Data Início</label>
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={e => setFiltros({ ...filtros, dataInicio: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label><Calendar size={14} style={{ marginRight: '0.25rem' }} />Data Fim</label>
              <input
                type="date"
                value={filtros.dataFim}
                onChange={e => setFiltros({ ...filtros, dataFim: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Unidade</label>
              <select
                value={filtros.unidadeId}
                onChange={e => setFiltros({ ...filtros, unidadeId: e.target.value, totemId: '' })}
              >
                <option value="">Todas</option>
                {unidades.map(u => (
                  <option key={u.id} value={u.id}>{u.nome}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Totem</label>
              <select
                value={filtros.totemId}
                onChange={e => setFiltros({ ...filtros, totemId: e.target.value })}
              >
                <option value="">Todos</option>
                {totensFiltered.map(t => (
                  <option key={t.id} value={t.id}>{t.codigo}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Questionário</label>
              <select
                value={filtros.questionarioId}
                onChange={e => setFiltros({ ...filtros, questionarioId: e.target.value })}
              >
                <option value="">Todos</option>
                {questionarios.map(q => (
                  <option key={q.id} value={q.id}>{q.nome}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Carregando relatório...</div>
      ) : !resumo || resumo.totalAvaliacoes === 0 ? (
        <div className="empty-state">
          <p>Nenhuma avaliação encontrada no período selecionado.</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="icon blue">
                <Users size={24} />
              </div>
              <div className="value">{resumo.totalAvaliacoes}</div>
              <div className="label">Total de Avaliações</div>
            </div>
            <div className="stat-card">
              <div className="icon green">
                <TrendingUp size={24} />
              </div>
              <div className="value">{resumo.mediaGeral.toFixed(1)}</div>
              <div className="label">Média Geral</div>
            </div>
            <div className="stat-card">
              <div className="icon yellow">
                <BarChart3 size={24} />
              </div>
              <div className="value">{resumo.avaliacoesPorDia.length}</div>
              <div className="label">Dias com Avaliações</div>
            </div>
            <div className="stat-card">
              <div className="icon red">
                <Filter size={24} />
              </div>
              <div className="value">{resumo.mediasPorUnidade.length}</div>
              <div className="label">Unidades Avaliadas</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="card">
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={18} /> Avaliações por Dia
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {resumo.avaliacoesPorDia.slice(-10).map(d => (
                  <div key={d.data} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ width: '80px', fontSize: '0.8rem', color: '#718096' }}>
                      {new Date(d.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                    <div style={{ flex: 1, background: '#e2e8f0', borderRadius: '4px', height: '20px' }}>
                      <div
                        style={{
                          width: `${(d.total / maxDia) * 100}%`,
                          background: '#4299e1',
                          borderRadius: '4px',
                          height: '100%',
                          minWidth: '20px'
                        }}
                      />
                    </div>
                    <span style={{ width: '40px', textAlign: 'right', fontWeight: 500 }}>{d.total}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} /> Distribuição de Notas
              </h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '200px' }}>
                {resumo.distribuicaoNotas.map(d => (
                  <div
                    key={d.nota}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'flex-end'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', marginBottom: '0.25rem', fontWeight: 500 }}>
                      {d.total > 0 ? d.total : ''}
                    </span>
                    <div
                      style={{
                        width: '100%',
                        background: d.nota >= 7 ? '#48bb78' : d.nota >= 4 ? '#ecc94b' : '#f56565',
                        borderRadius: '4px 4px 0 0',
                        height: `${maxNota > 0 ? (d.total / maxNota) * 150 : 0}px`,
                        minHeight: d.total > 0 ? '4px' : '0'
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#718096' }}>{d.nota}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Médias por Unidade</h3>
              {resumo.mediasPorUnidade.length === 0 ? (
                <p style={{ color: '#718096' }}>Nenhum dado disponível</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Unidade</th>
                      <th>Média</th>
                      <th>Respostas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumo.mediasPorUnidade.map((u, idx) => (
                      <tr key={idx}>
                        <td>{u.unidade}</td>
                        <td>
                          <span style={{
                            color: u.media >= 7 ? '#276749' : u.media >= 4 ? '#975a16' : '#c53030',
                            fontWeight: 600
                          }}>
                            {u.media.toFixed(1)}
                          </span>
                        </td>
                        <td>{u.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Questões com Melhor Avaliação</h3>
              {resumo.topQuestoes.length === 0 ? (
                <p style={{ color: '#718096' }}>Nenhum dado disponível</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {resumo.topQuestoes.map((q, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.75rem',
                        background: '#f7fafc',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ flex: 1, fontSize: '0.875rem' }}>
                        {q.texto.length > 50 ? q.texto.substring(0, 50) + '...' : q.texto}
                      </span>
                      <span style={{
                        fontWeight: 600,
                        color: q.media >= 7 ? '#276749' : q.media >= 4 ? '#975a16' : '#c53030',
                        marginLeft: '1rem'
                      }}>
                        {q.media.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
