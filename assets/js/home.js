// Home page entry.
import { initSmoothScroll, motionAllowed } from './scroll.js';
import { initStatus, initWhatsappLinks, initBar, initChapterWire, initDrawer, initAnchors } from './chrome.js';
import { createFestoon } from './festoon.js';
import { initBooking } from './booking.js';
import { initScenes } from './scenes.js';
import { initMap } from './map.js';

const motion = motionAllowed();
if (motion) initSmoothScroll();

initStatus();
initWhatsappLinks();
initBar();
initChapterWire();
initDrawer();
initAnchors();
initBooking();
initMap();

let festoon = null;
const canvas = document.querySelector('[data-festoon]');
if (canvas) {
  try {
    festoon = createFestoon(canvas, { still: !motion });
    if (!motion) festoon.lightUp();
  } catch (err) {
    console.warn('Festoon unavailable:', err);
  }
}

if (motion) {
  initScenes({ festoon });
}
