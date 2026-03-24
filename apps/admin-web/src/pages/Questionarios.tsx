import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, List } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@municipio-totens/supabase-client'
import type { Questionario } from '@municipio-totens/types'

export function Questionarios() {
  const [questionarios, setQuestionarios] = useState<Questionario[]>([])
  const [unidades, setUnidades] = useState<{id: string, nome: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ nome: '', descricao: '', unidade_id: '' })
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [qRes, uRes] = await Promise.all([
        supabase.from('questionarios').select('*').order('nome'),
        supabase.from('unidades').select('id, nome').eq('ativo', true)
      ])
      setQuestionarios(qRes.data || [])
      setUnidades(uRes.data || [])
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
      if (editingId) {
        await supabase.from('questionarios').update({
          nome: form.nome,
          descricao: form.descricao || null,
          unidade_id: form.unidade_id || null
        }).eq('id', editingId)
      } else {
        await supabase.from('questionarios').insert([{
          nome: form.nome,
          descricao: form.descricao || null,
          unidade_id: form.unidade_id || null,
          ativo: true,
          versao: 1
        }])
      }
      setShowModal(false)
      setEditingId(null)
      setForm({ nome: '', descricao: '', unidade_id: '' })
      loadData()
    } catch (err) {
      console.error('Erro ao salvar:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (q: Questionario) => {
    setForm({ nome: q.nome, descricao: q.descricao || '', unidade_id: q.unidade_id || '' })
    setEditingId(q.id)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return
    await supabase.from('questionarios').delete().eq('id', id)
    loadData()
  }

  const toggleAtivo = async (q: Questionario) => {
    await supabase.from('questionarios').update({ ativo: !q.ativo }).eq('id', q.id)
    loadData()
  }

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Questionários</h1>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setEditingId(null); setForm({ nome: '', descricao: '', unidade_id: '' }) }}>
          <Plus size={18} /> Novo Questionário
        </button>
      </div>

      {questionarios.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum questionário cadastrado.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Unidade</th>
                <th>Versão</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {questionarios.map(q => {
                const unidade = unidades.find(u => u.id === q.unidade_id)
                return (
                  <tr key={q.id}>
                    <td><strong>{q.nome}</strong></td>
                    <td>{q.descricao || '-'}</td>
                    <td>{unidade?.nome || '-'}</td>
                    <td>v{q.versao}</td>
                    <td>
                      <span 
                        className={`status-badge ${q.ativo ? 'active' : 'inactive'}`}
                        onClick={() => toggleAtivo(q)}
                        style={{ cursor: 'pointer' }}
                      >
                        {q.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/questionarios/${q.id}/questoes`)} title="Gerenciar questões">
                          <List size={14} />
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(q)}>
                          <Pencil size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(q.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Editar' : 'Novo'} Questionário</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome</label>
                  <input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Descrição (opcional)</label>
                  <textarea value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} rows={3} />
                </div>
                <div className="form-group">
                  <label>Unidade</label>
                  <select value={form.unidade_id} onChange={e => setForm({...form, unidade_id: e.target.value})}>
                    <option value="">Todas as unidades</option>
                    {unidades.map(u => (
                      <option key={u.id} value={u.id}>{u.nome}</option>
                    ))}
                  </select>
                </div>
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