import { useState, useEffect } from 'react'
import type { Questionario, Questao } from '@municipio-totens/types'
import { saveEvaluation, getSetting, getCachedQuestionarios } from '@municipio-totens/offline-sync'
import { supabase } from '@municipio-totens/supabase-client'

interface Props {
  questionario: Questionario
  onComplete: () => void
  onBack: () => void
}

export function EvaluationScreen({ questionario, onComplete, onBack }: Props) {
  type QuestaoRespondida = {
    questao_id: string
    valor_nota?: number
    valor_texto?: string
  }

  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [respostas, setRespostas] = useState<QuestaoRespondida[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadQuestoes()
  }, [questionario.id])

  const loadQuestoes = async () => {
    try {
      const cached = await getCachedQuestionarios()
      const cachedQ = cached.find(q => q.id === questionario.id)
      
      if (cachedQ && cachedQ.questoes && cachedQ.questoes.length > 0) {
        setQuestoes(cachedQ.questoes)
        return
      }

      const { data } = await supabase
        .from('questoes')
        .select('*')
        .eq('questionario_id', questionario.id)
        .order('ordem')

      if (data) {
        setQuestoes(data)
      }
    } catch (err) {
      console.error('Erro ao carregar questões:', err)
    }
  }

  const currentQuestao = questoes[currentIndex]
  const isLastQuestion = currentIndex === questoes.length - 1

  const handleAnswer = (answer: QuestaoRespondida) => {
    const newRespostas = [...respostas]
    const existingIndex = newRespostas.findIndex(r => r.questao_id === answer.questao_id)
    
    if (existingIndex >= 0) {
      newRespostas[existingIndex] = answer
    } else {
      newRespostas.push(answer)
    }
    
    setRespostas(newRespostas)
  }

  const handleNext = () => {
    if (!currentQuestao) return
    
    const currentAnswer = respostas.find(r => r.questao_id === currentQuestao.id)
    if (!currentAnswer && currentQuestao.obrigatoria) {
      setError('Por favor, responda esta questão antes de continuar.')
      return
    }
    
    setError(null)
    if (isLastQuestion) {
      handleSubmit()
    } else {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleBack = () => {
    if (currentIndex === 0) {
      onBack()
    } else {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const totemId = await getSetting<string>('totem_id')
      if (!totemId) {
        setError('Erro: totem não identificado')
        setIsSubmitting(false)
        return
      }

      const respostasFormatadas = respostas.map(r => ({
        questao_id: r.questao_id,
        valor_nota: r.valor_nota,
        valor_texto: r.valor_texto
      }))

      await saveEvaluation(totemId, questionario.id, respostasFormatadas)
      onComplete()
    } catch (err) {
      setError('Erro ao salvar avaliação. Tente novamente.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderInput = (questao: Questao) => {
    const currentAnswer = respostas.find(r => r.questao_id === questao.id)
    
    switch (questao.tipo) {
      case 'nota':
        return (
          <div className="rating-input">
            <div className="rating-buttons">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <button
                  key={n}
                  type="button"
                  className={`rating-btn ${currentAnswer?.valor_nota === n ? 'selected' : ''}`}
                  onClick={() => handleAnswer({ questao_id: questao.id, valor_nota: n })}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="rating-labels">
              <span>Péssimo</span>
              <span>Ótimo</span>
            </div>
          </div>
        )

      case 'escolha_unica':
        return (
          <div className="choice-input">
            {questao.opcoes?.map((opcao: string, idx: number) => (
              <button
                key={idx}
                type="button"
                className={`choice-btn ${currentAnswer?.valor_nota === idx + 1 ? 'selected' : ''}`}
                onClick={() => handleAnswer({ questao_id: questao.id, valor_nota: idx + 1 })}
              >
                {opcao}
              </button>
            ))}
          </div>
        )

      case 'texto_livre':
        return (
          <textarea
            className="text-input"
            placeholder="Digite seu comentário..."
            value={currentAnswer?.valor_texto || ''}
            onChange={(e) => handleAnswer({ questao_id: questao.id, valor_texto: e.target.value })}
            rows={4}
          />
        )

      default:
        return null
    }
  }

  if (questoes.length === 0) {
    return (
      <div className="screen evaluation-screen">
        <div className="loading">Carregando questões...</div>
      </div>
    )
  }

  return (
    <div className="screen evaluation-screen">
      <header className="header">
        <button className="back-btn" onClick={handleBack}>
          ← Voltar
        </button>
        <div className="progress-info">
          {questionario.nome}
        </div>
        <div className="question-counter">
          {currentIndex + 1} / {questoes.length}
        </div>
      </header>

      <main className="main-content">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentIndex + 1) / questoes.length) * 100}%` }}
          />
        </div>

        {currentQuestao && (
          <div className="question-container">
            <h2 className="question-text">{currentQuestao.texto}</h2>
            {currentQuestao.obrigatoria && (
              <span className="required-mark">*</span>
            )}
            {renderInput(currentQuestao)}
          </div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}
      </main>

      <footer className="footer">
        <button 
          className="btn-primary btn-large"
          onClick={handleNext}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            'Enviando...'
          ) : isLastQuestion ? (
            'Finalizar'
          ) : (
            'Próxima'
          )}
        </button>
      </footer>
    </div>
  )
}