// Entry for the house pages built from houses.js (Il Ristorante, Pizzaria):
// the visit block, the shared reservation and the chrome. The page's own
// choreography is fetched only when motion is allowed.
import { initSmoothScroll, motionAllowed } from './scroll.js';
import { initStatus, initWhatsappLinks, initBar, initChapterWire, initDrawer, initAnchors } from './chrome.js';
import { initTransitions } from './transition.js';
import { currentHouse } from './houses.js';
import { visitHtml } from './visit.js';
import { initBooking } from './booking.js';
import { initMap } from './map.js';

const motion = motionAllowed();
if (motion) initSmoothScroll();

const house = currentHouse();
const visit = document.querySelector('[data-visit]');
if (house && visit) visit.innerHTML = visitHtml(house);

initTransitions();
initWhatsappLinks();
initBar();
initChapterWire();
initDrawer();
initAnchors();
initBooking();
initMap();
initStatus();

if (motion) {
  import('./house-scenes.js')
    .then(({ initScenes }) => initScenes())
    .catch((err) => {
      console.warn('Scenes unavailable:', err);
      document.documentElement.classList.remove('has-motion');
    });
}
