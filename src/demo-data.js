// Dados FICTÍCIOS do modo demonstração. Não são usados quando o Supabase está configurado.
// Servem também de exemplo de como preencher cada coluna (ver supabase/schema.sql).
const M = 'exemplo-nov2027'
const C = 'exemplo-comitiva'

const ev = (mission, id, event_date, day_label, time, title, extra = {}) => ({
  id,
  mission,
  event_date,
  date: `${event_date.slice(8, 10)}/${event_date.slice(5, 7)}`,
  weekday: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][new Date(`${event_date}T12:00:00`).getDay()],
  day_label,
  time,
  title,
  detail: '',
  public_detail: null,
  type: 'evento',
  status: 'pending',
  who: null,
  visibility: 'public',
  created_by: 'Exemplo',
  sort_order: 0,
  location: 'Lisboa, Portugal',
  address: null,
  lat: null,
  lng: null,
  transit_next: null,
  ...extra,
})

export const DEMO_DATA = {
  mission_events: [
    ev(M, 'ex_e1', '2027-11-06', '✈️ Viagem de ida', '22:30', 'Voo de ida (exemplo)', {
      type: 'viagem', status: 'confirmed', visibility: 'internal', who: ['Ana', 'Bruno'],
      detail: 'Trecho e horário locais. Localizador e bilhete NÃO vão para o painel.',
    }),
    ev(M, 'ex_e2', '2027-11-07', '🛬 Chegada', '15:00', 'Check-in na hospedagem', {
      type: 'logistica', status: 'confirmed', visibility: 'internal', who: ['Ana', 'Bruno'],
      transit_next: '🚌 Hospedagem → Centro de Convenções: metrô ~25 min. Alternativa: táxi ~15 min.',
    }),
    ev(M, 'ex_e3', '2027-11-08', '🌍 Abertura', '09:00–10:30', 'Cerimônia de abertura', {
      status: 'confirmed', who: ['Ana'],
      public_detail: 'A secretária Ana Exemplo acompanha a abertura oficial, no plenário principal.',
      detail: 'Credencial na mão. Sentar no bloco da delegação.',
    }),
    ev(M, 'ex_e4', '2027-11-08', '🌍 Abertura', '15:15–16:30', 'Painel: resultados e próximos passos', {
      type: 'fala', status: 'confirmed', who: ['Ana', 'Bruno'],
      public_detail: 'Ana Exemplo apresenta os resultados da organização no Pavilhão 2.',
      detail: 'Fala de 8 min. Roteiro PT/EN na aba Falas. Moderação: (nome).',
    }),
    ev(M, 'ex_e5', '2027-11-09', '🤝 Bilaterais', '11:00–12:00', 'Reunião bilateral com parceiro (exemplo)', {
      type: 'reuniao', status: 'pending', who: ['Ana'], visibility: 'internal',
      detail: 'Aguardando confirmação de horário e sala.',
    }),
    ev(M, 'ex_e6', '2027-11-09', '🤝 Bilaterais', 'A def.', 'Recepção da rede de governos locais', {
      type: 'social', status: 'pending', who: ['Equipe'],
      public_detail: 'A delegação participa da recepção da rede de governos locais.',
    }),
  ],
  mission_notes: [
    { id: 'ex_n1', mission: M, date: '08/11', author: 'Bruno', content: 'Contato útil do painel: pedir material por e-mail.', created_at: '2027-11-08T18:00:00Z' },
  ],
  mission_updates: [
    { id: 'ex_u1', mission: M, source: 'Rotina · briefing da manhã', summary: 'Organização pede confirmação dos palestrantes até amanhã 12h.', priority: 'urgent', read: false, created_at: '2027-11-07T07:30:00Z' },
    { id: 'ex_u2', mission: M, source: 'Rotina · briefing da manhã', summary: 'Novo convite: café da manhã de parceiros em 10/11.', priority: 'important', read: false, created_at: '2027-11-07T07:30:00Z' },
  ],
}

// Painel da comitiva (VITE_MISSION=exemplo-comitiva) também tem dados de exemplo.
DEMO_DATA.mission_events.push(
  ev(C, 'exc_s1', '2027-11-08', '🌍 Abertura', '09:00–10:30', 'Cerimônia de abertura', {
    status: 'confirmed', who: ['Chefe da delegação', 'Órgão A'],
    public_detail: 'A comitiva acompanha a abertura oficial.',
  }),
  ev(C, 'exc_s2', '2027-11-09', '🤝 Bilaterais', '14:00', 'Reunião do chefe da delegação (interna)', {
    type: 'reuniao', status: 'pending', who: ['Chefe da delegação'], visibility: 'internal',
  }),
)
