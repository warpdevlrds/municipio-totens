import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogIn, AlertCircle, Building2 } from 'lucide-react'

export function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signIn(email, password)
    
    if (result.error) {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <Building2 size={32} />
          </div>
          <h1>Painel Administrativo</h1>
          <p>Sistema de Totens de Avaliacao Municipal</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@municipio.gov.br"
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? (
              <span>Entrando...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Entrar</span>
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Acesso restrito a administradores</p>
        </div>
      </div>
    </div>
  )
}
