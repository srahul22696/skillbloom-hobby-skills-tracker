export const cleanText = (value, max = 500) => String(value ?? '').normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
export const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim()) && String(value).length <= 254;
export const validPassword = value => typeof value === 'string' && value.length >= 10 && value.length <= 128 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value);
export const safeRead = key => { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; } };
export const safeWrite = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };
export const dateKey = date => { const d = new Date(date); return Number.isNaN(d.getTime()) ? '' : `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
export function calculateStreak(sessions, now = new Date()) {
 const days = new Set(sessions.map(s => dateKey(s.practicedAt)).filter(Boolean));
 let cursor = new Date(now); cursor.setHours(0,0,0,0);
 if (!days.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
 let count = 0;
 while (days.has(dateKey(cursor)) && count < 3660) { count++; cursor.setDate(cursor.getDate() - 1); }
 return count;
}
export function progressPercent(current, target) { const a=Number(current), b=Number(target); if(!Number.isFinite(a)||!Number.isFinite(b)||b<=0)return 0; return Math.min(100,Math.max(0,Math.round(a/b*100))); }
export function validateSession(session) {
 const minutes=Number(session.minutes);
 if(!Number.isInteger(minutes)||minutes<1||minutes>1440)return 'Practice time must be between 1 and 1,440 minutes.';
 const chosen=dateKey(session.practicedAt);
 if(!chosen)return 'Choose a valid practice date.';
 if(typeof session.practicedAt==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(session.practicedAt)&&chosen!==session.practicedAt)return 'Choose a valid practice date.';
 if(chosen>dateKey(new Date()))return 'Practice date cannot be in the future.';
 if(!cleanText(session.activity,100))return 'Add a short activity description.';
 return '';
}
