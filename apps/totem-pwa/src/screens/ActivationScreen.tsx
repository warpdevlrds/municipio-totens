import { useState } from 'react'

interface Props {
  onActivate: (codigoTotem: string, chaveAtivacao: string) => Promise<boolean>
  isLoading: boolean
  error: string | null
}

export function ActivationScreen({ onActivate, isLoading, error }: Props) {
  const [codigoTotem, setCodigoTotem] = useState('')
  const [chaveAtivacao, setChaveAtivacao] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (codigoTotem.trim() && chaveAtivacao.trim()) {
      await onActivate(codigoTotem.trim(), chaveAtivacao.trim())
    }
  }

  const isValid = codigoTotem.trim() && chaveAtivacao.trim()

  return (
    <div className="screen activation-screen">
      <div className="activation-container">
        <div className="logo">
          <div className="logo-icon">🏛️</div>
          <h1>Avaliação de Atendimento</h1>
        </div>

        <form onSubmit={handleSubmit} className="activation-form">
          <div className="form-group">
            <label htmlFor="codigoTotem">Código do Totem</label>
            <input
              id="codigoTotem"
              type="text"
              value={codigoTotem}
              onChange={(e) => setCodigoTotem(e.target.value)}
              placeholder="Ex: TOTEM-001"
              autoComplete="off"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="chaveAtivacao">Chave de Ativação</label>
            <input
              id="chaveAtivacao"
              type="password"
              value={chaveAtivacao}
              onChange={(e) => setChaveAtivacao(e.target.value)}
              placeholder="Digite a chave"
              autoComplete="off"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary btn-large"
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <span className="loading-text">Ativando...</span>
            ) : (
              'Ativar Totem'
            )}
          </button>
        </form>

        <p className="help-text">
          Entre em contato com o administrador caso precise de assistance.
        </p>
      </div>
    </div>
  )
}
