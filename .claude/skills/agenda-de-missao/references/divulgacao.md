# Divulgação: hotsite QR/NFC, cartão digital, carrosséis e banners

## Identidade
Definir no início: 2 fontes (títulos/corpo), 5–6 cores, uma "assinatura" visual recorrente (ex.: faixa de
cores), logos em PNG/WebP com fundo transparente, regras de foto (crédito, legenda, autorização de imagem).
Perguntar ao usuário o que ele **não** gosta (ex.: fade sobre fotos, sombra no rosto) e registrar no diário.

## Hotsite de uma página (QR code / chaveiro NFC)
- Segunda página do mesmo build (Vite multi-page) ou site próprio; prévia de link própria.
- Parâmetro para quem chega pelo objeto (ex.: `?nfc`) muda a saudação; sem ele, versão para redes/QR.
- Seções sugeridas: abertura com foto → números com fonte → gráfico da principal conquista → onde nos
  encontrar no evento (depois: "agenda por agenda" com link da matéria) → galeria → vídeos → notícias →
  materiais → contatos → rodapé com Compartilhar.
- Conteúdo num único arquivo de dados bilíngue; fotos WebP ~1600 px ≤ 250 KB com legenda, `alt` e crédito.
- Vídeos: YouTube (carregar o player só ao tocar) ou Drive (`/file/d/ID/preview`, arquivo público por link).
- **O link gravado em NFC/QR impresso nunca muda e fica no ar depois da missão.**
- Testar num iPhone e num Android com uma tag de teste antes de gravar o lote.

## Cartão de visitas digital
Foto, nome, cargo, organização, e-mails, site, LinkedIn, WhatsApp, bio PT/EN, QR para a própria URL,
"Salvar contato" (.vcf). Um por pessoa (`?cartao=nome`). Conteúdo estático, sem banco.

## Carrossel para redes (1080×1350)
- HTML com uma `<section>` por slide + script Playwright que gera PNGs (deviceScaleFactor 2) e um PDF
  (LinkedIn: "Adicionar documento").
- Antes: anúncio da participação (resultados, equipe, agenda pública, QR). Durante: um por painel (título
  oficial e painelistas corretos). Depois: resumo pessoal (resultados → momentos → parceiros → bastidores →
  obrigado com QR).
- Fotos de terceiros e PNGs fora do git. Legenda entregue no chat, com links e hashtags.

## Banner para o site institucional
Formatos comuns: 1920×600, 1140×300, 1080×1080, 1024×512. Entregar JPG + HTML de incorporação com `alt`.

## Manual de transporte (opcional)
Mapa esquemático com rotas reais (ferramenta de mapas), linhas de ônibus/trem, restrições de trânsito do
evento, táxi, frases no idioma local, checklist. Avisar que o traçado é aproximado.
