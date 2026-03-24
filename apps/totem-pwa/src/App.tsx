import { useState } from 'react'

export default function App() {
  const [screen, setScreen] = useState<'activation' | 'questions' | 'thanks'>('activation')

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {screen === 'activation' && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1>Totem de Avaliação</h1>
          <p>Digite o código de ativação:</p>
          <input 
            type="text" 
            placeholder="Código de ativação"
            style={{ padding: '1rem', fontSize: '1.5rem', margin: '1rem 0' }}
          />
          <br />
          <button 
            onClick={() => setScreen('questions')}
            style={{ padding: '1rem 2rem', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            Ativar
          </button>
        </div>
      )}

      {screen === 'questions' && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1>Como foi seu atendimento?</h1>
          <p>De 1 a 10:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', margin: '2rem 0' }}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <button 
                key={n}
                onClick={() => setScreen('thanks')}
                style={{ padding: '1.5rem', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {screen === 'thanks' && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1>Obrigado!</h1>
          <p>Sua avaliação é muito importante.</p>
        </div>
      )}
    </div>
  )
}