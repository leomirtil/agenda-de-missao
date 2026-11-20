// Portão de acesso simples ao dashboard interno (agenda completa, falas, notas, alertas).
// ?publico e ?cartao NÃO passam por aqui. É só um portão de interface: o hash abaixo vai no
// bundle do navegador e o Supabase continua com RLS pública — não é segurança forte.
//
// Para trocar a senha:  printf '%s' 'NOVA_SENHA' | sha256sum   → colar em ACCESS_HASH (src/config.js, painel
// principal) ou na variável VITE_ACCESS_HASH do projeto Vercel (painel da comitiva).
// A mudança desloga todo mundo (o navegador guarda o próprio hash).
import { ACCESS_HASH, MISSION } from './config.js'

export { ACCESS_HASH }

// Cada missão guarda a liberação numa chave própria do navegador.
const STORAGE_KEY = `agenda-access-${MISSION}`

export async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function hasAccess() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === ACCESS_HASH
  } catch {
    return false
  }
}

export async function tryUnlock(password) {
  const hash = await sha256Hex(password.trim())
  if (hash !== ACCESS_HASH) return false
  try {
    window.localStorage.setItem(STORAGE_KEY, hash)
  } catch {
    // sem localStorage: libera só nesta sessão da página
  }
  return true
}
