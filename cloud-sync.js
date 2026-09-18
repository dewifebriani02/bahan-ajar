/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CLOUD SYNC & REALTIME MULTIPLAYER ENGINE — FEBI UNIVERSITAS TAZKIA
 * Firebase Cloud Firestore Integration for Bahan Ajar Digital & Live Games
 * Project: akuntansi-syariah
 * ═══════════════════════════════════════════════════════════════════════════
 */

// 1. Firebase Configuration (Project: akuntansi-syariah)
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBTtfB_3j33f_8KBqri7GkkukV8uj7-8Nc",
  authDomain: "akuntansi-syariah.firebaseapp.com",
  projectId: "akuntansi-syariah",
  storageBucket: "akuntansi-syariah.firebasestorage.app",
  messagingSenderId: "335898738265",
  appId: "1:335898738265:web:11175c94b92d929ceb3b48",
  measurementId: "G-3N3W7V0195"
};

// 2. Global State, PIN Gate & Firestore Instance
let db = null;
let isDbReady = false;
const readyCallbacks = [];

let currentStudent = {
  nim: localStorage.getItem('tazkia_student_nim') || '',
  nama: localStorage.getItem('tazkia_student_nama') || ''
};

// 3. Dynamic Course Registry & Confidential PINs
const DEFAULT_COURSES = [
  { code: 'AIS', name: 'Accounting Information Systems (AIS-302)', folder: 'Sistem Informasi Akuntansi', pin: '3021', icon: '🏛️' },
  { code: 'ADA', name: 'Applied Data Analytics (ADA-301)', folder: 'Applied Data Analytics', pin: '3011', icon: '📊' },
  { code: 'BIV', name: 'Business Intelligence & Visualization (BIV-301)', folder: 'Business Intelligence', pin: '3012', icon: '📈' }
];

let registeredCourses = [...DEFAULT_COURSES];
let activeCoursePins = { 'AIS': '3021', 'SIA': '3021', 'ADA': '3011', 'BIV': '3012', 'DOSEN': '7788' };

// Official Master Student Roster (37 Mahasiswa Terdaftar)
const DEFAULT_STUDENTS_ROSTER = [
  // --- AIS Kelas Karyawan (11 Mahasiswa) ---
  { nim: "2510102001", nama: "Zahra Qatrun Nada", courses: ["AIS", "SIA"], classGroup: "AIS - Karyawan", status: "Aktif" },
  { nim: "2510102003", nama: "Nikita Rahma Alyssa Yuda", courses: ["AIS", "SIA"], classGroup: "AIS - Karyawan", status: "Aktif" },
  { nim: "2510102005", nama: "Muhammad Isnan Azuhri", courses: ["AIS", "SIA"], classGroup: "AIS - Karyawan", status: "Aktif" },
  { nim: "2510102006", nama: "Nurjanah", courses: ["AIS", "SIA"], classGroup: "AIS - Karyawan", status: "Aktif" },
  { nim: "2510102008", nama: "Tengku Airin Putri Rudyansyah", courses: ["AIS", "SIA"], classGroup: "AIS - Karyawan", status: "Aktif" },
  { nim: "2510102010", nama: "Muhammad Faisal Fadilah", courses: ["AIS", "SIA"], classGroup: "AIS - Karyawan", status: "Aktif" },
  { nim: "2510102011", nama: "Era Firda Fajriah", courses: ["AIS", "SIA"], classGroup: "AIS - Karyawan", status: "Aktif" },
  { nim: "2510102028", nama: "Farhan Reflyansyah Hutabarat", courses: ["AIS", "SIA"], classGroup: "AIS - Karyawan", status: "Aktif" },
  { nim: "2510102030", nama: "Khairunnisa Najla Salsabila", courses: ["AIS", "SIA"], classGroup: "AIS - Karyawan", status: "Aktif" },
  { nim: "2510102031", nama: "Safanah Sayidatus Sajil Hakim", courses: ["AIS", "SIA"], classGroup: "AIS - Karyawan", status: "Aktif" },
  { nim: "2510102034", nama: "Hanifah", courses: ["AIS", "SIA"], classGroup: "AIS - Karyawan", status: "Aktif" },

  // --- AIS Kelas Reguler (15 Mahasiswa) ---
  { nim: "2510102007", nama: "Muhammad Annas Akbar", courses: ["AIS", "SIA"], classGroup: "AIS - Reguler", status: "Aktif" },
  { nim: "2510102012", nama: "Parvez Athaya Rifa Adrian", courses: ["AIS", "SIA"], classGroup: "AIS - Reguler", status: "Aktif" },
  { nim: "2510102013", nama: "Adibah Aulia Pulungan", courses: ["AIS", "SIA"], classGroup: "AIS - Reguler", status: "Aktif" },
  { nim: "2510102014", nama: "Dinda Haselanova Putri", courses: ["AIS", "SIA"], classGroup: "AIS - Reguler", status: "Aktif" },
  { nim: "2510102017", nama: "Zahwan Hanif Aghna Rahardjo", courses: ["AIS", "SIA"], classGroup: "AIS - Reguler", status: "Aktif" },
  { nim: "2510102018", nama: "Akmal Husein", courses: ["AIS", "SIA"], classGroup: "AIS - Reguler", status: "Aktif" },
  { nim: "2510102019", nama: "RAHMA MAUDILAH YUANA PUTRI", courses: ["AIS", "SIA"], classGroup: "AIS - Reguler", status: "Aktif" },
  { nim: "2510102020", nama: "Zaydan Ilmi Taqiyudin", courses: ["AIS", "SIA"], classGroup: "AIS - Reguler", status: "Aktif" },
  { nim: "2510102021", nama: "Mutia Adelah", courses: ["AIS", "SIA"], classGroup: "AIS - Reguler", status: "Aktif" },
  { nim: "2510102022", nama: "LIVIA AZARAH", courses: ["AIS", "SIA"], classGroup: "AIS - Reguler", status: "Aktif" },
  { nim: "2510102023", nama: "Aulia Nuzulul Fitria", courses: ["AIS", "SIA"], classGroup: "AIS - Reguler", status: "Aktif" },
  { nim: "2510102024", nama: "Muhammad Ibrahim", courses: ["AIS", "SIA"], classGroup: "AIS - Reguler", status: "Aktif" },
  { nim: "2510102025", nama: "Iffah Husnul Zahidah", courses: ["AIS", "SIA"], classGroup: "AIS - Reguler", status: "Aktif" },
  { nim: "2510102026", nama: "Syamil Al Fayiz", courses: ["AIS", "SIA"], classGroup: "AIS - Reguler", status: "Aktif" },
  { nim: "2510102033", nama: "RAGIL ADITIYA", courses: ["AIS", "SIA"], classGroup: "AIS - Reguler", status: "Aktif" },

  // --- ADA & BIV (11 Mahasiswa) ---
  { nim: "2410102002", nama: "Aliffa Rahmadanni", courses: ["ADA", "BIV"], classGroup: "ADA / BIV", status: "Aktif" },
  { nim: "2410102004", nama: "Fairuz Alya Manora", courses: ["ADA", "BIV"], classGroup: "ADA / BIV", status: "Aktif" },
  { nim: "2410102005", nama: "Suciyanti", courses: ["ADA", "BIV"], classGroup: "ADA / BIV", status: "Aktif" },
  { nim: "2410102006", nama: "Zenieta Nijwa", courses: ["ADA", "BIV"], classGroup: "ADA / BIV", status: "Aktif" },
  { nim: "2410102007", nama: "Rasti Septa Sari", courses: ["ADA", "BIV"], classGroup: "ADA / BIV", status: "Aktif" },
  { nim: "2410102008", nama: "Liana Tasa", courses: ["ADA", "BIV"], classGroup: "ADA / BIV", status: "Aktif" },
  { nim: "2410102009", nama: "Utami Apri Robi Laijah", courses: ["ADA", "BIV"], classGroup: "ADA / BIV", status: "Aktif" },
  { nim: "2410102010", nama: "Izza Arydani", courses: ["ADA", "BIV"], classGroup: "ADA / BIV", status: "Aktif" },
  { nim: "2410102011", nama: "Mohamad Fikri Zim Aufar", courses: ["ADA", "BIV"], classGroup: "ADA / BIV", status: "Aktif" },
  { nim: "2410102012", nama: "Muhammad Waqif Al Ghifari", courses: ["ADA", "BIV"], classGroup: "ADA / BIV", status: "Aktif" },
  { nim: "2410102013", nama: "Ibnu Hajar", courses: ["ADA", "BIV"], classGroup: "ADA / BIV", status: "Aktif" }
];

let activeStudentsRoster = [...DEFAULT_STUDENTS_ROSTER];
window.DEFAULT_STUDENTS_ROSTER = DEFAULT_STUDENTS_ROSTER;
window.activeStudentsRoster = activeStudentsRoster;

function findStudentByNim(nim) {
  if (!nim) return null;
  const cleanNim = String(nim).trim();
  if (cleanNim === '0206015') {
    return { nim: '0206015', nama: 'Dewi Febriani', courses: ['AIS', 'SIA', 'ADA', 'DAT', 'BIV', 'DOSEN'], classGroup: 'Dosen Pengampu', status: 'Dosen' };
  }
  return activeStudentsRoster.find(s => s.nim === cleanNim) || null;
}
window.findStudentByNim = findStudentByNim;

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
window.escapeHtml = escapeHtml;

// Helper: Run callback when Firebase DB is ready
window.onCloudSyncReady = function (cb) {
  if (isDbReady && db) {
    cb(db);
  } else {
    readyCallbacks.push(cb);
  }
};

window.getDbInstance = function () {
  return new Promise((resolve) => {
    window.onCloudSyncReady(resolve);
  });
};

function markDbReady(firestoreInstance) {
  db = firestoreInstance;
  isDbReady = true;
  window.firebaseDb = db;
  console.log("✓ Firebase Firestore 'akuntansi-syariah' siap digunakan!");
  listenDynamicCourses();
  listenStudentsRoster();
  listenMeetingLocks();
  checkStudentIdentity();
  while (readyCallbacks.length > 0) {
    const cb = readyCallbacks.shift();
    try { cb(db); } catch (e) { console.error("Error in readyCallback:", e); }
  }
  window.dispatchEvent(new CustomEvent('cloud-sync-ready', { detail: { db } }));
}

// 4. Meeting Locks & Access Control Engine
let activeMeetingLocks = {
  'AIS_P01': true, 'AIS_P02': true, 'AIS_P03': false, 'AIS_P04': false,
  'AIS_P05': false, 'AIS_P06': false, 'AIS_P07': false, 'AIS_P08': false,
  'ADA_P01': true, 'ADA_P02': true, 'ADA_P03': false,
  'BIV_P01': true, 'BIV_P02': true
};
window.activeMeetingLocks = activeMeetingLocks;

function listenMeetingLocks() {
  window.onCloudSyncReady(dbInstance => {
    dbInstance.collection('settings').doc('meeting_locks').onSnapshot(doc => {
      if (doc.exists) {
        activeMeetingLocks = { ...doc.data() };
      } else {
        // Auto seed default meeting locks (P01 & P02 open, others locked)
        dbInstance.collection('settings').doc('meeting_locks').set({
          ...activeMeetingLocks,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }
      window.activeMeetingLocks = activeMeetingLocks;
      applyMeetingLocksToUI();
      checkDirectMeetingPageLock();
      window.dispatchEvent(new CustomEvent('meeting-locks-updated', { detail: { locks: activeMeetingLocks } }));
    }, err => {
      console.warn("Using offline fallback for meeting locks:", err);
      applyMeetingLocksToUI();
      checkDirectMeetingPageLock();
    });
  });
}

function isMeetingUnlocked(courseCode, pNum) {
  const pCode = 'P' + String(pNum).padStart(2, '0');
  const key = `${courseCode}_${pCode}`;
  if (key in activeMeetingLocks) {
    return activeMeetingLocks[key] === true;
  }
  return pNum <= 2;
}
window.isMeetingUnlocked = isMeetingUnlocked;

function applyMeetingLocksToUI() {
  const info = detectCurrentCourseInfo();
  if (!info || info.code === 'DOSEN') return;

  const isDosenUser = currentStudent.nim === '0206015';
  const meetingCards = document.querySelectorAll('.meeting-card');
  if (meetingCards.length === 0) return;

  meetingCards.forEach((card, idx) => {
    const titleEl = card.querySelector('.meeting-title');
    const href = card.getAttribute('href') || '';
    let pNum = idx + 1;
    const match = (titleEl ? titleEl.textContent : href).match(/Pertemuan\s*(\d{1,2})/i);
    if (match) {
      pNum = parseInt(match[1], 10);
    }

    const unlocked = isMeetingUnlocked(info.code, pNum);

    if (isDosenUser) {
      let badge = card.querySelector('.dosen-preview-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'dosen-preview-badge';
        badge.style.cssText = 'font-size:11px;padding:2px 8px;border-radius:6px;font-weight:700;margin-left:8px;display:inline-flex;align-items:center;gap:4px';
        const header = card.querySelector('.meeting-header');
        if (header) header.appendChild(badge);
      }
      if (unlocked) {
        badge.innerHTML = '🟢 Akses Terbuka';
        badge.style.background = 'rgba(16,185,129,.15)';
        badge.style.border = '1px solid rgba(16,185,129,.35)';
        badge.style.color = '#6EE7B7';
      } else {
        badge.innerHTML = '🔒 Terkunci (Dosen Override)';
        badge.style.background = 'rgba(239,68,68,.15)';
        badge.style.border = '1px solid rgba(239,68,68,.35)';
        badge.style.color = '#FCA5A5';
      }
      return;
    }

    // Student view
    if (!unlocked) {
      card.classList.add('meeting-card-locked');
      card.style.opacity = '0.65';
      card.style.borderColor = 'rgba(239, 68, 68, 0.4)';
      card.style.borderStyle = 'dashed';
      card.style.background = 'rgba(18, 24, 38, 0.6)';

      const icon = card.querySelector('.meeting-icon');
      if (icon) icon.textContent = '🔒';

      const badge = card.querySelector('.meeting-badge');
      if (badge) {
        badge.innerHTML = '🔒 Belum Dibuka';
        badge.style.background = 'rgba(239, 68, 68, 0.15)';
        badge.style.borderColor = 'rgba(239, 68, 68, 0.35)';
        badge.style.color = '#FCA5A5';
      }

      const btn = card.querySelector('.meeting-btn');
      if (btn) {
        btn.innerHTML = '🔒 Terkunci';
        btn.style.background = '#1E293B';
        btn.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        btn.style.color = '#FCA5A5';
        btn.style.cursor = 'not-allowed';
      }

      card.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        showMeetingLockedAlert(info.name, pNum);
      };
    } else {
      card.classList.remove('meeting-card-locked');
      card.style.opacity = '';
      card.style.borderColor = '';
      card.style.borderStyle = '';
      card.style.background = '';
      card.onclick = null;
    }
  });
}

function showMeetingLockedAlert(courseName, pNum) {
  let modal = document.getElementById('meetingLockedAlertModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'meetingLockedAlertModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.75);backdrop-filter:blur(6px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;animation:modalPop .2s ease-out';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="background:#121826;border:1.5px solid rgba(239,68,68,.4);border-radius:16px;max-width:480px;width:100%;box-shadow:0 24px 60px rgba(0,0,0,.8);overflow:hidden;text-align:center;padding:32px 24px">
      <div style="font-size:48px;margin-bottom:12px">🔒</div>
      <span style="display:inline-block;background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.35);color:#FCA5A5;padding:3px 12px;border-radius:20px;font-size:11.5px;font-weight:700;letter-spacing:.05em;margin-bottom:12px">MODUL BELUM DIBUKA</span>
      <h3 style="font-family:'Amiri',serif;font-size:22px;color:#fff;margin-bottom:8px">Pertemuan ${pNum} Belum Waktunya</h3>
      <p style="font-size:13.5px;color:#94A3B8;line-height:1.6;margin-bottom:24px">
        Materi kuliah dan lembar kerja praktikum untuk <strong>Pertemuan ${pNum}</strong> pada mata kuliah ini masih dikunci oleh Dosen Pengampu. Silakan tunggu jadwal sesi perkuliahan berlangsung.
      </p>
      <button onclick="document.getElementById('meetingLockedAlertModal').remove()" style="background:linear-gradient(135deg,#0284C7,#0EA5E9);color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:13.5px;font-weight:700;cursor:pointer;box-shadow:0 4px 14px rgba(14,165,233,.3)">
        Saya Mengerti ✓
      </button>
    </div>
  `;
}

function checkDirectMeetingPageLock() {
  const path = decodeURIComponent(window.location.pathname);
  const match = path.match(/Pertemuan\s*(\d{1,2})/i);
  if (!match) return;

  const pNum = parseInt(match[1], 10);
  const info = detectCurrentCourseInfo();
  if (!info || info.code === 'DOSEN') return;

  const isDosenUser = currentStudent.nim === '0206015';
  if (isDosenUser) return;

  const unlocked = isMeetingUnlocked(info.code, pNum);
  if (!unlocked) {
    renderFullscreenMeetingLockGate(info.name, pNum);
  } else {
    const gate = document.getElementById('fullscreenMeetingLockGate');
    if (gate) gate.remove();
  }
}

function renderFullscreenMeetingLockGate(courseName, pNum) {
  let gate = document.getElementById('fullscreenMeetingLockGate');
  if (!gate) {
    gate = document.createElement('div');
    gate.id = 'fullscreenMeetingLockGate';
    gate.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:#0A0E17;z-index:9999999;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center';
    document.body.appendChild(gate);
  }

  gate.innerHTML = `
    <div style="max-width:520px;background:#121826;border:1.5px solid rgba(239,68,68,.35);border-radius:16px;padding:40px 28px;box-shadow:0 24px 60px rgba(0,0,0,.85)">
      <div style="font-size:56px;margin-bottom:14px">🔒</div>
      <span style="display:inline-block;background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.35);color:#FCA5A5;padding:3px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:.06em;margin-bottom:14px">MODUL BELUM DIBUKA</span>
      <h2 style="font-family:'Amiri',serif;font-size:26px;color:#fff;margin-bottom:10px">Pertemuan ${pNum} Sedang Dikunci</h2>
      <p style="font-size:14px;color:#94A3B8;line-height:1.6;margin-bottom:28px">
        Materi slide perkuliahan dan lembar kerja praktikum untuk <strong>Pertemuan ${pNum} (${escapeHtml(courseName)})</strong> belum dibuka oleh Dosen Pengampu karena belum waktunya.
      </p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <a href="../index.html" style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#0284C7,#0EA5E9);color:#fff;padding:12px 22px;border-radius:8px;font-size:13.5px;font-weight:700;text-decoration:none;box-shadow:0 4px 14px rgba(14,165,233,.3)">
          ← Kembali ke Silabus Modul
        </a>
        <a href="../../index.html" style="display:inline-flex;align-items:center;gap:8px;background:#1E293B;border:1px solid #334155;color:#E2E8F0;padding:12px 20px;border-radius:8px;font-size:13.5px;font-weight:600;text-decoration:none">
          🏛️ Portal Utama
        </a>
      </div>
    </div>
  `;
}

// 5. Confidential Course PIN Gate & Student Roster Engine
function listenStudentsRoster() {
  window.onCloudSyncReady(dbInstance => {
    dbInstance.collection('settings').doc('students_roster').onSnapshot(doc => {
      if (doc.exists) {
        const data = doc.data();
        if (data && Array.isArray(data.students) && data.students.length > 0) {
          activeStudentsRoster = [...data.students];
          window.activeStudentsRoster = activeStudentsRoster;
        }
      } else {
        // Auto-seed roster to Firestore
        dbInstance.collection('settings').doc('students_roster').set({
          students: DEFAULT_STUDENTS_ROSTER,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }
    }, err => {
      console.warn("Using offline fallback for students roster:", err);
    });
  });
}

function listenDynamicCourses() {
  window.onCloudSyncReady(dbInstance => {
    // 1. Listen to courses_meta for dynamic courses list
    dbInstance.collection('settings').doc('courses_meta').onSnapshot(doc => {
      if (doc.exists) {
        const data = doc.data();
        if (data && Array.isArray(data.courses)) {
          registeredCourses = [...data.courses];
        }
      }
      checkCourseAccessPin();
    }, err => {
      checkCourseAccessPin();
    });

    // 2. Listen to access_pins for real-time PIN changes
    dbInstance.collection('settings').doc('access_pins').onSnapshot(doc => {
      if (doc.exists) {
        activeCoursePins = { ...activeCoursePins, ...doc.data() };
      }
      checkCourseAccessPin();
    }, err => {
      checkCourseAccessPin();
    });
  });
}

function detectCurrentCourseInfo() {
  const path = decodeURIComponent(window.location.pathname);
  if (path.includes('dashboard-dosen')) {
    return { code: 'DOSEN', name: 'Dashboard Dosen & Gradebook', pin: activeCoursePins['DOSEN'] || '7788', icon: '🔑' };
  }
  for (const c of registeredCourses) {
    if ((c.folder && path.includes(c.folder)) || (c.name && path.includes(c.name)) || (c.code && path.includes(c.code))) {
      return {
        code: c.code,
        name: c.name,
        pin: activeCoursePins[c.code] || c.pin || '1234',
        icon: c.icon || '📚'
      };
    }
  }
  return null; // Portal index.html bebas diakses
}

function checkCourseAccessPin() {
  const info = detectCurrentCourseInfo();
  if (!info) return;

  const requiredPin = activeCoursePins[info.code] || info.pin;

  if (info.code === 'DOSEN') {
    // Strict Dosen Gate: Must be logged in as Dosen 0206015 AND have valid session token
    const isDosenUser = currentStudent.nim === '0206015';
    const isDosenAuth = sessionStorage.getItem('tazkia_dosen_authenticated') === 'true';

    if (isDosenUser && isDosenAuth) {
      const lockModal = document.getElementById('coursePinModal');
      if (lockModal) lockModal.remove();
      document.body.style.overflow = '';
      return;
    } else {
      showPinModal(info, requiredPin);
      return;
    }
  }

  // Dosen account bypasses course PINs automatically
  if (currentStudent && currentStudent.nim === '0206015') {
    const lockModal = document.getElementById('coursePinModal');
    if (lockModal) lockModal.remove();
    document.body.style.overflow = '';
    return;
  }

  const unlocked = localStorage.getItem('tazkia_pin_unlocked_' + info.code);

  if (unlocked === requiredPin) {
    const lockModal = document.getElementById('coursePinModal');
    if (lockModal) lockModal.remove();
    document.body.style.overflow = '';
  } else {
    showPinModal(info, requiredPin);
  }
}

function showPinModal(info, requiredPin) {
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', () => showPinModal(info, requiredPin));
    return;
  }

  let modal = document.getElementById('coursePinModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'coursePinModal';
    document.body.style.overflow = 'hidden';

    const isDosenPage = info.code === 'DOSEN';
    const titleText = isDosenPage ? 'Autentikasi Dosen Pengampu' : 'Kunci Akses Kelas';
    const subtitleText = isDosenPage ? 'Halaman Khusus Dosen &amp; Gradebook Akademik' : `Mata Kuliah: <strong style="color:#38BDF8">${info.name}</strong>`;
    const descText = isDosenPage
      ? 'Halaman ini memuat rekapan seluruh nilai dan berkas rahasia mahasiswa. Masukkan PIN Dosen (4 Digit) untuk melanjutkan.'
      : 'Materi ini bersifat <em>confidential</em>. Masukkan PIN akses yang dibagikan oleh Dosen di dalam kelas untuk membuka materi.';

    modal.innerHTML = `
      <div style="position:fixed;inset:0;background:rgba(7,15,28,.97);backdrop-filter:blur(10px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:18px">
        <div style="background:#121826;border:2px solid ${isDosenPage ? '#38BDF8' : '#D46020'};border-radius:14px;padding:32px 24px;max-width:420px;width:100%;color:#fff;box-shadow:0 20px 50px rgba(0,0,0,.8);font-family:'Source Sans 3',sans-serif;text-align:center">
          <div style="font-size:42px;margin-bottom:8px">${info.icon || '🔒'}</div>
          <h3 style="font-family:'Amiri',serif;font-size:24px;margin:0 0 6px;color:${isDosenPage ? '#7DD3FC' : '#FFB885'}">${titleText}</h3>
          <p style="font-size:14px;color:#CBD5E1;margin-bottom:6px">${subtitleText}</p>
          <p style="font-size:12px;color:#94A3B8;margin-bottom:18px">${descText}</p>
          
          <div style="margin-bottom:18px">
            <input type="password" id="inputCoursePin" maxlength="12" placeholder="••••" style="width:100%;padding:12px;border-radius:8px;border:1.5px solid #334155;background:#0F172A;color:#FFD488;font-size:22px;letter-spacing:.3em;text-align:center;box-sizing:border-box;font-family:'Source Code Pro',monospace;outline:none">
          </div>

          <button onclick="submitCoursePin('${info.code}')" style="width:100%;background:${isDosenPage ? 'linear-gradient(135deg,#0284C7,#0EA5E9)' : 'linear-gradient(135deg,#D46020,#E88030)'};color:#fff;border:none;border-radius:8px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;transition:all .15s;box-shadow:0 4px 16px rgba(14,165,233,.3)">🔓 ${isDosenPage ? 'Masuk Dashboard Dosen ✓' : 'Buka Akses Materi ✓'}</button>
          
          <div style="margin-top:16px">
            <a href="${info.code === 'DOSEN' ? 'index.html' : '../../index.html'}" style="color:#94A3B8;font-size:12.5px;text-decoration:none">← Kembali ke Portal Utama</a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    setTimeout(() => {
      const input = document.getElementById('inputCoursePin');
      if (input) {
        input.focus();
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') submitCoursePin(info.code);
        });
      }
    }, 100);
  }
}

window.submitCoursePin = function (courseCode) {
  const input = document.getElementById('inputCoursePin');
  if (!input) return;
  const typedPin = input.value.trim();
  const info = detectCurrentCourseInfo();
  const requiredPin = activeCoursePins[courseCode] || (info ? info.pin : '1234');

  if (typedPin === requiredPin) {
    if (courseCode === 'DOSEN') {
      sessionStorage.setItem('tazkia_dosen_authenticated', 'true');
      // Auto-switch to Lecturer identity
      currentStudent.nim = '0206015';
      currentStudent.nama = 'Dewi Febriani';
      localStorage.setItem('tazkia_student_nim', '0206015');
      localStorage.setItem('tazkia_student_nama', 'Dewi Febriani');
      updateTopStudentBadge();
    } else {
      localStorage.setItem('tazkia_pin_unlocked_' + courseCode, requiredPin);
    }

    const modal = document.getElementById('coursePinModal');
    if (modal) modal.remove();
    document.body.style.overflow = '';
    showCloudToast(`Akses <strong>${courseCode === 'DOSEN' ? 'Dashboard Dosen' : courseCode}</strong> berhasil terbuka!`);
  } else {
    input.value = '';
    input.style.borderColor = '#EF4444';
    alert(courseCode === 'DOSEN'
      ? "❌ PIN Dosen Salah! Hanya Dosen Pengampu yang memiliki akses ke dashboard ini."
      : "❌ PIN Salah! Silakan tanyakan PIN akses yang benar kepada Dosen pengampu di kelas.");
    input.focus();
  }
};

// 3. Initialize Firebase SDK from CDN
(function initFirebase() {
  if (window.firebase && window.firebase.firestore) {
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    markDbReady(firebase.firestore());
  } else {
    // Dynamically load Firebase App & Firestore if not present
    const s1 = document.createElement('script');
    s1.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js";
    s1.onload = () => {
      const s2 = document.createElement('script');
      s2.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js";
      s2.onload = () => {
        if (!firebase.apps.length) {
          firebase.initializeApp(FIREBASE_CONFIG);
        }
        markDbReady(firebase.firestore());
      };
      document.head.appendChild(s2);
    };
    document.head.appendChild(s1);
  }
})();

// 4. Modal Identitas Mahasiswa (NIM Whitelist & Nama Otomatis)
function checkStudentIdentity(forcePrompt = false) {
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', () => checkStudentIdentity(forcePrompt));
    return;
  }
  if (!currentStudent.nim || !currentStudent.nama || forcePrompt) {
    showIdentityModal();
  } else {
    updateTopStudentBadge();
  }
}

function handleNimLookup(typedNim) {
  const clean = String(typedNim).trim();
  const namaInput = document.getElementById('inputStudentNama');
  const statusBox = document.getElementById('nimStatusBox');
  const btnSave = document.getElementById('btnSaveIdentity');
  if (!namaInput || !statusBox) return;

  if (!clean) {
    statusBox.innerHTML = '';
    namaInput.value = '';
    namaInput.readOnly = false;
    return;
  }

  const student = findStudentByNim(clean);
  if (student) {
    namaInput.value = student.nama;
    namaInput.readOnly = true;
    namaInput.style.backgroundColor = '#0B132B';
    namaInput.style.borderColor = '#10B981';
    statusBox.innerHTML = `
      <div style="background:rgba(16,185,129,.15);border:1px solid #10B981;color:#34D399;padding:6px 10px;border-radius:6px;font-size:12px;font-weight:700;display:flex;align-items:center;gap:6px">
        <span>✓</span> <span>Terdaftar Resmi: <strong>${student.classGroup || student.courses.join(', ')}</strong></span>
      </div>
    `;
    if (btnSave) {
      btnSave.disabled = false;
      btnSave.style.opacity = '1';
    }
  } else if (clean.length >= 8) {
    namaInput.readOnly = false;
    namaInput.style.backgroundColor = '#0F172A';
    namaInput.style.borderColor = '#EF4444';
    statusBox.innerHTML = `
      <div style="background:rgba(239,68,68,.15);border:1px solid #EF4444;color:#F87171;padding:6px 10px;border-radius:6px;font-size:11.5px;line-height:1.4">
        ⚠️ NIM tidak ditemukan dalam daftar resmi kelas. Pastikan 10 digit NIM benar.
      </div>
    `;
  } else {
    statusBox.innerHTML = '';
  }
}
window.handleNimLookup = handleNimLookup;

function showIdentityModal() {
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', () => showIdentityModal());
    return;
  }
  let modal = document.getElementById('studentIdModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'studentIdModal';
    modal.innerHTML = `
      <div style="position:fixed;inset:0;background:rgba(7,15,28,.92);backdrop-filter:blur(8px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:18px">
        <div style="background:#121826;border:1.5px solid #22304A;border-radius:14px;padding:28px 24px;max-width:420px;width:100%;color:#fff;box-shadow:0 20px 50px rgba(0,0,0,.7);font-family:'Source Sans 3',sans-serif">
          <div style="font-size:36px;text-align:center;margin-bottom:6px">🎓</div>
          <h3 style="font-family:'Amiri',serif;font-size:24px;text-align:center;margin:0 0 6px;color:#38BDF8">Autentikasi Mahasiswa</h3>
          <p style="font-size:12.5px;color:#94A3B8;text-align:center;margin-bottom:16px">Masukkan NIM Anda untuk memuat identitas terdaftar dan menyinkronkan nilai kuis serta tugas praktikum.</p>
          
          <div style="margin-bottom:10px">
            <label style="display:block;font-size:12px;font-weight:700;color:#CBD5E1;margin-bottom:4px">NIM Mahasiswa (10 Digit):</label>
            <input type="text" id="inputStudentNIM" placeholder="Contoh: 2510102001" value="${currentStudent.nim}" oninput="handleNimLookup(this.value)" style="width:100%;padding:11px 12px;border-radius:6px;border:1.5px solid #334155;background:#0F172A;color:#FFD488;font-size:15px;font-family:'Source Code Pro',monospace;font-weight:700;box-sizing:border-box;outline:none">
          </div>

          <div id="nimStatusBox" style="margin-bottom:12px"></div>

          <div style="margin-bottom:18px">
            <label style="display:block;font-size:12px;font-weight:700;color:#CBD5E1;margin-bottom:4px">Nama Lengkap (Otomatis):</label>
            <input type="text" id="inputStudentNama" placeholder="Nama Mahasiswa Terdaftar" value="${currentStudent.nama}" style="width:100%;padding:10px 12px;border-radius:6px;border:1px solid #334155;background:#0F172A;color:#fff;font-size:14px;box-sizing:border-box" ${currentStudent.nama ? 'readonly' : ''}>
          </div>

          <button id="btnSaveIdentity" onclick="saveStudentIdentity()" style="width:100%;background:linear-gradient(135deg,#D46020,#E88030);color:#fff;border:none;border-radius:8px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;transition:all .15s;box-shadow:0 4px 16px rgba(212,96,32,.3)">Simpan &amp; Masuk Kelas ✓</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    if (currentStudent.nim) {
      setTimeout(() => handleNimLookup(currentStudent.nim), 50);
    }
  }
}

function saveStudentIdentity() {
  const nimInput = document.getElementById('inputStudentNIM');
  const namaInput = document.getElementById('inputStudentNama');
  if (!nimInput || !namaInput) return;

  const nim = nimInput.value.trim();
  let nama = namaInput.value.trim();

  if (!nim) {
    alert("Mohon masukkan NIM Mahasiswa Anda!");
    return;
  }

  const student = findStudentByNim(nim);
  if (!student && nim !== '0206015') {
    alert(`❌ Akses Ditolak: NIM "${nim}" tidak terdaftar dalam daftar mahasiswa resmi kelas FEBI Tazkia.\n\nSilakan periksa kembali NIM Anda atau hubungi Dosen pengampu di kelas jika Anda mahasiswa baru.`);
    return;
  }

  if (student) {
    nama = student.nama;
  }

  currentStudent.nim = nim;
  currentStudent.nama = nama;
  localStorage.setItem('tazkia_student_nim', nim);
  localStorage.setItem('tazkia_student_nama', nama);

  if (nim !== '0206015') {
    sessionStorage.removeItem('tazkia_dosen_authenticated');
    localStorage.removeItem('tazkia_pin_unlocked_DOSEN');
  }

  const labNim = document.getElementById('labStudentNim');
  const labNama = document.getElementById('labStudentNama');
  if (labNim) labNim.value = nim;
  if (labNama) labNama.value = nama;

  // Sync to Firestore collection 'users'
  window.onCloudSyncReady((dbInstance) => {
    dbInstance.collection('users').doc(nim).set({
      nim: nim,
      nama: nama,
      classGroup: student ? (student.classGroup || '-') : 'Dosen',
      courses: student ? (student.courses || []) : ['ALL'],
      lastActive: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true })
      .then(() => {
        console.log("✓ User data tersinkronisasi ke Firestore collection 'users'");
        showCloudToast(`Identitas <strong>${nama} (${nim})</strong> terhubung ke Cloud!`);
      })
      .catch(err => {
        console.error("Error saving user:", err);
      });
  });

  const modal = document.getElementById('studentIdModal');
  if (modal) modal.remove();
  updateTopStudentBadge();
}

function updateTopStudentBadge() {
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', () => updateTopStudentBadge());
    return;
  }

  let badge = document.getElementById('topStudentBadge');
  if (!badge) {
    const topbarRight = document.querySelector('.topbar-right') || document.querySelector('.topbar');
    badge = document.createElement('div');
    badge.id = 'topStudentBadge';
    if (topbarRight) {
      badge.style.cssText = "display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:14px;padding:4px 12px;font-size:12px;color:#fff;cursor:pointer;margin-right:8px;transition:all .15s";
      topbarRight.insertBefore(badge, topbarRight.firstChild);
    } else {
      // Floating pill on top-right if no .topbar
      badge.style.cssText = "position:fixed;top:10px;right:14px;z-index:9998;display:flex;align-items:center;gap:6px;background:#0C1D30;border:1.5px solid #1B7898;border-radius:20px;padding:6px 14px;font-size:12px;color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.3);cursor:pointer;font-family:'Source Sans 3',sans-serif";
      document.body.appendChild(badge);
    }
    badge.onclick = () => showIdentityModal();
  }

  if (badge) {
    if (currentStudent.nama && currentStudent.nim) {
      badge.innerHTML = `👤 <strong>${currentStudent.nama}</strong> (${currentStudent.nim}) ✏️`;
      badge.title = "Klik untuk mengganti NIM / Nama";
    } else {
      badge.innerHTML = `🎓 <span style="color:#FFB885;font-weight:700">Isi NIM &amp; Nama</span> ⚠️`;
      badge.title = "Klik untuk mengisi identitas mahasiswa";
    }
  }
}

// 5. Toast Notification System
function showCloudToast(message, isError = false) {
  let toast = document.getElementById('cloudSyncToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cloudSyncToast';
    toast.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:99999;padding:12px 20px;border-radius:10px;font-size:13.5px;font-weight:600;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.4);transition:all .3s;font-family:'Source Sans 3',sans-serif;display:flex;align-items:center;gap:10px";
    document.body.appendChild(toast);
  }
  toast.style.background = isError ? 'linear-gradient(135deg, #991B1B, #DC2626)' : 'linear-gradient(135deg, #065F46, #059669)';
  toast.style.border = isError ? '1px solid #F87171' : '1px solid #34D399';
  toast.innerHTML = (isError ? '⚠️ ' : '☁️ ') + message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 4000);
}

// 6. Submit Skor Kuis / Tugas Praktikum ke Cloud Firestore
window.saveScoreToCloud = function (pertemuan, aktivitas, skor, total, detail = {}) {
  if (!currentStudent.nim) {
    showIdentityModal();
    return;
  }

  window.onCloudSyncReady(async (dbInstance) => {
    const record = {
      nim: currentStudent.nim,
      nama: currentStudent.nama,
      pertemuan: pertemuan,
      aktivitas: aktivitas,
      skor: skor,
      total: total,
      persentase: Math.round((skor / total) * 100),
      detail: detail,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      timestampClient: new Date().toISOString()
    };

    try {
      // Save to 'quiz' collection
      await dbInstance.collection('quiz').add(record);
      console.log(`✓ Skor ${aktivitas} ${pertemuan} berhasil tersimpan di Cloud Firestore!`);
      showCloudToast(`Skor <strong>${aktivitas}</strong> (${skor}/${total}) berhasil tersimpan di Cloud Firestore!`);
    } catch (err) {
      console.error("Gagal menyimpan skor ke cloud:", err);
      showCloudToast(`Gagal menyimpan ke Cloud: ${err.message}. Periksa tab Rules di Firebase!`, true);
    }
  });
};

function isDosenUser(student) {
  if (!student) return false;
  const nim = String(student.nim || '').trim();
  const nama = String(student.nama || '').trim();
  const status = String(student.status || '').trim();
  const group = String(student.classGroup || '').trim();
  return nim === '0206015' ||
         status.toLowerCase() === 'dosen' ||
         group.toLowerCase().includes('dosen') ||
         /dewi\s*febriani|dosen/i.test(nama);
}
window.isDosenUser = isDosenUser;

// 6. REALTIME MULTIPLAYER GAME ROOM ENGINE (P02 Games)
window.RealtimeGameEngine = {
  activeRoomId: 'BMT-ARENA-02',
  listenerUnsubscribe: null,
  leaderboardUnsubscribe: null,

  // Bergabung atau membuat Room Game
  joinRoom: function (roomId, teamName, onUpdateCallback) {
    this.activeRoomId = roomId || 'BMT-ARENA-02';
    // If current student is Dosen, clean up any previous accidental lecturer score from the leaderboard
    if (isDosenUser(currentStudent)) {
      window.onCloudSyncReady(dbInstance => {
        dbInstance.collection('games').doc(this.activeRoomId).collection('players').doc('0206015').delete().catch(()=>{});
      });
    }
    window.onCloudSyncReady(dbInstance => {
      const roomRef = dbInstance.collection('games').doc(this.activeRoomId);

      // Initial setup room if not exists
      roomRef.get().then(doc => {
        if (!doc.exists) {
          roomRef.set({
            created: firebase.firestore.FieldValue.serverTimestamp(),
            teams: {
              'Wadiah': { score: 0, members: 0 },
              'Murabahah': { score: 0, members: 0 },
              'Mudharabah': { score: 0, members: 0 },
              'Ijarah': { score: 0, members: 0 }
            }
          });
        }
      });

      // Realtime listener room
      if (this.listenerUnsubscribe) this.listenerUnsubscribe();
      this.listenerUnsubscribe = roomRef.onSnapshot(doc => {
        if (doc.exists && onUpdateCallback) {
          onUpdateCallback(doc.data());
        }
      }, err => console.error("Error listening room:", err));
    });
  },

  // Tambah Skor Tim
  addTeamScore: function (teamName, points) {
    window.onCloudSyncReady(dbInstance => {
      const roomRef = dbInstance.collection('games').doc(this.activeRoomId);
      const updateObj = {};
      updateObj[`teams.${teamName}.score`] = firebase.firestore.FieldValue.increment(points);
      roomRef.update(updateObj).catch(err => console.error("Error update team score:", err));
    });
  },

  // Submit Skor Individu / Pasangan ke Live Leaderboard
  submitPlayerScore: function (playerScore, comboCount, roundCompleted, gameScoresBreakdown, activeGameIndex) {
    if (!currentStudent.nim) {
      showIdentityModal();
      return;
    }
    // Dosen diproteksi: tidak akan dimasukkan ke papan klasemen mahasiswa
    if (isDosenUser(currentStudent)) {
      console.log("ℹ️ Mode Dosen: Skor tidak dipublikasikan ke papan klasemen mahasiswa.");
      return;
    }
    window.onCloudSyncReady(dbInstance => {
      const roomRef = dbInstance.collection('games').doc(this.activeRoomId);

      const playerEntry = {
        nim: currentStudent.nim,
        nama: currentStudent.nama,
        score: playerScore,
        combo: comboCount,
        round: roundCompleted,
        gameScores: gameScoresBreakdown || null,
        activeGameIndex: activeGameIndex !== undefined ? activeGameIndex : null,
        updatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };

      roomRef.collection('players').doc(currentStudent.nim).set(playerEntry, { merge: true })
        .then(() => console.log("✓ Live score terkirim ke Leaderboard Cloud!"))
        .catch(err => console.error("Error submitting player score:", err));
    });
  },

  // Listen to Top Players Realtime Leaderboard
  listenLeaderboard: function (onLeaderboardChange) {
    window.onCloudSyncReady(dbInstance => {
      if (this.leaderboardUnsubscribe) this.leaderboardUnsubscribe();
      this.leaderboardUnsubscribe = dbInstance.collection('games').doc(this.activeRoomId).collection('players')
        .orderBy('score', 'desc')
        .limit(25)
        .onSnapshot(snapshot => {
          const players = [];
          snapshot.forEach(doc => {
            const p = doc.data();
            // Filter out dosen records
            if (!isDosenUser(p)) {
              players.push(p);
            }
          });
          if (onLeaderboardChange) onLeaderboardChange(players.slice(0, 10));
        }, err => console.error("Error listening leaderboard:", err));
    });
  }
};

// 7. LAB REPORT SUBMISSION ENGINE (DIRECT CLOUD FIRESTORE STORAGE WITH MULTI-MB CHUNKING)
let currentLabFileData = null;

window.handleLabFileSelect = function (e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  // Support up to 10 MB
  if (file.size > 10 * 1024 * 1024) {
    alert("⚠️ Ukuran file (" + (file.size / (1024 * 1024)).toFixed(1) + " MB) melebihi batas maksimal 10 MB. Silakan pilih berkas dokumen yang lebih kecil.");
    e.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function (evt) {
    currentLabFileData = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || 'application/octet-stream',
      fileBase64: evt.target.result
    };

    const promptEl = document.getElementById('labDropPrompt');
    const infoEl = document.getElementById('labFileInfo');
    if (promptEl) promptEl.style.display = 'none';
    if (infoEl) infoEl.style.display = 'flex';

    const nameEl = document.getElementById('labFileName');
    const sizeEl = document.getElementById('labFileSize');
    const iconEl = document.getElementById('labFileIcon');
    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = formatBytes(file.size);

    let icon = '📄';
    if (file.name.endsWith('.pdf')) icon = '📕';
    else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) icon = '📊';
    else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) icon = '📝';
    else if (file.name.endsWith('.zip') || file.name.endsWith('.rar')) icon = '📦';
    else if (file.name.match(/\.(png|jpg|jpeg|webp)$/i)) icon = '🖼️';
    if (iconEl) iconEl.textContent = icon;
  };
  reader.readAsDataURL(file);
};

window.clearLabFile = function () {
  currentLabFileData = null;
  const fileInput = document.getElementById('inputLabFile');
  if (fileInput) fileInput.value = '';
  const promptEl = document.getElementById('labDropPrompt');
  const infoEl = document.getElementById('labFileInfo');
  if (promptEl) promptEl.style.display = 'block';
  if (infoEl) infoEl.style.display = 'none';
};

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

window.submitLabReport = async function (formEvent) {
  if (formEvent) {
    if (typeof formEvent.preventDefault === 'function') formEvent.preventDefault();
    if (typeof formEvent.stopPropagation === 'function') formEvent.stopPropagation();
  }

  // Ensure currentStudent is populated from localStorage if empty
  if (!currentStudent.nim) {
    const savedNim = localStorage.getItem('tazkia_student_nim');
    const savedNama = localStorage.getItem('tazkia_student_nama');
    if (savedNim) {
      currentStudent.nim = savedNim;
      currentStudent.nama = savedNama || '';
    }
  }

  if (!currentStudent.nim || !currentStudent.nama) {
    showIdentityModal();
    return;
  }

  const labAnswer = (document.getElementById('inputLabAnswer')?.value || '').trim();
  const statusArea = document.getElementById('labSubmitStatusArea');
  const resultArea = document.getElementById('labSubmitResultCard');
  const submitBtn = document.getElementById('btnSubmitLab');

  if (!currentLabFileData && !labAnswer) {
    alert("Harap pilih file laporan praktikum atau tulis ringkasan jawaban praktikum Anda terlebih dahulu!");
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Mengunggah berkas ke Cloud Firestore...';
  }
  if (statusArea) {
    statusArea.style.display = 'block';
    statusArea.innerHTML = `
      <div style="background:rgba(56,189,248,.08);border:1px solid rgba(56,189,248,.3);border-radius:10px;padding:16px;text-align:center;color:#38BDF8;font-family:'Source Sans 3',sans-serif">
        <div style="font-size:24px;margin-bottom:6px">⚡</div>
        <div style="font-weight:700;font-size:14px;color:#fff">Menyimpan berkas laporan ke Cloud Firestore...</div>
        <div style="font-size:12px;color:#94A3B8;margin-top:4px">Mohon tunggu sebentar hingga proses selesai.</div>
      </div>
    `;
  }
  if (resultArea) resultArea.style.display = 'none';

  const path = decodeURIComponent(window.location.pathname);
  const pageTitle = document.title || 'Praktikum Digital';
  const courseInfo = detectCurrentCourseInfo() || { code: 'LAB', name: 'Praktikum Terapan' };

  try {
    const dbInstance = await window.getDbInstance();

    let isChunked = false;
    let directBase64 = '';

    if (currentLabFileData && currentLabFileData.fileBase64) {
      if (currentLabFileData.fileBase64.length > 500000) { // > 500 KB string
        isChunked = true;
      } else {
        directBase64 = currentLabFileData.fileBase64;
      }
    }

    const submissionDoc = {
      nim: currentStudent.nim,
      nama: currentStudent.nama,
      mataKuliah: courseInfo.name,
      kodeMK: courseInfo.code,
      labTitle: pageTitle,
      path: path,
      fileName: currentLabFileData ? currentLabFileData.fileName : '',
      fileSize: currentLabFileData ? currentLabFileData.fileSize : 0,
      fileType: currentLabFileData ? currentLabFileData.fileType : '',
      fileBase64: directBase64,
      hasChunks: isChunked,
      totalChunks: 1,
      jawaban: labAnswer,
      status: 'Terkumpul',
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      timestampClient: new Date().toISOString()
    };

    const pMatch = path.match(/Pertemuan[_\-\s%20]*(\d+)/i) || path.match(/P0*(\d+)/i);
    const pNum = pMatch ? ('P' + String(pMatch[1]).padStart(2, '0')) : 'P01';
    const submissionId = `${currentStudent.nim}_${courseInfo.code}_${pNum}`;
    const quizDocId = `lab_${currentStudent.nim}_${courseInfo.code}_${pNum}`;

    // 1. Save / Update to 'lab_submissions'
    const docRef = dbInstance.collection('lab_submissions').doc(submissionId);
    await docRef.set(submissionDoc, { merge: true });

    // If chunked, split into chunks of 400,000 chars and save into subcollection
    if (isChunked && currentLabFileData && currentLabFileData.fileBase64) {
      const raw = currentLabFileData.fileBase64;
      const chunkSize = 400000;
      const numChunks = Math.ceil(raw.length / chunkSize);

      await docRef.update({ totalChunks: numChunks });

      // Batch upload chunks in batches of 10
      for (let i = 0; i < numChunks; i += 10) {
        const batch = dbInstance.batch();
        for (let j = i; j < Math.min(i + 10, numChunks); j++) {
          const chunkData = raw.substring(j * chunkSize, (j + 1) * chunkSize);
          const chunkRef = docRef.collection('chunks').doc('c_' + j);
          batch.set(chunkRef, { index: j, data: chunkData });
        }
        await batch.commit();
      }
    }

    // 2. Also register into 'quiz' collection for gradebook overview (upsert single row per lab)
    await dbInstance.collection('quiz').doc(quizDocId).set({
      nim: currentStudent.nim,
      nama: currentStudent.nama,
      pertemuan: courseInfo.code + ' (' + pNum + ' Lab)',
      aktivitas: 'Laporan ' + pNum + ': ' + (currentLabFileData ? currentLabFileData.fileName : pageTitle.substring(0, 30)),
      skor: 100,
      total: 100,
      persentase: 100,
      passed: true,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      timestampClient: new Date().toISOString()
    }, { merge: true });

    console.log("✓ Laporan praktikum & berkas berhasil tersimpan di Cloud Firestore!");

    if (statusArea) statusArea.style.display = 'none';
    if (resultArea) {
      resultArea.style.display = 'block';
      resultArea.innerHTML = `
        <div style="background:#121826;border:2px solid #10B981;border-radius:12px;padding:22px;color:#fff;box-shadow:0 12px 30px rgba(0,0,0,.5);animation:fadeIn .3s">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:14px;border-bottom:1px solid #22304A;padding-bottom:12px">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:32px">✅</span>
              <div>
                <h3 style="font-family:'Amiri',serif;font-size:22px;color:#fff;margin:0">Laporan Praktikum Berhasil Dikumpulkan!</h3>
                <div style="font-size:12px;color:#94A3B8">Mahasiswa: <strong style="color:#fff">${escapeHtml(currentStudent.nama)} (${escapeHtml(currentStudent.nim)})</strong></div>
              </div>
            </div>
            <span style="background:rgba(16,185,129,.15);color:#34D399;border:1px solid rgba(16,185,129,.3);padding:4px 12px;border-radius:12px;font-size:12px;font-weight:700">TERKUMPUL ✓</span>
          </div>

          <div style="display:grid;gap:8px;font-size:13.5px;color:#CBD5E1">
            ${currentLabFileData ? `<div style="background:#0F172A;padding:10px 14px;border-radius:8px;border:1px solid #1E293B">📁 <strong>Berkas Tersimpan:</strong> <span style="color:#38BDF8">${escapeHtml(currentLabFileData.fileName)}</span> (${formatBytes(currentLabFileData.fileSize)})</div>` : ''}
            ${labAnswer ? `<div style="background:#0F172A;padding:10px 14px;border-radius:8px;border:1px solid #1E293B">📝 <strong>Ringkasan Jawaban:</strong> <span style="color:#94A3B8">${escapeHtml(labAnswer.substring(0, 160))}${labAnswer.length > 160 ? '...' : ''}</span></div>` : ''}
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-top:14px;padding-top:10px;border-top:1px solid #1E293B;font-size:12px;color:#64748B">
            <span>✓ Berkas dan data laporan telah tersimpan langsung di Cloud Firestore Dosen.</span>
            <button type="button" onclick="resetLabSubmitForm()" style="background:transparent;border:1px solid #334155;color:#94A3B8;padding:5px 12px;border-radius:6px;font-size:11.5px;cursor:pointer">Unggah / Ganti Berkas Lain ↺</button>
          </div>
        </div>
      `;
    }

    showCloudToast(`Laporan praktikum <strong>${currentStudent.nama}</strong> berhasil tersimpan ke Cloud!`);

  } catch (err) {
    console.error("Lab upload error:", err);
    if (statusArea) {
      statusArea.style.display = 'block';
      statusArea.innerHTML = `
        <div style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:12px;color:#FCA5A5;font-size:13px">
          ⚠️ Terjadi kendala pengunggahan berkas: ${escapeHtml(err.message || 'Error koneksi')}.
        </div>
      `;
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '📁 Kumpulkan Laporan Praktikum ✓';
    }
  }
};

window.submitLabReportWithAI = window.submitLabReport; // Alias for backward compatibility

window.resetLabSubmitForm = function () {
  const resultArea = document.getElementById('labSubmitResultCard');
  if (resultArea) resultArea.style.display = 'none';
  clearLabFile();
  const ans = document.getElementById('inputLabAnswer');
  if (ans) ans.value = '';
};

// 8. AUTO-INJECT LAB SUBMISSION WIDGET ON PRAKTIKUM PAGES
function mountLabSubmissionWidget() {
  const isLabPage = window.location.pathname.includes('Praktikum-');
  if (!isLabPage) return;

  const existing = document.getElementById('labReportSubmitSection');
  if (existing) return;

  const mainEl = document.querySelector('.main') || document.body;

  const section = document.createElement('div');
  section.id = 'labReportSubmitSection';
  section.style.marginTop = '36px';
  section.innerHTML = `
    <div style="background:linear-gradient(135deg,#0C1D30 0%,#12253A 100%);border:2px solid #1B7898;border-radius:14px;padding:26px 24px;color:#fff;box-shadow:0 10px 30px rgba(0,0,0,.4);font-family:'Source Sans 3',sans-serif">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:14px">
        <span style="font-size:32px">📁</span>
        <div>
          <h3 style="font-family:'Amiri',serif;font-size:23px;color:#fff;margin:0">Pengumpulan Laporan Praktikum Mahasiswa</h3>
          <p style="font-size:13px;color:#94A3B8;margin:2px 0 0">Unggah berkas laporan praktikum Anda dan tuliskan ringkasan hasil kerja. Berkas akan langsung tersimpan di Cloud Firestore Dosen.</p>
        </div>
      </div>

      <form id="labSubmissionForm" onsubmit="submitLabReport(event)" style="display:grid;gap:14px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <label style="display:block;font-size:12px;font-weight:700;color:#CBD5E1;margin-bottom:4px">NIM Mahasiswa:</label>
            <input type="text" id="labStudentNim" value="${currentStudent.nim || ''}" readonly style="width:100%;padding:9px 12px;border-radius:6px;border:1px solid #334155;background:#0F172A;color:#38BDF8;font-weight:700;box-sizing:border-box;font-family:'Source Code Pro',monospace">
          </div>
          <div>
            <label style="display:block;font-size:12px;font-weight:700;color:#CBD5E1;margin-bottom:4px">Nama Lengkap:</label>
            <input type="text" id="labStudentNama" value="${currentStudent.nama || ''}" readonly style="width:100%;padding:9px 12px;border-radius:6px;border:1px solid #334155;background:#0F172A;color:#fff;font-weight:700;box-sizing:border-box">
          </div>
        </div>

        <div>
          <label style="display:block;font-size:12px;font-weight:700;color:#CBD5E1;margin-bottom:6px">📁 Upload File Laporan Praktikum (PDF / Excel / Word / ZIP / Gambar):</label>
          <input type="file" id="inputLabFile" accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.zip,.rar,.png,.jpg,.jpeg,.csv,.txt" style="display:none" onchange="handleLabFileSelect(event)">
          
          <div id="labDropZone" onclick="document.getElementById('inputLabFile').click()" style="border:2px dashed #38BDF8;border-radius:10px;padding:20px;text-align:center;background:rgba(56,189,248,.04);cursor:pointer;transition:all .2s">
            <div id="labDropPrompt">
              <div style="font-size:32px;margin-bottom:4px">📤</div>
              <div style="font-weight:700;font-size:14px;color:#fff">Klik untuk Memilih File Laporan Praktikum</div>
              <div style="font-size:11.5px;color:#94A3B8;margin-top:4px">Format yang didukung: PDF, Word (DOCX), Excel (XLSX), Gambar, ZIP, CSV (Maks. 10 MB)</div>
            </div>
            <div id="labFileInfo" style="display:none;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap">
              <span style="font-size:32px" id="labFileIcon">📄</span>
              <div style="text-align:left">
                <div id="labFileName" style="font-weight:700;color:#38BDF8;font-size:14px"></div>
                <div id="labFileSize" style="font-size:11.5px;color:#94A3B8"></div>
              </div>
              <button type="button" onclick="event.stopPropagation(); clearLabFile();" style="background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);color:#FCA5A5;padding:4px 10px;border-radius:6px;font-size:11.5px;cursor:pointer">Ganti File ↺</button>
            </div>
          </div>
        </div>

        <div>
          <label style="display:block;font-size:12px;font-weight:700;color:#CBD5E1;margin-bottom:4px">📝 Ringkasan Jawaban &amp; Analisis Praktikum:</label>
          <textarea id="inputLabAnswer" rows="4" placeholder="Tuliskan kesimpulan analisis kasus praktikum, query SQL, atau penjelasan DFD/bagan akun di sini..." style="width:100%;padding:10px 12px;border-radius:6px;border:1.5px solid #334155;background:#0F172A;color:#fff;font-size:13.5px;box-sizing:border-box;font-family:inherit;outline:none;resize:vertical"></textarea>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:6px">
          <button type="button" id="btnSubmitLab" onclick="submitLabReport(event)" style="background:linear-gradient(135deg,#0284C7,#0EA5E9);color:#fff;border:none;border-radius:8px;padding:12px 24px;font-size:14px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 16px rgba(14,165,233,.3);transition:all .15s">
            <span>📁 Kumpulkan Laporan Praktikum ✓</span>
          </button>
          <span style="font-size:12px;color:#94A3B8">File otomatis tersimpan ke Cloud Firestore Tazkia</span>
        </div>
      </form>

      <div id="labSubmitStatusArea" style="margin-top:16px;display:none"></div>
      <div id="labSubmitResultCard" style="margin-top:16px;display:none"></div>
    </div>
  `;

  mainEl.appendChild(section);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountLabSubmissionWidget);
} else {
  mountLabSubmissionWidget();
}

