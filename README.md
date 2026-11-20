# Agenda de Missão — modelo

Agenda **ao vivo** para delegações em missões, conferências e eventos internacionais: a equipe vê e edita os
compromissos pelo celular e todo mundo recebe a mudança na hora. Há também uma versão **pública** só de
leitura, um **portfólio** de links, **cartões de visita digitais** e um **hotsite de uma página** para QR code
ou chaveiro NFC.

Nasceu da experiência de uma secretaria estadual de meio ambiente numa COP e foi transformado em modelo
reutilizável. Tudo o que aparece aqui é **exemplo fictício**.

> **Teste em 1 minuto:** `npm install && npm run dev` → abra http://localhost:5173 → senha `demo`.
> Sem banco configurado, o app roda em **modo demonstração**, com dados de exemplo guardados só no seu
> navegador.

## O que vem pronto

| Endereço | O que é |
|---|---|
| `/` | Painel interno com senha: Agenda, Falas, Notas, Alertas e Portfólio |
| `/?publico` | Agenda pública só de leitura: esconde os compromissos internos e mostra só o resumo público |
| `/?publico&portfolio` | Portfólio de links, bilíngue PT/EN |
| `/?cartao`, `/?cartao=bruno` | Cartão de visitas digital, com QR e botão "Salvar contato" (vCard) |
| `/?notas` | Abre direto na aba Notas |
| `/sobre`, `/sobre?nfc` | Hotsite de uma página para QR/NFC: números, agenda, galeria, vídeos, notícias e contatos |

- **Tempo real:** a assinatura Realtime do Supabase atualiza todos os aparelhos.
- **Formulário de compromisso:** dia, horário no fuso do destino, participantes, resumo público, detalhe
  interno, visibilidade e "inserido por".
- **Celular primeiro:**
  - calendário em grade, com os dias do evento destacados;
  - filtro por participante e botão Compartilhar;
  - ícone para a tela inicial (PWA);
  - prévia de link no WhatsApp e nas redes (Open Graph).
- **Dois painéis, um código:** o painel principal e o painel da **comitiva**, cada um com a sua senha, os
  seus dados e a sua marca.

## Como usar com a sua missão

### 1. Copie o modelo
Clique em **Use this template** no GitHub (ou faça um fork) e clone o seu repositório.

### 2. Personalize (sem banco ainda)
| Arquivo | O que trocar |
|---|---|
| `src/config.js` | **O principal:** nome do evento, cidade, datas, fusos, `MISSION`, senha (hash), textos, participantes, abas |
| `src/contact.js` | Pessoas da delegação, cargos, contatos, bio PT/EN, fotos |
| `src/portfolio.js` | Links e materiais do Portfólio (`portfolio-comitiva.js` para o 2º painel) |
| `src/hotsite/content.js` | Textos, números (com fonte!), agenda, fotos, vídeos e notícias do hotsite |
| `src/assets/logo*.svg` | Suas logos (PNG, WebP ou SVG; ajuste os `import` em `config.js` e `Hotsite.jsx`) |
| `public/` | Ícones do celular (`apple-touch-icon.png` 180, `icon-192/512.png`, `icon-maskable-512.png`, `favicon.png`) e `og-image.jpg` 1200×630 |
| `src/index.css`, `src/hotsite/hotsite.css` | Cores (tokens em `:root`) |
| `vite.config.js` | Títulos e textos da prévia de link (ou variáveis `VITE_*`) |

Senha do painel: `printf '%s' 'SUA_SENHA' | sha256sum` e cole o resultado em `ACCESS_HASH`.
**Atenção:** é um portão de interface, não segurança. O hash vai no código do site e o banco tem acesso
público. Não guarde nada sensível (localizadores, documentos, dados pessoais). Para proteção real, use
Supabase Auth com políticas por usuário.

### 3. Crie o banco (Supabase, plano gratuito)
1. Crie um projeto em supabase.com.
2. **SQL Editor** → cole e rode `supabase/schema.sql`.
3. **Project Settings → API**: copie a URL e a `anon key`.
4. Local: copie `.env.example` para `.env` e preencha. Na Vercel: cadastre as mesmas variáveis.

Um projeto pode guardar **várias missões**: tudo é separado pela coluna `mission`. Nunca apague as missões
antigas; troque só o `MISSION`.

### 4. Publique (Vercel, plano gratuito)
Na Vercel, importe o repositório (framework Vite) e cadastre `VITE_SUPABASE_URL` e
`VITE_SUPABASE_ANON_KEY`. Cada `git push` na `main` publica sozinho. Depois do primeiro deploy, aponte
`VITE_OG_URL` e `VITE_OG_IMAGE` para o endereço final (`https://…`), para a prévia de link funcionar.

**Painel da comitiva (opcional):** crie um **segundo projeto Vercel ligado ao mesmo repositório**, com as
variáveis de `.env.example` (`VITE_BRAND=comitiva`, `VITE_MISSION`, `VITE_ACCESS_HASH`…).

## Regras que evitam problemas
- **Interno × público:** todo compromisso público precisa de `public_detail`, com 1 ou 2 frases sobre quem
  participa e onde. Localizador, código de reserva, endereço de hospedagem, ponto de ônibus e roteiro de fala
  ficam só no `detail`, ou fora do painel.
- **Horários** sempre no fuso do destino (`EVENT.timeZone`).
- **Viagem e hospedagem** como compromissos `internal`.
- **Números** no hotsite e no portfólio só com fonte.
- **QR e NFC:** o link gravado (`/sobre?nfc`) **nunca muda**, e o hotsite precisa continuar no ar depois da
  missão, porque os objetos ficam com as pessoas. Se trocar o caminho, mude `HOTSITE_PATH` em
  `src/config.js`, `HOTSITE` em `vite.config.js`, o `vercel.json` e o nome da pasta `sobre/`.
- **Fotos:** WebP de ~1600 px, até ~250 KB, com legenda, `alt` e crédito. Pessoas identificáveis só com
  autorização.
- **Vídeos do Google Drive:** o arquivo precisa estar como "qualquer pessoa com o link".

## Testes antes de publicar mudanças de layout
`npm run build`, depois abra o site no celular, ou no navegador em 320, 375 e 414 px, e confira que **não há
rolagem lateral**. Com Playwright, meça `document.documentElement.scrollWidth`.

## Com o Claude
O `CLAUDE.md` deste repositório é o "diário da missão". Preencha no início, e o Claude Code atualiza a cada
sessão com decisões, IDs de compromissos e pendências.

O repositório traz a skill **`agenda-de-missao`**. Ela conduz a entrevista inicial e cuida das rotinas
diárias de e-mail, dos roteiros de fala, dos materiais de divulgação e do relatório de prestação de contas.

- **Claude Code:** a skill fica em `.claude/skills/agenda-de-missao/` e carrega sozinha ao abrir o
  repositório. Peça, por exemplo: "monte a agenda da minha missão".
- **claude.ai (navegador ou app):** baixe `skill/agenda-de-missao.skill` e envie em
  Configurações → Capabilities → Skills. Ou abra o arquivo numa conversa e clique em "Save skill".
- **Ao alterar a skill:** edite a pasta `.claude/skills/agenda-de-missao/` e gere de novo o `.skill`. Ele é um
  zip da pasta: `cd .claude/skills && zip -r ../../skill/agenda-de-missao.skill agenda-de-missao`.

## Seção opcional do hotsite: dois indicadores lado a lado
`DECOUPLING` em `src/hotsite/content.js` desenha as barras do `CURVE` com linhas de outros indicadores
(índice = 100 no primeiro ano), por exemplo "menos desmatamento × mais PIB". Formato:

```js
export const DECOUPLING = {
  eyebrow: { pt: '…', en: '…' }, title: { pt: '…', en: '…' }, lead: { pt: '…', en: '…' },
  lines: [
    { id: 'pib', color: 'blue', change: 30, labelDy: -18, label: { pt: 'PIB', en: 'GDP' }, period: '2021–2025' },
    { id: 'principal', color: 'rust', change: -70, label: { pt: 'Indicador', en: 'Indicator' }, period: '2021–2025' },
  ],
  chart: { unit: { pt: 'km²', en: 'km²' }, bars: { pt: '…', en: '…' }, trend: { pt: 'Tendência', en: 'Trend' }, lines: { pt: '…', en: '…' } },
  cards: [{ id: 'c1', value: '+14,7%', valueEn: '+14.7%', label: { pt: '…', en: '…' }, source: 'Fonte' }],
  note: { pt: 'Fonte: …', en: 'Source: …' },
  message: { pt: '…', en: '…' },
}
```

## Stack
React 18 · Vite 6 · Supabase (Postgres + Realtime) · Vercel. Sem roteador: os modos funcionam por parâmetro
na URL. O hotsite é uma segunda página do build do Vite.

## Licença
MIT. Use, adapte e compartilhe.
