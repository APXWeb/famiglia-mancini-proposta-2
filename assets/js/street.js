// The street drawn on the group page: each house on Rua Avanhandava is a tab,
// and the panel under the street shows that house's address, hours and
// contact, straight from houses.js.
import { houseById } from './houses.js?v=9bed76d7';
import { visitHtml } from './visit.js?v=b65322cf';
import { initMap } from './map.js?v=deee434b';
import { renderStatus } from './chrome.js?v=93ce0b70';

export function initStreet() {
  const tabs = [...document.querySelectorAll('[data-avenue] [role="tab"]')];
  const panel = document.querySelector('[data-where-panel]');
  if (!tabs.length || !panel) return;

  function show(tab, { focus = false } = {}) {
    const house = houseById(tab.dataset.tab);
    if (!house) return;
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', tab.id);
    panel.innerHTML = visitHtml(house, { enter: true });
    panel.classList.remove('is-changing');
    void panel.offsetWidth; // restart the entrance animation
    panel.classList.add('is-changing');
    initMap(panel);
    renderStatus(panel);
    if (focus) tab.focus();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => show(tab));
    tab.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      let next = null;
      if (step) next = tabs[(i + step + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (!next) return;
      e.preventDefault();
      show(next, { focus: true });
    });
  });

  show(tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0]);
}
