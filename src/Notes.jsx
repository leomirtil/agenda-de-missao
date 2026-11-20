import { useMemo, useState } from 'react'
import { supabase, MISSION } from './supabase.js'
import { NOTE_AUTHORS, colorFor } from './config.js'

// Autores vêm da config de cada painel (NOTE_AUTHORS em config.js).
const AUTHORS = NOTE_AUTHORS.map((name) => ({ name, color: colorFor(name, NOTE_AUTHORS) }))
const OTHER = 'Outro'
const KEY_PREFIX = MISSION
const AUTHOR_KEY = `${KEY_PREFIX}-notes-author`
const DRAFT_KEY = `${KEY_PREFIX}-notes-draft`
const OTHER_NAME_KEY = `${KEY_PREFIX}-notes-other-name`

function storageGet(key, fallback) {
  try {
    return window.localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}
function storageSet(key, value) {
  try {
    if (value) window.localStorage.setItem(key, value)
    else window.localStorage.removeItem(key)
  } catch {
    // sem localStorage: segue sem lembrar
  }
}

const pad2 = (n) => String(n).padStart(2, '0')
function todayIso() {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}
// "2026-11-11" -> "11/11" (formato usado em mission_notes.date)
function isoToDayMonth(iso) {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}
function timeOf(createdAt) {
  if (!createdAt) return ''
  const d = new Date(createdAt)
  return Number.isNaN(d.getTime()) ? '' : `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}
const colorOf = (name) => AUTHORS.find((a) => a.name === name)?.color ?? '#546051'
const isKnown = (name) => AUTHORS.some((a) => a.name === name)

export default function Notes({ notes, onChanged }) {
  const [author, setAuthor] = useState(() => {
    const saved = storageGet(AUTHOR_KEY, AUTHORS[0]?.name ?? OTHER)
    return isKnown(saved) || saved === OTHER ? saved : AUTHORS[0]?.name ?? OTHER
  })
  const [otherName, setOtherName] = useState(() => storageGet(OTHER_NAME_KEY, ''))
  const authorName = author === OTHER ? otherName.trim() : author
  const [dateIso, setDateIso] = useState(todayIso)
  const [text, setText] = useState(() => storageGet(DRAFT_KEY, ''))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('Todos')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  function chooseAuthor(name) {
    setAuthor(name)
    storageSet(AUTHOR_KEY, name)
  }
  function changeText(v) {
    setText(v)
    storageSet(DRAFT_KEY, v)
    if (error) setError('')
  }

  async function save() {
    const content = text.trim()
    if (!content || saving || !authorName) return
    setSaving(true)
    setError('')
    const { error: err } = await supabase
      .from('mission_notes')
      .insert({ mission: MISSION, author: authorName, date: isoToDayMonth(dateIso), content })
    setSaving(false)
    if (err) {
      setError('Não foi possível salvar. Confira a conexão e tente de novo (o texto foi mantido).')
      return
    }
    setText('')
    storageSet(DRAFT_KEY, '')
    onChanged?.()
  }

  async function saveEdit(id) {
    const content = editText.trim()
    if (!content) return
    const { error: err } = await supabase.from('mission_notes').update({ content }).eq('id', id).eq('mission', MISSION)
    if (err) {
      setError('Não foi possível salvar a edição. Tente de novo.')
      return
    }
    setEditingId(null)
    onChanged?.()
  }

  async function remove(n) {
    if (!window.confirm('Excluir esta nota? Essa ação não pode ser desfeita.')) return
    const { error: err } = await supabase.from('mission_notes').delete().eq('id', n.id).eq('mission', MISSION)
    if (err) {
      setError('Não foi possível excluir a nota. Tente de novo.')
      return
    }
    onChanged?.()
  }

  const counts = useMemo(() => {
    const c = { Todos: notes.length }
    for (const a of AUTHORS) c[a.name] = notes.filter((n) => n.author === a.name).length
    c[OTHER] = notes.filter((n) => !isKnown(n.author)).length
    return c
  }, [notes])

  const groups = useMemo(() => {
    const visible =
      filter === 'Todos' ? notes : filter === OTHER ? notes.filter((n) => !isKnown(n.author)) : notes.filter((n) => n.author === filter)
    const map = new Map()
    for (const n of visible) {
      if (!map.has(n.date)) map.set(n.date, [])
      map.get(n.date).push(n)
    }
    return Array.from(map.entries())
  }, [notes, filter])

  return (
    <section className="section notes">
      <span className="section__eyebrow">📝 Diário de missão</span>
      <h2 className="section__title">Notas da missão</h2>

      <div className="notes-composer">
        <div className="notes-composer__row">
          <div className="author-chips" role="group" aria-label="Quem está anotando">
            {[...AUTHORS, { name: OTHER, color: '#546051' }].map((a) => (
              <button
                key={a.name}
                type="button"
                className={`author-chip${author === a.name ? ' active' : ''}`}
                style={{ '--author-color': a.color }}
                aria-pressed={author === a.name}
                onClick={() => chooseAuthor(a.name)}
              >
                {a.name}
              </button>
            ))}
          </div>
          {author === OTHER && (
            <input
              className="notes-other-name"
              type="text"
              placeholder="Seu nome / órgão"
              value={otherName}
              onChange={(e) => {
                setOtherName(e.target.value)
                storageSet(OTHER_NAME_KEY, e.target.value)
              }}
            />
          )}
          <label className="notes-date">
            <span>Dia</span>
            <input type="date" value={dateIso} onChange={(e) => e.target.value && setDateIso(e.target.value)} />
          </label>
        </div>
        <textarea
          className="notes-textarea"
          rows={4}
          placeholder={`Anotação de ${authorName || 'quem escreve'}: reunião, contato, combinado, ideia…`}
          value={text}
          onChange={(e) => changeText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') save()
          }}
        />
        {error && <div className="notes-error" role="alert">{error}</div>}
        <div className="notes-composer__foot">
          <span className="notes-hint">Ctrl/⌘ + Enter salva · o rascunho fica guardado neste aparelho</span>
          <button type="button" className="notes-save" onClick={save} disabled={!text.trim() || saving || !authorName}>
            {saving ? 'Salvando…' : 'Salvar nota'}
          </button>
        </div>
      </div>

      <div className="notes-filter" role="group" aria-label="Filtrar por autor">
        {['Todos', ...AUTHORS.map((a) => a.name), OTHER].map((f) => (
          <button
            key={f}
            type="button"
            className={`notes-filter__btn${filter === f ? ' active' : ''}`}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f} <span className="notes-filter__count">{counts[f]}</span>
          </button>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="empty">
          {notes.length === 0 ? 'Nenhuma nota ainda. Escreva a primeira acima.' : `Nenhuma nota de ${filter}.`}
        </div>
      )}

      {groups.map(([day, items]) => (
        <div key={day} className="notes-day">
          <h3 className="section-heading">
            {day} <span className="section-heading__count">{items.length}</span>
          </h3>
          {items.map((n) => (
            <div key={n.id} className="note-card" style={{ '--author-color': colorOf(n.author) }}>
              <div className="note-card__top">
                <span className="note-author">{n.author}</span>
                <span className="note-card__meta">{timeOf(n.created_at)}</span>
                <span className="note-card__actions">
                  {editingId !== n.id && (
                    <>
                      <button type="button" className="pill-btn pill-btn--ok" onClick={() => { setEditingId(n.id); setEditText(n.content) }}>
                        Editar
                      </button>
                      <button type="button" className="pill-btn pill-btn--danger" onClick={() => remove(n)}>
                        Excluir
                      </button>
                    </>
                  )}
                </span>
              </div>
              {editingId === n.id ? (
                <>
                  <textarea className="notes-textarea" rows={4} value={editText} onChange={(e) => setEditText(e.target.value)} />
                  <div className="notes-composer__foot">
                    <button type="button" className="pill-btn pill-btn--danger" onClick={() => setEditingId(null)}>
                      Cancelar
                    </button>
                    <button type="button" className="notes-save" onClick={() => saveEdit(n.id)} disabled={!editText.trim()}>
                      Salvar edição
                    </button>
                  </div>
                </>
              ) : (
                <div className="note-card__content note-card__content--text">{n.content}</div>
              )}
            </div>
          ))}
        </div>
      ))}
    </section>
  )
}
