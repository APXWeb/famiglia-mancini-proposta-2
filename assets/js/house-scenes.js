// Scroll choreography shared by the Il Ristorante and Pizzaria pages. Each
// page's stylesheet decides the look; this only decides when things move.
// Loaded only when motion is allowed; everything is visible without it.

export function initScenes() {
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  entrance(gsap);
  document.documentElement.classList.add('motion-ready');

  // The house number drifts slower than the page, behind the name.
  document.querySelectorAll('.r-hero__no, .p-hero__no').forEach((no) => {
    gsap.to(no, {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: { trigger: no.parentElement, start: 'top top', end: 'bottom top', scrub: true },
    });
  });
  const art = document.querySelector('[data-hero-art]');
  if (art) {
    gsap.to(art, {
      yPercent: -10,
      rotate: -4,
      ease: 'none',
      scrollTrigger: { trigger: art.closest('section'), start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  rise(gsap, 'main h2.display, .r-casa__year, .r-casa__text, .r-casa__facts, .p-casa__text, .carte__intro .prose');

  // Frames and photos open like shutters.
  gsap.utils.toArray('.frame-slot, .frame-photo').forEach((frame, i) => {
    gsap.fromTo(frame, { clipPath: 'inset(0% 0% 100% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1.3,
      delay: (i % 3) * 0.12,
      ease: 'expo.inOut',
      scrollTrigger: { trigger: frame, start: 'top 88%', once: true },
    });
  });

  // The menu's categories arrive one after the other.
  gsap.from('.carte__index li', {
    y: 24,
    autoAlpha: 0,
    duration: 0.9,
    stagger: 0.05,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.carte__index', start: 'top 85%', once: true },
  });

  gsap.utils.toArray('.next__item').forEach((item, i) => {
    gsap.from(item, {
      yPercent: 12,
      autoAlpha: 0,
      duration: 1.2,
      delay: i * 0.12,
      ease: 'expo.out',
      scrollTrigger: { trigger: item, start: 'top 90%', once: true },
    });
  });

  const flood = document.querySelector('.reserve__flood');
  if (flood) {
    gsap.fromTo(flood, { clipPath: 'circle(0% at 50% 100%)' }, {
      clipPath: 'circle(150% at 50% 100%)',
      ease: 'none',
      scrollTrigger: { trigger: '.reserve', start: 'top 92%', end: 'top 25%', scrub: true },
    });
  }

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

function entrance(gsap) {
  const title = document.querySelector('[data-hero-title]');
  const parts = title ? [...title.children] : [];
  const fades = document.querySelectorAll('[data-hero-fade]');
  const no = document.querySelector('[data-hero-no], .p-hero__no');
  const art = document.querySelector('[data-hero-art]');
  gsap.set(parts, { clipPath: 'inset(0% 0% 100% 0%)', yPercent: 40 });
  gsap.set(fades, { autoAlpha: 0, y: 20 });

  const tl = gsap.timeline({ delay: 0.15 });
  if (no) tl.from(no, { scale: 1.12, autoAlpha: 0, duration: 2.2, ease: 'expo.out' }, 0);
  if (art) tl.from(art, { clipPath: 'inset(100% 0% 0% 0%)', rotate: 0, duration: 1.6, ease: 'expo.inOut' }, 0.1);
  tl.to(parts, { clipPath: 'inset(0% 0% -20% 0%)', yPercent: 0, duration: 1.4, stagger: 0.14, ease: 'expo.out' }, 0.35)
    .to(fades, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08, ease: 'expo.out' }, 0.9);
}

function rise(gsap, selector) {
  gsap.utils.toArray(selector).forEach((el) => {
    gsap.from(el, {
      y: 36,
      autoAlpha: 0,
      duration: 1.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
}
