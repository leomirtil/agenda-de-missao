// Cliente falso do Supabase para o MODO DEMONSTRAÇÃO (sem VITE_SUPABASE_URL).
// Implementa só o que o app usa: from().select().eq().order(), insert, update, delete e channel().
// Os dados ficam no localStorage deste navegador. Apague a chave 'agenda-demo-db' para recomeçar.
import { DEMO_DATA } from './demo-data.js'

const STORE = 'agenda-demo-db'
const listeners = new Set()

function loadDb() {
  try {
    const raw = window.localStorage.getItem(STORE)
    if (raw) return JSON.parse(raw)
  } catch {
    // sem localStorage: usa os dados de exemplo em memória
  }
  return JSON.parse(JSON.stringify(DEMO_DATA))
}
let db = loadDb()
function save() {
  try {
    window.localStorage.setItem(STORE, JSON.stringify(db))
  } catch {
    // ignora
  }
  listeners.forEach((fn) => setTimeout(fn, 0))
}

const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`)

class Query {
  constructor(table) {
    this.table = table
    this.op = 'select'
    this.filters = []
    this.orders = []
  }
  select() {
    return this
  }
  eq(col, val) {
    this.filters.push((r) => r[col] === val)
    return this
  }
  in(col, vals) {
    this.filters.push((r) => vals.includes(r[col]))
    return this
  }
  neq(col, val) {
    this.filters.push((r) => r[col] !== val)
    return this
  }
  gte(col, val) {
    this.filters.push((r) => (r[col] ?? '') >= val)
    return this
  }
  lte(col, val) {
    this.filters.push((r) => (r[col] ?? '') <= val)
    return this
  }
  order(col, opts = {}) {
    this.orders.push([col, opts.ascending !== false])
    return this
  }
  limit() {
    return this
  }
  insert(row) {
    this.op = 'insert'
    this.payload = Array.isArray(row) ? row : [row]
    return this
  }
  update(patch) {
    this.op = 'update'
    this.payload = patch
    return this
  }
  delete() {
    this.op = 'delete'
    return this
  }
  run() {
    const rows = db[this.table] || (db[this.table] = [])
    const match = (r) => this.filters.every((f) => f(r))
    if (this.op === 'insert') {
      const now = new Date().toISOString()
      const added = this.payload.map((r) => ({ id: uuid(), created_at: now, ...r }))
      rows.push(...added)
      save()
      return { data: added, error: null }
    }
    if (this.op === 'update') {
      const changed = rows.filter(match)
      changed.forEach((r) => Object.assign(r, this.payload))
      save()
      return { data: changed, error: null }
    }
    if (this.op === 'delete') {
      db[this.table] = rows.filter((r) => !match(r))
      save()
      return { data: null, error: null }
    }
    let out = rows.filter(match)
    for (const [col, asc] of [...this.orders].reverse()) {
      out = [...out].sort((a, b) => {
        const x = a[col] ?? ''
        const y = b[col] ?? ''
        return (x > y ? 1 : x < y ? -1 : 0) * (asc ? 1 : -1)
      })
    }
    return { data: out.map((r) => ({ ...r })), error: null }
  }
  then(resolve, reject) {
    return Promise.resolve().then(() => this.run()).then(resolve, reject)
  }
}

export function createDemoClient() {
  return {
    from: (table) => new Query(table),
    channel() {
      const ch = {
        on(_evt, _opts, fn) {
          listeners.add(fn)
          ch.fns = [...(ch.fns || []), fn]
          return ch
        },
        subscribe() {
          return ch
        },
      }
      return ch
    },
    removeChannel(ch) {
      ;(ch.fns || []).forEach((fn) => listeners.delete(fn))
    },
  }
}
