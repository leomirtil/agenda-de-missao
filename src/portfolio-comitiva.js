// Portfólio do painel da comitiva (VITE_BRAND=comitiva). EXEMPLO: troque pelos materiais reais.
import { EVENT } from './config.js'

export const PORTFOLIO_SECTIONS = [
  {
    id: 'evento',
    title: { pt: EVENT.name, en: EVENT.name },
    items: [
      {
        id: 'agenda',
        icon: '🗓️',
        kind: 'internal',
        url: '?publico',
        title: { pt: 'Agenda pública da comitiva', en: 'Delegation public agenda' },
        desc: { pt: 'Compromissos públicos da comitiva', en: 'Public engagements of the delegation' },
      },
    ],
  },
  {
    id: 'orgaos',
    title: { pt: 'Órgãos', en: 'Agencies' },
    items: [
      { id: 'orgao-a', icon: '🏛️', kind: 'link', url: null, status: 'soon', title: { pt: 'Órgão A', en: 'Agency A' }, desc: { pt: 'Materiais em preparação', en: 'Materials in preparation' } },
      { id: 'orgao-b', icon: '🏛️', kind: 'link', url: null, status: 'soon', title: { pt: 'Órgão B', en: 'Agency B' }, desc: { pt: 'Materiais em preparação', en: 'Materials in preparation' } },
    ],
  },
]

export const PORTFOLIO_TEXT = {
  pt: { eyebrow: 'Portfólio da comitiva', title: EVENT.name, subtitle: 'Materiais dos órgãos da comitiva', soon: 'em breve', soonLabel: 'Link em breve', members: 'Integrantes', card: 'Cartão de visitas', whatsapp: 'WhatsApp' },
  en: { eyebrow: 'Delegation portfolio', title: EVENT.name, subtitle: 'Materials from the delegation agencies', soon: 'coming soon', soonLabel: 'Link coming soon', members: 'Members', card: 'Business card', whatsapp: 'WhatsApp' },
}
