import { useEffect, useMemo, useState } from 'react'
import { supabase, MISSION, DEMO } from './supabase.js'
import { BRAND, EVENT, PARTICIPANTS, colorFor, MISSION as MISSION_KEY } from './config.js'
import { groupByDay } from './agenda.js'
import EventForm from './EventForm.jsx'
import ShareButton, { shareUrl } from './ShareButton.jsx'
import ContactCard from './ContactCard.jsx'
import { getPerson, cardPath, DEFAULT_PERSON } from './contact.js'
import Portfolio from './Portfolio.jsx'
import Notes from './Notes.jsx'
import AccessGate from './AccessGate.jsx'
import { hasAccess } from './access.js'

const PUBLIC_PARAM = 'publico'
const CARD_PARAM = 'cartao'
const PORTFOLIO_PARAM = 'portfolio'
const NOTES_PARAM = 'notas'

// Dias oficiais do evento (destacados no calendário da Agenda), definidos em EVENT (config.js).
const COP_FIRST_DAY = EVENT.firstDay
const COP_LAST_DAY = EVENT.lastDay
function isCopDay(iso) {
  return iso >= COP_FIRST_DAY && iso <= COP_LAST_DAY
}
function todayIso() {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
// "Novembro 2026" (ou "Outubro – Novembro 2026" se os dias cruzarem meses).
function monthLabel(days) {
  const ms = [...new Set(days.map((d) => d.iso.slice(0, 7)))]
  const name = (ym) => MONTHS[Number(ym.slice(5, 7)) - 1]
  const year = ms[ms.length - 1].slice(0, 4)
  return ms.length === 1 ? `${name(ms[0])} ${year}` : `${name(ms[0])} – ${name(ms[ms.length - 1])} ${year}`
}

function isPublicMode() {
  return new URLSearchParams(window.location.search).has(PUBLIC_PARAM)
}
function isPortfolioLink() {
  return new URLSearchParams(window.location.search).has(PORTFOLIO_PARAM)
}
function isNotesLink() {
  return new URLSearchParams(window.location.search).has(NOTES_PARAM)
}
function isCardMode() {
  return new URLSearchParams(window.location.search).has(CARD_PARAM)
}

const TYPE_COLORS = {
  viagem: '#1C75BC',
  reuniao: '#6A1B9A',
  plenaria: '#124DA1',
  evento: '#167033',
  fala: '#DD3F3F',
  social: '#C2670E',
  campo: '#2E7D32',
  logistica: '#546051',
  livre: '#9AA08F',
}

const STATUS_ICON = {
  confirmed: '✅',
  done: '✔️',
  pending: '⏳',
  cancelled: '❌',
  alert: '⚠️',
}

const STATUS_CYCLE = ['confirmed', 'done', 'pending', 'cancelled']

const PRIORITY_ICON = {
  urgent: '🔴',
  important: '🟡',
  info: '🟢',
}

const PRIORITY_COLORS = {
  urgent: '#DD3F3F',
  important: '#EAB308',
  info: '#2BB958',
}

const ALL_TABS = [
  { key: 'agenda', label: 'Agenda', icon: '🗓️' },
  { key: 'portfolio', label: 'Portfólio', icon: '🌳' },
  { key: 'falas', label: 'Falas', icon: '🎤' },
  { key: 'notas', label: 'Notas', icon: '📝' },
  { key: 'alertas', label: 'Alertas', icon: '🔔' },
]
// Abas de cada painel vêm da config (painel da delegação não tem Portfólio, Cartão nem Alertas).
const TABS = ALL_TABS.filter((t) => BRAND.tabs.includes(t.key))
const PUBLIC_TABS = TABS.filter((t) => t.key === 'agenda' || t.key === 'portfolio')
const hasTab = (key) => TABS.some((t) => t.key === key)

const KEY_PREFIX = MISSION_KEY
const WHO_FILTER_KEY = `${KEY_PREFIX}-agenda-who`

function storageGet(key, fallback) {
  try {
    return window.localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}
function storageSet(key, value) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // sem localStorage: segue sem lembrar
  }
}

const EVENT_OPEN = new Date(EVENT.opening)

// Transforma URLs http(s) no texto do detalhe em links clicáveis (o resto segue como texto).
function Linkify({ text }) {
  const parts = text.split(/(https?:\/\/[^\s|]+)/g)
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noreferrer">
        {part.includes('drive.google.com') ? 'abrir no Drive ↗' : part}
      </a>
    ) : (
      part
    ),
  )
}

function useCountdown(target) {
  const [left, setLeft] = useState(() => Math.max(0, target - new Date()))
  useEffect(() => {
    const id = setInterval(() => setLeft(Math.max(0, target - new Date())), 1000)
    return () => clearInterval(id)
  }, [target])
  const totalSec = Math.floor(left / 1000)
  return {
    days: Math.floor(totalSec / 86400),
    hrs: Math.floor((totalSec % 86400) / 3600),
    min: Math.floor((totalSec % 3600) / 60),
    sec: totalSec % 60,
    reached: left <= 0,
  }
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function AlertCard({ u, onToggle, onDelete }) {
  return (
    <div
      className={`alert-card${u.read ? ' alert-card--done' : ''}`}
      style={{ '--priority-color': PRIORITY_COLORS[u.priority] || 'var(--ink-300)' }}
    >
      <div className="alert-card__head">
        <div className="alert-card__meta">
          {PRIORITY_ICON[u.priority] || 'ℹ️'} {u.source} · {new Date(u.created_at).toLocaleString('pt-BR')}
          {u.read && <span className="alert-card__done-tag">✔️ Realizado</span>}
        </div>
        <div className="alert-card__actions">
          <button
            className="pill-btn pill-btn--ok"
            onClick={() => onToggle(u)}
            title={u.read ? 'Marcar como pendente novamente' : 'Marcar como realizado'}
          >
            {u.read ? '↩️ Desfazer' : '✔️ Realizado'}
          </button>
          <button className="pill-btn pill-btn--danger" onClick={() => onDelete(u)} title="Excluir alerta">
            🗑️ Excluir
          </button>
        </div>
      </div>
      <div className={`alert-card__summary${u.read ? ' alert-card__summary--done' : ''}`}>{u.summary}</div>
    </div>
  )
}

export default function App() {
  const publicMode = isPublicMode()
  const cardMode = isCardMode()
  const [unlocked, setUnlocked] = useState(hasAccess)
  // Só o painel interno pede senha; ?publico e ?cartao são abertos.
  const locked = !publicMode && !cardMode && !unlocked
  const [events, setEvents] = useState([])
  const [notes, setNotes] = useState([])
  const [updates, setUpdates] = useState([])
  const [tab, setTab] = useState(
    isPortfolioLink() && hasTab('portfolio') ? 'portfolio' : isNotesLink() && !isPublicMode() && hasTab('notas') ? 'notas' : 'agenda',
  )
  const [selectedIso, setSelectedIso] = useState(null)
  const [whoFilter, setWhoFilter] = useState(() => storageGet(WHO_FILTER_KEY, 'Todos'))
  // null = fechado; { event: null } = novo compromisso; { event } = editar
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const countdown = useCountdown(EVENT_OPEN)

  useEffect(() => {
    // Modo cartão de visitas é uma página estática — não precisa do Supabase.
    // Painel trancado também não consulta o Supabase até liberar.
    if (cardMode || locked) {
      setLoading(false)
      return
    }
    async function load() {
      const [ev, no, up] = await Promise.all([
        supabase.from('mission_events').select('*').eq('mission', MISSION).order('date').order('sort_order'),
        supabase.from('mission_notes').select('*').eq('mission', MISSION).order('created_at', { ascending: false }),
        supabase.from('mission_updates').select('*').eq('mission', MISSION).order('created_at', { ascending: false }),
      ])
      if (ev.data) setEvents(ev.data)
      if (no.data) setNotes(no.data)
      if (up.data) setUpdates(up.data)
      setLoading(false)
    }
    load()

    const channel = supabase
      .channel(`${MISSION}-live`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mission_events', filter: `mission=eq.${MISSION}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mission_notes', filter: `mission=eq.${MISSION}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mission_updates', filter: `mission=eq.${MISSION}` }, load)
      .subscribe()

    // NÃO remover — é o que mantém o dashboard "ao vivo".
    return () => supabase.removeChannel(channel)
  }, [locked])

  // Agenda pública não mostra compromissos marcados como internos (ex.: agenda do chefe da delegação).
  const visibleEvents = useMemo(
    () => (publicMode ? events.filter((e) => e.visibility !== 'internal') : events),
    [events, publicMode],
  )
  // Filtro por participante só aparece quando algum compromisso tem participantes marcados.
  const whoOptions = useMemo(
    () => PARTICIPANTS.filter((p) => visibleEvents.some((e) => (e.who || []).includes(p))),
    [visibleEvents],
  )
  // Filtro guardado no aparelho que não existe mais na lista volta para "Todos".
  const activeWho = whoOptions.includes(whoFilter) ? whoFilter : 'Todos'
  const filteredEvents = useMemo(
    () => (activeWho === 'Todos' ? visibleEvents : visibleEvents.filter((e) => (e.who || []).includes(activeWho))),
    [visibleEvents, activeWho],
  )
  const days = useMemo(() => groupByDay(filteredEvents), [filteredEvents])
  const dayLabels = useMemo(() => {
    const m = {}
    for (const d of groupByDay(events)) if (d.day_label) m[d.iso] = d.day_label
    return m
  }, [events])
  const falas = useMemo(() => groupByDay(visibleEvents).flatMap((d) => d.items).filter((e) => e.type === 'fala'), [visibleEvents])
  const day = days.find((d) => d.iso === selectedIso) ?? days[0]
  const pendingAlerts = useMemo(() => updates.filter((u) => !u.read), [updates])
  const doneAlerts = useMemo(() => updates.filter((u) => u.read), [updates])
  const unreadAlerts = pendingAlerts.length

  if (locked) {
    return <AccessGate onUnlock={() => { setLoading(true); setUnlocked(true) }} />
  }

  // Modo cartão de visitas: página estática, renderizada isolada do resto do app.
  if (cardMode) {
    // ?cartao = primeira pessoa de PEOPLE (contact.js); ?cartao=<chave> = outra pessoa
    const { key, person } = getPerson((new URLSearchParams(window.location.search).get(CARD_PARAM) || DEFAULT_PERSON).toLowerCase())
    const cardUrl = `${window.location.origin}/${cardPath(key)}`
    return <ContactCard cardUrl={cardUrl} person={person} />
  }

  async function refreshEvents() {
    const { data } = await supabase.from('mission_events').select('*').eq('mission', MISSION)
    if (data) setEvents(data)
  }

  async function refreshNotes() {
    const { data } = await supabase.from('mission_notes').select('*').eq('mission', MISSION).order('created_at', { ascending: false })
    if (data) setNotes(data)
  }

  function chooseWho(name) {
    setWhoFilter(name)
    storageSet(WHO_FILTER_KEY, name)
  }

  async function cycleStatus(ev) {
    const idx = STATUS_CYCLE.indexOf(ev.status)
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length] ?? 'confirmed'
    await supabase.from('mission_events').update({ status: next, updated_at: new Date().toISOString() }).eq('id', ev.id)
  }

  async function toggleAlertRead(u) {
    await supabase.from('mission_updates').update({ read: !u.read }).eq('id', u.id)
  }

  async function deleteAlert(u) {
    if (!window.confirm('Excluir este alerta? Essa ação não pode ser desfeita.')) return
    await supabase.from('mission_updates').delete().eq('id', u.id)
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="hero__ring hero__ring--a" />
        <div className="hero__ring hero__ring--b" />
        <div className="hero__ring hero__ring--c" />
        <div className="hero__logo-row">
          <div className="hero__logo-chip">
            <img src={BRAND.heroLogo.src} alt={BRAND.heroLogo.alt} className="hero__logo" />
          </div>
        </div>
        <div className="hero__row">
          <div className="hero__brand">
            <div className="hero__title-group">
              <span className="hero__eyebrow">{BRAND.eyebrow}</span>
              <div className="hero__title">
                {EVENT.name} · <em>{EVENT.place}</em>
              </div>
              <div className="hero__subtitle">
                {BRAND.subtitle}
              </div>
              {publicMode && <span className="public-tag">👁️ Agenda pública</span>}
              {DEMO && <span className="public-tag" title="Sem Supabase configurado: dados de exemplo só neste navegador">🧪 Modo demonstração</span>}
            </div>
          </div>

          <div className="countdown">
            <span className="countdown__label">
              {countdown.reached ? 'Missão em andamento' : 'Abertura em'}
            </span>
            {!countdown.reached && (
              <div className="countdown__units">
                <div className="countdown__unit">
                  <span className="countdown__unit-value">{countdown.days}</span>
                  <span className="countdown__unit-name">dias</span>
                </div>
                <div className="countdown__unit">
                  <span className="countdown__unit-value">{pad(countdown.hrs)}</span>
                  <span className="countdown__unit-name">hrs</span>
                </div>
                <div className="countdown__unit">
                  <span className="countdown__unit-value">{pad(countdown.min)}</span>
                  <span className="countdown__unit-name">min</span>
                </div>
                <div className="countdown__unit">
                  <span className="countdown__unit-value">{pad(countdown.sec)}</span>
                  <span className="countdown__unit-name">seg</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="nav">
        {(publicMode ? PUBLIC_TABS : TABS).map((t) => (
          <button
            key={t.key}
            className={`tab-btn${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <span className="tab-btn__icon">{t.icon}</span>
            {t.label}
            {t.key === 'alertas' && unreadAlerts > 0 && <span className="tab-btn__badge">{unreadAlerts}</span>}
          </button>
        ))}
        {!publicMode && (
          <>
            <a className="tab-btn tab-btn--link" href="?publico" target="_blank" rel="noreferrer" title="Abrir versão pública da agenda, sem edição">
              <span className="tab-btn__icon">👁️</span>Agenda pública
            </a>
            {BRAND.showCard && (
              <a className="tab-btn tab-btn--link" href="?cartao" target="_blank" rel="noreferrer" title="Abrir cartão de visitas digital">
                <span className="tab-btn__icon">👤</span>Cartão
              </a>
            )}
          </>
        )}
      </nav>

      {loading ? (
        <div className="section empty">Carregando…</div>
      ) : (
        <main className="main">
          {tab === 'agenda' && (
            <div className="agenda-layout">
              <aside className="day-sidebar">
                {days.length === 0 && <div className="empty" style={{ padding: '0 8px' }}>Nenhum evento cadastrado ainda.</div>}
                {days.map((d) => (
                  <div
                    key={d.iso}
                    className={`day-item${day === d ? ' active' : ''}${isCopDay(d.iso) ? ' is-cop' : ''}`}
                    onClick={() => setSelectedIso(d.iso)}
                  >
                    <div className="day-item__meta">{d.weekday} · {d.date}</div>
                    <div className="day-item__label">{d.day_label || `${d.items.length} compromisso${d.items.length > 1 ? 's' : ''}`}</div>
                  </div>
                ))}
              </aside>

              <section className="section">
                {days.length > 0 && (
                  <div className="date-grid-wrap">
                    <div className="date-grid__head">
                      <span className="date-grid__month">{monthLabel(days)}</span>
                      <span className="date-grid__legend">
                        <i aria-hidden="true" /> {EVENT.dayLegend}
                      </span>
                    </div>
                    <div className="date-grid" role="group" aria-label="Escolher o dia">
                      {days.map((d) => (
                        <button
                          key={d.iso}
                          type="button"
                          className={`date-tile${day === d ? ' active' : ''}${isCopDay(d.iso) ? ' is-cop' : ''}${d.iso === todayIso() ? ' is-today' : ''}`}
                          aria-pressed={day === d}
                          aria-label={`${d.weekday} ${d.date}`}
                          onClick={() => setSelectedIso(d.iso)}
                        >
                          <small>{d.weekday.slice(0, 3)}</small>
                          <b>{d.date.slice(0, 2)}</b>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="agenda-toolbar">
                  {whoOptions.length > 0 && (
                    <label className="who-select">
                      <span className="who-select__label">👥 Participantes:</span>
                      <select value={activeWho} onChange={(e) => chooseWho(e.target.value)}>
                        {['Todos', ...whoOptions].map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <div className="agenda-toolbar__actions">
                    {!publicMode && (
                      <button type="button" className="add-event-btn add-event-btn--inline" onClick={() => setForm({ event: null })}>
                        ＋ Compromisso
                      </button>
                    )}
                    <ShareButton
                      compact
                      url={shareUrl('?publico')}
                      title={BRAND.share.agenda.title}
                      text={BRAND.share.agenda.text}
                    />
                  </div>
                </div>
                {!publicMode && (
                  <button type="button" className="add-event-fab" onClick={() => setForm({ event: null })}>
                    ＋ Compromisso
                  </button>
                )}

                {day ? (
                  <>
                    <span className="section__eyebrow">🗓️ Roteiro do dia</span>
                    <h2 className="section__title">
                      {day.weekday} · {day.date}
                      {day.day_label ? ` — ${day.day_label}` : ''}
                    </h2>
                    {day.items.map((ev) => (
                      <div key={ev.id} className="event-card">
                        <div className="event-card__type-row">
                          <span className="event-card__dot" style={{ '--type-color': TYPE_COLORS[ev.type] || '#c7c9bc' }} />
                          <span className="event-card__time">{ev.time}</span>
                        </div>
                        <div className="event-card__head">
                          <span className="event-card__title">{ev.title}</span>
                          {publicMode ? (
                            <span className="event-card__status event-card__status--readonly">
                              {STATUS_ICON[ev.status] || '❔'}
                            </span>
                          ) : (
                            <span className="event-card__status" onClick={() => cycleStatus(ev)} title="Clique para mudar status">
                              {STATUS_ICON[ev.status] || '❔'}
                            </span>
                          )}
                        </div>
                        {(ev.who?.length > 0 || ev.visibility === 'internal') && (
                          <div className="event-card__tags">
                            {(ev.who || []).map((w) => (
                              <span key={w} className="who-tag" style={{ '--who-color': colorFor(w, PARTICIPANTS) }}>
                                {w}
                              </span>
                            ))}
                            {ev.visibility === 'internal' && <span className="internal-tag">🔒 interno</span>}
                          </div>
                        )}
                        {(publicMode ? ev.public_detail : ev.detail) && (
                          <div className="event-card__detail">
                            <Linkify text={publicMode ? ev.public_detail : ev.detail} />
                          </div>
                        )}
                        <div className="event-card__meta-row">
                          {!publicMode && ev.address && (
                            <a
                              className="event-card__address"
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.address)}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              📍 {ev.address}
                            </a>
                          )}
                          {!publicMode && ev.transit_next && <span className="event-card__transit">{ev.transit_next}</span>}
                          {!publicMode && (
                            <button type="button" className="event-card__edit" onClick={() => setForm({ event: ev })}>
                              ✏️ Editar
                            </button>
                          )}
                        </div>
                        {!publicMode && ev.created_by && <div className="event-card__by">inserido por {ev.created_by}</div>}
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="empty">
                    {activeWho !== 'Todos' ? `Nenhum compromisso com ${activeWho}.` : 'Nenhum compromisso cadastrado ainda.'}
                  </div>
                )}
              </section>
            </div>
          )}

          {tab === 'portfolio' && <Portfolio />}

          {tab === 'falas' && (
            <section className="section">
              <span className="section__eyebrow">🎤 Intervenções</span>
              <h2 className="section__title">Falas da delegação</h2>
              {falas.length === 0 && <div className="empty">Nenhuma fala confirmada ainda.</div>}
              {falas.map((ev) => (
                <div key={ev.id} className="event-card">
                  <div className="event-card__type-row">
                    <span className="event-card__dot" style={{ '--type-color': '#DD3F3F' }} />
                    <span className="event-card__time">{ev.date} · {ev.time}</span>
                  </div>
                  <div className="event-card__title">{ev.title}</div>
                  {ev.detail && (
                    <div className="event-card__detail">
                      <Linkify text={ev.detail} />
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {tab === 'notas' && <Notes notes={notes} onChanged={refreshNotes} />}

          {tab === 'alertas' && (
            <section className="section">
              <span className="section__eyebrow">🔔 Acompanhamento</span>
              <h2 className="section__title">Alertas e atualizações</h2>
              {updates.length === 0 && <div className="empty">Nenhum alerta ainda.</div>}

              {updates.length > 0 && (
                <>
                  <h3 className="section-heading section-heading--pending">
                    Pendentes <span className="section-heading__count">{pendingAlerts.length}</span>
                  </h3>
                  {pendingAlerts.length === 0 && <div className="empty" style={{ marginBottom: 20 }}>Nenhum alerta pendente — tudo em dia.</div>}
                  {pendingAlerts.map((u) => (
                    <AlertCard key={u.id} u={u} onToggle={toggleAlertRead} onDelete={deleteAlert} />
                  ))}

                  <h3 className="section-heading">
                    Concluídos <span className="section-heading__count">{doneAlerts.length}</span>
                  </h3>
                  {doneAlerts.length === 0 && <div className="empty">Nenhum alerta concluído ainda.</div>}
                  {doneAlerts.map((u) => (
                    <AlertCard key={u.id} u={u} onToggle={toggleAlertRead} onDelete={deleteAlert} />
                  ))}
                </>
              )}
            </section>
          )}
        </main>
      )}

      {form && (
        <EventForm
          event={form.event}
          defaultIso={day?.iso}
          dayLabels={dayLabels}
          onClose={(changed) => {
            setForm(null)
            if (changed) refreshEvents()
          }}
        />
      )}

      <footer className="app-footer">
        {BRAND.footerLogos.map((l) => (
          <img key={l.src} src={l.src} alt={l.alt} className="app-footer__logo" />
        ))}
      </footer>
    </div>
  )
}
