// The Google map loads only when asked for: no third-party requests, cookies
// or weight until the visitor wants it.
const EMBED = 'https://maps.google.com/maps?q=Rua%20Avanhandava%2C%2081%20-%20Bela%20Vista%2C%20S%C3%A3o%20Paulo%20-%20SP&z=17&output=embed';

export function initMap() {
  const box = document.querySelector('[data-map]');
  const button = box?.querySelector('[data-map-load]');
  if (!button) return;
  button.addEventListener('click', () => {
    box.dataset.state = 'loading';
    const frame = document.createElement('iframe');
    frame.src = EMBED;
    frame.title = 'Mapa: Rua Avanhandava, 81, Bela Vista, São Paulo';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer-when-downgrade';
    frame.addEventListener('load', () => {
      box.dataset.state = 'ready';
      button.remove();
    }, { once: true });
    box.append(frame);
  }, { once: true });
}
