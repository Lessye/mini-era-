import '../styles/dashboard.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginParticipantByEmail } from '../utils/participantLoginStorage'

function ParticipantLogin() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogin(event) {
    event.preventDefault()

    setErrorMessage('')
    setIsLoading(true)

    const result = await loginParticipantByEmail(email)

    setIsLoading(false)

    if (!result.success) {
      setErrorMessage('Tento e-mail nie je registrovaný pre MiniEra platformu.')
      return
    }

    navigate('/')
  }

  return (
    <div className="participant-login-page">
      <div className="participant-login-card">
        <p className="mini-label-login">MINIERA</p>

        <h1>Vitaj v MiniEra</h1>

        <p className="participant-login-text">
          Zadaj e-mailovú adresu použitú pri registrácii na Mini Erasmus.
          Prístup do platformy majú iba účastníci pridaní organizátorom.
        </p>

        <form onSubmit={handleLogin}>
          <label>E-mailová adresa</label>

          <input
            type="email"
            placeholder="tvoj@email.sk"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          {errorMessage && (
            <p className="participant-login-error">
              {errorMessage}
            </p>
          )}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Overujem...' : 'Prihlásiť sa'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ParticipantLogin