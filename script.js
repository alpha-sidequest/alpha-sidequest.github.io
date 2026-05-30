// ============================================
// RAAF Knowledge Hub - Interactivity  (VERSION: 2025-04-07-2)
// ============================================
// All the JavaScript that makes the maps, modals,
// section switching, and cards work lives here.
// You normally won't need to edit this file.

console.log('%c[RAFF DEBUG] script.js parsed successfully - VERSION 2025-04-07-FINAL', 'color: limegreen; font-size: 14px');

// ── SECTION SWITCHING ─────────────────────────────────────────
function showSection(id, el) {
  console.log('%c[RAFF DEBUG] showSection called with id =', 'color: cyan', id);

  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const sectionEl = document.getElementById(id);
  if (sectionEl) {
    sectionEl.classList.add('active');
  } else {
    console.warn('[RAFF DEBUG] No section found with id:', id);
  }

  // Prefer the passed element, otherwise auto-find by data-section
  let navEl = el;
  if (!navEl) {
    navEl = document.querySelector(`.nav-link[data-section="${id}"]`);
  }
  if (navEl) navEl.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── BASE MAP ──────────────────────────────────────────────────
function selectBase(id, event) {
  document.querySelectorAll('.base-dot').forEach(d => d.classList.remove('selected'));
  const dot = document.querySelector(`.base-dot[data-base="${id}"]`);
  if (dot) dot.classList.add('selected');
  renderBaseCard(id);
}

function renderBaseCard(id) {
  const b = BASES[id];
  if (!b) return;

  document.getElementById('basePlaceholder').style.display = 'none';
  const card = document.getElementById('baseCard');
  card.classList.add('visible');

  const sqHTML = b.squadrons.map(s => `
    <div class="squadron-item">
      <div class="squadron-num">${s.num}</div>
      <div class="squadron-info">
        <div class="squadron-name">${s.name}</div>
        <div class="squadron-aircraft">
          ${s.aircraft.split(' / ').map(a => `<span class="aircraft-chip" onclick="goToAircraft('${a}')">${a}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');

  card.innerHTML = `
    <div class="base-card-header">
      <div class="base-card-location">${b.location}</div>
      <div class="base-card-name">${b.name.replace('RAAF Base ','')}</div>
      <div class="base-card-role">${b.role}</div>
    </div>
    <div class="base-card-body">
      <div class="base-section-label">About this base</div>
      <p class="base-desc">${b.desc}</p>
      <div class="base-section-label">Squadrons & Aircraft</div>
      ${sqHTML}
      <p style="font-size:11px;color:var(--text-dim);margin-top:12px">Tap aircraft names above to view full aircraft details</p>
    </div>
  `;
}

function goToAircraft(name) {
  const aircraftNav = document.querySelector('.nav-link[data-section="airforce"]');
  showSection('airforce', aircraftNav);
  setTimeout(() => {
    const match = AIRCRAFT.find(a => name.includes(a.desig) || name.includes(a.name));
    if (match) openAircraftModal(match.id);
  }, 200);
}

// ── AIRCRAFT GRID (Grouped by Category) ───────────────────────
function buildAircraftGrid() {
  const grid = document.getElementById('aircraftGrid');
  grid.innerHTML = '';

  // Define the order we want categories to appear
  const categoryOrder = [
    "Combat",
    "Airborne Early Warning & Electronic Warfare",
    "Maritime Patrol & ISR",
    "Transport & Air Mobility",
    "Air Refuelling",
    "Rotary Wing",
    "Training",
    "VIP & Special Mission",
    "Uncrewed Systems"
  ];

  // Group aircraft by category
  const grouped = {};
  AIRCRAFT.forEach(ac => {
    const cat = ac.category || "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(ac);
  });

  categoryOrder.forEach(category => {
    if (!grouped[category]) return;

    // Add section header
    const header = document.createElement('div');
    header.className = 'aircraft-section-header';
    header.innerHTML = `<h3>${category}</h3>`;
    grid.appendChild(header);

    // Add cards for this category
    const container = document.createElement('div');
    container.className = 'aircraft-category-grid';

    grouped[category].forEach(ac => {
      const cardHTML = `
        <div class="aircraft-card" id="ac-${ac.id}" onclick="openAircraftModal('${ac.id}')">
          <div class="aircraft-img-wrap">
            <img src="${ac.img}" alt="${ac.name}">
            <span class="aircraft-type-badge badge-${ac.type}">${ac.typeName}</span>
          </div>
          <div class="aircraft-card-body">
            <div class="aircraft-designation">${ac.desig}</div>
            <div class="aircraft-name">${ac.name}</div>
            <div class="aircraft-tagline">${ac.tagline}</div>
            <div class="aircraft-tags">${ac.tags.slice(0,4).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
          </div>
        </div>
      `;
      container.innerHTML += cardHTML;
    });

    grid.appendChild(container);
  });

  // Add Adversary / Threat Aircraft section (consolidated from previous separate section for consistency with Fleet)
  if (typeof ADVERSARY_AIRCRAFT !== 'undefined' && ADVERSARY_AIRCRAFT.length > 0) {
    const advHeader = document.createElement('div');
    advHeader.className = 'aircraft-section-header threat';
    advHeader.innerHTML = `<h3>Adversary / Threat Aircraft</h3>`;
    grid.appendChild(advHeader);

    const advContainer = document.createElement('div');
    advContainer.className = 'aircraft-category-grid';

    ADVERSARY_AIRCRAFT.forEach(a => {
      const cardHTML = `
        <div class="aircraft-card" id="adv-${a.id}" onclick="showAdversaryDetail('${a.id}')">
          <div class="aircraft-img-wrap">
            <img src="${a.img}" alt="${a.name}">
            <span class="aircraft-type-badge badge-adversary">${a.typeName}</span>
          </div>
          <div class="aircraft-card-body">
            <div class="aircraft-designation">${a.desig} · ${a.origin}</div>
            <div class="aircraft-name">${a.name}</div>
            <div class="aircraft-tagline">${a.tagline}</div>
          </div>
        </div>
      `;
      advContainer.innerHTML += cardHTML;
    });

    grid.appendChild(advContainer);
  }

  // Build the left sidebar TOC after cards exist
  buildAircraftTOC();
}

// ── AIRCRAFT IN-PAGE TOC (left sidebar) ───────────────────────
function buildAircraftTOC() {
  const toc = document.getElementById('aircraftToc');
  if (!toc) return;

  // Use same grouping as the grid
  const categoryOrder = [
    "Combat",
    "Airborne Early Warning & Electronic Warfare",
    "Maritime Patrol & ISR",
    "Transport & Air Mobility",
    "Air Refuelling",
    "Rotary Wing",
    "Training",
    "VIP & Special Mission",
    "Uncrewed Systems"
  ];

  const grouped = {};
  AIRCRAFT.forEach(ac => {
    const cat = ac.category || "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(ac);
  });

  // Flat list with category headers for visual organisation (matching Cyberspace clean style + segregation)
  let html = `<ul>`;

  categoryOrder.forEach(cat => {
    if (!grouped[cat]) return;
    
    // Category header (non-clickable, for segregation)
    html += `<li class="toc-header">${cat}</li>`;
    
    grouped[cat].forEach(ac => {
      html += `<li><a href="#ac-${ac.id}" data-target="ac-${ac.id}">${ac.name}</a></li>`;
    });
  });

  // Adversary aircraft at the bottom (subtle red tint to match threat styling)
  if (typeof ADVERSARY_AIRCRAFT !== 'undefined' && ADVERSARY_AIRCRAFT.length > 0) {
    html += `<li class="toc-header" style="color:#c96a5f; border-color: rgba(192,57,43,0.3);">Adversary / Threat</li>`;
    ADVERSARY_AIRCRAFT.forEach(a => {
      html += `<li><a href="#adv-${a.id}" data-target="adv-${a.id}" style="color:#e07a6b;">${a.name}</a></li>`;
    });
  }

  html += `</ul>`;
  toc.innerHTML = html;
}



// ── SAFE SIDEBAR NAV (avoids inline onclick which breaks under MetaMask SES lockdown) ──
function initSidebarNav() {
  // Aircraft sidebar
  const aircraftToc = document.getElementById('aircraftToc');
  if (aircraftToc) {
    aircraftToc.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-target]');
      if (!link) return;
      e.preventDefault();
      scrollToCardWithFlash(link.dataset.target);
    });
  }

  // Fleet sidebar
  const fleetToc = document.getElementById('fleetToc');
  if (fleetToc) {
    fleetToc.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-target]');
      if (!link) return;
      e.preventDefault();
      scrollToCardWithFlash(link.dataset.target);
    });
  }

  // Weapons sidebar (delegated on the nav)
  const weaponsToc = document.getElementById('weaponsToc');
  if (weaponsToc) {
    weaponsToc.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-target]');
      if (!link) return;
      e.preventDefault();
      scrollToCardWithFlash(link.dataset.target);
    });
  }
}

function initMainNavigation() {
  console.log('%c[RAFF DEBUG] initMainNavigation() is running', 'color:lime; font-weight:bold');

  // Top navigation bar (event delegation)
  const navLinks = document.querySelector('.nav-links');
  console.log('[RAFF DEBUG] .nav-links container found:', !!navLinks);

  if (navLinks) {
    navLinks.addEventListener('click', (e) => {
      const link = e.target.closest('.nav-link[data-section]');
      if (!link) return;
      console.log('[RAFF DEBUG] Nav clicked →', link.dataset.section);
      const sectionId = link.dataset.section;
      showSection(sectionId, link);
    });
  }

  // "What's Inside" feature cards (event delegation)
  const featureCards = document.querySelector('.feature-cards');
  console.log('[RAFF DEBUG] .feature-cards container found:', !!featureCards);

  if (featureCards) {
    featureCards.addEventListener('click', (e) => {
      const card = e.target.closest('.feature-card[data-section]');
      if (!card) return;
      console.log('[RAFF DEBUG] Feature card clicked →', card.dataset.section);
      const sectionId = card.dataset.section;
      showSection(sectionId);
    });
  }

  // Global search input
  const searchInput = document.getElementById('globalSearch');
  if (searchInput) {
    searchInput.addEventListener('keyup', handleGlobalSearch);
  }

  // Generic smooth scroll links
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-scroll-to]');
    if (!link) return;
    e.preventDefault();
    const targetId = link.dataset.scrollTo;
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

function scrollToCardWithFlash(id) {
  const el = document.getElementById(id);
  if (!el) return;

  el.scrollIntoView({ behavior: 'smooth', block: 'center' });

  el.style.transition = 'box-shadow 0.2s ease';
  el.style.boxShadow = '0 0 0 3px rgba(201, 168, 76, 0.5)';
  setTimeout(() => {
    el.style.boxShadow = '';
  }, 1200);
}

function openAircraftModal(id) {
  const ac = AIRCRAFT.find(a => a.id === id);
  if (!ac) return;

  const statsHTML = ac.stats.map(s => `<div class="modal-stat"><div class="modal-stat-val">${s.v}</div><div class="modal-stat-key">${s.k}</div></div>`).join('');

  const sysHTML = ac.systems.map(s => `
    <li class="system-item">
      <div>
        <div class="system-name">${s.name}</div>
        <div class="system-code">${s.code}</div>
      </div>
      <div>
        <div class="system-desc">${s.desc}</div>
        <div class="layman-box"><strong>Plain English</strong>${s.layman}</div>
      </div>
    </li>
  `).join('');

  document.getElementById('modalInner').innerHTML = `
    <div class="modal-hero">
      <img src="${ac.img}" alt="${ac.name}">
      <div class="modal-hero-overlay"></div>
      <div class="modal-hero-text">
        <div class="modal-desig">${ac.desig} · ${ac.typeName}</div>
        <div class="modal-name">${ac.name}</div>
      </div>
    </div>
    <div class="modal-body">
      <div class="modal-stats-row">${statsHTML}</div>
      <div class="modal-tabs">
        <div class="modal-tab active" onclick="switchTab(event,'overview-${id}')">Overview</div>
        <div class="modal-tab" onclick="switchTab(event,'systems-${id}')">Systems & Weapons</div>
      </div>
      <div class="modal-tab-pane active" id="overview-${id}">
        <p class="modal-desc">${ac.overview}</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px">${ac.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      </div>
      <div class="modal-tab-pane" id="systems-${id}">
        <ul class="system-list">${sysHTML}</ul>
      </div>
    </div>
  `;

  document.getElementById('aircraftModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('aircraftModal').classList.remove('open');
  document.body.style.overflow = '';
}

function switchTab(event, paneId) {
  const tabs = event.target.closest('.modal-tabs').querySelectorAll('.modal-tab');
  const panes = event.target.closest('.modal-body').querySelectorAll('.modal-tab-pane');
  tabs.forEach(t => t.classList.remove('active'));
  panes.forEach(p => p.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById(paneId).classList.add('active');
}

// Close modal when clicking the dark overlay
document.getElementById('aircraftModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ── STUDY TOOLS (Flashcards + Quiz) ───────────────────────────
let currentFlashcards = [];
let currentFlashcardIndex = 0;
let knownFlashcards = new Set();

let currentQuiz = [];
let currentQuizIndex = 0;
let quizScore = 0;
let selectedQuizOption = null;

// Load known flashcards from localStorage
function loadFlashcardProgress() {
  try {
    const saved = localStorage.getItem('raaf_known_flashcards');
    if (saved) knownFlashcards = new Set(JSON.parse(saved));
  } catch (e) {}
}

function saveFlashcardProgress() {
  try {
    localStorage.setItem('raaf_known_flashcards', JSON.stringify(Array.from(knownFlashcards)));
  } catch (e) {}
}

function getAllStudyItems(source) {
  let items = [];

  if (source === 'glossary' || source === 'mixed') {
    GLOSSARY.forEach(g => {
      items.push({
        id: 'g-' + g.term,
        front: g.term,
        back: `${g.full}\n\n${g.definition}\n\nWhy it matters: ${g.whyItMatters}`,
        source: 'Glossary'
      });
    });
  }

  if (source === 'weapons' || source === 'mixed') {
    WEAPONS.forEach(w => {
      items.push({
        id: 'w-' + w.id,
        front: `${w.desig} — ${w.name}`,
        back: `${w.tagline}\n\n${w.overview}\n\nKey systems: ${w.systems.map(s => s.name).join(', ')}`,
        source: 'Weapons',
        img: w.img || null
      });
    });
  }

  if (source === 'adversary' || source === 'mixed') {
    ADVERSARY_AIRCRAFT.forEach(a => {
      items.push({
        id: 'a-' + a.id,
        front: `${a.desig} (${a.origin})`,
        back: `${a.name}\n\n${a.tagline}\n\nRecognition: ${a.recognition}\n\nWhy it matters: ${a.whyMatters}`,
        source: 'Adversary Air',
        img: a.img || null
      });
    });
  }

  if (source === 'pfa' || source === 'mixed') {
    PFA_STANDARDS.forEach(p => {
      items.push({
        id: 'pfa-' + p.id,
        front: p.front,
        back: p.back,
        source: 'PFA'
      });
    });
  }

  if (source === 'ranks' || source === 'mixed') {
    RANKS.forEach(r => {
      items.push({
        id: 'rank-' + r.id,
        front: r.term,
        back: r.definition,
        source: 'Ranks'
      });
    });
  }

  if (source === 'leadership' || source === 'mixed') {
    LEADERSHIP_ITEMS.forEach(l => {
      items.push({
        id: 'lead-' + l.id,
        front: l.term,
        back: l.definition,
        source: 'Leadership'
      });
    });
  }

  // Aircraft - key facts
  if (source === 'aircraft' || source === 'mixed') {
    AIRCRAFT.forEach(a => {
      items.push({
        id: 'ac-' + a.id,
        front: `${a.desig} ${a.name} – Primary Role`,
        back: `${a.tagline}\n\nKey stats: ${a.stats.map(s => `${s.k}: ${s.v}`).join(' | ')}`,
        source: 'Aircraft',
        img: a.img || null
      });
    });
  }

  // Fleet - key facts
  if (source === 'navy' || source === 'mixed') {
    NAVY.forEach(f => {
      items.push({
        id: 'fl-' + f.id,
        front: `${f.desig} ${f.name} – Key Capability`,
        back: `${f.tagline}\n\n${f.overview.substring(0, 220)}...`,
        source: 'Navy',
        img: f.img || null
      });
    });
  }

  // Vehicles (Australian)
  if (source === 'army' || source === 'mixed') {
    if (typeof ARMY !== 'undefined' && Array.isArray(ARMY)) {
      ARMY.forEach(v => {
        items.push({
          id: 'veh-' + v.id,
          front: `${v.desig} ${v.name}`,
          back: `${v.tagline}\n\n${v.overview.substring(0, 220)}...`,
          source: 'Army',
          img: v.img || null
        });
      });
    }
  }

  // Adversary Vehicles
  if (source === 'adversary-army' || source === 'army' || source === 'mixed') {
    if (typeof ADVERSARY_ARMY !== 'undefined' && Array.isArray(ADVERSARY_ARMY)) {
      ADVERSARY_ARMY.forEach(v => {
        items.push({
          id: 'adv-veh-' + v.id,
          front: `${v.desig} ${v.name} (Adversary)`,
          back: `${v.tagline}\n\n${v.overview.substring(0, 220)}...`,
          source: 'Adversary Army',
          img: v.img || null
        });
      });
    }
  }

  // New: Cyberspace / Threat Landscape
  if (source === 'cyberspace' || source === 'mixed') {
    if (typeof CYBERSPACE_STUDY_ITEMS !== 'undefined') {
      CYBERSPACE_STUDY_ITEMS.forEach(c => {
        items.push({
          id: 'cyber-' + c.id,
          front: c.front,
          back: c.back,
          source: c.source || 'Cyberspace'
        });
      });
    }
  }

  return items;
}

function loadNewFlashcardDeck() {
  const source = document.getElementById('flashcardSource').value;
  currentFlashcards = getAllStudyItems(source);

  // Filter out known items if we have progress
  const unknown = currentFlashcards.filter(item => !knownFlashcards.has(item.id));
  if (unknown.length > 0) currentFlashcards = unknown;

  currentFlashcardIndex = 0;
  shuffleFlashcards(false); // shuffle without re-filtering
  renderFlashcard();
}

function shuffleFlashcards(reRender = true) {
  currentFlashcards.sort(() => Math.random() - 0.5);
  currentFlashcardIndex = 0;
  if (reRender) renderFlashcard();
}

function renderFlashcard() {
  const card = document.getElementById('flashcard');
  const front = document.getElementById('flashcard-front-content');
  const back = document.getElementById('flashcard-back-content');
  const counter = document.getElementById('flashcard-counter');
  const knownCount = document.getElementById('flashcard-known-count');
  const progressBar = document.getElementById('flashcard-progress-bar');

  if (!currentFlashcards.length) {
    front.innerHTML = `<div class="term">No cards available</div>`;
    back.innerHTML = '';
    return;
  }

  const item = currentFlashcards[currentFlashcardIndex];
  card.classList.remove('flipped');

  let frontHTML = `
    <div style="font-size:13px; color:var(--text-dim); margin-bottom:8px;">${item.source}</div>
  `;

  if (item.img) {
    frontHTML += `
      <div style="margin-bottom:12px;">
        <img src="${item.img}" alt="${item.front}" style="max-width:100%; max-height:160px; border-radius:6px; border:1px solid var(--border); object-fit:contain;">
      </div>
    `;
  }

  frontHTML += `
    <div class="term">${item.front}</div>
    <div style="font-size:13px; color:var(--text-muted); margin-top:20px;">Click card or press Space to flip</div>
  `;

  front.innerHTML = frontHTML;

  back.innerHTML = `
    <div style="white-space: pre-line; line-height:1.55; font-size:15.5px;">${item.back}</div>
  `;

  counter.textContent = `${currentFlashcardIndex + 1} / ${currentFlashcards.length}`;
  knownCount.textContent = knownFlashcards.size;

  const pct = currentFlashcards.length > 0 ? Math.round(((currentFlashcardIndex + 1) / currentFlashcards.length) * 100) : 0;
  progressBar.style.width = pct + '%';
}

function flipFlashcard() {
  const card = document.getElementById('flashcard');
  card.classList.toggle('flipped');
}

function nextFlashcard() {
  if (!currentFlashcards.length) return;
  currentFlashcardIndex = (currentFlashcardIndex + 1) % currentFlashcards.length;
  renderFlashcard();
}

function markFlashcardKnown() {
  if (!currentFlashcards.length) return;
  const item = currentFlashcards[currentFlashcardIndex];
  knownFlashcards.add(item.id);
  saveFlashcardProgress();

  // Remove from current deck
  currentFlashcards.splice(currentFlashcardIndex, 1);
  if (currentFlashcardIndex >= currentFlashcards.length) currentFlashcardIndex = 0;
  renderFlashcard();
}

function resetFlashcardProgress() {
  if (!confirm('Reset all known flashcard progress?')) return;
  knownFlashcards.clear();
  localStorage.removeItem('raaf_known_flashcards');
  loadNewFlashcardDeck();
}

// Quiz functions
function startQuiz() {
  const type = document.getElementById('quizType').value;
  const length = parseInt(document.getElementById('quizLength').value);

  currentQuiz = generateQuizQuestions(type, length);
  currentQuizIndex = 0;
  quizScore = 0;
  selectedQuizOption = null;

  document.getElementById('quiz-results').style.display = 'none';
  document.getElementById('quiz-area').style.display = 'block';

  showCurrentQuizQuestion();
}

function generateQuizQuestions(type, count) {
  let pool = [];

  if (type === 'glossary' || type === 'mixed') {
    GLOSSARY.forEach(g => {
      pool.push({
        question: `What does ${g.term} stand for?`,
        correct: g.full,
        options: [g.full, ...getRandomWrongAnswers(g.full, GLOSSARY.map(x => x.full), 3)],
        explanation: g.whyItMatters
      });
    });
  }

  if (type === 'weapons' || type === 'mixed') {
    WEAPONS.forEach(w => {
      const platforms = w.stats.find(s => s.k === 'Platforms')?.v || 'Multiple platforms';
      const keyAdvantage = w.systems && w.systems.length > 0 
        ? w.systems[0].name + ": " + w.systems[0].layman 
        : w.tagline;

      pool.push({
        question: `Which platform primarily employs the ${w.desig} ${w.name}?`,
        correct: platforms,
        options: getRandomWrongAnswers(platforms, ['F-35A', 'P-8A', 'EA-18G Growler', 'Hobart-class', 'Super Hornet', 'Growler'], 3),
        explanation: `${w.desig} ${w.name} – ${keyAdvantage}`
      });
    });
  }

  if (type === 'adversary' || type === 'mixed') {
    ADVERSARY_AIRCRAFT.forEach(a => {
      pool.push({
        question: `Which country operates the ${a.desig} ${a.name}?`,
        correct: a.origin,
        options: getRandomWrongAnswers(a.origin, ['China', 'Russia', 'North Korea', 'Iran'], 3),
        explanation: a.whyMatters
      });
    });
  }

  // PFA questions
  if (type === 'pfa' || type === 'mixed') {
    PFA_STANDARDS.forEach(p => {
      pool.push({
        question: p.front + "?",
        correct: p.back,
        options: getRandomWrongAnswers(p.back, PFA_STANDARDS.map(x => x.back), 3),
        explanation: p.back + " — This is a common minimum standard tested in ADF recruiting."
      });
    });
  }

  // Ranks questions
  if (type === 'ranks' || type === 'mixed') {
    RANKS.forEach(r => {
      pool.push({
        question: `What is the role or meaning of ${r.term}?`,
        correct: r.definition,
        options: getRandomWrongAnswers(r.definition, RANKS.map(x => x.definition), 3),
        explanation: r.definition
      });
    });
  }

  // Leadership questions
  if (type === 'leadership' || type === 'mixed') {
    LEADERSHIP_ITEMS.forEach(l => {
      pool.push({
        question: `What does "${l.term}" refer to?`,
        correct: l.definition,
        options: getRandomWrongAnswers(l.definition, LEADERSHIP_ITEMS.map(x => x.definition), 3),
        explanation: l.definition
      });
    });
  }

  // Aircraft questions
  if (type === 'aircraft' || type === 'mixed') {
    AIRCRAFT.forEach(a => {
      const statsSummary = a.stats.slice(0, 3).map(s => `${s.k}: ${s.v}`).join(" • ");
      pool.push({
        question: `What is the primary role of the ${a.desig} ${a.name}?`,
        correct: a.tagline,
        options: getRandomWrongAnswers(a.tagline, AIRCRAFT.map(x => x.tagline), 3),
        explanation: `${a.tagline} — Key stats: ${statsSummary}`
      });
    });
  }

  // Maritime questions
  if (type === 'navy' || type === 'mixed') {
    NAVY.forEach(f => {
      pool.push({
        question: `What is the main role of the ${f.desig} ${f.name}?`,
        correct: f.tagline,
        options: getRandomWrongAnswers(f.tagline, MARITIME.map(x => x.tagline), 3),
        explanation: f.tagline + " — " + f.overview.substring(0, 160) + "..."
      });
    });
  }

  // New: Cyberspace / Threat Landscape questions
  if (type === 'cyberspace' || type === 'mixed') {
    if (typeof CYBERSPACE_STUDY_ITEMS !== 'undefined') {
      CYBERSPACE_STUDY_ITEMS.forEach(c => {
        pool.push({
          question: c.front,
          correct: c.back,
          options: getRandomWrongAnswers(c.back, CYBERSPACE_STUDY_ITEMS.map(x => x.back), 3),
          explanation: c.back
        });
      });
    }
  }

  // Shuffle and take requested number
  pool.sort(() => Math.random() - 0.5);
  return pool.slice(0, count);
}

function getRandomWrongAnswers(correct, pool, num) {
  const wrong = pool.filter(x => x !== correct);
  const shuffled = wrong.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, num);
}

function showCurrentQuizQuestion() {
  const q = currentQuiz[currentQuizIndex];
  if (!q) return endQuiz();

  document.getElementById('quiz-current').textContent = currentQuizIndex + 1;
  document.getElementById('quiz-total').textContent = currentQuiz.length;
  document.getElementById('quiz-score').textContent = quizScore;

  document.getElementById('quiz-question').innerHTML = q.question;
  document.getElementById('quiz-feedback').style.display = 'none';
  document.getElementById('quiz-next-btn').style.display = 'none';

  const optionsContainer = document.getElementById('quiz-options');
  optionsContainer.innerHTML = '';

  // Shuffle options
  const shuffledOptions = [...q.options];
  shuffledOptions.sort(() => Math.random() - 0.5);

  shuffledOptions.forEach(opt => {
    const div = document.createElement('div');
    div.className = 'quiz-option';
    div.textContent = opt;
    div.onclick = () => selectQuizOption(div, opt, q);
    optionsContainer.appendChild(div);
  });

  selectedQuizOption = null;
}

function selectQuizOption(element, chosen, question) {
  // Deselect others
  document.querySelectorAll('#quiz-options .quiz-option').forEach(el => el.classList.remove('selected'));
  element.classList.add('selected');
  selectedQuizOption = chosen;

  // Show feedback immediately
  const feedback = document.getElementById('quiz-feedback');
  const isCorrect = chosen === question.correct;

  feedback.innerHTML = isCorrect 
    ? `<strong style="color:#2EC4A0">Correct!</strong> ${question.explanation}`
    : `<strong style="color:#E05A40">Incorrect.</strong> The correct answer is <strong>${question.correct}</strong>. ${question.explanation}`;

  feedback.style.display = 'block';

  if (isCorrect) quizScore++;

  document.getElementById('quiz-score').textContent = quizScore;
  document.getElementById('quiz-next-btn').style.display = 'inline-block';
}

function nextQuizQuestion() {
  currentQuizIndex++;
  if (currentQuizIndex >= currentQuiz.length) {
    endQuiz();
  } else {
    showCurrentQuizQuestion();
  }
}

function endQuiz() {
  document.getElementById('quiz-area').style.display = 'none';
  document.getElementById('quiz-results').style.display = 'block';

  const percent = Math.round((quizScore / currentQuiz.length) * 100);
  document.getElementById('final-score').textContent = `${quizScore} / ${currentQuiz.length} (${percent}%)`;

  let message = '';
  if (percent >= 90) message = 'Outstanding — you’re very well prepared!';
  else if (percent >= 75) message = 'Strong performance. Keep reviewing the weaker areas.';
  else if (percent >= 60) message = 'Good effort. Focus on the items you missed.';
  else message = 'Keep practising — this is exactly why these tools exist.';

  document.getElementById('score-message').textContent = message;

  // Save best score
  try {
    const key = 'raaf_best_quiz_score';
    const best = parseInt(localStorage.getItem(key) || '0');
    if (percent > best) localStorage.setItem(key, percent);
  } catch(e){}
}

function resetQuiz() {
  document.getElementById('quiz-area').style.display = 'none';
  document.getElementById('quiz-results').style.display = 'none';
}

// ============================================
// WHO AM I? GAME
// ============================================

let currentWhoAmIItem = null;
let whoAmIClues = [];
let whoAmICluesRevealed = 0;
let whoAmIScore = 0;
let whoAmITotal = 10;
let whoAmICurrent = 0;

function startWhoAmIGame() {
  const source = document.getElementById('whoamiSource').value;
  const allItems = getAllStudyItems(source);

  if (allItems.length === 0) {
    alert("No items available for this source yet.");
    return;
  }

  // Reset game state
  whoAmIScore = 0;
  whoAmICurrent = 0;
  whoAmITotal = Math.min(10, allItems.length);

  document.getElementById('whoami-game-area').style.display = 'block';
  document.getElementById('whoami-score').textContent = whoAmIScore;
  document.getElementById('whoami-current').textContent = 1;
  document.getElementById('whoami-total').textContent = whoAmITotal;

  nextWhoAmIItem(true); // start first item
}

function nextWhoAmIItem(isFirst = false) {
  const source = document.getElementById('whoamiSource').value;
  const allItems = getAllStudyItems(source);

  if (whoAmICurrent >= whoAmITotal || allItems.length === 0) {
    endWhoAmIGame();
    return;
  }

  whoAmICurrent++;
  document.getElementById('whoami-current').textContent = whoAmICurrent;

  // Pick random item
  currentWhoAmIItem = allItems[Math.floor(Math.random() * allItems.length)];
  whoAmIClues = generateWhoAmIClues(currentWhoAmIItem);
  whoAmICluesRevealed = 0;

  // Reset UI
  document.getElementById('whoami-clues-list').innerHTML = '';
  document.getElementById('whoami-feedback').style.display = 'none';
  document.getElementById('whoami-next-btn').style.display = 'none';
  document.getElementById('whoami-guess-input').value = '';
  document.getElementById('whoami-guess-input').disabled = false;

  // Reset reveal and give-up buttons
  const revealBtn = document.getElementById('whoami-reveal-btn');
  const giveUpBtn = document.getElementById('whoami-giveup-btn');
  if (revealBtn) {
    revealBtn.disabled = false;
    revealBtn.textContent = 'Reveal Next Clue';
  }
  if (giveUpBtn) giveUpBtn.style.display = 'none';

  // Reveal the first two clues automatically for fairness
  revealNextWhoAmIClue();
  if (whoAmIClues.length > 1) {
    revealNextWhoAmIClue();
  }
}

function generateWhoAmIClues(item) {
  const clues = [];
  const source = item.source?.toLowerCase() || '';
  const back = item.back || '';

  // ===== GLOSSARY =====
  if (source.includes('glossary')) {
    clues.push("This is a key ADF/RAAF term or acronym.");
    const firstLine = back.split('\n')[0] || '';
    if (firstLine) clues.push(`Category/context: ${firstLine}`);
    clues.push("It is frequently tested in officer and general entry interviews.");
    clues.push(`Strong clue: ${back.substring(0, 220)}`);
  } 

  // ===== AIRCRAFT / MARITIME / VEHICLES =====
  else if (source.includes('aircraft') || source.includes('maritime') || source.includes('vehicle')) {
    clues.push("This is a current or future ADF platform (air or maritime).");
    const firstLine = back.split('\n')[0] || '';
    if (firstLine) clues.push(`Primary role/capability: ${firstLine}`);
    clues.push("It is operated by the Royal Australian Air Force or Navy.");
    clues.push(`Strong clue: ${back.substring(0, 200)}`);
  } 

  // ===== WEAPONS =====
  else if (source.includes('weapon')) {
    clues.push("This is a weapon or munition in service with the ADF.");
    const firstLine = back.split('\n')[0] || '';
    if (firstLine) clues.push(`Primary users: ${firstLine}`);
    clues.push("It is used for strike, air defence, or maritime roles.");
    clues.push(`Strong clue: ${back.substring(0, 200)}`);
  } 

  // ===== CYBERSPACE / THREATS (new content) =====
  else if (source.includes('cyberspace') || source.includes('threat')) {
    clues.push("This relates to state-sponsored cyber threats facing Australia.");
    clues.push("It involves either a specific actor/group or a proven defensive technique.");
    if (back.toLowerCase().includes('china') || back.toLowerCase().includes('apt') || back.toLowerCase().includes('volt')) {
      clues.push("This actor or technique is primarily associated with Chinese state operations against Australia.");
    } else if (back.toLowerCase().includes('russia')) {
      clues.push("This is linked to Russian military or intelligence cyber activity.");
    } else if (back.toLowerCase().includes('north korea') || back.toLowerCase().includes('lazarus')) {
      clues.push("This group is known for both espionage and large-scale financial theft (especially crypto).");
    }
    clues.push(`Strong clue: ${back.substring(0, 220)}`);
  } 

  // ===== ADVERSARY AIRCRAFT =====
  else if (source.includes('adversary')) {
    clues.push("This is an adversary aircraft that RAAF aircrew and intelligence personnel must be able to identify.");
    clues.push("It belongs to a near-peer or significant regional military power.");
    clues.push("Recognition of this platform is operationally relevant for maritime patrol and air combat roles.");
    clues.push(`Strong clue: ${back.substring(0, 200)}`);
  } 
  // ===== ARMY (Ground Vehicles + Army Aviation) =====
  else if (source.includes('army') || source.includes('vehicle')) {
    if (back.toLowerCase().includes('china') || back.toLowerCase().includes('russia') || back.toLowerCase().includes('adversary')) {
      clues.push("This is a Chinese or Russian armoured vehicle that RAAF personnel should be able to recognise.");
    } else if (back.toLowerCase().includes('helicopter') || back.toLowerCase().includes('black hawk') || back.toLowerCase().includes('tiger')) {
      clues.push("This is an Australian Army Aviation helicopter that RAAF crews often operate with or support.");
    } else {
      clues.push("This is an Australian Army ground vehicle or helicopter that RAAF crews may be required to move or support on joint operations.");
    }
    clues.push(`Strong clue: ${back.substring(0, 200)}`);
  }

  // ===== LEADERSHIP / RANKS / PFA =====
  else {
    // Try to make a better generic clue from the actual content
    const firstSentence = back.split(/[.\n]/)[0] || 'An important ADF concept.';
    clues.push("This is a concept, standard, or principle relevant to ADF service.");
    clues.push(`Key detail: ${firstSentence}`);
    clues.push("It is commonly tested during ADF recruiting and officer interviews.");
    clues.push(`Strong clue: ${back.substring(0, 200)}`);
  }

  // Ensure we always have at least 3 clues
  while (clues.length < 3) {
    clues.push("Additional context: This topic appears regularly in ADF doctrine, training, or recruiting materials.");
  }

  return clues;
}

function revealNextWhoAmIClue() {
  if (!currentWhoAmIItem || whoAmICluesRevealed >= whoAmIClues.length) return;

  const cluesList = document.getElementById('whoami-clues-list');
  const clueDiv = document.createElement('div');
  clueDiv.style.marginBottom = '8px';
  clueDiv.style.padding = '8px 12px';
  clueDiv.style.background = 'var(--navy-mid)';
  clueDiv.style.borderRadius = '6px';
  clueDiv.innerHTML = `<strong>Clue ${whoAmICluesRevealed + 1}:</strong> ${whoAmIClues[whoAmICluesRevealed]}`;
  cluesList.appendChild(clueDiv);

  whoAmICluesRevealed++;

  // Update button text when running low on clues
  const revealBtn = document.getElementById('whoami-reveal-btn');
  const giveUpBtn = document.getElementById('whoami-giveup-btn');

  if (revealBtn) {
    if (whoAmICluesRevealed >= whoAmIClues.length) {
      revealBtn.textContent = 'All clues revealed';
      revealBtn.disabled = true;
    } else if (whoAmICluesRevealed >= 3) {
      revealBtn.textContent = 'Reveal Next Clue';
    }
  }

  // Show "Give Up" button after 3 clues for fairness
  if (giveUpBtn && whoAmICluesRevealed >= 3) {
    giveUpBtn.style.display = 'inline-block';
  }
}

function submitWhoAmIGuess() {
  const input = document.getElementById('whoami-guess-input');
  const feedback = document.getElementById('whoami-feedback');
  const guess = input.value.trim().toLowerCase();

  if (!currentWhoAmIItem || !guess) return;

  const correctAnswer = currentWhoAmIItem.front.toLowerCase();
  const isCorrect = correctAnswer.includes(guess) || guess.includes(correctAnswer.split('–')[0].trim().toLowerCase());

  feedback.style.display = 'block';

  if (isCorrect) {
    whoAmIScore++;
    document.getElementById('whoami-score').textContent = whoAmIScore;
    feedback.innerHTML = `
      <strong style="color:#2EC4A0">Correct!</strong><br>
      <strong>${currentWhoAmIItem.front}</strong><br><br>
      ${currentWhoAmIItem.img ? `<img src="${currentWhoAmIItem.img}" alt="${currentWhoAmIItem.front}" style="max-width:100%; max-height:180px; border-radius:6px; border:1px solid var(--border); object-fit:contain; margin:10px 0;">` : ''}
      ${currentWhoAmIItem.back}
    `;
  } else {
    feedback.innerHTML = `
      <strong style="color:#E05A40">Not quite.</strong><br>
      The answer was: <strong>${currentWhoAmIItem.front}</strong><br><br>
      ${currentWhoAmIItem.img ? `<img src="${currentWhoAmIItem.img}" alt="${currentWhoAmIItem.front}" style="max-width:100%; max-height:180px; border-radius:6px; border:1px solid var(--border); object-fit:contain; margin:10px 0;">` : ''}
      ${currentWhoAmIItem.back}
    `;
  }

  input.disabled = true;
  document.getElementById('whoami-next-btn').style.display = 'inline-block';
}

function endWhoAmIGame() {
  const feedback = document.getElementById('whoami-feedback');
  feedback.style.display = 'block';
  feedback.innerHTML = `
    <h3 style="color: var(--gold);">Game Complete</h3>
    <p style="font-size: 20px;">You got <strong>${whoAmIScore} / ${whoAmITotal}</strong> correct.</p>
    <p style="color: var(--text-muted);">Great work building recognition skills.</p>
  `;
  document.getElementById('whoami-next-btn').style.display = 'none';
}

function showWhoAmIAnswer() {
  const feedback = document.getElementById('whoami-feedback');
  const input = document.getElementById('whoami-guess-input');

  feedback.style.display = 'block';
  feedback.innerHTML = `
    <strong style="color:#E05A40">Answer revealed.</strong><br>
    <strong>${currentWhoAmIItem.front}</strong><br><br>
    ${currentWhoAmIItem.img ? `<img src="${currentWhoAmIItem.img}" alt="${currentWhoAmIItem.front}" style="max-width:100%; max-height:180px; border-radius:6px; border:1px solid var(--border); object-fit:contain; margin:10px 0;">` : ''}
    ${currentWhoAmIItem.back}
  `;

  input.disabled = true;
  document.getElementById('whoami-next-btn').style.display = 'inline-block';

  // Hide the give up button once used
  const giveUpBtn = document.getElementById('whoami-giveup-btn');
  if (giveUpBtn) giveUpBtn.style.display = 'none';
}

function resetWhoAmIGame() {
  document.getElementById('whoami-game-area').style.display = 'none';
  document.getElementById('whoami-feedback').style.display = 'none';
  document.getElementById('whoami-clues-list').innerHTML = '';
}

// ============================================
// MATCHING GAME
// ============================================

let matchingPairs = [];
let matchedIds = new Set();
let matchingAttempts = 0;
let matchingTimerInterval = null;
let matchingStartTime = 0;
let selectedLeftId = null;
let selectedRightId = null;

function startMatchingGame() {
  const source = document.getElementById('matchingSource').value;
  const allItems = getAllStudyItems(source);

  if (allItems.length < 4) {
    alert("Not enough items in this source to play a matching game yet.");
    return;
  }

  // Reset state
  resetMatchingGameState();

  // Generate 10-12 high-quality pairs (or fewer if source is small)
  matchingPairs = generateMatchingPairs(allItems, 12);

  // Show game area, hide results
  document.getElementById('matching-game-area').style.display = 'block';
  document.getElementById('matching-results').style.display = 'none';
  document.getElementById('matching-feedback').style.display = 'none';
  document.getElementById('matching-reveal-btn').style.display = 'inline-block';

  // Render the two columns
  renderMatchingBoard();

  // Start timer
  matchingStartTime = Date.now();
  if (matchingTimerInterval) clearInterval(matchingTimerInterval);
  matchingTimerInterval = setInterval(updateMatchingTimer, 1000);
  updateMatchingTimer();

  updateMatchingProgress();
}

function sanitizeDefinitionForMatching(text, term) {
  if (!text || !term) return text || '';

  let result = ' ' + text + ' ';

  const toRedact = new Set();

  // Always redact the full term shown on the left
  const mainTerm = term.trim();
  if (mainTerm) toRedact.add(mainTerm);

  // Split on common separators and redact significant name parts
  const parts = mainTerm.split(/[\s–—\-–:()]+/);
  const skipWords = new Set(['the', 'and', 'for', 'with', 'role', 'primary', 'key', 'main', 'system', 'capability', 'aircraft', 'missile', 'naval']);
  parts.forEach(p => {
    const w = p.trim();
    if (w.length >= 3 && !skipWords.has(w.toLowerCase())) {
      toRedact.add(w);
    }
  });

  // Redact all collected phrases (case-insensitive)
  toRedact.forEach(phrase => {
    if (!phrase || phrase.length < 3) return;
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    result = result.replace(regex, '———');
  });

  // Extra aggressive pass for glossary-style definitions:
  // Many glossary backs start with the full expansion name (e.g. "Active Electronically Scanned Array ...")
  // Redact a leading title-cased or ALL-CAPS phrase up to the first punctuation.
  const leadingMatch = result.match(/^\s*([A-Z][A-Za-z0-9\s\-–—]+?)(?:\s*[.,:—–—]|\s{2,})/);
  if (leadingMatch && leadingMatch[1]) {
    const lead = leadingMatch[1].trim();
    // Only blank it if it looks like a proper name (multiple words or mostly uppercase/acronym)
    if (lead.length >= 6 && (lead.split(/\s+/).length >= 2 || /^[A-Z0-9\-–—\s]+$/.test(lead))) {
      const escapedLead = lead.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp('^\\s*' + escapedLead, 'i'), ' ——— ');
    }
  }

  // Tidy up spacing and repeated redactions
  result = result.replace(/\s+/g, ' ').trim();
  result = result.replace(/\s*———(\s*———)*\s*/g, ' ——— ');
  result = result.replace(/^\s*———\s*/, '');
  result = result.replace(/\s*———\s*$/, '');

  return result;
}

function generateMatchingPairs(allItems, maxPairs) {
  // Shuffle source items then take up to maxPairs
  const shuffled = [...allItems].sort(() => Math.random() - 0.5);
  const pairs = [];

  for (let i = 0; i < shuffled.length && pairs.length < maxPairs; i++) {
    const item = shuffled[i];
    let term = item.front || '';
    let definition = item.back || '';

    // Clean and shorten definition for the right column
    definition = definition.replace(/\n+/g, ' ').trim();
    if (definition.length > 210) {
      definition = definition.substring(0, 207) + '...';
    }

    // IMPORTANT: Strip the term name itself from the definition so it isn't obvious
    definition = sanitizeDefinitionForMatching(definition, term);

    // Skip anything too short or empty after sanitization
    if (!term || definition.length < 8) continue;

    pairs.push({
      id: item.id,
      term: term,
      definition: definition,
      img: item.img || null
    });
  }

  return pairs;
}

function renderMatchingBoard() {
  const leftEl = document.getElementById('matching-left');
  const rightEl = document.getElementById('matching-right');
  leftEl.innerHTML = '';
  rightEl.innerHTML = '';

  // Left = Terms (keep original order after shuffle from generate, but shuffle again for game)
  const leftItems = [...matchingPairs];
  leftItems.sort(() => Math.random() - 0.5);

  // Right = Definitions (fully shuffled)
  const rightItems = [...matchingPairs];
  rightItems.sort(() => Math.random() - 0.5);

  leftItems.forEach(pair => {
    const card = createMatchCard('left', pair);
    leftEl.appendChild(card);
  });

  rightItems.forEach(pair => {
    const card = createMatchCard('right', pair);
    rightEl.appendChild(card);
  });
}

function createMatchCard(side, pair) {
  const card = document.createElement('div');
  card.className = 'match-card';
  card.dataset.id = pair.id;
  card.dataset.side = side;

  let html = '';

  if (side === 'left' && pair.img) {
    html += `<img class="match-img" src="${pair.img}" alt="${pair.term}" loading="lazy">`;
  }

  html += `<div class="match-content">`;
  if (side === 'left') {
    html += `<div class="match-term">${pair.term}</div>`;
  } else {
    html += `<div class="match-def">${pair.definition}</div>`;
  }
  html += `</div>`;

  card.innerHTML = html;

  // Click handler (vanilla, no inline)
  card.addEventListener('click', () => {
    if (card.classList.contains('matched')) return;
    selectMatchCard(side, pair.id, card);
  });

  return card;
}

function selectMatchCard(side, id, element) {
  // Deselect previous on same side
  document.querySelectorAll(`#matching-${side} .match-card.selected`).forEach(el => {
    el.classList.remove('selected');
  });

  element.classList.add('selected');

  if (side === 'left') {
    selectedLeftId = id;
  } else {
    selectedRightId = id;
  }

  // If we now have both sides selected, check the match
  if (selectedLeftId && selectedRightId) {
    setTimeout(() => checkMatch(), 120); // tiny delay so user sees both highlighted
  }
}

function checkMatch() {
  const leftCard = document.querySelector(`#matching-left .match-card[data-id="${selectedLeftId}"]`);
  const rightCard = document.querySelector(`#matching-right .match-card[data-id="${selectedRightId}"]`);

  matchingAttempts++;
  const isCorrect = selectedLeftId === selectedRightId;

  updateMatchingProgress();

  if (isCorrect) {
    // Success
    matchedIds.add(selectedLeftId);

    if (leftCard) {
      leftCard.classList.remove('selected');
      leftCard.classList.add('matched');
    }
    if (rightCard) {
      rightCard.classList.remove('selected');
      rightCard.classList.add('matched');
    }

    // Clear selections
    selectedLeftId = null;
    selectedRightId = null;

    // Check for win
    if (matchedIds.size === matchingPairs.length) {
      setTimeout(() => endMatchingGame(true), 450);
    }
  } else {
    // Wrong — flash red briefly
    if (leftCard) {
      leftCard.classList.remove('selected');
      leftCard.classList.add('wrong');
    }
    if (rightCard) {
      rightCard.classList.remove('selected');
      rightCard.classList.add('wrong');
    }

    setTimeout(() => {
      if (leftCard) leftCard.classList.remove('wrong');
      if (rightCard) rightCard.classList.remove('wrong');
      selectedLeftId = null;
      selectedRightId = null;
    }, 520);
  }
}

function updateMatchingProgress() {
  const matchedEl = document.getElementById('matching-matched');
  const totalEl = document.getElementById('matching-total');
  const attemptsEl = document.getElementById('matching-attempts');
  const accuracyEl = document.getElementById('matching-accuracy');

  const total = matchingPairs.length;
  const matched = matchedIds.size;

  if (matchedEl) matchedEl.textContent = matched;
  if (totalEl) totalEl.textContent = total;
  if (attemptsEl) attemptsEl.textContent = matchingAttempts;

  let accuracyText = '—';
  if (matchingAttempts > 0) {
    const acc = Math.round((matched / matchingAttempts) * 100);
    accuracyText = `${acc}%`;
  }
  if (accuracyEl) accuracyEl.textContent = accuracyText;
}

function updateMatchingTimer() {
  const timerEl = document.getElementById('matching-timer');
  if (!timerEl || !matchingStartTime) return;

  const elapsed = Math.floor((Date.now() - matchingStartTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function endMatchingGame(wasWin = false) {
  // Internal win path or manual end
  if (!wasWin) {
    // Called from the End Game button in controls
    if (matchingTimerInterval) {
      clearInterval(matchingTimerInterval);
      matchingTimerInterval = null;
    }
    const gameArea = document.getElementById('matching-game-area');
    const feedback = document.getElementById('matching-feedback');
    gameArea.style.display = 'none';

    feedback.style.display = 'block';
    feedback.innerHTML = `
      <strong style="color:var(--gold)">Game ended.</strong> You matched <strong>${matchedIds.size} / ${matchingPairs.length}</strong> with ${matchingAttempts} attempts.
      <button class="study-btn" onclick="startMatchingGame()" style="margin-left:12px;">Play Again</button>
    `;
    const revealBtn = document.getElementById('matching-reveal-btn');
    if (revealBtn) revealBtn.style.display = 'none';
    return;
  }

  // Win / completion path (results panel)
  // Stop timer
  if (matchingTimerInterval) {
    clearInterval(matchingTimerInterval);
    matchingTimerInterval = null;
  }

  const gameArea = document.getElementById('matching-game-area');
  const results = document.getElementById('matching-results');

  // Hide board, show results
  gameArea.style.display = 'none';
  results.style.display = 'block';

  // Fill results
  const total = matchingPairs.length;
  const matched = matchedIds.size;
  const acc = matchingAttempts > 0 ? Math.round((matched / matchingAttempts) * 100) : 0;

  document.getElementById('matching-final-matched').textContent = matched;
  document.getElementById('matching-final-total').textContent = total;
  document.getElementById('matching-final-accuracy').textContent = `${acc}%`;

  let message = '';
  if (acc >= 90) message = 'Outstanding precision — excellent recall under pressure.';
  else if (acc >= 75) message = 'Strong performance. You know this material well.';
  else if (acc >= 60) message = 'Solid effort. Review the ones you missed and try again.';
  else message = 'Keep practising — matching forces you to truly know the connections.';

  const finalMsg = document.getElementById('matching-final-message');
  if (finalMsg) finalMsg.textContent = message;

  // Hide reveal button
  const revealBtn = document.getElementById('matching-reveal-btn');
  if (revealBtn) revealBtn.style.display = 'none';
}

function revealAllMatches() {
  // Auto-match everything remaining (great study aid)
  const leftCards = document.querySelectorAll('#matching-left .match-card:not(.matched)');
  const rightCards = document.querySelectorAll('#matching-right .match-card:not(.matched)');

  // For each unmatched pair, highlight both sides briefly then mark matched
  matchingPairs.forEach(pair => {
    if (matchedIds.has(pair.id)) return;

    const leftCard = document.querySelector(`#matching-left .match-card[data-id="${pair.id}"]`);
    const rightCard = document.querySelector(`#matching-right .match-card[data-id="${pair.id}"]`);

    if (leftCard) {
      leftCard.classList.remove('selected', 'wrong');
      leftCard.classList.add('matched');
    }
    if (rightCard) {
      rightCard.classList.remove('selected', 'wrong');
      rightCard.classList.add('matched');
    }

    matchedIds.add(pair.id);
  });

  updateMatchingProgress();

  // After a short pause, end the game showing the results
  setTimeout(() => {
    endMatchingGame(true);
  }, 650);
}

function resetMatchingGameState() {
  matchingPairs = [];
  matchedIds = new Set();
  matchingAttempts = 0;
  selectedLeftId = null;
  selectedRightId = null;

  if (matchingTimerInterval) {
    clearInterval(matchingTimerInterval);
    matchingTimerInterval = null;
  }
  matchingStartTime = 0;

  // Clear UI elements if they exist
  const left = document.getElementById('matching-left');
  const right = document.getElementById('matching-right');
  if (left) left.innerHTML = '';
  if (right) right.innerHTML = '';

  const feedback = document.getElementById('matching-feedback');
  if (feedback) feedback.style.display = 'none';

  const revealBtn = document.getElementById('matching-reveal-btn');
  if (revealBtn) revealBtn.style.display = 'none';
}

// Mode switching (updated)
function switchStudyMode(mode, clickedTab) {
  document.querySelectorAll('.study-tab').forEach(t => t.classList.remove('active'));
  clickedTab.classList.add('active');

  document.getElementById('flashcards-mode').style.display = mode === 'flashcards' ? 'block' : 'none';
  document.getElementById('quiz-mode').style.display = mode === 'quiz' ? 'block' : 'none';
  document.getElementById('whoami-mode').style.display = mode === 'whoami' ? 'block' : 'none';
  document.getElementById('matching-mode').style.display = mode === 'matching' ? 'block' : 'none';

  if (mode === 'flashcards' && currentFlashcards.length === 0) {
    loadNewFlashcardDeck();
  }
}

// Keyboard support for flashcards
document.addEventListener('keydown', function(e) {
  const flashcardsPanel = document.getElementById('flashcards-mode');
  if (!flashcardsPanel || flashcardsPanel.style.display === 'none') return;

  if (e.key === ' ' || e.key === 'Spacebar') {
    e.preventDefault();
    flipFlashcard();
  }
  if (e.key === 'ArrowRight') nextFlashcard();
  if (e.key.toLowerCase() === 'k') markFlashcardKnown();
});

// Initialize study tools when page loads
function initStudyTools() {
  loadFlashcardProgress();

  // Initial deck load for flashcards
  const sourceSelect = document.getElementById('flashcardSource');
  if (sourceSelect) {
    sourceSelect.value = 'glossary';
    setTimeout(() => {
      loadNewFlashcardDeck();
    }, 50);
  }

  // Keyboard hint
  console.log('%c[Study Tools] Flashcards ready. Press Space to flip, → for next, K to mark known.', 'color:#666');
}

// ── GLOBAL SEARCH ─────────────────────────────────────────────
function handleGlobalSearch(event) {
  const input = event.target;
  const resultsPanel = document.getElementById('searchResults');
  const query = input.value.trim().toLowerCase();

  if (query.length < 2) {
    resultsPanel.classList.remove('open');
    return;
  }

  let html = '';
  let count = 0;

  // Search Aircraft
  const aircraftResults = AIRCRAFT.filter(a =>
    a.name.toLowerCase().includes(query) ||
    a.desig.toLowerCase().includes(query) ||
    a.overview.toLowerCase().includes(query) ||
    (a.tags && a.tags.join(' ').toLowerCase().includes(query))
  ).slice(0, 5);

  if (aircraftResults.length) {
    html += `<div class="search-result-group">Aircraft</div>`;
    aircraftResults.forEach(a => {
      html += `
        <div class="search-result-item" onclick="selectSearchResult('aircraft', '${a.id}')">
          <span class="result-type">${a.typeName}</span>
          <div class="result-title">${a.desig} ${a.name}</div>
          <div class="result-subtitle">${a.tagline ? a.tagline.substring(0,80) + '...' : ''}</div>
        </div>`;
      count++;
    });
  }

  // Search Maritime
  const maritimeResults = MARITIME.filter(v =>
    v.name.toLowerCase().includes(query) ||
    v.desig.toLowerCase().includes(query) ||
    v.overview.toLowerCase().includes(query) ||
    (v.tags && v.tags.join(' ').toLowerCase().includes(query))
  ).slice(0, 5);

  if (maritimeResults.length) {
    html += `<div class="search-result-group">Maritime</div>`;
    maritimeResults.forEach(v => {
      html += `
        <div class="search-result-item" onclick="selectSearchResult('maritime', '${v.id}')">
          <span class="result-type">${v.typeName}</span>
          <div class="result-title">${v.desig} — ${v.name}</div>
          <div class="result-subtitle">${v.tagline ? v.tagline.substring(0,80) + '...' : ''}</div>
        </div>`;
      count++;
    });
  }

  // Search Weapons
  const weaponResults = (window.WEAPONS || []).filter(w =>
    w.name.toLowerCase().includes(query) ||
    w.desig.toLowerCase().includes(query) ||
    w.overview.toLowerCase().includes(query) ||
    (w.tags && w.tags.join(' ').toLowerCase().includes(query))
  ).slice(0, 5);

  if (weaponResults.length) {
    html += `<div class="search-result-group">Weapons</div>`;
    weaponResults.forEach(w => {
      html += `
        <div class="search-result-item" onclick="selectSearchResult('weapons', '${w.id}')">
          <span class="result-type">${w.type}</span>
          <div class="result-title">${w.desig} ${w.name}</div>
          <div class="result-subtitle">${w.tagline ? w.tagline.substring(0,80) + '...' : ''}</div>
        </div>`;
      count++;
    });
  }

  // Search Adversary Aircraft (now inside Aircraft section)
  const advResults = (window.ADVERSARY_AIRCRAFT || []).filter(a =>
    a.name.toLowerCase().includes(query) ||
    a.desig.toLowerCase().includes(query) ||
    (a.overview && a.overview.toLowerCase().includes(query)) ||
    (a.recognition && a.recognition.toLowerCase().includes(query))
  ).slice(0, 4);

  if (advResults.length) {
    html += `<div class="search-result-group">Adversary Aircraft</div>`;
    advResults.forEach(a => {
      html += `
        <div class="search-result-item" onclick="selectSearchResult('adversary', '${a.id}')">
          <span class="result-type">${a.origin}</span>
          <div class="result-title">${a.desig} ${a.name}</div>
          <div class="result-subtitle">${a.tagline ? a.tagline.substring(0,80) + '...' : ''}</div>
        </div>`;
      count++;
    });
  }

  // Search Glossary
  const glossaryResults = GLOSSARY.filter(g =>
    g.term.toLowerCase().includes(query) ||
    g.full.toLowerCase().includes(query) ||
    g.definition.toLowerCase().includes(query)
  ).slice(0, 6);

  if (glossaryResults.length) {
    html += `<div class="search-result-group">Glossary</div>`;
    glossaryResults.forEach(g => {
      html += `
        <div class="search-result-item" onclick="selectSearchResult('glossary', '${g.term}')">
          <span class="result-type">${g.category}</span>
          <div class="result-title">${g.term} — ${g.full}</div>
          <div class="result-subtitle">${g.definition.substring(0,85)}...</div>
        </div>`;
      count++;
    });
  }

  if (count === 0) {
    html = `<div class="search-result-item" style="color:var(--text-dim);">No results found for "${query}"</div>`;
  }

  resultsPanel.innerHTML = html;
  resultsPanel.classList.add('open');

  // Close on Escape
  if (event.key === 'Escape') {
    resultsPanel.classList.remove('open');
    input.blur();
  }
}

function selectSearchResult(type, id) {
  const resultsPanel = document.getElementById('searchResults');
  resultsPanel.classList.remove('open');

  // Clear search input
  const searchInput = document.getElementById('globalSearch');
  if (searchInput) searchInput.value = '';

  if (type === 'aircraft') {
    const navEl = document.querySelector('.nav-link[data-section="airforce"]');
    showSection('airforce', navEl);
    setTimeout(() => openAircraftModal(id), 350);
  } else if (type === 'maritime') {
    const navEl = document.querySelector('.nav-link[data-section="navy"]');
    showSection('navy', navEl);
    setTimeout(() => showMaritimeDetail(id), 450);
  } else if (type === 'glossary') {
    const navEl = document.querySelector('.nav-link[data-section="glossary"]');
    showSection('glossary', navEl);
  } else if (type === 'weapons') {
    const navEl = document.querySelector('.nav-link[data-section="weapons"]');
    showSection('weapons', navEl);
    setTimeout(() => showWeaponDetail(id), 450);
  } else if (type === 'adversary') {
    const navEl = document.querySelector('.nav-link[data-section="airforce"]');
    showSection('airforce', navEl);
    setTimeout(() => showAdversaryDetail(id), 450);
  }
}

// Close search results when clicking outside
document.addEventListener('click', function(e) {
  const search = document.querySelector('.nav-search');
  const results = document.getElementById('searchResults');
  if (search && results && !search.contains(e.target)) {
    results.classList.remove('open');
  }
});

// ── MARITIME DETAIL MODAL (identical pattern to Aircraft) ─────────
function showMaritimeDetail(id) {
  const vessel = MARITIME.find(v => v.id === id);
  if (!vessel) return;

  const statsHTML = vessel.stats.map(s => `<div class="modal-stat"><div class="modal-stat-val">${s.v}</div><div class="modal-stat-key">${s.k}</div></div>`).join('');

  const sysHTML = vessel.systems.map(s => `
    <li class="system-item">
      <div>
        <div class="system-name">${s.name}</div>
        <div class="system-code">${s.code}</div>
      </div>
      <div>
        <div class="system-desc">${s.desc}</div>
        <div class="layman-box"><strong>Plain English</strong>${s.layman}</div>
      </div>
    </li>
  `).join('');

  document.getElementById('modalInner').innerHTML = `
    <div class="modal-hero">
      <img src="${vessel.img}" alt="${vessel.name}">
      <div class="modal-hero-overlay"></div>
      <div class="modal-hero-text">
        <div class="modal-desig">${vessel.desig} · ${vessel.typeName}</div>
        <div class="modal-name">${vessel.name}</div>
      </div>
    </div>
    <div class="modal-body">
      <div class="modal-stats-row">${statsHTML}</div>
      <div class="modal-tabs">
        <div class="modal-tab active" onclick="switchTab(event,'overview-${id}')">Overview</div>
        <div class="modal-tab" onclick="switchTab(event,'systems-${id}')">Sensors & Armament</div>
      </div>
      <div class="modal-tab-pane active" id="overview-${id}">
        <p class="modal-desc">${vessel.overview}</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">${vessel.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      </div>
      <div class="modal-tab-pane" id="systems-${id}">
        <ul class="system-list">${sysHTML}</ul>
      </div>
    </div>
  `;

  document.getElementById('aircraftModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ── GLOSSARY ──────────────────────────────────────────────────
function buildGlossary() {
  const grid = document.getElementById('glossaryGrid');
  if (!grid) return;

  grid.innerHTML = GLOSSARY.map(item => `
    <div class="glossary-term" data-category="${item.category}">
      <div class="glossary-term-header">
        <span class="acronym">${item.term}</span>
        <span class="full-name">${item.full}</span>
      </div>
      <span class="glossary-category">${item.category.toUpperCase()}</span>
      <div class="glossary-definition">${item.definition}</div>
      <div class="glossary-why">
        <strong>Why it matters in an interview</strong>
        ${item.whyItMatters}
      </div>
    </div>
  `).join('');
}

function filterGlossary() {
  const query = document.getElementById('glossarySearch').value.toLowerCase().trim();
  const terms = document.querySelectorAll('#glossaryGrid .glossary-term');

  terms.forEach(term => {
    const text = term.textContent.toLowerCase();
    term.style.display = text.includes(query) ? '' : 'none';
  });
}

function filterGlossaryByCategory(category, clickedElement) {
  // Update active filter button
  document.querySelectorAll('.glossary-filter').forEach(el => el.classList.remove('active'));
  clickedElement.classList.add('active');

  const terms = document.querySelectorAll('#glossaryGrid .glossary-term');
  const searchValue = document.getElementById('glossarySearch').value.toLowerCase().trim();

  terms.forEach(term => {
    const matchesCategory = (category === 'all') || term.dataset.category === category;
    const matchesSearch = !searchValue || term.textContent.toLowerCase().includes(searchValue);
    term.style.display = (matchesCategory && matchesSearch) ? '' : 'none';
  });
}

// ── VEHICLES GRID (new) ───────────────────────────────────────
function buildVehiclesGrid() {
  const container = document.getElementById('vehicles-grid');
  if (!container) return;

  const ausData = window.ARMY || (typeof ARMY !== 'undefined' ? ARMY : []);
  const advData = window.ADVERSARY_ARMY || (typeof ADVERSARY_ARMY !== 'undefined' ? ADVERSARY_ARMY : []);

  let html = '';

  // Split Australian Army data into Ground Vehicles vs Aviation
  const groundVehicles = ausData.filter(v => 
    !((v.typeName && v.typeName.toLowerCase().includes('helicopter')) || 
      (v.tags && v.tags.join(' ').toLowerCase().includes('aviation')))
  );

  const armyAviation = ausData.filter(v => 
    (v.typeName && v.typeName.toLowerCase().includes('helicopter')) || 
    (v.tags && v.tags.join(' ').toLowerCase().includes('aviation'))
  );

  // Ground Vehicles
  if (groundVehicles.length > 0) {
    html += `<div class="aircraft-section-header"><h3>Australian Army - Ground Vehicles</h3></div>`;
    html += `<div class="vehicles-category-grid">`;
    html += groundVehicles.map(v => `
      <div class="fleet-card" id="army-${v.id}" onclick="showVehicleDetail('${v.id}')">
        <div class="fleet-img-wrap">
          ${v.img ? `<img src="${v.img}" alt="${v.name}">` : `<div style="height:140px; background:var(--navy-mid); display:flex; align-items:center; justify-content:center; color:var(--text-dim); font-size:13px;">Photo coming soon</div>`}
          <span class="fleet-type-badge">${v.typeName}</span>
        </div>
        <div class="fleet-card-body">
          <div class="fleet-designation">${v.desig}</div>
          <div class="fleet-name">${v.name}</div>
          <div class="fleet-role">${v.tagline}</div>
          <div class="fleet-specs">${v.stats.map(s => `${s.v}`).join(' • ')}</div>
          <div class="fleet-tags">
            ${v.tags ? v.tags.map(t => `<span class="tag">${t}</span>`).join('') : ''}
          </div>
        </div>
      </div>
    `).join('');
    html += `</div>`;
  }

  // Army Aviation (Helicopters)
  if (armyAviation.length > 0) {
    html += `<div class="aircraft-section-header"><h3>Army Aviation - Helicopters</h3></div>`;
    html += `<div class="vehicles-category-grid">`;
    html += armyAviation.map(v => `
      <div class="fleet-card" id="army-${v.id}" onclick="showVehicleDetail('${v.id}')">
        <div class="fleet-img-wrap">
          ${v.img ? `<img src="${v.img}" alt="${v.name}">` : `<div style="height:140px; background:var(--navy-mid); display:flex; align-items:center; justify-content:center; color:var(--text-dim); font-size:13px;">Photo coming soon</div>`}
          <span class="fleet-type-badge">Army Aviation</span>
        </div>
        <div class="fleet-card-body">
          <div class="fleet-designation">${v.desig}</div>
          <div class="fleet-name">${v.name}</div>
          <div class="fleet-role">${v.tagline}</div>
          <div class="fleet-specs">${v.stats.map(s => `${s.v}`).join(' • ')}</div>
          <div class="fleet-tags">
            ${v.tags ? v.tags.map(t => `<span class="tag">${t}</span>`).join('') : ''}
          </div>
        </div>
      </div>
    `).join('');
    html += `</div>`;
  }

  // Adversary Vehicles header + grid
  if (advData.length > 0) {
    html += `<div class="aircraft-section-header threat"><h3>Adversary Army Vehicles (China / Russia)</h3></div>`;
    html += `<div class="vehicles-category-grid">`;
    html += advData.map(v => `
      <div class="fleet-card" id="adv-vehicle-${v.id}" onclick="showAdversaryVehicleDetail('${v.id}')">
        <div class="fleet-img-wrap">
          ${v.img ? `<img src="${v.img}" alt="${v.name}">` : `<div style="height:140px; background:var(--navy-mid); display:flex; align-items:center; justify-content:center; color:var(--text-dim); font-size:13px;">Photo coming soon</div>`}
          <span class="fleet-type-badge badge-adversary">${v.typeName}</span>
        </div>
        <div class="fleet-card-body">
          <div class="fleet-designation">${v.desig}</div>
          <div class="fleet-name">${v.name}</div>
          <div class="fleet-role">${v.tagline}</div>
          <div class="fleet-specs">${v.stats.map(s => `${s.v}`).join(' • ')}</div>
          <div class="fleet-tags">
            ${v.tags ? v.tags.map(t => `<span class="tag">${t}</span>`).join('') : ''}
          </div>
        </div>
      </div>
    `).join('');
    html += `</div>`;
  }

  if (!ausData.length && !advData.length) {
    html = `<div style="padding:40px; text-align:center; color:var(--text-muted); grid-column:1/-1;">Vehicles data not loaded.</div>`;
  }

  container.innerHTML = html;
}

// ── VEHICLES DETAIL MODALS (now matching Aircraft & Maritime style) ─────────
function showVehicleDetail(id) {
  const v = (window.VEHICLES || VEHICLES || []).find(x => x.id === id);
  if (!v) return;

  const statsHTML = v.stats.map(s => `<div class="modal-stat"><div class="modal-stat-val">${s.v}</div><div class="modal-stat-key">${s.k}</div></div>`).join('');

  const sysHTML = v.systems ? v.systems.map(s => `
    <li class="system-item">
      <div>
        <div class="system-name">${s.name}</div>
        <div class="system-code">${s.code}</div>
      </div>
      <div>
        <div class="system-desc">${s.desc}</div>
        <div class="layman-box"><strong>Plain English</strong>${s.layman}</div>
      </div>
    </li>
  `).join('') : '';

  const modalInner = document.getElementById('modalInner');
  if (!modalInner) return;

  const heroHTML = (v.img && v.img.trim() !== '') ? `
    <div class="modal-hero">
      <img src="${v.img}" alt="${v.name}">
      <div class="modal-hero-overlay"></div>
      <div class="modal-hero-text">
        <div class="modal-desig">${v.desig} · ${v.typeName}</div>
        <div class="modal-name">${v.name}</div>
      </div>
    </div>` : '';

  modalInner.innerHTML = `
    ${heroHTML}
    <div class="modal-body">
      <div class="modal-stats-row">${statsHTML}</div>

      <div class="modal-tabs">
        <div class="modal-tab active" onclick="switchTab(event,'overview-${id}')">Overview</div>
        <div class="modal-tab" onclick="switchTab(event,'systems-${id}')">Key Systems</div>
      </div>

      <div class="modal-tab-pane active" id="overview-${id}">
        <p class="modal-desc">${v.overview}</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">${v.tags ? v.tags.map(t => `<span class="tag">${t}</span>`).join('') : ''}</div>
      </div>

      <div class="modal-tab-pane" id="systems-${id}">
        <ul class="system-list">${sysHTML}</ul>
      </div>
    </div>
  `;

  document.getElementById('aircraftModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function showAdversaryVehicleDetail(id) {
  const v = (window.ADVERSARY_VEHICLES || ADVERSARY_VEHICLES || []).find(x => x.id === id);
  if (!v) return;

  const statsHTML = v.stats.map(s => `<div class="modal-stat"><div class="modal-stat-val">${s.v}</div><div class="modal-stat-key">${s.k}</div></div>`).join('');

  const sysHTML = v.systems ? v.systems.map(s => `
    <li class="system-item">
      <div>
        <div class="system-name">${s.name}</div>
        <div class="system-code">${s.code}</div>
      </div>
      <div>
        <div class="system-desc">${s.desc}</div>
        <div class="layman-box"><strong>Plain English</strong>${s.layman}</div>
      </div>
    </li>
  `).join('') : '';

  const modalInner = document.getElementById('modalInner');
  if (!modalInner) return;

  const heroHTML = (v.img && v.img.trim() !== '') ? `
    <div class="modal-hero">
      <img src="${v.img}" alt="${v.name}">
      <div class="modal-hero-overlay"></div>
      <div class="modal-hero-text">
        <div class="modal-desig">${v.desig} · ${v.typeName}</div>
        <div class="modal-name">${v.name}</div>
      </div>
    </div>` : '';

  modalInner.innerHTML = `
    ${heroHTML}
    <div class="modal-body">
      <div class="modal-stats-row">${statsHTML}</div>

      <div class="modal-tabs">
        <div class="modal-tab active" onclick="switchTab(event,'overview-${id}')">Overview</div>
        <div class="modal-tab" onclick="switchTab(event,'systems-${id}')">Key Systems</div>
      </div>

      <div class="modal-tab-pane active" id="overview-${id}">
        <p class="modal-desc">${v.overview}</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">${v.tags ? v.tags.map(t => `<span class="tag">${t}</span>`).join('') : ''}</div>
      </div>

      <div class="modal-tab-pane" id="systems-${id}">
        <ul class="system-list">${sysHTML}</ul>
      </div>
    </div>
  `;

  document.getElementById('aircraftModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ── WEAPONS GRID & MODAL ──────────────────────────────────────
// Renders four separate grouped grids (australian-strike, australian-fleet, defensive, adversary)
function buildWeaponsGrid() {
  const groups = [
    { id: 'australianStrikeGrid', group: 'australian-strike' },
    { id: 'australianFleetGrid',  group: 'australian-fleet' },
    { id: 'defensiveGrid',        group: 'defensive' },
    { id: 'adversaryWeaponsGrid', group: 'adversary' }
  ];

  const weaponsData = window.WEAPONS || (typeof WEAPONS !== 'undefined' ? WEAPONS : null);

  if (!weaponsData || !Array.isArray(weaponsData) || weaponsData.length === 0) {
    // Show error in the first grid only (others will be empty but harmless)
    const firstGrid = document.getElementById('australianStrikeGrid');
    if (firstGrid) {
      firstGrid.innerHTML = `
        <div style="padding: 40px; text-align: center; color: var(--text-muted); grid-column: 1 / -1;">
          <p><strong>No weapons data loaded.</strong></p>
          <p style="font-size: 13px; margin-top: 8px;">Try a hard refresh (Cmd/Ctrl + Shift + R).</p>
        </div>
      `;
    }
    console.warn('WEAPONS data is missing or empty');
    return;
  }

  groups.forEach(({ id, group }) => {
    const container = document.getElementById(id);
    if (!container) return;

    const filtered = weaponsData.filter(w => w.group === group);

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-dim); font-size: 13px; grid-column: 1 / -1;">
          No entries in this category yet.
        </div>
      `;
      return;
    }

      try {
          let html = '';
          for (let i = 0; i < filtered.length; i++) {
            const w = filtered[i];
            html += '<div class="weapons-card" id="weapon-' + w.id + '" onclick="showWeaponDetail(\'' + w.id + '\')">' +
              '<div class="weapons-img-wrap"><img src="' + w.img + '" alt="' + w.name + '"></div>' +
              '<div class="weapons-card-body">' +
                '<div class="weapons-designation">' + w.desig + ' · ' + w.type + '</div>' +
                '<div class="weapons-name">' + w.name + '</div>' +
                '<div class="weapons-role">' + w.tagline + '</div>' +
                '<div class="weapons-specs">' + w.stats.map(function(s){return s.v;}).join(' • ') + '</div>' +
              '</div>' +
            '</div>';
          }
          container.innerHTML = html;
        } catch (err) {
          console.error('Error building weapons grid for group ' + group + ':', err);
          container.innerHTML = '<div style="padding:24px;text-align:center;color:#E05A40;font-size:13px;">Error rendering this section. Check console.</div>';
        }
  });

  // Build left sidebar TOC after cards exist
  buildWeaponsTOC();
}

function buildWeaponsTOC() {
  const toc = document.getElementById('weaponsToc');
  if (!toc) return;

  const groups = [
    { label: 'Australian Strike Weapons', gridId: 'australianStrikeGrid' },
    { label: 'Australian Fleet & Vessel Weaponry', gridId: 'australianFleetGrid' },
    { label: 'Fleet Air & Missile Defence', gridId: 'defensiveGrid' },
    { label: 'Adversary Weapons', gridId: 'adversaryWeaponsGrid', threat: true }
  ];

  let html = `<ul>`;

  groups.forEach(g => {
    const container = document.getElementById(g.gridId);
    if (!container) return;

    const cards = container.querySelectorAll('.weapons-card');
    if (cards.length === 0) return;

    const headerStyle = g.threat ? ' style="color:#c96a5f; border-color: rgba(192,57,43,0.3);"' : '';
    html += `<li class="toc-header"${headerStyle}>${g.label}</li>`;

    cards.forEach(card => {
      const id = card.id;
      const nameEl = card.querySelector('.weapons-name');
      const name = nameEl ? nameEl.textContent.trim() : 'Weapon';
      const colorStyle = g.threat ? ' style="color:#e07a6b;"' : '';
      html += `<li><a href="#${id}" data-target="${id}"${colorStyle}>${name}</a></li>`;
    });
  });

  html += `</ul>`;
  toc.innerHTML = html;
}

function showWeaponDetail(id) {
  const weapon = WEAPONS.find(w => w.id === id);
  if (!weapon) return;

  const statsHTML = weapon.stats.map(s => `<div class="modal-stat"><div class="modal-stat-val">${s.v}</div><div class="modal-stat-key">${s.k}</div></div>`).join('');

  const sysHTML = weapon.systems.map(s => `
    <li class="system-item">
      <div>
        <div class="system-name">${s.name}</div>
        <div class="system-code">${s.code}</div>
      </div>
      <div>
        <div class="system-desc">${s.desc}</div>
        <div class="layman-box"><strong>Plain English</strong>${s.layman}</div>
      </div>
    </li>
  `).join('');

  document.getElementById('modalInner').innerHTML = `
    <div class="modal-hero">
      <img src="${weapon.img}" alt="${weapon.name}">
      <div class="modal-hero-overlay"></div>
      <div class="modal-hero-text">
        <div class="modal-desig">${weapon.desig} · ${weapon.type}</div>
        <div class="modal-name">${weapon.name}</div>
      </div>
    </div>
    <div class="modal-body">
      <div class="modal-stats-row">${statsHTML}</div>
      <div class="modal-tabs">
        <div class="modal-tab active" onclick="switchTab(event,'overview-${id}')">Overview</div>
        <div class="modal-tab" onclick="switchTab(event,'systems-${id}')">Guidance & Systems</div>
      </div>
      <div class="modal-tab-pane active" id="overview-${id}">
        <p class="modal-desc">${weapon.overview}</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">${weapon.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      </div>
      <div class="modal-tab-pane" id="systems-${id}">
        <ul class="system-list">${sysHTML}</ul>
      </div>
    </div>
  `;

  document.getElementById('aircraftModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function showAdversaryDetail(id) {
  const ac = ADVERSARY_AIRCRAFT.find(a => a.id === id);
  if (!ac) return;

  const statsHTML = ac.stats.map(s => `<div class="modal-stat"><div class="modal-stat-val">${s.v}</div><div class="modal-stat-key">${s.k}</div></div>`).join('');

  let tabsHTML = `
    <div class="modal-tab active" onclick="switchTab(event,'overview-${id}')">Overview</div>
    <div class="modal-tab" onclick="switchTab(event,'systems-${id}')">Systems & Weapons</div>
  `;
  let panesHTML = `
    <div class="modal-tab-pane active" id="overview-${id}">
      <p class="modal-desc">${ac.overview}</p>
    </div>
    <div class="modal-tab-pane" id="systems-${id}">
      <ul class="system-list">
        ${ac.systems ? ac.systems.map(s => `
          <li class="system-item">
            <div>
              <div class="system-name">${s.name}</div>
              <div class="system-code">${s.code}</div>
            </div>
            <div>
              <div class="system-desc">${s.desc}</div>
              <div class="layman-box"><strong>Plain English</strong>${s.layman}</div>
            </div>
          </li>
        `).join('') : '<li>No detailed systems information available.</li>'}
      </ul>
    </div>
  `;

  // Fallback for any old entries without systems (keeps recognition tab)
  if (!ac.systems) {
    tabsHTML = `
      <div class="modal-tab active" onclick="switchTab(event,'overview-${id}')">Overview</div>
      <div class="modal-tab" onclick="switchTab(event,'recognition-${id}')">Recognition & Threat</div>
    `;
    panesHTML = `
      <div class="modal-tab-pane active" id="overview-${id}">
        <p class="modal-desc">${ac.overview}</p>
      </div>
      <div class="modal-tab-pane" id="recognition-${id}">
        <div style="margin-bottom:16px">
          <strong style="color:var(--gold)">Visual & Radar Recognition</strong>
          <p class="modal-desc" style="margin-top:8px">${ac.recognition}</p>
        </div>
        <div>
          <strong style="color:var(--gold)">Why it matters to RAAF crews</strong>
          <p class="modal-desc" style="margin-top:8px">${ac.whyMatters}</p>
        </div>
      </div>
    `;
  }

  document.getElementById('modalInner').innerHTML = `
    <div class="modal-hero">
      <img src="${ac.img}" alt="${ac.name}">
      <div class="modal-hero-overlay"></div>
      <div class="modal-hero-text">
        <div class="modal-desig">${ac.desig} · ${ac.origin}</div>
        <div class="modal-name">${ac.name}</div>
      </div>
    </div>
    <div class="modal-body">
      <div class="modal-stats-row">${statsHTML}</div>
      <div class="modal-tabs">
        ${tabsHTML}
      </div>
      ${panesHTML}
    </div>
  `;

  document.getElementById('aircraftModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ── OPERATIONS ────────────────────────────────────────────────
function buildOpsGrid() {
  const grid = document.getElementById('opsGrid');
  grid.innerHTML = OPERATIONS.map(op => `
    <div class="op-card" id="opcard-${op.id}" onclick="selectOp('${op.id}',null)">
      <div class="op-header">
        <div>
          <div class="op-region">${op.region}</div>
          <div class="op-name">${op.name}</div>
        </div>
        <div class="op-status active">Active</div>
      </div>
      <p class="op-desc">${op.desc}</p>
      <div class="op-assets">
        ${op.assets.map((a,i) => `<span class="asset-tag ${op.types[i]||''}">${a}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

function selectOp(id, event) {
  document.querySelectorAll('.op-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.op-dot').forEach(d => d.classList.remove('selected'));

  const card = document.getElementById('opcard-'+id);
  if (card) {
    card.classList.add('selected');
    card.scrollIntoView({ behavior:'smooth', block:'nearest' });
  }

  const dot = document.querySelector(`.op-dot[data-op="${id}"]`);
  if (dot) dot.classList.add('selected');
}

// ── THEME SWITCHER ────────────────────────────────────────────
const THEMES = ['default', 'midnight', 'light'];
const THEME_NAMES = {
  'default': 'Default',
  'midnight': 'Midnight',
  'light': 'Light'
};

function setTheme(theme) {
  if (!THEMES.includes(theme)) theme = 'default';

  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('raaf-theme', theme);

  // Update label
  const nameEl = document.getElementById('currentThemeName');
  if (nameEl) nameEl.textContent = THEME_NAMES[theme] || 'Default';
}

function cycleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'default';
  const currentIndex = THEMES.indexOf(current);
  const nextIndex = (currentIndex + 1) % THEMES.length;
  const nextTheme = THEMES[nextIndex];

  setTheme(nextTheme);
}

function initThemeSwitcher() {
  // Load saved theme or default
  const saved = localStorage.getItem('raaf-theme') || 'default';
  setTheme(saved);

  // Attach click handler
  const toggleBtn = document.getElementById('themeToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', cycleTheme);
  }

  // Optional: keyboard support (T key cycles theme when not typing)
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 't' && 
        document.activeElement.tagName !== 'INPUT' && 
        document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      cycleTheme();
    }
  });
}

// ── INIT ──────────────────────────────────────────────────────
buildAircraftGrid();
buildOpsGrid();
buildGlossary();
buildWeaponsGrid();
buildVehiclesGrid();
initStudyTools();
initThemeSwitcher();
initMainNavigation();

// Keyboard support (Escape closes modal)
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});
