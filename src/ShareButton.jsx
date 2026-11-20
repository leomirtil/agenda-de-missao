import { useEffect, useRef, useState } from 'react'

// Botão "Compartilhar" da agenda pública e do Portfólio.
// Abre um menu com: compartilhamento nativo do celular (quando existe), WhatsApp, e-mail e copiar link.
// O link é montado com o domínio em uso (funciona igual nos dois painéis).
const LABELS = {
  pt: { button: 'Compartilhar', native: 'Compartilhar…', whatsapp: 'WhatsApp', email: 'E-mail', copy: 'Copiar link', copied: 'Link copiado!' },
  en: { button: 'Share', native: 'Share…', whatsapp: 'WhatsApp', email: 'Email', copy: 'Copy link', copied: 'Link copied!' },
}

export function shareUrl(query) {
  return `${window.location.origin}/${query}`
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Navegadores sem clipboard API (ou sem permissão): cópia pelo método antigo.
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    document.body.removeChild(ta)
    return ok
  }
}

// compact = só o ícone (usado na barra da Agenda).
export default function ShareButton({ url, title, text, lang = 'pt', compact = false }) {
  const t = LABELS[lang] || LABELS.pt
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef(null)
  const canNative = typeof navigator !== 'undefined' && typeof navigator.share === 'function'
  const message = `${text}\n${url}`

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  async function nativeShare() {
    setOpen(false)
    try {
      await navigator.share({ title, text, url })
    } catch {
      // usuário cancelou — nada a fazer
    }
  }

  async function copy() {
    if (await copyText(url)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    setOpen(false)
  }

  return (
    <div className="share" ref={ref}>
      <button
        type="button"
        className={`share__btn${compact ? ' share__btn--icon' : ''}`}
        aria-label={compact ? t.button : undefined}
        title={compact ? t.button : undefined}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {compact ? (
          <span aria-hidden="true">{copied ? '✓' : '📤'}</span>
        ) : (
          <>
            <span aria-hidden="true">📤</span> {copied ? t.copied : t.button}
          </>
        )}
      </button>
      {open && (
        <div className="share__menu" role="menu">
          {canNative && (
            <button type="button" role="menuitem" className="share__item" onClick={nativeShare}>
              <span aria-hidden="true">📲</span> {t.native}
            </button>
          )}
          <a
            role="menuitem"
            className="share__item"
            href={`https://wa.me/?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
          >
            <span aria-hidden="true">💬</span> {t.whatsapp}
          </a>
          <a
            role="menuitem"
            className="share__item"
            href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(message)}`}
            onClick={() => setOpen(false)}
          >
            <span aria-hidden="true">✉️</span> {t.email}
          </a>
          <button type="button" role="menuitem" className="share__item" onClick={copy}>
            <span aria-hidden="true">🔗</span> {t.copy}
          </button>
        </div>
      )}
    </div>
  )
}
