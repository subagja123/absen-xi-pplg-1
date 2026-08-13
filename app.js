/**
 * Absen Kelas XI PPLG 1 — Attendance App
 * Modular vanilla JS with localStorage persistence
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
  { id: 's01', name: 'Ahmad Fauzi',       initials: 'AF' },
  { id: 's02', name: 'Budi Santoso',      initials: 'BS' },
  { id: 's03', name: 'Citra Dewi',        initials: 'CD' },
  { id: 's04', name: 'Dian Pratama',      initials: 'DP' },
  { id: 's05', name: 'Eka Putri',         initials: 'EP' },
  { id: 's06', name: 'Fajar Nugroho',     initials: 'FN' },
  { id: 's07', name: 'Gita Maharani',     initials: 'GM' },
  { id: 's08', name: 'Hadi Wijaya',       initials: 'HW' },
  { id: 's09', name: 'Indah Lestari',     initials: 'IL' },
  { id: 's10', name: 'Joko Susilo',       initials: 'JS' },
  { id: 's11', name: 'Kartika Sari',      initials: 'KS' },
  { id: 's12', name: 'Lutfi Rahman',      initials: 'LR' },
  { id: 's13', name: 'Maya Anggraini',    initials: 'MA' },
  { id: 's14', name: 'Nanda Pratama',     initials: 'NP' },
  { id: 's15', name: 'Oki Saputra',       initials: 'OS' },
];

// ── State ──────────────────────────────────────────────────────────────────

let selectedDate = getTodayISO();
let activeStudentId = null;

// ── DOM References ─────────────────────────────────────────────────────────

const els = {
  dateSelector:   document.getElementById('date-selector'),
  statsSection:   document.getElementById('stats-section'),
  carouselTrack:  document.getElementById('carousel-track'),
  attendanceGrid: document.getElementById('attendance-grid'),
  selectedDateLabel: document.getElementById('selected-date-label'),
  historyBody:    document.getElementById('history-body'),
  historyEmpty:   document.getElementById('history-empty'),
  historyCount:   document.getElementById('history-count'),
  modalOverlay:   document.getElementById('modal-overlay'),
  modalPanel:     document.getElementById('modal-panel'),
  modalAvatar:    document.getElementById('modal-avatar'),
  modalName:      document.getElementById('modal-student-name'),
  modalStudentId: document.getElementById('modal-student-id'),
  modalDateLabel: document.getElementById('modal-date-label'),
  modalStatusBtns: document.getElementById('modal-status-buttons'),
  modalClose:     document.getElementById('modal-close'),
  modalClear:     document.getElementById('modal-clear'),
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
  const [y, m, d] = iso.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return `${days[date.getDay()]}, ${d} ${months[Number(m) - 1]} ${y}`;
}

function isToday(iso) {
  return iso === getTodayISO();
}

// ── Storage ────────────────────────────────────────────────────────────────

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

function setStudentStatus(date, studentId, status) {
  const all = loadAllRecords();
  if (!all[date]) all[date] = {};

  if (status === null) {
    delete all[date][studentId];
    if (Object.keys(all[date]).length === 0) delete all[date];
  } else {
    all[date][studentId] = status;
  }

  saveAllRecords(all);
}

function getStudentStatus(date, studentId) {
  return getDayRecord(date)[studentId] || null;
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

// ── Render: Stats ──────────────────────────────────────────────────────────

function renderStats() {
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

// ── Render: Student Card HTML ───────────────────────────────────────────────

function buildStudentCard(student, date) {
  const status = getStudentStatus(date, student.id);
  const meta = getStatusMeta(status);

  return `
    <article
      class="student-card flex-shrink-0 w-56 sm:w-64 bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
      data-student-id="${student.id}"
      tabindex="0"
      role="button"
      aria-label="Absen ${student.name}"
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
  const cards = STUDENTS.map((s) => buildStudentCard(s, selectedDate)).join('');
  els.carouselTrack.innerHTML = cards + cards;

  els.carouselTrack.querySelectorAll('.student-card').forEach((card) => {
    card.addEventListener('click', () => openModal(card.dataset.studentId));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card.dataset.studentId);
      }
    });
    card.addEventListener('mouseenter', () => els.carouselTrack.classList.add('paused'));
    card.addEventListener('mouseleave', () => els.carouselTrack.classList.remove('paused'));
  });
}

// ── Render: Attendance Grid ────────────────────────────────────────────────

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
  const label = isToday(selectedDate)
    ? `Hari ini — ${formatDateDisplay(selectedDate)}`
    : formatDateDisplay(selectedDate);

  els.selectedDateLabel.textContent = label;

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
      refreshUI();
    });
  });
}

// ── Render: History ──────────────────────────────────────────────────────────

function renderHistory() {
  const all = loadAllRecords();
  const dates = Object.keys(all).sort((a, b) => b.localeCompare(a));

  els.historyCount.textContent = `${dates.length} hari tercatat`;

  if (dates.length === 0) {
    els.historyBody.innerHTML = '';
    els.historyEmpty.classList.remove('hidden');
    return;
  }

  els.historyEmpty.classList.add('hidden');

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
      els.dateSelector.value = selectedDate;
      refreshUI();
      document.getElementById('attendance-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ── Modal ───────────────────────────────────────────────────────────────────

function openModal(studentId) {
  const student = STUDENTS.find((s) => s.id === studentId);
  if (!student) return;

  activeStudentId = studentId;

  els.modalAvatar.textContent = student.initials;
  els.modalName.textContent = student.name;
  els.modalStudentId.textContent = `NIS / ID: ${student.id.toUpperCase()}`;
  els.modalDateLabel.textContent = formatDateDisplay(selectedDate);

  els.modalStatusBtns.innerHTML = buildStatusButtons(studentId, selectedDate);

  els.modalStatusBtns.querySelectorAll('.status-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const { status } = btn.dataset;
      const current = getStudentStatus(selectedDate, studentId);
      setStudentStatus(selectedDate, studentId, current === status ? null : status);
      refreshUI();
      openModal(studentId);
    });
  });

  els.modalOverlay.classList.remove('hidden');
  els.modalOverlay.classList.add('flex');
  els.modalOverlay.setAttribute('aria-hidden', 'false');

  requestAnimationFrame(() => {
    els.modalPanel.classList.remove('scale-95', 'opacity-0');
    els.modalPanel.classList.add('scale-100', 'opacity-100');
  });
}

function closeModal() {
  els.modalPanel.classList.remove('scale-100', 'opacity-100');
  els.modalPanel.classList.add('scale-95', 'opacity-0');
  els.modalOverlay.setAttribute('aria-hidden', 'true');

  setTimeout(() => {
    els.modalOverlay.classList.add('hidden');
    els.modalOverlay.classList.remove('flex');
    activeStudentId = null;
  }, 200);
}

// ── Refresh & Init ──────────────────────────────────────────────────────────

function refreshUI() {
  renderStats();
  renderCarousel();
  renderAttendanceGrid();
  renderHistory();
}

function initDateSelector() {
  els.dateSelector.value = selectedDate;
  els.dateSelector.max = getTodayISO();

  els.dateSelector.addEventListener('change', (e) => {
    selectedDate = e.target.value || getTodayISO();
    refreshUI();
  });
}

function initModal() {
  els.modalClose.addEventListener('click', closeModal);

  els.modalClear.addEventListener('click', () => {
    if (activeStudentId) {
      setStudentStatus(selectedDate, activeStudentId, null);
      refreshUI();
      openModal(activeStudentId);
    }
  });

  els.modalOverlay.addEventListener('click', (e) => {
    if (e.target === els.modalOverlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !els.modalOverlay.classList.contains('hidden')) {
      closeModal();
    }
  });
}

function checkDailyReset() {
  const today = getTodayISO();
  const lastVisit = localStorage.getItem(`${STORAGE_KEY}-last-visit`);

  if (lastVisit && lastVisit !== today) {
    selectedDate = today;
    els.dateSelector.value = today;
  }

  localStorage.setItem(`${STORAGE_KEY}-last-visit`, today);
}

function init() {
  checkDailyReset();
  initDateSelector();
  initModal();
  refreshUI();
}

document.addEventListener('DOMContentLoaded', init);
