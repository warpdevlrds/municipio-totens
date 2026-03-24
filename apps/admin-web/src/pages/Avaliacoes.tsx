import { useState, useEffect } from 'react'
import { supabase } from '@municipio-totens/supabase-client'

interface AvaliacaoCompleta {
  id: string
  totem_codigo: string
  questionario_nome: string
  status: string
  created_at: string
  respostas: { questao_texto: string; valor_nota?: number; valor_texto?: string }[]
}

export function Avaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoCompleta[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<AvaliacaoCompleta | null>(null)
  const [filtro, setFiltro] = useState('')

  useEffect(() => {
    loadAvaliacoes()
  }, [])

  const loadAvaliacoes = async () => {
    try {
      const { data: avaliacoesData } = await supabase
        .from('avaliacoes')
        .select('id, status, created_at, totems(codigo), questionarios(nome)')
        .order('created_at', { ascending: false })
        .limit(100)

      if (!avaliacoesData) return

      const formatted: AvaliacaoCompleta[] = []
      
      for (const a of avaliacoesData) {
        const { data: respostas } = await supabase
          .from('respostas')
          .select('valor_nota, valor_texto, questoes(texto)')
          .eq('avaliacao_id', a.id)

        formatted.push({
          id: a.id,
          totem_codigo: (a.totems as any)?.codigo || '-',
          questionario_nome: (a.questionarios as any)?.nome || '-',
          status: a.status,
          created_at: a.created_at,
          respostas: (respostas || []).map(r => ({
            questao_texto: (r.questoes as any)?.texto || '',
            valor_nota: r.valor_nota,
            valor_texto: r.valor_texto
          }))
        })
      }

      setAvaliacoes(formatted)
    } catch (err) {
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = filtro 
    ? avaliacoes.filter(a => 
        a.totem_codigo.toLowerCase().includes(filtro.toLowerCase()) ||
        a.questionario_nome.toLowerCase().includes(filtro.toLowerCase())
      )
    : avaliacoes

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR')
  }

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Avaliações</h1>
      </div>

      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Buscar por totem ou questionário..." 
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma avaliação encontrada.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Totem</th>
                <th>Questionário</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id}>
                  <td>{a.totem_codigo}</td>
                  <td>{a.questionario_nome}</td>
                  <td>{formatDate(a.created_at)}</td>
                  <td>
                    <span className={`status-badge ${a.status}`}>
                      {a.status === 'pendente' ? 'Pendente' : a.status === 'processada' ? 'Processada' : 'Erro'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelected(a)}>
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Detalhes da Avaliação</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1rem' }}>
                <strong>Totem:</strong> {selected.totem_codigo}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Questionário:</strong> {selected.questionario_nome}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Data:</strong> {formatDate(selected.created_at)}
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <strong>Status:</strong> {selected.status}
              </div>
              <h4 style={{ marginBottom: '0.75rem' }}>Respostas</h4>
              {selected.respostas.map((r, idx) => (
                <div key={idx} style={{ padding: '0.75rem', background: '#f7fafc', borderRadius: '8px', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{r.questao_texto}</div>
                  {r.valor_nota && <div style={{ color: '#2b6cb0' }}>Nota: {r.valor_nota}/10</div>}
                  {r.valor_texto && <div style={{ color: '#4a5568' }}>"{r.valor_texto}"</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}