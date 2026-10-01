# Famiglia Mancini · segunda proposta

Um ecossistema para as casas da Famiglia Mancini na Rua Avanhandava: a página da família e uma página para cada casa, com reserva, cardápios e endereços que nunca se misturam.

Site estático (HTML, CSS e JavaScript em módulos), sem etapa de build. Pode ser publicado como está no GitHub Pages.

## Rodar localmente

```bash
npm install
npm run setup     # copia GSAP/Lenis/fontes para assets/ e gera as imagens WebP
npm run serve     # http://localhost:4173
npm test          # Playwright, desktop e mobile
```

`assets/vendor`, `assets/fonts` e `assets/img` já estão gerados; `npm run setup` só é necessário ao atualizar bibliotecas ou imagens.

## Páginas

| Endereço | O quê |
|---|---|
| `/` | Famiglia Mancini: entrada, a história da rua, a escolha da casa, a reserva central, os cardápios (um por casa) e a rua desenhada com os dados de cada casa |
| `/trattoria/` | Famiglia Mancini Trattoria, nº 81 (a experiência completa, com fotos, cardápio e reserva pelo WhatsApp) |
| `/trattoria/cardapio.html` | Cardápio completo da Trattoria, com busca |
| `/il-ristorante/` · `/il-ristorante/cardapio.html` | Il Ristorante, nº 126, e o cardápio completo dele |
| `/pizzaria/` · `/pizzaria/cardapio.html` | Pizzaria Famiglia Mancini, nº 37, e o cardápio completo dela |
| `/cardapio.html` | Redireciona para o cardápio da Trattoria (endereço antigo) |

## Onde mudar as coisas

Todos os dados das casas ficam em **`assets/js/houses.js`**, uma entrada por casa. Campo `null` quer dizer "a casa ainda não informou": a interface mostra o espaço como "A publicar" e não inventa nada.

| O quê | Onde |
|---|---|
| Horários de uma casa | `houses.js` → `hours` (abertura e fechamento por dia da semana). Com horários, a casa ganha status aberto/fechado, tabela de horários e horários na reserva. A página da Trattoria ainda tem a tabela escrita em `trattoria/index.html` e no JSON-LD |
| WhatsApp, e-mail, Instagram, TikTok | `houses.js` → `contact`. As três casas usam, por enquanto, o mesmo WhatsApp provisório (`TEMP_WHATSAPP`), até a proposta ser aceita; atualize também os `href="https://wa.me/..."` do HTML, para quem navega sem JS |
| Reserva de uma casa | `houses.js` → `booking` + `contact.whatsapp`. Com `hours`, o formulário oferece os horários da casa; sem eles (Il Ristorante e Pizzaria, por enquanto), pede o horário desejado e a casa confirma pelo WhatsApp |
| Cardápios | Um arquivo por casa: `trattoria/cardapio.html`, `il-ristorante/cardapio.html`, `pizzaria/cardapio.html` (cada prato é um `li.carta__item`). Os dois últimos foram transcritos dos PDFs oficiais da casa; bebidas e vinhos ficam no PDF |
| Fotos | Trattoria: `assets/source/`. Il Ristorante e Pizzaria: fotos tiradas dos PDFs oficiais dos cardápios, em `assets/source/cardapios/` (são pequenas; trocar por originais quando a casa enviar). A fachada do Il Ristorante e o salão da Pizzaria seguem como "A publicar" |
| Cores, tipos e a identidade de cada casa | `assets/css/tokens.css` (temas `[data-theme]`), `ristorante.css`, `pizzaria.css`, `trattoria.css` |
| Imagens originais | `assets/source/` → `npm run images` gera `assets/img/` |

Para acrescentar uma casa: uma entrada em `houses.js`, um tema em `tokens.css`, uma pasta com o `index.html` (como `il-ristorante/`) e o link na faixa "Casas da Famiglia Mancini" das páginas.

## Estrutura do código

- `houses.js` · dados das casas, horários, status, rotas e links.
- `booking.js` · reserva central, igual em todas as páginas: primeiro a casa, depois dia, horário, pessoas e dados, com um resumo que se preenche ao lado. Não existe backend: para a casa com canal publicado, monta a mensagem para o WhatsApp dela; para as outras, diz isso e não envia nada. Pedidos ficam salvos só no navegador do cliente.
- `transition.js` · a troca de casa: uma cortina na cor da casa de destino, com o número e o nome dela, que continua na página seguinte e sobe. Sem movimento (preferência do sistema), os links navegam direto.
- `visit.js`, `street.js`, `map.js` · endereço, horários, contato e mapa de cada casa (o mapa só carrega quando pedido).
- `festoon.js` · renderizador WebGL próprio das lâmpadas da rua, com fallback em Canvas 2D e quadro estático para movimento reduzido.
- `hub-scenes.js`, `trattoria-scenes.js`, `house-scenes.js` · coreografia de scroll (GSAP + ScrollTrigger), carregada só quando há movimento; o site é completo sem ela.

## O que não foi inventado

Todo fato no site vem de duas fontes: o material da primeira proposta (textos, cardápio, horários, endereços, redes, fotos e a pintura da rua) e o site oficial famigliamancini.com.br, consultado em 1º de outubro de 2026 (textos do Il Ristorante e da Pizzaria, e os cardápios em PDF das duas casas). O site oficial não publica os horários de funcionamento do Il Ristorante e da Pizzaria, e os guias da internet se contradizem; por isso eles seguem como "A publicar", e a reserva dessas casas pede o horário desejado. Não há depoimentos, avaliações, prêmios ou disponibilidade de mesas simulada.
