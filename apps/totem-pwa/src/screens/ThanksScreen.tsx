import { useEffect, useState } from 'react'

export function ThanksScreen() {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.')
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="screen thanks-screen">
      <div className="thanks-content">
        <div className="check-icon">✓</div>
        <h1>Obrigado!</h1>
        <p>Sua avaliação foi registrada com sucesso.</p>
        <p className="sub-text">Você pode fazer uma nova avaliação a qualquer momento.{dots}</p>
      </div>
    </div>
  )
}