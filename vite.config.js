import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Textos do index.html (título e prévia de link do WhatsApp/redes). Padrão = painel principal.
// O painel da comitiva sobrescreve via variáveis VITE_* no projeto Vercel dele.
// VITE_OG_URL e VITE_OG_IMAGE precisam ser endereços completos (https://...) para a prévia funcionar.
const HTML_DEFAULTS = {
  VITE_SITE_TITLE: 'Agenda da missão',
  VITE_DESCRIPTION: 'Agenda ao vivo da delegação: compromissos, painéis e portfólio. Live delegation agenda.',
  VITE_OG_SITE_NAME: 'Agenda da missão',
  VITE_OG_TITLE: 'Agenda ao vivo da delegação',
  VITE_OG_DESCRIPTION: 'Acompanhe a agenda da delegação e acesse materiais e contatos. · Live agenda and portfolio.',
  VITE_OG_URL: '/',
  VITE_OG_IMAGE: '/og-image.jpg',
}

// Nome do atalho na tela inicial do celular (manifest e iPhone), por painel.
const APP_NAMES = {
  principal: { VITE_APP_NAME: 'Agenda da missão', VITE_APP_SHORT_NAME: 'Agenda' },
  comitiva: { VITE_APP_NAME: 'Agenda da comitiva', VITE_APP_SHORT_NAME: 'Comitiva' },
}

// Caminho do hotsite (igual a HOTSITE_PATH em src/config.js e ao vercel.json).
const HOTSITE = 'sobre'

// Ícones em public/: apple-touch-icon.png, icon-192/512, icon-maskable-512.
function manifestJson(env) {
  return JSON.stringify(
    {
      name: env.VITE_APP_NAME,
      short_name: env.VITE_APP_SHORT_NAME,
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#FFFFFF',
      theme_color: '#0C1812',
      lang: 'pt-BR',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    null,
    2,
  )
}

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export default defineConfig(({ mode }) => {
  const loaded = loadEnv(mode, process.cwd(), 'VITE_')
  const brand = loaded.VITE_BRAND === 'comitiva' ? 'comitiva' : 'principal'
  const env = { ...HTML_DEFAULTS, ...APP_NAMES[brand], ...loaded }
  return {
    // Duas páginas: o painel (index.html) e o hotsite de uma página (sobre/index.html → /sobre).
    build: {
      rollupOptions: {
        input: { main: 'index.html', hotsite: `${HOTSITE}/index.html` },
      },
    },
    plugins: [
      react(),
      {
        name: 'html-texts-por-painel',
        transformIndexHtml: {
          order: 'pre',
          handler: (html) => html.replace(/%(VITE_[A-Z_]+)%/g, (m, key) => (key in env ? escapeHtml(env[key]) : m)),
        },
      },
      {
        // /sobre (sem barra, como gravado em QR/NFC) abre o hotsite também no `vite dev`/`preview`.
        // Em produção quem faz isso é o rewrite do vercel.json.
        name: 'hotsite-sem-barra',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === `/${HOTSITE}` || req.url.startsWith(`/${HOTSITE}?`)) req.url = req.url.replace(`/${HOTSITE}`, `/${HOTSITE}/`)
            next()
          })
        },
        configurePreviewServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === `/${HOTSITE}` || req.url.startsWith(`/${HOTSITE}?`)) req.url = req.url.replace(`/${HOTSITE}`, `/${HOTSITE}/`)
            next()
          })
        },
      },
      {
        name: 'manifest-por-painel',
        configureServer(server) {
          server.middlewares.use('/manifest.webmanifest', (req, res) => {
            res.setHeader('Content-Type', 'application/manifest+json')
            res.end(manifestJson(env))
          })
        },
        generateBundle() {
          this.emitFile({ type: 'asset', fileName: 'manifest.webmanifest', source: manifestJson(env) })
        },
      },
    ],
  }
})
