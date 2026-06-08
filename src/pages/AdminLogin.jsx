import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import '../styles/dashboard.css'

function AdminLogin() {
  const [email, setEmail] = useState('admin@miniera.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  async function handleLogin(event) {
    event.preventDefault()

    setError('')
    setIsLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password,
    })

    setIsLoading(false)

    if (error || !data.user) {
      setError('Nesprávny e-mail alebo heslo. Skús znova.')
      return
    }

    localStorage.setItem('miniEraAdminLoggedIn', 'true')
    navigate('/admin')
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
  <button
    type="button"
    className="admin-login-back-btn"
    onClick={() => navigate('/profile')}
  >
    ← Späť do aplikácie
  </button>

  <p className="mini-label">MINIERA ADMIN</p>

        <h1>Admin prihlásenie</h1>

        <p className="admin-login-text">
          Prihlás sa ako organizátor a spravuj aktivity, účastníkov a informácie
          Mini Erasmus programu.
        </p>

        <form onSubmit={handleLogin}>
          <label>Admin e-mail</label>

          <input
            type="email"
            placeholder="admin@miniera.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label>Admin heslo</label>

          <input
            type="password"
            placeholder="Zadaj admin heslo"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error && <p className="admin-login-error">{error}</p>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Prihlasujem...' : 'Prihlásiť sa ako admin'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin