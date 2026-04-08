// ===== STARTING XI — HORAIRE OFFICIEL 2026 =====
// Saison Printemps-Été

// 4 types de sessions
export const PRACTICE_TYPES = [
  { id: 'starting',        label: 'Starting',         color: '#10b981', period: 'Juin à août 2026',          bookable: true },
  { id: 'starting-junior', label: 'Starting Junior',  color: '#f59e0b', period: 'Juin à août 2026',          bookable: true },
  { id: 'starting-senior', label: 'Starting Senior',  color: '#4EAAD4', period: '20 avril au fin sept. 2026', bookable: true },
  { id: 'starting-pro',    label: 'Starting Pro',     color: '#ef4444', period: '20 avril au fin sept. 2026', bookable: false },
];

// Starting = ancien Junior (juin → août)
const STARTING_DATES = [
  '2026-06-22','2026-06-24','2026-06-26','2026-06-29',
  '2026-07-01','2026-07-03','2026-07-06','2026-07-08','2026-07-10',
  '2026-07-13','2026-07-15','2026-07-17','2026-07-20','2026-07-22','2026-07-24',
  '2026-07-27','2026-07-29','2026-07-31',
  '2026-08-03','2026-08-05','2026-08-07','2026-08-10','2026-08-12','2026-08-14',
  '2026-08-17','2026-08-19','2026-08-21','2026-08-24','2026-08-26','2026-08-28',
];

// Starting Senior (20 avril → fin sept.)
const SENIOR_DATES = [
  '2026-04-20','2026-04-22','2026-04-24','2026-04-27','2026-04-29',
  '2026-05-01','2026-05-04','2026-05-06','2026-05-08','2026-05-11','2026-05-13','2026-05-15',
  '2026-05-18','2026-05-20','2026-05-22','2026-05-25','2026-05-27','2026-05-29',
  '2026-06-01','2026-06-03','2026-06-05','2026-06-08','2026-06-10','2026-06-12',
  '2026-06-15','2026-06-17','2026-06-19','2026-06-22','2026-06-24','2026-06-26','2026-06-29',
  '2026-07-01','2026-07-03','2026-07-06','2026-07-08','2026-07-10',
  '2026-07-13','2026-07-15','2026-07-17','2026-07-20','2026-07-22','2026-07-24',
  '2026-07-27','2026-07-29','2026-07-31',
  '2026-08-03','2026-08-05','2026-08-07','2026-08-10','2026-08-12','2026-08-14',
  '2026-08-17','2026-08-19','2026-08-21','2026-08-24','2026-08-26','2026-08-28','2026-08-31',
  '2026-09-02','2026-09-04','2026-09-07','2026-09-09','2026-09-11',
  '2026-09-14','2026-09-16','2026-09-18','2026-09-21','2026-09-23','2026-09-25',
  '2026-09-28','2026-09-30','2026-10-02',
];

// Starting Pro = memes dates que Senior mais non-reservable
const PRO_DATES = [...SENIOR_DATES];

const startingSet = new Set(STARTING_DATES);
const seniorSet = new Set(SENIOR_DATES);
const proSet = new Set(PRO_DATES);

// Returns array of session types active on a given date
export function getSessionsForDate(dateStr) {
  const sessions = [];
  if (startingSet.has(dateStr)) sessions.push('starting');
  if (startingSet.has(dateStr)) sessions.push('starting-junior'); // Junior = memes dates que Starting
  if (seniorSet.has(dateStr)) sessions.push('starting-senior');
  if (proSet.has(dateStr)) sessions.push('starting-pro');
  return sessions;
}

// Is there any practice?
export function hasPractice(dateStr) {
  return startingSet.has(dateStr) || seniorSet.has(dateStr) || proSet.has(dateStr);
}

// Is the date bookable? (not if only Pro sessions)
export function isBookable(dateStr) {
  return startingSet.has(dateStr) || seniorSet.has(dateStr);
}

// For calendar coloring
export function getDayType(dateStr) {
  const s = startingSet.has(dateStr);
  const sr = seniorSet.has(dateStr);
  if (s && sr) return 'both'; // Starting + Senior overlap
  if (sr) return 'starting-senior';
  if (s) return 'starting';
  return null;
}

// Is this a Pro-only date? (no Starting or Senior)
export function isProOnly(dateStr) {
  return proSet.has(dateStr) && !startingSet.has(dateStr) && !seniorSet.has(dateStr);
}

// 7 categories joueur (dans le formulaire)
export const PLAYER_CATEGORIES = [
  'Féminin PRO', 'U12', 'U15', 'U18',
  'Senior', 'Professionnel',
];

export const POSITIONS = [
  'Gardien', 'Défenseur central', 'Latéral droit', 'Latéral gauche',
  'Milieu défensif', 'Milieu central', 'Milieu offensif',
  'Ailier droit', 'Ailier gauche', 'Attaquant',
];

export const MONTHS = [
  { year: 2026, month: 3, name: 'Avril 2026' },
  { year: 2026, month: 4, name: 'Mai 2026' },
  { year: 2026, month: 5, name: 'Juin 2026' },
  { year: 2026, month: 6, name: 'Juillet 2026' },
  { year: 2026, month: 7, name: 'Août 2026' },
  { year: 2026, month: 8, name: 'Septembre 2026' },
];

export function formatDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function formatDateFull(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const days = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  const months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function isToday(dateStr) {
  const t = new Date();
  return dateStr === formatDateStr(t.getFullYear(), t.getMonth(), t.getDate());
}

export function isPast(dateStr) {
  const today = new Date();
  today.setHours(0,0,0,0);
  return new Date(dateStr + 'T00:00:00') < today;
}
