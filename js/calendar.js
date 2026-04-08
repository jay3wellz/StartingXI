// ===== STARTING XI — CALENDRIER DES PRATIQUES =====
// Horaire officiel 2026 — Partenariat Saint-Laurent

// All practice dates from the PDF
const SENIOR_DATES = [
  // Avril
  '2026-04-20','2026-04-22','2026-04-24','2026-04-27','2026-04-29',
  // Mai
  '2026-05-01','2026-05-04','2026-05-06','2026-05-08','2026-05-11','2026-05-13','2026-05-15',
  '2026-05-18','2026-05-20','2026-05-22','2026-05-25','2026-05-27','2026-05-29',
  // Juin
  '2026-06-01','2026-06-03','2026-06-05','2026-06-08','2026-06-10','2026-06-12',
  '2026-06-15','2026-06-17','2026-06-19','2026-06-22','2026-06-24','2026-06-26','2026-06-29',
  // Juillet
  '2026-07-01','2026-07-03','2026-07-06','2026-07-08','2026-07-10',
  '2026-07-13','2026-07-15','2026-07-17','2026-07-20','2026-07-22','2026-07-24',
  '2026-07-27','2026-07-29','2026-07-31',
  // Août
  '2026-08-03','2026-08-05','2026-08-07','2026-08-10','2026-08-12','2026-08-14',
  '2026-08-17','2026-08-19','2026-08-21','2026-08-24','2026-08-26','2026-08-28','2026-08-31',
  // Septembre
  '2026-09-02','2026-09-04','2026-09-07','2026-09-09','2026-09-11',
  '2026-09-14','2026-09-16','2026-09-18','2026-09-21','2026-09-23','2026-09-25',
  '2026-09-28','2026-09-30','2026-10-02',
];

const JUNIOR_DATES = [
  // Juin
  '2026-06-22','2026-06-24','2026-06-26','2026-06-29',
  // Juillet
  '2026-07-01','2026-07-03','2026-07-06','2026-07-08','2026-07-10',
  '2026-07-13','2026-07-15','2026-07-17','2026-07-20','2026-07-22','2026-07-24',
  '2026-07-27','2026-07-29','2026-07-31',
  // Août
  '2026-08-03','2026-08-05','2026-08-07','2026-08-10','2026-08-12','2026-08-14',
  '2026-08-17','2026-08-19','2026-08-21','2026-08-24','2026-08-26','2026-08-28',
];

const seniorSet = new Set(SENIOR_DATES);
const juniorSet = new Set(JUNIOR_DATES);

const MONTHS = [
  { year: 2026, month: 3, name: 'Avril 2026' },     // April = month 3 (0-indexed)
  { year: 2026, month: 4, name: 'Mai 2026' },
  { year: 2026, month: 5, name: 'Juin 2026' },
  { year: 2026, month: 6, name: 'Juillet 2026' },
  { year: 2026, month: 7, name: 'Août 2026' },
  { year: 2026, month: 8, name: 'Septembre 2026' },
];

const DAY_NAMES = ['LUN','MAR','MER','JEU','VEN','SAM','DIM'];

let currentFilter = 'all';
let attendanceData = JSON.parse(localStorage.getItem('stxi_attendance') || '{}');

function saveAttendance() {
  localStorage.setItem('stxi_attendance', JSON.stringify(attendanceData));
}

function formatDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getDayType(dateStr) {
  const isSenior = seniorSet.has(dateStr);
  const isJunior = juniorSet.has(dateStr);
  if (isSenior && isJunior) return 'both';
  if (isSenior) return 'senior';
  if (isJunior) return 'junior';
  return null;
}

function countPractices(year, month) {
  let count = 0;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = formatDateStr(year, month, d);
    if (getDayType(ds)) count++;
  }
  return count;
}

function isToday(dateStr) {
  const today = new Date();
  const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  return dateStr === todayStr;
}

function isPast(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00');
  return d < today;
}

function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;
  grid.innerHTML = '';

  MONTHS.forEach(({ year, month, name }) => {
    const card = document.createElement('div');
    card.className = 'cal-month';

    const practiceCount = countPractices(year, month);

    // Header
    card.innerHTML = `
      <div class="cal-month__title">${name}</div>
      <div class="cal-month__count">${practiceCount} pratique${practiceCount !== 1 ? 's' : ''}</div>
      <div class="cal-days-header">
        ${DAY_NAMES.map(d => `<span>${d}</span>`).join('')}
      </div>
    `;

    // Days grid
    const daysContainer = document.createElement('div');
    daysContainer.className = 'cal-days';

    const firstDay = new Date(year, month, 1).getDay();
    // Convert Sunday=0 to Monday-based (Mon=0, Tue=1, ..., Sun=6)
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Empty cells for offset
    for (let i = 0; i < startOffset; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-day empty';
      daysContainer.appendChild(empty);
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDateStr(year, month, d);
      const dayType = getDayType(dateStr);
      const cell = document.createElement('div');
      cell.className = 'cal-day';
      cell.textContent = d;

      if (dayType) {
        // Apply type class
        let typeClass = `practice-${dayType}`;

        // Filter visibility
        if (currentFilter === 'senior' && dayType === 'junior') {
          typeClass = 'hidden';
        } else if (currentFilter === 'junior' && dayType === 'senior') {
          typeClass = 'hidden';
        }

        cell.classList.add(typeClass);

        // Today
        if (isToday(dateStr)) cell.classList.add('today');

        // Past
        if (isPast(dateStr)) cell.classList.add('past');

        // Attendance status
        if (attendanceData[dateStr]) {
          if (attendanceData[dateStr].status === 'present') {
            cell.classList.add('confirmed');
          } else if (attendanceData[dateStr].status === 'absent') {
            cell.classList.add('absent-marked');
          }
        }

        // Click handler
        if (!cell.classList.contains('hidden')) {
          cell.addEventListener('click', () => openModal(dateStr, dayType));
        }

        cell.dataset.date = dateStr;
        cell.dataset.type = dayType;
      }

      daysContainer.appendChild(cell);
    }

    card.appendChild(daysContainer);
    grid.appendChild(card);
  });
}

// ===== MODAL =====
function openModal(dateStr, dayType) {
  const modal = document.getElementById('attendance-modal');
  const form = document.getElementById('attendance-form');
  const success = document.getElementById('attendance-success');
  const absent = document.getElementById('attendance-absent');

  // Reset
  form.style.display = 'block';
  success.style.display = 'none';
  absent.style.display = 'none';

  // Date formatting
  const date = new Date(dateStr + 'T12:00:00');
  const dayNames = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  const monthNames = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  const formatted = `${dayNames[date.getDay()]} ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;

  let typeLabel = dayType === 'both' ? 'Senior + Junior' : dayType === 'senior' ? 'Senior / Semi-Pro' : 'Junior';

  document.getElementById('modal-title').textContent = 'Confirmer ta présence';
  document.getElementById('modal-date').textContent = `${formatted} — ${typeLabel}`;

  // Pre-fill if already submitted
  if (attendanceData[dateStr]) {
    document.getElementById('att-name').value = attendanceData[dateStr].name || '';
    document.getElementById('att-team').value = attendanceData[dateStr].team || '';
    document.getElementById('att-position').value = attendanceData[dateStr].position || '';
  } else {
    // Pre-fill from last submission
    const lastEntry = Object.values(attendanceData).filter(a => a.name).pop();
    if (lastEntry) {
      document.getElementById('att-name').value = lastEntry.name || '';
      document.getElementById('att-team').value = lastEntry.team || '';
      document.getElementById('att-position').value = lastEntry.position || '';
    }
  }

  modal.style.display = 'flex';
  modal.dataset.date = dateStr;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('attendance-modal');
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderCalendar();

  // Filter buttons
  document.querySelectorAll('.cal-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cal-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderCalendar();
    });
  });

  // Modal close
  const modal = document.getElementById('attendance-modal');
  modal.querySelector('.cal-modal__backdrop').addEventListener('click', closeModal);
  modal.querySelector('.cal-modal__close').addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // Form submit — Confirm presence
  document.getElementById('attendance-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const dateStr = modal.dataset.date;
    const name = document.getElementById('att-name').value.trim();
    const team = document.getElementById('att-team').value;
    const position = document.getElementById('att-position').value;

    attendanceData[dateStr] = { status: 'present', name, team, position, timestamp: new Date().toISOString() };
    saveAttendance();

    // Show success
    document.getElementById('attendance-form').style.display = 'none';
    document.getElementById('attendance-success').style.display = 'block';
    document.getElementById('success-details').textContent = `${name} — ${team} — ${position}`;

    renderCalendar();

    setTimeout(closeModal, 2000);
  });

  // Absent button
  document.getElementById('btn-absent').addEventListener('click', () => {
    const dateStr = modal.dataset.date;
    const name = document.getElementById('att-name').value.trim() || 'Non spécifié';
    const team = document.getElementById('att-team').value || '';

    attendanceData[dateStr] = { status: 'absent', name, team, position: '', timestamp: new Date().toISOString() };
    saveAttendance();

    document.getElementById('attendance-form').style.display = 'none';
    document.getElementById('attendance-absent').style.display = 'block';
    document.getElementById('absent-details').textContent = `${name}${team ? ' — ' + team : ''}`;

    renderCalendar();

    setTimeout(closeModal, 2000);
  });
});
