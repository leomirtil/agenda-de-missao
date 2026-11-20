import { useState } from 'react'
import * as mainPortfolio from './portfolio.js'
import * as comitivaPortfolio from './portfolio-comitiva.js'
import { BRAND, BRAND_KEY } from './config.js'
import ShareButton, { shareUrl } from './ShareButton.jsx'

// Cada painel tem o seu conteúdo de Portfólio (principal: portfolio.js; comitiva: portfolio-comitiva.js).
const { PORTFOLIO_SECTIONS, PORTFOLIO_TEXT } = BRAND_KEY === 'comitiva' ? comitivaPortfolio : mainPortfolio

const LANG_KEY = 'agenda-portfolio-lang'

function initialLang() {
  try {
    const saved = window.localStorage.getItem(LANG_KEY)
    if (saved === 'pt' || saved === 'en') return saved
  } catch {
    // localStorage pode estar bloqueado — cai no padrão.
  }
  return (navigator.language || 'pt').toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

export default function Portfolio() {
  const [lang, setLang] = useState(initialLang)
  const [openSection, setOpenSection] = useState(null)
  const t = PORTFOLIO_TEXT[lang]

  function chooseLang(l) {
    setLang(l)
    try {
      window.localStorage.setItem(LANG_KEY, l)
    } catch {
      // ignora
    }
  }

  return (
    <section className="section portfolio" lang={lang}>
      <div className="portfolio__top">
        <span className="section__eyebrow">🌳 {t.eyebrow}</span>
        <div className="portfolio__actions">
          <ShareButton
            url={shareUrl('?publico&portfolio')}
            title={BRAND.share.portfolio[lang].title}
            text={BRAND.share.portfolio[lang].text}
            lang={lang}
          />
          <div className="lang-toggle" role="group" aria-label="Language / Idioma">
            {['pt', 'en'].map((l) => (
              <button
                key={l}
                type="button"
                className={`lang-toggle__btn${lang === l ? ' active' : ''}`}
                aria-pressed={lang === l}
                onClick={() => chooseLang(l)}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
      <h2 className="section__title">{t.title}</h2>
      <p className="portfolio__subtitle">{t.subtitle}</p>

      {PORTFOLIO_SECTIONS.map((sec) => (
        <div key={sec.id} className="pf-section">
          <h3 className="pf-section__title">{sec.title[lang]}</h3>

          {sec.people && (
            <>
              <button
                type="button"
                className="link-btn link-btn--toggle"
                aria-expanded={openSection === sec.id}
                aria-controls={`pf-${sec.id}`}
                onClick={() => setOpenSection(openSection === sec.id ? null : sec.id)}
              >
                <span className="link-btn__icon" aria-hidden="true">👥</span>
                <span className="link-btn__text">
                  <span className="link-btn__title">{t.members}</span>
                  <span className="link-btn__desc">{sec.people.map((m) => m.name).join(' · ')}</span>
                </span>
                <span className={`link-btn__chev${openSection === sec.id ? ' open' : ''}`} aria-hidden="true">▾</span>
              </button>
              {openSection === sec.id && (
              <div className="people" id={`pf-${sec.id}`}>
              {sec.people.map((m) => (
                <div key={m.id} className="person-card" style={{ '--person-color': m.color }}>
                  <div className="person-card__head">
                    {m.photo ? (
                      <img className="person-avatar person-avatar--photo" src={m.photo} alt="" width="46" height="46" />
                    ) : (
                      <span className="person-avatar" aria-hidden="true">
                        {m.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                      </span>
                    )}
                    <span className="person-card__text">
                      <span className="person-card__name">{m.name}</span>
                      <span className="person-card__role">{m.role[lang]}</span>
                    </span>
                  </div>
                  <div className="person-actions">
                    {[
                      { key: 'card', icon: '👤', label: t.card, url: m.cardUrl, external: true },
                      { key: 'wa', icon: '💬', label: t.whatsapp, url: m.whatsappUrl, external: true },
                    ].map((b) =>
                      b.url ? (
                        <a key={b.key} className="person-btn" href={b.url} target="_blank" rel="noreferrer">
                          <span aria-hidden="true">{b.icon}</span> {b.label}
                        </a>
                      ) : (
                        <span key={b.key} className="person-btn person-btn--soon" aria-label={`${b.label} — ${t.soonLabel}`}>
                          <span aria-hidden="true">{b.icon}</span> {b.label} <em>{t.soon}</em>
                        </span>
                      ),
                    )}
                  </div>
                </div>
              ))}
            </div>
              )}
            </>
          )}

          {sec.items && (
            <ul className="link-list">
              {sec.items.map((item) => {
                const soon = item.status === 'soon' || !item.url
                const external = item.kind === 'pdf' || (item.kind === 'link' && item.url)
                const body = (
                  <>
                    {item.thumb ? (
                      <img className="link-btn__thumb" src={item.thumb} alt="" loading="lazy" />
                    ) : (
                      <span className="link-btn__icon" aria-hidden="true">{item.icon}</span>
                    )}
                    <span className="link-btn__text">
                      <span className="link-btn__title">{item.title[lang]}</span>
                      <span className="link-btn__desc">{item.desc[lang]}</span>
                    </span>
                    {soon ? (
                      <span className="link-btn__soon">{t.soon}</span>
                    ) : (
                      <span className="link-btn__arrow" aria-hidden="true">{external ? '↗' : '→'}</span>
                    )}
                  </>
                )
                return (
                  <li key={item.id}>
                    {soon ? (
                      <div className="link-btn link-btn--soon" aria-label={`${item.title[lang]} — ${t.soonLabel}`}>
                        {body}
                      </div>
                    ) : (
                      <a
                        className="link-btn"
                        href={item.url}
                        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                      >
                        {body}
                      </a>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      ))}
    </section>
  )
}
