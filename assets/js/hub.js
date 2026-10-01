// Famiglia Mancini page entry.
import { initSmoothScroll, motionAllowed } from './scroll.js';
import { initStatus, initWhatsappLinks, initBar, initChapterWire, initDrawer, initAnchors } from './chrome.js';
import { initTransitions } from './transition.js';
import { createFestoon } from './festoon.js';
import { initBooking } from './booking.js';
import { initStreet } from './street.js';

const motion = motionAllowed();
if (motion) initSmoothScroll();

initTransitions();
initWhatsappLinks();
initBar();
initChapterWire();
initDrawer();
initAnchors();
initBooking();
initStreet();
initStatus();

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

// The choreography is only fetched when it will run.
if (motion) {
  import('./hub-scenes.js')
    .then(({ initScenes }) => initScenes({ festoon }))
    .catch((err) => {
      console.warn('Scenes unavailable:', err);
      document.documentElement.classList.remove('has-motion');
      festoon?.lightUp();
    });
}
