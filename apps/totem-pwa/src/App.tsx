import { useState, useEffect } from 'react'
import { useTotem } from './hooks/useTotem'
import { useSyncManager } from './hooks/useSyncManager'
import { ActivationScreen } from './screens/ActivationScreen'
import { HomeScreen } from './screens/HomeScreen'
import { EvaluationScreen } from './screens/EvaluationScreen'
import { ThanksScreen } from './screens/ThanksScreen'
import type { Questionario } from '@municipio-totens/types'
import './index.css'

type Screen = 'activation' | 'home' | 'evaluation' | 'thanks'

export default function App() {
  const [screen, setScreen] = useState<Screen>('activation')
  const [selectedQuestionario, setSelectedQuestionario] = useState<Questionario | null>(null)
  
  const {
    totemId,
    totemCode,
    isActivated,
    isActivating,
    error,
    questionarios,
    activate
  } = useTotem()

  const {
    isOnline,
    pendingCount
  } = useSyncManager(isActivated ? totemId : null)

  useEffect(() => {
    if (isActivated) {
      setScreen('home')
    }
  }, [isActivated])

  const handleActivate = async (codigoTotem: string, chaveAtivacao: string): Promise<boolean> => {
    const success = await activate(codigoTotem, chaveAtivacao)
    if (success) {
      setScreen('home')
    }
    return success
  }

  const handleSelectQuestionario = (questionario: Questionario) => {
    setSelectedQuestionario(questionario)
    setScreen('evaluation')
  }

  const handleEvaluationComplete = () => {
    setSelectedQuestionario(null)
    setScreen('thanks')
    setTimeout(() => setScreen('home'), 5000)
  }

  const handleBackToHome = () => {
    setSelectedQuestionario(null)
    setScreen('home')
  }

  if (!isActivated) {
    return (
      <ActivationScreen
        onActivate={handleActivate}
        isLoading={isActivating}
        error={error}
      />
    )
  }

  return (
    <div className="app-container">
      {screen === 'home' && (
        <HomeScreen
          totemCode={totemCode}
          questionarios={questionarios}
          onSelectQuestionario={handleSelectQuestionario}
          isOnline={isOnline}
          pendingCount={pendingCount}
        />
      )}

      {screen === 'evaluation' && selectedQuestionario && (
        <EvaluationScreen
          questionario={selectedQuestionario}
          onComplete={handleEvaluationComplete}
          onBack={handleBackToHome}
        />
      )}

      {screen === 'thanks' && (
        <ThanksScreen />
      )}
    </div>
  )
}