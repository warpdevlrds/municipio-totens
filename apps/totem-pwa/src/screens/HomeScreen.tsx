import type { Questionario } from '@municipio-totens/types'

interface Props {
  totemCode: string | null
  questionarios: Questionario[]
  onSelectQuestionario: (questionario: Questionario) => void
  isOnline: boolean
  pendingCount: number
}

export function HomeScreen({ totemCode, questionarios, onSelectQuestionario, isOnline, pendingCount }: Props) {
  const activeQuestionarios = questionarios.filter(q => q.ativo)

  return (
    <div className="screen home-screen">
      <header className="header">
        <div className="totem-info">
          <span className="totem-badge">Totem {totemCode}</span>
          <span className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </span>
        </div>
        {pendingCount > 0 && (
          <span className="pending-badge">{pendingCount} pendente(s)</span>
        )}
      </header>

      <main className="main-content">
        <h2>Como foi seu atendimento?</h2>
        <p className="subtitle">Selecione abaixo para avaliar</p>

        <div className="questionario-list">
          {activeQuestionarios.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum questionário disponível no momento.</p>
              <p className="small">Aguarde alguns instantes ou contate o administrador.</p>
            </div>
          ) : (
            activeQuestionarios.map((questionario) => (
              <button
                key={questionario.id}
                className="questionario-card"
                onClick={() => onSelectQuestionario(questionario)}
              >
                <div className="questionario-icon">📋</div>
                <div className="questionario-info">
                  <h3>{questionario.nome}</h3>
                  {questionario.descricao && (
                    <p>{questionario.descricao}</p>
                  )}
                </div>
                <div className="questionario-arrow">→</div>
              </button>
            ))
          )}
        </div>
      </main>

      <footer className="footer">
        <p>Avaliação anônima • Sua opinião é importante</p>
      </footer>
    </div>
  )
}
