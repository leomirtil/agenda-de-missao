import { useState } from 'react'
import { downloadVCard } from './contact.js'
import { BRAND, EVENT } from './config.js'

const IcoEmail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="20" height="16" rx="4" fill="#167033" />
    <path d="M2 7l10 7 10-7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)
const IcoWeb = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#1C75BC" />
    <ellipse cx="12" cy="12" rx="4" ry="10" stroke="#fff" strokeWidth="1.5" fill="none" />
    <line x1="2" y1="12" x2="22" y2="12" stroke="#fff" strokeWidth="1.5" />
    <line x1="4.5" y1="7" x2="19.5" y2="7" stroke="#fff" strokeWidth="1.2" />
    <line x1="4.5" y1="17" x2="19.5" y2="17" stroke="#fff" strokeWidth="1.2" />
  </svg>
)
const IcoLI = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#0A66C2" />
    <rect x="5" y="9" width="3" height="10" fill="#fff" />
    <circle cx="6.5" cy="6.5" r="1.8" fill="#fff" />
    <path d="M11 9h3v1.5s1-1.5 3-1.5c2.5 0 3 1.8 3 4v6h-3v-5.5c0-1-.3-2-1.5-2s-2 1-2 2V19h-3V9z" fill="#fff" />
  </svg>
)
const IcoWA = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="11" fill="#25D366" />
    <path
      d="M17.5 14.4c-.3-.1-1.7-.8-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.1-.2.1-.3.2-.5 0-.2 0-.4-.1-.5L8.6 7.9c-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.6.1-.9.4C6.1 8.2 5.5 9 5.5 10.6c0 1.6 1.1 3.2 1.3 3.4.2.2 2.2 3.4 5.4 4.7 3.2 1.2 3.2.8 3.7.8.5 0 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3 0-.2-.2-.3-.5-.5z"
      fill="#fff"
    />
  </svg>
)

function buildRows(p) {
  return [
    p.emailPersonal && { ico: <IcoEmail />, label: p.emailPersonal, sub: 'E-mail pessoal · Personal email', href: `mailto:${p.emailPersonal}` },
    p.emailWork && { ico: <IcoEmail />, label: p.emailWork, sub: 'E-mail institucional · Work email', href: `mailto:${p.emailWork}` },
    p.site && { ico: <IcoWeb />, label: p.siteLabel || p.site.replace(/^https?:\/\//, ''), sub: 'Site oficial · Official website', href: p.site },
    p.linkedin && { ico: <IcoLI />, label: 'LinkedIn', sub: 'Perfil profissional · Professional profile', href: p.linkedin },
    p.whatsapp && { ico: <IcoWA />, label: 'WhatsApp', sub: p.whatsapp, href: `https://wa.me/${p.whatsapp.replace(/\D/g, '')}` },
  ].filter(Boolean)
}

const initialsOf = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export default function ContactCard({ cardUrl, person }) {
  const ROWS = buildRows(person)
  const [photoOpen, setPhotoOpen] = useState(false)
  const [bioOpen, setBioOpen] = useState(false)
  // Bio pode ser texto único ou { pt, en } — abre no idioma do navegador.
  const [bioLang, setBioLang] = useState(() =>
    (navigator.language || 'pt').toLowerCase().startsWith('pt') ? 'pt' : 'en',
  )
  const bioText = person.bio && typeof person.bio === 'object' ? person.bio[bioLang] : person.bio

  return (
    <div className="card-page">
      {photoOpen && person.photo && (
        <div className="card-lightbox" onClick={() => setPhotoOpen(false)}>
          <img src={person.photo} alt={person.name} />
        </div>
      )}

      <div className="card-hero">
        <div className="hero__ring hero__ring--a" />
        <div className="hero__ring hero__ring--b" />
        {person.photo ? (
          <div className="card-photo" onClick={() => setPhotoOpen(true)}>
            <img src={person.photoThumb || person.photo} alt={person.name} />
            <span className="card-photo__zoom">🔍</span>
          </div>
        ) : (
          <div className="card-photo card-photo--initials" aria-hidden="true">{initialsOf(person.name)}</div>
        )}
        <div className="card-name">{person.name}</div>
        {person.title && <div className="card-title">{person.title}</div>}
        <div className="card-org">{person.org}</div>
      </div>

      <div className="card-section">
        <div className="card-section__label">Contato · Contact</div>
        {ROWS.map((r, i) => (
          <a key={i} className="contact-row" href={r.href} target="_blank" rel="noreferrer">
            <span className="contact-row__ico">{r.ico}</span>
            <span className="contact-row__text">
              <span className="contact-row__label">{r.label}</span>
              <span className="contact-row__sub">{r.sub}</span>
            </span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3l5 5-5 5" stroke="#c7c9bc" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        ))}
      </div>

      {person.bio && (
        <div className="card-section card-section--muted">
          <div className="card-bio__head">
            <div className="card-section__label">{bioLang === 'pt' ? 'Sobre' : 'About'}</div>
            {typeof person.bio === 'object' && (
              <div className="lang-toggle" role="group" aria-label="Idioma / Language">
                {['pt', 'en'].map((l) => (
                  <button
                    key={l}
                    type="button"
                    className={`lang-toggle__btn${bioLang === l ? ' active' : ''}`}
                    aria-pressed={bioLang === l}
                    onClick={() => setBioLang(l)}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className={`card-bio${bioOpen ? ' card-bio--open' : ''}`} lang={bioLang}>
            {bioText.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <button className="card-bio__toggle" onClick={() => setBioOpen((v) => !v)}>
            {bioOpen ? '▲ Ler menos · Read less' : '▼ Ler mais · Read more'}
          </button>
        </div>
      )}

      <div className="card-section card-qr">
        <div className="card-section__label">Compartilhar · Share card</div>
        <div className="card-qr__box">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=161d17&bgcolor=FFFFFF&data=${encodeURIComponent(cardUrl)}`}
            alt="QR Code"
            width={170}
            height={170}
          />
        </div>
        <div className="card-qr__caption">
          Escaneie para abrir este cartão
          <br />
          <span>Scan to open this card</span>
        </div>
        <button className="card-save-btn" onClick={() => downloadVCard(person)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 3v13M7 12l5 5 5-5M4 20h16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Salvar Contato · Save Contact
        </button>
      </div>

      <div className="card-footer">
        <img src={BRAND.logo} alt={BRAND.logoAlt} className="card-footer__logo" />
        {`${EVENT.name} · ${EVENT.place}`.toUpperCase()}
        <br />
        {EVENT.dates.toUpperCase()}
      </div>
    </div>
  )
}
