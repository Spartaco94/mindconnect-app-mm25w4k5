'use strict';

const DB_KEY = 'mindconnect_data';

function getDB() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY) || '{}');
  } catch { return {}; }
}
function saveDB(db) { localStorage.setItem(DB_KEY, JSON.stringify(db)); }
function ensureArrays(db) {
  if (!db.moods) db.moods = [];
  if (!db.journals) db.journals = [];
  if (!db.meditations) db.meditations = [];
  if (!db.breathing) db.breathing = [];
  if (!db.settings) db.settings = {};
  return db;
}

/* ========== NAVIGATION ========== */
let currentPage = 'home';

function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (el) { el.classList.add('active'); currentPage = page; }
  const link = document.querySelector('.nav-link[data-page="' + page + '"]');
  if (link) link.classList.add('active');
  document.getElementById('navLinks').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (page === 'stats') renderStats();
  if (page === 'journal') renderJournal();
  if (page === 'meditate') renderMeditations();
  if (page === 'resources') renderResources();
  if (page === 'home') renderHome();
}

function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

function toggleTheme() {
  const body = document.body;
  const theme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  body.setAttribute('data-theme', theme);
  document.getElementById('themeIcon').textContent = theme === 'dark' ? '☀️' : '🌙';
  const db = getDB(); db.settings = db.settings || {}; db.settings.theme = theme; saveDB(db);
}

/* ========== HOME ========== */
function renderHome() {
  const hour = new Date().getHours();
  let greet = 'Buongiorno! ☀️';
  if (hour >= 18) greet = 'Buonasera! 🌙';
  else if (hour >= 13) greet = 'Buon pomeriggio! 🌤️';
  document.getElementById('greeting').textContent = greet;

  const tips = [
    '"La mente è tutto. Ciò che pensi, diventi." — Buddha',
    'Prova a dedicare 5 minuti oggi alla respirazione consapevole.',
    'Scrivi 3 cose per cui sei grato. La gratitudine trasforma la percezione.',
    '"Non puoi fermare le onde, ma puoi imparare a surfare." — Jon Kabat-Zinn',
    'Fai una passeggiata di 10 minuti nella natura. Il verde riduce lo stress.',
    'Bevi un bicchiere d\'acqua e fai 3 respiri profondi. Ora.',
    '"La felicità non è qualcosa di già pronto. Viene dalle tue azioni." — Dalai Lama',
    'Oggi prova a disconnetterti per 30 minuti. Il tuo cervello ti ringrazierà.',
    'Pratica l\'ascolto attivo: nella prossima conversazione, ascolta senza pensare alla risposta.',
    '"Ogni mattina rinasciamo. Ciò che facciamo oggi è ciò che conta di più."',
    'Prova il body scan: chiudi gli occhi e porta attenzione ad ogni parte del corpo per 2 minuti.',
    'Sorridi a uno sconosciuto oggi. La gentilezza è contagiosa.',
    '"La pace viene da dentro. Non cercarla fuori." — Buddha',
    'Stasera spegni gli schermi 30 minuti prima di dormire.'
  ];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  document.getElementById('dailyTip').textContent = tips[dayOfYear % tips.length];

  updateStreak();
}

let selectedMood = null;
function selectMood(mood, emoji) {
  selectedMood = { mood, emoji };
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  const btn = document.querySelector('.mood-btn[data-mood="' + mood + '"]');
  if (btn) btn.classList.add('selected');
  document.getElementById('moodNoteArea').style.display = 'flex';
  document.getElementById('moodSavedMsg').style.display = 'none';
}

function saveMoodEntry() {
  if (!selectedMood) return;
  const db = ensureArrays(getDB());
  db.moods.push({
    mood: selectedMood.mood,
    emoji: selectedMood.emoji,
    note: document.getElementById('moodNote').value.trim(),
    date: new Date().toISOString()
  });
  saveDB(db);
  document.getElementById('moodNote').value = '';
  document.getElementById('moodNoteArea').style.display = 'none';
  document.getElementById('moodSavedMsg').style.display = 'block';
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  selectedMood = null;
  setTimeout(() => { document.getElementById('moodSavedMsg').style.display = 'none'; }, 2000);
  updateStreak();
}

function updateStreak() {
  const db = ensureArrays(getDB());
  let streak = 0;
  const today = new Date(); today.setHours(0,0,0,0);
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const hasActivity = db.moods.some(m => m.date.startsWith(ds)) ||
                        db.journals.some(j => j.date.startsWith(ds)) ||
                        db.meditations.some(m => m.date.startsWith(ds)) ||
                        db.breathing.some(b => b.date.startsWith(ds));
    if (hasActivity) streak++;
    else if (i > 0) break;
  }
  document.getElementById('streakCount').textContent = streak;
}

/* ========== MEDITATIONS ========== */
const meditations = [
  { id: 1, title: 'Rilassamento Profondo', desc: 'Rilascia la tensione dal corpo, un muscolo alla volta.', emoji: '🌿', category: 'anxiety', duration: 5, steps: ['Chiudi gli occhi e fai 3 respiri profondi','Porta attenzione ai piedi, rilascia la tensione','Sali alle gambe, rilascia ogni muscolo','Rilassa addome e petto','Rilascia spalle e collo','Rilassa il viso, la mandibola, la fronte','Senti il corpo leggero e rilassato','Resta in questo stato di pace'] },
  { id: 2, title: 'Focus & Concentrazione', desc: 'Affina la mente per essere più produttivo.', emoji: '🎯', category: 'focus', duration: 7, steps: ['Siediti in posizione comoda','Porta attenzione al respiro naturale','Conta ogni espirazione da 1 a 10','Se perdi il conto, ricomincia da 1','Ora visualizza un punto luminoso','Concentra tutta l\'attenzione su quel punto','Espandi la luce a tutto il corpo','Apri gli occhi, sei concentrato e presente'] },
  { id: 3, title: 'Sonno Profondo', desc: 'Preparati per un sonno rigenerante e tranquillo.', emoji: '🌙', category: 'sleep', duration: 10, steps: ['Sdraiati comodamente','Chiudi gli occhi, respira lentamente','Immagina un luogo sicuro e tranquillo','Senti il calore avvolgerti','Ogni respiro ti porta più in profondità','Il corpo diventa pesante e rilassato','Lascia andare ogni pensiero','Dormi...'] },
  { id: 4, title: 'Energia Mattutina', desc: 'Inizia la giornata con energia e positività.', emoji: '☀️', category: 'morning', duration: 5, steps: ['Siediti con la schiena dritta','Fai 3 respiri energizzanti','Visualizza la giornata ideale','Senti energia positiva in ogni cellula','Ripeti: "Oggi sarà una grande giornata"','Sorridi e senti la gratitudine','Muovi lentamente le dita','Apri gli occhi, sei pronto!'] },
  { id: 5, title: 'Anti-Ansia', desc: 'Calma la mente quando l\'ansia prende il sopravvento.', emoji: '🦋', category: 'anxiety', duration: 8, steps: ['Riconosci l\'ansia senza giudicarla','Inspira contando fino a 4','Trattieni contando fino a 4','Espira contando fino a 6','Ripeti per 3 cicli','Scansiona il corpo per la tensione','Rilascia ogni area tesa','Ripeti: "Sono al sicuro, questo passerà"'] },
  { id: 6, title: 'Gratitudine Profonda', desc: 'Coltiva la gratitudine per trasformare la tua giornata.', emoji: '💛', category: 'morning', duration: 5, steps: ['Chiudi gli occhi e sorridi','Pensa a una persona che ami','Senti la gratitudine nel cuore','Pensa a un\'opportunità della tua vita','Ringrazia il tuo corpo per ciò che fa','Ringrazia la mente per la sua forza','Espandi questa gratitudine al mondo','Porta questa sensazione nella giornata'] },
  { id: 7, title: 'Body Scan', desc: 'Esplora il corpo con consapevolezza, rilascia la tensione.', emoji: '🫧', category: 'anxiety', duration: 10, steps: ['Sdraiati o siediti comodamente','Porta attenzione alla sommità della testa','Scendi alla fronte, occhi, mandibola','Esplora collo e spalle','Senti braccia e mani','Porta attenzione al torso','Scendi a fianchi, gambe, ginocchia','Finisci ai piedi, senti tutto il corpo unito'] },
  { id: 8, title: 'Visualizzazione Creativa', desc: 'Stimola la creatività attraverso la visualizzazione.', emoji: '🎨', category: 'focus', duration: 7, steps: ['Chiudi gli occhi e rilassati','Immagina una tela bianca','Dipingi con la mente i tuoi sogni','Aggiungi colori vivaci e dettagli','Senti le emozioni della tua visione','Rendi tutto più luminoso e reale','Porta un elemento nella realtà','Apri gli occhi con nuova ispirazione'] },
  { id: 9, title: 'Meditazione del Lago', desc: 'Trova la calma interiore come un lago immobile.', emoji: '🏔️', category: 'sleep', duration: 8, steps: ['Immagina un lago di montagna','L\'acqua è perfettamente immobile','Riflette il cielo e le montagne','I pensieri sono come sassi nell\'acqua','Creano onde che poi si calmano','Tu sei il lago, profondo e calmo','Nulla disturba la tua profondità','Resta in questa quiete perfetta'] }
];

function renderMeditations(filter) {
  filter = filter || 'all';
  const grid = document.getElementById('medGrid');
  const filtered = filter === 'all' ? meditations : meditations.filter(m => m.category === filter);
  grid.innerHTML = filtered.map(m => `
    <div class="med-card" onclick="openMeditation(${m.id})">
      <span class="med-emoji">${m.emoji}</span>
      <h3>${m.title}</h3>
      <p>${m.desc}</p>
      <div class="med-meta">
        <span class="med-tag">${m.category}</span>
        <span class="med-time">${m.duration} min</span>
      </div>
    </div>`).join('');
}

function filterMeditations(cat) {
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  event.target.classList.add('active');
  renderMeditations(cat);
}

let medTimer = null;
let medSeconds = 0;
let medTotalSeconds = 0;
let medPlaying = false;
let currentMed = null;

function openMeditation(id) {
  currentMed = meditations.find(m => m.id === id);
  if (!currentMed) return;
  document.getElementById('playerEmoji').textContent = currentMed.emoji;
  document.getElementById('playerTitle').textContent = currentMed.title;
  document.getElementById('playerDesc').textContent = currentMed.desc;
  medTotalSeconds = currentMed.duration * 60;
  medSeconds = medTotalSeconds;
  medPlaying = false;
  updateTimerDisplay();
  renderMedSteps(-1);
  document.getElementById('playPauseBtn').textContent = '▶';
  document.getElementById('medPlayer').style.display = 'flex';
}

function closeMedPlayer() {
  if (medTimer) clearInterval(medTimer);
  medPlaying = false;
  document.getElementById('medPlayer').style.display = 'none';
}

function toggleMeditation() {
  if (medPlaying) {
    clearInterval(medTimer);
    medPlaying = false;
    document.getElementById('playPauseBtn').textContent = '▶';
  } else {
    medPlaying = true;
    document.getElementById('playPauseBtn').textContent = '⏸';
    medTimer = setInterval(() => {
      medSeconds--;
      updateTimerDisplay();
      const stepIdx = Math.floor((1 - medSeconds / medTotalSeconds) * currentMed.steps.length);
      renderMedSteps(Math.min(stepIdx, currentMed.steps.length - 1));
      if (medSeconds <= 0) {
        clearInterval(medTimer);
        medPlaying = false;
        document.getElementById('playPauseBtn').textContent = '✓';
        const db = ensureArrays(getDB());
        db.meditations.push({ id: currentMed.id, title: currentMed.title, duration: currentMed.duration, date: new Date().toISOString() });
        saveDB(db);
      }
    }, 1000);
  }
}

function updateTimerDisplay() {
  const m = Math.floor(medSeconds / 60);
  const s = medSeconds % 60;
  document.getElementById('timerText').textContent = m + ':' + String(s).padStart(2, '0');
  const progress = 1 - (medSeconds / medTotalSeconds);
  const circumference = 2 * Math.PI * 90;
  document.getElementById('timerProgress').style.strokeDashoffset = circumference * (1 - progress);
}

function renderMedSteps(currentIdx) {
  if (!currentMed) return;
  document.getElementById('playerSteps').innerHTML = currentMed.steps.map((s, i) =>
    '<div class="step' + (i === currentIdx ? ' current' : '') + '">' + (i + 1) + '. ' + s + '</div>'
  ).join('');
}

/* ========== BREATHING ========== */
const breathingPatterns = {
  '478': { name: 'Tecnica 4-7-8', phases: [{text:'Inspira',dur:4},{text:'Trattieni',dur:7},{text:'Espira',dur:8}], cycles: 6 },
  'box': { name: 'Box Breathing', phases: [{text:'Inspira',dur:4},{text:'Trattieni',dur:4},{text:'Espira',dur:4},{text:'Trattieni',dur:4}], cycles: 6 },
  'calm': { name: 'Respiro Calmante', phases: [{text:'Inspira',dur:4},{text:'Espira',dur:6}], cycles: 8 }
};

let breathInterval = null;
let breathTimeout = null;

function startBreathing(type) {
  const pattern = breathingPatterns[type];
  if (!pattern) return;
  document.querySelectorAll('.breathe-card').forEach(c => c.style.display = 'none');
  document.getElementById('breatheExercise').style.display = 'block';
  document.getElementById('breatheType').textContent = pattern.name;

  let cycle = 0;
  let phaseIdx = 0;
  let countdown = 0;

  function nextPhase() {
    if (cycle >= pattern.cycles) {
      finishBreathing(type, pattern);
      return;
    }
    const phase = pattern.phases[phaseIdx];
    document.getElementById('breatheText').textContent = phase.text;
    document.getElementById('breatheCycle').textContent = 'Ciclo ' + (cycle + 1) + '/' + pattern.cycles;
    countdown = phase.dur;
    document.getElementById('breatheCounter').textContent = countdown;

    const circle = document.getElementById('breatheCircle');
    circle.style.transition = 'transform ' + phase.dur + 's ease-in-out';
    if (phase.text === 'Inspira') {
      circle.classList.add('expand');
      circle.classList.remove('contract');
    } else if (phase.text === 'Espira') {
      circle.classList.remove('expand');
      circle.classList.add('contract');
    }

    if (breathInterval) clearInterval(breathInterval);
    breathInterval = setInterval(() => {
      countdown--;
      if (countdown >= 0) document.getElementById('breatheCounter').textContent = countdown;
    }, 1000);

    breathTimeout = setTimeout(() => {
      clearInterval(breathInterval);
      phaseIdx++;
      if (phaseIdx >= pattern.phases.length) { phaseIdx = 0; cycle++; }
      nextPhase();
    }, phase.dur * 1000);
  }

  nextPhase();
}

function finishBreathing(type, pattern) {
  document.getElementById('breatheText').textContent = 'Completato!';
  document.getElementById('breatheCounter').textContent = '🎉';
  const db = ensureArrays(getDB());
  db.breathing.push({ type, name: pattern.name, date: new Date().toISOString() });
  saveDB(db);
  setTimeout(() => stopBreathing(), 3000);
}

function stopBreathing() {
  if (breathInterval) clearInterval(breathInterval);
  if (breathTimeout) clearTimeout(breathTimeout);
  document.getElementById('breatheExercise').style.display = 'none';
  document.querySelectorAll('.breathe-card').forEach(c => c.style.display = '');
  const circle = document.getElementById('breatheCircle');
  circle.classList.remove('expand','contract');
  circle.style.transition = '';
}

/* ========== JOURNAL ========== */
const journalPrompts = [
  'Qual è stata la cosa più bella della tua settimana?',
  'Descrivi un momento in cui ti sei sentito in pace.',
  'Cosa faresti se non avessi paura?',
  'Qual è la lezione più importante che hai imparato quest\'anno?',
  'Descrivi il tuo giorno perfetto.',
  'Per cosa sei grato che spesso dai per scontato?',
  'Chi ti ha fatto sorridere oggi?',
  'Qual è un piccolo piacere che ti rende felice?',
  'Cosa ti piacerebbe dire al te stesso di 5 anni fa?',
  'Descrivi un atto di gentilezza che hai ricevuto.',
  'Qual è il tuo posto sicuro? Descrivilo.',
  'Cosa ti ha insegnato l\'ultima difficoltà che hai superato?'
];

function renderJournal() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  document.getElementById('journalPrompt').textContent = '💭 "' + journalPrompts[dayOfYear % journalPrompts.length] + '"';

  const db = ensureArrays(getDB());
  const entries = db.journals.slice(-10).reverse();
  document.getElementById('journalEntries').innerHTML = entries.length === 0
    ? '<p style="color:var(--text-muted);text-align:center;padding:20px">Nessuna pagina ancora. Inizia a scrivere!</p>'
    : entries.map(e => {
        const d = new Date(e.date);
        return '<div class="journal-entry">' +
          '<div class="je-date">' + d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + '</div>' +
          (e.gratitudes && e.gratitudes.length ? '<div class="je-gratitudes">' + e.gratitudes.map(g => '<span>✨ ' + g + '</span>').join('') + '</div>' : '') +
          (e.text ? '<div class="je-text">' + e.text + '</div>' : '') +
        '</div>';
      }).join('');
}

function saveJournalEntry() {
  const g1 = document.getElementById('grat1').value.trim();
  const g2 = document.getElementById('grat2').value.trim();
  const g3 = document.getElementById('grat3').value.trim();
  const text = document.getElementById('journalText').value.trim();
  const gratitudes = [g1, g2, g3].filter(Boolean);
  if (gratitudes.length === 0 && !text) return;

  const db = ensureArrays(getDB());
  db.journals.push({ gratitudes, text, date: new Date().toISOString() });
  saveDB(db);
  document.getElementById('grat1').value = '';
  document.getElementById('grat2').value = '';
  document.getElementById('grat3').value = '';
  document.getElementById('journalText').value = '';
  document.getElementById('journalSavedMsg').style.display = 'block';
  setTimeout(() => { document.getElementById('journalSavedMsg').style.display = 'none'; }, 2000);
  renderJournal();
  updateStreak();
}

/* ========== STATS ========== */
function renderStats() {
  const db = ensureArrays(getDB());
  document.getElementById('statMoods').textContent = db.moods.length;
  document.getElementById('statJournals').textContent = db.journals.length;
  document.getElementById('statMeditations').textContent = db.meditations.length;
  document.getElementById('statBreathing').textContent = db.breathing.length;

  renderMoodChart(db);
  renderMoodDistribution(db);
  renderActivityChart(db);
}

function renderMoodChart(db) {
  const chart = document.getElementById('moodChart');
  const moodValues = { 'ottimo': 5, 'bene': 4, 'neutro': 3, 'giù': 2, 'stressato': 1 };
  const moodColors = { 'ottimo': '#6B8F71', 'bene': '#8FB996', 'neutro': '#B8AED8', 'giù': '#E8A87C', 'stressato': '#D6A2AD' };
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const dayMoods = db.moods.filter(m => m.date.startsWith(ds));
    const dayLabel = d.toLocaleDateString('it-IT', { weekday: 'short' });
    if (dayMoods.length > 0) {
      const lastMood = dayMoods[dayMoods.length - 1];
      days.push({ label: dayLabel, value: moodValues[lastMood.mood] || 3, mood: lastMood.mood, emoji: lastMood.emoji, color: moodColors[lastMood.mood] || '#B8AED8' });
    } else {
      days.push({ label: dayLabel, value: 0, mood: '-', emoji: '', color: '#E8E2DC' });
    }
  }

  chart.innerHTML = days.map(d => {
    const h = d.value > 0 ? (d.value / 5) * 100 : 5;
    return '<div style="flex:1;display:flex;flex-direction:column;align-items:center">' +
      '<div class="mood-bar" style="height:' + h + '%;background:' + d.color + ';width:100%;max-width:40px" data-tooltip="' + d.emoji + ' ' + d.mood + '"></div>' +
      '<div class="mood-bar-label">' + d.label + '</div></div>';
  }).join('');
}

function renderMoodDistribution(db) {
  const dist = document.getElementById('moodDistribution');
  const counts = {};
  const emojis = { 'ottimo': '😊', 'bene': '🙂', 'neutro': '😐', 'giù': '😔', 'stressato': '😰' };
  db.moods.forEach(m => { counts[m.mood] = (counts[m.mood] || 0) + 1; });
  const total = db.moods.length || 1;

  dist.innerHTML = Object.keys(emojis).map(mood => {
    const count = counts[mood] || 0;
    const pct = Math.round((count / total) * 100);
    return '<div class="mood-dist-item">' +
      '<span class="dist-emoji">' + emojis[mood] + '</span>' +
      '<div class="dist-info"><div class="dist-name">' + mood + '</div>' +
      '<div class="dist-bar"><div class="dist-bar-fill" style="width:' + pct + '%"></div></div></div>' +
      '<span class="dist-count">' + count + '</span></div>';
  }).join('');
}

function renderActivityChart(db) {
  const chart = document.getElementById('activityChart');
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('it-IT', { weekday: 'short' });
    const activities = {
      mood: db.moods.some(m => m.date.startsWith(ds)),
      journal: db.journals.some(j => j.date.startsWith(ds)),
      meditation: db.meditations.some(m => m.date.startsWith(ds)),
      breathing: db.breathing.some(b => b.date.startsWith(ds))
    };
    days.push({ label: dayLabel, activities });
  }

  const actColors = { mood: '#6B8F71', journal: '#9B8EC4', meditation: '#E8A87C', breathing: '#87CEEB' };
  chart.innerHTML = days.map(d => {
    const dots = ['mood','journal','meditation','breathing'].map(type => {
      const active = d.activities[type];
      return '<div class="activity-dot" style="background:' + (active ? actColors[type] : 'var(--border)') + '" title="' + type + '"></div>';
    }).join('');
    return '<div class="activity-day"><div class="day-label">' + d.label + '</div><div class="day-dots">' + dots + '</div></div>';
  }).join('');
}

/* ========== RESOURCES ========== */
const resources = [
  { icon: '🧘', title: 'Mindfulness per Principianti', desc: 'La mindfulness è la pratica di portare attenzione al momento presente senza giudizio. Inizia con 5 minuti al giorno: siediti, chiudi gli occhi, e osserva il tuo respiro.', tag: 'Guida' },
  { icon: '😴', title: 'Igiene del Sonno', desc: 'Per dormire meglio: mantieni orari regolari, evita schermi 1h prima di letto, mantieni la camera fresca e buia, evita caffeina dopo le 14.', tag: 'Sonno' },
  { icon: '🏃', title: 'Esercizio e Salute Mentale', desc: 'L\'attività fisica rilascia endorfine. Anche 20 minuti di camminata veloce possono ridurre ansia e depressione del 26%.', tag: 'Fitness' },
  { icon: '🥗', title: 'Alimentazione e Umore', desc: 'Il microbioma intestinale produce il 90% della serotonina. Cibi fermentati, omega-3 e verdure a foglia verde supportano la salute mentale.', tag: 'Nutrizione' },
  { icon: '📱', title: 'Digital Detox', desc: 'L\'uso eccessivo dei social media è correlato ad ansia e depressione. Prova a limitare l\'uso a 30 minuti al giorno e disattiva le notifiche non essenziali.', tag: 'Digital' },
  { icon: '🤝', title: 'Connessioni Sociali', desc: 'Le relazioni significative sono il più forte predittore di benessere. Dedica tempo ogni settimana a connessioni autentiche, anche una telefonata.', tag: 'Relazioni' },
  { icon: '📓', title: 'Journaling Terapeutico', desc: 'Scrivere per 15-20 minuti sulle emozioni riduce lo stress e migliora il sistema immunitario. Non censurarti, scrivi liberamente.', tag: 'Scrittura' },
  { icon: '🌿', title: 'Terapia della Natura', desc: 'Il "forest bathing" giapponese (Shinrin-yoku) riduce cortisolo e pressione sanguigna. 2 ore a settimana nella natura fanno la differenza.', tag: 'Natura' },
  { icon: '🎵', title: 'Musicoterapia', desc: 'La musica a 432 Hz o 528 Hz favorisce il rilassamento. Crea una playlist per ogni stato d\'animo e usala come strumento di autoregolazione.', tag: 'Musica' },
  { icon: '💪', title: 'Resilienza Emotiva', desc: 'La resilienza si costruisce: accetta le emozioni, cerca il significato nelle difficoltà, mantieni routine e connessioni sociali. Ogni crisi è un\'opportunità di crescita.', tag: 'Crescita' },
  { icon: '🧠', title: 'Neuroplasticità', desc: 'Il cervello cambia con la pratica. La meditazione regolare aumenta la materia grigia nella corteccia prefrontale dopo sole 8 settimane.', tag: 'Scienza' },
  { icon: '☎️', title: 'Quando Chiedere Aiuto', desc: 'Se l\'ansia o la tristezza interferiscono con la vita quotidiana, parlare con un professionista è un atto di forza, non di debolezza. Telefono Amico: 02 2327 2327.', tag: 'Supporto' }
];

function renderResources() {
  document.getElementById('resourcesGrid').innerHTML = resources.map(r =>
    '<div class="resource-card">' +
    '<span class="rc-icon">' + r.icon + '</span>' +
    '<h3>' + r.title + '</h3>' +
    '<p>' + r.desc + '</p>' +
    '<span class="rc-tag">' + r.tag + '</span></div>'
  ).join('');
}

/* ========== INIT ========== */
document.addEventListener('DOMContentLoaded', () => {
  const db = ensureArrays(getDB());
  if (db.settings && db.settings.theme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    document.getElementById('themeIcon').textContent = '☀️';
  }
  navigateTo('home');
});