# Rotinas automáticas (manhã e noite)

Configuradas pelo usuário em claude.ai → Rotinas (ou como tarefa agendada), com os conectores de e-mail e,
no nível completo, do Supabase. O Claude escreve o texto; o usuário cria a rotina.

## Regras
- Duas rotinas: **briefing da manhã** (~07:30) e **debrief da noite** (~21:00), **no fuso do destino**.
  Criar no fuso de casa e trocar na véspera do embarque.
- Fazem só: ler e-mails, gravar alertas (`mission_updates`, com `mission`), e à noite marcar os compromissos
  de hoje `confirmed` → `done`. **Não** criam eventos, não respondem convites, não mexem no calendário.
- Enviam e-mail só para a assessoria; antes da viagem, só se houver novidade.
- Escopo explícito: listar os temas da missão e os temas **fora de escopo** (para não poluir os alertas).
- Desligar no encerramento.

## Texto-base — manhã
```
BRIEFING DA MANHÃ — Missão [NOME] — fuso [IANA]

1. E-mails das últimas 24 h de: [remetentes/organizadores] ou com: [palavras-chave da missão].
   Ignorar: [temas fora de escopo].
2. Classificar: 🔴 urgente (prazo < 24 h, voo, mudança de local) · 🟡 importante · 🟢 informativo ·
   📌 novo convite.
3. Para cada 🔴/🟡: inserir em mission_updates {mission:'[id]', source, summary (1 linha), priority}.
4. Ler a agenda de hoje (mission_events, mission='[id]', event_date = hoje).
5. Se houver novidade (ou sempre, durante a missão), enviar e-mail a [assessoria]:
   Assunto: [DATA] · Briefing — [MISSÃO]
   Corpo: agenda de hoje + itens por categoria + link do painel.
6. Não criar eventos nem responder convites.
```

## Texto-base — noite
```
DEBRIEF DA NOITE — Missão [NOME] — fuso [IANA]

1. E-mails desde o meio-dia relacionados à missão (mesmas fontes).
2. Novos contatos, convites e mudanças para amanhã → mission_updates.
3. Marcar como 'done' os compromissos de hoje que estavam 'confirmed'.
4. E-mail curto a [assessoria]: o que foi feito hoje, o que muda amanhã, pendências.
```

## Nível leve (sem banco)
Mesmos textos, trocando os passos de banco por "atualizar a coluna status/alertas na planilha [link]".
