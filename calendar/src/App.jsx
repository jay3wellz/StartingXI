import { useState, useEffect, useCallback, useRef } from 'react';
import { MONTHS, PRACTICE_TYPES, PLAYER_CATEGORIES, POSITIONS, getDayType, getSessionsForDate, isBookable, formatDateStr, formatDateFull, isToday, isPast } from './data';
import { saveAttendance, getAttendanceByDate, getAllAttendance } from './firebase';

const DAY_NAMES = ['LUN','MAR','MER','JEU','VEN','SAM','DIM'];
const COLORS = { 'starting': '#10b981', 'starting-junior': '#f59e0b', 'starting-senior': '#4EAAD4', 'starting-pro': '#ef4444', 'both': '#8b5cf6' };

// Site-consistent color tokens
const SITE = {
  bg: '#111',
  card: '#1a1a1a',
  cardBorder: 'rgba(255,255,255,0.08)',
  inputBg: '#222',
  inputBorder: 'rgba(255,255,255,0.12)',
  textMuted: 'rgba(255,255,255,0.4)',
  textSubtle: 'rgba(255,255,255,0.25)',
  accent: '#4EAAD4',
};

// ===== NAVBAR =====
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleMobile = () => {
    setMobileOpen(prev => !prev);
    document.body.style.overflow = !mobileOpen ? 'hidden' : '';
  };

  const closeMobile = () => {
    setMobileOpen(false);
    document.body.style.overflow = '';
  };

  const basePath = window.location.hostname === 'localhost' ? '' : '';

  return (
    <>
      <nav className="cal-navbar" style={scrolled ? { background: 'rgba(0,0,0,0.98)' } : {}}>
        <div className="cal-navbar__inner">
          <div className="cal-navbar__links">
            <a href="../index.html" className="cal-navbar__link">Accueil</a>
            <a href="../pages/a-propos.html" className="cal-navbar__link">À propos</a>
            <a href="../pages/equipes.html" className="cal-navbar__link">Équipes</a>
            <a href="../pages/medias.html" className="cal-navbar__link">Médias</a>
          </div>

          <a href="../index.html" className="cal-navbar__logo">
            <svg width="52" height="52" viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="58" stroke="white" strokeWidth="2.5" fill="#000"/>
              <text x="28" y="72" fontFamily="Montserrat,sans-serif" fontWeight="800" fontSize="42" fill="white">S</text>
              <text x="55" y="72" fontFamily="Montserrat,sans-serif" fontWeight="800" fontSize="42" fill="white">T</text>
              <text x="82" y="78" fontFamily="Inter,sans-serif" fontWeight="300" fontSize="20" fill="white" letterSpacing="2">XI</text>
            </svg>
          </a>

          <div className="cal-navbar__links">
            <a href="../pages/calendrier.html" className="cal-navbar__link cal-navbar__link--active">Calendrier</a>
            <a href="../pages/partenaires.html" className="cal-navbar__link">Partenaires</a>
            <a href="../pages/contact.html" className="cal-navbar__link">Contact</a>
          </div>

          <button className={`cal-navbar__burger ${mobileOpen ? 'active' : ''}`} onClick={toggleMobile} aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      <div className={`cal-mobile-menu ${mobileOpen ? 'active' : ''}`}>
        <a href="../index.html" onClick={closeMobile}>Accueil</a>
        <a href="../pages/a-propos.html" onClick={closeMobile}>À propos</a>
        <a href="../pages/equipes.html" onClick={closeMobile}>Équipes</a>
        <a href="../pages/medias.html" onClick={closeMobile}>Médias</a>
        <a href="../pages/calendrier.html" onClick={closeMobile} style={{ color: '#4EAAD4' }}>Calendrier</a>
        <a href="../pages/partenaires.html" onClick={closeMobile}>Partenaires</a>
        <a href="../pages/contact.html" onClick={closeMobile}>Contact</a>
      </div>
    </>
  );
}

// ===== MONTH CARD =====
function MonthCard({ year, month, name, filter, attendanceMap, onDayClick, onBulkConfirm, selectMode, selectedDates }) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const practiceDates = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = formatDateStr(year, month, d);
    const type = getDayType(ds);
    if (!type) continue;
    const visible = filter === 'all' || filter === type || type === 'both';
    if (visible && !isPast(ds)) practiceDates.push(ds);
  }

  let totalPractices = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = formatDateStr(year, month, d);
    const type = getDayType(ds);
    if (filter === 'all' && type) totalPractices++;
    else if (filter === type || (filter !== 'all' && type === 'both')) totalPractices++;
  }

  return (
    <div style={{ background: SITE.card, border: `1px solid ${SITE.cardBorder}`, borderRadius: 12, padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue','Montserrat',sans-serif", fontWeight: 400, fontSize: 26, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{name}</div>
          <div style={{ fontSize: 12, color: SITE.textSubtle }}>{totalPractices} pratique{totalPractices !== 1 ? 's' : ''}</div>
        </div>
        {practiceDates.length > 0 && (
          <button
            onClick={() => onBulkConfirm(practiceDates, name)}
            style={{
              padding: '6px 14px', background: 'rgba(78,170,212,0.08)', border: '1px solid rgba(78,170,212,0.2)',
              borderRadius: 6, color: '#4EAAD4', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(78,170,212,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(78,170,212,0.08)'; }}
          >
            Confirmer tout
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 6 }}>
        {DAY_NAMES.map(d => (
          <span key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: SITE.textSubtle, padding: '6px 0' }}>{d}</span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
        {Array.from({ length: startOffset }, (_, i) => <div key={`e${i}`} style={{ aspectRatio: '1' }} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1;
          const dateStr = formatDateStr(year, month, d);
          const att = attendanceMap[dateStr] || [];
          return (
            <DayCell key={d} day={d} dateStr={dateStr} filter={filter}
              presentCount={att.filter(a => a.status === 'present').length}
              onClick={onDayClick} selectMode={selectMode} selected={selectedDates.has(dateStr)} />
          );
        })}
      </div>
    </div>
  );
}

// ===== DAY CELL =====
function DayCell({ day, dateStr, filter, presentCount, onClick, selectMode, selected }) {
  const dayType = getDayType(dateStr);
  const sessions = getSessionsForDate(dateStr);
  const bookable = isBookable(dateStr);

  if (!dayType && sessions.length === 0) {
    return <div style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>{day}</div>;
  }

  const visible = filter === 'all'
    || (filter === 'starting' && sessions.includes('starting'))
    || (filter === 'starting-senior' && sessions.includes('starting-senior'))
    || (filter === 'starting-pro' && sessions.includes('starting-pro'));
  if (!visible) {
    return <div style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>{day}</div>;
  }

  let color;
  if (filter !== 'all') {
    color = COLORS[filter];
  } else if (dayType === 'both') {
    color = null;
  } else if (dayType) {
    color = COLORS[dayType];
  } else {
    color = COLORS['starting-senior'];
  }

  const past = isPast(dateStr);
  const today = isToday(dateStr);
  const isBoth = dayType === 'both' && filter === 'all';
  const isProFilter = filter === 'starting-pro';

  const bg = selected ? '#10b981'
    : isBoth ? `linear-gradient(135deg, ${COLORS['starting-senior']} 50%, ${COLORS['starting']} 50%)`
    : color;

  const shadow = selected
    ? '0 0 0 3px #10b981, inset 0 0 0 2px #10b981'
    : today ? '0 0 0 3px #fff' : 'none';

  const handleClick = () => {
    if (isProFilter || (!bookable && filter === 'all')) return;
    onClick(dateStr);
  };

  const blocked = isProFilter;
  const cursorStyle = blocked ? 'not-allowed' : selectMode ? 'crosshair' : 'pointer';

  return (
    <div
      onClick={handleClick}
      style={{
        aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 700, color: '#fff', background: bg, borderRadius: 8,
        cursor: cursorStyle, position: 'relative', opacity: past ? 0.35 : blocked ? 0.5 : 1,
        boxShadow: shadow, transition: 'all 0.15s', overflow: 'hidden',
      }}
      onMouseEnter={e => { if (!past && !blocked) { e.currentTarget.style.transform = 'scale(1.08)'; }}}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {blocked && <span style={{ position: 'absolute', top: 1, fontSize: 10, lineHeight: 1 }}>&#x1f512;</span>}
      {selected && <span style={{ position: 'absolute', top: 1, right: 3, fontSize: 9, lineHeight: 1 }}>&#x2713;</span>}
      <span style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>{day}</span>
      {presentCount > 0 && !selected && !blocked && (
        <span style={{ position: 'absolute', bottom: 2, fontSize: 8, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.4)', borderRadius: 4, padding: '0 3px', lineHeight: '14px' }}>{presentCount}</span>
      )}
    </div>
  );
}

// ===== MODAL =====
function AttendanceModal({ dateStr, attendees, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const sessions = getSessionsForDate(dateStr);
  const bookableSessions = sessions.filter(s => PRACTICE_TYPES.find(p => p.id === s)?.bookable);
  const typeColor = bookableSessions.includes('starting-senior') ? COLORS['starting-senior'] : COLORS['starting'];

  useEffect(() => {
    const saved = localStorage.getItem('stxi_player');
    if (saved) {
      const p = JSON.parse(saved);
      setName(p.name || '');
      setCategory(p.category || '');
      setPosition(p.position || '');
    }
  }, []);

  const handleSubmit = async (e, isAbsent = false) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const data = { date: dateStr, name: name.trim(), team: category, position, status: isAbsent ? 'absent' : 'present' };
    localStorage.setItem('stxi_player', JSON.stringify({ name: data.name, category, position }));
    await saveAttendance(data);
    setStatus(isAbsent ? 'absent' : 'success');
    setLoading(false);
    onSubmit();
    setTimeout(onClose, 2000);
  };

  const present = attendees.filter(a => a.status === 'present');
  const absent = attendees.filter(a => a.status === 'absent');

  const inputStyle = {
    width: '100%', padding: '12px 14px', background: SITE.inputBg, border: `1px solid ${SITE.inputBorder}`,
    borderRadius: 8, color: '#fff', fontFamily: 'inherit', fontSize: 15, outline: 'none',
    boxSizing: 'border-box', appearance: 'none',
  };

  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: SITE.textMuted, marginBottom: 6,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'fadeIn 0.2s ease' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'relative', background: SITE.card, border: `1px solid ${SITE.cardBorder}`, borderRadius: 16, padding: 36, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', animation: 'slideDown 0.3s ease' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 20, background: 'none', border: 'none', color: SITE.textMuted, fontSize: 28, cursor: 'pointer' }}>&times;</button>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12, color: '#10b981' }}>&#x2713;</div>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Présence confirmée!</p>
            <p style={{ fontSize: 14, color: SITE.textMuted, marginTop: 8 }}>{name} — {category} — {position}</p>
          </div>
        ) : status === 'absent' ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12, color: '#ef4444' }}>&#x2717;</div>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Absence notée</p>
            <p style={{ fontSize: 14, color: SITE.textMuted, marginTop: 8 }}>{name}</p>
          </div>
        ) : (
          <>
            <h3 style={{ fontFamily: "'Bebas Neue','Montserrat',sans-serif", fontSize: 28, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 8 }}>Confirmer ta présence</h3>
            <p style={{ fontSize: 16, fontWeight: 600, color: typeColor, marginBottom: 6 }}>{formatDateFull(dateStr)}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
              {sessions.map(s => {
                const pt = PRACTICE_TYPES.find(p => p.id === s);
                return (
                  <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#fff', background: pt?.color || '#444' }}>
                    {!pt?.bookable && '\u{1f512} '}{pt?.label}
                  </span>
                );
              })}
            </div>
            {sessions.includes('starting-pro') && (
              <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 8, fontWeight: 500 }}>
                Starting Pro — sur invitation seulement. Réservation non disponible.
              </p>
            )}
            <p style={{ fontSize: 13, color: SITE.textSubtle, marginBottom: 28 }}>9h00 à 14h00 — Complexe sportif de Saint-Laurent</p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Nom complet <span style={{ color: typeColor }}>*</span></label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Prénom Nom" required style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, marginBottom: 16 }}>
                  <label style={labelStyle}>Ta catégorie <span style={{ color: typeColor }}>*</span></label>
                  <select value={category} onChange={e => setCategory(e.target.value)} required style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Sélectionner...</option>
                    {PLAYER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1, marginBottom: 16 }}>
                  <label style={labelStyle}>Poste <span style={{ color: typeColor }}>*</span></label>
                  <select value={position} onChange={e => setPosition(e.target.value)} required style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Sélectionner...</option>
                    {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '14px 20px', background: typeColor, border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                  {loading ? '...' : 'Confirmer ma présence'}
                </button>
                <button type="button" onClick={() => handleSubmit(null, true)} disabled={loading} style={{ padding: '14px 20px', background: 'transparent', border: `1px solid ${SITE.inputBorder}`, borderRadius: 8, color: SITE.textMuted, fontSize: 14, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Absent
                </button>
              </div>
            </form>

            {attendees.length > 0 && (
              <div style={{ marginTop: 28, borderTop: `1px solid ${SITE.cardBorder}`, paddingTop: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: SITE.textSubtle, marginBottom: 12 }}>
                  {present.length} présent{present.length !== 1 ? 's' : ''} · {absent.length} absent{absent.length !== 1 ? 's' : ''}
                </p>
                <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                  {present.map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${SITE.cardBorder}` }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: '#fff', flex: 1 }}>{a.name}</span>
                      <span style={{ fontSize: 11, color: SITE.textSubtle, background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 4 }}>{a.team}</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>{a.position}</span>
                    </div>
                  ))}
                  {absent.map((a, i) => (
                    <div key={`ab${i}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${SITE.cardBorder}`, opacity: 0.5 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: '#fff', flex: 1 }}>{a.name}</span>
                      <span style={{ fontSize: 11, color: SITE.textSubtle }}>{a.team}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ===== BULK CONFIRM MODAL =====
function BulkConfirmModal({ dates, monthName, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('stxi_player');
    if (saved) {
      const p = JSON.parse(saved);
      setName(p.name || '');
      setCategory(p.category || '');
      setPosition(p.position || '');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    localStorage.setItem('stxi_player', JSON.stringify({ name: name.trim(), category, position }));

    for (const date of dates) {
      await saveAttendance({ date, name: name.trim(), team: category, position, status: 'present' });
    }

    setLoading(false);
    setDone(true);
    onSubmit();
    setTimeout(onClose, 2500);
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', background: SITE.inputBg, border: `1px solid ${SITE.inputBorder}`,
    borderRadius: 8, color: '#fff', fontFamily: 'inherit', fontSize: 15, outline: 'none',
    boxSizing: 'border-box', appearance: 'none',
  };

  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: SITE.textMuted, marginBottom: 6,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'fadeIn 0.2s ease' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'relative', background: SITE.card, border: `1px solid ${SITE.cardBorder}`, borderRadius: 16, padding: 36, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', animation: 'slideDown 0.3s ease' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 20, background: 'none', border: 'none', color: SITE.textMuted, fontSize: 28, cursor: 'pointer' }}>&times;</button>

        {done ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12, color: '#10b981' }}>&#x2713;</div>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Présence confirmée!</p>
            <p style={{ fontSize: 15, color: SITE.textMuted, marginTop: 8 }}>{dates.length} pratiques en {monthName}</p>
            <p style={{ fontSize: 14, color: SITE.textSubtle, marginTop: 4 }}>{name} — {category} — {position}</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', marginTop: 12 }}>Tu peux toujours cliquer sur une date pour te mettre absent si besoin.</p>
          </div>
        ) : (
          <>
            <h3 style={{ fontFamily: "'Bebas Neue','Montserrat',sans-serif", fontSize: 28, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 8 }}>Confirmer tout le mois</h3>
            <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600, color: '#fff', background: SITE.accent, marginBottom: 6 }}>
              {monthName} — {dates.length} pratique{dates.length !== 1 ? 's' : ''}
            </div>
            <p style={{ fontSize: 14, color: SITE.textSubtle, marginBottom: 24 }}>
              Ta présence sera confirmée pour toutes les pratiques restantes de {monthName}. Si tu as un empêchement, clique sur la date pour te mettre absent.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Nom complet <span style={{ color: SITE.accent }}>*</span></label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Prénom Nom" required style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, marginBottom: 16 }}>
                  <label style={labelStyle}>Ta catégorie <span style={{ color: SITE.accent }}>*</span></label>
                  <select value={category} onChange={e => setCategory(e.target.value)} required style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Sélectionner...</option>
                    {PLAYER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1, marginBottom: 16 }}>
                  <label style={labelStyle}>Poste <span style={{ color: SITE.accent }}>*</span></label>
                  <select value={position} onChange={e => setPosition(e.target.value)} required style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Sélectionner...</option>
                    {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '14px 20px', background: SITE.accent, border: 'none', borderRadius: 8,
                color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase',
                letterSpacing: '0.06em', opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s',
              }}>
                {loading ? `Confirmation en cours... (${dates.length} dates)` : `Confirmer les ${dates.length} pratiques`}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ===== MAIN APP =====
export default function App() {
  const [filter, setFilter] = useState('all');
  const [modalDate, setModalDate] = useState(null);
  const [bulkDates, setBulkDates] = useState(null);
  const [bulkMonth, setBulkMonth] = useState('');
  const [attendanceMap, setAttendanceMap] = useState({});
  const [modalAttendees, setModalAttendees] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState(new Set());

  useEffect(() => { loadAllAttendance(); }, []);

  const loadAllAttendance = useCallback(async () => {
    try {
      const all = await getAllAttendance();
      const map = {};
      all.forEach(a => { if (!map[a.date]) map[a.date] = []; map[a.date].push(a); });
      setAttendanceMap(map);
    } catch (err) {
      console.warn('Firebase not configured:', err.message);
    }
  }, []);

  const handleDayClick = useCallback(async (dateStr) => {
    if (selectMode) {
      setSelectedDates(prev => {
        const next = new Set(prev);
        if (next.has(dateStr)) next.delete(dateStr);
        else next.add(dateStr);
        return next;
      });
      return;
    }
    setModalDate(dateStr);
    try { setModalAttendees(await getAttendanceByDate(dateStr)); }
    catch { setModalAttendees([]); }
  }, [selectMode]);

  const handleBulkConfirm = useCallback((dates, monthName) => {
    setBulkDates(dates);
    setBulkMonth(monthName);
  }, []);

  const handleConfirmSelected = useCallback(() => {
    if (selectedDates.size === 0) return;
    setBulkDates([...selectedDates].sort());
    setBulkMonth(`${selectedDates.size} dates sélectionnées`);
  }, [selectedDates]);

  const toggleSelectMode = useCallback(() => {
    setSelectMode(prev => !prev);
    setSelectedDates(new Set());
  }, []);

  const closeModal = useCallback(() => { setModalDate(null); setModalAttendees([]); }, []);
  const closeBulk = useCallback(() => { setBulkDates(null); setBulkMonth(''); setSelectedDates(new Set()); setSelectMode(false); }, []);

  return (
    <div style={{ minHeight: '100vh', background: SITE.bg }}>
      <Navbar />

      {/* Hero — matches site page headers */}
      <div style={{ paddingTop: 80 }}>
        <div style={{ background: SITE.bg, padding: '64px 24px 40px', textAlign: 'center' }}>
          <div style={{ maxWidth: 1300, margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '5px 18px', background: 'rgba(78,170,212,0.08)', border: '1px solid rgba(78,170,212,0.2)', borderRadius: 4, fontSize: 11, fontWeight: 700, color: '#4EAAD4', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 20 }}>
              SAISON PRINTEMPS-ÉTÉ 2026
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue','Montserrat',sans-serif", fontWeight: 400, fontSize: 'clamp(2.5rem,6vw,4.5rem)', color: '#fff', textTransform: 'uppercase', margin: '0 0 12px', letterSpacing: '0.02em', lineHeight: 0.95 }}>
              Calendrier des pratiques
            </h1>
            <p style={{ fontSize: 16, color: SITE.textMuted, margin: '0 0 4px' }}>Horaire officiel 2026</p>
            <p style={{ fontSize: 14, color: SITE.textSubtle }}>Lundi · Mercredi · Vendredi | 9h00 à 14h00</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 60, height: 3, background: '#fff', margin: '0 auto 32px' }} />

      {/* Filters + Select Mode */}
      <div style={{ padding: '0 24px 16px', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
          {[{ id: 'all', label: 'Toutes', color: '#4EAAD4' }, ...PRACTICE_TYPES].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{
                padding: '10px 24px', background: filter === f.id ? f.color : 'transparent',
                border: `1px solid ${filter === f.id ? f.color : SITE.inputBorder}`, borderRadius: 4,
                color: filter === f.id ? '#fff' : SITE.textMuted,
                fontFamily: "'Montserrat',sans-serif", fontSize: 13, fontWeight: filter === f.id ? 700 : 500,
                cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
              {f.label}
            </button>
          ))}

          <div style={{ width: 1, height: 28, background: SITE.inputBorder, margin: '0 8px' }} />

          <button onClick={toggleSelectMode}
            style={{
              padding: '10px 24px',
              background: selectMode ? '#10b981' : 'transparent',
              border: `1px solid ${selectMode ? '#10b981' : SITE.inputBorder}`, borderRadius: 4,
              color: selectMode ? '#fff' : SITE.textMuted,
              fontFamily: "'Montserrat',sans-serif", fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
            {selectMode ? `\u2713 ${selectedDates.size} sélectionnée${selectedDates.size !== 1 ? 's' : ''}` : 'Sélection multiple'}
          </button>

          {selectMode && selectedDates.size > 0 && (
            <button onClick={handleConfirmSelected}
              style={{
                padding: '10px 24px', background: SITE.accent, border: 'none', borderRadius: 4,
                color: '#fff', fontFamily: "'Montserrat',sans-serif", fontSize: 13, fontWeight: 700,
                cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
              Confirmer ({selectedDates.size})
            </button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{ padding: '0 24px 32px', maxWidth: 1300, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
        <Legend color={COLORS['starting']} label="Starting" />
        <Legend color={COLORS['starting-junior']} label="Starting Junior" />
        <Legend color={COLORS['starting-senior']} label="Starting Senior" />
        <Legend color={COLORS['starting-pro']} label="Starting Pro (sur invitation)" />
      </div>

      {/* Calendar Grid */}
      <div style={{ padding: '0 24px 64px', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
          {MONTHS.map(m => (
            <MonthCard key={m.name} {...m} filter={filter} attendanceMap={attendanceMap} onDayClick={handleDayClick} onBulkConfirm={handleBulkConfirm} selectMode={selectMode} selectedDates={selectedDates} />
          ))}
        </div>
      </div>

      {/* Single day modal */}
      {modalDate && (
        <AttendanceModal dateStr={modalDate} attendees={modalAttendees} onClose={closeModal} onSubmit={loadAllAttendance} />
      )}

      {/* Bulk confirm modal */}
      {bulkDates && (
        <BulkConfirmModal dates={bulkDates} monthName={bulkMonth} onClose={closeBulk} onSubmit={loadAllAttendance} />
      )}

      {/* Footer — matches site footer */}
      <footer style={{ background: '#1a1a1a', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>&copy; 2026 Starting XI. Tous droits réservés.</p>
      </footer>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: SITE.textMuted }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
      {label}
    </span>
  );
}
