import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Key } from 'lucide-react'
import { supabase } from '@municipio-totens/supabase-client'
import type { Totem } from '@municipio-totens/types'

function generateActivationKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let key = 'ATIV-'
  for (let i = 0; i < 6; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return key
}

export function Totens() {
  const [totens, setTotens] = useState<Totem[]>([])
  const [unidades, setUnidades] = useState<{id: string, nome: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showKeysModal, setShowKeysModal] = useState(false)
  const [totemKeys, setTotemKeys] = useState<{codigo: string, chave: string}[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ codigo: '', nome: '', localizacao: '', unidade_id: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [totensRes, unidadesRes] = await Promise.all([
        supabase.from('totens').select('*').order('codigo'),
        supabase.from('unidades').select('id, nome').eq('ativo', true)
      ])
      setTotens(totensRes.data || [])
      setUnidades(unidadesRes.data || [])
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
        await supabase.from('totens').update({
          codigo: form.codigo,
          nome: form.nome || null,
          localizacao: form.localizacao || null,
          unidade_id: form.unidade_id || null,
          status: 'offline'
        }).eq('id', editingId)
      } else {
        const { data } = await supabase.from('totens').insert([{
          codigo: form.codigo,
          nome: form.nome || null,
          localizacao: form.localizacao || null,
          unidade_id: form.unidade_id || null,
          status: 'offline'
        }]).select().single()
        
        if (data) {
          await supabase.from('totem_ativacoes').insert([{
            totem_id: data.id,
            chave_ativacao: generateActivationKey(),
            ativo: true
          }])
        }
      }
      setShowModal(false)
      setEditingId(null)
      setForm({ codigo: '', nome: '', localizacao: '', unidade_id: '' })
      loadData()
    } catch (err) {
      console.error('Erro ao salvar:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (t: Totem) => {
    setForm({ 
      codigo: t.codigo, 
      nome: t.nome || '', 
      localizacao: t.localizacao || '', 
      unidade_id: t.unidade_id || '' 
    })
    setEditingId(t.id)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return
    await supabase.from('totens').delete().eq('id', id)
    loadData()
  }

  const generateKeys = async () => {
    const keys: {codigo: string, chave: string}[] = []
    for (const t of totens) {
      const { data } = await supabase.from('totem_ativacoes')
        .select('chave_ativacao')
        .eq('totem_id', t.id)
        .eq('ativo', true)
        .single()
      if (data) {
        keys.push({ codigo: t.codigo, chave: data.chave_ativacao })
      } else {
        const newKey = generateActivationKey()
        await supabase.from('totem_ativacoes').insert([{
          totem_id: t.id,
          chave_ativacao: newKey,
          ativo: true
        }])
        keys.push({ codigo: t.codigo, chave: newKey })
      }
    }
    setTotemKeys(keys)
    setShowKeysModal(true)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Totens</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={generateKeys}>
            <Key size={18} /> Ver Chaves
          </button>
          <button className="btn btn-primary" onClick={() => { setShowModal(true); setEditingId(null); setForm({ codigo: '', nome: '', localizacao: '', unidade_id: '' }) }}>
            <Plus size={18} /> Novo Totem
          </button>
        </div>
      </div>

      {totens.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum totem cadastrado.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Localização</th>
                <th>Unidade</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {totens.map(t => {
                const unidade = unidades.find(u => u.id === t.unidade_id)
                return (
                  <tr key={t.id}>
                    <td><strong>{t.codigo}</strong></td>
                    <td>{t.nome || '-'}</td>
                    <td>{t.localizacao || '-'}</td>
                    <td>{unidade?.nome || '-'}</td>
                    <td>
                      <span className={`status-badge ${t.status}`}>
                        {t.status === 'online' ? 'Online' : t.status === 'manutencao' ? 'Manutenção' : 'Offline'}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(t)}>
                          <Pencil size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>
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
              <h3>{editingId ? 'Editar' : 'Novo'} Totem</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Código</label>
                  <input value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value.toUpperCase()})} required placeholder="TOTEM-001" />
                </div>
                <div className="form-group">
                  <label>Nome (opcional)</label>
                  <input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Nome de identificação" />
                </div>
                <div className="form-group">
                  <label>Localização (opcional)</label>
                  <input value={form.localizacao} onChange={e => setForm({...form, localizacao: e.target.value})} placeholder="Ex: Recepção, 1º andar" />
                </div>
                <div className="form-group">
                  <label>Unidade</label>
                  <select value={form.unidade_id} onChange={e => setForm({...form, unidade_id: e.target.value})}>
                    <option value="">Selecione...</option>
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

      {showKeysModal && (
        <div className="modal-overlay" onClick={() => setShowKeysModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chaves de Ativação</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowKeysModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {totemKeys.map(k => (
                <div key={k.codigo} style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{k.codigo}</strong>
                    <div style={{ fontSize: '0.85rem', color: '#718096' }}>{k.chave}</div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => copyToClipboard(k.chave)}>
                    Copiar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}