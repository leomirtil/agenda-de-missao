import { createClient } from '@supabase/supabase-js'
import { createDemoClient } from './demo-client.js'

// Conexão com o Supabase vem das variáveis de ambiente (arquivo .env local ou painel do Vercel):
//   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
//   VITE_SUPABASE_ANON_KEY=eyJ...
// A anon key vai no navegador por desenho (RLS pública, app temporário). Ver README e supabase/schema.sql.
//
// Sem essas variáveis o app roda em MODO DEMONSTRAÇÃO: dados de exemplo guardados só neste navegador
// (localStorage), sem tempo real entre aparelhos. Bom para testar o visual antes de criar o banco.
const URL = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const DEMO = !(URL && KEY)
export const supabase = DEMO ? createDemoClient() : createClient(URL, KEY)

// Identificador desta missão (coluna `mission`) — todas as consultas filtram por ele.
export { MISSION } from './config.js'
