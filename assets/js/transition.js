// Moving between the houses is part of the experience: a link marked
// data-go="<house id>" (or "grupo") closes a curtain in the colour of the
// destination, which carries its street number and name. The next page opens
// already behind the same curtain (see the inline script in each <head>) and
// lifts it. Without motion, or with a modifier key, links behave normally.
import { houseById } from './houses.js?v=9bed76d7';

const KEY = 'mancini.arrive';
const OUT_MS = 720;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

const MARK = new URL('../img/medalhao-320.webp', import.meta.url).href;
const GROUP = { id: 'grupo', number: '', short: 'Famiglia Mancini', name: 'Famiglia Mancini' };

function curtainFor(dest, from) {
  const el = document.createElement('div');
  el.className = 'curtain';
  el.dataset.theme = dest.id;
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `
    <div class="curtain__inner">
      ${dest.number ? `<span class="curtain__no num">${dest.number}</span>` : `<img class="curtain__mark" src="${MARK}" width="320" height="320" alt="">`}
      <span class="curtain__name">${dest.name}</span>
    </div>`;

  // The curtain grows out of what was pressed: a panel opens from its own
  // rectangle, a link from the pointer.
  const rect = from?.getBoundingClientRect();
  if (rect && rect.width > window.innerWidth * 0.2) {
    const { innerWidth: w, innerHeight: h } = window;
    el.style.setProperty('--from', `inset(${rect.top}px ${w - rect.right}px ${h - rect.bottom}px ${rect.left}px)`);
    el.style.setProperty('--to', 'inset(0px 0px 0px 0px)');
  } else {
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    el.style.setProperty('--from', `circle(0px at ${x}px ${y}px)`);
    el.style.setProperty('--to', `circle(${Math.hypot(window.innerWidth, window.innerHeight)}px at ${x}px ${y}px)`);
  }
  return el;
}

function go(link, event) {
  const id = link.dataset.go;
  const dest = id === 'grupo' ? GROUP : houseById(id);
  if (!dest) return;
  event.preventDefault();
  const origin = link.closest('[data-go-origin]') || link;
  const curtain = curtainFor(dest, origin);
  document.body.append(curtain);
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ to: dest.id, at: Date.now() }));
  } catch {
    // Storage blocked: the next page simply opens without the curtain.
  }
  requestAnimationFrame(() => requestAnimationFrame(() => curtain.classList.add('is-closed')));
  setTimeout(() => { window.location.href = link.href; }, OUT_MS);
}

/** Lifts the arrival curtain set up by the inline <head> script. */
function arrive() {
  const html = document.documentElement;
  if (!html.classList.contains('is-arriving')) return;
  const lift = () => {
    html.classList.add('is-lifting');
    setTimeout(() => html.classList.remove('is-arriving', 'is-lifting'), 1100);
  };
  // Wait for the first fonts so the page under the curtain is settled.
  const ready = document.fonts?.ready ?? Promise.resolve();
  Promise.race([ready, new Promise((r) => setTimeout(r, 450))]).then(() => requestAnimationFrame(lift));
}

export function initTransitions() {
  arrive();

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-go]');
    if (!link || e.defaultPrevented || reduce.matches) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || link.target === '_blank') return;
    if (link.getAttribute('aria-current') === 'page') return;
    go(link, e);
  });

  // Warm the next universe while the pointer is on its way.
  const prefetched = new Set();
  document.addEventListener('pointerover', (e) => {
    const link = e.target.closest('a[data-go]');
    if (!link || prefetched.has(link.href)) return;
    prefetched.add(link.href);
    const hint = document.createElement('link');
    hint.rel = 'prefetch';
    hint.href = link.href;
    document.head.append(hint);
  });

  // Coming back through the history cache: the old curtain must not stay.
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) document.querySelectorAll('.curtain').forEach((c) => c.remove());
  });
}
