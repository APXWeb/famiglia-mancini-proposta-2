// Scroll choreography for the home page. Runs only when motion is allowed;
// every element is visible and usable without it.

export function initScenes({ festoon }) {
  const { gsap, ScrollTrigger, SplitText } = window;
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const mm = gsap.matchMedia();

  entrance(gsap, festoon);
  root.classList.add('motion-ready');

  heroExit(gsap, festoon);
  if (SplitText) {
    gsap.registerPlugin(SplitText);
    headings(gsap, SplitText);
  }
  door(gsap);
  salao(gsap);
  antipasti(gsap);
  menuIndex(gsap);
  reserveFlood(gsap);
  footer(gsap);

  mm.add('(min-width: 900px)', () => {
    dishesPinned(gsap);
    streetDrift(gsap);
  });
  mm.add('(max-width: 899px)', () => {
    dishesStacked(gsap);
  });

  // Lazy images and late fonts change heights: re-measure once they settle.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

/* The entrance: the headline slides out from behind the awning while the
   bulbs switch on, string by string. */
function entrance(gsap, festoon) {
  const lines = document.querySelectorAll('[data-hero-line]');
  lines.forEach((line) => {
    const inner = document.createElement('span');
    inner.className = 'hero__line-inner';
    inner.append(...line.childNodes);
    line.append(inner);
  });
  const inners = document.querySelectorAll('.hero__line-inner');
  const fades = document.querySelectorAll('[data-hero-fade]');
  gsap.set(inners, { yPercent: 108 });
  gsap.set(fades, { autoAlpha: 0, y: 24 });

  gsap.timeline({ delay: 0.15 })
    .add(() => festoon?.lightUp(), 0)
    .to(inners, { yPercent: 0, duration: 1.4, stagger: 0.14, ease: 'expo.out' }, 0.35)
    .to(fades, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.09, ease: 'expo.out' }, 0.9);
}

function heroExit(gsap, festoon) {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  gsap.to('.hero__content', {
    yPercent: -18,
    autoAlpha: 0.15,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  });
  if (festoon) {
    gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => festoon.setProgress(self.progress),
      },
    });
  }
}

/* Chapter headings rise line by line out of a mask. */
function headings(gsap, SplitText) {
  document.querySelectorAll('main h2.display:not(.door__title), .faq__title, .foot__sign').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 105,
          duration: 1.15,
          stagger: 0.09,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
  });
}

/* Signature: the medallion becomes the door. The sign turns away and leaves
   its orange disc, the disc grows until orange owns the whole screen, and
   the facade of Rua Avanhandava, 81 opens out of the orange. */
function door(gsap) {
  const stage = document.querySelector('[data-door]');
  if (!stage) return;
  const win = stage.querySelector('[data-door-window]');
  const img = win.querySelector('img');
  const disc = stage.querySelector('[data-door-disc]');
  const sign = stage.querySelector('[data-door-sign]');
  const intro = stage.querySelectorAll('[data-door-intro] > *');
  const caption = stage.querySelectorAll('[data-door-caption] > *');

  const r0 = () => disc.offsetWidth / 2;
  const rEnd = () => Math.hypot(stage.offsetWidth, stage.offsetHeight) / 2 + 24;

  gsap.set(win, { clipPath: 'circle(0px at 50% 50%)' });
  gsap.set(disc, { autoAlpha: 0 });
  gsap.set(img, { scale: 1.3 });
  gsap.set(caption, { autoAlpha: 0, y: 36 });

  gsap.timeline({
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      end: '+=190%',
      pin: true,
      scrub: 0.8,
      invalidateOnRefresh: true,
    },
  })
    .to(disc, { autoAlpha: 1, duration: 0.08, ease: 'none' }, 0.02)
    .to(sign, { rotate: -32, scale: 0.86, autoAlpha: 0, duration: 0.22, ease: 'power2.in' }, 0)
    .to(disc, { scale: () => rEnd() / r0(), duration: 0.3, ease: 'power2.in' }, 0.12)
    // The title steps aside as the disc grows; the caption retells it below.
    .to(intro, { autoAlpha: 0, y: -24, duration: 0.14, ease: 'power2.in' }, 0.14)
    .to(win, { clipPath: () => `circle(${rEnd()}px at 50% 50%)`, duration: 0.42, ease: 'power3.inOut' }, 0.44)
    .to(img, { scale: 1, duration: 0.56, ease: 'none' }, 0.44)
    .to(caption, { autoAlpha: 1, y: 0, duration: 0.14, stagger: 0.05, ease: 'power2.out' }, 0.84);
}

/* The camera tilts up from the tables to the ceiling of fiaschi. */
function salao(gsap) {
  const section = document.querySelector('.salao');
  const img = section?.querySelector('[data-salao-img]');
  if (!img) return;
  gsap.fromTo(img, { yPercent: -25.9, scale: 1.06 }, {
    yPercent: 0,
    scale: 1,
    ease: 'none',
    scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: true },
  });
  gsap.from(section.querySelectorAll('.salao__inventory li'), {
    autoAlpha: 0,
    x: -28,
    duration: 0.9,
    stagger: 0.08,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.salao__inventory', start: 'top 80%', toggleActions: 'play none none reverse' },
  });
}

function antipasti(gsap) {
  const figure = document.querySelector('.antipasti__figure');
  if (!figure) return;
  const img = figure.querySelector('img');
  const tl = gsap.timeline({
    scrollTrigger: { trigger: figure, start: 'top 88%', end: 'top 30%', scrub: 0.6 },
  });
  tl.fromTo(figure, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power3.out', duration: 1 }, 0)
    .fromTo(img, { scale: 1.25 }, { scale: 1, ease: 'power2.out', duration: 1 }, 0);
  gsap.from('.price-list__row', {
    autoAlpha: 0,
    y: 20,
    duration: 0.9,
    stagger: 0.12,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.price-list', start: 'top 88%', once: true },
  });
}

/* Desktop: three dishes share one pinned stage; each new pan rises over the
   last, and the index above lights the dish in view. */
function dishesPinned(gsap) {
  const stage = document.querySelector('[data-dishes]');
  if (!stage) return;
  const dishes = [...stage.querySelectorAll('[data-dish]')];
  const index = [...stage.querySelectorAll('[data-dish-index] li')];
  const figures = dishes.map((d) => d.querySelector('.dish__figure'));
  const images = dishes.map((d) => d.querySelector('img'));
  const texts = dishes.map((d) => d.querySelector('.dish__text'));

  gsap.set(figures.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' });
  gsap.set(images.slice(1), { scale: 1.2 });
  gsap.set(texts.slice(1), { autoAlpha: 0, y: 40 });

  const steps = dishes.length - 1;
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      end: `+=${steps * 90}%`,
      pin: true,
      scrub: 0.7,
      snap: { snapTo: 1 / steps, duration: { min: 0.25, max: 0.6 }, ease: 'power2.inOut' },
      onUpdate: (self) => {
        const active = Math.round(self.progress * steps);
        index.forEach((li, i) => li.classList.toggle('is-active', i === active));
      },
    },
  });
  for (let i = 1; i < dishes.length; i++) {
    const at = i - 1;
    tl.to(texts[i - 1], { autoAlpha: 0, y: -40, duration: 0.35, ease: 'power2.in' }, at + 0.1)
      .to(figures[i], { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power3.inOut' }, at + 0.1)
      .to(images[i], { scale: 1, duration: 0.9, ease: 'power2.out' }, at + 0.1)
      .to(texts[i], { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }, at + 0.5);
  }
  return () => gsap.set([...figures, ...images, ...texts], { clearProps: 'all' });
}

function dishesStacked(gsap) {
  document.querySelectorAll('[data-dish] .dish__figure').forEach((figure) => {
    gsap.fromTo(figure, { clipPath: 'inset(18% 0% 0% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)',
      ease: 'none',
      scrollTrigger: { trigger: figure, start: 'top 95%', end: 'top 45%', scrub: true },
    });
  });
}

function menuIndex(gsap) {
  gsap.from('.menu-index__list li', {
    autoAlpha: 0,
    y: 26,
    duration: 0.9,
    stagger: 0.045,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.menu-index__list', start: 'top 82%', once: true },
  });
}

/* Desktop: the painted street drifts past as you walk down the page. */
function streetDrift(gsap) {
  const painting = document.querySelector('[data-street]');
  const img = painting?.querySelector('[data-street-img]');
  if (!img) return;
  gsap.fromTo(img, { x: 0 }, {
    x: () => -(img.offsetWidth - painting.offsetWidth),
    ease: 'none',
    scrollTrigger: { trigger: painting, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
  });
  gsap.from('.street__numbers li', {
    autoAlpha: 0,
    y: 30,
    duration: 1,
    stagger: 0.1,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.street__numbers', start: 'top 88%', once: true },
  });
}

/* The orange of the sign floods the page for the reservation. */
function reserveFlood(gsap) {
  const flood = document.querySelector('[data-flood]');
  if (!flood) return;
  gsap.fromTo(flood, { clipPath: 'circle(0% at 18% 12%)' }, {
    clipPath: 'circle(150% at 18% 12%)',
    ease: 'power2.in',
    scrollTrigger: { trigger: '.reserve', start: 'top 92%', end: 'top 30%', scrub: true },
  });
}

function footer(gsap) {
  const mascot = document.querySelector('[data-mascot]');
  if (!mascot) return;
  gsap.fromTo(mascot, { rotate: -14, yPercent: 30 }, {
    rotate: 6,
    yPercent: -6,
    ease: 'none',
    scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true },
  });
}
