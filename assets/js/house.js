// Facts about the house, in one place. Only data present in the material
// supplied with the project lives here. The WhatsApp number is temporary
// until the proposal is accepted: change it here and every link follows.

export const HOUSE = {
  name: 'Famiglia Mancini Trattoria',
  whatsapp: '5511944815707',
  whatsappLabel: '(11) 944815707',
  timeZone: 'America/Sao_Paulo',
  toleranceMinutes: 15,
  bookingWindowDays: 90,
};

const OPEN = 11 * 60 + 30;

// Closing time per weekday (0 = Sunday), in minutes from the start of that
// service day. Values past 24h close after midnight.
const CLOSE_BY_WEEKDAY = [
  24 * 60,          // dom: 00h
  25 * 60,          // seg: 01h
  25 * 60,          // ter: 01h
  25 * 60,          // qua: 01h
  25 * 60 + 30,     // qui: 01h30
  26 * 60 + 30,     // sex: 02h30
  26 * 60 + 30,     // sáb: 02h30
];

export const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
export const WEEKDAYS_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export function hoursFor(weekday) {
  return { open: OPEN, close: CLOSE_BY_WEEKDAY[weekday] };
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
    timeZone: HOUSE.timeZone,
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
 * Whether the house is open, from the published hours.
 * Returns { open: boolean, label: string }.
 */
export function openStatus(date = new Date()) {
  const { weekday, minutes } = localParts(date);
  const today = hoursFor(weekday);
  const yesterday = hoursFor((weekday + 6) % 7);

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
  return { open: false, label: `Fechado agora · abre amanhã às ${clockLabel(OPEN)}` };
}

/** Half-hour slots for a service day, as the first proposal offered them. */
export function slotsFor(weekday) {
  const { open, close } = hoursFor(weekday);
  const slots = [];
  for (let m = open; m <= close - 30; m += 30) slots.push(m);
  return slots;
}

export function whatsappUrl(text) {
  const base = `https://wa.me/${HOUSE.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
