// Famiglia Mancini page entry.
import { initSmoothScroll, motionAllowed } from './scroll.js?v=8064ba07';
import { initStatus, initWhatsappLinks, initBar, initChapterWire, initDrawer, initAnchors } from './chrome.js?v=93ce0b70';
import { initTransitions } from './transition.js?v=358d9512';
import { createFestoon } from './festoon.js?v=ba2115cf';
import { initBooking } from './booking.js?v=e498dc82';
import { initStreet } from './street.js?v=5cc067d1';

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
  import('./hub-scenes.js?v=fc31254e')
    .then(({ initScenes }) => initScenes({ festoon }))
    .catch((err) => {
      console.warn('Scenes unavailable:', err);
      document.documentElement.classList.remove('has-motion');
      festoon?.lightUp();
    });
}
