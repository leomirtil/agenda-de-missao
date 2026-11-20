import { useState } from 'react'
import { tryUnlock } from './access.js'
import { BRAND, EVENT } from './config.js'

export default function AccessGate({ onUnlock }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!password || busy) return
    setBusy(true)
    const ok = await tryUnlock(password)
    setBusy(false)
    if (ok) onUnlock()
    else setError(true)
  }

  return (
    <div className="gate">
      <div className="gate__ring gate__ring--a" />
      <div className="gate__ring gate__ring--b" />
      <form className="gate__card" onSubmit={submit}>
        {BRAND.logo ? (
          <img src={BRAND.logo} alt={BRAND.logoAlt} className={`gate__logo${BRAND.logoVertical ? ' gate__logo--vertical' : ''}`} />
        ) : (
          <div className="gate__logo-text">{BRAND.logoAlt}</div>
        )}
        <span className="gate__eyebrow">🔒 Acesso restrito</span>
        <h1 className="gate__title">{BRAND.gateTitle}</h1>
        <p className="gate__text">Painel interno da missão. Digite a senha para entrar.</p>
        <input
          className="gate__input"
          type="password"
          autoComplete="current-password"
          placeholder="Senha"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError(false)
          }}
          autoFocus
        />
        {error && <div className="gate__error">Senha incorreta.</div>}
        <button className="gate__btn" type="submit" disabled={busy}>
          Entrar
        </button>
        <div className="gate__links">
          <a href="?publico">🗓️ Agenda pública</a>
          {BRAND.showCard && <a href="?cartao">👤 Cartão de visitas</a>}
        </div>
      </form>
      <div className="gate__footer">{EVENT.name} · {EVENT.place} · {EVENT.dates}</div>
    </div>
  )
}
