import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { supabase } from '@municipio-totens/supabase-client'
import type { Unidade } from '@municipio-totens/types'

export function Unidades() {
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ nome: '', municipio: '', estado: 'SP', cnpj: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadUnidades()
  }, [])

  const loadUnidades = async () => {
    try {
      const { data } = await supabase.from('unidades').select('*').order('nome')
      setUnidades(data || [])
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
        await supabase.from('unidades').update({
          nome: form.nome,
          municipio: form.municipio,
          estado: form.estado,
          cnpj: form.cnpj || null
        }).eq('id', editingId)
      } else {
        await supabase.from('unidades').insert([{
          nome: form.nome,
          municipio: form.municipio,
          estado: form.estado,
          cnpj: form.cnpj || null,
          ativo: true
        }])
      }
      setShowModal(false)
      setEditingId(null)
      setForm({ nome: '', municipio: '', estado: 'SP', cnpj: '' })
      loadUnidades()
    } catch (err) {
      console.error('Erro ao salvar:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (u: Unidade) => {
    setForm({ nome: u.nome, municipio: u.municipio, estado: u.estado, cnpj: u.cnpj || '' })
    setEditingId(u.id)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return
    await supabase.from('unidades').delete().eq('id', id)
    loadUnidades()
  }

  const toggleAtivo = async (u: Unidade) => {
    await supabase.from('unidades').update({ ativo: !u.ativo }).eq('id', u.id)
    loadUnidades()
  }

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Unidades</h1>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setEditingId(null); setForm({ nome: '', municipio: '', estado: 'SP', cnpj: '' }) }}>
          <Plus size={18} /> Nova Unidade
        </button>
      </div>

      {unidades.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma unidade cadastrada.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Município</th>
                <th>Estado</th>
                <th>CNPJ</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {unidades.map(u => (
                <tr key={u.id}>
                  <td>{u.nome}</td>
                  <td>{u.municipio}</td>
                  <td>{u.estado}</td>
                  <td>{u.cnpj || '-'}</td>
                  <td>
                    <span 
                      className={`status-badge ${u.ativo ? 'active' : 'inactive'}`}
                      onClick={() => toggleAtivo(u)}
                      style={{ cursor: 'pointer' }}
                    >
                      {u.ativo ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(u)}>
                        <Pencil size={14} />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>
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
              <h3>{editingId ? 'Editar' : 'Nova'} Unidade</h3>
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
                <div className="form-row">
                  <div className="form-group">
                    <label>Município</label>
                    <input value={form.municipio} onChange={e => setForm({...form, municipio: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Estado</label>
                    <select value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                      <option value="SP">SP</option>
                      <option value="RJ">RJ</option>
                      <option value="MG">MG</option>
                      <option value="RS">RS</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>CNPJ (opcional)</label>
                  <input value={form.cnpj} onChange={e => setForm({...form, cnpj: e.target.value})} placeholder="00.000.000/0001-00" />
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