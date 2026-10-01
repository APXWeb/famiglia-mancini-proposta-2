// Cardápio page: search across every dish and a category rail that follows
// the reader.
import { initSmoothScroll, motionAllowed } from './scroll.js';
import { initStatus, initWhatsappLinks, initBar, initDrawer, initAnchors } from './chrome.js';

if (motionAllowed()) {
  initSmoothScroll();
  document.documentElement.classList.add('motion-ready');
}
initStatus();
initWhatsappLinks();
initBar();
initDrawer();
initAnchors();
initSearch();
initCategoryRail();

function normalize(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Wraps the first match of the query in <mark>, accent-insensitively. */
function highlight(original, query) {
  if (!query) return escapeHtml(original);
  const at = normalize(original).indexOf(query);
  if (at < 0) return escapeHtml(original);
  // NFD normalisation can change length; map back character by character.
  let start = -1;
  let end = -1;
  let pos = 0;
  for (let i = 0; i < original.length; i++) {
    const len = normalize(original[i]).length;
    if (start < 0 && pos >= at) start = i;
    pos += len;
    if (start >= 0 && pos >= at + query.length) { end = i + 1; break; }
  }
  if (start < 0 || end < 0) return escapeHtml(original);
  return `${escapeHtml(original.slice(0, start))}<mark>${escapeHtml(original.slice(start, end))}</mark>${escapeHtml(original.slice(end))}`;
}

function initSearch() {
  const input = document.querySelector('[data-search]');
  if (!input) return;
  const clear = document.querySelector('[data-search-clear]');
  const status = document.querySelector('[data-search-status]');
  const empty = document.querySelector('[data-search-empty]');
  const term = document.querySelector('[data-search-term]');
  const cats = [...document.querySelectorAll('[data-cat]')];
  const navLinks = new Map([...document.querySelectorAll('[data-cat-nav] a')].map((a) => [a.getAttribute('href').slice(1), a]));

  const items = cats.flatMap((cat) => [...cat.querySelectorAll('[data-item]')].map((el) => {
    const name = el.querySelector('.carta__name');
    return {
      el,
      cat,
      name,
      original: name.textContent,
      text: normalize(el.textContent.replace(/\s+/g, ' ')),
    };
  }));

  let timer = 0;
  function apply() {
    const query = normalize(input.value.trim());
    clear.hidden = !input.value;
    let total = 0;
    const perCat = new Map(cats.map((c) => [c, 0]));

    for (const item of items) {
      const match = !query || item.text.includes(query);
      item.el.hidden = !match;
      item.name.innerHTML = match ? highlight(item.original, query) : escapeHtml(item.original);
      if (match) {
        total++;
        perCat.set(item.cat, perCat.get(item.cat) + 1);
      }
    }
    for (const cat of cats) {
      const count = perCat.get(cat);
      cat.hidden = Boolean(query) && count === 0;
      // Filling lists, notes and photos only make sense for the whole category.
      cat.querySelectorAll('.carta__fillings, .carta__note, .carta__photo, .carta__sub').forEach((el) => { el.hidden = Boolean(query); });
      navLinks.get(cat.id)?.classList.toggle('is-empty', Boolean(query) && count === 0);
    }
    empty.hidden = !query || total > 0;
    term.textContent = input.value.trim();
    status.textContent = query ? (total === 1 ? '1 prato encontrado' : `${total} pratos encontrados`) : '';
    window.ScrollTrigger?.refresh();
  }

  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(apply, 120);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && input.value) { e.preventDefault(); input.value = ''; apply(); }
  });
  const reset = () => { input.value = ''; apply(); input.focus(); };
  clear.addEventListener('click', reset);
  document.querySelector('[data-search-reset]')?.addEventListener('click', reset);
}

function initCategoryRail() {
  const nav = document.querySelector('[data-cat-nav]');
  if (!nav) return;
  const links = [...nav.querySelectorAll('a')];
  const cats = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  const setActive = (id) => {
    links.forEach((a) => {
      const on = a.getAttribute('href') === `#${id}`;
      if (on) {
        a.setAttribute('aria-current', 'true');
        // On the horizontal rail, keep the active category in view.
        if (nav.scrollWidth > nav.clientWidth) {
          const left = a.offsetLeft - nav.clientWidth / 2 + a.offsetWidth / 2;
          nav.scrollTo({ left, behavior: 'smooth' });
        }
      } else {
        a.removeAttribute('aria-current');
      }
    });
  };

  // The active category is the last visible one whose top has passed a
  // third of the screen; at the top of the page that is the first one.
  let current = null;
  let queued = false;
  const update = () => {
    queued = false;
    const line = window.innerHeight * 0.33;
    const visible = cats.filter((c) => !c.hidden);
    let active = visible[0];
    for (const c of visible) if (c.getBoundingClientRect().top <= line) active = c;
    if (active && active.id !== current) {
      current = active.id;
      setActive(current);
    }
  };
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  document.querySelector('[data-search]')?.addEventListener('input', () => setTimeout(schedule, 150));
  update();
}
