// Scroll choreography for the Famiglia Mancini page. Loaded only when motion
// is allowed; every element is visible and usable without it.

export function initScenes({ festoon }) {
  const { gsap, ScrollTrigger, SplitText } = window;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  entrance(gsap, festoon);
  document.documentElement.classList.add('motion-ready');
  entryExit(gsap, festoon);
  if (SplitText) {
    gsap.registerPlugin(SplitText);
    headings(gsap, SplitText);
  }
  saga(gsap);
  doors(gsap);
  menus(gsap);
  street(gsap);
  reserveFlood(gsap);

  mm.add('(min-width: 900px)', () => sagaYears(gsap));

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

/* The family name rises out of the dark while the street's lights come on. */
function entrance(gsap, festoon) {
  document.querySelectorAll('[data-entry-line]').forEach((line) => {
    const inner = document.createElement('span');
    inner.className = 'entry__line-inner';
    inner.append(...line.childNodes);
    line.append(inner);
  });
  const inners = document.querySelectorAll('.entry__line-inner');
  const fades = document.querySelectorAll('[data-entry-fade]');
  gsap.set(inners, { yPercent: 110 });
  gsap.set(fades, { autoAlpha: 0, y: 24 });

  gsap.timeline({ delay: 0.2 })
    .add(() => festoon?.lightUp(), 0)
    .to(inners, { yPercent: 0, duration: 1.6, stagger: 0.18, ease: 'expo.out' }, 0.4)
    .to(fades, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out' }, 1.1);
}

function entryExit(gsap, festoon) {
  const entry = document.querySelector('.entry');
  if (!entry) return;
  gsap.to('.entry__content', {
    yPercent: -22,
    autoAlpha: 0.1,
    ease: 'none',
    scrollTrigger: { trigger: entry, start: 'top top', end: 'bottom top', scrub: true },
  });
  // The camera drifts through the lights as the entry scrolls away.
  if (festoon) {
    window.ScrollTrigger.create({
      trigger: entry,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => festoon.setProgress(self.progress),
    });
  }
}

function headings(gsap, SplitText) {
  document.querySelectorAll('main h2.display, .foot__sign').forEach((el) => {
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

/* The painting opens from a window into the whole screen, then darkens so
   the story can be read over it. */
function saga(gsap) {
  const section = document.querySelector('.saga');
  const frame = section?.querySelector('[data-saga-frame]');
  if (!frame) return;
  const img = frame.querySelector('img');
  const shade = section.querySelector('[data-saga-shade]');
  gsap.timeline({
    scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: true },
  })
    .fromTo(frame, { clipPath: 'inset(16% 18% 16% 18% round 4px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none' }, 0)
    .fromTo(img, { scale: 1.25 }, { scale: 1.04, ease: 'none' }, 0)
    .fromTo(shade, { autoAlpha: 0 }, { autoAlpha: 1, ease: 'none' }, 0.4);

  // A slow drift across the street while the story is read.
  gsap.to(img, {
    xPercent: -4,
    ease: 'none',
    scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: true },
  });

  section.querySelectorAll('[data-saga-step] > *').forEach((el) => {
    gsap.from(el, {
      y: 40,
      autoAlpha: 0,
      duration: 1.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 82%', once: true },
    });
  });
}

/* Each year counts up from the one before as it arrives. */
function sagaYears(gsap) {
  const years = [...document.querySelectorAll('.saga__year')];
  years.forEach((el, i) => {
    const to = Number(el.textContent);
    const from = i ? Number(years[i - 1].textContent) : to - 6;
    const counter = { v: from };
    gsap.to(counter, {
      v: to,
      duration: 1.4,
      ease: 'expo.out',
      onUpdate: () => { el.textContent = String(Math.round(counter.v)); },
      scrollTrigger: { trigger: el, start: 'top 80%', once: true },
    });
  });
}

/* The doors open upward one after the other, like shutters at opening time. */
function doors(gsap) {
  const list = document.querySelector('[data-doors]');
  if (!list) return;
  const items = list.querySelectorAll('.door');
  gsap.fromTo(items, { clipPath: 'inset(100% 0% 0% 0%)' }, {
    clipPath: 'inset(0% 0% 0% 0%)',
    duration: 1.4,
    stagger: 0.14,
    ease: 'expo.inOut',
    scrollTrigger: { trigger: list, start: 'top 80%', once: true },
  });
  gsap.from(list.querySelectorAll('.door__no'), {
    yPercent: 30,
    autoAlpha: 0,
    duration: 1.2,
    stagger: 0.14,
    delay: 0.5,
    ease: 'expo.out',
    scrollTrigger: { trigger: list, start: 'top 80%', once: true },
  });
}

function menus(gsap) {
  document.querySelectorAll('.menus__item').forEach((item) => {
    gsap.from(item.children, {
      y: 32,
      autoAlpha: 0,
      duration: 1,
      stagger: 0.08,
      ease: 'expo.out',
      scrollTrigger: { trigger: item, start: 'top 85%', once: true },
    });
  });
}

/* The street is drawn first, then the houses take their places on it. */
function street(gsap) {
  const avenue = document.querySelector('[data-avenue]');
  if (!avenue) return;
  const tl = gsap.timeline({ scrollTrigger: { trigger: avenue, start: 'top 80%', once: true } });
  tl.fromTo(avenue, { '--draw': 0 }, { '--draw': 1, duration: 1.2, ease: 'expo.inOut' })
    .from(avenue.querySelectorAll('.avenue__house, .avenue__neighbour'), {
      autoAlpha: 0,
      y: (i, el) => (el.dataset.side === 'odd' ? -16 : 16),
      duration: 0.9,
      stagger: 0.1,
      ease: 'expo.out',
    }, 0.6);
}

/* The reservation floods in from below, in the colour of the chosen house. */
function reserveFlood(gsap) {
  const flood = document.querySelector('.reserve__flood');
  if (!flood) return;
  gsap.fromTo(flood, { clipPath: 'circle(0% at 50% 100%)' }, {
    clipPath: 'circle(150% at 50% 100%)',
    ease: 'none',
    scrollTrigger: { trigger: '.reserve', start: 'top 92%', end: 'top 25%', scrub: true },
  });
}
