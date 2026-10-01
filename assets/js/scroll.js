// Smooth scrolling (Lenis) wired into GSAP's ticker and ScrollTrigger.
// Skipped entirely for reduced motion and when the libraries did not load.

const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let lenis = null;

export function motionAllowed() {
  return !reduceQuery.matches && typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
}

export function initSmoothScroll() {
  if (!motionAllowed() || typeof window.Lenis === 'undefined') return null;
  const { gsap, ScrollTrigger } = window;
  lenis = new window.Lenis({ lerp: 0.11, wheelMultiplier: 0.95, anchors: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function smooth() {
  return lenis;
}

/** Scroll to an element or to the top, respecting reduced motion. */
export function scrollToTarget(target, { focus = true } = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  const done = () => {
    if (!focus) return;
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  };
  if (lenis) {
    lenis.scrollTo(el, { offset: 0, duration: 1.4, onComplete: done });
  } else {
    el.scrollIntoView({ behavior: reduceQuery.matches ? 'auto' : 'smooth', block: 'start' });
    done();
  }
}
