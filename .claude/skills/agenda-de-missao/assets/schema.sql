-- Agenda de Missão — esquema Supabase (Postgres)
-- Um projeto pode guardar várias missões: tudo é separado pela coluna `mission`.
-- RLS pública: adequado só para uso temporário e dados não sensíveis (o painel tem portão de senha
-- apenas na interface). Para proteção real, usar Supabase Auth e políticas por usuário.

CREATE TABLE IF NOT EXISTS mission_events (
  id            TEXT PRIMARY KEY,          -- ex.: 'cop32_e1' (prefixo por missão)
  mission       TEXT NOT NULL,             -- ex.: 'cop32-nov2027'
  event_date    DATE NOT NULL,             -- a agenda agrupa por esta data
  date          TEXT,                      -- 'DD/MM' (opcional, exibição)
  weekday       TEXT,                      -- 'Seg', 'Ter'… (opcional; calculável)
  day_label     TEXT,                      -- título do dia; o mesmo em todos os itens daquela data
  time          TEXT NOT NULL DEFAULT 'A def.', -- '09:30–11:00' | 'Manhã' | 'A def.' (fuso do destino)
  title         TEXT NOT NULL,
  detail        TEXT DEFAULT '',           -- interno: contexto, roteiro, logística
  public_detail TEXT,                      -- público: 1–2 frases (quem participa e onde)
  type          TEXT NOT NULL DEFAULT 'evento', -- evento | fala | reuniao | viagem | logistica | social
  status        TEXT NOT NULL DEFAULT 'pending', -- pending | confirmed | done | cancelled | alert
  who           TEXT[],                    -- participantes
  visibility    TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','internal')),
  created_by    TEXT,                      -- quem inseriu
  sort_order    INTEGER DEFAULT 0,         -- só desempata horários iguais
  location      TEXT,
  address       TEXT,
  lat           NUMERIC,
  lng           NUMERIC,
  transit_next  TEXT,                      -- interno: como chegar ao próximo compromisso
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mission_notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission    TEXT NOT NULL,
  date       TEXT NOT NULL,                -- 'DD/MM'
  content    TEXT NOT NULL,
  author     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mission_updates (   -- alertas (rotinas automáticas ou manuais)
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission    TEXT NOT NULL,
  source     TEXT NOT NULL,
  summary    TEXT NOT NULL,
  priority   TEXT DEFAULT 'info' CHECK (priority IN ('urgent','important','info')),
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mission_events_mission_date ON mission_events (mission, event_date);
CREATE INDEX IF NOT EXISTS mission_notes_mission ON mission_notes (mission);
CREATE INDEX IF NOT EXISTS mission_updates_mission ON mission_updates (mission);

ALTER TABLE mission_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_notes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY anon_all_events  ON mission_events  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY anon_all_notes   ON mission_notes   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY anon_all_updates ON mission_updates FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE mission_events;
ALTER PUBLICATION supabase_realtime ADD TABLE mission_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE mission_updates;

-- Exemplo de inserção (sempre com mission; eventos públicos com public_detail)
-- INSERT INTO mission_events (id, mission, event_date, day_label, time, title, detail, public_detail,
--   type, status, who, visibility, created_by)
-- VALUES ('cop32_e1', 'cop32-nov2027', '2027-11-10', 'Dia 1 · Abertura', '15:15–16:30',
--   'Painel X', 'Roteiro e contatos…', 'A secretária participa do painel X no Pavilhão Y.',
--   'fala', 'confirmed', '{Ana}', 'public', 'Equipe');
