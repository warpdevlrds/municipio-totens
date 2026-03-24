import { useState, useEffect } from 'react'
import { Save, RefreshCw, Database, Shield, Bell, Palette } from 'lucide-react'
import { supabase } from '@municipio-totens/supabase-client'

interface ConfigItem {
  id: string
  chave: string
  valor: string
  descricao: string
}

interface LocalConfig {
  tempoRedirecionamento: string
  notificacoesEmail: boolean
  temaEscuro: boolean
  limiteAvaliacoesPorDia: string
  tempoExpiracaoChave: string
  backupAutomatico: boolean
}

const DEFAULT_CONFIG: LocalConfig = {
  tempoRedirecionamento: '5',
  notificacoesEmail: true,
  temaEscuro: false,
  limiteAvaliacoesPorDia: '100',
  tempoExpiracaoChave: '30',
  backupAutomatico: true
}

const CONFIG_DESCRIPTIONS = {
  tempo_redirecionamento: 'Tempo na tela de agradecimento antes do retorno automatico.',
  notificacoes_email: 'Habilita alertas por email sobre totens e relatorios.',
  tema_escuro: 'Ativa o tema escuro nos totens.',
  limite_avaliacoes_por_dia: 'Limite maximo de avaliacoes registradas por totem ao dia.',
  tempo_expiracao_chave: 'Quantidade de dias ate a chave de ativacao expirar.',
  backup_automatico: 'Indica se a exportacao automatica dos dados esta ativa.'
} as const

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback
  }

  return value === 'true'
}

function readStoredConfig(): LocalConfig | null {
  const saved = localStorage.getItem('admin_config')

  if (!saved) {
    return null
  }

  try {
    return JSON.parse(saved) as LocalConfig
  } catch {
    return null
  }
}

function mapConfigsToLocalConfig(configs: ConfigItem[]): LocalConfig {
  const configMap = new Map(configs.map((config) => [config.chave, config.valor]))

  return {
    tempoRedirecionamento: configMap.get('tempo_redirecionamento') || DEFAULT_CONFIG.tempoRedirecionamento,
    notificacoesEmail: parseBoolean(configMap.get('notificacoes_email'), DEFAULT_CONFIG.notificacoesEmail),
    temaEscuro: parseBoolean(configMap.get('tema_escuro'), DEFAULT_CONFIG.temaEscuro),
    limiteAvaliacoesPorDia: configMap.get('limite_avaliacoes_por_dia') || DEFAULT_CONFIG.limiteAvaliacoesPorDia,
    tempoExpiracaoChave: configMap.get('tempo_expiracao_chave') || DEFAULT_CONFIG.tempoExpiracaoChave,
    backupAutomatico: parseBoolean(configMap.get('backup_automatico'), DEFAULT_CONFIG.backupAutomatico)
  }
}

export function Configuracoes() {
  const [configs, setConfigs] = useState<ConfigItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [localConfig, setLocalConfig] = useState<LocalConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    loadConfigs()
  }, [])

  const loadConfigs = async () => {
    try {
      // Tentar carregar do Supabase se houver tabela de configs
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
      
      if (!error && data) {
        setConfigs(data)
        if (data.length > 0) {
          setLocalConfig(mapConfigsToLocalConfig(data))
          return
        }
      }
    } catch (err) {
      // Silenciosamente falhar - tabela pode nao existir
    } finally {
      const storedConfig = readStoredConfig()
      if (storedConfig) {
        setLocalConfig(storedConfig)
      }
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const rows = [
        {
          id: configs.find((config) => config.chave === 'tempo_redirecionamento')?.id,
          chave: 'tempo_redirecionamento',
          valor: localConfig.tempoRedirecionamento,
          descricao: CONFIG_DESCRIPTIONS.tempo_redirecionamento
        },
        {
          id: configs.find((config) => config.chave === 'notificacoes_email')?.id,
          chave: 'notificacoes_email',
          valor: String(localConfig.notificacoesEmail),
          descricao: CONFIG_DESCRIPTIONS.notificacoes_email
        },
        {
          id: configs.find((config) => config.chave === 'tema_escuro')?.id,
          chave: 'tema_escuro',
          valor: String(localConfig.temaEscuro),
          descricao: CONFIG_DESCRIPTIONS.tema_escuro
        },
        {
          id: configs.find((config) => config.chave === 'limite_avaliacoes_por_dia')?.id,
          chave: 'limite_avaliacoes_por_dia',
          valor: localConfig.limiteAvaliacoesPorDia,
          descricao: CONFIG_DESCRIPTIONS.limite_avaliacoes_por_dia
        },
        {
          id: configs.find((config) => config.chave === 'tempo_expiracao_chave')?.id,
          chave: 'tempo_expiracao_chave',
          valor: localConfig.tempoExpiracaoChave,
          descricao: CONFIG_DESCRIPTIONS.tempo_expiracao_chave
        },
        {
          id: configs.find((config) => config.chave === 'backup_automatico')?.id,
          chave: 'backup_automatico',
          valor: String(localConfig.backupAutomatico),
          descricao: CONFIG_DESCRIPTIONS.backup_automatico
        }
      ]

      const { data, error } = await supabase
        .from('configuracoes')
        .upsert(rows, { onConflict: 'chave' })
        .select('*')

      localStorage.setItem('admin_config', JSON.stringify(localConfig))

      if (!error && data) {
        setConfigs(data)
      }

      setMessage({
        type: 'success',
        text: error ? 'Configuracoes salvas localmente.' : 'Configuracoes salvas com sucesso!'
      })
      setTimeout(() => setMessage(null), 3000)
    } catch {
      setMessage({ type: 'error', text: 'Erro ao salvar configuracoes' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading">Carregando...</div>
  }

  return (
    <div>
      <div className="page-header">
        <h1>Configuracoes</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <RefreshCw size={18} className="spinning" /> : <Save size={18} />}
          {saving ? 'Salvando...' : 'Salvar Alteracoes'}
        </button>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`} style={{ marginBottom: '1.5rem' }}>
          {message.text}
        </div>
      )}

      <div className="config-grid">
        <div className="card">
          <div className="card-header">
            <Shield size={20} />
            <h3>Seguranca</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label>Tempo de Expiracao de Chave (dias)</label>
              <input
                type="number"
                value={localConfig.tempoExpiracaoChave}
                onChange={(e) => setLocalConfig({ ...localConfig, tempoExpiracaoChave: e.target.value })}
                min="1"
                max="365"
              />
              <span className="form-help">Tempo ate a chave de ativacao expirar</span>
            </div>
            <div className="form-group">
              <label>Limite de Avaliacoes por Dia</label>
              <input
                type="number"
                value={localConfig.limiteAvaliacoesPorDia}
                onChange={(e) => setLocalConfig({ ...localConfig, limiteAvaliacoesPorDia: e.target.value })}
                min="10"
                max="10000"
              />
              <span className="form-help">Maximo de avaliacoes por totem por dia</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <Bell size={20} />
            <h3>Notificacoes</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={localConfig.notificacoesEmail}
                  onChange={(e) => setLocalConfig({ ...localConfig, notificacoesEmail: e.target.checked })}
                />
                <span>Receber notificacoes por email</span>
              </label>
              <span className="form-help">Alertas sobre totens offline e relatorios</span>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={localConfig.backupAutomatico}
                  onChange={(e) => setLocalConfig({ ...localConfig, backupAutomatico: e.target.checked })}
                />
                <span>Backup automatico diario</span>
              </label>
              <span className="form-help">Exportar dados automaticamente</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <Palette size={20} />
            <h3>Interface do Totem</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label>Tempo de Redirecionamento (segundos)</label>
              <input
                type="number"
                value={localConfig.tempoRedirecionamento}
                onChange={(e) => setLocalConfig({ ...localConfig, tempoRedirecionamento: e.target.value })}
                min="3"
                max="30"
              />
              <span className="form-help">Tempo na tela de agradecimento antes de voltar</span>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={localConfig.temaEscuro}
                  onChange={(e) => setLocalConfig({ ...localConfig, temaEscuro: e.target.checked })}
                />
                <span>Tema escuro nos totens</span>
              </label>
              <span className="form-help">Usar cores escuras na interface do totem</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <Database size={20} />
            <h3>Dados</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label>Acoes de Manutencao</label>
              <div className="button-group">
                <button className="btn btn-secondary" onClick={() => window.location.reload()}>
                  <RefreshCw size={16} />
                  Recarregar Dados
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Informacoes do Sistema</label>
              <div className="info-list">
                <div className="info-item">
                  <span>Versao:</span>
                  <strong>1.0.0</strong>
                </div>
                <div className="info-item">
                  <span>Ambiente:</span>
                  <strong>{import.meta.env.MODE}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
