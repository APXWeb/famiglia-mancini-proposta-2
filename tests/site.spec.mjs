import { test, expect } from '@playwright/test';

const WHATSAPP = '5511944815707';

function collectErrors(page) {
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('response', (res) => { if (res.status() >= 400) errors.push(`${res.status()} ${res.url()}`); });
  return errors;
}

async function noHorizontalOverflow(page) {
  const { scroll, client } = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(scroll).toBeLessThanOrEqual(client + 1);
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
}

test.describe('home', () => {
  test('loads without errors and every image resolves', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('O Sul da Itália');
    await scrollThrough(page);
    await page.waitForLoadState('networkidle');
    const broken = await page.evaluate(() => [...document.images].filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.currentSrc || img.src));
    expect(broken).toEqual([]);
    expect(errors).toEqual([]);
    await noHorizontalOverflow(page);
  });

  test('in-page links all point to existing sections', async ({ page }) => {
    await page.goto('/');
    const missing = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')]
      .map((a) => a.getAttribute('href'))
      .filter((href) => href.length > 1 && !document.querySelector(href)));
    expect(missing).toEqual([]);
  });

  test('menu links resolve to categories on the cardápio page', async ({ page }) => {
    await page.goto('/cardapio.html');
    const ids = await page.evaluate(() => [...document.querySelectorAll('[data-cat]')].map((s) => s.id));
    await page.goto('/');
    const targets = await page.evaluate(() => [...document.querySelectorAll('a[href^="cardapio.html#"]')].map((a) => a.getAttribute('href').split('#')[1]));
    expect(targets.length).toBe(12);
    for (const id of targets) expect(ids).toContain(id);
  });

  test('every WhatsApp link uses the house number', async ({ page }) => {
    await page.goto('/');
    const hrefs = await page.evaluate(() => [...document.querySelectorAll('a[href*="wa.me"]')].map((a) => a.href));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(href).toContain(`wa.me/${WHATSAPP}`);
  });

  test('hours status renders from the published hours', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero [data-status-text]')).toHaveText(/^(Aberto agora · até|Fechado agora · abre)/);
    await expect(page.locator('[data-hours] tr.is-today')).toHaveCount(1);
  });
});

test.describe('hours logic', () => {
  test('open and closed states across midnight', async ({ page }) => {
    await page.goto('/');
    const results = await page.evaluate(async () => {
      const { openStatus, slotsFor } = await import('/assets/js/house.js');
      // São Paulo is UTC-3 all year.
      const at = (iso) => openStatus(new Date(`${iso}-03:00`)).label;
      return {
        fridayNight: at('2026-10-02T23:00:00'),
        saturdayEarly: at('2026-10-03T02:00:00'),
        saturdayLate: at('2026-10-03T03:00:00'),
        sundayMorning: at('2026-10-04T10:00:00'),
        mondayAfterMidnight: at('2026-10-05T00:30:00'),
        sundaySlots: slotsFor(0).length,
        lastFridaySlot: slotsFor(5).at(-1),
      };
    });
    expect(results.fridayNight).toBe('Aberto agora · até 02h30');
    expect(results.saturdayEarly).toBe('Aberto agora · até 02h30');
    expect(results.saturdayLate).toBe('Fechado agora · abre às 11h30');
    expect(results.sundayMorning).toBe('Fechado agora · abre às 11h30');
    // Sunday closes at midnight, so 00h30 on Monday is closed.
    expect(results.mondayAfterMidnight).toBe('Fechado agora · abre às 11h30');
    expect(results.sundaySlots).toBe(25);
    expect(results.lastFridaySlot).toBe(26 * 60);
  });
});

test.describe('reservation', () => {
  test('shows field errors, then sends a request to WhatsApp and lists it', async ({ page, context }) => {
    // Never reach the real WhatsApp: answer wa.me locally and keep the URL as built.
    await context.route(/https:\/\/wa\.me\/.*/, (route) => route.fulfill({ contentType: 'text/plain', body: 'whatsapp' }));
    await page.goto('/#reserva');
    const form = page.locator('[data-booking]');
    await form.getByRole('button', { name: /Enviar pedido/ }).click();
    await expect(page.locator('#date-error')).toHaveText('Escolha o dia da reserva.');
    await expect(page.locator('#name-error')).toBeVisible();
    await expect(page.locator('#phone-error')).toBeVisible();
    await expect(page.locator('#date')).toBeFocused();

    const tomorrow = await page.evaluate(() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    await page.locator('#date').fill(tomorrow);
    await page.locator('#date').dispatchEvent('change');
    await expect(page.locator('#time')).toBeEnabled();
    await page.locator('#time').selectOption({ index: 4 });
    await page.getByRole('button', { name: 'Mais uma pessoa' }).click();
    await expect(page.locator('#party')).toHaveValue('3');
    await page.locator('#name').fill('Teste Playwright');
    await page.locator('#phone').fill('11987654321');
    await page.locator('#note').fill('Mesa perto da fonte');

    const popupPromise = context.waitForEvent('page');
    await form.getByRole('button', { name: /Enviar pedido/ }).click();
    const popup = await popupPromise;
    const url = decodeURIComponent(popup.url());
    expect(url).toContain(WHATSAPP);
    expect(url).toContain('Nova reserva pelo site');
    expect(url).toContain('Pessoas: 3');
    expect(url).toContain('Teste Playwright');
    expect(url).toContain('(11) 987654321');
    await popup.close();

    const done = page.locator('[data-booking-done]');
    await expect(done).toBeVisible();
    await expect(done).toBeFocused();
    await expect(page.locator('[data-done-link]')).toHaveAttribute('href', new RegExp(WHATSAPP));

    const ticket = page.locator('.ticket').first();
    await expect(ticket).toContainText('3 pessoas · Teste Playwright');
    await expect(ticket).toContainText('Pedido enviado');

    const cancelPopup = context.waitForEvent('page');
    await ticket.getByRole('button', { name: 'Pedir cancelamento' }).click();
    const cancel = await cancelPopup;
    expect(decodeURIComponent(cancel.url())).toContain('Cancelamento de reserva');
    await cancel.close();
    await expect(page.locator('.ticket').first()).toHaveClass(/is-cancelled/);
    await expect(page.locator('.ticket').first()).toContainText('Cancelamento pedido');

    await page.locator('.ticket').first().getByRole('button', { name: 'Remover da lista' }).click();
    await expect(page.locator('.ticket')).toHaveCount(0);
    await expect(page.locator('[data-tickets-empty]')).toBeVisible();
  });
});

test.describe('mobile drawer', () => {
  test('opens, traps focus, closes with Escape', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'drawer is the mobile navigation');
    await page.goto('/');
    const toggle = page.locator('[data-menu-open]');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('[data-menu-close]')).toBeFocused();
    await expect(page.locator('main')).toHaveJSProperty('inert', true);
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();

    await toggle.click();
    await page.locator('[data-drawer]').getByRole('link', { name: /Visita/ }).click();
    await expect(page.locator('#visita')).toBeInViewport({ ratio: 0.2 });
  });
});

test.describe('cardápio', () => {
  test('lists the full menu and searches it', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/cardapio.html');
    await expect(page.locator('[data-item]')).toHaveCount(150);
    await expect(page.locator('[data-cat]')).toHaveCount(12);

    const search = page.getByLabel('Buscar no cardápio');
    await search.fill('bacalhau');
    await expect(page.locator('[data-search-status]')).toHaveText('6 pratos encontrados');
    await expect(page.locator('[data-item]:visible')).toHaveCount(6);

    await search.fill('ragu');  // accent-insensitive: "Ragù"
    await expect(page.locator('[data-item]:visible mark').first()).toHaveText(/Ragù/);

    await search.fill('xyzzy');
    await expect(page.locator('[data-search-empty]')).toBeVisible();
    await page.locator('[data-search-reset]').click();
    await expect(page.locator('[data-item]:visible')).toHaveCount(150);
    await expect(search).toBeFocused();

    expect(errors).toEqual([]);
    await noHorizontalOverflow(page);
  });

  test('category rail starts on the first category and follows the reader', async ({ page }) => {
    await page.goto('/cardapio.html');
    const rail = page.locator('[data-cat-nav]');
    await expect(rail.locator('a[aria-current="true"]')).toHaveText('Entradas e sopas');
    await page.locator('#risotos').scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 40));
    await expect(rail.locator('a[aria-current="true"]')).toHaveText('Risotos');
  });

  test('keeps the prices of the first proposal', async ({ page }) => {
    await page.goto('/cardapio.html');
    const row = (no) => page.locator('[data-item]', { has: page.locator('.carta__no', { hasText: new RegExp(`^${no}$`) }) }).first();
    await expect(row('001')).toContainText('R$ 27,00');
    await expect(row('054')).toContainText('R$ 236,00');
    await expect(row('136')).toContainText('R$ 486,00');
    await expect(row('318')).toContainText('R$ 38 / R$ 48');
  });
});

test.describe('display type fits', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const path of ['/', '/cardapio.html']) {
    test(`no display heading is wider than its box on ${path}`, async ({ page }) => {
      await page.goto(path);
      const overflowing = await page.evaluate(() => [...document.querySelectorAll('.display')]
        .filter((el) => el.offsetParent && el.scrollWidth > el.clientWidth + 1)
        .map((el) => `"${el.textContent.trim().slice(0, 40)}" ${el.scrollWidth}/${el.clientWidth}`));
      expect(overflowing).toEqual([]);
    });
  }
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('everything is visible without choreography', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/motion-ready/);
    await expect(page.locator('.hero__title')).toBeVisible();
    await expect(page.locator('.hero__lede')).toHaveCSS('opacity', '1');
    await expect(page.locator('[data-door-caption] .lede')).toBeVisible();
    const pinned = await page.locator('.pin-spacer').count();
    expect(pinned).toBe(0);
    expect(errors).toEqual([]);
  });
});
