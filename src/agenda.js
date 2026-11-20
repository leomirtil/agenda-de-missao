// Utilidades de data da Agenda: agrupamento e ordenação por dia, independentes do texto de `day_label`.
const YEAR = 2026
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const pad2 = (n) => String(n).padStart(2, '0')

// Data ISO (YYYY-MM-DD) do evento: usa `event_date` quando existe; senão deriva de `date` ("DD/MM").
export function isoOf(ev) {
  if (ev.event_date) return String(ev.event_date).slice(0, 10)
  const m = /^(\d{1,2})\/(\d{1,2})/.exec(ev.date || '')
  return m ? `${YEAR}-${pad2(m[2])}-${pad2(m[1])}` : '9999-12-31'
}

export function dayMonth(iso) {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

export function weekdayOf(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return WEEKDAYS[new Date(y, m - 1, d).getDay()]
}

// Minutos do início do horário ("09:45–11:00" → 585). Sem hora: "manhã" ~08:00, "tarde" ~14:00,
// "noite" ~19:00; textos como "A def." ou "Consulta" vão para o fim do dia.
export function startMinutes(time) {
  const t = time || ''
  const m = /(\d{1,2})[:h](\d{2})/.exec(t)
  if (m) return Number(m[1]) * 60 + Number(m[2])
  if (/manh[ãa]/i.test(t)) return 8 * 60
  if (/tarde/i.test(t)) return 14 * 60
  if (/noite/i.test(t)) return 19 * 60
  return 24 * 60
}

// Ordem cronológica: data, depois hora de início; `sort_order` só desempata horários iguais.
export function sortEvents(events) {
  return [...events].sort(
    (a, b) =>
      isoOf(a).localeCompare(isoOf(b)) ||
      startMinutes(a.time) - startMinutes(b.time) ||
      (a.sort_order ?? 0) - (b.sort_order ?? 0),
  )
}

// Um grupo por data. O título do dia é o primeiro `day_label` preenchido daquela data.
export function groupByDay(events) {
  const map = new Map()
  for (const e of sortEvents(events)) {
    const iso = isoOf(e)
    if (!map.has(iso)) map.set(iso, { iso, date: dayMonth(iso), weekday: e.weekday || weekdayOf(iso), day_label: '', items: [] })
    const g = map.get(iso)
    if (!g.day_label && e.day_label) g.day_label = e.day_label
    g.items.push(e)
  }
  return Array.from(map.values())
}
