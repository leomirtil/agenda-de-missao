# Painel ao vivo — como construir

Objetivo: um site leve, usado no celular, onde a equipe vê e edita a agenda em tempo real; uma versão
pública só leitura; opcionalmente um segundo painel para a comitiva, com o mesmo código.

## 0. Ponto de partida: o repositório-modelo
https://github.com/leomirtil/agenda-de-missao (público, licença MIT) já tem tudo desta página implementado e
testado (320–1280 px, sem rolagem lateral), com modo demonstração sem banco.
1. O usuário cria a cópia: "Use this template" → novo repositório na conta dele (a integração do Claude
   pode não ter permissão para criar repositórios; se falhar, pedir que ele crie e depois anexar).
2. Clonar, rodar `npm install && npm run dev` e mostrar o modo demonstração (senha `demo`).
3. Preencher a configuração com as respostas da entrevista (seção 1 do SKILL.md), trocar logos, ícones e
   `og-image.jpg`, e registrar tudo no `CLAUDE.md` do repositório.
4. Banco e publicação: seções 1 e 4 abaixo. Para o hotsite, o caminho padrão é `/sobre`.

## 1. Pré-requisitos (o usuário cria; o Claude orienta)
- Repositório GitHub (vazio) e acesso de escrita na sessão.
- Projeto Supabase: rodar `assets/schema.sql`; anotar URL e anon key (pública por desenho).
- Projeto Vercel ligado ao repositório (deploy automático a cada push na `main`).
- Segundo painel (opcional): outro projeto Vercel no **mesmo repositório**, com variáveis `VITE_*`.

## 2. Estrutura
```
index.html               ← tags Open Graph (prévia de link) com %VITE_*%
vite.config.js           ← entradas (painel + hotsite opcional), manifest PWA gerado por painel
vercel.json              ← rewrites (ex.: /hotsite → /hotsite/index.html)
src/config.js            ← TUDO que varia por painel: MISSION, marca, abas, participantes, senha (hash), textos
src/supabase.js          ← cliente + MISSION
src/agenda.js            ← agrupar por data, ordenar por hora (startMinutes), fuso
src/App.jsx              ← abas e modos por query string; assinatura Realtime
src/EventForm.jsx        ← criar/editar/excluir compromisso
src/Notes.jsx            ← notas por autor/dia
src/AccessGate.jsx       ← portão de senha (SHA-256 no navegador)
src/Portfolio.jsx + portfolio.js ← linktree bilíngue
src/ContactCard.jsx + contact.js ← cartão de visitas digital + vCard
src/ShareButton.jsx      ← compartilhar: nativo, WhatsApp, e-mail, copiar
src/index.css            ← tokens de cor em :root, breakpoint 768 px
```

## 3. Recursos (implementar nesta ordem; os primeiros já entregam valor)
1. **Agenda**: lista por dia (data real), ordenada pela hora de início; título do dia; cartão com hora,
   título, quem, local, status (ícone clicável no interno: pendente → confirmado → concluído → cancelado).
2. **Realtime**: `supabase.channel(...).on('postgres_changes', {schema:'public', table:'mission_events',
   filter:`mission=eq.${MISSION}`}, reload)`; recarregar também após salvar no formulário.
3. **Formulário** de compromisso (dia, hora do destino, título, quem, local, detalhe interno, resumo
   público, tipo, status, visibilidade, "inserido por" lembrado no aparelho). Marcar um VIP torna interno.
4. **Modo público** `?publico`: só `visibility='public'`, só `public_detail`, sem edição, sem abas internas.
5. **Portão de senha** no interno: compara SHA-256 da senha com o hash do config; guarda no localStorage por
   missão. Enquanto trancado, não consulta o banco. É proteção de interface, **não segurança**: dizer isso ao
   usuário e oferecer Supabase Auth se os dados forem sensíveis.
6. **Abas**: Agenda · Falas (tipo `fala`) · Notas · Alertas (`mission_updates`) · Portfólio.
7. **Celular**: no ≤ 768 px, a lista de dias vira grade de datas (dias do evento destacados, ponto em
   "hoje"); seletor de participantes; botão "＋" flutuante; Compartilhar como ícone.
8. **Cabeçalho**: logo, título, contagem regressiva até a abertura; relógio duplo destino · casa (opcional).
9. **Atalho na tela inicial**: `apple-touch-icon.png` 180, `icon-192/512.png`, maskable, manifest com
   `display: standalone` e nome por painel.
10. **Prévia de link**: imagem 1200×630 e textos OG (os crawlers leem só o `index.html`: a prévia é igual para
    todos os modos de URL).
11. **Cartão digital** `?cartao[=pessoa]`: foto, cargo, contatos, bio PT/EN, QR, botão "Salvar contato" (vCard).
12. **Portfólio** `?publico&portfolio`: seções de links (delegação, evento, materiais, notícias).

## 4. Dois painéis, um código
`src/config.js` lê `import.meta.env.VITE_*` com padrões do painel principal:
`VITE_MISSION`, `VITE_BRAND`, `VITE_ACCESS_HASH`, `VITE_PARTICIPANTS`, `VITE_NOTE_AUTHORS`,
`VITE_INTERNAL_DEFAULT`, `VITE_APP_NAME`, `VITE_SITE_TITLE`, `VITE_OG_*`. Mudança de variável só vale após
novo deploy. Cada push publica os dois.

## 5. Testes antes de publicar
- `npm run build` sem erro.
- Playwright (se o ambiente não alcança o Supabase, simular a API com `page.route`):
  modos interno, `?publico`, `?cartao`, portfólio, hotsite; 320, 360, 375, 414, 1280 px;
  `document.documentElement.scrollWidth <= innerWidth`; console sem erros; capturas para o usuário.

## 6. Armadilhas
- Item flex com conteúdo largo sem `min-width: 0` alarga a página inteira.
- `pkill -f padrão` pode matar o próprio shell: guardar o PID do servidor.
- WhatsApp guarda a prévia em cache (usar `?v=2` ou o depurador do Facebook).
- No iPhone, o atalho da tela inicial tem armazenamento separado do Safari (pede a senha de novo).
- Arquivos grandes (PDF, vídeo) no Drive/nuvem com "qualquer pessoa com o link", não no repositório.
- Horários sempre no fuso do destino; deixar isso escrito no formulário.

## 7. Encerramento
Eventos `done`, alerta final, rotinas desligadas, decidir sobre tirar o painel do ar. Se houver QR/NFC
impressos apontando para o hotsite, **manter o hotsite** (ou um redirecionamento) no ar.
