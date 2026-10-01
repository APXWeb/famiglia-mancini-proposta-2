// Reservation request for any house of the Grupo Mancini, the same on every
// page: the guest picks the house first, and everything after it (days,
// times, contact, message) follows that house's data in houses.js.
//
// There is no booking backend. For a house with a WhatsApp, the form
// composes a message for that house and the house confirms there. A house
// with published hours offers its own time slots; a house without them asks
// for the time the guest would like, and says the house will confirm it. A
// house with no channel at all says so plainly and sends nothing. Requests sent from this device are kept in localStorage so
// the guest can ask for a change or a cancellation later.
import { HOUSES, houseById, canBook, hasSlots, withArticle, siteUrl, routeUrl, WEEKDAYS, clockLabel, clockValue, slotsFor, localParts, whatsappUrl } from './houses.js?v=9bed76d7';

const STORAGE_KEY = 'mancini.pedidos.v1';
const MAX_PARTY = 40;
// Requests saved before the site had more than one house were all Trattoria.
const LEGACY_HOUSE = 'trattoria';

const pad = (n) => String(n).padStart(2, '0');
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseIso = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const people = (n) => `${n} ${n === 1 ? 'pessoa' : 'pessoas'}`;

function dateLabel(iso) {
  const d = parseIso(iso);
  return `${WEEKDAYS[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

function timeLabel(iso, minutes) {
  if (minutes < 24 * 60) return clockValue(minutes);
  const next = WEEKDAYS[(parseIso(iso).getDay() + 1) % 7];
  return `${clockValue(minutes)} (madrugada de ${next})`;
}

function formatPhone(raw) {
  const d = raw.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
  if (d.length < 10) return raw.trim();
  return `(${d.slice(0, 2)}) ${d.slice(2)}`;
}

function buildMessage(kind, house, r) {
  const head = {
    new: `Nova reserva pelo site · ${house.name}`,
    change: `Alteração de reserva · ${house.name}`,
    cancel: `Cancelamento de reserva · ${house.name}`,
  }[kind];
  const lines = [
    head,
    `Nome: ${r.name}`,
    `Pessoas: ${r.party}`,
    `Data: ${dateLabel(r.date)}`,
    `${r.wish ? 'Horário desejado' : 'Horário'}: ${timeLabel(r.date, r.time)}`,
    `WhatsApp: ${r.phone}`,
  ];
  if (r.note) lines.push(`Observações: ${r.note}`);
  if (kind === 'change') lines.push('', 'Olá! Gostaria de alterar esta reserva. Podem me ajudar com a nova data ou horário?');
  if (kind === 'cancel') lines.push('', 'Olá! Gostaria de cancelar esta reserva, por favor.');
  return lines.join('\n');
}

const store = {
  read() {
    try {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(list) ? list.map((r) => ({ house: LEGACY_HOUSE, ...r })) : [];
    } catch {
      return [];
    }
  },
  write(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch {
      return false;
    }
  },
};

// window.open with noopener always returns null, so success cannot be
// detected; the confirmation panel keeps a link as the manual fallback.
function openWhatsapp(house, text) {
  const url = whatsappUrl(house, text);
  window.open(url, '_blank', 'noopener');
  return url;
}

const icon = (id) => `<svg class="icon" aria-hidden="true"><use href="#${id}"/></svg>`;

function template() {
  const houses = HOUSES.map((h) => `
    <label class="bk-house" data-theme="${h.id}">
      <input type="radio" name="house" value="${h.id}" aria-describedby="bk-house-${h.id}-meta">
      <span class="bk-house__no num" aria-hidden="true">${h.number}</span>
      <span class="bk-house__name">${h.short}</span>
      <span class="bk-house__meta awning" id="bk-house-${h.id}-meta">${h.address.street}${canBook(h) ? '' : ' · reserva a publicar'}</span>
    </label>`).join('');

  return `
  <form class="bk" novalidate data-bk-form>
    <div class="bk__main">
      <fieldset class="bk__group">
        <legend class="bk__legend awning"><span class="bk__n num">1</span> A casa</legend>
        <div class="bk-houses" data-bk-houses>${houses}</div>
        <p class="field__error" id="bk-house-error" hidden></p>
      </fieldset>

      <div class="bk__closed" data-bk-closed hidden>
        <p class="bk__closed-title display" data-bk-closed-title></p>
        <p data-bk-closed-text></p>
        <div class="bk__closed-actions" data-bk-closed-actions></div>
      </div>

      <div class="bk__fields" data-bk-fields>
        <div class="field">
          <label class="awning" for="bk-date"><span class="bk__n num">2</span> Dia</label>
          <input id="bk-date" name="date" type="date" required aria-describedby="bk-date-hint bk-date-error">
          <p class="field__hint" id="bk-date-hint" data-bk-date-hint></p>
          <p class="field__error" id="bk-date-error" hidden></p>
        </div>

        <div class="field">
          <label class="awning" for="bk-time"><span class="bk__n num">3</span> Horário</label>
          <select id="bk-time" name="time" required disabled aria-describedby="bk-time-hint bk-time-error">
            <option value="">Escolha o dia primeiro</option>
          </select>
          <input id="bk-time-wish" name="wish" type="time" step="900" hidden aria-describedby="bk-time-hint bk-time-wish-error">
          <p class="field__hint" id="bk-time-hint" data-bk-time-hint></p>
          <p class="field__error" id="bk-time-wish-error" hidden></p>
          <p class="field__error" id="bk-time-error" hidden></p>
        </div>

        <div class="field field--wide">
          <label class="awning" for="bk-party"><span class="bk__n num">4</span> Pessoas</label>
          <div class="stepper">
            <button type="button" class="stepper__btn" data-step="-1" aria-label="Menos uma pessoa">${icon('i-minus')}</button>
            <input class="stepper__value display num" id="bk-party" name="party" type="number" inputmode="numeric" min="1" max="${MAX_PARTY}" value="2" required aria-describedby="bk-party-hint bk-party-error">
            <button type="button" class="stepper__btn" data-step="1" aria-label="Mais uma pessoa">${icon('i-plus')}</button>
          </div>
          <p class="field__hint" id="bk-party-hint" data-bk-party-hint></p>
          <p class="field__error" id="bk-party-error" hidden></p>
        </div>

        <fieldset class="bk__group field--wide">
          <legend class="bk__legend awning"><span class="bk__n num">5</span> Seus dados</legend>
          <div class="bk__pair">
            <div class="field">
              <label class="awning" for="bk-name">Nome</label>
              <input id="bk-name" name="name" type="text" autocomplete="name" required maxlength="80" aria-describedby="bk-name-error">
              <p class="field__error" id="bk-name-error" hidden></p>
            </div>
            <div class="field">
              <label class="awning" for="bk-phone">Seu WhatsApp</label>
              <input id="bk-phone" name="phone" type="tel" autocomplete="tel-national" inputmode="tel" required placeholder="(11) 900000000" maxlength="20" aria-describedby="bk-phone-error">
              <p class="field__error" id="bk-phone-error" hidden></p>
            </div>
          </div>
          <div class="field">
            <label class="awning" for="bk-note">Observações <span class="field__optional">(opcional)</span></label>
            <textarea id="bk-note" name="note" rows="2" maxlength="300" placeholder="Aniversário, cadeirão, restrição alimentar…"></textarea>
          </div>
        </fieldset>
      </div>
    </div>

    <aside class="bk__summary" aria-label="Resumo do pedido">
      <div class="bk-ticket">
        <p class="awning bk-ticket__head">Seu pedido</p>
        <dl class="bk-ticket__rows">
          <div><dt class="awning">Casa</dt><dd data-sum="house">Escolha a casa</dd></div>
          <div><dt class="awning">Dia</dt><dd class="num" data-sum="date">·</dd></div>
          <div><dt class="awning">Horário</dt><dd class="num" data-sum="time">·</dd></div>
          <div><dt class="awning">Pessoas</dt><dd class="num" data-sum="party">·</dd></div>
        </dl>
        <p class="bk-ticket__note" data-sum-note></p>
      </div>
      <div class="bk__submit">
        <button class="btn btn--ink" type="submit" data-bk-submit>Enviar pedido pelo WhatsApp ${icon('i-out')}</button>
        <p class="bk__fine" data-bk-fine></p>
      </div>
    </aside>
  </form>

  <div class="bk-done" role="status" aria-live="polite" tabindex="-1" hidden data-bk-done>
    <p class="awning" data-bk-done-house></p>
    <p class="bk-done__title display" data-bk-done-summary></p>
    <p>Abrimos o WhatsApp com a mensagem para a casa. Se ele não abriu, use o botão abaixo. A mesa está reservada só depois da confirmação da equipe.</p>
    <div class="bk-done__actions">
      <a class="btn btn--ink" href="#" target="_blank" rel="noopener" data-bk-done-link>Abrir o WhatsApp ${icon('i-out')}</a>
      <button class="wire-link" type="button" data-bk-done-new>Fazer outro pedido</button>
    </div>
  </div>

  <section class="tickets" aria-labelledby="tickets-title">
    <div class="tickets__head">
      <h3 class="awning" id="tickets-title" tabindex="-1">Seus pedidos neste aparelho</h3>
      <p class="tickets__note">Ficam salvos só neste navegador, para você pedir alteração ou cancelamento depois.</p>
    </div>
    <ul class="tickets__list" role="list" data-tickets-list></ul>
    <p class="tickets__empty" data-tickets-empty>Nenhum pedido enviado deste aparelho ainda.</p>
  </section>`;
}

/**
 * Renders the reservation into [data-booking]. Its data-house, or a
 * ?casa= query, chooses the house to start with. The closest
 * [data-booking-theme] ancestor takes the chosen house as data-theme, so the
 * whole chapter changes colour with the choice.
 */
export function initBooking({ onHouseChange } = {}) {
  const root = document.querySelector('[data-booking]');
  if (!root) return null;
  root.innerHTML = template();

  const themed = root.closest('[data-booking-theme]') || root;
  const form = root.querySelector('[data-bk-form]');
  const f = form.elements;
  const q = (sel) => root.querySelector(sel);
  const fields = q('[data-bk-fields]');
  const closed = q('[data-bk-closed]');
  const submit = q('[data-bk-submit]');
  const fine = q('[data-bk-fine]');
  const dateHint = q('[data-bk-date-hint]');
  const partyHint = q('[data-bk-party-hint]');
  const timeHint = q('[data-bk-time-hint]');
  const timeLabelEl = root.querySelector('label[for="bk-time"]');
  const done = q('[data-bk-done]');
  const ticketsList = q('[data-tickets-list]');
  const ticketsEmpty = q('[data-tickets-empty]');
  const sum = Object.fromEntries([...root.querySelectorAll('[data-sum]')].map((el) => [el.dataset.sum, el]));
  const sumNote = q('[data-sum-note]');
  const radios = [...root.querySelectorAll('input[name="house"]')];
  const pageHouse = document.documentElement.dataset.house || null;

  let house = null;

  const setFieldsEnabled = (on) => {
    fields.querySelectorAll('input, select, textarea, button').forEach((el) => { el.disabled = !on; });
    submit.disabled = !on;
  };

  // The time field: the house's own slots, or the time the guest would like.
  const slotsMode = () => hasSlots(house);
  function setTimeMode() {
    const slots = slotsMode();
    f.time.hidden = !slots;
    f.wish.hidden = slots;
    timeLabelEl.htmlFor = slots ? 'bk-time' : 'bk-time-wish';
    timeLabelEl.lastChild.textContent = slots ? ' Horário' : ' Horário desejado';
    timeHint.textContent = slots
      ? 'Horários dentro do funcionamento da casa naquele dia.'
      : `Os horários ${withArticle(house, 'de')} ainda não estão publicados aqui: diga o horário que prefere, e a equipe confirma pelo WhatsApp.`;
  }

  /* ---- House ---- */

  function selectHouse(id) {
    house = houseById(id);
    if (!house) return;
    const radio = radios.find((r) => r.value === id);
    if (radio) radio.checked = true;
    clearError(radios[0]);
    themed.dataset.theme = house.id;
    const bookable = canBook(house);

    fields.hidden = !bookable;
    closed.hidden = bookable;
    setFieldsEnabled(bookable);
    sum.house.textContent = house.name;

    if (bookable) {
      const days = house.booking.windowDays;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastDay = new Date(today);
      lastDay.setDate(lastDay.getDate() + days);
      f.date.min = isoDate(today);
      f.date.max = isoDate(lastDay);
      if (f.date.value && (f.date.value < f.date.min || f.date.value > f.date.max)) f.date.value = '';
      dateHint.textContent = `Até ${days} dias a partir de hoje.`;
      partyHint.textContent = house.booking.partyHint || '';
      fine.textContent = 'Ao enviar, abrimos o WhatsApp com a mensagem pronta para a casa. Nada é cobrado pelo site.';
      const tolerance = house.booking.toleranceMinutes ? `Tolerância de ${house.booking.toleranceMinutes} minutos. ` : '';
      sumNote.textContent = `${tolerance}A reserva vale depois da resposta da casa no WhatsApp.`;
      setTimeMode();
      fillTimes();
      syncStepper();
    } else {
      renderClosed();
      fine.textContent = 'Nenhum pedido é enviado para esta casa enquanto ela não publicar horários e canal de reserva.';
      sumNote.textContent = 'Reserva pelo site ainda não disponível para esta casa.';
    }
    renderSummary();
    onHouseChange?.(house);
  }

  function renderClosed() {
    q('[data-bk-closed-title]').textContent = `${house.name} ainda não recebe reservas por este site.`;
    q('[data-bk-closed-text]').textContent = `Os horários e o canal de reserva ${withArticle(house, 'de')} ainda não foram publicados aqui. Quando a casa informar, o pedido passa a funcionar nesta mesma tela.`;
    const links = [];
    if (pageHouse !== house.id) links.push(`<a class="wire-link" href="${siteUrl(house.path)}" data-go="${house.id}">Conhecer ${withArticle(house)} ${icon('i-arrow')}</a>`);
    links.push(`<a class="wire-link" href="${routeUrl(house)}" target="_blank" rel="noopener">Como chegar ao nº ${house.number} ${icon('i-out')}<span class="visually-hidden"> (abre o Google Maps em nova aba)</span></a>`);
    HOUSES.filter(canBook).forEach((h) => links.push(`<button class="wire-link" type="button" data-bk-switch="${h.id}">Reservar ${withArticle(h, 'em')}</button>`));
    q('[data-bk-closed-actions]').innerHTML = links.join('');
  }

  q('[data-bk-houses]').addEventListener('change', (e) => {
    if (e.target.name === 'house') selectHouse(e.target.value);
  });
  closed.addEventListener('click', (e) => {
    const b = e.target.closest('[data-bk-switch]');
    if (!b) return;
    selectHouse(b.dataset.bkSwitch);
    f.date.focus();
  });

  /* ---- Date and time ---- */

  function fillTimes() {
    if (!slotsMode()) {
      f.time.replaceChildren(new Option('', ''));
      if (f.date.value) dateHint.textContent = `Até ${house.booking.windowDays} dias a partir de hoje.`;
      return;
    }
    const select = f.time;
    const previous = select.value;
    select.replaceChildren();
    if (!f.date.value) {
      select.append(new Option('Escolha o dia primeiro', ''));
      select.disabled = true;
      return;
    }
    const day = parseIso(f.date.value);
    let slots = slotsFor(house, day.getDay());
    if (f.date.value === isoDate(new Date())) {
      // Today: only times still ahead, with half an hour to get there.
      const { minutes } = localParts();
      slots = slots.filter((m) => m >= minutes + 30);
    }
    if (!slots.length) {
      select.append(new Option('Sem horários restantes hoje', ''));
      select.disabled = true;
      dateHint.textContent = 'Para hoje não há mais horários. Escolha outro dia.';
      return;
    }
    dateHint.textContent = `Aberto das ${clockLabel(house.hours.open)} até ${clockLabel(slots[slots.length - 1] + 30)} neste dia.`;
    select.disabled = false;
    select.append(new Option('Escolha um horário', ''));
    slots.forEach((m) => select.append(new Option(timeLabel(f.date.value, m), String(m))));
    if (slots.map(String).includes(previous)) select.value = previous;
  }
  f.date.addEventListener('change', () => { fillTimes(); clearError(f.date); renderSummary(); });
  f.time.addEventListener('change', () => { clearError(f.time); renderSummary(); });
  f.wish.addEventListener('input', () => { clearError(f.wish); renderSummary(); });

  /* ---- Party stepper ---- */

  const stepButtons = form.querySelectorAll('[data-step]');
  function syncStepper() {
    const n = Number(f.party.value) || 0;
    stepButtons.forEach((b) => {
      const dir = Number(b.dataset.step);
      b.disabled = !canBook(house) || (dir < 0 && n <= 1) || (dir > 0 && n >= MAX_PARTY);
    });
  }
  stepButtons.forEach((b) => b.addEventListener('click', () => {
    const n = Math.min(MAX_PARTY, Math.max(1, (Number(f.party.value) || 0) + Number(b.dataset.step)));
    f.party.value = n;
    clearError(f.party);
    syncStepper();
    renderSummary();
  }));
  f.party.addEventListener('input', () => { syncStepper(); renderSummary(); });

  f.phone.addEventListener('blur', () => { if (f.phone.value) f.phone.value = formatPhone(f.phone.value); });

  /* ---- Live summary: the ticket fills in as the guest chooses ---- */

  /** Minutes from the start of the day, or null when nothing is chosen. */
  function chosenMinutes() {
    if (slotsMode()) return f.time.value ? Number(f.time.value) : null;
    if (!f.wish.value) return null;
    const [h, m] = f.wish.value.split(':').map(Number);
    return h * 60 + m;
  }

  function renderSummary() {
    const bookable = canBook(house);
    sum.date.textContent = bookable && f.date.value ? dateLabel(f.date.value) : '·';
    const minutes = chosenMinutes();
    sum.time.textContent = bookable && f.date.value && minutes !== null ? timeLabel(f.date.value, minutes) : '·';
    const n = Number(f.party.value);
    sum.party.textContent = bookable && Number.isInteger(n) && n > 0 ? people(n) : '·';
  }

  /* ---- Validation ---- */

  // Radios share one error line; other fields have their own.
  const errorEl = (field) => root.querySelector(`#${field.name === 'house' ? 'bk-house' : field.id}-error`);
  function setError(field, message) {
    if (field.name !== 'house') field.setAttribute('aria-invalid', 'true');
    const el = errorEl(field);
    el.textContent = message;
    el.hidden = false;
  }
  function clearError(field) {
    field.removeAttribute('aria-invalid');
    const el = errorEl(field);
    if (el) { el.hidden = true; el.textContent = ''; }
  }
  form.addEventListener('input', (e) => { if (e.target.hasAttribute('aria-invalid')) clearError(e.target); });

  function validate() {
    if (!house) {
      setError(radios[0], 'Escolha em qual casa quer reservar.');
      return [[radios[0]]];
    }
    const errors = [];
    if (!f.date.value) errors.push([f.date, 'Escolha o dia da reserva.']);
    else if (f.date.value < f.date.min || f.date.value > f.date.max) errors.push([f.date, `Escolha um dia entre hoje e os próximos ${house.booking.windowDays} dias.`]);

    if (slotsMode()) {
      if (!f.time.value) errors.push([f.time, f.time.disabled && f.date.value ? 'Não há horários neste dia. Escolha outro.' : 'Escolha um horário.']);
    } else if (!f.wish.value) {
      errors.push([f.wish, 'Diga o horário que prefere.']);
    } else if (f.date.value === isoDate(new Date()) && chosenMinutes() < localParts().minutes + 30) {
      errors.push([f.wish, 'Para hoje, escolha um horário pelo menos meia hora à frente.']);
    }

    const party = Number(f.party.value);
    if (!Number.isInteger(party) || party < 1) errors.push([f.party, 'Informe quantas pessoas vêm.']);
    else if (party > MAX_PARTY) errors.push([f.party, `Para mais de ${MAX_PARTY} pessoas, fale direto com a casa pelo WhatsApp.`]);

    if (f.name.value.trim().length < 2) errors.push([f.name, 'Diga o nome para a reserva.']);

    const digits = f.phone.value.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 13) errors.push([f.phone, 'Informe um WhatsApp com DDD, por exemplo (11) 900000000.']);

    [f.date, f.time, f.wish, f.party, f.name, f.phone].forEach(clearError);
    errors.forEach(([field, msg]) => setError(field, msg));
    return errors;
  }

  /* ---- Submit ---- */

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (house && !canBook(house)) return;
    const errors = validate();
    if (errors.length) {
      errors[0][0].focus();
      return;
    }
    const request = {
      id: Date.now(),
      house: house.id,
      party: Number(f.party.value),
      date: f.date.value,
      time: chosenMinutes(),
      wish: !slotsMode(),
      name: f.name.value.trim(),
      phone: formatPhone(f.phone.value),
      note: f.note.value.trim(),
      state: 'sent',
    };
    const list = store.read();
    list.unshift(request);
    store.write(list);
    renderTickets();

    const url = openWhatsapp(house, buildMessage('new', house, request));
    q('[data-bk-done-house]').textContent = `Pedido pronto · ${house.name}`;
    q('[data-bk-done-summary]').textContent = `${people(request.party)}, ${dateLabel(request.date)}, ${request.wish ? 'por volta das' : 'às'} ${timeLabel(request.date, request.time)}.`;
    q('[data-bk-done-link]').href = url;
    form.hidden = true;
    done.hidden = false;
    done.focus();
  });

  q('[data-bk-done-new]').addEventListener('click', () => {
    const keep = house.id;
    form.reset();
    done.hidden = true;
    form.hidden = false;
    selectHouse(keep);
    f.date.focus();
  });

  /* ---- Tickets ---- */

  function renderTickets() {
    const list = store.read();
    ticketsList.replaceChildren();
    ticketsEmpty.hidden = list.length > 0;
    const todayIso = isoDate(new Date());

    list.forEach((r) => {
      const h = houseById(r.house);
      const past = r.date < todayIso;
      const cancelled = r.state === 'cancel-requested';
      const li = document.createElement('li');
      li.className = `ticket${cancelled ? ' is-cancelled' : ''}`;

      const where = document.createElement('p');
      where.className = 'ticket__house awning';
      where.textContent = h ? `${h.short} · nº ${h.number}` : 'Casa não encontrada';
      const when = document.createElement('p');
      when.className = 'ticket__when';
      when.textContent = `${dateLabel(r.date)} · ${r.wish ? 'por volta das ' : ''}${timeLabel(r.date, r.time)}`;
      const who = document.createElement('p');
      who.className = 'ticket__who';
      who.textContent = `${people(r.party)} · ${r.name}`;
      const state = document.createElement('p');
      state.className = 'ticket__state';
      state.textContent = cancelled ? 'Cancelamento pedido' : past ? 'Data passada' : 'Pedido enviado · aguarde a confirmação';
      li.append(where, when, who, state);

      if (cancelled) {
        const stamp = document.createElement('span');
        stamp.className = 'ticket__stamp';
        stamp.textContent = 'Cancelada';
        stamp.setAttribute('aria-hidden', 'true');
        li.append(stamp);
      }

      const actions = document.createElement('div');
      actions.className = 'ticket__actions';
      const button = (label, action) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = label;
        b.dataset.action = action;
        b.dataset.id = String(r.id);
        actions.append(b);
      };
      if (!cancelled && !past && canBook(h)) {
        button('Pedir alteração', 'change');
        button('Pedir cancelamento', 'cancel');
      } else {
        button('Remover da lista', 'remove');
      }
      li.append(actions);
      ticketsList.append(li);
    });
  }

  ticketsList.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-action]');
    if (!b) return;
    const list = store.read();
    const r = list.find((x) => String(x.id) === b.dataset.id);
    if (!r) return;
    const h = houseById(r.house);
    if (b.dataset.action === 'change') {
      openWhatsapp(h, buildMessage('change', h, r));
      return;
    }
    if (b.dataset.action === 'cancel') {
      openWhatsapp(h, buildMessage('cancel', h, r));
      r.state = 'cancel-requested';
      store.write(list);
    } else if (b.dataset.action === 'remove') {
      store.write(list.filter((x) => x !== r));
    }
    renderTickets();
    const next = ticketsList.querySelector('button');
    if (next) next.focus();
    else root.querySelector('#tickets-title')?.focus();
  });

  /* ---- Start ---- */

  // A link like ?casa=ristorante#reserva arrives with that house chosen.
  const asked = new URLSearchParams(location.search).get('casa');
  const initial = houseById(asked) ? asked : root.dataset.house;
  if (initial) {
    selectHouse(initial);
  } else {
    setFieldsEnabled(false);
    submit.disabled = false; // pressing it explains that a house comes first
    fine.textContent = 'Escolha a casa para ver os dias e horários dela.';
    sumNote.textContent = 'Cada casa tem seus próprios horários e seu próprio canal de confirmação.';
  }
  renderTickets();

  return { select: selectHouse };
}
