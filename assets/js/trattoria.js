// Trattoria page entry.
import { initSmoothScroll, motionAllowed } from './scroll.js?v=8064ba07';
import { initStatus, initWhatsappLinks, initBar, initChapterWire, initDrawer, initAnchors } from './chrome.js?v=93ce0b70';
import { initTransitions } from './transition.js?v=358d9512';
import { createFestoon } from './festoon.js?v=ba2115cf';
import { initBooking } from './booking.js?v=e498dc82';
import { initScenes } from './trattoria-scenes.js?v=c81bdb1c';
import { initMap } from './map.js?v=deee434b';

const motion = motionAllowed();
if (motion) initSmoothScroll();

initTransitions();
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
