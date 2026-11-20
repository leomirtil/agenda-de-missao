import { useState } from 'react'
import { supabase, MISSION } from './supabase.js'
import { EVENT, PARTICIPANTS, INTERNAL_BY_DEFAULT, NOTE_AUTHORS, colorFor } from './config.js'
import { isoOf, dayMonth, weekdayOf } from './agenda.js'

// Tipos oferecidos no formulário (as cores ficam em TYPE_COLORS, no App).
export const TYPE_LABELS = {
  evento: 'Evento',
  fala: 'Fala / painel',
  reuniao: 'Reunião / bilateral',
  plenaria: 'Plenária / sessão oficial',
  social: 'Recepção / social',
  campo: 'Visita de campo',
  viagem: 'Viagem',
  logistica: 'Logística',
  livre: 'Livre',
}

const STATUS_LABELS = {
  pending: '⏳ Pendente',
  confirmed: '✅ Confirmado',
  done: '✔️ Realizado',
  cancelled: '❌ Cancelado',
}

const KEY_PREFIX = MISSION
const BY_KEY = `${KEY_PREFIX}-events-by`

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

const needsInternal = (who) => who.some((w) => INTERNAL_BY_DEFAULT.includes(w))

// Formulário de criar/editar compromisso. `event` = null para novo; `defaultIso` = dia selecionado na Agenda.
// `dayLabels` = { 'YYYY-MM-DD': 'título do dia' } já usados, para reaproveitar o nome do dia.
export default function EventForm({ event, defaultIso, dayLabels, onClose }) {
  const editing = Boolean(event)
  const [iso, setIso] = useState(editing ? isoOf(event) : defaultIso || '2026-11-09')
  const [time, setTime] = useState(event?.time ?? '')
  const [title, setTitle] = useState(event?.title ?? '')
  const [who, setWho] = useState(event?.who ?? [])
  const [address, setAddress] = useState(event?.address ?? '')
  const [detail, setDetail] = useState(event?.detail ?? '')
  const [publicDetail, setPublicDetail] = useState(event?.public_detail ?? '')
  const [type, setType] = useState(event?.type ?? 'evento')
  const [status, setStatus] = useState(event?.status ?? 'pending')
  const [visibility, setVisibility] = useState(event?.visibility ?? 'public')
  const [visTouched, setVisTouched] = useState(editing)
  const [dayLabel, setDayLabel] = useState(event?.day_label ?? '')
  const [by, setBy] = useState(() => storageGet(BY_KEY, ''))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function toggleWho(name) {
    const next = who.includes(name) ? who.filter((w) => w !== name) : [...who, name]
    setWho(next)
    // Compromissos de quem está em INTERNAL_BY_DEFAULT nascem internos (fora da agenda pública), até alguém mudar à mão.
    if (!visTouched) setVisibility(needsInternal(next) ? 'internal' : 'public')
  }

  async function save(e) {
    e.preventDefault()
    if (!title.trim() || !iso || saving) return
    if (!by.trim()) {
      setError('Informe quem está inserindo (campo "Inserido por").')
      return
    }
    setSaving(true)
    setError('')
    storageSet(BY_KEY, by.trim())
    const label = dayLabel.trim() || dayLabels[iso] || ''
    const row = {
      mission: MISSION,
      event_date: iso,
      date: dayMonth(iso),
      weekday: weekdayOf(iso),
      day_label: label,
      time: time.trim() || 'A def.',
      title: title.trim(),
      who,
      address: address.trim() || null,
      detail: detail.trim(),
      public_detail: publicDetail.trim() || null,
      type,
      status,
      visibility,
      created_by: by.trim(),
      phase: type === 'viagem' ? 'viagem' : 'evento',
      location: event?.location || EVENT.defaultLocation,
      updated_at: new Date().toISOString(),
    }
    const { error: err } = editing
      ? await supabase.from('mission_events').update(row).eq('id', event.id).eq('mission', MISSION)
      : await supabase
          .from('mission_events')
          .insert({ ...row, id: `${MISSION}_${Date.now().toString(36)}`, sort_order: 50 })
    setSaving(false)
    if (err) {
      setError('Não foi possível salvar. Confira a conexão e tente de novo.')
      return
    }
    onClose(true)
  }

  async function remove() {
    if (!window.confirm('Excluir este compromisso? Essa ação não pode ser desfeita.')) return
    const { error: err } = await supabase.from('mission_events').delete().eq('id', event.id).eq('mission', MISSION)
    if (err) {
      setError('Não foi possível excluir. Tente de novo.')
      return
    }
    onClose(true)
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={editing ? 'Editar compromisso' : 'Novo compromisso'}>
      <form className="modal__card event-form" onSubmit={save}>
        <div className="modal__head">
          <h2 className="modal__title">{editing ? 'Editar compromisso' : 'Novo compromisso'}</h2>
          <button type="button" className="modal__close" onClick={() => onClose(false)} aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="event-form__row">
          <label className="field">
            <span>Dia</span>
            <input type="date" value={iso} min="2026-10-01" max="2026-11-30" onChange={(e) => e.target.value && setIso(e.target.value)} required />
          </label>
          <label className="field">
            <span>Horário ({EVENT.timeZoneLabel})</span>
            <input type="text" placeholder="ex.: 09:45–11:00" value={time} onChange={(e) => setTime(e.target.value)} />
          </label>
        </div>

        <label className="field">
          <span>Título</span>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex.: Reunião bilateral com…" required />
        </label>

        <div className="field">
          <span>Quem participa</span>
          <div className="who-chips">
            {PARTICIPANTS.map((p) => (
              <button
                key={p}
                type="button"
                className={`who-chip${who.includes(p) ? ' active' : ''}`}
                style={{ '--who-color': colorFor(p, PARTICIPANTS) }}
                aria-pressed={who.includes(p)}
                onClick={() => toggleWho(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <label className="field">
          <span>Local / endereço</span>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="ex.: Pavilhão 2, Centro de Convenções" />
        </label>

        <label className="field">
          <span>Detalhes</span>
          <textarea rows={3} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Pauta, contatos, observações (links ficam clicáveis)" />
        </label>

        <label className="field">
          <span>Resumo para a agenda pública</span>
          <textarea
            rows={2}
            value={publicDetail}
            onChange={(e) => setPublicDetail(e.target.value)}
            placeholder="1 ou 2 frases: quem da delegação participa e onde. Os detalhes acima não aparecem na agenda pública."
          />
        </label>

        <div className="event-form__row">
          <label className="field">
            <span>Tipo</span>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="field">
          <span>Visibilidade</span>
          <div className="vis-toggle" role="group" aria-label="Visibilidade">
            {[
              ['public', '🌐 Público', 'aparece na agenda pública'],
              ['internal', '🔒 Interno', 'só no painel com senha'],
            ].map(([k, label, hint]) => (
              <button
                key={k}
                type="button"
                className={`vis-toggle__btn${visibility === k ? ' active' : ''}`}
                aria-pressed={visibility === k}
                onClick={() => {
                  setVisibility(k)
                  setVisTouched(true)
                }}
              >
                {label}
                <small>{hint}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="event-form__row">
          <label className="field">
            <span>Nome do dia (opcional)</span>
            <input type="text" value={dayLabel} onChange={(e) => setDayLabel(e.target.value)} placeholder={dayLabels[iso] || 'ex.: 🌍 Abertura'} />
          </label>
          <label className="field">
            <span>Inserido por</span>
            <input type="text" list="event-form-by" value={by} onChange={(e) => setBy(e.target.value)} placeholder="Nome / órgão" />
            <datalist id="event-form-by">
              {NOTE_AUTHORS.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </label>
        </div>

        {error && (
          <div className="notes-error" role="alert">
            {error}
          </div>
        )}

        <div className="modal__foot">
          {editing && (
            <button type="button" className="pill-btn pill-btn--danger" onClick={remove}>
              🗑️ Excluir
            </button>
          )}
          <span className="modal__spacer" />
          <button type="button" className="pill-btn" onClick={() => onClose(false)}>
            Cancelar
          </button>
          <button type="submit" className="notes-save" disabled={!title.trim() || saving}>
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}
