// Google maps load only when asked for: no third-party requests, cookies or
// weight until the visitor wants one. Each [data-map] shows the house named
// by its data-house (or the page's house).
import { houseById, currentHouse, mapEmbedUrl, fullAddress } from './houses.js';

export function initMap(scope = document) {
  scope.querySelectorAll('[data-map]').forEach((box) => {
    const button = box.querySelector('[data-map-load]');
    const house = box.dataset.house ? houseById(box.dataset.house) : currentHouse();
    if (!button || !house) return;
    button.addEventListener('click', () => {
      box.dataset.state = 'loading';
      const frame = document.createElement('iframe');
      frame.src = mapEmbedUrl(house);
      frame.title = `Mapa: ${fullAddress(house)}`;
      frame.loading = 'lazy';
      frame.referrerPolicy = 'no-referrer-when-downgrade';
      frame.addEventListener('load', () => {
        box.dataset.state = 'ready';
        button.remove();
      }, { once: true });
      box.append(frame);
    }, { once: true });
  });
}
