// Entry for the house pages built from houses.js (Il Ristorante, Pizzaria):
// the visit block, the shared reservation and the chrome. The page's own
// choreography is fetched only when motion is allowed.
import { initSmoothScroll, motionAllowed } from './scroll.js?v=8064ba07';
import { initStatus, initWhatsappLinks, initBar, initChapterWire, initDrawer, initAnchors } from './chrome.js?v=93ce0b70';
import { initTransitions } from './transition.js?v=358d9512';
import { currentHouse } from './houses.js?v=9bed76d7';
import { visitHtml } from './visit.js?v=b65322cf';
import { initBooking } from './booking.js?v=e498dc82';
import { initMap } from './map.js?v=deee434b';

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
  import('./house-scenes.js?v=ccd8e482')
    .then(({ initScenes }) => initScenes())
    .catch((err) => {
      console.warn('Scenes unavailable:', err);
      document.documentElement.classList.remove('has-motion');
    });
}
