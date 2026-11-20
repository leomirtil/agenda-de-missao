// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURAÇÃO DA MISSÃO — o principal arquivo a editar.
// O mesmo código atende dois sites:
//   • painel principal (padrão, sem variáveis de ambiente);
//   • painel da comitiva (segundo projeto Vercel no mesmo repositório, com VITE_BRAND=comitiva etc.).
// Tudo que aparece aqui é EXEMPLO fictício: troque pelos dados reais da sua missão.
// ─────────────────────────────────────────────────────────────────────────────
import logo from './assets/logo.svg'
import logoHorizontal from './assets/logo-horizontal.svg'

const env = import.meta.env

function list(value, fallback) {
  return (value || fallback)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

// ── A missão ────────────────────────────────────────────────────────────────
export const EVENT = {
  name: 'Conferência Exemplo 2027', // nome curto do evento (título do cabeçalho)
  place: 'Lisboa, Portugal', // cidade e país (em itálico no cabeçalho)
  dates: '8–19 nov 2027', // texto livre para rodapés
  firstDay: '2027-11-08', // dias oficiais do evento (destacados no calendário)
  lastDay: '2027-11-19',
  opening: '2027-11-08T09:00:00', // contagem regressiva até aqui (hora local do navegador)
  timeZone: 'Europe/Lisbon', // fuso do destino (IANA). Todos os horários da agenda ficam neste fuso.
  timeZoneLabel: 'Lisboa', // como o fuso aparece no formulário e no relógio
  homeTimeZone: 'America/Sao_Paulo', // fuso de casa (relógio duplo do hotsite)
  homeTimeZoneLabel: 'Brasília',
  defaultLocation: 'Lisboa, Portugal', // local padrão de um compromisso novo
  dayLegend: 'dias do evento', // legenda dos dias destacados no calendário
}

// Identificador da missão no banco (coluna `mission`). Um banco pode guardar várias missões.
export const MISSION = env.VITE_MISSION || 'exemplo-nov2027'

// Hash SHA-256 da senha do painel interno. Senha do exemplo: "demo".
// Trocar:  printf '%s' 'NOVA_SENHA' | sha256sum   (ou defina VITE_ACCESS_HASH no Vercel)
export const ACCESS_HASH = env.VITE_ACCESS_HASH || '2a97516c354b68848cdbd8f54a226a0a55b21ed138e207ad6c5cbb9c00aa5aea'

// Caminho do hotsite de uma página (QR code / chaveiro NFC). Se gravar em objetos, NUNCA mude depois.
export const HOTSITE_PATH = 'sobre'

// ── Marcas dos dois painéis ─────────────────────────────────────────────────
export const BRAND_KEY = env.VITE_BRAND === 'comitiva' ? 'comitiva' : 'principal'

const LOGO = { src: logo, alt: 'Sua marca' }
const LOGO_H = { src: logoHorizontal, alt: 'Sua marca' }

const BRANDS = {
  principal: {
    eyebrow: '🌍 Missão internacional',
    subtitle: `${EVENT.dates} · Ana Exemplo — Secretaria Exemplo · Delegação`,
    gateTitle: `${EVENT.name} · Delegação`,
    heroLogo: LOGO,
    logo: logo,
    logoAlt: LOGO.alt,
    footerLogos: [LOGO_H],
    org: 'Secretaria Exemplo', // aparece no rodapé do cartão digital e no vCard
    // Abas visíveis no painel interno, na ordem: agenda, portfolio, falas, notas, alertas.
    tabs: ['agenda', 'portfolio', 'falas', 'notas', 'alertas'],
    showCard: true,
    share: {
      agenda: {
        title: `Agenda pública · ${EVENT.name}`,
        text: `Acompanhe ao vivo a agenda da delegação em ${EVENT.name} (${EVENT.place}, ${EVENT.dates}).`,
      },
      portfolio: {
        pt: { title: `Portfólio · ${EVENT.name}`, text: 'Materiais, projetos e contatos da delegação.' },
        en: { title: `Portfolio · ${EVENT.name}`, text: 'Materials, projects and contacts of the delegation.' },
      },
    },
  },
  comitiva: {
    eyebrow: '🌍 Comitiva',
    subtitle: `${EVENT.dates} · Agenda da comitiva — chefe da delegação e representantes`,
    gateTitle: `${EVENT.name} · Comitiva`,
    heroLogo: LOGO,
    logo: logo,
    logoVertical: true,
    logoAlt: LOGO.alt,
    footerLogos: [LOGO_H],
    org: 'Governo Exemplo',
    tabs: ['agenda', 'portfolio', 'falas', 'notas'],
    showCard: false,
    share: {
      agenda: {
        title: `Agenda pública · Comitiva em ${EVENT.name}`,
        text: `Acompanhe ao vivo a agenda da comitiva em ${EVENT.name} (${EVENT.place}, ${EVENT.dates}).`,
      },
      portfolio: {
        pt: { title: `Portfólio da comitiva · ${EVENT.name}`, text: 'Materiais e projetos dos órgãos da comitiva.' },
        en: { title: `Delegation portfolio · ${EVENT.name}`, text: 'Materials and projects from the delegation.' },
      },
    },
  },
}

export const BRAND = BRANDS[BRAND_KEY]

// Participantes que aparecem no formulário e no filtro da Agenda.
export const PARTICIPANTS = list(
  env.VITE_PARTICIPANTS,
  BRAND_KEY === 'comitiva' ? 'Chefe da delegação,Órgão A,Órgão B,Órgão C,Outros' : 'Ana,Bruno,Equipe',
)

// Participantes cujos compromissos nascem "internos" (fora da agenda pública) até alguém mudar à mão.
export const INTERNAL_BY_DEFAULT = list(env.VITE_INTERNAL_DEFAULT, BRAND_KEY === 'comitiva' ? 'Chefe da delegação' : '')

// Quem escreve na aba Notas (e "inserido por" nos compromissos).
export const NOTE_AUTHORS = list(env.VITE_NOTE_AUTHORS, BRAND_KEY === 'comitiva' ? 'Órgão A,Órgão B,Órgão C' : 'Ana,Bruno,Carla')

// Cores para autores e participantes, na ordem da lista.
export const PEOPLE_COLORS = ['#167033', '#1C75BC', '#C2670E', '#6A1B9A', '#BF360C', '#00695C', '#880E4F', '#546051', '#8D6E00']

export function colorFor(name, names) {
  const i = names.indexOf(name)
  return i >= 0 ? PEOPLE_COLORS[i % PEOPLE_COLORS.length] : '#546051'
}
