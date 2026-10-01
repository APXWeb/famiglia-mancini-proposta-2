// Address, hours, contact and map for one house, drawn from houses.js.
// Whatever the house has not published yet is shown as an open slot, never
// filled in.
import { fullAddress, routeUrl, hoursTable, whatsappUrl, withArticle, siteUrl } from './houses.js?v=9bed76d7';

const icon = (id) => `<svg class="icon" aria-hidden="true"><use href="#${id}"/></svg>`;
const NEW_TAB = '<span class="visually-hidden"> (abre em nova aba)</span>';

export const slot = (text) => `<div class="slot"><p class="slot__label awning">A publicar</p><p class="slot__text">${text}</p></div>`;

function hoursBlock(house) {
  if (!house.hours) return slot(`Os horários de funcionamento ${withArticle(house, 'de')}.`);
  const rows = hoursTable(house)
    .map((r) => `<tr data-days="${r.days.join(' ')}"><th scope="row">${r.label}</th><td class="num">${r.text}</td></tr>`)
    .join('');
  return `
    <table class="hours" data-hours data-house="${house.id}">
      <caption class="visually-hidden">Horário de funcionamento ${withArticle(house, 'de')}</caption>
      <tbody>${rows}</tbody>
    </table>
    <p class="status awning" data-status data-house="${house.id}"><span class="status__bulb"></span><span data-status-text>Horários</span></p>`;
}

function contactBlock(house) {
  const c = house.contact;
  const items = [];
  if (c.whatsapp) items.push(`<li><a href="${whatsappUrl(house)}" target="_blank" rel="noopener">${icon('i-chat')}WhatsApp ${c.whatsappLabel}${NEW_TAB}</a></li>`);
  if (c.email) items.push(`<li><a href="mailto:${c.email}">${c.email}</a></li>`);
  if (c.instagram) items.push(`<li><a href="https://www.instagram.com/${c.instagram}" target="_blank" rel="noopener">Instagram @${c.instagram}${NEW_TAB}</a></li>`);
  if (c.tiktok) items.push(`<li><a href="https://www.tiktok.com/@${c.tiktok}" target="_blank" rel="noopener">TikTok @${c.tiktok}${NEW_TAB}</a></li>`);
  if (!items.length) return slot(`Telefone, WhatsApp e redes sociais ${withArticle(house, 'de')}.`);
  return `<ul class="visit__contact" role="list">${items.join('')}</ul>`;
}

/**
 * The visit grid for a house. `headingLevel` keeps the outline right where
 * the block is placed; `enter` adds a link into the house's own page.
 */
export function visitHtml(house, { headingLevel = 3, enter = false } = {}) {
  const h = `h${headingLevel}`;
  return `
    <div class="grid visit__grid">
      <div class="visit__col">
        <${h} class="awning">Endereço</${h}>
        <address>${house.address.street}<br>${house.address.district}, ${house.address.city}, ${house.address.region}</address>
        <ul class="visit__links" role="list">
          <li><a class="wire-link" href="${routeUrl(house)}" target="_blank" rel="noopener">${icon('i-pin')}Traçar rota<span class="visually-hidden"> até ${fullAddress(house)} no Google Maps (abre em nova aba)</span></a></li>
          ${enter ? `<li><a class="wire-link" href="${siteUrl(house.path)}" data-go="${house.id}">${icon('i-arrow')}Entrar ${withArticle(house, 'em')}</a></li>` : ''}
        </ul>
      </div>
      <div class="visit__col">
        <${h} class="awning">Horários</${h}>
        ${hoursBlock(house)}
      </div>
      <div class="visit__col">
        <${h} class="awning">Contato</${h}>
        ${contactBlock(house)}
      </div>
    </div>
    <div class="map" data-map data-house="${house.id}">
      <button class="map__load" type="button" data-map-load>
        ${icon('i-pin')}
        <span><span class="display">Mostrar o mapa</span><span class="awning">${house.address.street} · carrega o Google Maps</span></span>
      </button>
    </div>`;
}
