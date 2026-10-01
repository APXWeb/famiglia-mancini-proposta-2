// Shared page chrome: live hours status, WhatsApp links, top bar,
// chapter wire, mobile drawer and in-page anchors.
import { houseById, currentHouse, openStatus, serviceDay, whatsappUrl } from './houses.js';
import { scrollToTarget, smooth } from './scroll.js';

const BULB_COLOURS = ['--bulb-amber', '--bulb-rose', '--bulb-cobalt', '--bulb-emerald', '--bulb-tangerine', '--bulb-white'];

/** The house an element speaks for: its own data-house, else the page's. */
const houseOf = (el) => (el.dataset.house ? houseById(el.dataset.house) : currentHouse());

/** Open/closed status from each house's real hours. Houses without
 *  published hours show no status at all. */
export function renderStatus(scope = document) {
  scope.querySelectorAll('[data-status]').forEach((el) => {
    const status = openStatus(houseOf(el));
    el.hidden = !status;
    if (!status) return;
    el.dataset.open = String(status.open);
    const text = el.querySelector('[data-status-text]');
    if (text) text.textContent = status.label;
  });
  scope.querySelectorAll('[data-hours]').forEach((table) => {
    const house = houseOf(table);
    if (!house?.hours) return;
    const today = serviceDay(house);
    table.querySelectorAll('tr[data-days]').forEach((row) => {
      row.classList.toggle('is-today', row.dataset.days.split(' ').map(Number).includes(today));
    });
  });
}

export function initStatus() {
  renderStatus();
  setInterval(renderStatus, 60_000);
}

/** WhatsApp links follow the number in houses.js. */
export function initWhatsappLinks() {
  document.querySelectorAll('[data-wa-link]').forEach((a) => {
    const house = houseOf(a);
    if (house?.contact.whatsapp) a.href = whatsappUrl(house);
  });
  document.querySelectorAll('[data-wa-number]').forEach((el) => {
    const house = houseOf(el);
    if (house?.contact.whatsappLabel) el.textContent = house.contact.whatsappLabel;
  });
}

export function initBar() {
  const bar = document.querySelector('[data-bar]');
  if (!bar) return;
  const hero = document.querySelector('.hero');
  const alwaysSolid = bar.classList.contains('is-solid');
  let lastY = window.scrollY;

  const update = () => {
    const y = window.scrollY;
    if (!alwaysSolid) bar.classList.toggle('is-solid', y > (hero ? hero.offsetHeight - bar.offsetHeight : 80) * 0.6);
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    if (goingDown && y > 480 && !document.body.classList.contains('drawer-open')) bar.classList.add('is-hidden');
    if (goingUp || y < 120) bar.classList.remove('is-hidden');
    lastY = y;
  };
  const lenis = smooth();
  if (lenis) lenis.on('scroll', update);
  else window.addEventListener('scroll', update, { passive: true });
  update();

  // Keep the bar visible while something inside it has keyboard focus.
  bar.addEventListener('focusin', () => bar.classList.remove('is-hidden'));
}

/** Chapter wire: one bulb per chapter, lit as the reader passes it. */
export function initChapterWire() {
  const wire = document.querySelector('[data-wire]');
  const chapters = [...document.querySelectorAll('[data-chapter]')];
  const navLinks = [...document.querySelectorAll('.bar__nav a[href^="#"]')];
  if (!chapters.length) return;

  const bulbs = chapters.map((chapter, i) => {
    if (!wire) return null;
    const bulb = document.createElement('span');
    bulb.className = 'chapter-wire__bulb';
    const x = (i + 1) / (chapters.length + 1);
    bulb.style.setProperty('--x', x.toFixed(4));
    bulb.style.setProperty('--c', `var(${BULB_COLOURS[i % BULB_COLOURS.length]})`);
    wire.appendChild(bulb);
    return bulb;
  });

  const setCurrent = (index) => {
    bulbs.forEach((b, i) => {
      if (!b) return;
      b.classList.toggle('is-current', i === index);
      b.classList.toggle('is-passed', i < index);
    });
    const id = chapters[index]?.id;
    navLinks.forEach((a) => {
      if (a.getAttribute('href') === `#${id}`) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  };

  // Fires whenever a chapter edge crosses the middle of the screen.
  const io = new IntersectionObserver(() => {
    // The current chapter is the last one whose top has crossed mid-screen.
    let current = 0;
    chapters.forEach((c, i) => {
      if (c.getBoundingClientRect().top < window.innerHeight * 0.5) current = i;
    });
    setCurrent(current);
  }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
  chapters.forEach((c) => io.observe(c));
  setCurrent(0);
}

export function initDrawer() {
  const drawer = document.querySelector('[data-drawer]');
  const openBtn = document.querySelector('[data-menu-open]');
  const closeBtn = document.querySelector('[data-menu-close]');
  if (!drawer || !openBtn) return;
  const main = document.querySelector('main');
  const footer = document.querySelector('footer');
  drawer.inert = true;

  const focusables = () => [...drawer.querySelectorAll('a[href], button:not([disabled])')];

  const open = () => {
    drawer.inert = false;
    drawer.classList.add('is-open');
    document.body.classList.add('drawer-open');
    openBtn.setAttribute('aria-expanded', 'true');
    [main, footer].forEach((el) => el && (el.inert = true));
    smooth()?.stop();
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => closeBtn?.focus());
  };

  const close = ({ restoreFocus = true } = {}) => {
    drawer.classList.remove('is-open');
    drawer.inert = true;
    document.body.classList.remove('drawer-open');
    openBtn.setAttribute('aria-expanded', 'false');
    [main, footer].forEach((el) => el && (el.inert = false));
    document.documentElement.style.overflow = '';
    smooth()?.start();
    if (restoreFocus) openBtn.focus();
  };

  openBtn.addEventListener('click', open);
  closeBtn?.addEventListener('click', () => close());
  drawer.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    const items = focusables();
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  drawer.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    close({ restoreFocus: false });
    if (href.startsWith('#')) {
      e.preventDefault();
      // Let the drawer start closing before the page moves.
      setTimeout(() => scrollToTarget(href), 60);
    }
  });
  window.matchMedia('(min-width: 1081px)').addEventListener('change', (e) => {
    if (e.matches && drawer.classList.contains('is-open')) close({ restoreFocus: false });
  });
}

/** Same-page anchors go through the smooth scroller and move focus. */
export function initAnchors() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || link.closest('[data-drawer]')) return;
    const href = link.getAttribute('href');
    if (href === '#' || !document.querySelector(href)) return;
    e.preventDefault();
    history.pushState(null, '', href);
    scrollToTarget(href);
  });
}
