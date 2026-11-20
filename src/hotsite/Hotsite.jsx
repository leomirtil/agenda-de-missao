import { useEffect, useMemo, useRef, useState } from 'react'
import ShareButton, { shareUrl } from '../ShareButton.jsx'
import { PEOPLE, cardPath, downloadVCard, whatsappUrl } from '../contact.js'
import { BRAND, EVENT, MISSION, HOTSITE_PATH } from '../config.js'
import { sortEvents } from '../agenda.js'
import logoVertical from '../assets/logo.svg'
import logoHorizontal from '../assets/logo-horizontal.svg'
import {
  STRINGS,
  NUMBERS,
  CURVE,
  COP,
  COP_NOTE,
  GALLERY,
  VIDEOS,
  NEWS,
  NEWS_ALL,
  LINKS,
  PEOPLE_TITLES,
  PHOTOS,
  DECOUPLING,
} from './content.js'

const LANG_KEY = 'hotsite-lang'
// A faixa "Agora/Próximo" lê os eventos públicos da missão principal (MISSION em config.js).

function initialLang() {
  const q = new URLSearchParams(window.location.search).get('lang')
  if (q === 'pt' || q === 'en') return q
  try {
    const saved = window.localStorage.getItem(LANG_KEY)
    if (saved === 'pt' || saved === 'en') return saved
  } catch {
    // localStorage bloqueado: usa o idioma do navegador.
  }
  return (navigator.language || 'pt').toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Marca .is-in nos elementos [data-reveal] quando entram na tela (uma vez).
function useReveal(deps) {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]:not(.is-in)')
    if (reduceMotion() || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'))
      return undefined
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.18 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

function CountUp({ value, prefix = '', suffix = '' }) {
  const ref = useRef(null)
  const [n, setN] = useState(reduceMotion() ? value : 0)
  useEffect(() => {
    if (reduceMotion() || !('IntersectionObserver' in window)) {
      setN(value)
      return undefined
    }
    let raf
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        const t0 = performance.now()
        const step = (t) => {
          const p = Math.min(1, (t - t0) / 1400)
          setN(Math.round(value * (1 - Math.pow(1 - p, 3))))
          if (p < 1) raf = requestAnimationFrame(step)
        }
        raf = requestAnimationFrame(step)
      },
      { threshold: 0.4 },
    )
    if (ref.current) io.observe(ref.current)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value])
  return (
    <span ref={ref} className="num">
      {prefix}
      {n}
      {suffix}
    </span>
  )
}

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])
  return now
}

function fmtTime(date, timeZone) {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone,
    }).format(date)
  } catch {
    return ''
  }
}

// Barra de progresso de leitura (faixa de quatro cores).
function ProgressBar() {
  const ref = useRef(null)
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      const p = h.scrollHeight > h.clientHeight ? h.scrollTop / (h.scrollHeight - h.clientHeight) : 0
      if (ref.current) ref.current.style.transform = `scaleX(${p})`
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className="hs-progress" aria-hidden="true">
      <div ref={ref} className="hs-progress__bar" />
    </div>
  )
}

function Stripe({ className = '' }) {
  return (
    <div className={`hs-stripe ${className}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </div>
  )
}

// Arte do topo (usada quando não há foto): anéis concêntricos, um rio em meandro e a copa de árvores.
function HeroArt({ photo }) {
  return (
    <svg className="hs-hero__art" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="hsGlow" cx="50%" cy="38%" r="60%">
          <stop offset="0" stopColor="#43b97d" stopOpacity=".35" />
          <stop offset="1" stopColor="#43b97d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hsRiver" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1874bd" stopOpacity=".1" />
          <stop offset=".5" stopColor="#6fb6e8" stopOpacity=".75" />
          <stop offset="1" stopColor="#1874bd" stopOpacity=".2" />
        </linearGradient>
      </defs>
      <rect width="400" height="600" fill="url(#hsGlow)" />
      <g className="hs-rings" fill="none" stroke="#43b97d">
        {[60, 100, 140, 180, 220, 260].map((r, i) => (
          <circle
            key={r}
            cx="200"
            cy="230"
            r={r}
            strokeOpacity={0.32 - i * 0.045}
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </g>
      {!photo && (
        <>
          <path
            className="hs-river"
            d="M120 600 C 60 540, 250 520, 200 470 S 90 400, 170 360 S 300 330, 240 280 S 150 230, 200 190 S 260 140, 230 90 S 200 30, 220 0"
            fill="none"
            stroke="url(#hsRiver)"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <g className="hs-canopy">
            {Array.from({ length: 14 }).map((_, i) => {
              const x = i * 31 - 10
              const r = 26 + ((i * 37) % 17)
              const y = 560 - ((i * 53) % 36)
              return <circle key={i} cx={x} cy={y} r={r} style={{ animationDelay: `${0.3 + (i % 7) * 0.12}s` }} />
            })}
            <rect x="0" y="575" width="400" height="30" />
          </g>
        </>
      )}
    </svg>
  )
}

function LiveStrip({ t }) {
  const [state, setState] = useState(null)
  useEffect(() => {
    let alive = true
    const today = new Date().toISOString().slice(0, 10)
    // Carrega o cliente do Supabase só depois da página pronta (não pesa no primeiro toque do chaveiro).
    import('../supabase.js')
      .then(({ supabase }) =>
        supabase
          .from('mission_events')
          .select('id,title,time,date,event_date,status,visibility,type,sort_order')
          .eq('mission', MISSION)
          .neq('visibility', 'internal')
          .gte('event_date', today)
          .order('event_date')
          .limit(40)
          .then(({ data, error }) => {
            if (!alive || error || !data?.length) return
            const list = sortEvents(data).filter((e) => e.type !== 'viagem' && e.status !== 'cancelled')
            if (!list.length) return
            const first = list[0]
            setState({ now: first.event_date === today, ev: first })
          }),
      )
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])
  if (!state) return null
  const { ev, now } = state
  return (
    <a className="hs-live" href="/?publico">
      <span className={`hs-live__dot${now ? ' is-now' : ''}`} aria-hidden="true" />
      <span className="hs-live__label">{now ? t.liveNow : t.liveNext}</span>
      <span className="hs-live__text">
        <b>{ev.date}</b> · {ev.title}
      </span>
      <span className="hs-live__more">{t.liveAgenda} →</span>
    </a>
  )
}

function Video({ v, lang, t }) {
  const [play, setPlay] = useState(false)
  // Vídeo hospedado no Google Drive: o arquivo precisa estar como "qualquer pessoa com o link".
  // A capa vem da miniatura do Drive; se ela não carregar, usa a foto local em `poster`.
  if (v.drive) {
    return (
      <figure className="hs-video" data-reveal>
        {play ? (
          <iframe
            src={`https://drive.google.com/file/d/${v.drive}/preview`}
            title={v.title[lang]}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="hs-video__thumb"
            onClick={() => setPlay(true)}
            aria-label={`${t.play}: ${v.title[lang]}`}
          >
            <img
              src={`https://drive.google.com/thumbnail?id=${v.drive}&sz=w1280`}
              alt=""
              loading="lazy"
              onError={(e) => {
                if (v.poster && !e.currentTarget.src.endsWith(v.poster)) e.currentTarget.src = v.poster
              }}
            />
            <span className="hs-video__play" aria-hidden="true">
              ▶
            </span>
          </button>
        )}
        <figcaption>{v.title[lang]}</figcaption>
      </figure>
    )
  }
  if (v.youtube) {
    return (
      <figure className="hs-video" data-reveal>
        {play ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${v.youtube}?autoplay=1&rel=0`}
            title={v.title[lang]}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="hs-video__thumb"
            onClick={() => setPlay(true)}
            aria-label={`${t.play}: ${v.title[lang]}`}
          >
            <img src={`https://i.ytimg.com/vi/${v.youtube}/hqdefault.jpg`} alt="" loading="lazy" />
            <span className="hs-video__play" aria-hidden="true">
              ▶
            </span>
          </button>
        )}
        <figcaption>{v.title[lang]}</figcaption>
      </figure>
    )
  }
  return (
    <a className="hs-video hs-video--link" href={v.url} target="_blank" rel="noreferrer" data-reveal>
      <span className="hs-video__play" aria-hidden="true">
        ▶
      </span>
      <span>{v.title[lang]}</span>
    </a>
  )
}

// Seção opcional DECOUPLING: barras do indicador principal (CURVE) + linhas de outros indicadores (índice = 100 no 1º ano).
function Decoupling({ lang }) {
  const D = DECOUPLING
  // Barras: a série CURVE. Linhas: indicadores em índice (1º ano = 100),
  // só com os pontos conhecidos (início e fim), sem inventar valores anuais intermediários.
  const W = 400
  const H = 262
  const L = 40
  const R = 286
  const base = 214
  const slot = (R - L) / CURVE.length
  const cx = (i) => L + slot * (i + 0.5)
  const barW = Math.min(30, slot * 0.62)
  const maxV = Math.max(...CURVE.map((c) => c.value))
  const barH = (v) => (v / maxV) * 150
  const yIdx = (idx) => 150 - (idx - 100) * 3.7
  // linha de tendência (mínimos quadrados) sobre o topo das barras
  const n = CURVE.length
  const xs = CURVE.map((_, i) => i)
  const ys = CURVE.map((c) => base - barH(c.value))
  const mx = xs.reduce((a, v) => a + v, 0) / n
  const my = ys.reduce((a, v) => a + v, 0) / n
  const slope = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / xs.reduce((a, x) => a + (x - mx) ** 2, 0)
  const trend = (i) => my + slope * (i - mx)
  const grow = D.lines.filter((l) => l.change > 0)
  const defo = D.lines.find((l) => l.change < 0)
  const last = CURVE[n - 1]
  const lastTop = base - barH(last.value)
  const fmt = (c) => `${c > 0 ? '+' : '−'}${Math.abs(c)}%`
  return (
    <section className="hs-section hs-decouple">
      <p className="hs-eyebrow">{D.eyebrow[lang]}</p>
      <h2 className="hs-h2">{D.title[lang]}</h2>
      <p className="hs-decouple__lead">{D.lead[lang]}</p>
      <div className="hs-decouple__grid">
        <figure className="hs-scissors" data-reveal>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`${CURVE.map((c) => `${c.year}: ${c.value} km²`).join(', ')}. ${D.lines
              .map((l) => `${l.label[lang]} ${fmt(l.change)}`)
              .join(', ')}`}
          >
            <text x={L - 4} y={22} className="hs-scissors__axis">
              {D.chart.unit[lang]}
            </text>
            <line x1={L - 6} x2={R + 6} y1={base} y2={base} className="hs-scissors__ground" />
            <line x1={cx(0)} x2={cx(n - 1)} y1={yIdx(100)} y2={yIdx(100)} className="hs-scissors__base" />
            {CURVE.map((c, i) => (
              <g key={c.year} className="hs-scissors__bar" style={{ '--d': `${i * 120}ms` }}>
                <rect x={cx(i) - barW / 2} y={base - barH(c.value)} width={barW} height={barH(c.value)} rx="5" />
                <text x={cx(i)} y={base - 9} textAnchor="middle" className="hs-scissors__barval">
                  {c.value}
                  {c.estimate ? '*' : ''}
                </text>
                <text x={cx(i)} y={base + 16} textAnchor="middle" className="hs-scissors__axis">
                  {c.year}
                </text>
              </g>
            ))}
            <g className="hs-scissors__line hs-scissors__line--rust hs-scissors__trend" style={{ '--d': '700ms' }}>
              <path d={`M${cx(0)} ${trend(0)} L${cx(n - 1)} ${trend(n - 1)}`} pathLength="1" />
            </g>
            {grow.map((l, i) => {
              const y0 = yIdx(100)
              const y1 = yIdx(100 + l.change)
              const yl = y1 + (l.labelDy || 0)
              return (
                <g
                  key={l.id}
                  className={`hs-scissors__line hs-scissors__line--${l.color}`}
                  style={{ '--d': `${900 + i * 250}ms` }}
                >
                  <path d={`M${cx(0)} ${y0} L${cx(n - 1)} ${y1}`} pathLength="1" className="hs-scissors__halo" />
                  <path d={`M${cx(0)} ${y0} L${cx(n - 1)} ${y1}`} pathLength="1" />
                  <circle cx={cx(0)} cy={y0} r="4" />
                  <circle cx={cx(n - 1)} cy={y1} r="5" className="hs-scissors__end" />
                  <text x={R + 12} y={yl - 2} className="hs-scissors__value">
                    {fmt(l.change)}
                  </text>
                  <text x={R + 12} y={yl + 12} className="hs-scissors__label">
                    {l.label[lang]}
                  </text>
                </g>
              )
            })}
            {defo && (
              <g className="hs-scissors__line hs-scissors__line--rust" style={{ '--d': '700ms' }}>
                <text x={R + 12} y={lastTop + 8} className="hs-scissors__value">
                  {fmt(defo.change)}
                </text>
                <text x={R + 12} y={lastTop + 22} className="hs-scissors__label">
                  {defo.label[lang]}
                </text>
              </g>
            )}
          </svg>
          <figcaption>
            <span className="hs-legend hs-legend--bar">{D.chart.bars[lang]}</span>
            <span className="hs-legend hs-legend--trend">{D.chart.trend[lang]}</span>
            <span className="hs-legend hs-legend--line">{D.chart.lines[lang]}</span>
          </figcaption>
        </figure>
        <div className="hs-decouple__cards">
          {D.cards.map((c, i) => (
            <article key={c.id} className="hs-dcard" data-reveal style={{ '--d': `${i * 90}ms` }}>
              <span className="hs-dcard__value">{lang === 'en' ? c.valueEn : c.value}</span>
              <p>{c.label[lang]}</p>
              <small>{c.source}</small>
            </article>
          ))}
        </div>
      </div>
      <p className="hs-curve__msg hs-decouple__msg" data-reveal>
        {D.message[lang]}
      </p>
      <p className="hs-note">{D.note[lang]}</p>
    </section>
  )
}

// Faixa de foto em tela cheia com frase (e crédito, quando houver).
function PhotoBand({ band, lang }) {
  if (!band) return null
  return (
    <section className="hs-band" style={{ '--img': `url(${band.src})` }}>
      <p className="hs-band__text" data-reveal>
        {band.text[lang]}
      </p>
      {band.credit && <span className="hs-band__credit">{band.credit}</span>}
    </section>
  )
}

export default function Hotsite() {
  const [lang, setLang] = useState(initialLang)
  const t = STRINGS[lang]
  const nfc = useMemo(() => new URLSearchParams(window.location.search).has('nfc'), [])
  const [zoom, setZoom] = useState(null)
  const now = useClock()
  const maxCurve = Math.max(...CURVE.map((c) => c.value))

  useReveal([lang])

  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en'
    try {
      window.localStorage.setItem(LANG_KEY, lang)
    } catch {
      // sem localStorage: segue sem lembrar.
    }
  }, [lang])

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth' })

  return (
    <div className="hs">
      <ProgressBar />

      <header className="hs-top">
        <img src={logoHorizontal} alt={BRAND.logoAlt} className="hs-top__logo" />
        <div
          className="hs-top__clock"
          aria-label={`${EVENT.timeZoneLabel} ${fmtTime(now, EVENT.timeZone)}, ${EVENT.homeTimeZoneLabel} ${fmtTime(now, EVENT.homeTimeZone)}`}
        >
          <span>
            {EVENT.timeZoneLabel} <b>{fmtTime(now, EVENT.timeZone)}</b>
          </span>
          <span>
            {EVENT.homeTimeZoneLabel} <b>{fmtTime(now, EVENT.homeTimeZone)}</b>
          </span>
        </div>
        <button
          type="button"
          className="hs-lang"
          onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
          aria-label={t.langAria}
        >
          {t.langLabel}
        </button>
      </header>

      <section className={`hs-hero${PHOTOS.heroMobile ? ' hs-hero--photo' : ''}`}>
        {PHOTOS.heroMobile && (
          <picture className="hs-hero__photo" aria-hidden="true">
            <source media="(min-width: 768px)" srcSet={PHOTOS.heroDesktop} />
            <img src={PHOTOS.heroMobile} alt="" fetchpriority="high" />
          </picture>
        )}
        <HeroArt photo={Boolean(PHOTOS.heroMobile)} />
        <div className="hs-hero__content">
          <div className="hs-hero__chip">
            {/* celular: logo horizontal, menor e no topo, para não cobrir a foto; computador: logo vertical */}
            <picture>
              <source media="(min-width: 768px)" srcSet={logoVertical} />
              <img src={logoHorizontal} alt={BRAND.logoAlt} />
            </picture>
          </div>
          <p className="hs-pill">{t.eyebrow}</p>
          <h1 className="hs-hero__title">{nfc ? t.heroNfc : t.heroDefault}</h1>
          <p className="hs-hero__lead">{t.heroLead}</p>
          {nfc && <p className="hs-hero__thanks">{t.nfcThanks}</p>}
          <Stripe className="hs-stripe--hero" />
          <button type="button" className="hs-cta" onClick={() => go('numeros')}>
            {t.heroCta} <span aria-hidden="true">↓</span>
          </button>
        </div>
      </section>

      <main>
        <section id="numeros" className="hs-section">
          <p className="hs-eyebrow">{t.numbersEyebrow}</p>
          <h2 className="hs-h2">{t.numbersTitle}</h2>
          <div className="hs-numbers">
            {NUMBERS.map((n, i) => (
              <article
                key={n.id}
                className={`hs-num hs-num--${n.accent}${i === 0 ? ' hs-num--dark' : ''}`}
                data-reveal
                style={{ '--d': `${i * 90}ms` }}
              >
                <i className="hs-num__bar" aria-hidden="true" />
                <CountUp value={n.value} prefix={n.prefix} suffix={n.suffix} />
                <p className="hs-num__label">{n.label[lang]}</p>
                <p className="hs-num__src">
                  {t.source}: {n.source}
                </p>
              </article>
            ))}
          </div>
        </section>

        <PhotoBand band={PHOTOS.band} lang={lang} />

        {CURVE.length > 0 && (
        <section className="hs-section hs-section--dark">
          <p className="hs-eyebrow hs-eyebrow--light">{t.curveEyebrow}</p>
          <h2 className="hs-h2">{t.curveTitle}</h2>
          <div className="hs-curve" data-reveal style={{ '--n': CURVE.length }}>
            {CURVE.map((c, i) => (
              <div key={c.year} className="hs-curve__col">
                <div className="hs-curve__track">
                  {/* valor colado no topo da barra */}
                  <div
                    className="hs-curve__stack"
                    style={{ '--h': `${(c.value / maxCurve) * 100}%`, '--d': `${i * 160}ms` }}
                  >
                    <span className="hs-curve__value">
                      {c.value}
                      {c.estimate ? '*' : ''}
                    </span>
                    <div className="hs-curve__bar" />
                  </div>
                </div>
                <span className="hs-curve__year">{c.year}</span>
              </div>
            ))}
          </div>
          <p className="hs-curve__msg" data-reveal>
            {t.curveMessage}
          </p>
          <p className="hs-note hs-note--light">* {t.curveNote}</p>
        </section>
        )}

        <PhotoBand band={PHOTOS.band2} lang={lang} />

        {DECOUPLING && <Decoupling lang={lang} />}

        <PhotoBand band={PHOTOS.band3} lang={lang} />

        <section id="cop" className="hs-section">
          <p className="hs-eyebrow">{t.copEyebrow}</p>
          <h2 className="hs-h2">{t.copTitle}</h2>
          <LiveStrip t={t} />
          <ol className="hs-cop">
            {COP.map((c, i) => (
              <li key={c.id} className="hs-cop__item" data-reveal style={{ '--d': `${i * 70}ms` }}>
                <span className="hs-cop__date">{c.date[lang]}</span>
                <div>
                  <span className="hs-tag">{c.tag[lang]}</span>
                  <h3>{c.title[lang]}</h3>
                  <p>{c.text[lang]}</p>
                  {c.url && (
                    <a className="hs-cop__link" href={c.url} target="_blank" rel="noreferrer">
                      {t.readMore} →
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <p className="hs-note">{COP_NOTE[lang]}</p>
        </section>

        {GALLERY.length > 0 && (
          <section className="hs-section hs-section--flush">
            <div className="hs-pad">
              <p className="hs-eyebrow">{t.galleryEyebrow}</p>
              <h2 className="hs-h2">{t.galleryTitle}</h2>
            </div>
            <div className="hs-gallery">
              {GALLERY.map((g, i) => (
                <button key={g.src} type="button" className="hs-gallery__item" onClick={() => setZoom(i)}>
                  <img src={g.src} alt={g.alt[lang]} loading="lazy" />
                  <span className="hs-gallery__meta">
                    {g.caption && <span className="hs-gallery__caption">{g.caption[lang]}</span>}
                    {g.credit && <span className="hs-gallery__credit">{g.credit}</span>}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {VIDEOS.length > 0 && (
          <section className="hs-section">
            <p className="hs-eyebrow">{t.videosEyebrow}</p>
            <h2 className="hs-h2">{t.videosTitle}</h2>
            <div className="hs-videos">
              {VIDEOS.map((v) => (
                <Video key={v.drive || v.youtube || v.url} v={v} lang={lang} t={t} />
              ))}
            </div>
          </section>
        )}

        {NEWS.length > 0 && (
        <section className="hs-section hs-section--cream2">
          <p className="hs-eyebrow">{t.newsEyebrow}</p>
          <h2 className="hs-h2">{t.newsTitle}</h2>
          <div className="hs-news">
            {NEWS.map((n) => {
              const Tag = n.url ? 'a' : 'div'
              return (
                <Tag
                  key={n.id}
                  className={`hs-news__item${n.url ? '' : ' is-soon'}`}
                  {...(n.url ? { href: n.url, target: '_blank', rel: 'noreferrer' } : {})}
                  data-reveal
                >
                  {n.image && (
                    <span className="hs-news__media">
                      <img src={n.image} alt={n.alt?.[lang] ?? ''} loading="lazy" decoding="async" />
                      {n.credit && <span className="hs-news__credit">{n.credit}</span>}
                    </span>
                  )}
                  <span className="hs-news__body">
                    <span className="hs-news__outlet">
                      {n.outlet}
                      {n.date ? ` · ${n.date}` : ''}
                    </span>
                    <h3>{n.title[lang]}</h3>
                    {n.url ? (
                      <span className="hs-news__more">{t.readMore} →</span>
                    ) : (
                      <span className="hs-soon">{t.soon}</span>
                    )}
                  </span>
                </Tag>
              )
            })}
          </div>
          {NEWS_ALL && (
            <a className="hs-news__all" href={NEWS_ALL} target="_blank" rel="noreferrer">
              {t.newsAll} →
            </a>
          )}
        </section>
        )}

        <section className="hs-section">
          <p className="hs-eyebrow">{t.linksEyebrow}</p>
          <h2 className="hs-h2">{t.linksTitle}</h2>
          <div className="hs-links">
            {LINKS.map((l, i) => (
              <a
                key={l.id}
                className="hs-link"
                href={l.url}
                {...(l.url.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                data-reveal
                style={{ '--d': `${(i % 4) * 60}ms` }}
              >
                <span className="hs-link__icon" aria-hidden="true">
                  {l.icon}
                </span>
                <span className="hs-link__text">
                  <b>{l.title[lang]}</b>
                  <small>{l.desc[lang]}</small>
                </span>
                <span className="hs-link__arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="hs-section hs-section--dark">
          <p className="hs-eyebrow hs-eyebrow--light">{t.contactEyebrow}</p>
          <h2 className="hs-h2">{t.contactTitle}</h2>
          <div className="hs-people">
            {Object.keys(PEOPLE).map((key) => {
              const p = PEOPLE[key]
              const wa = whatsappUrl(p)
              return (
                <article key={key} className="hs-person" data-reveal>
                  {p.photoThumb ? <img src={p.photoThumb} alt="" className="hs-person__photo" loading="lazy" /> : null}
                  <div className="hs-person__body">
                    <h3>{p.name}</h3>
                    <p>{PEOPLE_TITLES[key]?.[lang] || p.title}</p>
                    <div className="hs-person__actions">
                      <button type="button" onClick={() => downloadVCard(p)}>
                        {t.saveContact}
                      </button>
                      {wa && (
                        <a href={wa} target="_blank" rel="noreferrer">
                          {t.whatsapp}
                        </a>
                      )}
                      <a href={`/${cardPath(key)}`}>{t.card}</a>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </main>

      <footer className="hs-footer">
        <Stripe />
        <div className="hs-footer__logos">
          {BRAND.footerLogos.map((l) => (
            <img key={l.src} src={l.src} alt={l.alt} />
          ))}
        </div>
        <div className="hs-footer__share">
          <ShareButton url={shareUrl(HOTSITE_PATH)} title={t.shareTitle} text={t.shareText} lang={lang} />
        </div>
        <p className="hs-footer__tip">{t.addHome}</p>
        <p className="hs-footer__org">{t.footer}</p>
      </footer>

      {zoom !== null && GALLERY[zoom] && (
        <div className="hs-zoom" role="dialog" aria-modal="true" onClick={() => setZoom(null)}>
          <figure className="hs-zoom__figure">
            <img src={GALLERY[zoom].src} alt={GALLERY[zoom].alt[lang]} />
            <figcaption>
              {GALLERY[zoom].caption?.[lang]}
              {GALLERY[zoom].credit && <small>{GALLERY[zoom].credit}</small>}
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  )
}
