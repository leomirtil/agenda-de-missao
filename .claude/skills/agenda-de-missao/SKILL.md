---
name: agenda-de-missao
description: >
  Monta e opera a agenda de uma missão, viagem institucional ou participação em evento (COP, conferência,
  feira, fórum, missão técnica ou comercial, visita oficial) para qualquer pessoa, órgão ou empresa: agenda
  ao vivo compartilhada com a equipe, versão pública só leitura, painel da comitiva, logística, rotinas
  diárias de leitura de e-mail, roteiros de fala, materiais de divulgação, hotsite com QR/NFC, cartão de
  visitas digital e relatório de prestação de contas. Usar quando o usuário pedir: "montar a agenda da
  missão/viagem", "dashboard da delegação", "agenda ao vivo", "agenda pública do evento", "organizar a
  comitiva", "preparar a viagem para a COP/conferência", "relatório da missão", "prestação de contas da
  viagem", mission agenda, delegation dashboard, trip itinerary for a team, conference agenda tracker.
  Funciona em dois níveis: leve (documento + planilha, sem programação) ou completo (site React + Supabase
  + Vercel com atualização em tempo real).
---

# Agenda de Missão — sistema reutilizável

Nasceu da operação de uma secretaria estadual de meio ambiente na COP31 (2026), onde um painel ao vivo, uma
agenda pública, um hotsite com chaveiros NFC e rotinas automáticas de e-mail chamaram a atenção de outras
delegações. Esta skill generaliza o método para **qualquer pessoa ou organização**. Não contém dados de
nenhuma missão real: tudo vem da entrevista inicial.

## 0. Princípios
1. **Um diário da missão.** Todo projeto tem um arquivo-memória (`CLAUDE.md` no repositório, ou um documento
   "Diário da missão" no nível leve) com decisões, IDs, pendências e armadilhas. Atualizar a cada sessão: é o
   que permite retomar em outra conversa.
2. **Interno × público.** Cada compromisso tem um resumo público curto, separado do detalhe interno. Nunca
   expor no público: localizadores, códigos de reserva, endereço de hospedagem, pontos de ônibus, roteiros de
   fala, contatos pessoais, senhas.
3. **Nada é enviado sem confirmação.** E-mails ficam em rascunho; eventos de calendário só com "sim"
   explícito; publicações (site, merge) só quando o usuário autorizar.
4. **Nenhum número sem fonte.** Dados em falas e materiais vêm com fonte e data; estimativas marcadas.
5. **Celular primeiro.** A equipe usa no celular, em pé, no evento. Testar em 375 px sem rolagem lateral.

## 1. Entrevista inicial (fazer antes de construir)
Perguntar de uma vez, em blocos curtos (usar AskUserQuestion quando houver opções claras):

| Bloco | O que coletar |
|---|---|
| Missão | Nome, evento, cidade/país, datas (incluindo viagem), **fuso do destino** e de casa |
| Pessoas | Chefe da missão, quem acompanha, quem assessora de casa, se há comitiva maior (outros órgãos) |
| Público | Vai haver agenda pública? Quem é VIP (compromissos internos por padrão)? |
| Identidade | Nome da organização, cores, logos (arquivos), fontes; marca do evento pode ser usada? |
| Ferramentas | Tem GitHub, Vercel, Supabase? Gmail/Calendar/Drive conectados? |
| Fontes | Onde chegam convites (e-mails, remetentes), onde estão fotos e documentos |
| Entregas | Prestação de contas exigida? Modelo de relatório? Divulgação (redes, site, imprensa)? |

Com as respostas, escolher o **nível** e registrar tudo no diário da missão.

## 2. Escolher o nível

**Leve (sem programação; 1 hora):** usuário sem GitHub/Vercel/Supabase, ou missão curta.
- Agenda em documento editável (Docs) ou planilha, uma seção/tabela por dia, colunas: hora (fuso do destino),
  compromisso, local, quem, status, resumo público, detalhe interno, deslocamento.
- Versão pública = cópia filtrada (só resumo público), exportada em PDF ou link de leitura.
- Rotinas de e-mail e relatório funcionam igual.

**Completo (site ao vivo; 1–2 dias):** partir do **repositório-modelo público**
https://github.com/leomirtil/agenda-de-missao (botão "Use this template" ou fork). Ver `references/painel-ao-vivo.md`.
- Roda na hora em modo demonstração (`npm install && npm run dev`, senha `demo`), sem banco.
- Personalizar: `src/config.js` (evento, datas, fusos, `MISSION`, senha, participantes), `src/contact.js`,
  `src/portfolio.js`, `src/hotsite/content.js`, logos e ícones; banco com `supabase/schema.sql`.
- Não reconstruir do zero: só se o usuário pedir ou o modelo não servir.
- React + Vite + Supabase Realtime + Vercel; senha simples no painel interno; `?publico` só leitura;
  segundo painel para a comitiva com o mesmo código (variáveis de ambiente).
- Esquema do banco pronto em `assets/schema.sql`; modelo de diário em `assets/CLAUDE.template.md`.

Na dúvida, começar leve e migrar: a planilha vira o `INSERT` inicial do banco.

## 3. Pré-missão (checklist)
- [ ] Diário da missão criado com a entrevista
- [ ] Agenda criada (leve ou completa) com todos os dias, inclusive viagem e retorno
- [ ] Voos e hospedagem como compromissos **internos** (sem localizador)
- [ ] Alertas com prazo: credencial, visto/autorização eletrônica, seguro, passaporte (validade), cancelamento
      grátis da hospedagem, inscrições em side events
- [ ] Deslocamentos: rotas reais (ferramenta de mapas), coordenadas conferidas, restrições de trânsito do evento
- [ ] Rotinas da manhã e da noite configuradas (`references/rotinas.md`)
- [ ] Cartão de visitas digital e portfólio de links (opcional, `references/divulgacao.md`)
- [ ] Hotsite com QR/NFC (opcional) — o link gravado nunca pode mudar
- [ ] Biografia curta PT/EN de quem fala; roteiros só depois do painel confirmado
- [ ] Mensagem para os grupos de WhatsApp com os links (sem senha)

## 4. Durante
- **Leitura de e-mails** (manual ou rotina): classificar 🔴 urgente · 🟡 importante · 🟢 informativo ·
  📌 novo convite. Para cada item: atualizar a agenda, registrar no diário, propor rascunho de resposta.
- **Programação oficial muda até a véspera:** lançar como pendente cedo; confirmar quando sair a grade.
- **Se há dois painéis** (equipe e comitiva), toda mudança vai aos dois, com o mesmo título de dia.
- **Roteiro de fala:** bullets primeiro, depois texto corrido; PT e EN; tempo cronometrado (≈130 palavras
  por minuto); dados com fonte; para falas de 2–3 min, um problema concreto + uma proposta concreta.
- **Rascunhos:** confirmação (direta), declínio (motivo + porta aberta), agradecimento (algo concreto),
  follow-up (próximo passo). Anexos grandes: entregar o arquivo para a pessoa anexar.

## 5. Pós-missão
1. Compromissos realizados → `done`; alerta de encerramento.
2. Hotsite/portfólio no passado: "agenda por agenda", com link para cada matéria publicada.
3. **Relatório de prestação de contas** (`references/documentos.md`): se houver modelo do financiador,
   preencher o modelo; anexos com links da cobertura e fotos legendadas. Fica fora de repositórios públicos.
4. Balanço para a assessoria de imprensa (versão institucional + versão curta).
5. Carrossel-resumo e banner para o site institucional (`references/divulgacao.md`).
6. **Cartões de visita:** foto → transcrição → rascunhos de agradecimento em CCO (por idioma) → planilha de
   contatos (nova versão, original preservado; respeitar LGPD/GDPR).
7. Desligar as rotinas; decidir sobre tirar o painel do ar (manter o hotsite se houver chaveiros/QR impressos).

## 6. Ao adaptar para outra pessoa
- Trocar todos os nomes, logos, cores e textos; **não reaproveitar** dados, fotos ou contatos de outra missão.
- Fuso: horários sempre no fuso do destino, com relógio duplo (destino · casa) quando útil.
- Idiomas: PT/EN por padrão; acrescentar o idioma do destino nas frases úteis do manual de transporte.
- Banco compartilhado entre missões: separar pela coluna `mission`; nunca apagar missões antigas.

## 7. Referências
| Situação | Arquivo |
|---|---|
| Construir o painel ao vivo (arquitetura, recursos, testes, armadilhas) | `references/painel-ao-vivo.md` |
| Banco de dados (copiar e rodar) | `assets/schema.sql` |
| Diário da missão / CLAUDE.md inicial | `assets/CLAUDE.template.md` |
| Rotinas automáticas de manhã e noite | `references/rotinas.md` |
| Agenda em Word, relatório, cartões → contatos | `references/documentos.md` |
| Hotsite NFC/QR, cartão digital, carrosséis, banners | `references/divulgacao.md` |
