// Conteúdo do hotsite de uma página (/sobre), aberto por QR code ou chaveiro NFC (/sobre?nfc).
// Tudo bilíngue { pt, en }. EXEMPLO fictício: troque pelos dados reais.
// Regra de ouro: só números com fonte confirmada. Listas vazias escondem a seção.

export const STRINGS = {
  pt: {
    langLabel: 'EN',
    langAria: 'Switch to English',
    eyebrow: 'Lisboa · Portugal · 8–19 nov 2027',
    heroNfc: 'Que bom que você chegou até aqui.',
    heroDefault: 'Nossa participação no evento.',
    heroLead: 'Uma frase forte sobre quem somos e o que trouxemos para o evento.',
    heroCta: 'Conhecer',
    nfcThanks: 'Obrigado por levar este chaveiro com você 🌱',
    numbersEyebrow: 'Em 30 segundos',
    numbersTitle: 'Resultados que podem ser conferidos',
    curveEyebrow: 'A curva',
    curveTitle: 'Indicador principal ao longo dos anos',
    curveNote: 'Fonte do indicador. Último ano: estimativa.',
    curveMessage: 'Uma frase que resume o que o gráfico mostra.',
    copEyebrow: 'Onde nos encontrar',
    copTitle: 'Nossa agenda no evento',
    liveNow: 'Agora',
    liveNext: 'Próximo',
    liveAgenda: 'Agenda completa ao vivo',
    galleryEyebrow: 'Imagens',
    galleryTitle: 'Em fotos',
    videosEyebrow: 'Vídeos',
    videosTitle: 'Assista',
    play: 'Assistir',
    newsEyebrow: 'Notícias',
    newsTitle: 'Na imprensa',
    soon: 'em breve',
    readMore: 'Ler a matéria',
    newsAll: 'Toda a cobertura',
    linksEyebrow: 'Materiais e links',
    linksTitle: 'Para saber mais',
    contactEyebrow: 'Fale com a delegação',
    contactTitle: 'Vamos conversar',
    saveContact: 'Salvar contato',
    whatsapp: 'WhatsApp',
    card: 'Cartão digital',
    shareTitle: 'Nossa participação no evento',
    shareText: 'Resultados, agenda, fotos e contatos da delegação numa página só.',
    footer: 'Secretaria Exemplo · Organização Exemplo',
    addHome: 'Dica: adicione esta página à tela inicial.',
    source: 'Fonte',
  },
  en: {
    langLabel: 'PT',
    langAria: 'Mudar para português',
    eyebrow: 'Lisbon · Portugal · 8–19 Nov 2027',
    heroNfc: 'Glad you made it here.',
    heroDefault: 'Our participation in the event.',
    heroLead: 'A strong sentence about who we are and what we brought to the event.',
    heroCta: 'Discover',
    nfcThanks: 'Thank you for taking this keychain with you 🌱',
    numbersEyebrow: 'In 30 seconds',
    numbersTitle: 'Results anyone can verify',
    curveEyebrow: 'The curve',
    curveTitle: 'Main indicator over the years',
    curveNote: 'Indicator source. Last year: estimate.',
    curveMessage: 'One sentence that sums up what the chart shows.',
    copEyebrow: 'Where to find us',
    copTitle: 'Our agenda at the event',
    liveNow: 'Now',
    liveNext: 'Next',
    liveAgenda: 'Full live agenda',
    galleryEyebrow: 'Images',
    galleryTitle: 'In pictures',
    videosEyebrow: 'Videos',
    videosTitle: 'Watch',
    play: 'Play',
    newsEyebrow: 'News',
    newsTitle: 'In the press',
    soon: 'coming soon',
    readMore: 'Read the story',
    newsAll: 'Full coverage',
    linksEyebrow: 'Materials and links',
    linksTitle: 'Learn more',
    contactEyebrow: 'Meet the delegation',
    contactTitle: "Let's talk",
    saveContact: 'Save contact',
    whatsapp: 'WhatsApp',
    card: 'Digital card',
    shareTitle: 'Our participation in the event',
    shareText: 'Results, agenda, photos and delegation contacts on one page.',
    footer: 'Example Secretariat · Example Organisation',
    addHome: 'Tip: add this page to your home screen.',
    source: 'Source',
  },
}

// Números grandes, animados ao aparecer. accent: emerald | blue | gold | green. Sempre com fonte.
export const NUMBERS = [
  { id: 'n1', accent: 'emerald', value: 40, prefix: '−', suffix: '%', label: { pt: 'Indicador 1 (exemplo)', en: 'Indicator 1 (example)' }, source: 'Fonte oficial, ano' },
  { id: 'n2', accent: 'blue', value: 12, suffix: '', label: { pt: 'Indicador 2 (exemplo)', en: 'Indicator 2 (example)' }, source: 'Fonte oficial, ano' },
  { id: 'n3', accent: 'gold', value: 3, suffix: ' mil', label: { pt: 'Pessoas beneficiadas (exemplo)', en: 'People reached (example)' }, source: 'Relatório, ano' },
]

// Gráfico de barras do indicador principal. Vazio = seção oculta. estimate: true marca com *.
export const CURVE = [
  { year: '2023', value: 100 },
  { year: '2024', value: 82 },
  { year: '2025', value: 70 },
  { year: '2026', value: 60, estimate: true },
]

// Participações no evento, em ordem cronológica (hora do destino). Depois do evento, escreva no passado e
// acrescente `url` com o link da matéria sobre cada agenda.
export const COP = [
  {
    id: 'abertura',
    date: { pt: '08/11 · 09:00', en: '8 Nov · 9:00' },
    tag: { pt: 'Abertura', en: 'Opening' },
    title: { pt: 'Cerimônia de abertura', en: 'Opening ceremony' },
    text: { pt: 'A delegação acompanha a abertura oficial.', en: 'The delegation attends the official opening.' },
  },
  {
    id: 'painel',
    date: { pt: '08/11 · 15:15', en: '8 Nov · 15:15' },
    tag: { pt: 'Painel', en: 'Panel' },
    title: { pt: 'Painel: resultados e próximos passos', en: 'Panel: results and next steps' },
    text: { pt: 'Apresentação dos resultados da organização, no Pavilhão 2.', en: "Presentation of the organisation's results, Pavilion 2." },
  },
]

export const COP_NOTE = {
  pt: 'Horários de Lisboa. A agenda pode mudar: veja a versão ao vivo.',
  en: 'Lisbon time. The agenda may change: see the live version.',
}

// Galeria: { src: '/sobre/img/foto.webp', caption {pt,en}, alt {pt,en}, credit }. Vazia = seção oculta.
// Fotos em public/sobre/img/, WebP ~1600 px e até ~250 KB. Pessoas identificáveis só com autorização.
export const GALLERY = []

// Fotos da abertura e faixas de foto entre as seções. null = sem foto (usa a arte em SVG).
export const PHOTOS = {
  heroMobile: null, // ex.: '/sobre/img/hero-celular.webp'
  heroDesktop: null,
  band: null, // ex.: { src: '/sobre/img/faixa.webp', credit: 'Foto: Autor', text: { pt: '…', en: '…' } }
  band2: null,
  band3: null,
}

// Vídeos: { youtube: 'ID', title {pt,en} }, { drive: 'ID do arquivo', poster: '/sobre/img/capa.webp', title }
// ou { url: 'https://instagram.com/...', title }. Drive: o arquivo precisa estar "qualquer pessoa com o link".
export const VIDEOS = []

// Notícias: { id, title {pt,en}, outlet, date?, url (null = "em breve"), image?, alt?, credit? }.
export const NEWS = [
  { id: 'n1', title: { pt: 'Matéria sobre a participação (exemplo)', en: 'Story about our participation (example)' }, outlet: 'Veículo', url: null },
]
export const NEWS_ALL = null // link "toda a cobertura" (ou null)

export const LINKS = [
  { id: 'agenda', icon: '🗓️', url: '/?publico', title: { pt: 'Agenda ao vivo', en: 'Live agenda' }, desc: { pt: 'Compromissos públicos da delegação', en: 'Public engagements of the delegation' } },
  { id: 'portfolio', icon: '🌳', url: '/?publico&portfolio', title: { pt: 'Portfólio', en: 'Portfolio' }, desc: { pt: 'Materiais e projetos', en: 'Materials and projects' } },
  { id: 'site', icon: '🏛️', url: 'https://exemplo.org/', title: { pt: 'Site da organização', en: 'Organisation website' }, desc: { pt: 'Página institucional', en: 'Institutional website' } },
]

// Cargos em PT/EN por pessoa (chaves de PEOPLE em src/contact.js).
export const PEOPLE_TITLES = {
  ana: { pt: 'Secretária Exemplo', en: 'Example Secretary' },
  bruno: { pt: 'Assessor Internacional', en: 'International Advisor' },
}

// Seção opcional "dois indicadores lado a lado" (ex.: menos desmatamento × mais PIB). null = oculta.
// O formato completo está documentado no README (seção "Hotsite").
export const DECOUPLING = null
