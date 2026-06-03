// ============================================
// RAAF Knowledge Hub - Interactivity  (VERSION: 2025-04-07-2)
// ============================================
// All the JavaScript that makes the maps, modals,
// section switching, and cards work lives here.
// You normally won't need to edit this file.

console.log('%c[RAFF DEBUG] script.js parsed successfully - VERSION 2025-04-07-FINAL', 'color: limegreen; font-size: 14px');

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
  });
} catch(e){}

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
        <div class="aircraft-card" id="ac-${ac.id}" data-detail-id="${ac.id}">
          <div class="aircraft-img-wrap">
            <img src="${ac.img}" alt="${ac.name}">
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
            <img src="${a.img}" alt="${a.name}">
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
      <img src="${ac.img}" alt="${ac.name}">
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

// (All Study Tools / interview prep functions removed — moved to dedicated site: alpha-interview-prep)

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
      <img src="${vessel.img}" alt="${vessel.name}">
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
      <div class="fleet-card" id="army-${v.id}" data-detail-id="${v.id}">
        <div class="fleet-img-wrap">
          ${v.img ? `<img src="${v.img}" alt="${v.name}">` : `<div style="height:140px; background:var(--navy-mid); display:flex; align-items:center; justify-content:center; color:var(--text-dim); font-size:13px;">Photo coming soon</div>`}
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
          ${v.img ? `<img src="${v.img}" alt="${v.name}">` : `<div style="height:140px; background:var(--navy-mid); display:flex; align-items:center; justify-content:center; color:var(--text-dim); font-size:13px;">Photo coming soon</div>`}
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
          ${v.img ? `<img src="${v.img}" alt="${v.name}">` : `<div style="height:140px; background:var(--navy-mid); display:flex; align-items:center; justify-content:center; color:var(--text-dim); font-size:13px;">Photo coming soon</div>`}
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
      <img src="${v.img}" alt="${v.name}">
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
      <img src="${v.img}" alt="${v.name}">
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
            '<div class="weapons-img-wrap"><img src="' + w.img + '" alt="' + w.name + '"></div>' +
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
            '<div class="weapons-img-wrap"><img src="' + (s.img || 'images/f35a.jpg') + '" alt="' + s.name + '"></div>' +
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
      <img src="${dispImg}" alt="${dispName}">
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
      <img src="${ac.img}" alt="${ac.name}">
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
  document.addEventListener('mouseover', (e) => {
    const termEl = e.target.closest('.glossary-term, .cross-ref');
    if (!termEl) return;

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
        html += `<img src="${preview.img}" alt="${preview.title}">`;
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
    const termEl = e.target.closest('.glossary-term, .cross-ref');
    if (termEl) {
      tooltipEl.style.display = 'none';
    }
  });

  // Click support for cross-refs (opens the relevant full card/modal)
  // Use capture phase so it runs early, before ancestor delegations (e.g. card open), and stop to prevent conflicts
  document.addEventListener('click', (e) => {
    const termEl = e.target.closest('.glossary-term, .cross-ref');
    if (!termEl) return;

    let p = termEl._previewData;

    // Robust lookup: if not pre-set from hover (e.g. quick click), lookup now
    if (!p) {
      const raw = termEl.dataset.term || termEl.textContent.trim();
      const key = raw.toLowerCase();
      p = previewMap.get(key) || previewMap.get(raw.toLowerCase().replace(/[^a-z0-9]/g, ''));
      if (!p) return;
    }

    e.stopImmediatePropagation();
    tooltipEl.style.display = 'none';

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
