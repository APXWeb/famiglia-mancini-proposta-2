# Famiglia Mancini Trattoria · segunda proposta

Site estático (HTML, CSS e JavaScript em módulos), sem etapa de build. Pode ser publicado como está no GitHub Pages, como a primeira proposta.

## Rodar localmente

```bash
npm install
npm run setup     # copia GSAP/Lenis/fontes para assets/ e gera as imagens WebP
npm run serve     # http://localhost:4173
npm test          # Playwright, desktop e mobile
```

`assets/vendor`, `assets/fonts` e `assets/img` já estão gerados; `npm run setup` só é necessário ao atualizar bibliotecas ou imagens.

## Onde mudar as coisas

| O quê | Onde |
|---|---|
| Número do WhatsApp (provisório até a proposta ser aceita) | `assets/js/house.js` → `HOUSE.whatsapp` e `whatsappLabel`. Os links no HTML são reescritos por JS; atualize também os `href="https://wa.me/..."` do HTML para quem navega sem JS. |
| Horários de funcionamento | `assets/js/house.js` (`OPEN`, `CLOSE_BY_WEEKDAY`), a tabela em `index.html` (`data-hours`) e o JSON-LD no `<head>` |
| Pratos e preços | `cardapio.html` (cada prato é um `li.carta__item`) |
| Cores, tipos, espaçamentos, easing | `assets/css/tokens.css` |
| Imagens originais | `assets/source/` → `npm run images` gera `assets/img/` |

## Estrutura

- `index.html` · narrativa em capítulos: Entrada, A casa, O salão, Antepastos, À mesa, Cardápio, A rua, Reserva, Visita.
- `cardapio.html` · cardápio completo com busca e navegação por categoria.
- `assets/js/festoon.js` · renderizador WebGL próprio das lâmpadas (sem biblioteca 3D), com fallback em Canvas 2D e quadro estático para movimento reduzido.
- `assets/js/scenes.js` · coreografia de scroll (GSAP + ScrollTrigger + SplitText). Só roda sem `prefers-reduced-motion`; o site é completo sem ela.
- `assets/js/booking.js` · pedido de reserva. Não existe backend: o formulário monta a mensagem para o WhatsApp da casa, que confirma por lá. Pedidos ficam salvos apenas no navegador do cliente.

## O que não foi inventado

Todo fato no site vem do material da primeira proposta (textos, cardápio, horários, endereços, redes). Não há depoimentos, avaliações, prêmios ou disponibilidade de mesas simulada. O FAQ da primeira proposta dizia que a sala de antepastos estava incluída; o cardápio cobra por peso (R$ 27,00 a cada 100 g), e esta proposta segue o cardápio.
