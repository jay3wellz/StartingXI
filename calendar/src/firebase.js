import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';

// TODO: Replace with your Firebase config from https://console.firebase.google.com
// 1. Create a project "stxi-calendar"
// 2. Add a web app
// 3. Copy the config here
// 4. Enable Firestore in the Firebase console
const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const attendanceRef = collection(db, 'attendance');

// Save attendance (present or absent)
export async function saveAttendance({ date, name, team, position, status }) {
  const id = `${date}_${name.toLowerCase().replace(/\s+/g, '_')}`;
  await setDoc(doc(db, 'attendance', id), {
    date,
    name,
    team,
    position,
    status,
    timestamp: new Date().toISOString(),
  });
  return id;
}

// Get all attendance for a specific date
export async function getAttendanceByDate(date) {
  const q = query(attendanceRef, where('date', '==', date));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Get all attendance (for admin/overview)
export async function getAllAttendance() {
  const snap = await getDocs(attendanceRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Remove attendance
export async function removeAttendance(id) {
  await deleteDoc(doc(db, 'attendance', id));
}

export { db };
