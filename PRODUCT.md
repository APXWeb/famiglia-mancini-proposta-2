# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated (inferred from the brief, no interview round): static HTML/CSS/JS with no build step, matching the rest of the APX Web portfolio and its GitHub Pages hosting. Third-party libraries (GSAP + ScrollTrigger, Lenis, Three.js) are vendored into `assets/vendor/` by `npm run vendor`; images are optimized by `npm run images`. Playwright covers the main flows.

## Users

- People in São Paulo deciding where to have a long, shared Italian meal, usually with family or friends, often for a weekend night. They come from Instagram/TikTok, Google, or a shared link on their phone.
- Inferred: the owners of the Grupo Mancini evaluating this as the second website proposal from Apex Web.

## Product Purpose

The website of Famiglia Mancini Trattoria. It makes the house desirable before the visit and turns that desire into a reservation request (sent to the house over WhatsApp), a menu consultation, or directions to Rua Avanhandava.

## Positioning

A trattoria founded in May 1980 on Rua Avanhandava, the traditional house of the Grupo Mancini, whose rooms are themselves the attraction: a ceiling dense with hanging fiaschi, lanterns and copper pans, stained-glass windows, stone arches, a fountain inside, and a sala de antepastos with more than 70 options. Dishes come in generous portions, served for two or more, in copper pans.

## Operating Context

- Address: Rua Avanhandava, 81, Bela Vista, São Paulo, SP.
- Hours: Dom 11h30 às 00h · Seg a qua 11h30 às 01h · Qui 11h30 às 01h30 · Sex e sáb 11h30 às 02h30.
- Reservations are requested through WhatsApp. Tolerance of 15 minutes after the reserved time. No booking backend exists: the site cannot confirm availability.
- WhatsApp shown: (11) 94481-5707. Per the incumbent repo history, this is a temporary number used until the proposal is accepted; it must stay easy to swap (single constant).
- E-mail: reservas@famigliamancini.com.br. Instagram @famigliamancini_oficial. TikTok @famigliamancini.
- Grupo Mancini on the same street: Il Ristorante (nº 126, opened 2001), Pizzaria Famiglia Mancini (nº 37, founded 2004), Calligraphia (nº 40).
- Full menu with prices exists (incumbent `cardapio.html`) plus an external PDF with the wine list.

## Capabilities and Constraints

- Real: menu, prices, hours, address, contact links, reservation message to WhatsApp, local "minhas reservas" list on the visitor's device.
- Not real and must not be faked: table availability, instant confirmation, online payment, reviews.
- Inconsistency found in the incumbent: its FAQ said the antepasto room is included, while the menu lists "Antepasto (100 gramas) R$ 27,00, self-service". The menu is the authority.

## Brand Commitments

- Name: Famiglia Mancini Trattoria (Italian spelling "Famiglia"). Signature line on the facade: "O Sul da Itália nessa cozinha".
- Visual identity pinned by the user (2026-10-01): use the colours and fonts of the first proposal (https://trattoria-famiglia-mancini.netlify.app/): warm black #14100d, cream #f3ead9, Mancini red #c8262b, gold #c9922f / #e0ae52; Playfair Display (italic gold accents) and Inter.
- Assets: round orange medallion logo with "Trattoria · Famiglia Mancini · ★1980"; red wordmark with "★1980"; the mascot illustration (figure lifting spaghetti on a fork); the painted postcard of Rua Avanhandava.

## Evidence on Hand

Photos in `assets/source/`: facade by day, main salão, sala de antepastos, three dishes in copper pans (penne frutos do mar, canelone fiorentina, fetuccini com polpetone), a low-resolution cheesecake photo, the Avanhandava painting, logos, mascot.
Facts stated by the incumbent site: founded May 1980; more than 15 million people received; more than 70 antepasto options; four decades of history.
Absent, never fabricate: testimonials, ratings, awards, chef or family names, ingredient sourcing, interior photos at night, wine list details, prices beyond the menu.

## Product Principles

1. The rooms are the proof: show the place before describing it.
2. Every fact on the page is a fact from the house; gaps stay visibly open, never filled.
3. Desire leads to one clear action: request a table.
4. Honest functionality: the site says exactly what happens when you press a button.

## Accessibility & Inclusion

WCAG 2.1 AA. Full use with reduced motion, keyboard only and screen readers; the 3D layer is decorative and optional.
