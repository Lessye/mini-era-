import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/dashboard.css'

function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleLogin(event) {
    event.preventDefault()

    if (password === 'miniera2026') {
      localStorage.setItem('miniEraAdminLoggedIn', 'true')
      navigate('/admin')
    } else {
      setError('Nesprávne heslo. Skús znova.')
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <p className="mini-label">MINIERA ADMIN</p>

        <h1>Admin prihlásenie</h1>

        <p className="admin-login-text">
          Prihlás sa ako organizátor a spravuj aktivity Mini Erasmus programu.
        </p>

        <form onSubmit={handleLogin}>
          <label>Admin heslo</label>

          <input
            type="password"
            placeholder="Zadaj admin heslo"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error && <p className="admin-login-error">{error}</p>}

          <button type="submit">
            Prihlásiť sa ako admin
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin