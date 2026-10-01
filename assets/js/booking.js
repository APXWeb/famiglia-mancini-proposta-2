// Reservation request. There is no booking backend: the form composes a
// message for the house's WhatsApp, and the house confirms there. Requests
// sent from this device are kept in localStorage so the guest can ask for a
// change or a cancellation later.
import { HOUSE, WEEKDAYS, clockValue, slotsFor, localParts, whatsappUrl } from './house.js';

const STORAGE_KEY = 'mancini.pedidos.v1';
const MAX_PARTY = 40;

const pad = (n) => String(n).padStart(2, '0');
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseIso = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

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

function buildMessage(kind, r) {
  const head = {
    new: `Nova reserva pelo site · ${HOUSE.name}`,
    change: `Alteração de reserva · ${HOUSE.name}`,
    cancel: `Cancelamento de reserva · ${HOUSE.name}`,
  }[kind];
  const lines = [
    head,
    `Nome: ${r.name}`,
    `Pessoas: ${r.party}`,
    `Data: ${dateLabel(r.date)}`,
    `Horário: ${timeLabel(r.date, r.time)}`,
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
      return Array.isArray(list) ? list : [];
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
function openWhatsapp(text) {
  const url = whatsappUrl(text);
  window.open(url, '_blank', 'noopener');
  return url;
}

export function initBooking() {
  const form = document.querySelector('[data-booking]');
  if (!form) return;
  const f = form.elements;
  const done = document.querySelector('[data-booking-done]');
  const doneSummary = done.querySelector('[data-done-summary]');
  const doneLink = done.querySelector('[data-done-link]');
  const dateHint = form.querySelector('[data-date-hint]');
  const ticketsList = document.querySelector('[data-tickets-list]');
  const ticketsEmpty = document.querySelector('[data-tickets-empty]');

  /* ---- Date and time ---- */

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDay = new Date(today);
  lastDay.setDate(lastDay.getDate() + HOUSE.bookingWindowDays);
  f.date.min = isoDate(today);
  f.date.max = isoDate(lastDay);

  function fillTimes() {
    const select = f.time;
    const previous = select.value;
    select.replaceChildren();
    if (!f.date.value) {
      select.append(new Option('Escolha o dia primeiro', ''));
      select.disabled = true;
      return;
    }
    const day = parseIso(f.date.value);
    let slots = slotsFor(day.getDay());
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
    dateHint.textContent = `Aberto das 11h30 até ${clockValue(slots[slots.length - 1] + 30)} neste dia.`;
    select.disabled = false;
    select.append(new Option('Escolha um horário', ''));
    slots.forEach((m) => select.append(new Option(timeLabel(f.date.value, m), String(m))));
    if (slots.map(String).includes(previous)) select.value = previous;
  }
  f.date.addEventListener('change', () => { fillTimes(); clearError(f.date); });
  f.time.addEventListener('change', () => clearError(f.time));

  /* ---- Party stepper ---- */

  const stepButtons = form.querySelectorAll('[data-step]');
  function syncStepper() {
    const n = Number(f.party.value) || 0;
    stepButtons.forEach((b) => {
      const dir = Number(b.dataset.step);
      b.disabled = (dir < 0 && n <= 1) || (dir > 0 && n >= MAX_PARTY);
    });
  }
  stepButtons.forEach((b) => b.addEventListener('click', () => {
    const n = Math.min(MAX_PARTY, Math.max(1, (Number(f.party.value) || 0) + Number(b.dataset.step)));
    f.party.value = n;
    clearError(f.party);
    syncStepper();
  }));
  f.party.addEventListener('input', syncStepper);
  syncStepper();

  f.phone.addEventListener('blur', () => { if (f.phone.value) f.phone.value = formatPhone(f.phone.value); });

  /* ---- Validation ---- */

  const errorEl = (field) => document.getElementById(`${field.id}-error`);
  function setError(field, message) {
    field.setAttribute('aria-invalid', 'true');
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
    const errors = [];
    const party = Number(f.party.value);
    if (!Number.isInteger(party) || party < 1) errors.push([f.party, 'Informe quantas pessoas vêm.']);
    else if (party > MAX_PARTY) errors.push([f.party, `Para mais de ${MAX_PARTY} pessoas, fale direto com a casa pelo WhatsApp.`]);

    if (!f.date.value) errors.push([f.date, 'Escolha o dia da reserva.']);
    else if (f.date.value < f.date.min || f.date.value > f.date.max) errors.push([f.date, `Escolha um dia entre hoje e os próximos ${HOUSE.bookingWindowDays} dias.`]);

    if (!f.time.value) errors.push([f.time, f.time.disabled && f.date.value ? 'Não há horários neste dia. Escolha outro.' : 'Escolha um horário.']);
    if (f.name.value.trim().length < 2) errors.push([f.name, 'Diga o nome para a reserva.']);

    const digits = f.phone.value.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 13) errors.push([f.phone, 'Informe um WhatsApp com DDD, por exemplo (11) 900000000.']);

    [f.party, f.date, f.time, f.name, f.phone].forEach(clearError);
    errors.forEach(([field, msg]) => setError(field, msg));
    return errors;
  }

  /* ---- Submit ---- */

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const errors = validate();
    if (errors.length) {
      errors[0][0].focus();
      return;
    }
    const request = {
      id: Date.now(),
      party: Number(f.party.value),
      date: f.date.value,
      time: Number(f.time.value),
      name: f.name.value.trim(),
      phone: formatPhone(f.phone.value),
      note: f.note.value.trim(),
      state: 'sent',
    };
    const list = store.read();
    list.unshift(request);
    store.write(list);
    renderTickets();

    const url = openWhatsapp(buildMessage('new', request));
    doneSummary.textContent = `${request.party} ${request.party === 1 ? 'pessoa' : 'pessoas'}, ${dateLabel(request.date)}, às ${timeLabel(request.date, request.time)}.`;
    doneLink.href = url;
    form.hidden = true;
    done.hidden = false;
    done.focus();
  });

  done.querySelector('[data-done-new]').addEventListener('click', () => {
    form.reset();
    fillTimes();
    syncStepper();
    done.hidden = true;
    form.hidden = false;
    f.party.focus();
  });

  /* ---- Tickets ---- */

  function renderTickets() {
    const list = store.read();
    ticketsList.replaceChildren();
    ticketsEmpty.hidden = list.length > 0;
    const todayIso = isoDate(new Date());

    list.forEach((r) => {
      const past = r.date < todayIso;
      const cancelled = r.state === 'cancel-requested';
      const li = document.createElement('li');
      li.className = `ticket${cancelled ? ' is-cancelled' : ''}`;

      const when = document.createElement('p');
      when.className = 'ticket__when';
      when.textContent = `${dateLabel(r.date)} · ${timeLabel(r.date, r.time)}`;
      const who = document.createElement('p');
      who.className = 'ticket__who';
      who.textContent = `${r.party} ${r.party === 1 ? 'pessoa' : 'pessoas'} · ${r.name}`;
      const state = document.createElement('p');
      state.className = 'ticket__state';
      state.textContent = cancelled ? 'Cancelamento pedido' : past ? 'Data passada' : 'Pedido enviado · aguarde a confirmação';
      li.append(when, who, state);

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
      if (!cancelled && !past) {
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
    if (b.dataset.action === 'change') {
      openWhatsapp(buildMessage('change', r));
      return;
    }
    if (b.dataset.action === 'cancel') {
      openWhatsapp(buildMessage('cancel', r));
      r.state = 'cancel-requested';
      store.write(list);
    } else if (b.dataset.action === 'remove') {
      store.write(list.filter((x) => x !== r));
    }
    renderTickets();
    const next = ticketsList.querySelector('button');
    if (next) next.focus();
    else document.getElementById('tickets-title')?.focus();
  });

  renderTickets();
}
