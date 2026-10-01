// The houses of the Grupo Mancini, in one place. Every page, the house
// switcher, the reservation and the visit blocks read from here.
//
// Only facts present in the material supplied with the project live here.
// A field the house has not provided yet is null, and the interface shows it
// as open instead of filling it in. Adding a house is adding an entry.
//
// The WhatsApp below is temporary until the proposal is accepted, and for
// now the three houses share it (the client asked for the same reservation
// on all of them). Change it per house when each one has its own.

const TEMP_WHATSAPP = { whatsapp: '5511944815707', whatsappLabel: '(11) 944815707' };

/** Site root, wherever the page sits (/, /trattoria/, …). */
export const ROOT = new URL('../../', import.meta.url);
export const siteUrl = (path = '') => new URL(path, ROOT).href;

export const TIME_ZONE = 'America/Sao_Paulo';

export const HOUSES = [
  {
    id: 'pizzaria',
    name: 'Pizzaria Famiglia Mancini',
    short: 'Pizzaria',
    article: 'a',
    number: '37',
    since: 'desde 2004',
    sinceLong: 'Fundada em 2004',
    path: 'pizzaria/',
    address: { street: 'Rua Avanhandava, 37', district: 'Bela Vista', city: 'São Paulo', region: 'SP' },
    // Not published by the house: the reservation asks for the desired time.
    hours: null,
    contact: { ...TEMP_WHATSAPP, email: null, instagram: null, tiktok: null },
    menu: {
      page: 'pizzaria/cardapio.html',
      pdf: 'https://cdn.me-qr.com/pdf/12607404.pdf?time=1712578858',
    },
    booking: { channel: 'whatsapp', windowDays: 90 },
  },
  {
    id: 'trattoria',
    name: 'Famiglia Mancini Trattoria',
    short: 'Trattoria',
    article: 'a',
    number: '81',
    since: 'desde 1980',
    sinceLong: 'Fundada em maio de 1980',
    path: 'trattoria/',
    address: { street: 'Rua Avanhandava, 81', district: 'Bela Vista', city: 'São Paulo', region: 'SP' },
    hours: {
      open: 11 * 60 + 30,
      // Closing time per weekday (0 = Sunday), in minutes from the start of
      // that service day. Values past 24h close after midnight.
      closeByWeekday: [24 * 60, 25 * 60, 25 * 60, 25 * 60, 25 * 60 + 30, 26 * 60 + 30, 26 * 60 + 30],
    },
    contact: {
      ...TEMP_WHATSAPP,
      email: 'reservas@famigliamancini.com.br',
      instagram: 'famigliamancini_oficial',
      tiktok: 'famigliamancini',
    },
    menu: {
      page: 'trattoria/cardapio.html',
      pdf: 'https://cdn.me-qr.com/pdf/12607344.pdf?time=1712690862',
    },
    booking: { channel: 'whatsapp', toleranceMinutes: 15, windowDays: 90, partyHint: 'Os pratos servem duas ou mais pessoas.' },
  },
  {
    id: 'ristorante',
    name: 'Il Ristorante',
    short: 'Il Ristorante',
    article: 'o',
    number: '126',
    since: 'desde 2001',
    sinceLong: 'Inaugurado em 2001',
    path: 'il-ristorante/',
    address: { street: 'Rua Avanhandava, 126', district: 'Bela Vista', city: 'São Paulo', region: 'SP' },
    // Not published by the house: the reservation asks for the desired time.
    hours: null,
    contact: { ...TEMP_WHATSAPP, email: null, instagram: null, tiktok: null },
    menu: {
      page: 'il-ristorante/cardapio.html',
      pdf: 'https://cdn.me-qr.com/pdf/12607216.pdf?time=1712578944',
    },
    booking: { channel: 'whatsapp', windowDays: 90, partyHint: 'Todos os pratos são servidos de forma individual.' },
  },
];

/** Also of the Grupo Mancini on the same street, but not a restaurant. */
export const NEIGHBOURS = [{ name: 'Calligraphia', number: '40' }];

/** "a Pizzaria", "do Il Ristorante": Portuguese needs the article. */
export const withArticle = (house, prep = '') => `${{ '': '', de: 'd', em: 'n' }[prep]}${house.article} ${house.short}`.trim();

export const houseById = (id) => HOUSES.find((h) => h.id === id) || null;

/** The house whose page this is, from <html data-house>. */
export const currentHouse = () => houseById(document.documentElement.dataset.house);

export const canBook = (house) => Boolean(house?.booking && house.contact.whatsapp);

/** With published hours the reservation offers the house's own time slots;
 *  without them the guest writes the time they would like. */
export const hasSlots = (house) => Boolean(house?.hours);

export const fullAddress = (house) => `${house.address.street}, ${house.address.district}, ${house.address.city}, ${house.address.region}`;

export const routeUrl = (house) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${house.address.street}, ${house.address.district}, ${house.address.city} - ${house.address.region}`)}`;

export const mapEmbedUrl = (house) => `https://maps.google.com/maps?q=${encodeURIComponent(`${house.address.street} - ${house.address.district}, ${house.address.city} - ${house.address.region}`)}&z=17&output=embed`;

export function whatsappUrl(house, text) {
  const base = `https://wa.me/${house.contact.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/* ---------- Hours ---------- */

export const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const WEEKDAY_TITLES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function hoursFor(house, weekday) {
  return { open: house.hours.open, close: house.hours.closeByWeekday[weekday] };
}

/** "11h30", "00h", "02h30" */
export function clockLabel(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}h${m ? String(m).padStart(2, '0') : ''}`;
}

/** "19:30" for messages and form values */
export function clockValue(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  return `${String(h).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

/** Weekday and minutes-of-day for a Date, read in São Paulo time. */
export function localParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { weekday, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

/**
 * Whether the house is open, from its published hours.
 * Returns { open: boolean, label: string }, or null when the house has not
 * published hours.
 */
export function openStatus(house, date = new Date()) {
  if (!house?.hours) return null;
  const { weekday, minutes } = localParts(date);
  const today = hoursFor(house, weekday);
  const yesterday = hoursFor(house, (weekday + 6) % 7);

  // Still inside last night's service (after midnight).
  if (minutes + 24 * 60 < yesterday.close) {
    return { open: true, label: `Aberto agora · até ${clockLabel(yesterday.close)}` };
  }
  if (minutes >= today.open && minutes < today.close) {
    return { open: true, label: `Aberto agora · até ${clockLabel(today.close)}` };
  }
  if (minutes < today.open) {
    return { open: false, label: `Fechado agora · abre às ${clockLabel(today.open)}` };
  }
  return { open: false, label: `Fechado agora · abre amanhã às ${clockLabel(hoursFor(house, (weekday + 1) % 7).open)}` };
}

/** The service day a moment belongs to: after midnight the night is yesterday's. */
export function serviceDay(house, date = new Date()) {
  const { weekday, minutes } = localParts(date);
  const yesterday = (weekday + 6) % 7;
  return minutes + 24 * 60 < hoursFor(house, yesterday).close ? yesterday : weekday;
}

/** Half-hour slots for a service day. */
export function slotsFor(house, weekday) {
  const { open, close } = hoursFor(house, weekday);
  const slots = [];
  for (let m = open; m <= close - 30; m += 30) slots.push(m);
  return slots;
}

/**
 * Rows for an hours table, consecutive days with the same hours grouped:
 * [{ days: [1, 2, 3], label: 'Segunda a quarta', text: '11h30 às 01h' }, …]
 * Sunday first, as the house lists them.
 */
export function hoursTable(house) {
  const rows = [];
  for (let d = 0; d < 7; d++) {
    const { open, close } = hoursFor(house, d);
    const text = `${clockLabel(open)} às ${clockLabel(close)}`;
    const last = rows[rows.length - 1];
    if (last && last.text === text) last.days.push(d);
    else rows.push({ days: [d], text });
  }
  for (const row of rows) {
    const first = WEEKDAY_TITLES[row.days[0]];
    const end = WEEKDAYS[row.days[row.days.length - 1]];
    row.label = row.days.length === 1 ? first : row.days.length === 2 ? `${first} e ${end}` : `${first} a ${end.replace('-feira', '')}`;
  }
  return rows;
}
