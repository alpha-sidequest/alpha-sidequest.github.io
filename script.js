// ============================================
// ADF Forge - Interactivity
// ============================================
// Maps (selectBase + renderBaseCard with aerial/GMaps), modals, grids, glossary wrapping + cross-refs,
// study tools, showSection, etc. Data-driven from data.js. Keep edits minimal.

console.log('%c[ADF Forge] script.js loaded', 'color: limegreen; font-size: 13px');

// Glossary tooltip state (initialized early to avoid TDZ in any render paths)
let glossaryMap = new Map();
let previewMap = new Map(); // for rich platform/weapon previews

// Early auto-register so that wrapGlossaryTerms calls during initial grid builds (weapons cards etc.)
// already see all SYSTEMS + WEAPONS + platforms for cross-refs. (Full rich manual entries added later in tooltip block.)
try {
  const earlySources = [];
  if (typeof AIRCRAFT !== 'undefined' && Array.isArray(AIRCRAFT)) earlySources.push(...AIRCRAFT);
  if (typeof NAVY !== 'undefined' && Array.isArray(NAVY)) earlySources.push(...NAVY);
  if (typeof WEAPONS !== 'undefined' && Array.isArray(WEAPONS)) earlySources.push(...WEAPONS);
  if (typeof SYSTEMS !== 'undefined' && Array.isArray(SYSTEMS)) earlySources.push(...SYSTEMS);
  if (typeof ADVERSARY_VEHICLES !== 'undefined' && Array.isArray(ADVERSARY_VEHICLES)) earlySources.push(...ADVERSARY_VEHICLES);
  if (typeof ADVERSARY_AIRCRAFT !== 'undefined' && Array.isArray(ADVERSARY_AIRCRAFT)) earlySources.push(...ADVERSARY_AIRCRAFT);
  earlySources.forEach(item => {
    if (!item || !item.id || !item.name) return;
    const key = item.id.toLowerCase();
    if (previewMap.has(key)) return;
    const shortDesc = item.tagline || (item.overview ? item.overview.substring(0, 140) + '...' : item.name);
    let typ = 'airforce';
    const d = (item.desig || '').toUpperCase();
    if (item.group) typ = 'weapon';
    else if (d.includes('FFH') || d.includes('LHD') || d.includes('DDG') || d.includes('LSD') || d.includes('SSN') || d.includes('SSK')) typ = 'navy';
    else if (item.origin || /type0|j-?1[0-9]|kilo|j20|j16|j15|j11/i.test((item.id||'') + (item.name||''))) typ = 'adversary';
    previewMap.set(key, { title: item.desig ? `${item.desig} ${item.name}` : item.name, short: shortDesc, img: item.img || null, type: typ, id: item.id });
    const fn = item.name.toLowerCase();
    if (!previewMap.has(fn)) previewMap.set(fn, { title: item.desig ? `${item.desig} ${item.name}` : item.name, short: shortDesc, img: item.img || null, type: typ, id: item.id });
    // Also register desig variants (with/without hyphens) so mentions like "C-130J", "F-35A" in overviews get wrapped and linked
    if (item.desig) {
      const dlow = item.desig.toLowerCase();
      if (!previewMap.has(dlow)) {
        previewMap.set(dlow, { title: item.desig ? `${item.desig} ${item.name}` : item.name, short: shortDesc, img: item.img || null, type: typ, id: item.id });
      }
      const dnorm = dlow.replace(/-/g, '');
      if (dnorm !== dlow && !previewMap.has(dnorm)) {
        previewMap.set(dnorm, { title: item.desig ? `${item.desig} ${item.name}` : item.name, short: shortDesc, img: item.img || null, type: typ, id: item.id });
      }
    }
  });
} catch(e){}

// ── SECTION SWITCHING ─────────────────────────────────────────
function showSection(id, el) {
  console.log('%c[RAFF DEBUG] showSection called with id =', 'color: cyan', id);

  // Force hide ALL sections (robust against any CSS specificity or timing issues)
  document.querySelectorAll('section').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const sectionEl = document.getElementById(id);
  if (sectionEl) {
    sectionEl.classList.add('active');
    sectionEl.style.display = 'block';
  } else {
    console.warn('[RAFF DEBUG] No section found with id:', id);
  }

  // Prefer the passed element, otherwise auto-find by data-section
  let navEl = el;
  if (!navEl) {
    navEl = document.querySelector(`.nav-link[data-section="${id}"]`);
  }
  if (navEl) navEl.classList.add('active');

  // Scroll the activated section into view (more reliable than always top:0 for long pages)
  if (sectionEl) {
    // small timeout so the display:block has taken effect for measurement
    setTimeout(() => {
      sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 10);
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
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
      <div class="base-card-name">${b.name.replace(/^(RAAF Base |HMAS |Army Aviation Centre ) /i,'')}</div>
      <div class="base-card-role">${b.role}</div>
    </div>
    <div class="base-card-body">
      <div class="base-section-label">About this base</div>
      <p class="base-desc">${b.desc}</p>
      ${b.image ? `
      <div class="base-section-label">Aerial View</div>
      <div class="base-aerial-wrap">
        <img src="${b.image}" alt="Bird's-eye view of ${b.name}" class="base-aerial-preview" onclick="showBaseAerial('${b.image}', '${b.name.replace(/'/g, "\\'")}')" loading="lazy">
        <div class="base-aerial-hint">Google Maps satellite • Click to enlarge</div>
      </div>
      ` : ''}
      ${b.lat && b.lng ? `
      <div class="base-section-label">Live Satellite</div>
      <a href="https://www.google.com/maps/@${b.lat},${b.lng},18z/data=!3m1!1e3" target="_blank" rel="noopener noreferrer" class="google-maps-link">Open full satellite view on Google Maps →</a>
      <p style="font-size:10px;color:var(--text-dim);margin-top:4px">Live Google Maps (internet required)</p>
      ` : ''}
      <div class="base-section-label">Units & Assets</div>
      ${sqHTML}
      <p style="font-size:11px;color:var(--text-dim);margin-top:12px">Tap aircraft names above to view full aircraft details</p>
    </div>
  `;
}

function showBaseAerial(imageSrc, baseName) {
  const modal = document.getElementById('baseImageModal');
  const inner = document.getElementById('baseImageInner');
  inner.innerHTML = `
    <div class="base-image-hero">
      <img src="${imageSrc}" alt="Bird's-eye view of ${baseName}" loading="lazy">
    </div>
    <div class="base-image-meta">
      <div class="base-image-title">${baseName}</div>
      <div class="base-image-subtitle">Bird's eye view • Google Maps satellite imagery</div>
    </div>
  `;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeBaseImageModal() {
  const modal = document.getElementById('baseImageModal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// Close base image modal on overlay click
document.getElementById('baseImageModal').addEventListener('click', function(e) {
  if (e.target === this) closeBaseImageModal();
});

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
        <div class="aircraft-card" id="ac-${ac.id}" data-detail-id="${ac.id}">
          <div class="aircraft-img-wrap">
            <img src="${ac.img}" alt="${ac.name}" loading="lazy">
            <span class="aircraft-type-badge badge-${ac.type}">${ac.typeName}</span>
          </div>
          <div class="aircraft-card-body">
            <div class="aircraft-designation">${ac.desig}</div>
            <div class="aircraft-name">${ac.name}</div>
            <div class="aircraft-tagline">${wrapGlossaryTerms(ac.tagline)}</div>
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
        <div class="aircraft-card" id="adv-${a.id}" data-detail-id="${a.id}">
          <div class="aircraft-img-wrap">
            <img src="${a.img}" alt="${a.name}" loading="lazy">
            <span class="aircraft-type-badge badge-adversary">${a.typeName}</span>
          </div>
          <div class="aircraft-card-body">
            <div class="aircraft-designation">${a.desig} · ${a.origin}</div>
            <div class="aircraft-name">${a.name}</div>
            <div class="aircraft-tagline">${wrapGlossaryTerms(a.tagline)}</div>
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
        <div class="system-name">${wrapGlossaryTerms(s.name)}</div>
        <div class="system-code">${s.code}</div>
      </div>
      <div>
        <div class="system-desc">${wrapGlossaryTerms(s.desc)}</div>
        <div class="layman-box"><strong>Plain English</strong>${wrapGlossaryTerms(s.layman)}</div>
      </div>
    </li>
  `).join('');

  document.getElementById('modalInner').innerHTML = `
    <div class="modal-hero">
      <img src="${ac.img}" alt="${ac.name}" loading="lazy">
      <div class="modal-hero-overlay"></div>
      <div class="modal-hero-text">
        <div class="modal-desig">${wrapGlossaryTerms(ac.desig)} · ${wrapGlossaryTerms(ac.typeName)}</div>
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
        <p class="modal-desc">${wrapGlossaryTerms(ac.overview)}</p>
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
        back: `${w.tagline}\n\n${w.overview}\n\nKey systems: ${w.systems ? w.systems.map(s => s.name).join(', ') : ''}`,
        source: 'Weapons',
        img: w.img || null
      });
    });
    // Also surface SYSTEMS (radars, sonars, EW, EO/IR etc) under the same study bucket now that section is "Weapons & Systems"
    if (typeof SYSTEMS !== 'undefined' && Array.isArray(SYSTEMS)) {
      SYSTEMS.forEach(s => {
        items.push({
          id: 'sys-' + s.id,
          front: `${s.code || 'SYS'} — ${s.name}`,
          back: `${s.tagline}\n\n${s.overview}\n\nPlatforms: ${(s.platforms||[]).join(', ')}\n\nPlain English: ${s.layman || ''}`,
          source: 'Systems',
          img: s.img || null
        });
      });
    }
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
    const NAVY_DATA = (window.NAVY || (typeof NAVY !== 'undefined' ? NAVY : []));
    NAVY_DATA.forEach(f => {
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
        <img src="${item.img}" alt="${item.front}" style="max-width:100%; max-height:160px; border-radius:6px; border:1px solid var(--border); object-fit:contain;" loading="lazy">
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
    const NAVY_DATA = (window.NAVY || (typeof NAVY !== 'undefined' ? NAVY : []));
    NAVY_DATA.forEach(f => {
      pool.push({
        question: `What is the main role of the ${f.desig} ${f.name}?`,
        correct: f.tagline,
        options: getRandomWrongAnswers(f.tagline, NAVY_DATA.map(x => x.tagline), 3),
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
      ${currentWhoAmIItem.img ? `<img src="${currentWhoAmIItem.img}" alt="${currentWhoAmIItem.front}" style="max-width:100%; max-height:180px; border-radius:6px; border:1px solid var(--border); object-fit:contain; margin:10px 0;" loading="lazy">` : ''}
      ${currentWhoAmIItem.back}
    `;
  } else {
    feedback.innerHTML = `
      <strong style="color:#E05A40">Not quite.</strong><br>
      The answer was: <strong>${currentWhoAmIItem.front}</strong><br><br>
      ${currentWhoAmIItem.img ? `<img src="${currentWhoAmIItem.img}" alt="${currentWhoAmIItem.front}" style="max-width:100%; max-height:180px; border-radius:6px; border:1px solid var(--border); object-fit:contain; margin:10px 0;" loading="lazy">` : ''}
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
    ${currentWhoAmIItem.img ? `<img src="${currentWhoAmIItem.img}" alt="${currentWhoAmIItem.front}" style="max-width:100%; max-height:180px; border-radius:6px; border:1px solid var(--border); object-fit:contain; margin:10px 0;" loading="lazy">` : ''}
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
          <div class="result-subtitle">${a.tagline ? wrapGlossaryTerms(a.tagline.substring(0,80) + '...') : ''}</div>
        </div>`;
      count++;
    });
  }

  // Search Maritime
  const NAVY_DATA = (window.NAVY || (typeof NAVY !== 'undefined' ? NAVY : []));
  const maritimeResults = NAVY_DATA.filter(v =>
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
          <div class="result-subtitle">${v.tagline ? wrapGlossaryTerms(v.tagline.substring(0,80) + '...') : ''}</div>
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
          <div class="result-subtitle">${w.tagline ? wrapGlossaryTerms(w.tagline.substring(0,80) + '...') : ''}</div>
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
          <div class="result-subtitle">${a.tagline ? wrapGlossaryTerms(a.tagline.substring(0,80) + '...') : ''}</div>
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
  const NAVY_DATA = (window.NAVY || (typeof NAVY !== 'undefined' ? NAVY : []));
  const vessel = NAVY_DATA.find(v => v.id === id);
  if (!vessel) return;

  const statsHTML = vessel.stats.map(s => `<div class="modal-stat"><div class="modal-stat-val">${s.v}</div><div class="modal-stat-key">${s.k}</div></div>`).join('');

  const sysHTML = vessel.systems.map(s => `
    <li class="system-item">
      <div>
        <div class="system-name">${wrapGlossaryTerms(s.name)}</div>
        <div class="system-code">${s.code}</div>
      </div>
      <div>
        <div class="system-desc">${wrapGlossaryTerms(s.desc)}</div>
        <div class="layman-box"><strong>Plain English</strong>${wrapGlossaryTerms(s.layman)}</div>
      </div>
    </li>
  `).join('');

  document.getElementById('modalInner').innerHTML = `
    <div class="modal-hero">
      <img src="${vessel.img}" alt="${vessel.name}" loading="lazy">
      <div class="modal-hero-overlay"></div>
      <div class="modal-hero-text">
        <div class="modal-desig">${wrapGlossaryTerms(vessel.desig)} · ${wrapGlossaryTerms(vessel.typeName)}</div>
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
        <p class="modal-desc">${wrapGlossaryTerms(vessel.overview)}</p>
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
      <div class="glossary-definition">${wrapGlossaryTerms(item.definition)}</div>
      <div class="glossary-why">
        <strong>Why it matters in an interview</strong>
        ${wrapGlossaryTerms(item.whyItMatters)}
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
      <div class="fleet-card" id="army-${v.id}" data-detail-id="${v.id}">
        <div class="fleet-img-wrap">
          ${v.img ? `<img src="${v.img}" alt="${v.name}" loading="lazy">` : `<div style="height:140px; background:var(--navy-mid); display:flex; align-items:center; justify-content:center; color:var(--text-dim); font-size:13px;">Photo coming soon</div>`}
          <span class="fleet-type-badge">${v.typeName}</span>
        </div>
        <div class="fleet-card-body">
          <div class="fleet-designation">${v.desig}</div>
          <div class="fleet-name">${v.name}</div>
          <div class="fleet-role">${wrapGlossaryTerms(v.tagline)}</div>
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
      <div class="fleet-card" id="army-${v.id}" data-detail-id="${v.id}">
        <div class="fleet-img-wrap">
          ${v.img ? `<img src="${v.img}" alt="${v.name}" loading="lazy">` : `<div style="height:140px; background:var(--navy-mid); display:flex; align-items:center; justify-content:center; color:var(--text-dim); font-size:13px;">Photo coming soon</div>`}
          <span class="fleet-type-badge">Army Aviation</span>
        </div>
        <div class="fleet-card-body">
          <div class="fleet-designation">${v.desig}</div>
          <div class="fleet-name">${v.name}</div>
          <div class="fleet-role">${wrapGlossaryTerms(v.tagline)}</div>
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
      <div class="fleet-card" id="adv-vehicle-${v.id}" data-detail-id="${v.id}">
        <div class="fleet-img-wrap">
          ${v.img ? `<img src="${v.img}" alt="${v.name}" loading="lazy">` : `<div style="height:140px; background:var(--navy-mid); display:flex; align-items:center; justify-content:center; color:var(--text-dim); font-size:13px;">Photo coming soon</div>`}
          <span class="fleet-type-badge badge-adversary">${v.typeName}</span>
        </div>
        <div class="fleet-card-body">
          <div class="fleet-designation">${v.desig}</div>
          <div class="fleet-name">${v.name}</div>
          <div class="fleet-role">${wrapGlossaryTerms(v.tagline)}</div>
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

// ── HERO STATS (data-driven where possible to avoid staleness) ─────────
function updateHeroStats() {
  try {
    const basesEl = document.getElementById('stat-bases');
    if (basesEl && typeof BASES !== 'undefined' && BASES) {
      basesEl.textContent = Object.keys(BASES).length;
    }
    const glossEl = document.getElementById('stat-glossary');
    if (glossEl && typeof GLOSSARY !== 'undefined' && Array.isArray(GLOSSARY)) {
      glossEl.textContent = GLOSSARY.length;
    }
    // Aircraft / Naval / Army kept as approximate "+" strings (data arrays contain many sub-objects + adversaries)
  } catch (e) { /* non-fatal */ }
}

// ── NAVY / MARITIME GRID (data-driven for consistency with aircraft/army/weapons) ─────────
function buildNavyGrid() {
  const grid = document.getElementById('navyGrid');
  if (!grid) return;
  const NAVY_DATA = (window.NAVY || (typeof NAVY !== 'undefined' ? NAVY : []));
  // Curated prominent RAN + key adversary vessels for recognition (order matches prior static presentation)
  const displayIds = ['hobart','anzac','collins','canberra','supply','choules','hunter','aukus','mh60r','type055','type052d','kilo','gorshkov'];
  // Group to preserve original subsection visuals (headers + separate grids)
  const mainIds = ['hobart','anzac','collins','canberra','supply','choules','hunter','aukus'];
  const heloIds = ['mh60r'];
  const advIds = ['type055','type052d','kilo','gorshkov'];

  function renderCards(ids) {
    return ids.map(id => {
      const v = NAVY_DATA.find(x => x.id === id);
      if (!v) return '';
      const isAdv = (v.desig && /adversary/i.test(v.desig)) || /russian|chinese|kilo|gorshkov|type0/i.test((v.id||'') + (v.name||''));
      const badgeClass = isAdv ? ' adversary' : '';
      const badgeText = v.typeName || v.desig || '';
      const specs = (v.stats || []).map(s => s.v).join(' • ');
      const tags = (v.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
      const role = wrapGlossaryTerms(v.tagline || '');
      return `
        <div class="fleet-card" id="maritime-${v.id}" data-detail-id="${v.id}">
          <div class="fleet-img-wrap">
            ${v.img ? `<img src="${v.img}" alt="${v.name}" loading="lazy">` : `<div style="height:140px; background:var(--navy-mid); display:flex; align-items:center; justify-content:center; color:var(--text-dim); font-size:13px;">Photo coming soon</div>`}
            <span class="fleet-type-badge${badgeClass}">${badgeText}</span>
          </div>
          <div class="fleet-card-body">
            <div class="fleet-designation">${v.desig}</div>
            <div class="fleet-name">${v.name}</div>
            <div class="fleet-role">${role}</div>
            <div class="fleet-specs">${specs}</div>
            <div class="fleet-tags">${tags}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  let html = '';
  html += `<div class="fleet-grid maritime-grid">${renderCards(mainIds)}</div>`;
  html += `<div class="aircraft-section-header" style="margin-top:32px;margin-bottom:12px;"><h3>Navy Helicopters</h3></div>`;
  html += `<div class="fleet-grid" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr));">${renderCards(heloIds)}</div>`;
  html += `<h3 style="font-family:'Rajdhani',sans-serif;color:var(--threat);margin:40px 0 16px;">Adversary Recognition</h3>`;
  html += `<div class="fleet-grid">${renderCards(advIds)}</div>`;
  grid.innerHTML = html;
}

// ── BASE MAP CALIB TOGGLE (user-requested on/off for the coord helpers) ─────────
function initCalibToggle() {
  const btn = document.getElementById('calibToggleBtn');
  const stateEl = document.getElementById('calibState');
  const label = document.getElementById('calib-label');
  const rect = document.getElementById('calib-rect');
  if (!btn || !stateEl) return;

  let visible = false; // default OFF

  // Attach reliable click handler for coord logging (moved from inline onclick for robustness + pointer-events)
  if (rect) {
    rect.addEventListener('click', function(e) {
      const svg = this.ownerSVGElement;
      if (!svg) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const svgP = pt.matrixTransform(ctm.inverse());
      console.log('Map click coords (for viewBox):', Math.round(svgP.x), Math.round(svgP.y));
      e.stopImmediatePropagation();
    });
  }

  function apply() {
    const d = visible ? '' : 'none';
    if (label) label.style.display = d;
    if (rect) {
      rect.style.display = d;
      rect.setAttribute('pointer-events', visible ? 'all' : 'none');
    }
    stateEl.textContent = visible ? 'ON' : 'OFF';
    if (visible) console.log('%c[ADF Forge] Calib helpers ON — click map background (non-dot) to log viewBox coords', 'color:#ff0');
  }

  btn.addEventListener('click', () => {
    visible = !visible;
    apply();
  });

  // initial apply (hidden)
  apply();
}

// ── VEHICLES DETAIL MODALS (now matching Aircraft & Maritime style) ─────────
function showVehicleDetail(id) {
  const ARMY_DATA = (window.ARMY || (typeof ARMY !== 'undefined' ? ARMY : []));
  const v = ARMY_DATA.find(x => x.id === id);
  if (!v) return;

  const statsHTML = v.stats.map(s => `<div class="modal-stat"><div class="modal-stat-val">${s.v}</div><div class="modal-stat-key">${s.k}</div></div>`).join('');

  const sysHTML = v.systems ? v.systems.map(s => `
    <li class="system-item">
      <div>
        <div class="system-name">${wrapGlossaryTerms(s.name)}</div>
        <div class="system-code">${s.code}</div>
      </div>
      <div>
        <div class="system-desc">${wrapGlossaryTerms(s.desc)}</div>
        <div class="layman-box"><strong>Plain English</strong>${wrapGlossaryTerms(s.layman)}</div>
      </div>
    </li>
  `).join('') : '';

  const modalInner = document.getElementById('modalInner');
  if (!modalInner) return;

  const heroHTML = (v.img && v.img.trim() !== '') ? `
    <div class="modal-hero">
      <img src="${v.img}" alt="${v.name}" loading="lazy">
      <div class="modal-hero-overlay"></div>
      <div class="modal-hero-text">
        <div class="modal-desig">${wrapGlossaryTerms(v.desig)} · ${wrapGlossaryTerms(v.typeName)}</div>
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
        <p class="modal-desc">${wrapGlossaryTerms(v.overview)}</p>
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
  const ADV_ARMY_DATA = (window.ADVERSARY_ARMY || (typeof ADVERSARY_ARMY !== 'undefined' ? ADVERSARY_ARMY : []));
  const v = ADV_ARMY_DATA.find(x => x.id === id);
  if (!v) return;

  const statsHTML = v.stats.map(s => `<div class="modal-stat"><div class="modal-stat-val">${s.v}</div><div class="modal-stat-key">${s.k}</div></div>`).join('');

  const sysHTML = v.systems ? v.systems.map(s => `
    <li class="system-item">
      <div>
        <div class="system-name">${wrapGlossaryTerms(s.name)}</div>
        <div class="system-code">${s.code}</div>
      </div>
      <div>
        <div class="system-desc">${wrapGlossaryTerms(s.desc)}</div>
        <div class="layman-box"><strong>Plain English</strong>${wrapGlossaryTerms(s.layman)}</div>
      </div>
    </li>
  `).join('') : '';

  const modalInner = document.getElementById('modalInner');
  if (!modalInner) return;

  const heroHTML = (v.img && v.img.trim() !== '') ? `
    <div class="modal-hero">
      <img src="${v.img}" alt="${v.name}" loading="lazy">
      <div class="modal-hero-overlay"></div>
      <div class="modal-hero-text">
        <div class="modal-desig">${wrapGlossaryTerms(v.desig)} · ${wrapGlossaryTerms(v.typeName)}</div>
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
        <p class="modal-desc">${wrapGlossaryTerms(v.overview)}</p>
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

// ── WEAPONS & SYSTEMS GRID & MODAL ──────────────────────────────────────
// Renders segregated grids for weapons (by role) and systems (by sensor type).
// Uses WEAPONS for weapons, SYSTEMS for sensors/systems extracted from platforms.
// All cards use wrap for cross-links; click opens showWeaponDetail (unified for both).
function buildWeaponsGrid() {
  // Weapons groups (re-segregated per user request: air-air, air-surface/land, surface/sub, defence, adversary)
  const weaponGroups = [
    { id: 'airToAirGrid', group: 'air-to-air' },
    { id: 'airToSurfaceGrid', group: 'air-to-surface' },
    { id: 'surfaceSubsurfaceGrid', group: 'surface-subsurface' },
    { id: 'defenceGrid', group: 'defensive' },
    { id: 'adversaryWeaponsGrid', group: 'adversary' }
  ];

  const weaponsData = window.WEAPONS || (typeof WEAPONS !== 'undefined' ? WEAPONS : null);

  if (weaponsData && Array.isArray(weaponsData) && weaponsData.length > 0) {
    weaponGroups.forEach(({ id, group }) => {
      const container = document.getElementById(id);
      if (!container) return;

      const filtered = weaponsData.filter(w => w.group === group);

      if (filtered.length === 0) {
        container.innerHTML = `<div style="padding:24px;text-align:center;color:var(--text-dim);font-size:13px;grid-column:1/-1;">No entries in this category yet.</div>`;
        return;
      }

      try {
        let html = '';
        for (let i = 0; i < filtered.length; i++) {
          const w = filtered[i];
          html += '<div class="weapons-card" id="weapon-' + w.id + '" data-detail-id="' + w.id + '">' +
            '<div class="weapons-img-wrap"><img src="' + w.img + '" alt="' + w.name + '" loading="lazy"></div>' +
            '<div class="weapons-card-body">' +
              '<div class="weapons-designation">' + (w.desig || '') + ' · ' + (w.type || w.group || '') + '</div>' +
              '<div class="weapons-name">' + w.name + '</div>' +
              '<div class="weapons-role">' + wrapGlossaryTerms(w.tagline) + '</div>' +
              '<div class="weapons-specs">' + (w.stats ? w.stats.map(function(s){return s.v;}).join(' • ') : '') + '</div>' +
            '</div>' +
          '</div>';
        }
        container.innerHTML = html;
      } catch (err) {
        console.error('Error building weapons grid for group ' + group + ':', err);
        container.innerHTML = '<div style="padding:24px;text-align:center;color:#E05A40;font-size:13px;">Error rendering. Check console.</div>';
      }
    });
  }

  // Systems grids (segregated by type: radar, eo-ir, sonar, ew, avionics)
  const systemGroups = [
    { id: 'radarSystemsGrid', group: 'radar' },
    { id: 'eoIrSystemsGrid', group: 'eo-ir' },
    { id: 'sonarSystemsGrid', group: 'sonar' },
    { id: 'ewSystemsGrid', group: 'ew' },
    { id: 'avionicsSystemsGrid', group: 'avionics' }
  ];

  const systemsData = window.SYSTEMS || (typeof SYSTEMS !== 'undefined' ? SYSTEMS : null);

  if (systemsData && Array.isArray(systemsData) && systemsData.length > 0) {
    systemGroups.forEach(({ id, group }) => {
      const container = document.getElementById(id);
      if (!container) return;

      const filtered = systemsData.filter(s => s.group === group);

      if (filtered.length === 0) {
        container.innerHTML = `<div style="padding:24px;text-align:center;color:var(--text-dim);font-size:13px;grid-column:1/-1;">No entries in this category yet.</div>`;
        return;
      }

      try {
        let html = '';
        for (let i = 0; i < filtered.length; i++) {
          const s = filtered[i];
          html += '<div class="weapons-card" id="system-' + s.id + '" data-detail-id="' + s.id + '" data-is-system="true">' +
            '<div class="weapons-img-wrap"><img src="' + (s.img || 'images/f35a.jpg') + '" alt="' + s.name + '" loading="lazy"></div>' +
            '<div class="weapons-card-body">' +
              '<div class="weapons-designation">' + (s.code || s.group || 'System') + '</div>' +
              '<div class="weapons-name">' + s.name + '</div>' +
              '<div class="weapons-role">' + wrapGlossaryTerms(s.tagline) + '</div>' +
              '<div class="weapons-specs">' + (s.platforms ? s.platforms.map(function(p){ return p.replace('f35a','F-35A').replace('fa18f','F/A-18F').replace('ea18g','EA-18G').replace('mh60r','MH-60R').replace('ch47f','CH-47F').replace('p8a','P-8A').replace('e7a','E-7A').replace('c130j','C-130J').replace('kc30a','KC-30A').replace('c27j','C-27J').replace('pc21','PC-21').replace('m1a1','M1A1').replace('arhtiger','ARH Tiger').toUpperCase(); }).join(' • ') : '') + '</div>' +
            '</div>' +
          '</div>';
        }
        container.innerHTML = html;
      } catch (err) {
        console.error('Error building systems grid for group ' + group + ':', err);
        container.innerHTML = '<div style="padding:24px;text-align:center;color:#E05A40;font-size:13px;">Error rendering systems. Check console.</div>';
      }
    });
  }

  // Build/enhance TOC (weapons + systems)
  buildWeaponsTOC();
}

function buildWeaponsTOC() {
  const toc = document.getElementById('weaponsToc');
  if (!toc) return;

  const groups = [
    { label: 'Air-to-Air Weapons', gridId: 'airToAirGrid' },
    { label: 'Air-to-Surface / Land & Maritime Strike', gridId: 'airToSurfaceGrid' },
    { label: 'Surface & Sub-Surface Weapons', gridId: 'surfaceSubsurfaceGrid' },
    { label: 'Air & Missile Defence Systems', gridId: 'defenceGrid' },
    { label: 'Adversary Weapons', gridId: 'adversaryWeaponsGrid', threat: true },
    { label: 'Sensors & Systems (Radar / EO-IR / Sonar / EW / Avionics)', gridId: 'radarSystemsGrid' }
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
      const name = nameEl ? nameEl.textContent.trim() : (card.getAttribute('data-is-system') ? 'System' : 'Item');
      const colorStyle = g.threat ? ' style="color:#e07a6b;"' : '';
      html += `<li><a href="#${id}" data-target="${id}"${colorStyle}>${name}</a></li>`;
    });
  });

  html += `</ul>`;
  toc.innerHTML = html;
}

function showWeaponDetail(id) {
  let item = (typeof WEAPONS !== 'undefined' ? WEAPONS : []).find(w => w.id === id);
  let isSystem = false;
  if (!item && typeof SYSTEMS !== 'undefined') {
    item = SYSTEMS.find(s => s.id === id);
    isSystem = !!item;
  }
  if (!item) return;

  const statsHTML = (item.stats || []).map(s => `<div class="modal-stat"><div class="modal-stat-val">${s.v}</div><div class="modal-stat-key">${s.k}</div></div>`).join('');

  // Normalize display fields for both weapons and systems
  const dispName = item.name || id;
  const dispDesig = item.desig || item.code || (isSystem ? 'SYSTEM' : 'WEAPON');
  const dispType = item.type || item.group || (isSystem ? 'Sensor/System' : 'Weapon');
  const dispImg = item.img || 'images/f35a.jpg';
  const dispOverview = item.overview || item.tagline || 'No detailed overview available.';
  const dispTags = item.tags || (item.platforms || []).map(p => p.toUpperCase());

  let sysHTML = '';
  let tabLabel = 'Guidance & Systems';
  if (isSystem) {
    tabLabel = 'Platforms';
    // Build real cross-ref spans for bidirectional navigation (leverages global tooltip + capture click)
    const platList = (item.platforms || []);
    let usedByHTML = 'Various platforms (see linked aircraft, vessels and vehicles)';
    if (platList.length) {
      usedByHTML = platList.map(p => {
        // Map id to cross-ref type (airforce/navy/army/adversary). Keeps linking working.
        let typ = 'airforce';
        if (/^(hobart|anzac|hunter|collins|canberra|virginia|mh60r)$/.test(p)) typ = 'navy';
        else if (/^(m1a1|boxer|hawkei|k21|caesar|chinook|uh60m|arhtiger|bushmaster|rapier)$/.test(p) || p==='army') typ = 'army';
        else if (/^(j20|j16|j15|j11|kilo|type055|type052d|type054a)$/.test(p)) typ = 'adversary';
        const label = p.replace('f35a','F-35A').replace('fa18f','F/A-18F').replace('ea18g','EA-18G').replace('mh60r','MH-60R').replace('ch47f','CH-47F').replace('p8a','P-8A').replace('e7a','E-7A').replace('c130j','C-130J').replace('kc30a','KC-30A').replace('c27j','C-27J').replace('pc21','PC-21').toUpperCase();
        return `<span class="cross-ref" data-type="${typ}" data-id="${p}">${label}</span>`;
      }).join(' ');
    }
    sysHTML = `<li class="system-item"><div><div class="system-name">Used By (click to open platform)</div></div><div><div class="system-desc">${usedByHTML}</div><div class="layman-box"><strong>Tip</strong>Hover or click any platform name above to jump directly to its full card. All sensors &amp; systems are cross-linked.</div></div></li>`;
  } else if (item.systems) {
    sysHTML = item.systems.map(s => `
      <li class="system-item">
        <div>
          <div class="system-name">${wrapGlossaryTerms(s.name)}</div>
          <div class="system-code">${s.code}</div>
        </div>
        <div>
          <div class="system-desc">${wrapGlossaryTerms(s.desc)}</div>
          <div class="layman-box"><strong>Plain English</strong>${wrapGlossaryTerms(s.layman)}</div>
        </div>
      </li>
    `).join('');
  }

  const tagsHTML = (dispTags || []).map(t => `<span class="tag">${t}</span>`).join('');

  document.getElementById('modalInner').innerHTML = `
    <div class="modal-hero">
      <img src="${dispImg}" alt="${dispName}" loading="lazy">
      <div class="modal-hero-overlay"></div>
      <div class="modal-hero-text">
        <div class="modal-desig">${wrapGlossaryTerms(dispDesig)} · ${wrapGlossaryTerms(dispType)}</div>
        <div class="modal-name">${dispName}</div>
      </div>
    </div>
    <div class="modal-body">
      <div class="modal-stats-row">${statsHTML}</div>
      <div class="modal-tabs">
        <div class="modal-tab active" onclick="switchTab(event,'overview-${id}')">Overview</div>
        <div class="modal-tab" onclick="switchTab(event,'systems-${id}')">${tabLabel}</div>
      </div>
      <div class="modal-tab-pane active" id="overview-${id}">
        <p class="modal-desc">${wrapGlossaryTerms(dispOverview)}</p>
        ${tagsHTML ? `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">${tagsHTML}</div>` : ''}
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
      <p class="modal-desc">${wrapGlossaryTerms(ac.overview)}</p>
    </div>
    <div class="modal-tab-pane" id="systems-${id}">
      <ul class="system-list">
        ${ac.systems ? ac.systems.map(s => `
          <li class="system-item">
            <div>
              <div class="system-name">${wrapGlossaryTerms(s.name)}</div>
              <div class="system-code">${s.code}</div>
            </div>
            <div>
              <div class="system-desc">${wrapGlossaryTerms(s.desc)}</div>
              <div class="layman-box"><strong>Plain English</strong>${wrapGlossaryTerms(s.layman)}</div>
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
        <p class="modal-desc">${wrapGlossaryTerms(ac.overview)}</p>
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
      <img src="${ac.img}" alt="${ac.name}" loading="lazy">
      <div class="modal-hero-overlay"></div>
      <div class="modal-hero-text">
        <div class="modal-desig">${wrapGlossaryTerms(ac.desig)} · ${wrapGlossaryTerms(ac.origin)}</div>
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

// ── SAFE CARD CLICK HANDLERS (event delegation - no inline onclick) ──
// Avoids fragility with inline onclick= attributes (e.g. under MetaMask SES lockdown
// or extensions that interfere with HTML attribute handlers).
// All main content cards use delegated listeners on their container sections/grids.
function initCardClickHandlers() {
  // Air Force aircraft cards (normal + adversary)
  const aircraftGrid = document.getElementById('aircraftGrid');
  if (aircraftGrid) {
    aircraftGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.aircraft-card');
      if (!card || !card.id) return;
      console.log('[RAFF DEBUG] Aircraft card clicked:', card.id);
      const fullId = card.id;
      if (fullId.startsWith('ac-')) {
        openAircraftModal(fullId.replace('ac-', ''));
      } else if (fullId.startsWith('adv-')) {
        showAdversaryDetail(fullId.replace('adv-', ''));
      }
    });
  }

  // Weapons + Systems cards (segregated sub-grids under #weapons)
  const weaponsSection = document.getElementById('weapons');
  if (weaponsSection) {
    weaponsSection.addEventListener('click', (e) => {
      const card = e.target.closest('.weapons-card');
      if (!card) return;
      console.log('[RAFF DEBUG] Weapon/System card clicked:', card.id || card.dataset.detailId);
      let wid = card.dataset.detailId;
      if (!wid) {
        const full = card.id || '';
        wid = full.replace(/^(weapon-|system-)/, '');
      }
      if (wid) showWeaponDetail(wid);
    });
  }

  // Navy / Maritime fleet cards (static HTML + any future)
  const navySection = document.getElementById('navy');
  if (navySection) {
    navySection.addEventListener('click', (e) => {
      const card = e.target.closest('.fleet-card[id]');
      if (!card) return;
      console.log('[RAFF DEBUG] Fleet card clicked:', card.id);
      let detailId = card.dataset.detailId;
      if (!detailId) {
        const full = card.id || '';
        detailId = full.replace(/^(maritime-|navy-)/, '');
      }
      if (detailId) {
        showMaritimeDetail(detailId);
      }
    });
  }

  // Army vehicles (ground + aviation + adversary) - dynamic grid
  const vehiclesGrid = document.getElementById('vehicles-grid');
  if (vehiclesGrid) {
    vehiclesGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.fleet-card');
      if (!card || !card.id) return;
      console.log('[RAFF DEBUG] Army vehicle card clicked:', card.id);
      const full = card.id;
      if (full.startsWith('adv-vehicle-')) {
        showAdversaryVehicleDetail(full.replace('adv-vehicle-', ''));
      } else if (full.startsWith('army-')) {
        showVehicleDetail(full.replace('army-', ''));
      }
    });
  }
}

// ── INIT ──────────────────────────────────────────────────────
buildAircraftGrid();
buildOpsGrid();
buildGlossary();
buildWeaponsGrid();
buildVehiclesGrid();
buildNavyGrid();
updateHeroStats();
initCalibToggle();
initStudyTools();
initThemeSwitcher();
initMainNavigation();
initCardClickHandlers();

// Keyboard support (Escape closes modal)
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ── GLOSSARY TOOLTIPS + CROSS-REFERENCE PREVIEWS (safe enhancement) ──
// Adds hover bubbles for acronyms (from GLOSSARY) and some platform cross-refs.
// Hover shows explanation. For platform terms, includes image + short desc + click hint.
// Click on cross-ref terms will attempt to open the full card where possible.
// This is progressive enhancement — does not change data structure or core logic.

function initGlossaryTooltips() {
  // Build fast lookup from the existing GLOSSARY (data.js)
  if (typeof GLOSSARY !== 'undefined' && Array.isArray(GLOSSARY)) {
    GLOSSARY.forEach(entry => {
      const key = (entry.term || '').toLowerCase();
      if (key) glossaryMap.set(key, entry);
      if (entry.full) glossaryMap.set(entry.full.toLowerCase(), entry);
    });
  }

  // Small set of rich previews for common cross-references (image + short desc + how to open full card)
  // Keys are lowercased common names/aliases that appear in text.
  previewMap.set('mh-60r', {
    title: 'MH-60R Seahawk "Romeo"',
    short: 'RAN\'s primary shipborne multi-role helicopter for ASW, ASuW, and SAR. Operates from Hobart, Anzac, Canberra-class and future Hunter-class.',
    img: 'images/mh60r.jpg',
    type: 'navy',
    id: 'mh60r'
  });
  previewMap.set('seahawk', {
    title: 'MH-60R Seahawk "Romeo"',
    short: 'RAN\'s primary shipborne multi-role helicopter for ASW, ASuW, and SAR.',
    img: 'images/mh60r.jpg',
    type: 'navy',
    id: 'mh60r'
  });
  previewMap.set('anzac', {
    title: 'Anzac-class Frigate',
    short: 'General-purpose frigates (upgraded with CEAFAR2). Workhorses of the current RAN surface fleet. Carry ESSM, NSM, 5" gun, MU90 torpedoes and MH-60R.',
    img: 'images/anzac.jpg',
    type: 'navy',
    id: 'anzac'
  });
  previewMap.set('anzac-class', {
    title: 'Anzac-class Frigate',
    short: 'General-purpose frigates (upgraded with CEAFAR2). Workhorses of the current RAN surface fleet.',
    img: 'images/anzac.jpg',
    type: 'navy',
    id: 'anzac'
  });
  previewMap.set('hobart', {
    title: 'Hobart-class Destroyer',
    short: 'Australia\'s Aegis-equipped Air Warfare Destroyers (Hobart, Brisbane, Sydney). Primary area air-defence escorts with SPY-1D, SM-2/ESSM, NSM and MH-60R.',
    img: 'images/hobart.jpg',
    type: 'navy',
    id: 'hobart'
  });
  previewMap.set('hobart-class', {
    title: 'Hobart-class Destroyer',
    short: 'Australia\'s Aegis-equipped Air Warfare Destroyers. Core of RAN task group air defence.',
    img: 'images/hobart.jpg',
    type: 'navy',
    id: 'hobart'
  });
  previewMap.set('hunter-class', {
    title: 'Hunter-class Frigate',
    short: 'Future ASW-optimised frigates (SEA 5000) based on Type 26 with CEAFAR2 + Aegis. Will be the RAN\'s primary submarine hunters alongside P-8A and future SSNs.',
    img: 'images/hunter-class.jpg',
    type: 'navy',
    id: 'hunter'
  });
  previewMap.set('f-35a', {
    title: 'F-35A Lightning II',
    short: 'RAAF\'s 5th-generation stealth multirole fighter. 72 aircraft. Advanced sensor fusion (APG-81 AESA), internal weapons (JSM, SDB, AIM-120), and data sharing via Link 16.',
    img: 'images/f35a.jpg',
    type: 'airforce',
    id: 'f35a'
  });
  previewMap.set('p-8a', {
    title: 'P-8A Poseidon',
    short: 'RAAF maritime patrol & ASW aircraft (No. 11 & 12 Sqns). Long-range ISR, sonobuoy ops, MAD, Harpoon/NSM strike, works closely with MH-60R and surface escorts.',
    img: 'images/poseidon.jpg',
    type: 'airforce',
    id: 'p8a'
  });
  previewMap.set('p8a', {
    title: 'P-8A Poseidon',
    short: 'RAAF maritime patrol & ASW aircraft (No. 11 & 12 Sqns). Long-range ISR, sonobuoy ops, MAD, Harpoon/NSM strike, works closely with MH-60R and surface escorts.',
    img: 'images/poseidon.jpg',
    type: 'airforce',
    id: 'p8a'
  });
  previewMap.set('c-130j', {
    title: 'C-130J Hercules',
    short: 'RAAF medium tactical airlifter (No. 37 Sqn). Versatile workhorse for troops, vehicles, airdrops and HADR from short/unprepared strips.',
    img: 'images/c130j.jpg',
    type: 'airforce',
    id: 'c130j'
  });
  previewMap.set('c130j', {
    title: 'C-130J Hercules',
    short: 'RAAF medium tactical airlifter (No. 37 Sqn). Versatile workhorse for troops, vehicles, airdrops and HADR from short/unprepared strips.',
    img: 'images/c130j.jpg',
    type: 'airforce',
    id: 'c130j'
  });
  previewMap.set('c-27j', {
    title: 'C-27J Spartan',
    short: 'RAAF battlefield airlifter (No. 35 Sqn). Operates from the smallest strips in support of Army and amphibious ops.',
    img: 'images/c27j.jpg',
    type: 'airforce',
    id: 'c27j'
  });
  previewMap.set('c27j', {
    title: 'C-27J Spartan',
    short: 'RAAF battlefield airlifter (No. 35 Sqn). Operates from the smallest strips in support of Army and amphibious ops.',
    img: 'images/c27j.jpg',
    type: 'airforce',
    id: 'c27j'
  });
  previewMap.set('c-17a', {
    title: 'C-17A Globemaster III',
    short: 'RAAF heavy strategic airlifter. Carries tanks, helos and bulk cargo intercontinentally.',
    img: 'images/c17.jpg',
    type: 'airforce',
    id: 'c17'
  });
  previewMap.set('c-17', {
    title: 'C-17A Globemaster III',
    short: 'RAAF heavy strategic airlifter. Carries tanks, helos and bulk cargo intercontinentally.',
    img: 'images/c17.jpg',
    type: 'airforce',
    id: 'c17'
  });
  previewMap.set('c17', {
    title: 'C-17A Globemaster III',
    short: 'RAAF heavy strategic airlifter. Carries tanks, helos and bulk cargo intercontinentally.',
    img: 'images/c17.jpg',
    type: 'airforce',
    id: 'c17'
  });
  previewMap.set('ch-47f', {
    title: 'CH-47F Chinook',
    short: 'RAAF heavy-lift helicopter. Only asset that can move M1 Abrams by air (sling or internal in some configs).',
    img: 'images/ch47f.jpg',
    type: 'airforce',
    id: 'ch47f'
  });
  previewMap.set('chinook', {
    title: 'CH-47F Chinook',
    short: 'RAAF heavy-lift helicopter. Only asset that can move M1 Abrams by air (sling or internal in some configs).',
    img: 'images/ch47f.jpg',
    type: 'airforce',
    id: 'ch47f'
  });
  previewMap.set('wedgetail', {
    title: 'E-7A Wedgetail',
    short: 'RAAF airborne early warning & control (AEW&C). MESA radar provides 360° coverage. Directs the air battle and provides situational awareness to the joint force.',
    img: 'images/wedgetail.jpg',
    type: 'airforce',
    id: 'e7a'
  });
  previewMap.set('e7a', {
    title: 'E-7A Wedgetail',
    short: 'RAAF airborne early warning & control (AEW&C). MESA radar provides 360° coverage. Directs the air battle and provides situational awareness to the joint force.',
    img: 'images/wedgetail.jpg',
    type: 'airforce',
    id: 'e7a'
  });

  // EA-18G Growler (primary SEAD platform, referenced in HARM and many texts)
  previewMap.set('ea-18g', {
    title: 'EA-18G Growler',
    short: 'The world\'s only dedicated airborne electronic attack aircraft. Operated by No. 6 Squadron. Primary SEAD/DEAD platform with powerful jamming suite.',
    img: 'images/growler.jpg',
    type: 'airforce',
    id: 'ea18g'
  });
  previewMap.set('growler', {
    title: 'EA-18G Growler',
    short: 'RAAF\'s dedicated electronic attack aircraft for suppressing enemy air defences. Key partner for strike packages.',
    img: 'images/growler.jpg',
    type: 'airforce',
    id: 'ea18g'
  });
  previewMap.set('ea18g', {
    title: 'EA-18G Growler',
    short: 'RAAF\'s dedicated electronic attack aircraft for suppressing enemy air defences.',
    img: 'images/growler.jpg',
    type: 'airforce',
    id: 'ea18g'
  });
  previewMap.set('ea-18g growler', {
    title: 'EA-18G Growler',
    short: 'The world\'s only operational airborne electronic attack aircraft.',
    img: 'images/growler.jpg',
    type: 'airforce',
    id: 'ea18g'
  });

  // Super Hornet / F/A-18F (frequently referenced with Growler)
  previewMap.set('super hornet', {
    title: 'F/A-18F Super Hornet',
    short: 'RAAF two-seat strike fighter (No. 1 and 6 Sqns). Multirole with APG-79 AESA, can carry wide range of weapons including JSM for maritime strike.',
    img: 'images/superhornet.jpg',
    type: 'airforce',
    id: 'fa18f'
  });
  previewMap.set('f/a-18f', {
    title: 'F/A-18F Super Hornet',
    short: 'RAAF multirole strike fighter, operates alongside Growler and F-35A.',
    img: 'images/superhornet.jpg',
    type: 'airforce',
    id: 'fa18f'
  });
  previewMap.set('fa18f', {
    title: 'F/A-18F Super Hornet',
    short: 'RAAF two-seat strike fighter.',
    img: 'images/superhornet.jpg',
    type: 'airforce',
    id: 'fa18f'
  });

  // Chinook (CH-47F) - frequently referenced with LHDs, tanks, artillery
  previewMap.set('chinook', {
    title: 'CH-47F Chinook',
    short: 'RAAF heavy-lift helicopter. Primary platform for moving M1 Abrams, M777, HIMARS, troops and supplies in support of Army and amphibious operations.',
    img: 'images/chinook.jpg',
    type: 'airforce',
    id: 'ch47f'
  });
  previewMap.set('ch-47f', {
    title: 'CH-47F Chinook',
    short: 'RAAF heavy-lift helicopter (No. 12 Sqn).',
    img: 'images/chinook.jpg',
    type: 'airforce',
    id: 'ch47f'
  });
  previewMap.set('ch47f', {
    title: 'CH-47F Chinook',
    short: 'RAAF heavy-lift helicopter.',
    img: 'images/chinook.jpg',
    type: 'airforce',
    id: 'ch47f'
  });

  // C-17A Globemaster - strategic airlift
  previewMap.set('c-17', {
    title: 'C-17A Globemaster III',
    short: 'RAAF heavy strategic transport. Can carry M1 Abrams tanks, helicopters, troops and large cargo over intercontinental distances.',
    img: 'images/c17.jpg',
    type: 'airforce',
    id: 'c17'
  });
  previewMap.set('c17a', {
    title: 'C-17A Globemaster III',
    short: 'RAAF strategic airlifter (No. 36 Sqn).',
    img: 'images/c17.jpg',
    type: 'airforce',
    id: 'c17'
  });

  // KC-30A - refuelling, extends range of Growler, Super Hornet, F-35A etc.
  previewMap.set('kc-30a', {
    title: 'KC-30A MRTT',
    short: 'RAAF multi-role tanker transport. Primary air-to-air refuelling for F-35A, Super Hornet, Growler and Wedgetail.',
    img: 'images/kc30a.jpg',
    type: 'airforce',
    id: 'kc30a'
  });
  previewMap.set('kc30a', {
    title: 'KC-30A MRTT',
    short: 'RAAF tanker (No. 33 Sqn). Extends endurance of strike and EW packages.',
    img: 'images/kc30a.jpg',
    type: 'airforce',
    id: 'kc30a'
  });

  // Virginia-class / AUKUS SSN (fix for P-8A cross-ref inside its overview, and general linking)
  previewMap.set('virginia-class', {
    title: 'Virginia-class SSN',
    short: 'US Virginia-class nuclear attack submarines (Block IV/V) being acquired by Australia under AUKUS as interim capability before sovereign SSN-AUKUS.',
    img: 'images/virginia-class.jpg',
    type: 'navy',
    id: 'aukus'
  });
  previewMap.set('virginia', {
    title: 'Virginia-class SSN',
    short: 'US Virginia-class nuclear attack submarines acquired under AUKUS.',
    img: 'images/virginia-class.jpg',
    type: 'navy',
    id: 'aukus'
  });
  previewMap.set('ssn-aukus', {
    title: 'SSN-AUKUS',
    short: 'Future sovereign Australian nuclear-powered attack submarine based on UK design with US tech.',
    img: 'images/virginia-class.jpg',
    type: 'navy',
    id: 'aukus'
  });

  // Additional for C-27J and M1 Abrams (to support cross-refs in LHD texts etc.)
  previewMap.set('c-27j', {
    title: 'C-27J Spartan',
    short: 'RAAF tactical battlefield airlifter (No. 35 Sqn at Amberley). Operates from short/unprepared strips; supports Army and LHD ops with troops, light vehicles and cargo.',
    img: 'images/c27j.jpg',
    type: 'airforce',
    id: 'c27j'
  });
  previewMap.set('c27j', {
    title: 'C-27J Spartan',
    short: 'RAAF tactical battlefield airlifter supporting amphibious and Army operations.',
    img: 'images/c27j.jpg',
    type: 'airforce',
    id: 'c27j'
  });
  previewMap.set('spartan', {
    title: 'C-27J Spartan',
    short: 'RAAF tactical battlefield airlifter supporting amphibious and Army operations.',
    img: 'images/c27j.jpg',
    type: 'airforce',
    id: 'c27j'
  });

  previewMap.set('m1', {
    title: 'M1A1 Abrams',
    short: 'Australian Army main battle tank (1st Armoured Regiment). Heavy direct-fire capability; limited air mobility by Chinook/C-17.',
    img: 'images/abrams.jpg',
    type: 'army',
    id: 'abrams'
  });
  previewMap.set('m1 abrams', {
    title: 'M1A1 Abrams',
    short: 'Australian Army main battle tank. 70-tonne heavy armour moved by RAAF heavy lift for amphibious support.',
    img: 'images/abrams.jpg',
    type: 'army',
    id: 'abrams'
  });
  previewMap.set('abrams', {
    title: 'M1A1 Abrams',
    short: 'Australian Army main battle tank (desig M1A1 AIM).',
    img: 'images/abrams.jpg',
    type: 'army',
    id: 'abrams'
  });
  previewMap.set('m1a1', {
    title: 'M1A1 Abrams',
    short: 'Australian Army main battle tank.',
    img: 'images/abrams.jpg',
    type: 'army',
    id: 'abrams'
  });

  // Mk 48 torpedo (weapon, referenced in Collins-class and Virginia-class)
  previewMap.set('mk 48', {
    title: 'Mk 48 Heavyweight Torpedo',
    short: 'Primary heavyweight torpedo for Collins-class submarines and future SSNs. Wire-guided with active/passive sonar homing.',
    img: 'images/mk48.jpg',
    type: 'weapon',
    id: 'mk48'
  });
  previewMap.set('mk48', {
    title: 'Mk 48 Heavyweight Torpedo',
    short: 'Primary heavyweight torpedo for Collins-class and future AUKUS submarines.',
    img: 'images/mk48.jpg',
    type: 'weapon',
    id: 'mk48'
  });
  previewMap.set('mk-48', {
    title: 'Mk 48 Heavyweight Torpedo',
    short: 'Australia\'s main submarine-launched heavyweight torpedo.',
    img: 'images/mk48.jpg',
    type: 'weapon',
    id: 'mk48'
  });
  previewMap.set('mk 48 mod 7', {
    title: 'Mk 48 Heavyweight Torpedo',
    short: 'Primary heavyweight torpedo for Collins-class and future AUKUS submarines.',
    img: 'images/mk48.jpg',
    type: 'weapon',
    id: 'mk48'
  });

  // Auto-register main platforms from data so references in any text (HARM, LHDs, etc.) automatically become cross-referenced with hover preview + click to full card.
  // This makes "everything linked" without manual maintenance for every new platform.
  try {
    const dataSources = [];
    if (typeof AIRCRAFT !== 'undefined' && Array.isArray(AIRCRAFT)) dataSources.push(...AIRCRAFT);
    if (typeof NAVY !== 'undefined' && Array.isArray(NAVY)) dataSources.push(...NAVY);
    if (typeof WEAPONS !== 'undefined' && Array.isArray(WEAPONS)) dataSources.push(...WEAPONS);
    if (typeof SYSTEMS !== 'undefined' && Array.isArray(SYSTEMS)) dataSources.push(...SYSTEMS);
    if (typeof ADVERSARY_VEHICLES !== 'undefined' && Array.isArray(ADVERSARY_VEHICLES)) dataSources.push(...ADVERSARY_VEHICLES);
    if (typeof ADVERSARY_AIRCRAFT !== 'undefined' && Array.isArray(ADVERSARY_AIRCRAFT)) dataSources.push(...ADVERSARY_AIRCRAFT);

    dataSources.forEach(item => {
      if (!item || !item.id || !item.name) return;
      const key = item.id.toLowerCase();
      if (previewMap.has(key)) return; // manual rich entries take precedence

      const shortDesc = item.tagline || (item.overview ? item.overview.substring(0, 140) + '...' : item.name);
      let typ = 'airforce';
      const d = (item.desig || '').toUpperCase();
      if (item.group) {
        typ = 'weapon';  // unified for weapons + systems (both use showWeaponDetail for cross-linking)
      } else if (d.includes('FFH') || d.includes('LHD') || d.includes('DDG') || d.includes('LSD') || d.includes('SSN') || d.includes('SSK')) {
        typ = 'navy';
      } else if (item.origin || /type0|j-?1[0-9]|kilo|j20|j16|j15|j11/i.test((item.id||'') + (item.name||''))) {
        typ = 'adversary';
      }

      previewMap.set(key, {
        title: item.desig ? `${item.desig} ${item.name}` : item.name,
        short: shortDesc,
        img: item.img || null,
        type: typ,
        id: item.id
      });

      // Also register exact lower name for reliable wrap matching in platform texts
      const fullNameLower = item.name.toLowerCase();
      if (!previewMap.has(fullNameLower)) {
        previewMap.set(fullNameLower, {
          title: item.desig ? `${item.desig} ${item.name}` : item.name,
          short: shortDesc,
          img: item.img || null,
          type: typ,
          id: item.id
        });
      }

      // Register desig variants (hyphenated and normalized) so texts mentioning "C-130J", "F-35A", "CH-47F" etc. get auto cross-ref links
      if (item.desig) {
        const dlow = item.desig.toLowerCase();
        if (!previewMap.has(dlow)) {
          previewMap.set(dlow, {
            title: item.desig ? `${item.desig} ${item.name}` : item.name,
            short: shortDesc,
            img: item.img || null,
            type: typ,
            id: item.id
          });
        }
        const dnorm = dlow.replace(/-/g, '');
        if (dnorm !== dlow && !previewMap.has(dnorm)) {
          previewMap.set(dnorm, {
            title: item.desig ? `${item.desig} ${item.name}` : item.name,
            short: shortDesc,
            img: item.img || null,
            type: typ,
            id: item.id
          });
        }
        // Short desig e.g. C-17A -> c-17 , C-130J -> c-130 for common prose mentions
        const shortD = dlow.replace(/-[a-z]$/, '').replace(/[a-z]$/, '');
        if (shortD && shortD !== dlow && shortD.length > 2 && !previewMap.has(shortD)) {
          previewMap.set(shortD, {
            title: item.desig ? `${item.desig} ${item.name}` : item.name,
            short: shortDesc,
            img: item.img || null,
            type: typ,
            id: item.id
          });
        }
      }
    });
  } catch (e) { /* non-fatal */ }

  // Create the single tooltip element (once)
  if (!document.getElementById('site-tooltip')) {
    const tip = document.createElement('div');
    tip.id = 'site-tooltip';
    tip.setAttribute('role', 'tooltip');
    document.body.appendChild(tip);
  }

  const tooltipEl = document.getElementById('site-tooltip');

  // Event delegation — works for dynamically inserted content in modals/cards
  // NOTE: .glossary-term removed from selectors so the glossary cards themselves do not spawn
  // a duplicate hover bubble (per request: keep full info on-card; bubbles only for .cross-ref
  // terms *inside* descriptions for cross-links).
  document.addEventListener('mouseover', (e) => {
    const termEl = e.target.closest('.cross-ref, .glossary-term');
    if (!termEl) return;
    // Skip the top-level glossary cards (they have the definition on-card already);
    // only allow bubbles for wrapped .cross-ref or inner .glossary-term spans (data-term present)
    if (termEl.classList.contains('glossary-term') && !termEl.dataset.term) return;

    const rawTerm = termEl.dataset.term || termEl.textContent.trim();
    const key = rawTerm.toLowerCase();
    let glossaryEntry = glossaryMap.get(key);
    const preview = previewMap.get(key) || previewMap.get(rawTerm.toLowerCase().replace(/[^a-z0-9]/g, ''));

    if (!glossaryEntry && preview) {
      // Fallback: try the preview's id (e.g. 'abrams') or normalized
      const idKey = (preview.id || '').toLowerCase();
      glossaryEntry = glossaryMap.get(idKey) || glossaryMap.get(key.replace(/[^a-z0-9]/g, ''));
    }

    let html = '';

    if (glossaryEntry) {
      html += `<span class="tooltip-title">${glossaryEntry.full || glossaryEntry.term}</span>`;
      html += `<span class="tooltip-def">${glossaryEntry.definition}</span>`;
    } else {
      html += `<span class="tooltip-title">${rawTerm}</span>`;
    }

    if (preview) {
      html += `<div class="tooltip-preview">`;
      if (preview.img) {
        html += `<img src="${preview.img}" alt="${preview.title}" loading="lazy">`;
      }
      html += `<div class="preview-text">`;
      html += `<strong>${preview.title}</strong>`;
      html += preview.short;
      html += `</div></div>`;
      html += `<div class="tooltip-click-hint">Click to open full details →</div>`;
    }

    if (!html) return;

    tooltipEl.innerHTML = html;
    tooltipEl.style.display = 'block';

    // Position near the element (prefer above, flip if needed)
    const rect = termEl.getBoundingClientRect();
    const tipRect = tooltipEl.getBoundingClientRect();
    let top = rect.top + window.scrollY - tipRect.height - 8;
    let left = rect.left + window.scrollX + (rect.width / 2) - (tipRect.width / 2);

    // Keep on screen
    if (top < window.scrollY + 8) top = rect.bottom + window.scrollY + 8;
    if (left < 8) left = 8;
    if (left + tipRect.width > window.innerWidth - 8) left = window.innerWidth - tipRect.width - 8;

    tooltipEl.style.top = `${top}px`;
    tooltipEl.style.left = `${left}px`;

    // Mark for click handling
    termEl._hasPreview = !!preview;
    termEl._previewData = preview;
  });

  // Hide tooltip immediately on mousedown for cross-refs (so click target is the span, not the tooltip div on top)
  document.addEventListener('mousedown', (e) => {
    const termEl = e.target.closest('.cross-ref');  // only for actionable cross-refs
    if (termEl) {
      tooltipEl.style.display = 'none';
    }
  });

  document.addEventListener('mouseout', (e) => {
    const termEl = e.target.closest('.cross-ref, .glossary-term');
    if (!termEl) return;
    if (termEl.classList.contains('glossary-term') && !termEl.dataset.term) return;
    tooltipEl.style.display = 'none';
  });

  // Click support for cross-refs (opens the relevant full card/modal)
  // Use capture phase so it runs early, before ancestor delegations (e.g. card open), and stop to prevent conflicts
  document.addEventListener('click', (e) => {
    const termEl = e.target.closest('.cross-ref, .glossary-term');
    if (!termEl) return;
    if (termEl.classList.contains('glossary-term') && !termEl.dataset.term) return;

    let p = termEl._previewData;

    // Robust lookup: if not pre-set from hover (e.g. quick click), lookup now
    if (!p) {
      const raw = termEl.dataset.term || termEl.textContent.trim();
      const key = raw.toLowerCase();
      p = previewMap.get(key) || previewMap.get(raw.toLowerCase().replace(/[^a-z0-9]/g, ''));
    }

    e.stopImmediatePropagation();
    tooltipEl.style.display = 'none';

    // If no rich preview (e.g. plain glossary term cross-ref), jump to glossary and highlight the term
    if (!p) {
      const glossaryTerm = termEl.dataset.term;
      if (glossaryTerm) {
        const navEl = document.querySelector('.nav-link[data-section="glossary"]');
        showSection('glossary', navEl);
        setTimeout(() => {
          const cards = document.querySelectorAll('#glossaryGrid .glossary-term');
          for (const card of cards) {
            const ac = card.querySelector('.acronym');
            if (ac && ac.textContent.toLowerCase().includes(glossaryTerm.toLowerCase())) {
              card.scrollIntoView({ behavior: 'smooth', block: 'center' });
              const orig = card.style.boxShadow;
              card.style.boxShadow = '0 0 0 3px var(--gold)';
              setTimeout(() => { card.style.boxShadow = orig || ''; }, 1800);
              break;
            }
          }
        }, 120);
      }
      return;
    }

    // Attempt to open the correct modal based on type + id
    try {
      if (p.type === 'navy' && typeof showMaritimeDetail === 'function') {
        showMaritimeDetail(p.id);
      } else if (p.type === 'airforce' && typeof openAircraftModal === 'function') {
        openAircraftModal(p.id);
      } else if (p.type === 'army' && typeof showVehicleDetail === 'function') {
        showVehicleDetail(p.id);
      } else if (p.type === 'weapon' && typeof showWeaponDetail === 'function') {
        showWeaponDetail(p.id);
      } else if (p.type === 'adversary' && typeof showAdversaryVehicleDetail === 'function') {
        showAdversaryVehicleDetail(p.id);
      } else if (p.type === 'adversary' && typeof showAdversaryDetail === 'function') {
        showAdversaryDetail(p.id);
      } else {
        // Fallback: just navigate to the section if possible
        const nav = document.querySelector(`.nav-link[data-section="${p.type || 'navy'}"]`);
        if (nav) nav.click();
      }
    } catch (err) {
      console.warn('[ADF Forge] Cross-ref click handler issue:', err);
    }
  }, true);  // capture phase

  // Hide tooltip on scroll or resize for cleanliness
  window.addEventListener('scroll', () => { tooltipEl.style.display = 'none'; }, { passive: true });
  window.addEventListener('resize', () => { tooltipEl.style.display = 'none'; });

  console.log('%c[ADF Forge] Glossary tooltips + cross-ref previews initialized', 'color: #C9A84C');
}

// Helper: wrap known glossary terms in text with spans (used during modal rendering)
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function wrapGlossaryTerms(text) {
  if (!text || typeof text !== 'string') return text || '';
  if (glossaryMap.size === 0 && previewMap.size === 0) {
    return text;
  }

  // Build a map of lowercased matchable tokens/phrases -> info for span
  const matchInfo = new Map();

  // From glossary (skip obvious ones like RAAF for inline)
  glossaryMap.forEach((entry, key) => {
    const canon = entry.term;
    if (!canon) return;
    const lower = canon.toLowerCase();
    if (lower === 'raaf') return; // too obvious, per user request
    const cls = (entry.category === 'platforms' || entry.category === 'weapons') ? 'cross-ref' : 'glossary-term';
    matchInfo.set(lower, { canon, cls, dataTerm: canon });
  });

  // From preview aliases (for cross-refs even if not in glossary, or additional aliases)
  previewMap.forEach((p, alias) => {
    const lower = alias.toLowerCase();
    if (lower === 'raaf') return;
    // Prefer existing info, or create cross-ref
    if (!matchInfo.has(lower)) {
      matchInfo.set(lower, { canon: p.title || alias, cls: 'cross-ref', dataTerm: p.id || alias });
    }
  });

  // For M1* aliases, prefer 'm1a1' as dataTerm so glossary lookup (M1A1 entry) succeeds while preview still provides correct .id='abrams' for navigation
  ['m1', 'm1 abrams', 'abrams', 'm1a1'].forEach(l => {
    if (matchInfo.has(l)) {
      matchInfo.get(l).dataTerm = 'm1a1';
    }
  });

  if (matchInfo.size === 0) return text;

  // Track terms already wrapped in *this* text to avoid repeating explanations (e.g. AUKUS multiple times in one overview)
  const seenInThisText = new Set();

  // Single-pass robust replace: longer patterns first, one big alternation regex
  const patterns = Array.from(matchInfo.keys())
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp);

  const bigRegex = new RegExp(`\\b(${patterns.join('|')})\\b`, 'gi');

  return text.replace(bigRegex, (match) => {
    const lowerMatch = match.toLowerCase();
    const info = matchInfo.get(lowerMatch);
    if (!info) return match;

    // Only wrap the first occurrence of this term in this text block (subsequent mentions stay plain)
    if (seenInThisText.has(lowerMatch)) {
      return match;
    }
    seenInThisText.add(lowerMatch);

    return `<span class="${info.cls}" data-term="${info.dataTerm}">${match}</span>`;
  });
}

// Initialize immediately (declarations are complete by end of script)
if (typeof initGlossaryTooltips === 'function') {
  try {
    initGlossaryTooltips();
  } catch (e) {
    console.warn('[ADF Forge] Tooltip init failed (non-fatal):', e);
  }
}

// Post-enhance static navy fleet cards (and any .fleet-designation / .fleet-specs) so designators (FFH etc.) and "Seahawk" etc. get tooltips and cross-ref clicks even in the list view.
setTimeout(() => {
  document.querySelectorAll('#navy .fleet-card .fleet-designation, #navy .fleet-card .fleet-specs, .fleet-card .fleet-role').forEach(el => {
    if (el && el.textContent) {
      const original = el.textContent;
      const wrapped = wrapGlossaryTerms(original);
      if (wrapped !== original) {
        el.innerHTML = wrapped;
      }
    }
  });
}, 100);

// Also wrap text in already-rendered glossary section if present
setTimeout(() => {
  const glossaryGrid = document.getElementById('glossaryGrid');
  if (glossaryGrid) {
    // The glossary page already has nice structured cards; no need to wrap further here.
    // The new tooltips are primarily for in-card / in-modal use.
  }
}, 300);
