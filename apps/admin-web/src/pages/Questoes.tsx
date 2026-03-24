import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, X, ArrowLeft } from 'lucide-react'
import { supabase } from '@municipio-totens/supabase-client'
import type { Questao } from '@municipio-totens/types'

export function Questoes() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [questionarioNome, setQuestionarioNome] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ texto: '', tipo: 'nota', obrigatoria: true, opcoes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (id) loadData()
  }, [id])

  const loadData = async () => {
    try {
      const [qRes, questoesRes] = await Promise.all([
        supabase.from('questionarios').select('nome').eq('id', id).single(),
        supabase.from('questoes').select('*').eq('questionario_id', id).order('ordem')
      ])
      setQuestionarioNome(qRes.data?.nome || '')
      setQuestoes(questoesRes.data || [])
    } catch (err) {
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const opcoes = form.tipo !== 'nota' && form.opcoes 
        ? form.opcoes.split(',').map(o => o.trim()).filter(o => o)
        : null

      if (editingId) {
        await supabase.from('questoes').update({
          texto: form.texto,
          tipo: form.tipo as 'nota' | 'escolha_unica' | 'escolha_multipla' | 'texto_livre',
          obrigatoria: form.obrigatoria,
          opcoes: opcoes as any
        }).eq('id', editingId)
      } else {
        const maxOrdem = questoes.length > 0 ? Math.max(...questoes.map(q => q.ordem)) : 0
        await supabase.from('questoes').insert([{
          questionario_id: id,
          texto: form.texto,
          tipo: form.tipo as 'nota' | 'escolha_unica' | 'escolha_multipla' | 'texto_livre',
          obrigatoria: form.obrigatoria,
          ordem: maxOrdem + 1,
          opcoes: opcoes as any
        }])
      }
      setShowModal(false)
      setEditingId(null)
      setForm({ texto: '', tipo: 'nota', obrigatoria: true, opcoes: '' })
      loadData()
    } catch (err) {
      console.error('Erro ao salvar:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (q: Questao) => {
    setForm({ 
      texto: q.texto, 
      tipo: q.tipo, 
      obrigatoria: q.obrigatoria, 
      opcoes: q.opcoes?.join(', ') || '' 
    })
    setEditingId(q.id)
    setShowModal(true)
  }

  const handleDelete = async (qid: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return
    await supabase.from('questoes').delete().eq('id', qid)
    loadData()
  }

  const moveUp = async (q: Questao, idx: number) => {
    if (idx === 0) return
    const prev = questoes[idx - 1]
    await Promise.all([
      supabase.from('questoes').update({ ordem: q.ordem }).eq('id', prev.id),
      supabase.from('questoes').update({ ordem: prev.ordem }).eq('id', q.id)
    ])
    loadData()
  }

  const moveDown = async (q: Questao, idx: number) => {
    if (idx === questoes.length - 1) return
    const next = questoes[idx + 1]
    await Promise.all([
      supabase.from('questoes').update({ ordem: q.ordem }).eq('id', next.id),
      supabase.from('questoes').update({ ordem: next.ordem }).eq('id', q.id)
    ])
    loadData()
  }

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/questionarios')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>Questões</h1>
            <span style={{ color: '#718096' }}>{questionarioNome}</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setEditingId(null); setForm({ texto: '', tipo: 'nota', obrigatoria: true, opcoes: '' }) }}>
          <Plus size={18} /> Nova Questão
        </button>
      </div>

      {questoes.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma questão cadastrada.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Ordem</th>
                <th>Texto</th>
                <th>Tipo</th>
                <th>Obrigatória</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {questoes.map((q, idx) => (
                <tr key={q.id}>
                  <td>
                    <div className="actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => moveUp(q, idx)} disabled={idx === 0}>↑</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => moveDown(q, idx)} disabled={idx === questoes.length - 1}>↓</button>
                    </div>
                  </td>
                  <td>{q.texto}</td>
                  <td>
                    {q.tipo === 'nota' ? 'Nota (1-10)' : 
                     q.tipo === 'escolha_unica' ? 'Escolha única' :
                     q.tipo === 'escolha_multipla' ? 'Múltipla escolha' : 'Texto livre'}
                  </td>
                  <td>{q.obrigatoria ? 'Sim' : 'Não'}</td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(q)}>
                        <Pencil size={14} />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(q.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Editar' : 'Nova'} Questão</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Texto da Questão</label>
                  <input value={form.texto} onChange={e => setForm({...form, texto: e.target.value})} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo</label>
                    <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
                      <option value="nota">Nota (1-10)</option>
                      <option value="escolha_unica">Escolha única</option>
                      <option value="texto_livre">Texto livre</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Obrigatória</label>
                    <select value={form.obrigatoria ? 'true' : 'false'} onChange={e => setForm({...form, obrigatoria: e.target.value === 'true'})}>
                      <option value="true">Sim</option>
                      <option value="false">Não</option>
                    </select>
                  </div>
                </div>
                {(form.tipo === 'escolha_unica' || form.tipo === 'escolha_multipla') && (
                  <div className="form-group">
                    <label>Opções (separadas por vírgula)</label>
                    <input value={form.opcoes} onChange={e => setForm({...form, opcoes: e.target.value})} placeholder="Ótimo, Bom, Regular, Ruim" />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}