import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { supabase } from './supabase/clients'

function EvolutionPanel() {
  const stages = useMemo(
    () => ['🪶', '⚙️', '🔥', '⚡', '🛡️', '🗡️', '🐉', '🌌', '👑', '🕊️'],
    []
  )
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % stages.length)
    }, 1800)
    return () => clearInterval(id)
  }, [stages.length])

  return (
    <div className="evolution-panel">
      <div className="evolution-circle">
        <span className="evolution-emoji" aria-hidden>
          {stages[idx]}
        </span>
      </div>
      <div className="evolution-caption">Becoming wiser…</div>
    </div>
  )
}

function RegisterModal({ open, onClose, onRegistered }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const stop = (e) => e.stopPropagation()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (!username.trim()) return setError('Please choose a username.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirm) return setError('Passwords do not match.')
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (error) {
      setLoading(false)
      return setError(error.message)
    }
    // Try to ensure the user lands in the app. If confirmation is required, session will be null.
    if (data.session?.user) {
      setLoading(false)
      onRegistered(data.session.user)
      return
    }
    // Attempt to sign in immediately (works if email auto-confirm is enabled)
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)
    if (signInErr) {
      setError('Registration successful. Please confirm your email to sign in.')
      return
    }
    if (signInData?.user) onRegistered(signInData.user)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={stop}>
        <h2>Create your account</h2>
        <form className="auth-form" onSubmit={handleRegister}>
          <label>
            <span>Username</span>
            <input
              type="text"
              placeholder="wisetraveler"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label>
            <span>Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </label>
          <label>
            <span>Confirm password</span>
            <input
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          </label>
          {error ? <div className="error">{error}</div> : null}
          <div className="modal-actions">
            <button className="btn ghost" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AuthPanel({ onAuthed }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showRegister, setShowRegister] = useState(false)

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)
    if (error) return setError(error.message)
    if (data?.user) onAuthed(data.user, false)
  }

  const openRegister = (e) => {
    e.preventDefault()
    setShowRegister(true)
  }

  return (
    <div className="auth-panel">
      <div className="avatar">👴</div>
      <h1 className="brand">House of Wisdom</h1>
      <form className="auth-form" onSubmit={handleSignIn}>
        <label>
          <span>Username (email)</span>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </label>
        <label>
          <span>Password</span>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        {error ? <div className="error">{error}</div> : null}

        <div className="actions">
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <button className="btn ghost" type="button" onClick={openRegister}>
            Sign up
          </button>
        </div>
      </form>
      <RegisterModal
        open={showRegister}
        onClose={() => setShowRegister(false)}
        onRegistered={(user) => {
          setShowRegister(false)
          onAuthed(user, true)
        }}
      />
    </div>
  )
}

function CharacterSelect({ user, onComplete }) {
  const username =
    user?.user_metadata?.username || user?.email?.split('@')[0] || 'traveler'
  const roster = useMemo(
    () => ['🧙\u200d♂️', '🛡️', '🗡️', '🏹', '🐺', '🐉', '🧝\u200d♀️', '👨\u200d🚀'],
    []
  )
  const [idx, setIdx] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const prev = () => setIdx((i) => (i - 1 + roster.length) % roster.length)
  const next = () => setIdx((i) => (i + 1) % roster.length)

  const save = async () => {
    setError('')
    setSaving(true)
    const character = roster[idx]
    const { data, error } = await supabase.auth.updateUser({
      data: { character },
    })
    setSaving(false)
    if (error) return setError(error.message)
    onComplete(data.user)
  }

  return (
    <div className="character-select">
      <header className="character-header">
        <h2>
          Hello, <span className="highlight">{username}</span>
        </h2>
      </header>

      <div className="character-chooser">
        <button className="chevron" onClick={prev} aria-label="Previous">
          ‹
        </button>
        <div className="char-card">
          <div className="char-emoji" aria-hidden>
            {roster[idx]}
          </div>
        </div>
        <button className="chevron" onClick={next} aria-label="Next">
          ›
        </button>
      </div>

      <p className="character-note">
        your level is <strong>0</strong> and your current title is <span>🪶 Nobiezy</span>
      </p>

      {error ? <div className="error" style={{ margin: '8px auto' }}>{error}</div> : null}

      <button className="btn primary" onClick={save} disabled={saving}>
        {saving ? 'Saving…' : 'Journey commence'}
      </button>
    </div>
  )
}

function Home({ user }) {
  const username =
    user?.user_metadata?.username || user?.email?.split('@')[0] || 'traveler'

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <div className="home">
      <h1>
        Hello, <span className="highlight">{username}</span>
      </h1>
      <p>Welcome to the House of Wisdom.</p>
      <button className="btn" onClick={signOut}>
        Sign out
      </button>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [justSignedUp, setJustSignedUp] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setUser(data.session?.user ?? null)
      setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      mounted = false
      sub.subscription?.unsubscribe?.()
    }
  }, [])

  if (!ready) {
    return (
      <div className="loading-shell">
        <div className="spinner" />
      </div>
    )
  }

  if (user) {
    const needsCharacter = justSignedUp || !user?.user_metadata?.character
    if (needsCharacter) {
      return (
        <CharacterSelect
          user={user}
          onComplete={(u) => {
            setUser(u)
            setJustSignedUp(false)
          }}
        />
      )
    }
    return <Home user={user} />
  }

  return (
    <div className="shell">
      <div className="left">
        <EvolutionPanel />
      </div>
      <div className="right">
        <AuthPanel
          onAuthed={(u, isNew) => {
            setUser(u)
            setJustSignedUp(!!isNew)
          }}
        />
      </div>
    </div>
  )
}
