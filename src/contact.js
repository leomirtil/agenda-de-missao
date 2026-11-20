// Cartões de visita digitais (modo ?cartao e ?cartao=<chave>). Conteúdo estático, sem banco.
// EXEMPLO fictício: troque nomes, cargos, contatos e fotos. A primeira pessoa é o padrão de ?cartao.
// Fotos: coloque em src/assets/ e importe, ex.: import photo from './assets/ana.jpg'
//   photo = foto inteira (abre ao tocar); photoThumb = recorte quadrado do rosto (~480×480).
import { BRAND } from './config.js'

export const PEOPLE = {
  ana: {
    name: 'Ana Exemplo',
    n: 'Exemplo;Ana;;;', // nome no formato do vCard: Sobrenome;Nome;;;
    slug: 'ana-exemplo',
    title: 'Secretária Exemplo',
    org: BRAND.org,
    emailPersonal: null,
    emailWork: 'ana@exemplo.org',
    site: 'https://exemplo.org',
    siteLabel: 'exemplo.org',
    linkedin: null,
    whatsapp: null, // ex.: '+5561999999999'
    photo: null,
    photoThumb: null,
    bio: {
      pt: 'Mini biografia em português (2–4 parágrafos curtos). Parágrafos separados por linha em branco.',
      en: 'Short biography in English (2–4 short paragraphs). Separate paragraphs with a blank line.',
    },
    cardReady: true,
  },
  bruno: {
    name: 'Bruno Exemplo',
    slug: 'bruno-exemplo',
    title: 'Assessor Internacional',
    org: BRAND.org,
    emailWork: 'bruno@exemplo.org',
    site: 'https://exemplo.org',
    siteLabel: 'exemplo.org',
    whatsapp: null,
    photo: null,
    photoThumb: null,
    bio: null,
    cardReady: true,
  },
}

export const DEFAULT_PERSON = Object.keys(PEOPLE)[0]

export function getPerson(key) {
  return PEOPLE[key] ? { key, person: PEOPLE[key] } : { key: DEFAULT_PERSON, person: PEOPLE[DEFAULT_PERSON] }
}

export function cardPath(key) {
  return key === DEFAULT_PERSON ? '?cartao' : `?cartao=${key}`
}

export function whatsappUrl(person) {
  return person.whatsapp ? `https://wa.me/${person.whatsapp.replace(/\D/g, '')}` : null
}

export function downloadVCard(person = PEOPLE[DEFAULT_PERSON]) {
  const parts = person.name.split(' ')
  const family = parts.length > 1 ? parts[parts.length - 1] : ''
  const given = parts.length > 1 ? parts.slice(0, -1).join(' ') : person.name
  const vcf = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${person.name}`,
    `N:${person.n || `${family};${given};;;`}`,
    person.title && `TITLE:${person.title}`,
    person.org && `ORG:${person.org}`,
    person.emailPersonal && `EMAIL;TYPE=PERSONAL:${person.emailPersonal}`,
    person.emailWork && `EMAIL;TYPE=WORK:${person.emailWork}`,
    person.site && `URL:${person.site}`,
    person.linkedin && `X-SOCIALPROFILE;TYPE=linkedin:${person.linkedin}`,
    person.whatsapp && `TEL;TYPE=CELL:${person.whatsapp}`,
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\n')
  const blob = new Blob([vcf], { type: 'text/vcard' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${person.slug || 'contato'}.vcf`
  a.click()
  URL.revokeObjectURL(url)
}
