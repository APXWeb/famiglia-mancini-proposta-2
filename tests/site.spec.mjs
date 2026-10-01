import { test, expect } from '@playwright/test';

const WHATSAPP = '5511944815707';
const PAGES = ['/', '/trattoria/', '/trattoria/cardapio.html', '/il-ristorante/', '/il-ristorante/cardapio.html', '/pizzaria/', '/pizzaria/cardapio.html'];

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

const tomorrowIso = (page) => page.evaluate(() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
});

test.describe('every page', () => {
  for (const path of PAGES) {
    test(`${path} loads without errors, images resolve, no sideways scroll`, async ({ page }) => {
      const errors = collectErrors(page);
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await scrollThrough(page);
      await page.waitForLoadState('networkidle');
      const broken = await page.evaluate(() => [...document.images].filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.currentSrc || img.src));
      expect(broken).toEqual([]);
      expect(errors).toEqual([]);
      await noHorizontalOverflow(page);
    });

    test(`${path} links resolve`, async ({ page, request }) => {
      await page.goto(path);
      const { anchors, internal } = await page.evaluate(() => {
        const links = [...document.querySelectorAll('a[href]')];
        return {
          anchors: links.map((a) => a.getAttribute('href')).filter((h) => h.startsWith('#') && h.length > 1 && !document.querySelector(h)),
          internal: [...new Set(links.map((a) => a.href).filter((h) => h.startsWith(location.origin)).map((h) => h.split('#')[0]))],
        };
      });
      expect(anchors).toEqual([]);
      for (const url of internal) {
        const res = await request.get(url);
        expect(res.status(), url).toBe(200);
      }
    });
  }

  test('the group strip names every house and marks the current one', async ({ page }) => {
    for (const [path, current] of [['/trattoria/', 'Trattoria'], ['/il-ristorante/', 'Il Ristorante'], ['/pizzaria/', 'Pizzaria']]) {
      await page.goto(path);
      const strip = page.getByRole('navigation', { name: 'Casas da Famiglia Mancini' });
      await expect(strip.getByRole('link')).toHaveCount(4);
      await expect(strip.locator('[aria-current="page"]')).toContainText(current);
    }
  });
});

test.describe('houses stay apart', () => {
  test('each house shows only its own data; unpublished hours stay open', async ({ page }) => {
    await page.goto('/trattoria/');
    const hrefs = await page.evaluate(() => [...document.querySelectorAll('a[href*="wa.me"]')].map((a) => a.href));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(href).toContain(`wa.me/${WHATSAPP}`);
    await expect(page.locator('.hero [data-status-text]')).toHaveText(/^(Aberto agora · até|Fechado agora · abre)/);

    for (const [path, no] of [['/il-ristorante/', '126'], ['/pizzaria/', '37']]) {
      await page.goto(path);
      // The Trattoria's e-mail, hours and status never leak into another house.
      await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
      await expect(page.locator('[data-hours]')).toHaveCount(0);
      await expect(page.locator('[data-status]:visible')).toHaveCount(0);
      await expect(page.locator('#visita .slot')).toHaveCount(1);
      await expect(page.locator('#visita .slot')).toContainText('horários');
      await expect(page.locator('#visita address')).toContainText(`Rua Avanhandava, ${no}`);
      await expect(page.locator('#visita a[href*="wa.me"]')).toHaveAttribute('href', new RegExp(WHATSAPP));
      // Its own menu, by category.
      const cats = page.locator('#cardapio .carte__index a');
      expect(await cats.count()).toBeGreaterThan(5);
      for (const href of await cats.evaluateAll((as) => as.map((a) => a.getAttribute('href')))) expect(href).toMatch(/^cardapio\.html#/);
    }
  });

  test('the street on the group page shows each house with its own data', async ({ page }) => {
    await page.goto('/');
    await page.locator('#onde').scrollIntoViewIfNeeded();
    const panel = page.locator('[data-where-panel]');
    await expect(panel).toContainText('Rua Avanhandava, 81');
    await expect(panel.locator('[data-hours] tr')).toHaveCount(4);

    await page.getByRole('tab', { name: /Il Ristorante/ }).click();
    await expect(panel).toContainText('Rua Avanhandava, 126');
    await expect(panel.locator('[data-hours]')).toHaveCount(0);
    await expect(panel.locator('a[href^="mailto:"]')).toHaveCount(0);
    await expect(panel.locator('.slot')).toContainText('horários');

    // Arrow keys move along the street.
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('tab', { name: /Trattoria/ })).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('tab', { name: /Pizzaria/ })).toHaveAttribute('aria-selected', 'true');
    await expect(panel).toContainText('Rua Avanhandava, 37');
  });

  test('hours logic, open and closed across midnight', async ({ page }) => {
    await page.goto('/');
    const results = await page.evaluate(async () => {
      const { openStatus, slotsFor, houseById, hoursTable } = await import('/assets/js/houses.js');
      const t = houseById('trattoria');
      const at = (iso) => openStatus(t, new Date(`${iso}-03:00`)).label;
      return {
        fridayNight: at('2026-10-02T23:00:00'),
        saturdayEarly: at('2026-10-03T02:00:00'),
        saturdayLate: at('2026-10-03T03:00:00'),
        sundayMorning: at('2026-10-04T10:00:00'),
        mondayAfterMidnight: at('2026-10-05T00:30:00'),
        sundaySlots: slotsFor(t, 0).length,
        lastFridaySlot: slotsFor(t, 5).at(-1),
        table: hoursTable(t).map((r) => `${r.label}: ${r.text}`),
        ristorante: openStatus(houseById('ristorante')),
      };
    });
    expect(results.fridayNight).toBe('Aberto agora · até 02h30');
    expect(results.saturdayEarly).toBe('Aberto agora · até 02h30');
    expect(results.saturdayLate).toBe('Fechado agora · abre às 11h30');
    expect(results.sundayMorning).toBe('Fechado agora · abre às 11h30');
    expect(results.mondayAfterMidnight).toBe('Fechado agora · abre às 11h30');
    expect(results.sundaySlots).toBe(25);
    expect(results.lastFridaySlot).toBe(26 * 60);
    expect(results.table).toEqual(['Domingo: 11h30 às 00h', 'Segunda a quarta: 11h30 às 01h', 'Quinta: 11h30 às 01h30', 'Sexta e sábado: 11h30 às 02h30']);
    expect(results.ristorante).toBeNull();
  });
});

test.describe('reservation', () => {
  test('central reservation: house first; desired time where hours are unpublished, its own slots where they are', async ({ page, context }) => {
    await context.route(/https:\/\/wa\.me\/.*/, (route) => route.fulfill({ contentType: 'text/plain', body: 'whatsapp' }));
    await page.goto('/#reserva');
    const app = page.locator('[data-booking]');
    const section = page.locator('#reserva');

    // Nothing chosen yet: pressing send asks for the house.
    await app.getByRole('button', { name: /Enviar pedido/ }).click();
    await expect(page.locator('#bk-house-error')).toHaveText('Escolha em qual casa quer reservar.');

    // Il Ristorante has no published hours: the guest writes the time they want.
    await app.locator('label', { hasText: 'Il Ristorante' }).click();
    await expect(section).toHaveAttribute('data-theme', 'ristorante');
    await expect(page.locator('#bk-time')).toBeHidden();
    await expect(page.locator('#bk-time-wish')).toBeVisible();
    await expect(app.locator('label[for="bk-time-wish"]')).toContainText('Horário desejado');
    await page.locator('#bk-date').fill(await tomorrowIso(page));
    await page.locator('#bk-date').dispatchEvent('change');
    await page.locator('#bk-time-wish').fill('20:30');
    await page.locator('#bk-name').fill('Teste Ristorante');
    await page.locator('#bk-phone').fill('11987654321');
    await expect(app.locator('[data-sum="time"]')).toHaveText('20:30');
    const wishPopup = context.waitForEvent('page');
    await app.getByRole('button', { name: /Enviar pedido/ }).click();
    const wish = await wishPopup;
    const wishUrl = decodeURIComponent(wish.url());
    expect(wishUrl).toContain('Nova reserva pelo site · Il Ristorante');
    expect(wishUrl).toContain('Horário desejado: 20:30');
    await wish.close();
    await expect(page.locator('.ticket').first()).toContainText('Il Ristorante · nº 126');
    await expect(page.locator('.ticket').first()).toContainText('por volta das 20:30');
    await page.locator('[data-bk-done-new]').click();

    // Switching to the Trattoria brings back its own time slots.
    await app.locator('label', { hasText: 'Trattoria' }).click();
    await expect(section).toHaveAttribute('data-theme', 'trattoria');
    await expect(app.locator('[data-sum="house"]')).toHaveText('Famiglia Mancini Trattoria');
    await expect(page.locator('#bk-time-wish')).toBeHidden();
    await page.locator('#bk-name').fill('');
    await page.locator('#bk-date').fill('');
    await page.locator('#bk-date').dispatchEvent('change');

    await app.getByRole('button', { name: /Enviar pedido/ }).click();
    await expect(page.locator('#bk-date-error')).toHaveText('Escolha o dia da reserva.');
    await expect(page.locator('#bk-name-error')).toBeVisible();
    await expect(page.locator('#bk-date')).toBeFocused();

    await page.locator('#bk-date').fill(await tomorrowIso(page));
    await page.locator('#bk-date').dispatchEvent('change');
    await expect(page.locator('#bk-time')).toBeEnabled();
    await page.locator('#bk-time').selectOption({ index: 4 });
    await app.getByRole('button', { name: 'Mais uma pessoa' }).click();
    await expect(page.locator('#bk-party')).toHaveValue('3');
    await expect(app.locator('[data-sum="party"]')).toHaveText('3 pessoas');
    await page.locator('#bk-name').fill('Teste Playwright');
    await page.locator('#bk-phone').fill('11987654321');

    const popupPromise = context.waitForEvent('page');
    await app.getByRole('button', { name: /Enviar pedido/ }).click();
    const popup = await popupPromise;
    const url = decodeURIComponent(popup.url());
    expect(url).toContain(WHATSAPP);
    expect(url).toContain('Nova reserva pelo site · Famiglia Mancini Trattoria');
    expect(url).toContain('Pessoas: 3');
    expect(url).toContain('(11) 987654321');
    await popup.close();

    const done = page.locator('[data-bk-done]');
    await expect(done).toBeVisible();
    await expect(done).toBeFocused();
    const ticket = page.locator('.ticket').first();
    await expect(ticket).toContainText('Trattoria · nº 81');
    await expect(ticket).toContainText('3 pessoas · Teste Playwright');

    const cancelPopup = context.waitForEvent('page');
    await ticket.getByRole('button', { name: 'Pedir cancelamento' }).click();
    const cancel = await cancelPopup;
    expect(decodeURIComponent(cancel.url())).toContain('Cancelamento de reserva');
    await cancel.close();
    await expect(page.locator('.ticket').first()).toHaveClass(/is-cancelled/);
    await page.locator('.ticket').first().getByRole('button', { name: 'Remover da lista' }).click();
    await expect(page.locator('.ticket')).toHaveCount(1);
  });

  test('each house page opens the reservation on its own house', async ({ page }) => {
    for (const [path, theme] of [['/trattoria/', 'trattoria'], ['/il-ristorante/', 'ristorante'], ['/pizzaria/', 'pizzaria']]) {
      await page.goto(path);
      await expect(page.locator('#reserva')).toHaveAttribute('data-theme', theme);
      await expect(page.locator(`input[name="house"][value="${theme}"]`)).toBeChecked();
    }
    await page.goto('/?casa=pizzaria#reserva');
    await expect(page.locator('#reserva')).toHaveAttribute('data-theme', 'pizzaria');
  });

  test('requests saved before the group site still belong to the Trattoria', async ({ page }) => {
    await page.goto('/');
    await page.evaluate((d) => localStorage.setItem('mancini.pedidos.v1', JSON.stringify([{ id: 1, party: 2, date: d, time: 1200, name: 'Antigo', phone: '(11) 900000000', note: '', state: 'sent' }])), await tomorrowIso(page));
    await page.reload();
    await expect(page.locator('.ticket').first()).toContainText('Trattoria · nº 81');
  });
});

test.describe('journey through the family', () => {
  test('enter, choose a house, read its menu, reserve, change house, come back', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Famiglia');

    // 1-2. Choose the Trattoria from the doors.
    await page.locator('[data-doors] a[href="trattoria/"]').click();
    await expect(page).toHaveURL(/\/trattoria\/$/);
    await expect(page.locator('html')).toHaveAttribute('data-house', 'trattoria');

    // 3-4. Its own menu.
    await page.locator('#cardapio').getByRole('link', { name: 'Abrir o cardápio' }).click();
    await expect(page).toHaveURL(/\/trattoria\/cardapio\.html$/);
    await expect(page.locator('[data-item]')).toHaveCount(150);

    // 5. Reservation, already on the Trattoria.
    await page.locator('.menu-close').getByRole('link', { name: /Reservar mesa/ }).click();
    await expect(page).toHaveURL(/\/trattoria\/#reserva$/);
    await expect(page.locator('input[name="house"][value="trattoria"]')).toBeChecked();

    // 6-7. Change house through the strip: the Pizzaria has its own data only.
    // The bar hides while scrolling down; keyboard focus brings it back.
    const toPizzaria = page.getByRole('navigation', { name: 'Casas da Famiglia Mancini' }).getByRole('link', { name: /Pizzaria/ });
    await toPizzaria.focus();
    await expect(page.locator('[data-bar]')).not.toHaveClass(/is-hidden/);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/pizzaria\/$/);
    await expect(page.locator('html')).toHaveAttribute('data-house', 'pizzaria');
    await expect(page.locator('#visita address')).toContainText('37');

    // 8. Back to the family.
    await page.getByRole('navigation', { name: 'Casas da Famiglia Mancini' }).getByRole('link', { name: /Famiglia Mancini/ }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('html')).toHaveAttribute('data-house', 'grupo');
    expect(errors).toEqual([]);
  });

  test('the curtain carries the destination and lifts on arrival', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-doors] a[href="il-ristorante/"]').click();
    await expect(page.locator('.curtain[data-theme="ristorante"]')).toBeAttached();
    await expect(page).toHaveURL(/\/il-ristorante\/$/);
    await expect(page.locator('html')).not.toHaveClass(/is-arriving/, { timeout: 5000 });
  });

  test('the old cardápio address forwards to the Trattoria menu', async ({ page }) => {
    await page.goto('/cardapio.html#risotos');
    await expect(page).toHaveURL(/\/trattoria\/cardapio\.html#risotos$/);
  });
});

test.describe('mobile drawer', () => {
  test('opens, traps focus, closes with Escape, lists the houses', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'drawer is the mobile navigation');
    await page.goto('/il-ristorante/');
    const toggle = page.locator('[data-menu-open]');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('[data-menu-close]')).toBeFocused();
    await expect(page.locator('main')).toHaveJSProperty('inert', true);
    await expect(page.locator('.drawer__houses a')).toHaveCount(4);
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();

    await toggle.click();
    await page.locator('[data-drawer]').getByRole('link', { name: /Visita/ }).click();
    await expect(page.locator('#visita')).toBeInViewport({ ratio: 0.2 });
  });
});

test.describe('cardápio da Trattoria', () => {
  test('lists the full menu and searches it', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/trattoria/cardapio.html');
    await expect(page.locator('[data-item]')).toHaveCount(150);
    await expect(page.locator('[data-cat]')).toHaveCount(12);

    const search = page.getByLabel('Buscar no cardápio');
    await search.fill('bacalhau');
    await expect(page.locator('[data-search-status]')).toHaveText('6 pratos encontrados');
    await search.fill('ragu');
    await expect(page.locator('[data-item]:visible mark').first()).toHaveText(/Ragù/);
    await search.fill('xyzzy');
    await expect(page.locator('[data-search-empty]')).toBeVisible();
    await page.locator('[data-search-reset]').click();
    await expect(page.locator('[data-item]:visible')).toHaveCount(150);
    expect(errors).toEqual([]);
  });

  test('keeps the prices of the first proposal', async ({ page }) => {
    await page.goto('/trattoria/cardapio.html');
    const row = (no) => page.locator('[data-item]', { has: page.locator('.carta__no', { hasText: new RegExp(`^${no}$`) }) }).first();
    await expect(row('001')).toContainText('R$ 27,00');
    await expect(row('054')).toContainText('R$ 236,00');
    await expect(row('136')).toContainText('R$ 486,00');
    await expect(row('318')).toContainText('R$ 38 / R$ 48');
  });

  test('home menu links resolve to categories', async ({ page }) => {
    await page.goto('/trattoria/cardapio.html');
    const ids = await page.evaluate(() => [...document.querySelectorAll('[data-cat]')].map((s) => s.id));
    await page.goto('/trattoria/');
    const targets = await page.evaluate(() => [...document.querySelectorAll('a[href^="cardapio.html#"]')].map((a) => a.getAttribute('href').split('#')[1]));
    expect(targets.length).toBe(12);
    for (const id of targets) expect(ids).toContain(id);
  });
});

test.describe('cardápios do Il Ristorante e da Pizzaria', () => {
  for (const [path, items, cats, checks] of [
    ['/il-ristorante/cardapio.html', 134, 13, [['086', 'R$ 165,00'], ['093', 'R$ 210,00'], ['999', 'R$ 27,00'], ['058', 'R$ 169,00']]],
    ['/pizzaria/cardapio.html', 167, 12, [['138', 'R$ 127 / R$ 105'], ['2312', 'R$ 138 / R$ 120'], ['2292', 'R$ 169,00'], ['1543', 'R$ 155,00']]],
  ]) {
    test(`${path} lists the official menu and searches it`, async ({ page }) => {
      const errors = collectErrors(page);
      await page.goto(path);
      await expect(page.locator('[data-item]')).toHaveCount(items);
      await expect(page.locator('[data-cat]')).toHaveCount(cats);
      for (const [no, price] of checks) {
        const row = page.locator('[data-item]', { has: page.locator('.carta__no', { hasText: new RegExp(`^${no}$`) }) }).first();
        await expect(row).toContainText(price);
      }
      const search = page.getByLabel('Buscar no cardápio');
      await search.fill('bacalhau');
      expect(await page.locator('[data-item]:visible').count()).toBeGreaterThan(1);
      await search.fill('xyzzy');
      await expect(page.locator('[data-search-empty]')).toBeVisible();
      expect(errors).toEqual([]);
      await noHorizontalOverflow(page);
    });
  }
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const path of PAGES) {
    test(`${path}: everything visible, no choreography, no curtain, headings fit`, async ({ page }) => {
      const errors = collectErrors(page);
      await page.goto(path);
      await expect(page.locator('html')).not.toHaveClass(/motion-ready|is-arriving/);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('opacity', '1');
      expect(await page.locator('.pin-spacer').count()).toBe(0);
      const overflowing = await page.evaluate(() => [...document.querySelectorAll('.display, h1')]
        .filter((el) => el.offsetParent && el.scrollWidth > el.clientWidth + 1)
        .map((el) => `"${el.textContent.trim().slice(0, 40)}" ${el.scrollWidth}/${el.clientWidth}`));
      expect(overflowing).toEqual([]);
      expect(errors).toEqual([]);
    });
  }

  test('links between houses navigate directly, without the curtain', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-doors] a[href="pizzaria/"]').click();
    await expect(page).toHaveURL(/\/pizzaria\/$/);
    await expect(page.locator('.curtain')).toHaveCount(0);
  });
});
