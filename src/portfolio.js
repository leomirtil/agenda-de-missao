// Portfólio do painel principal — lista de links (estilo linktree), bilíngue PT/EN, em seções.
// Conteúdo estático (não usa o banco). EXEMPLO: troque pelos materiais reais.
// item: { id, icon, kind: 'link' | 'internal' | 'pdf', url (null = "em breve"), status?: 'soon', thumb?, title {pt,en}, desc {pt,en} }
// PDFs pequenos podem ficar em public/portfolio/; arquivos grandes, no Drive com "qualquer pessoa com o link".
import { EVENT, HOTSITE_PATH } from './config.js'
import { PEOPLE, cardPath, whatsappUrl } from './contact.js'

const COLORS = ['#167033', '#1C75BC', '#C2670E', '#6A1B9A']

export const DELEGATION = Object.entries(PEOPLE).map(([key, p], i) => ({
  id: key,
  name: p.name,
  role: { pt: p.title, en: p.titleEn || p.title },
  cardUrl: p.cardReady ? cardPath(key) : null,
  whatsappUrl: whatsappUrl(p),
  photo: p.photoThumb,
  color: COLORS[i % COLORS.length],
}))

export const PORTFOLIO_SECTIONS = [
  { id: 'delegacao', title: { pt: 'Delegação', en: 'Delegation' }, people: DELEGATION },
  {
    id: 'evento',
    title: { pt: EVENT.name, en: EVENT.name },
    items: [
      {
        id: 'hotsite',
        icon: '✨',
        kind: 'internal',
        url: `/${HOTSITE_PATH}`,
        title: { pt: 'Nossa participação em 1 minuto', en: 'Our participation in 1 minute' },
        desc: { pt: 'Resultados, agenda, fotos e contatos numa página só', en: 'Results, agenda, photos and contacts on one page' },
      },
      {
        id: 'agenda',
        icon: '🗓️',
        kind: 'internal',
        url: '?publico',
        title: { pt: 'Agenda da missão', en: 'Mission agenda' },
        desc: { pt: 'Painéis, reuniões e eventos da delegação', en: 'Panels, meetings and events of the delegation' },
      },
      {
        id: 'site-evento',
        icon: '🌍',
        kind: 'link',
        url: 'https://example.org/',
        title: { pt: 'Site oficial do evento', en: 'Official event website' },
        desc: { pt: `Informações e programação (${EVENT.place}, ${EVENT.dates})`, en: `Information and programme (${EVENT.place})` },
      },
    ],
  },
  {
    id: 'materiais',
    title: { pt: 'Materiais e projetos', en: 'Materials and projects' },
    items: [
      {
        id: 'site-org',
        icon: '🏛️',
        kind: 'link',
        url: 'https://exemplo.org/',
        title: { pt: 'Site da organização', en: 'Organisation website' },
        desc: { pt: 'Página institucional', en: 'Institutional website' },
      },
      {
        id: 'factsheet',
        icon: '📄',
        kind: 'pdf',
        url: null,
        status: 'soon',
        title: { pt: 'Factsheet de resultados', en: 'Results factsheet' },
        desc: { pt: 'PDF bilíngue (em breve)', en: 'Bilingual PDF (coming soon)' },
      },
      {
        id: 'parceiros',
        icon: '🤝',
        kind: 'link',
        url: 'mailto:contato@exemplo.org?subject=Projetos%20para%20parceiros',
        title: { pt: 'Projetos para parceiros', en: 'Projects for partners' },
        desc: { pt: 'Sob solicitação, por e-mail', en: 'On request, by email' },
      },
    ],
  },
]

export const PORTFOLIO_TEXT = {
  pt: {
    eyebrow: 'Portfólio',
    title: EVENT.name,
    subtitle: 'Materiais e links da delegação',
    soon: 'em breve',
    soonLabel: 'Link em breve',
    members: 'Integrantes da delegação',
    card: 'Cartão de visitas',
    whatsapp: 'WhatsApp',
  },
  en: {
    eyebrow: 'Portfolio',
    title: EVENT.name,
    subtitle: 'Materials and links from the delegation',
    soon: 'coming soon',
    soonLabel: 'Link coming soon',
    members: 'Delegation members',
    card: 'Business card',
    whatsapp: 'WhatsApp',
  },
}
