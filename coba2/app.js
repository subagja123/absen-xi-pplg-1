/**
 * Absen Kelas XI PPLG 1 — Attendance App
 * Integrated with Firebase Realtime Database
 */

// ── Constants ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'xi-pplg-1-attendance';

const STATUS = {
  hadir: { label: 'Hadir', badge: 'bg-green-100 text-green-700 ring-green-200', dot: 'bg-green-500' },
  sakit: { label: 'Sakit', badge: 'bg-yellow-100 text-yellow-700 ring-yellow-200', dot: 'bg-yellow-500' },
  izin:  { label: 'Izin',  badge: 'bg-blue-100 text-blue-700 ring-blue-200',     dot: 'bg-blue-500' },
  alfa:  { label: 'Alfa',  badge: 'bg-red-100 text-red-700 ring-red-200',         dot: 'bg-red-500' },
};

const STUDENTS = [
  { id: 's01', name: 'Aira Suci Halifah', initials: 'AS' },
  { id: 's02', name: 'Aldrich Evan Antonio Hans Sagala', initials: 'AE' },
  { id: 's03', name: 'Alexander Aprilianto', initials: 'AA' },
  { id: 's04', name: 'Alexander Tibalia', initials: 'AT' },
  { id: 's05', name: 'Aulia Putri Ramadhani', initials: 'AP' },
  { id: 's06', name: 'Azuan Zah Razhan', initials: 'AZ' },
  { id: 's07', name: 'Candra', initials: 'C' },
  { id: 's08', name: 'Danopan Sidik Agustian Putra', initials: 'DS' },
  { id: 's09', name: 'Ghaitsa Syakirah Khairunnisa', initials: 'GS' },
  { id: 's10', name: 'Ilma Zaina Aisyi', initials: 'IZ' },
  { id: 's11', name: 'Isbat Purwaraga Budiman', initials: 'IP' },
  { id: 's12', name: 'Julius Gideo Harefa', initials: 'JG' },
  { id: 's13', name: 'Leni Nirmala', initials: 'LN' },
  { id: 's14', name: 'Lisnawati', initials: 'L' },
  { id: 's15', name: 'M.Fajar Herdiansyah', initials: 'FH' },
  { id: 's16', name: 'M.Fazri Syahnur Agustian', initials: 'FS' },
  { id: 's17', name: 'Marlan Maulana', initials: 'MM' },
  { id: 's18', name: 'Meysa Nuralifiani', initials: 'MN' },
  { id: 's19', name: 'Muhammad Faisal Raahil', initials: 'MR' },
  { id: 's20', name: 'Muhammad Kautsar AkmalFadlurrahman', initials: 'MK' },
  { id: 's21', name: 'Muhammad Rafi', initials: 'MR' },
  { id: 's22', name: 'Muhammad Rafli', initials: 'MR' },
  { id: 's23', name: 'Muhammad Wildansyah', initials: 'MW' },
  { id: 's24', name: 'Nadila Arina Wati', initials: 'NW' },
  { id: 's25', name: 'Nayla Dwi Santang ', initials: 'NS' },
  { id: 's26', name: 'Neng Siti Rosmawati', initials: 'NS' },
  { id: 's27', name: 'Raganata Wijaksana', initials: 'RW' },
  { id: 's28', name: 'Rahma Kayla', initials: 'RK' },
  { id: 's29', name: 'Ratih', initials: 'R' },
  { id: 's30', name: 'Rezky Pratama Putra', initials: 'RP' },
  { id: 's31', name: 'Rifky Saputra', initials: 'RS' },
  { id: 's32', name: 'Rizki Hadi Maulana', initials: 'RM' },
  { id: 's33', name: 'Rizquina Al Haira', initials: 'RH' },
  { id: 's34', name: 'Shafwan Muhammad Isham', initials: 'SI' },
  { id: 's35', name: 'Supartika', initials: 'S' },
  { id: 's36', name: 'Tesa Tralia Patusha', initials: 'TP' },
  { id: 's37', name: 'Widiayanti', initials: 'W' },
  { id: 's38', name: 'Wulan Patarani', initials: 'WP' },
];

// ── State ──────────────────────────────────────────────────────────────────

let selectedDate = getTodayISO();
let activeStudentId = null;

// ── DOM References ─────────────────────────────────────────────────────────

const els = {
  dateSelector: document.getElementById('date-selector'),
  statsSection: document.getElementById('stats-section'),
  carouselTrack: document.getElementById('carousel-track'),
  attendanceGrid: document.getElementById('attendance-grid'),
  selectedDateLabel: document.getElementById('selected-date-label'),
  historyBody: document.getElementById('history-body'),
  historyEmpty: document.getElementById('history-empty'),
  historyCount: document.getElementById('history-count'),
  modalOverlay: document.getElementById('modal-overlay'),
  modalPanel: document.getElementById('modal-panel'),
  modalAvatar: document.getElementById('modal-avatar'),
  modalName: document.getElementById('modal-student-name'),
  modalStudentId: document.getElementById('modal-student-id'),
  modalDateLabel: document.getElementById('modal-date-label'),
  modalStatusBtns: document.getElementById('modal-status-buttons'),
  modalClose: document.getElementById('modal-close'),
  modalClear: document.getElementById('modal-clear'),
};

// ── Date Utilities ─────────────────────────────────────────────────────────

function getTodayISO() {
  const now = new Date();
  return formatDateISO(now);
}

function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateDisplay(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return `${days[date.getDay()]}, ${d} ${months[Number(m) - 1]} ${y}`;
}

function isToday(iso) {
  return iso === getTodayISO();
}

// ── Storage & Firebase Helper Functions ────────────────────────────────────

function loadAllRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAllRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function getDayRecord(date) {
  const all = loadAllRecords();
  return all[date] || {};
}

function getStudentStatus(date, studentId) {
  return getDayRecord(date)[studentId] || null;
}

function setStudentStatus(date, studentId, status) {
  const all = loadAllRecords();
  if (!all[date]) all[date] = {};

  if (status === null) {
    delete all[date][studentId];
    if (Object.keys(all[date]).length === 0) delete all[date];
  } else {
    all[date][studentId] = status;
  }

  // 1. Simpan ke Local Storage
  saveAllRecords(all);

  // 2. Kirim ke Firebase Realtime Database
  if (window.firebaseDB && window.dbSet && window.dbRef) {
    const pathRef = window.dbRef(window.firebaseDB, `attendance/${date}`);
    if (all[date]) {
      window.dbSet(pathRef, all[date]);
    } else {
      window.dbRemove(pathRef);
    }
  }

  refreshUI();
}

function initFirebaseSync() {
  if (window.firebaseDB && window.dbOnValue && window.dbRef) {
    const attendanceRef = window.dbRef(window.firebaseDB, 'attendance');
    
    // Menerima update data realtime dari Firebase
    window.dbOnValue(attendanceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        saveAllRecords(data);
      } else {
        saveAllRecords({});
      }
      refreshUI();
    });
  }
}

// ── Status Helpers ─────────────────────────────────────────────────────────

function getStatusMeta(status) {
  if (status && STATUS[status]) return STATUS[status];
  return { label: 'Belum Absen', badge: 'bg-slate-100 text-slate-500 ring-slate-200', dot: 'bg-slate-300' };
}

function countByStatus(date) {
  const record = getDayRecord(date);
  const counts = { hadir: 0, sakit: 0, izin: 0, alfa: 0, belum: 0 };

  STUDENTS.forEach((s) => {
    const st = record[s.id];
    if (st && counts[st] !== undefined) counts[st]++;
    else counts.belum++;
  });

  return counts;
}

// ── Render Functions ───────────────────────────────────────────────────────

function renderStats() {
  if (!els.statsSection) return;
  const counts = countByStatus(selectedDate);
  const cards = [
    { key: 'hadir', label: 'Hadir', color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
    { key: 'sakit', label: 'Sakit', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100' },
    { key: 'izin',  label: 'Izin',  color: 'text-blue-600',  bg: 'bg-blue-50 border-blue-100' },
    { key: 'alfa',  label: 'Alfa',  color: 'text-red-600',   bg: 'bg-red-50 border-red-100' },
  ];

  els.statsSection.innerHTML = cards.map((c) => `
    <div class="rounded-xl border ${c.bg} p-4 text-center shadow-sm">
      <p class="text-2xl sm:text-3xl font-bold ${c.color}">${counts[c.key]}</p>
      <p class="text-xs sm:text-sm font-medium text-slate-600 mt-1">${c.label}</p>
    </div>
  `).join('');
}

function buildStudentCard(student, date) {
  const status = getStudentStatus(date, student.id);
  const meta = getStatusMeta(status);

  return `
    <article
      class="student-card flex-shrink-0 w-56 sm:w-64 bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
      data-student-id="${student.id}"
      tabindex="0"
      role="button"
    >
      <div class="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
      <div class="p-5 flex flex-col items-center text-center">
        <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-white mb-3 group-hover:scale-105 transition-transform">
          ${student.initials}
        </div>
        <h3 class="font-semibold text-slate-800 text-base leading-tight">${student.name}</h3>
        <p class="text-xs text-slate-400 mt-0.5 mb-3">${student.id.toUpperCase()}</p>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ring-1 ${meta.badge}">
          <span class="w-2 h-2 rounded-full ${meta.dot}"></span>
          ${meta.label}
        </span>
      </div>
    </article>
  `;
}

function renderCarousel() {
  if (!els.carouselTrack) return;
  const cards = STUDENTS.map((s) => buildStudentCard(s, selectedDate)).join('');
  els.carouselTrack.innerHTML = cards + cards;

  els.carouselTrack.querySelectorAll('.student-card').forEach((card) => {
    card.addEventListener('click', () => openModal(card.dataset.studentId));
  });
}

function buildStatusButtons(studentId, date, compact = false) {
  const current = getStudentStatus(date, studentId);

  return Object.entries(STATUS).map(([key, meta]) => {
    const active = current === key;
    const size = compact ? 'py-2 px-2 text-xs' : 'py-2.5 px-3 text-sm';
    return `
      <button
        type="button"
        data-student-id="${studentId}"
        data-status="${key}"
        class="status-btn ${size} font-semibold rounded-xl border-2 transition-all
          ${active
            ? `${meta.badge} border-current ring-2 ring-offset-1 ring-current/30 scale-[1.02]`
            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}"
      >
        ${meta.label}
      </button>
    `;
  }).join('');
}

function renderAttendanceGrid() {
  if (!els.attendanceGrid) return;
  if (els.selectedDateLabel) {
    els.selectedDateLabel.textContent = isToday(selectedDate)
      ? `Hari ini — ${formatDateDisplay(selectedDate)}`
      : formatDateDisplay(selectedDate);
  }

  els.attendanceGrid.innerHTML = STUDENTS.map((student) => {
    const status = getStudentStatus(selectedDate, student.id);
    const meta = getStatusMeta(status);

    return `
      <div class="rounded-xl border border-slate-200 p-4 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            ${student.initials}
          </div>
          <div class="min-w-0">
            <p class="font-semibold text-slate-800 truncate">${student.name}</p>
            <span class="inline-flex items-center gap-1 text-xs font-medium ${meta.badge} px-2 py-0.5 rounded-full mt-0.5">
              <span class="w-1.5 h-1.5 rounded-full ${meta.dot}"></span>
              ${meta.label}
            </span>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          ${buildStatusButtons(student.id, selectedDate, true)}
        </div>
      </div>
    `;
  }).join('');

  els.attendanceGrid.querySelectorAll('.status-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const { studentId, status } = btn.dataset;
      const current = getStudentStatus(selectedDate, studentId);
      setStudentStatus(selectedDate, studentId, current === status ? null : status);
    });
  });
}

function renderHistory() {
  if (!els.historyBody) return;
  const all = loadAllRecords();
  const dates = Object.keys(all).sort((a, b) => b.localeCompare(a));

  if (els.historyCount) els.historyCount.textContent = `${dates.length} hari tercatat`;

  if (dates.length === 0) {
    els.historyBody.innerHTML = '';
    if (els.historyEmpty) els.historyEmpty.classList.remove('hidden');
    return;
  }

  if (els.historyEmpty) els.historyEmpty.classList.add('hidden');

  els.historyBody.innerHTML = dates.map((date) => {
    const counts = countByStatus(date);
    const todayBadge = isToday(date)
      ? '<span class="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Hari ini</span>'
      : '';

    return `
      <tr class="border-t border-slate-100 hover:bg-slate-50/80 transition-colors">
        <td class="px-5 py-3 font-medium text-slate-700 whitespace-nowrap">
          ${formatDateDisplay(date)}${todayBadge}
        </td>
        <td class="text-center px-3 py-3 text-green-700 font-semibold">${counts.hadir}</td>
        <td class="text-center px-3 py-3 text-yellow-700 font-semibold">${counts.sakit}</td>
        <td class="text-center px-3 py-3 text-blue-700 font-semibold">${counts.izin}</td>
        <td class="text-center px-3 py-3 text-red-700 font-semibold">${counts.alfa}</td>
        <td class="text-center px-3 py-3 text-slate-400 font-semibold">${counts.belum}</td>
        <td class="text-right px-5 py-3">
          <button
            type="button"
            class="history-view-btn text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            data-date="${date}"
          >
            Lihat / Edit
          </button>
        </td>
      </tr>
    `;
  }).join('');

  els.historyBody.querySelectorAll('.history-view-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedDate = btn.dataset.date;
      if (els.dateSelector) els.dateSelector.value = selectedDate;
      refreshUI();
    });
  });
}

function refreshUI() {
  renderStats();
  renderCarousel();
  renderAttendanceGrid();
  renderHistory();
}

// ── Modal Handlers ─────────────────────────────────────────────────────────

function openModal(studentId) {
  const student = STUDENTS.find((s) => s.id === studentId);
  if (!student || !els.modalOverlay) return;

  activeStudentId = studentId;

  if (els.modalAvatar) els.modalAvatar.textContent = student.initials;
  if (els.modalName) els.modalName.textContent = student.name;
  if (els.modalStudentId) els.modalStudentId.textContent = `NIS / ID: ${student.id.toUpperCase()}`;
  if (els.modalDateLabel) els.modalDateLabel.textContent = formatDateDisplay(selectedDate);

  if (els.modalStatusBtns) {
    els.modalStatusBtns.innerHTML = buildStatusButtons(studentId, selectedDate);
    els.modalStatusBtns.querySelectorAll('.status-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const { status } = btn.dataset;
        const current = getStudentStatus(selectedDate, studentId);
        setStudentStatus(selectedDate, studentId, current === status ? null : status);
        openModal(studentId);
      });
    });
  }

  els.modalOverlay.classList.remove('hidden');
  els.modalOverlay.classList.add('flex');
}

function closeModal() {
  if (!els.modalOverlay) return;
  els.modalOverlay.classList.add('hidden');
  els.modalOverlay.classList.remove('flex');
  activeStudentId = null;
}

// ── Initialization ─────────────────────────────────────────────────────────

function init() {
  if (els.dateSelector) {
    els.dateSelector.value = selectedDate;
    els.dateSelector.addEventListener('change', (e) => {
      selectedDate = e.target.value || getTodayISO();
      refreshUI();
    });
  }

  if (els.modalClose) els.modalClose.addEventListener('click', closeModal);
  if (els.modalClear) {
    els.modalClear.addEventListener('click', () => {
      if (activeStudentId) {
        setStudentStatus(selectedDate, activeStudentId, null);
        openModal(activeStudentId);
      }
    });
  }

  refreshUI();
  initFirebaseSync();
}

document.addEventListener('DOMContentLoaded', init);