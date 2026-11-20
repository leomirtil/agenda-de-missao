# CLAUDE.md — Agenda da missão [NOME DA MISSÃO]

Diário e manual técnico da missão. Atualizar a cada sessão: decisões, IDs, pendências, armadilhas.

## Missão
- **Evento:** [evento] · **Local:** [cidade, país] · **Datas:** [início–fim] (viagem: [embarque–retorno])
- **Fuso do destino:** [IANA, ex.: Europe/Istanbul] · **Fuso de casa:** [IANA]
- **Chefe da missão:** [nome, cargo] · **Equipe:** [nomes] · **Assessoria em casa:** [nome]
- **Comitiva (2º painel)?** [sim/não; órgãos participantes]
- **VIP (compromissos internos por padrão):** [nome]

## Links
- Painel interno: [URL] (senha: **não registrar aqui**; hash em `ACCESS_HASH`/`VITE_ACCESS_HASH`)
- Agenda pública: [URL]/?publico · Cartão: [URL]/?cartao · Hotsite: [URL]/[caminho]
- Repositório: [URL] (criado a partir de https://github.com/leomirtil/agenda-de-missao) · Banco: Supabase [projeto], `mission = '[id-da-missao]'`

## Stack e regras técnicas
- React 18 + Vite 6 + Supabase Realtime + Vercel (auto-deploy na `main`).
- NÃO remover a assinatura Realtime. Conteúdo da agenda no banco, não no código.
- Toda inserção com `mission`; eventos públicos com `public_detail`.
- Testar em 320/360/375/414 px sem rolagem lateral antes de publicar layout.
- PR em rascunho; publicar só com autorização.

## Regras de conteúdo (decisões do usuário)
- Nunca enviar e-mail nem criar evento de calendário sem confirmação.
- Fora do público: localizadores, reservas, endereço de hospedagem, roteiros, contatos pessoais.
- Nenhum número sem fonte.
- [outras decisões]

## Agenda (IDs e estado)
| Data | ID | Compromisso | Status | Visibilidade |
|---|---|---|---|---|

## Pendências
- [ ] …

## Registro por sessão
### [data]
- …
