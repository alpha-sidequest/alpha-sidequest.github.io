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
  // The reader (if open) will now automatically follow to the new section
  // and start reading the new content. See followReaderToSection below.

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
    console.warn('No section found with id:', id);
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

  // Resize Google maps if the section is shown while in online mode (to fix size 0 when init'ed hidden)
  if (id === 'bases' || id === 'operations') {
    setTimeout(() => {
      if (id === 'bases' && basesGoogleMap) google.maps.event.trigger(basesGoogleMap, 'resize');
      if (id === 'operations' && opsGoogleMap) google.maps.event.trigger(opsGoogleMap, 'resize');
    }, 50);
    // Also ensure the maps (and their markers) are created if the API finished loading after initial attempt
    setTimeout(ensureGoogleMapsInit, 80);
  }
}

// ── BASE MAP ──────────────────────────────────────────────────
function selectBase(id, event) {
  if (event) event.stopPropagation();

  const b = BASES[id];
  if (!b) return;

  document.querySelectorAll('.base-dot').forEach(d => d.classList.remove('selected'));
  const dot = document.querySelector(`.base-dot[data-base="${id}"]`);
  if (dot) dot.classList.add('selected');

  // Pan/zoom Google map if visible (so clicking list centers the marker)
  if (basesGoogleMap && b.lat && b.lng) {
    basesGoogleMap.panTo({ lat: b.lat, lng: b.lng });
    if (basesGoogleMap.getZoom() < 5) basesGoogleMap.setZoom(5);
  }

  // Highlight selected marker on Google bases (larger, darker stroke) and reset others (same as ops)
  const googleDiv = document.getElementById('bases-google-map');
  if (basesGoogleMap && googleDiv && googleDiv.style.display !== 'none' && basesMarkers) {
    Object.keys(basesMarkers).forEach(k => {
      const m = basesMarkers[k];
      const isSelected = (k === id);
      const base = BASES[k];
      const s = isSelected ? 12 : 9;
      m.setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        scale: s,
        fillColor: (base && base.color) || '#C9A84C',
        fillOpacity: 0.95,
        strokeColor: isSelected ? '#111' : '#FFFFFF',
        strokeWeight: isSelected ? 2.5 : 1.5,
        labelOrigin: new google.maps.Point(0, 0)
      });
    });
  }

  renderBaseCard(id);

  // Highlight in compact list (reuses the same .ops-list-item styles + selected state as operations)
  document.querySelectorAll('.ops-list-item').forEach(el => el.classList.remove('selected'));
  const listItem = document.querySelector(`.ops-list-item[data-base="${id}"]`);
  if (listItem) {
    listItem.classList.add('selected');
    listItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function renderBaseCard(id) {
  const b = BASES[id];
  if (!b) return;

  document.getElementById('basePlaceholder').style.display = 'none';
  const card = document.getElementById('baseCard');
  card.classList.add('visible');

  const service = getBaseService(b.name);
  const cleanName = b.name
    .replace(/^RAAF Base /i, '')
    .replace(/^HMAS /i, '')
    .replace(/^Army Aviation Centre /i, '')
    .replace(/^Puckapunyal Military Area$/i, 'Puckapunyal')
    .replace(/^Lavarack Barracks$/i, 'Lavarack')
    .replace(/^Robertson Barracks$/i, 'Robertson')
    .replace(/^Holsworthy Barracks$/i, 'Holsworthy');

  const sqHTML = b.squadrons.map(s => `
    <div class="squadron-item">
      <div class="squadron-num">${s.num}</div>
      <div class="squadron-info">
        <div class="squadron-name">${s.name}</div>
        <div class="squadron-aircraft">
          ${s.aircraft.split(' / ').map(a => `<span class="aircraft-chip" onclick="openBaseAssetModal('${a.replace(/'/g, "\\'")}')">${a}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');

  const colorDot = `<span class="base-color-dot" style="background:${b.color || '#C9A84C'}"></span>`;
  const serviceTag = `<div class="base-card-service">${service}</div>`;

  // Compact coords row (no heavy section label to save vertical space; useful map-related info)
  const coordsHTML = (b.lat && b.lng) ? `
    <div class="base-coords">
      <span class="coords-label">📍 ${b.lat.toFixed(4)}, ${b.lng.toFixed(4)}</span>
      <button type="button" class="copy-btn" onclick="copyCoords(${b.lat}, ${b.lng}, this)">copy</button>
      <a href="https://www.google.com/maps/@${b.lat},${b.lng},18z/data=!3m1!1e3" target="_blank" rel="noopener noreferrer" class="google-maps-link">map</a>
    </div>
  ` : '';

  card.innerHTML = `
    <div class="base-card-header">
      <div class="base-header-top">
        <div class="base-card-location">${colorDot}${b.location}</div>
        ${serviceTag}
      </div>
      <div class="base-card-name">${cleanName}</div>
      <div class="base-card-role">${b.role}</div>
    </div>
    <div class="base-card-body">
      <div class="base-about-media">
        ${b.image || coordsHTML ? `
        <div class="base-media">
          ${b.image ? `
          <div class="base-section-label">Aerial View</div>
          <div class="base-aerial-wrap">
            <img src="${b.image}" alt="Bird's-eye view of ${b.name}" class="base-aerial-preview" onclick="showBaseAerial('${b.image}', '${b.name.replace(/'/g, "\\'")}')" loading="lazy">
            <div class="base-aerial-hint">Click to enlarge • Offline asset</div>
          </div>
          ` : ''}
          ${coordsHTML ? `
          <div style="margin-top: 8px;">
            ${coordsHTML}
          </div>
          ` : ''}
        </div>
        ` : ''}
        <div class="base-about">
          <div class="base-section-label">About this base</div>
          <p class="base-desc">${b.desc}</p>
        </div>
      </div>

      <div class="base-section-label">Units &amp; Assets <span style="font-weight:400;color:var(--text-dim);">(${b.squadrons.length} units)</span></div>
      <div class="base-units-grid">
        ${sqHTML}
      </div>
      <p class="base-card-hint">Tap names above to pop up details (stays on this page — close to continue reading)</p>
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
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

// Close base image modal on overlay click
const baseImgModal = document.getElementById('baseImageModal');
if (baseImgModal) {
  baseImgModal.addEventListener('click', function(e) {
    if (e.target === baseImgModal) closeBaseImageModal();
  });
}

function copyCoords(lat, lng, btnEl) {
  const text = `${lat}, ${lng}`;
  const origText = btnEl ? btnEl.textContent : '';
  navigator.clipboard.writeText(text).then(() => {
    if (btnEl) {
      btnEl.textContent = 'Copied!';
      setTimeout(() => { if (btnEl) btnEl.textContent = origText || 'Copy'; }, 1400);
    }
  }).catch(() => {
    // Fallback for older browsers / no https
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch(e){}
    document.body.removeChild(ta);
    if (btnEl) {
      btnEl.textContent = 'Copied!';
      setTimeout(() => { if (btnEl) btnEl.textContent = origText || 'Copy'; }, 1400);
    }
  });
}

function openBaseAssetModal(name) {
  if (!name || name.toLowerCase() === 'n/a' || name.toLowerCase().includes('admin') || name.toLowerCase().includes('support') || name.toLowerCase().includes('logistics')) {
    return; // skip non-asset entries
  }

  // Try Aircraft first (most common in base cards)
  const acData = (typeof AIRCRAFT !== 'undefined' ? AIRCRAFT : []);
  let match = acData.find(a => 
    name.toLowerCase().includes((a.desig || '').toLowerCase()) || 
    name.toLowerCase().includes((a.name || '').toLowerCase())
  );
  if (match) {
    openAircraftModal(match.id);
    return;
  }

  // Try Army vehicles / ground assets (e.g. M1A1 Abrams, Bushmaster, etc. from army bases)
  const armyData = (window.ARMY || (typeof ARMY !== 'undefined' ? ARMY : []));
  match = armyData.find(v => 
    name.toLowerCase().includes((v.name || '').toLowerCase()) ||
    (v.desig && name.toLowerCase().includes(v.desig.toLowerCase()))
  );
  if (match) {
    showVehicleDetail(match.id);
    return;
  }

  // Try Navy vessels (in case any base lists ships/helo that match navy ids)
  const navyData = (window.NAVY || (typeof NAVY !== 'undefined' ? NAVY : []));
  match = navyData.find(v => 
    name.toLowerCase().includes((v.name || '').toLowerCase()) ||
    (v.desig && name.toLowerCase().includes(v.desig.toLowerCase()))
  );
  if (match) {
    showMaritimeDetail(match.id);
    return;
  }

  // No match found - optionally could console, but silently ignore for clean UX
  // console.warn('[ADF Forge] No matching asset modal for base chip:', name);
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
  // Top navigation bar (event delegation)
  const navLinks = document.querySelector('.nav-links');

  if (navLinks) {
    navLinks.addEventListener('click', (e) => {
      const link = e.target.closest('.nav-link[data-section]');
      if (!link) return;
      const sectionId = link.dataset.section;
      showSection(sectionId, link);
    });
  }

  // "What's Inside" feature cards (event delegation)
  const featureCards = document.querySelector('.feature-cards');

  if (featureCards) {
    featureCards.addEventListener('click', (e) => {
      const card = e.target.closest('.feature-card[data-section]');
      if (!card) return;
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

  // Mobile nav toggle button
  const navToggle = document.querySelector('.nav-toggle');
  if (navToggle) {
    navToggle.addEventListener('click', (e) => {
      e.stopImmediatePropagation();
      toggleNavMenu();
    });
  }
}

function toggleNavMenu() {
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    navLinks.classList.toggle('open');
  }
}

// Ensure nav is closed if window resizes to desktop size
window.addEventListener('resize', () => {
  const navLinks = document.querySelector('.nav-links');
  if (navLinks && window.innerWidth > 1100 && navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
  }
});

// Close mobile nav when clicking a section link or outside
document.addEventListener('click', (e) => {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks || !navLinks.classList.contains('open')) return;

  if (e.target.closest('.nav-link')) {
    navLinks.classList.remove('open');
  } else if (!e.target.closest('nav')) {
    navLinks.classList.remove('open');
  }
});

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
  const modal = document.getElementById('aircraftModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';

  // User wants silence when closing a card — do not auto-start the main section.
  // Only start speaking again when a new card is opened.
  const panel = document.getElementById('reader-panel');
  if (panel && panel.style.display !== 'none') {
    stopSpeech();
    updateReaderSectionLabel(getCurrentSectionForReader());
  }
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
const aircraftModalEl = document.getElementById('aircraftModal');
if (aircraftModalEl) {
  aircraftModalEl.addEventListener('click', function(e) {
    if (e.target === aircraftModalEl) closeModal();
  });
}

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
  let items = getAllStudyItems(source);

  // Filter out known items (legacy)
  const unknown = items.filter(item => !knownFlashcards.has(item.id));
  if (unknown.length > 0) items = unknown;

  // SRS: Prioritize due items for better retention
  if (window.ADF_SRS && items.length > 0) {
    const allIds = items.map(item => item.id || `${source}-${(item.front || item.title || '').substring(0, 50)}`);
    const dueIds = ADF_SRS.getDueItems(allIds, Math.min(60, items.length));

    if (dueIds.length > 0) {
      const dueItems = [];
      const otherItems = [];

      items.forEach(item => {
        const id = item.id || `${source}-${(item.front || item.title || '').substring(0, 50)}`;
        if (dueIds.includes(id)) dueItems.push(item);
        else otherItems.push(item);
      });

      items = [...dueItems, ...otherItems.sort(() => Math.random() - 0.5)];
    }
  }

  currentFlashcards = items;
  currentFlashcardIndex = 0;
  shuffleFlashcards(false);
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

  let backHTML = `
    <div style="white-space: pre-line; line-height:1.55; font-size:15.5px;">${item.back}</div>
  `;

  // SRS Quality Rating buttons (shown on back for active recall training)
  if (window.ADF_SRS) {
    const id = item.id || `${currentFlashcardSource}-${(item.front || item.title || '').substring(0, 50)}`;
    backHTML += `
      <div style="margin-top:16px; padding-top:12px; border-top:1px solid var(--border);">
        <div style="font-size:12px; color:var(--text-muted); margin-bottom:6px;">How well did you recall this?</div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button class="study-btn secondary" style="font-size:12px; padding:4px 10px;" onclick="rateFlashcardSRS('${id}', 1, event)">Again (1)</button>
          <button class="study-btn secondary" style="font-size:12px; padding:4px 10px;" onclick="rateFlashcardSRS('${id}', 2, event)">Hard (2)</button>
          <button class="study-btn" style="font-size:12px; padding:4px 10px;" onclick="rateFlashcardSRS('${id}', 3, event)">Good (3)</button>
          <button class="study-btn" style="font-size:12px; padding:4px 10px;" onclick="rateFlashcardSRS('${id}', 4, event)">Easy (4)</button>
        </div>
      </div>
    `;
  }

  back.innerHTML = backHTML;

  counter.textContent = `${currentFlashcardIndex + 1} / ${currentFlashcards.length}`;
  knownCount.textContent = knownFlashcards.size;

  const pct = currentFlashcards.length > 0 ? Math.round(((currentFlashcardIndex + 1) / currentFlashcards.length) * 100) : 0;
  progressBar.style.width = pct + '%';
}

function rateFlashcardSRS(id, quality, event) {
  if (event) event.stopImmediatePropagation();

  if (window.ADF_SRS) {
    ADF_SRS.update(id, quality);
  }

  // Move to next card after rating
  setTimeout(() => {
    nextFlashcard();
  }, 120);
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
  const id = item.id || `${currentFlashcardSource}-${(item.front || item.title || '').substring(0, 50)}`;

  knownFlashcards.add(id);
  saveFlashcardProgress();

  // SRS: Treat "known" as solid recall
  if (window.ADF_SRS) {
    ADF_SRS.update(id, 4); // Good
  }

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
        options: [platforms, ...getRandomWrongAnswers(platforms, ['F-35A', 'P-8A', 'EA-18G Growler', 'Hobart-class', 'Super Hornet', 'Growler'], 3)],
        explanation: `${w.desig} ${w.name} – ${keyAdvantage}`
      });
    });
  }

  if (type === 'adversary' || type === 'mixed') {
    ADVERSARY_AIRCRAFT.forEach(a => {
      pool.push({
        question: `Which country operates the ${a.desig} ${a.name}?`,
        correct: a.origin,
        options: [a.origin, ...getRandomWrongAnswers(a.origin, ['China', 'Russia', 'North Korea', 'Iran'], 3)],
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
        options: [p.back, ...getRandomWrongAnswers(p.back, PFA_STANDARDS.map(x => x.back), 3)],
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
        options: [r.definition, ...getRandomWrongAnswers(r.definition, RANKS.map(x => x.definition), 3)],
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
        options: [l.definition, ...getRandomWrongAnswers(l.definition, LEADERSHIP_ITEMS.map(x => x.definition), 3)],
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
        options: [a.tagline, ...getRandomWrongAnswers(a.tagline, AIRCRAFT.map(x => x.tagline), 3)],
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
        options: [f.tagline, ...getRandomWrongAnswers(f.tagline, NAVY_DATA.map(x => x.tagline), 3)],
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
          options: [c.back, ...getRandomWrongAnswers(c.back, CYBERSPACE_STUDY_ITEMS.map(x => x.back), 3)],
          explanation: "This is a signature rapid-exploitation TTP of APT40, as noted in ASD threat reports."
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

  const exp = (question.explanation && question.explanation !== question.correct) ? ` ${question.explanation}` : '';
  feedback.innerHTML = isCorrect 
    ? `<strong style="color:#2EC4A0">Correct!</strong> ${question.explanation || ''}`
    : `<strong style="color:#E05A40">Incorrect.</strong> The correct answer is <strong>${question.correct}</strong>.${exp || ''}`;

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
  if (clickedTab) clickedTab.classList.add('active');

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

  // Never steal keys when typing in form fields (textareas etc.)
  const active = document.activeElement;
  const tag = active ? active.tagName : '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (active && active.isContentEditable)) return;

  if (e.key === ' ' || e.key === 'Spacebar') {
    e.preventDefault();
    flipFlashcard();
  }
  if (e.key === 'ArrowRight') nextFlashcard();
  if (e.key.toLowerCase() === 'k') markFlashcardKnown();
});

// ============================================
// AUDIO LEARNING LOOPS - Dedicated Listening Study Mode
// Random continuous loop using Tara at optimal listening speed.
// Content is pre-crafted for audio clarity and memory retention.
// ============================================

let audioLoopActive = false;
let audioLoopPaused = false;
let audioLoopGroup = null;
let audioLoopItems = [];
let audioLoopCurrentIndex = -1;
let audioLoopTimeout = null;
let audioLoopSession = 0;
let audioLoopCurrentItem = null;
let audioLoopPausedAtChunk = -1;
let audioLoopSmartMode = false; // SRS-aware selection when true
let audioLoopRecentlyPlayed = []; // ids of recently played items for avoidance
const RECENTLY_PLAYED_LIMIT = 8; // avoid repeating these in the pool

// Audio loop voice preference (separate from the floating reader)
let audioLoopVoiceName = null; // stores voice.name from speechSynthesis, or null = auto best
let audioLoopVoicesLoaded = false;

// Helper: skip weak/generic "why it matters" and similar filler that adds no value
function isMeaningfulText(text, minLen = 22) {
  if (!text || typeof text !== 'string') return false;
  const t = text.trim();
  if (t.length < minLen) return false;
  const lower = t.toLowerCase();
  const bad = [
    'important army capability',
    'key system that enhances the adf',
    'provides the adf with important capability',
    'key knowledge for understanding threats and the role of specialists',
    'understanding ranks is essential for leadership',
    'key surface or submarine capability for the ran',
    'critical capability for the australian defence force',
    'important capability for the raaf',
    'important concept for modern operations'
  ];
  if (bad.some(g => lower.includes(g))) return false;
  return true;
}

function selectAudioGroup(groupKey, buttonEl) {
  // Deselect all
  document.querySelectorAll('.audio-group-btn').forEach(b => b.classList.remove('active'));
  if (buttonEl) buttonEl.classList.add('active');

  audioLoopGroup = groupKey;
  audioLoopItems = buildListeningPool(groupKey);
  audioLoopRecentlyPlayed = []; // fresh avoidance when changing groups

  console.log(`[AudioLoop] Group ${groupKey} loaded with ${audioLoopItems.length} total items (curated + auto-generated from main data)`);

  const status = document.getElementById('audio-loop-status');
  if (status) {
    status.innerHTML = `
      <div style="font-size:13px;color:var(--text-dim);">Group selected:</div>
      <div style="font-size:17px;font-weight:600;color:var(--gold);">${buttonEl ? buttonEl.textContent : groupKey}</div>
      <div style="font-size:13px;margin-top:4px;">${audioLoopItems.length} listening-optimized items ready.</div>
    `;
  }

  // Enable start button
  const startBtn = document.getElementById('audio-start-btn');
  if (startBtn) startBtn.disabled = false;

  // Clear previous transcript when switching groups (avoids showing stale card from another group)
  const t = document.getElementById('audio-last-text');
  if (t) t.innerHTML = '<span style="color:var(--text-dim); font-size:13px;">Select "Start Listening Loop" to begin.</span>';

  // Make sure the voice picker is populated as soon as the user interacts with audio
  if (typeof forceLoadVoices === 'function') {
    forceLoadVoices(() => populateAudioVoiceSelect());
  } else {
    populateAudioVoiceSelect();
  }
}

function startAudioLearningLoop() {
  console.log('[AudioLoop] start called. group=', audioLoopGroup, 'items count=', audioLoopItems ? audioLoopItems.length : 0);

  if (!audioLoopGroup || !audioLoopItems.length) {
    alert("Please select a group first.");
    return;
  }

  // Close the main floating reader if it's open, to avoid conflicts
  const mainReader = document.getElementById('reader-panel');
  if (mainReader) mainReader.style.display = 'none';

  audioLoopActive = true;
  audioLoopPaused = false;
  audioLoopCurrentIndex = -1;
  audioLoopSession++;

  audioLoopCurrentItem = null;
  audioLoopPausedAtChunk = -1;

  // Make sure voices are loaded (works on Safari, Firefox, Chrome)
  if (typeof forceLoadVoices === 'function') {
    forceLoadVoices(() => {
      // After voices are ready, make sure our picker reflects the saved choice
      populateAudioVoiceSelect();
    });
  } else {
    populateAudioVoiceSelect();
  }

  // Apply any saved voice preference
  loadAudioLoopVoice();

  // Shuffle for better experience
  audioLoopItems = [...audioLoopItems].sort(() => Math.random() - 0.5);

  updateAudioLoopUI();

  // Show the active voice in the status area (helpful when user has chosen something other than auto)
  setTimeout(() => {
    const info = document.getElementById('audio-loop-info');
    if (info && audioLoopActive) {
      const activeVoice = getAudioLoopVoice();
      const vName = activeVoice ? activeVoice.name : 'system default';
      info.textContent = `${audioLoopItems.length} items • Voice: ${vName}`;
    }
  }, 60);
  playNextAudioItem();

  const startBtn = document.getElementById('audio-start-btn');
  const pauseBtn = document.getElementById('audio-pause-btn');
  if (startBtn) startBtn.style.display = 'none';
  if (pauseBtn) pauseBtn.style.display = 'inline-block';
}

function playNextAudioItem() {
  console.log('[AudioLoop] playNextAudioItem called, currentIndex before=', audioLoopCurrentIndex);

  if (!audioLoopActive || audioLoopPaused) return;

  const thisSession = audioLoopSession;

  if (!audioLoopItems || audioLoopItems.length === 0) {
    stopAudioLearningLoop();
    return;
  }

  if (audioLoopSession !== thisSession) return; // invalidated by stop

  // Build candidate list with recently played avoidance + SRS
  let candidates = [...audioLoopItems];

  // Recently played avoidance (unless pool is tiny)
  if (audioLoopRecentlyPlayed.length > 0 && candidates.length > audioLoopRecentlyPlayed.length + 3) {
    candidates = candidates.filter(it => !audioLoopRecentlyPlayed.includes(it.id));
  }
  if (candidates.length === 0) candidates = [...audioLoopItems];

  // Smart / SRS mode: prefer due items
  if (audioLoopSmartMode && window.ADF_SRS) {
    const allIds = candidates.map(it => it.id);
    const dueIds = ADF_SRS.getDueItems(allIds, 30);
    if (dueIds.length > 0) {
      const dueCandidates = candidates.filter(it => dueIds.includes(it.id));
      if (dueCandidates.length > 0) candidates = dueCandidates;
    }
  }

  // Pick from the filtered candidates
  let chosenIndexInCandidates = Math.floor(Math.random() * candidates.length);
  const chosenItem = candidates[chosenIndexInCandidates];
  audioLoopCurrentIndex = audioLoopItems.findIndex(it => it.id === chosenItem.id);

  // Record as recently played
  if (chosenItem && chosenItem.id) {
    audioLoopRecentlyPlayed.push(chosenItem.id);
    if (audioLoopRecentlyPlayed.length > RECENTLY_PLAYED_LIMIT) {
      audioLoopRecentlyPlayed.shift();
    }
  }

  const item = audioLoopItems[audioLoopCurrentIndex];

  audioLoopCurrentItem = item;
  audioLoopPausedAtChunk = -1;

  // Build beautiful, listening-optimized text with optional depth/nuance
  let spokenText = item.title + ". ";

  if (item.overview) {
    spokenText += item.overview + " ";
  }

  // Add "Why this matters" only when it is actually useful content (skip generic/repetitive fillers)
  if (item.whyItMatters && isMeaningfulText(item.whyItMatters)) {
    spokenText += "Why this matters: " + item.whyItMatters + " ";
  }

  if (item.commonMisconceptions && isMeaningfulText(item.commonMisconceptions, 18)) {
    spokenText += "A common misconception is that " + item.commonMisconceptions + " ";
  }

  // Filter keyPoints to drop any obvious generic fallback lines
  const goodKeyPoints = (item.keyPoints || []).filter(p => isMeaningfulText(p, 15));
  if (goodKeyPoints.length > 0) {
    spokenText += "Key things to remember: ";
    goodKeyPoints.forEach((point, i) => {
      spokenText += (i + 1) + ". " + point + ". ";
    });
  }

  // Update UI
  const currentEl = document.getElementById('audio-current-item');
  const infoEl = document.getElementById('audio-loop-info');
  if (currentEl) currentEl.textContent = item.title;
  if (infoEl) infoEl.textContent = `Listening item ${audioLoopCurrentIndex + 1} of ${audioLoopItems.length} • Random mode`;

  // Show the COMPLETE written text (full structured content) + image beside the text if the item has one
  const transcriptEl = document.getElementById('audio-last-text');
  if (transcriptEl) {
    let html = '';
    const hasImg = !!item.img;
    if (hasImg) {
      html += `<div style="display:flex; gap:16px; align-items:flex-start; flex-wrap:wrap;">`;
      html += `<img src="${item.img}" alt="${item.title}" style="width:168px; max-width:32%; height:auto; max-height:168px; border-radius:6px; border:1px solid var(--border); object-fit:contain; flex-shrink:0; box-shadow:0 1px 3px rgba(0,0,0,0.2);">`;
      html += `<div style="flex:1; min-width:240px;">`;
    }
    html += `<strong style="font-size:15.5px; color:var(--gold);">${item.title}</strong><br><br>`;
    if (item.overview) html += `${item.overview}<br><br>`;
    // Only show Why this matters when it adds real value (not the generic "key knowledge..." / "important capability" style lines)
    if (item.whyItMatters && isMeaningfulText(item.whyItMatters)) {
      html += `<em style="color:var(--text-muted);">Why this matters:</em> ${item.whyItMatters}<br><br>`;
    }
    if (item.commonMisconceptions && isMeaningfulText(item.commonMisconceptions, 18)) {
      html += `<em style="color:var(--text-muted);">Common misconception:</em> ${item.commonMisconceptions}<br><br>`;
    }
    const goodKeyPointsHtml = (item.keyPoints || []).filter(p => isMeaningfulText(p, 15));
    if (goodKeyPointsHtml.length) {
      html += `<em style="color:var(--text-muted);">Key points to remember:</em><br>`;
      goodKeyPointsHtml.forEach((p) => {
        html += `• ${p}<br>`;
      });
    }
    if (hasImg) {
      html += `</div></div>`;
    }
    transcriptEl.innerHTML = html;
  }

  // Speak using the chosen voice (or best auto if none selected)
  // Force one more voice enumeration right before we speak (this often makes the full list appear)
  try { if (window.speechSynthesis) window.speechSynthesis.getVoices(); } catch (e) {}
  populateAudioVoiceSelect();

  speakAudioLoopText(spokenText, () => {
    // When finished, pause briefly then move to next
    // The session check here is redundant with the one inside loopSpeakNext,
    // but kept for safety.
    if (audioLoopActive && !audioLoopPaused && audioLoopSession === thisSession) {
      audioLoopTimeout = setTimeout(() => {
        playNextAudioItem();
      }, 2200); // Nice breathing room between items for the listener
    }
  }, 0);
}

function speakAudioLoopText(text, onComplete, startFrom = 0) {
  // Reuse the excellent chunking and speaking logic from the main reader
  // Force a clean stop first
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  fullReadableText = text;
  currentTextChunks = chunkTextIntoSentences(text);
  currentChunkIndex = startFrom;
  isSpeaking = true;
  isPaused = false;
  stopRequested = false;

  const thisSession = audioLoopSession;

  // We hook the completion
  function loopSpeakNext() {
    if (!audioLoopActive || audioLoopPaused || audioLoopSession !== thisSession || stopRequested || currentChunkIndex >= currentTextChunks.length) {
      stopRequested = false;
      isSpeaking = false;
      isPaused = false;
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    // Call the normal speakNextChunk but with our completion at the end
    const chunk = currentTextChunks[currentChunkIndex];
    if (!chunk || chunk.length < 4) {
      currentChunkIndex++;
      loopSpeakNext();
      return;
    }

    updateProgressUI();

    // Extra ensure for Firefox — speaking often finally makes the full voice list available
    ensureVoicesListener();
    try { if (window.speechSynthesis) window.speechSynthesis.getVoices(); } catch (e) {}

    const utterance = new SpeechSynthesisUtterance(chunk);

    // Use the user's chosen voice (or the smart best-available picker)
    const voice = getAudioLoopVoice();
    if (voice) {
      utterance.voice = voice;
      if (voice.lang) utterance.lang = voice.lang;
    } else {
      utterance.lang = 'en-AU';
    }
    utterance.rate = readerRate || 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 0.96;

    utterance.onend = () => {
      if (!audioLoopActive || audioLoopPaused || audioLoopSession !== thisSession) {
        if (typeof onComplete === 'function') onComplete();
        return;
      }
      currentChunkIndex++;
      updateProgressUI();
      loopSpeakNext();
    };

    utterance.onerror = () => {
      if (!audioLoopActive || audioLoopPaused || audioLoopSession !== thisSession) {
        if (typeof onComplete === 'function') onComplete();
        return;
      }
      currentChunkIndex++;
      loopSpeakNext();
    };

    currentUtterance = utterance;

    setTimeout(() => {
      if (!audioLoopActive || audioLoopPaused || audioLoopSession !== thisSession) {
        if (typeof onComplete === 'function') onComplete();
        return;
      }
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);

        // Speaking often unlocks the full voice list in Chrome etc.
        // Re-populate the dropdown so the user can see and pick real voices.
        setTimeout(() => {
          try { populateAudioVoiceSelect(); } catch (e) {}
        }, 350);
      } catch (e) {
        currentChunkIndex++;
        loopSpeakNext();
      }
    }, 12);
  }

  loopSpeakNext();
}

function pauseAudioLoop() {
  audioLoopPaused = true;

  // Capture where we are in the current item so we can resume exactly there
  audioLoopPausedAtChunk = currentChunkIndex;

  if (window.speechSynthesis) window.speechSynthesis.cancel();
  if (audioLoopTimeout) {
    clearTimeout(audioLoopTimeout);
    audioLoopTimeout = null;
  }

  document.getElementById('audio-pause-btn').style.display = 'none';
  document.getElementById('audio-resume-btn').style.display = 'inline-block';
}

function resumeAudioLoop() {
  if (!audioLoopActive) return;
  audioLoopPaused = false;

  document.getElementById('audio-pause-btn').style.display = 'inline-block';
  document.getElementById('audio-resume-btn').style.display = 'none';

  if (audioLoopCurrentItem && audioLoopPausedAtChunk >= 0) {
    // Resume the *same* item from the exact chunk we paused at
    const item = audioLoopCurrentItem;
    const startChunk = audioLoopPausedAtChunk;

    // Rebuild the spoken text for this item (consistent with playNextAudioItem)
    let spokenText = item.title + ". ";
    if (item.overview) spokenText += item.overview + " ";
    if (item.whyItMatters && isMeaningfulText(item.whyItMatters)) {
      spokenText += "Why this matters: " + item.whyItMatters + " ";
    }
    const goodResumePoints = (item.keyPoints || []).filter(p => isMeaningfulText(p, 15));
    if (goodResumePoints.length > 0) {
      spokenText += "Key things to remember: ";
      goodResumePoints.forEach((point, i) => {
        spokenText += (i + 1) + ". " + point + ". ";
      });
    }

    // Clear the pause bookmark
    const resumeChunk = audioLoopPausedAtChunk;
    audioLoopPausedAtChunk = -1;

    // Speak starting from the saved chunk
    speakAudioLoopText(spokenText, () => {
      // After this item finishes, go back to normal random loop
      if (audioLoopActive && !audioLoopPaused) {
        audioLoopTimeout = setTimeout(() => {
          playNextAudioItem();
        }, 2200);
      }
    }, resumeChunk);
  } else {
    // We were paused between items (or no bookmark), just continue the loop
    playNextAudioItem();
  }
}

function skipAudioItem() {
  if (!audioLoopActive) return;

  // Invalidate the current speaking chain (same as stop does)
  // This prevents any pending onend / loopSpeakNext from the current item
  // from continuing to speak remaining chunks or scheduling the next item.
  audioLoopSession++;

  if (audioLoopTimeout) {
    clearTimeout(audioLoopTimeout);
    audioLoopTimeout = null;
  }

  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  audioLoopPausedAtChunk = -1;

  // Start the next fresh item
  playNextAudioItem();
}

function stopAudioLearningLoop() {
  audioLoopActive = false;
  audioLoopPaused = false;
  audioLoopSession++;  // This is the key: any pending onend / loopSpeakNext from the current utterance will see the new session and bail immediately

  audioLoopCurrentItem = null;
  audioLoopPausedAtChunk = -1;
  audioLoopRecentlyPlayed = []; // clear avoidance list on full stop

  if (audioLoopTimeout) {
    clearTimeout(audioLoopTimeout);
    audioLoopTimeout = null;
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  const startBtn = document.getElementById('audio-start-btn');
  const pauseBtn = document.getElementById('audio-pause-btn');
  const resumeBtn = document.getElementById('audio-resume-btn');
  const currentEl = document.getElementById('audio-current-item');
  const infoEl = document.getElementById('audio-loop-info');

  if (startBtn) startBtn.style.display = 'inline-block';
  if (pauseBtn) pauseBtn.style.display = 'none';
  if (resumeBtn) resumeBtn.style.display = 'none';
  if (currentEl) currentEl.textContent = 'Loop stopped.';
  if (infoEl) infoEl.textContent = 'Select a group and start again when ready.';

  // Leave the last transcript (full text + any image) visible.
  // The user can still read the complete content of the card that was playing.
  // (We only clear the "currently speaking" label area on next play or group change.)
}

function updateAudioLoopUI() {
  // Can be expanded later for counters etc.
}

// Build the full listening pool for a group, combining curated + auto-generated from main data
// Build the full listening pool for a group, combining curated + auto-generated from main data
function buildListeningPool(groupKey) {
  let pool = [];
  const curated = (window.LISTENING_DATA && window.LISTENING_DATA[groupKey]) || [];
  pool = [...curated];

  // Use direct references - since data.js runs first, these should be in global scope
  if (groupKey === 'group1') {
    // All Bases (BASES is an object)
    if (typeof BASES !== 'undefined' && BASES) {
      Object.keys(BASES).forEach(key => {
        const base = BASES[key];
        if (base && !pool.find(p => p.id === key)) {
          const entry = {
            id: key,
            title: base.name,
            overview: base.desc,
            whyItMatters: `${base.name} in ${base.location} is vital because it supports ${base.role.toLowerCase()}.`,
            keyPoints: (base.squadrons || []).map(s => `${s.num} ${s.name} - ${s.aircraft}.`)
          };
          if (base.img) entry.img = base.img;
          pool.push(entry);
        }
      });
    }
    // All Operations
    if (typeof OPERATIONS !== 'undefined' && Array.isArray(OPERATIONS)) {
      OPERATIONS.forEach(op => {
        if (op && op.id && !pool.find(p => p.id === op.id)) {
          const entry = {
            id: op.id,
            title: op.name,
            overview: op.desc,
            whyItMatters: `${op.name} in ${op.region} is important for maintaining presence and response options.`,
            keyPoints: (op.assets || []).map(a => a)
          };
          if (op.img) entry.img = op.img;
          pool.push(entry);
        }
      });
    }
  }

  if (groupKey === 'group2') {
    // Air Force
    if (typeof AIRCRAFT !== 'undefined' && Array.isArray(AIRCRAFT)) {
      AIRCRAFT.forEach(ac => {
        if (ac && ac.id && !pool.find(p => p.id === ac.id)) {
          const entry = {
            id: ac.id,
            title: `${ac.desig || ''} ${ac.name}`.trim(),
            overview: ac.overview || ac.tagline || '',
            whyItMatters: ac.tagline || 'Important capability for the RAAF.',
            keyPoints: (ac.systems || []).slice(0, 3).map(s => `${s.name}: ${s.layman || s.desc}`)
          };
          if (ac.img) entry.img = ac.img;
          pool.push(entry);
        }
      });
    }
    // Navy
    if (typeof NAVY !== 'undefined' && Array.isArray(NAVY)) {
      NAVY.forEach(v => {
        if (v && v.id && !pool.find(p => p.id === v.id)) {
          const entry = {
            id: v.id,
            title: `${v.desig || ''} ${v.name}`.trim(),
            overview: v.overview || '',
            keyPoints: (v.systems || []).slice(0, 3).map(s => `${s.name}: ${s.layman || s.desc}`)
          };
          // Only add whyItMatters when we have something specific and non-generic from the source
          if (v.overview && isMeaningfulText(v.overview, 30)) {
            entry.whyItMatters = v.overview;
          } else if (v.tagline && isMeaningfulText(v.tagline, 25)) {
            entry.whyItMatters = v.tagline;
          }
          if (v.img) entry.img = v.img;
          pool.push(entry);
        }
      });
    }
    // Army
    if (typeof ARMY !== 'undefined' && Array.isArray(ARMY)) {
      ARMY.forEach(v => {
        if (v && v.id && !pool.find(p => p.id === v.id)) {
          const entry = {
            id: v.id,
            title: v.name,
            overview: v.overview || '',
            keyPoints: (v.systems || []).slice(0, 3).map(s => `${s.name}: ${s.layman || s.desc}`)
          };
          // Derive a real why only if the source has something specific; otherwise omit the generic filler
          if (v.overview && isMeaningfulText(v.overview, 30)) {
            entry.whyItMatters = v.overview;
          } else if (v.tagline && isMeaningfulText(v.tagline, 25)) {
            entry.whyItMatters = v.tagline;
          }
          if (v.img) entry.img = v.img;
          pool.push(entry);
        }
      });
    }
    // Weapons & Systems
    if (typeof WEAPONS !== 'undefined' && Array.isArray(WEAPONS)) {
      WEAPONS.forEach(w => {
        if (w && w.id && !pool.find(p => p.id === w.id)) {
          const name = w.name || 'Unknown System';
          const desc = w.desc || '';
          const layman = w.layman || '';
          const systems = w.systems || [];

          let overview = desc;
          if (!overview && layman) overview = layman;

          // Only create a whyItMatters if we have real descriptive content; skip the generic fallbacks
          let why = null;
          if (layman && isMeaningfulText(layman, 25)) {
            why = layman;
          } else if (desc && isMeaningfulText(desc, 30)) {
            why = desc;
          }

          let points = [];
          if (layman && isMeaningfulText(layman, 20)) points.push(layman);
          systems.forEach(s => {
            const point = `${s.name}: ${s.layman || s.desc || ''}`;
            if (point.length > 10 && isMeaningfulText(point, 18)) points.push(point);
          });

          const entry = {
            id: w.id,
            title: name,
            overview: overview,
            keyPoints: points.length > 0 ? points : null
          };
          if (why && isMeaningfulText(why, 22)) entry.whyItMatters = why;
          if (w.img) entry.img = w.img;
          pool.push(entry);
        }
      });
    }
  }

  if (groupKey === 'group3') {
    // Pull from CYBERSPACE_STUDY_ITEMS for more volume
    if (typeof CYBERSPACE_STUDY_ITEMS !== 'undefined' && Array.isArray(CYBERSPACE_STUDY_ITEMS)) {
      CYBERSPACE_STUDY_ITEMS.forEach(item => {
        if (item && item.id && !pool.find(p => p.id === item.id)) {
          const cyberEntry = {
            id: item.id,
            title: item.front || 'Cyber / Threat Concept',
            overview: item.back || '',
            keyPoints: []
          };
          // Only attach a why if the back/overview is actually substantive (avoid the generic specialist phrase)
          if (item.back && isMeaningfulText(item.back, 35)) {
            cyberEntry.whyItMatters = item.back;
          }
          pool.push(cyberEntry);
        }
      });
    }

    // Pull from RANKS
    if (typeof RANKS !== 'undefined') {
      const ranksArr = Array.isArray(RANKS) ? RANKS : Object.values(RANKS || {});
      ranksArr.forEach(rank => {
        if (rank && rank.name && !pool.find(p => p.id === rank.id || p.title === rank.name)) {
          const rankEntry = {
            id: rank.id || ('rank-' + rank.name.toLowerCase().replace(/\s+/g, '-')),
            title: rank.name,
            overview: rank.desc || `The ${rank.name} rank carries important responsibilities in the ADF.`,
            keyPoints: []
          };
          // Curated LISTENING_DATA entries have rich per-rank whyItMatters.
          // For auto-generated ranks, skip the generic "understanding ranks is essential" filler.
          // We can optionally promote a short specific note if the desc is strong.
          if (rank.desc && isMeaningfulText(rank.desc, 40)) {
            rankEntry.whyItMatters = rank.desc;
          }
          pool.push(rankEntry);
        }
      });
    }
  }

  // Safety net: if for some reason the pool is empty (or very small), provide a decent fallback
  // so the loop can start and the user isn't blocked.
  if (pool.length < 5) {
    if (groupKey === 'group1') {
      const fallback = [
        { id: 'amberley', title: 'RAAF Base Amberley', overview: 'Major air base in Queensland, key for strike and transport.', whyItMatters: 'Critical hub for air combat power.', keyPoints: ['Home to Super Hornet and Growler squadrons.'] },
        { id: 'williamtown', title: 'RAAF Base Williamtown', overview: 'Home of the F-35A and Wedgetail.', whyItMatters: 'Primary air defence base.', keyPoints: ['F-35 fleet base.'] },
        { id: 'pearce', title: 'RAAF Base Pearce', overview: 'Fighter training base in Western Australia.', whyItMatters: 'Essential for pilot production.', keyPoints: ['Hawk lead-in fighter training.'] }
      ];
      fallback.forEach(f => { if (!pool.find(p => p.id === f.id)) pool.push(f); });
    } else if (groupKey === 'group2') {
      const fallback = [
        { id: 'f35a', title: 'F-35A Lightning II', overview: 'Fifth generation stealth fighter.', whyItMatters: 'Cornerstone of future air power.', keyPoints: ['Advanced sensors and stealth.'] },
        { id: 'growler', title: 'EA-18G Growler', overview: 'Electronic attack aircraft.', whyItMatters: 'Suppresses enemy air defences.', keyPoints: ['Jamming and HARM.'] },
        { id: 'superhornet', title: 'F/A-18F Super Hornet', overview: 'Main strike fighter.', whyItMatters: 'Current backbone of RAAF combat power.', keyPoints: ['Multirole with AESA radar.'] },
        { id: 'poseidon', title: 'P-8A Poseidon', overview: 'Maritime patrol and ASW aircraft.', whyItMatters: 'Critical for vast ocean surveillance.', keyPoints: ['Long endurance, torpedoes, Harpoon.'] },
        { id: 'hobart', title: 'Hobart-class Destroyer', overview: 'Aegis air warfare destroyer.', whyItMatters: 'Core of naval task group air defence.', keyPoints: ['SPY-1D + SM-2/6.'] }
      ];
      fallback.forEach(f => { if (!pool.find(p => p.id === f.id)) pool.push(f); });
    } else if (groupKey === 'group3') {
      const fallback = [
        { id: 'space-ops-officer', title: 'Space Operations Officer Role', overview: 'Protecting access to space.', whyItMatters: 'Critical for modern operations.', keyPoints: ['Understand threats to satellites.'] },
        { id: 'cyber-warfare-officer', title: 'Cyber Warfare Officer', overview: 'Defending networks and conducting cyber operations.', whyItMatters: 'Modern conflict starts in cyberspace.', keyPoints: ['Defensive and offensive cyber roles.'] }
      ];
      fallback.forEach(f => { if (!pool.find(p => p.id === f.id)) pool.push(f); });
    }
  }

  return pool;
}

function toggleAudioSmartMode(enabled) {
  audioLoopSmartMode = !!enabled;
  // If loop is running, the next item will respect the new mode
  console.log('[AudioLoop] Smart Review (SRS) mode:', audioLoopSmartMode);
}

// ============================================
// SPACED REPETITION SYSTEM (SRS) - For Retention
// Lightweight SM-2 style scheduler stored in localStorage.
// Works for both regular study items and listening cards.
// ============================================

const SRS = {
  // Get all progress data
  getAll() {
    try {
      return JSON.parse(localStorage.getItem('adfForgeSRS') || '{}');
    } catch (e) {
      return {};
    }
  },

  // Save progress
  save(data) {
    localStorage.setItem('adfForgeSRS', JSON.stringify(data));
  },

  // Get or create progress for a specific item
  getItem(id) {
    const data = this.getAll();
    if (!data[id]) {
      data[id] = {
        interval: 0,
        ease: 2.5,
        repetitions: 0,
        due: Date.now(),
        lastReviewed: null,
      };
      this.save(data);
    }
    return data[id];
  },

  // Update progress after review (quality: 0-5, where 3+ is "good")
  update(id, quality) {
    const data = this.getAll();
    let item = data[id] || { interval: 0, ease: 2.5, repetitions: 0, due: Date.now() };

    if (quality < 3) {
      item.repetitions = 0;
      item.interval = 1;
    } else {
      item.repetitions = (item.repetitions || 0) + 1;

      if (item.repetitions === 1) {
        item.interval = 1;
      } else if (item.repetitions === 2) {
        item.interval = 6;
      } else {
        item.interval = Math.round(item.interval * item.ease);
      }
    }

    // Update ease factor
    item.ease = item.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (item.ease < 1.3) item.ease = 1.3;

    // Set next due date (in ms)
    const msPerDay = 24 * 60 * 60 * 1000;
    item.due = Date.now() + (item.interval * msPerDay);
    item.lastReviewed = Date.now();

    data[id] = item;
    this.save(data);
    return item;
  },

  // Get items that are due (or overdue)
  getDueItems(allItemIds, limit = 50) {
    const data = this.getAll();
    const now = Date.now();

    return allItemIds
      .map(id => ({ id, progress: data[id] || { due: 0 } }))
      .filter(item => (item.progress.due || 0) <= now)
      .sort((a, b) => (a.progress.due || 0) - (b.progress.due || 0))
      .slice(0, limit)
      .map(item => item.id);
  },

  // Get count of due items
  getDueCount(allItemIds) {
    const data = this.getAll();
    const now = Date.now();
    return allItemIds.filter(id => {
      const p = data[id];
      return !p || (p.due || 0) <= now;
    }).length;
  }
};

// Expose for debugging if needed
window.ADF_SRS = SRS;

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

  // Kick voice loading for the Audio Learning Loops picker (cross-browser)
  setTimeout(() => {
    ensureVoicesListener();
    if (typeof forceLoadVoices === 'function') {
      forceLoadVoices();
    } else if (window.speechSynthesis) {
      populateAudioVoiceSelect();
    }
  }, 300);
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

  // Search Space
  const SPACE_DATA = (window.SPACE || (typeof SPACE !== 'undefined' ? SPACE : []));
  const spaceResults = SPACE_DATA.filter(s =>
    s.name.toLowerCase().includes(query) ||
    s.desig.toLowerCase().includes(query) ||
    s.overview.toLowerCase().includes(query) ||
    (s.tags && s.tags.join(' ').toLowerCase().includes(query))
  ).slice(0, 5);

  if (spaceResults.length) {
    html += `<div class="search-result-group">Space</div>`;
    spaceResults.forEach(s => {
      html += `
        <div class="search-result-item" onclick="selectSearchResult('space', '${s.id}')">
          <span class="result-type">Space</span>
          <div class="result-title">${s.desig} — ${s.name}</div>
          <div class="result-subtitle">${s.tagline ? s.tagline.substring(0,80) + '...' : ''}</div>
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
  } else if (type === 'space') {
    const navEl = document.querySelector('.nav-link[data-section="space"]');
    showSection('space', navEl);
    setTimeout(() => showSpaceDetail(id), 350);
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

function buildSpaceGrid() {
  const grid = document.getElementById('spaceGrid');
  if (!grid) return;
  const SPACE_DATA = (window.SPACE || (typeof SPACE !== 'undefined' ? SPACE : []));

  // Group: ADF, Adversary, Allied, Key Concepts
  const adfIds = ['adf-satcom', 'sda', 'aus-cubesat', 'launch'];
  const advIds = ['china-asat', 'russia-asat'];
  const alliedIds = ['us-starshield', 'us-gps'];
  const conceptIds = ['space-law', 'kessler'];

  function renderSpaceCards(ids) {
    return ids.map(id => {
      const s = SPACE_DATA.find(x => x.id === id);
      if (!s) return '';
      const isAdv = /Adversary|china|russia/i.test((s.tags || []).join(' ') + (s.id || ''));
      const isAllied = /Allied|US|UK/i.test((s.tags || []).join(' ') + (s.id || ''));
      let badgeClass = '';
      let badgeText = s.desig || '';
      if (isAdv) badgeClass = ' adversary';
      else if (isAllied) badgeClass = ' allied';
      const specs = (s.stats || []).map(st => `${st.v} ${st.k}`).join(' • ');
      const tags = (s.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
      const role = s.tagline || '';
      return `
        <div class="fleet-card space-card" id="space-${s.id}" data-detail-id="${s.id}">
          <div class="fleet-img-wrap">
            ${s.img ? `<img src="${s.img}" alt="${s.name}" loading="lazy">` : `<div style="height:140px; background:var(--navy-mid); display:flex; align-items:center; justify-content:center; color:var(--text-dim); font-size:13px;">No image yet</div>`}
            <span class="fleet-type-badge${badgeClass}">${badgeText}</span>
          </div>
          <div class="fleet-card-body">
            <div class="fleet-designation">${s.desig}</div>
            <div class="fleet-name">${s.name}</div>
            <div class="fleet-role">${role}</div>
            <div class="fleet-specs">${specs}</div>
            <div class="fleet-tags">${tags}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  let html = '';
  html += `<div class="fleet-grid space-grid"><h4 style="grid-column: 1/-1; color:var(--gold); margin: 0 0 8px; font-size:14px;">ADF Space Capabilities</h4>${renderSpaceCards(adfIds)}</div>`;
  html += `<div class="fleet-grid space-grid" style="margin-top:24px;"><h4 style="grid-column: 1/-1; color:var(--threat); margin: 0 0 8px; font-size:14px;">Adversary Space / Counterspace</h4>${renderSpaceCards(advIds)}</div>`;
  html += `<div class="fleet-grid space-grid" style="margin-top:24px;"><h4 style="grid-column: 1/-1; color:var(--accent-blue); margin: 0 0 8px; font-size:14px;">Allied Space Capabilities</h4>${renderSpaceCards(alliedIds)}</div>`;
  html += `<div class="fleet-grid space-grid" style="margin-top:24px;"><h4 style="grid-column: 1/-1; color:var(--gold); margin: 0 0 8px; font-size:14px;">Key Concepts &amp; Threats</h4>${renderSpaceCards(conceptIds)}</div>`;
  grid.innerHTML = html;

  // Add click handlers for detail popups (reuses the main modal like navy/maritime)
  grid.querySelectorAll('.fleet-card[id^="space-"]').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.detailId || card.id.replace('space-', '');
      showSpaceDetail(id);
    });
  });
}

function showSpaceDetail(id) {
  const SPACE_DATA = (window.SPACE || (typeof SPACE !== 'undefined' ? SPACE : []));
  const item = SPACE_DATA.find(x => x.id === id);
  if (!item) return;

  const statsHTML = (item.stats || []).map(s => `<div class="modal-stat"><div class="modal-stat-val">${s.v}</div><div class="modal-stat-key">${s.k}</div></div>`).join('');

  const tagsHTML = (item.tags || []).map(t => `<span class="tag">${t}</span>`).join('');

  document.getElementById('modalInner').innerHTML = `
    <div class="modal-hero" style="background: linear-gradient(135deg, #0a1628, #112244);">
      <div class="modal-hero-text" style="padding: 24px;">
        <div class="modal-desig">${item.desig || ''} · Space Domain</div>
        <div class="modal-name">${item.name}</div>
      </div>
    </div>
    <div class="modal-body">
      <div class="modal-stats-row">${statsHTML}</div>
      <div class="modal-tabs">
        <div class="modal-tab active" onclick="switchTab(event,'overview-${id}')">Overview</div>
        <div class="modal-tab" onclick="switchTab(event,'details-${id}')">Details &amp; Context</div>
      </div>
      <div class="modal-tab-pane active" id="overview-${id}">
        <p class="modal-desc">${item.overview || item.tagline || ''}</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">${tagsHTML}</div>
      </div>
      <div class="modal-tab-pane" id="details-${id}">
        <p class="modal-desc">${item.overview || ''}</p>
        <div class="highlight-box" style="margin-top:16px;">
          <strong>Space Operations Officer Note:</strong> ${item.tagline || 'Critical for understanding contested space operations and resilience.'}
        </div>
      </div>
    </div>
  `;

  document.getElementById('aircraftModal').classList.add('open');
  document.body.style.overflow = 'hidden';
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

// ── OPERATIONS HELPERS ────────────────────────────────────────
function getOpMarkerColor(op) {
  if (op.status === 'concluded') return '#666666';
  const t = (op.types || []).join(' ').toLowerCase();
  const r = (op.region || '').toLowerCase();
  if (t.includes('army') || r.includes('australia')) return '#228B22'; // green for land/domestic
  if (t.includes('navy') || t.includes('patrol') || r.includes('pacific') || r.includes('asia')) return '#4A9EDB'; // blue maritime/asia
  if (t.includes('space')) return '#2EC4A0'; // teal space
  if (t.includes('ct') || t.includes('support') || r.includes('middle east') || r.includes('red sea')) return '#E05A40'; // red for ct/support/ME
  if (r.includes('europe') || r.includes('global')) return '#9B59B6'; // purple global/europe
  return '#C9A84C'; // default gold
}

function getContinent(region) {
  const r = (region || '').toLowerCase();
  if (/middle east|red sea|sinai|israel|syria|iraq|uae|persian gulf/.test(r)) return 'Middle East';
  if (/asia|korea|malaysia|indo-pacific/.test(r)) return 'Asia / Indo-Pacific';
  if (/africa|south sudan/.test(r)) return 'Africa';
  if (/europe|ukraine/.test(r)) return 'Europe';
  if (/australia/.test(r)) return 'Australia';
  if (/pacific/.test(r)) return 'Pacific / Oceania';
  if (/global|space/.test(r)) return 'Global / Other';
  return 'Other';
}

function getBaseServiceBadge(name) {
  if (!name) return '?';
  if (name.startsWith('RAAF Base')) return 'R';
  if (name.startsWith('HMAS')) return 'N';
  return 'A'; // Army or other
}

function getBaseService(name) {
  if (!name) return 'ADF';
  if (name.startsWith('RAAF Base')) return 'RAAF';
  if (name.startsWith('HMAS')) return 'RAN';
  return 'Army';
}

const continentOrder = ['Middle East', 'Asia / Indo-Pacific', 'Africa', 'Europe', 'Australia', 'Pacific / Oceania', 'Global / Other'];

const baseStateOrder = ['Queensland', 'New South Wales', 'Victoria', 'South Australia', 'Western Australia', 'Northern Territory', 'Australian Capital Territory'];

// ── OPERATIONS ────────────────────────────────────────────────
function buildOpsList() {
  const container = document.getElementById('opsList');
  if (!container) return;

  const groups = {};
  OPERATIONS.forEach(op => {
    const cont = getContinent(op.region);
    if (!groups[cont]) groups[cont] = [];
    groups[cont].push(op);
  });

  let html = '';
  continentOrder.forEach(cont => {
    const items = groups[cont];
    if (!items || items.length === 0) return;
    html += `<div class="ops-continent-header">${cont}</div>`;
    const itemsGridClass = (cont === 'Middle East') ? 'ops-items-grid me-dense' : 'ops-items-grid';
    html += `<div class="${itemsGridClass}">`;
    items.forEach(op => {
      const isConcluded = op.status === 'concluded';
      const dotColor = getOpMarkerColor(op);
      // Compact item: dot + short name + tiny status. Full details on select/panel. Region in header.
      const shortName = op.name.replace(/^Operation\s+/i, '');
      html += `
        <div class="ops-list-item" data-op="${op.id}" onclick="selectOp('${op.id}', event)">
          <span class="op-color-dot" style="background:${dotColor}"></span>
          <span class="op-name">${shortName}</span>
          <span class="op-status-sm ${isConcluded ? 'concluded' : 'active'}">${isConcluded ? 'C' : 'A'}</span>
        </div>
      `;
    });
    html += `</div>`;
  });
  container.innerHTML = html;
}

function buildBasesList() {
  const container = document.getElementById('basesList');
  if (!container) return;

  const groups = {};
  Object.keys(BASES).forEach(key => {
    const b = BASES[key];
    const state = b.location || 'Other';
    if (!groups[state]) groups[state] = [];
    groups[state].push({ id: key, base: b });
  });

  let html = '';
  baseStateOrder.forEach(state => {
    const items = groups[state];
    if (!items || items.length === 0) return;
    html += `<div class="ops-continent-header">${state}</div>`;
    html += `<div class="ops-items-grid">`;
    items.forEach(({ id, base }) => {
      const shortName = base.name.replace(/^RAAF Base /i, '').replace(/^HMAS /i, '');
      const dotColor = base.color || '#C9A84C';
      const badge = getBaseServiceBadge(base.name);
      // Reuse ops list item styling exactly for visual match. data-base + selectBase for interaction.
      html += `
        <div class="ops-list-item" data-base="${id}" onclick="selectBase('${id}', event)">
          <span class="op-color-dot" style="background:${dotColor}"></span>
          <span class="op-name">${shortName}</span>
          <span class="op-status-sm service">${badge}</span>
        </div>
      `;
    });
    html += `</div>`;
  });
  container.innerHTML = html;
}

function selectOp(id, event) {
  if (event) event.stopPropagation();

  // Clear selections on compact list and SVG dots
  document.querySelectorAll('.ops-list-item').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('.op-dot').forEach(d => d.classList.remove('selected'));

  // Highlight in compact list
  const listItem = document.querySelector(`.ops-list-item[data-op="${id}"]`);
  if (listItem) {
    listItem.classList.add('selected');
    listItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Highlight dot on offline SVG if present
  const dot = document.querySelector(`.op-dot[data-op="${id}"]`);
  if (dot) dot.classList.add('selected');

  const op = OPERATIONS.find(o => o.id === id);
  if (!op) return;

  // For Google map: pan to it and open info (if map exists)
  if (opsGoogleMap && op.lat && op.lng) {
    opsGoogleMap.panTo({ lat: op.lat, lng: op.lng });
    // optional: zoom a bit closer for detail
    if (opsGoogleMap.getZoom() < 4) opsGoogleMap.setZoom(4);
  }

  // Highlight selected marker on Google (larger, darker stroke) and reset others
  const googleDiv = document.getElementById('ops-google-map');
  if (opsGoogleMap && googleDiv && googleDiv.style.display !== 'none') {
    Object.keys(opsMarkers).forEach(k => {
      const m = opsMarkers[k];
      const isSelected = (k === id);
      const baseOp = OPERATIONS.find(o => o.id === k) || op;
      const s = isSelected ? 12 : 9;
      m.setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        scale: s,
        fillColor: getOpMarkerColor(baseOp),
        fillOpacity: 0.95,
        strokeColor: isSelected ? '#111' : '#FFFFFF',
        strokeWeight: isSelected ? 2.5 : 1.5,
        labelOrigin: new google.maps.Point(0, 0)  // superimposed / centered on the dot itself
      });
    });
  }

  // Populate the right side panel with full details (clean like bases)
  const placeholder = document.getElementById('opsPlaceholder');
  const card = document.getElementById('opsCard');
  if (placeholder) placeholder.style.display = 'none';
  if (card) {
    const isConcluded = op.status === 'concluded';
    card.innerHTML = `
      <div class="op-details-header">
        <div class="op-region">${op.region}</div>
        <div class="op-name">${op.name}</div>
        <div class="op-status ${isConcluded ? 'concluded' : 'active'}">${isConcluded ? 'Concluded' : 'Active'}</div>
      </div>
      <div class="op-details-body">
        <p class="op-desc">${op.desc}</p>
        <div class="op-section-label">Deployed Assets</div>
        <div class="op-assets">
          ${op.assets.map((a, i) => `<span class="asset-tag ${op.types && op.types[i] ? op.types[i] : ''}">${a}</span>`).join('')}
        </div>
        ${op.lat && op.lng ? `
          <div style="margin-top:16px;">
            <a href="https://www.google.com/maps/@${op.lat},${op.lng},10z/data=!3m1!1e3" target="_blank" rel="noopener noreferrer" class="google-maps-link">
              🛰️ View on Google Maps satellite →
            </a>
          </div>
        ` : ''}
      </div>
    `;
    card.classList.add('visible');
    card.style.display = 'block';
  }
}

function showLiveGoogleMapForBases() {
  const container = document.getElementById('live-bases-google');
  const iframe = document.getElementById('live-bases-iframe');
  const mapContainer = document.querySelector('#bases .map-container');
  if (!mapContainer || !container || !iframe) return;

  const localSvg = mapContainer.querySelector('svg');
  const legend = mapContainer.querySelector('.map-legend');
  const calib = mapContainer.querySelector('.map-calib-controls');

  // Center on Australia
  iframe.src = `https://www.google.com/maps/embed?ll=-25.2744,133.7751&z=4&t=k&hl=en&gl=AU&mapclient=embed`;

  if (localSvg) localSvg.style.display = 'none';
  if (legend) legend.style.display = 'none';
  if (calib) calib.style.display = 'none';

  container.style.display = 'block';
}

function hideLiveGoogleMapForBases() {
  const container = document.getElementById('live-bases-google');
  const iframe = document.getElementById('live-bases-iframe');
  const mapContainer = document.querySelector('#bases .map-container');
  if (!mapContainer || !container || !iframe) return;

  const localSvg = mapContainer.querySelector('svg');
  const legend = mapContainer.querySelector('.map-legend');
  const calib = mapContainer.querySelector('.map-calib-controls');

  iframe.src = '';
  container.style.display = 'none';

  if (localSvg) localSvg.style.display = '';
  if (legend) legend.style.display = '';
  if (calib) calib.style.display = '';
}

// === GOOGLE MAPS ONLINE MODE (default) with custom markers ===
// Requires valid API key in index.html. Falls back gracefully if not available.
let opsGoogleMap = null;
let basesGoogleMap = null;
let opsMarkers = {}; // for selected highlighting on Google view
let basesMarkers = {}; // for selected highlighting on Google view (bases)

// Dynamic position layer markers (ADF aircraft, ships, adversary)
let adfAircraftMarkers = [];
let adfShipMarkers = [];
let adversaryMarkers = [];

function initGoogleMaps() {
  if (typeof google === 'undefined' || !google.maps) {
    console.warn('[ADF Forge] Google Maps API not loaded (missing or invalid key). Using offline maps only.');
    // Show offline by default if no Google
    switchToOfflineOpsMap();
    switchToOfflineBasesMap();
    return;
  }
  if (opsGoogleMap || basesGoogleMap) {
    // Already initialized (e.g. late retry or double call)
    return;
  }

  // Operations World Map (satellite, low zoom for whole world)
  const opsEl = document.getElementById('ops-google-map');
  if (opsEl) {
    opsGoogleMap = new google.maps.Map(opsEl, {
      center: { lat: 10, lng: 20 }, // Good center for world view
      zoom: 2,
      mapTypeId: 'satellite',
      gestureHandling: 'greedy', // direct scroll wheel zoom, no need for cmd/ctrl modifier
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true
    });

    updatePositionLayerControls();

    // Add markers for all operations
    if (typeof OPERATIONS !== 'undefined' && Array.isArray(OPERATIONS)) {
      OPERATIONS.forEach(op => {
        if (!op.lat || !op.lng) return;
        const fillColor = getOpMarkerColor(op);
        const displayName = op.name.replace(/^Operation\s+/i, '');
        const shortLabel = displayName.length > 10 ? displayName.substring(0, 9) + '…' : displayName;
        const s = 9;
        const marker = new google.maps.Marker({
          position: { lat: op.lat, lng: op.lng },
          map: opsGoogleMap,
          title: `${op.name} — ${op.region}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: s,
            fillColor: fillColor,
            fillOpacity: 0.95,
            strokeColor: '#FFFFFF',
            strokeWeight: 1.5,
            labelOrigin: new google.maps.Point(0, 0)  // superimposed / centered on the dot itself
          },
          label: {
            text: shortLabel,
            color: '#FFFFFF',
            fontSize: '18px',  // 100% larger for clarity
            fontWeight: '600',
            className: 'op-map-label'
          }
        });
        opsMarkers[op.id] = marker;
        marker.addListener('click', () => {
          selectOp(op.id);
        });
      });
    }
  }

  // Bases Australia Map (satellite, focused on Australia)
  const basesEl = document.getElementById('bases-google-map');
  if (basesEl) {
    basesGoogleMap = new google.maps.Map(basesEl, {
      center: { lat: -25.2744, lng: 133.7751 },
      zoom: 3.5, // zoomed out a bit so the whole of Australia + surrounding ocean remains visible in the 50% width map column
      mapTypeId: 'satellite',
      gestureHandling: 'greedy', // direct scroll wheel zoom, no need for cmd/ctrl modifier
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true
    });

    // Add markers for all bases that have coords (same style as ops: colored circle with name superimposed on the dot)
    if (typeof BASES !== 'undefined') {
      Object.keys(BASES).forEach(key => {
        const b = BASES[key];
        if (!b.lat || !b.lng) return;
        const s = 9;
        const shortName = b.name.replace('RAAF Base ', '').replace('HMAS ', '');
        const displayName = shortName.length > 10 ? shortName.substring(0, 9) + '…' : shortName;
        const marker = new google.maps.Marker({
          position: { lat: b.lat, lng: b.lng },
          map: basesGoogleMap,
          title: b.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: s,
            fillColor: b.color || '#C9A84C',
            fillOpacity: 0.95,
            strokeColor: '#FFFFFF',
            strokeWeight: 1.5,
            labelOrigin: new google.maps.Point(0, 0)  // superimposed / centered on the dot itself
          },
          label: {
            text: displayName,
            color: '#FFFFFF',
            fontSize: '18px',  // same large size as ops
            fontWeight: '600',
            className: 'op-map-label'
          }
        });
        basesMarkers[key] = marker;
        marker.addListener('click', () => {
          // Select the base in the local UI (same as ops style, no extra popup)
          if (typeof selectBase === 'function') selectBase(key);
        });
      });
    }
  }

  // Default to online maps (Google)
  // The HTML has google visible, offline hidden
  console.log('[ADF Forge] Google Maps online mode initialized with all points.');

  // Force default to online views now that API is ready
  switchToOnlineOpsMap();
  switchToOnlineBasesMap();

  // After Google has had time to render (or fail with key/referrer error), detect the common
  // "Oops! Something went wrong" UI that Google injects into the map div on auth problems.
  // If detected, auto-switch that map to the reliable offline SVG version so the site remains usable.
  setTimeout(() => {
    const hasErrorUI = (el) => {
      if (!el) return false;
      if (el.querySelector && el.querySelector('.gm-err-container')) return true;
      const txt = (el.textContent || '').toLowerCase();
      return txt.includes('oops! something went wrong') || txt.includes('google maps') && txt.includes('wrong');
    };

    const opsEl = document.getElementById('ops-google-map');
    if (hasErrorUI(opsEl)) {
      console.warn('[ADF Forge] Detected Google Maps error UI (likely invalid/restricted API key or missing referrer). Auto-falling back to offline map for ops.');
      switchToOfflineOpsMap();
    }

    const basesEl = document.getElementById('bases-google-map');
    if (hasErrorUI(basesEl)) {
      console.warn('[ADF Forge] Detected Google Maps error UI (likely invalid/restricted API key or missing referrer). Auto-falling back to offline map for bases.');
      switchToOfflineBasesMap();
    }
  }, 2200);
}

// Toggle functions for ops
function switchToOnlineOpsMap() {
  const googleDiv = document.getElementById('ops-google-map');
  const offlineDiv = document.getElementById('ops-offline-map');
  if (typeof google === 'undefined' || !google.maps) {
    console.warn('[ADF Forge] Google object not available; falling back to offline map.');
    switchToOfflineOpsMap();
    return;
  }
  if (googleDiv) googleDiv.style.display = 'block';
  if (offlineDiv) offlineDiv.style.display = 'none';
  if (opsGoogleMap) {
    setTimeout(() => google.maps.event.trigger(opsGoogleMap, 'resize'), 100);
  } else {
    // API may have become ready after initial attempts; try now
    setTimeout(ensureGoogleMapsInit, 50);
  }
  updatePositionLayerControls();
}

function switchToOfflineOpsMap() {
  const googleDiv = document.getElementById('ops-google-map');
  const offlineDiv = document.getElementById('ops-offline-map');
  if (googleDiv) googleDiv.style.display = 'none';
  if (offlineDiv) offlineDiv.style.display = 'block';

  // Hide live position controls when on offline map
  const ctrls = document.getElementById('ops-position-layers');
  if (ctrls) ctrls.style.display = 'none';

  // Clear any active dynamic markers
  clearMarkers(adfAircraftMarkers);
  clearMarkers(adfShipMarkers);
  clearMarkers(adversaryMarkers);
}

// Toggle for bases (Australia map)
function switchToOnlineBasesMap() {
  const googleDiv = document.getElementById('bases-google-map');
  const mapContainer = document.querySelector('#bases .map-container');
  if (!mapContainer) return;
  if (typeof google === 'undefined' || !google.maps) {
    console.warn('[ADF Forge] Google object not available; falling back to offline map.');
    switchToOfflineBasesMap();
    return;
  }
  const localSvg = mapContainer.querySelector('svg');
  const legend = mapContainer.querySelector('.map-legend');
  const calib = mapContainer.querySelector('.map-calib-controls');
  if (googleDiv) googleDiv.style.display = 'block';
  if (localSvg) localSvg.style.display = 'none';
  if (legend) legend.style.display = 'none';
  if (calib) calib.style.display = 'none';
  if (basesGoogleMap) {
    setTimeout(() => google.maps.event.trigger(basesGoogleMap, 'resize'), 100);
  } else {
    setTimeout(ensureGoogleMapsInit, 50);
  }
}

function switchToOfflineBasesMap() {
  const googleDiv = document.getElementById('bases-google-map');
  const mapContainer = document.querySelector('#bases .map-container');
  if (!mapContainer) return;
  const localSvg = mapContainer.querySelector('svg');
  const legend = mapContainer.querySelector('.map-legend');
  const calib = mapContainer.querySelector('.map-calib-controls');
  if (googleDiv) googleDiv.style.display = 'none';
  if (localSvg) localSvg.style.display = '';
  if (legend) legend.style.display = '';
  if (calib) calib.style.display = '';
}

// Make sure on load we are in online mode for the maps (Google default)
document.addEventListener('DOMContentLoaded', () => {
  // Default to online if Google is available
  setTimeout(() => {
    const opsGoogle = document.getElementById('ops-google-map');
    const opsOffline = document.getElementById('ops-offline-map');
    if (opsGoogle && typeof google !== 'undefined' && google.maps) {
      if (opsOffline) opsOffline.style.display = 'none';
      opsGoogle.style.display = 'block';
      updatePositionLayerControls();
    } else if (opsOffline) {
      opsOffline.style.display = 'block';
    }

    // Same for bases
    const basesGoogle = document.getElementById('bases-google-map');
    const basesMapContainer = document.querySelector('#bases .map-container');
    if (basesGoogle && typeof google !== 'undefined' && google.maps && basesMapContainer) {
      basesGoogle.style.display = 'block';
      const svg = basesMapContainer.querySelector('svg');
      const legend = basesMapContainer.querySelector('.map-legend');
      const calib = basesMapContainer.querySelector('.map-calib-controls');
      if (svg) svg.style.display = 'none';
      if (legend) legend.style.display = 'none';
      if (calib) calib.style.display = 'none';
    }

    // Drive the real map creation + markers (callback-free, race-safe)
    if (typeof initGoogleMaps === 'function') {
      try { initGoogleMaps(); } catch (e) { console.warn('[ADF Forge] Late Google init failed:', e); }
    }
  }, 1200); // Wait for Google script
});

// Safe driver: call this to init Google maps if/when the async API becomes available.
// Called from our init, from section show, and from the DOMContentLoaded above.
function ensureGoogleMapsInit() {
  if (typeof google !== 'undefined' && google.maps && typeof initGoogleMaps === 'function') {
    try {
      initGoogleMaps();
    } catch (e) {
      console.warn('[ADF Forge] ensureGoogleMapsInit error:', e);
    }
  }
}

function showLiveGoogleMapForOps(centerLat, centerLng) {
  const container = document.getElementById('live-ops-google');
  const iframe = document.getElementById('live-ops-iframe');
  const mapWrap = document.querySelector('#operations .world-map-wrap');
  if (!mapWrap) return;

  const localSvg = mapWrap.querySelector('svg');
  const notes = mapWrap.querySelectorAll('div[style*="padding"]');

  // Default to broad Indo-Pacific view if no specific
  const lat = centerLat || -10;
  const lng = centerLng || 130;
  const z = centerLat ? 8 : 3;

  // Use simple embed URL that supports satellite (t=k in some variants, but embed view works)
  iframe.src = `https://www.google.com/maps/embed?ll=${lat},${lng}&z=${z}&t=k&hl=en&gl=AU&mapclient=embed`;

  if (localSvg) localSvg.style.display = 'none';
  notes.forEach(n => n.style.display = 'none');

  container.style.display = 'block';
}

function hideLiveGoogleMapForOps() {
  const container = document.getElementById('live-ops-google');
  const iframe = document.getElementById('live-ops-iframe');
  const mapWrap = document.querySelector('#operations .world-map-wrap');
  if (!mapWrap) return;

  const localSvg = mapWrap.querySelector('svg');
  const notes = mapWrap.querySelectorAll('div[style*="padding"]');

  iframe.src = '';
  container.style.display = 'none';

  if (localSvg) localSvg.style.display = '';
  notes.forEach(n => n.style.display = '');
}

// Optional: when selecting an op, if it has coords, you can auto-offer, but for now manual button + card link is good.
// To enhance, we can call showLive... from selectOp if wanted, but keep separate for user control.

// ── PUBLIC POSITION LAYERS (ADF aircraft/ships + adversary OSINT on ops map) ─────────────
function clearMarkers(markersArray) {
  if (!markersArray) return;
  markersArray.forEach(m => { if (m) m.setMap(null); });
  markersArray.length = 0;
}

function showPositionControls(show) {
  const ctrls = document.getElementById('ops-position-layers');
  if (ctrls) ctrls.style.display = show ? 'block' : 'none';
}

function findMatchingNavy(shipName) {
  if (!shipName) return null;
  const navy = window.NAVY || [];
  const n = shipName.toLowerCase();
  return navy.find(entry => {
    const en = (entry.name || '').toLowerCase();
    const eid = (entry.id || '').toLowerCase();
    const des = (entry.desig || '').toLowerCase();
    if (n.includes('brisbane') || n.includes('sydney') || n.includes('hobart')) {
      return eid === 'hobart' || en.includes('hobart');
    }
    if (n.includes('perth') || n.includes('anzac')) {
      return en.includes('anzac') || eid.includes('anzac');
    }
    if (n.includes('supply')) return en.includes('supply') || eid.includes('supply');
    if (n.includes('choules')) return en.includes('choules') || eid.includes('choules');
    return en.includes(n.split(' ').pop()) || des && n.includes(des);
  });
}

function showPositionDetails(item) {
  const info = document.getElementById('position-info');
  const titleEl = document.getElementById('position-info-title');
  const body = document.getElementById('position-info-body');
  if (!info || !titleEl || !body) return;

  titleEl.textContent = item.name || 'Position';

  let html = '';
  if (item.description) html += `<div style="margin-bottom:6px;">${item.description}</div>`;

  if (item.type === 'ship' || (item.name && item.name.toLowerCase().includes('hmas'))) {
    const match = findMatchingNavy(item.name || '');
    if (match) {
      html += `<div style="background:var(--surface); padding:6px; border-radius:4px; margin:4px 0;">`;
      html += `<strong>${match.desig || ''} ${match.name}</strong>`;
      if (match.typeName) html += ` — ${match.typeName}`;
      html += `<br>`;
      if (match.stats && match.stats.length) {
        html += match.stats.slice(0, 3).map(s => `${s.k}: ${s.v}`).join(' • ') + '<br>';
      }
      const short = (match.tagline || match.overview || '').substring(0, 220);
      html += short + (short.length >= 220 ? '...' : '');
      html += `</div>`;
      html += `<small>Unique ID in DB: <code>${match.id}</code></small>`;
    } else {
      html += `<div style="opacity:0.85;">No exact match in our detailed NAVY database, but representative of current RAN surface fleet.</div>`;
    }
  } else if (item.callsign) {
    // aircraft from live data
    html += `<div>Callsign: <strong>${item.callsign}</strong><br>`;
    if (item.country) html += `Origin: ${item.country}<br>`;
    html += `Source: Public ADS-B (OpenSky)</div>`;
  } else if (item.side) {
    html += `<div style="color:#ffaaaa;">Illustrative OSINT position — not real-time tracking.</div>`;
  }

  body.innerHTML = html;
  info.style.display = 'block';
}

async function toggleAdfAircraftLayer(enabled) {
  clearMarkers(adfAircraftMarkers);

  const cb = document.getElementById('layer-adf-aircraft');
  const layersDiv = document.getElementById('ops-position-layers');

  if (!enabled || !opsGoogleMap) {
    if (cb) cb.checked = false;
    return;
  }

  if (layersDiv) layersDiv.style.opacity = '0.7';

  // Always seed a few demo ADF aircraft so the layer is useful (real military combat jets rarely broadcast publicly)
  const demoAdf = [
    { lat: -12.4, lng: 130.9, callsign: 'RAAF P8-01', country: 'Australia' },
    { lat: -25.0, lng: 135.0, callsign: 'RAAF C27-02', country: 'Australia' },
    { lat: -20.5, lng: 148.0, callsign: 'RAAF C130-05', country: 'Australia' }
  ];
  demoAdf.forEach(d => {
    const shortLabel = d.callsign.length > 12 ? d.callsign.substring(0,10) + '…' : d.callsign;
    const m = new google.maps.Marker({
      position: { lat: d.lat, lng: d.lng },
      map: opsGoogleMap,
      title: `${d.callsign} (demo / public pattern)`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: '#3498db',
        fillOpacity: 0.9,
        strokeColor: '#1a5276',
        strokeWeight: 1.5
      },
      label: {
        text: shortLabel,
        color: '#FFEB3B',
        fontSize: '14px',
        fontWeight: 'bold'
      }
    });
    google.maps.event.addListener(m, 'click', () => showPositionDetails({ name: d.callsign, callsign: d.callsign, country: d.country }));
    adfAircraftMarkers.push(m);
  });

  try {
    const url = 'https://opensky-network.org/api/states/all?lamin=-48&lomin=90&lamax=8&lomax=175';
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('OpenSky ' + res.status);

    const data = await res.json();
    const states = data.states || [];
    let added = 0;

    states.forEach(state => {
      const lon = state[5];
      const lat = state[6];
      if (lon == null || lat == null) return;
      if (added > 30) return;

      const callsign = (state[1] || '').trim();
      const country = state[2] || 'Unknown';
      const last = state[4] || 0;
      if (last && (Date.now()/1000 - last > 900)) return; // 15 min stale

      const shortLabel = callsign.length > 12 ? callsign.substring(0,10) + '…' : callsign;
      const m = new google.maps.Marker({
        position: { lat, lng: lon },
        map: opsGoogleMap,
        title: `${callsign || '???'} — ${country} (public ADS-B)`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 5.5,
          fillColor: '#5dade2',
          fillOpacity: 0.85,
          strokeColor: '#1a5276',
          strokeWeight: 1
        },
        label: {
          text: shortLabel || '✈',
          color: '#FFEB3B',
          fontSize: '13px',
          fontWeight: 'bold'
        }
      });
      google.maps.event.addListener(m, 'click', () => {
        showPositionDetails({ name: callsign || 'Aircraft', callsign, country });
      });
      adfAircraftMarkers.push(m);
      added++;
    });

    if (layersDiv) {
      layersDiv.style.opacity = '1';
    }
    console.log(`[Positions] ADF aircraft: ${added} live + 3 demo`);
  } catch (e) {
    console.warn('[Positions] OpenSky aircraft fetch issue (common due to rate limits / CORS / military not broadcasting):', e);
    if (layersDiv) layersDiv.style.opacity = '1';
    // demos are already shown — no scary alert
  }
}

function toggleAdfShipLayer(enabled) {
  clearMarkers(adfShipMarkers);

  if (!enabled || !opsGoogleMap) return;

  const ships = (window.ADF_SHIPS_LAST_KNOWN || []);
  ships.forEach(ship => {
    const short = ship.name.replace('HMAS ', '').replace(' (', ' ').split(')')[0];
    const marker = new google.maps.Marker({
      position: { lat: ship.lat, lng: ship.lng },
      map: opsGoogleMap,
      title: ship.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 6.5,
        fillColor: '#1E90FF',
        fillOpacity: 0.9,
        strokeColor: '#0A3D62',
        strokeWeight: 1.5
      },
      label: {
        text: short.length > 14 ? short.substring(0,12)+'…' : short,
        color: '#FFEB3B',
        fontSize: '14px',
        fontWeight: 'bold'
      }
    });
    google.maps.event.addListener(marker, 'click', () => showPositionDetails(ship));
    adfShipMarkers.push(marker);
  });
}

function toggleAdversaryLayer(enabled) {
  clearMarkers(adversaryMarkers);

  if (!enabled || !opsGoogleMap) return;

  const adv = (window.ADVERSARY_OSINT || []);
  adv.forEach(item => {
    const color = item.color || '#C0392B';
    const short = item.name.length > 18 ? item.name.substring(0,16)+'…' : item.name;
    const marker = new google.maps.Marker({
      position: { lat: item.lat, lng: item.lng },
      map: opsGoogleMap,
      title: item.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 6.5,
        fillColor: color,
        fillOpacity: 0.9,
        strokeColor: '#222',
        strokeWeight: 1
      },
      label: {
        text: short,
        color: '#FFEB3B',
        fontSize: '13px',
        fontWeight: 'bold'
      }
    });
    google.maps.event.addListener(marker, 'click', () => showPositionDetails(item));
    adversaryMarkers.push(marker);
  });
}

function refreshPositionLayers() {
  const aircraftCb = document.getElementById('layer-adf-aircraft');
  const shipsCb = document.getElementById('layer-adf-ships');
  const advCb = document.getElementById('layer-adversary');

  if (aircraftCb && aircraftCb.checked) {
    toggleAdfAircraftLayer(false);
    setTimeout(() => toggleAdfAircraftLayer(true), 120);
  }
  if (shipsCb && shipsCb.checked) {
    toggleAdfShipLayer(false);
    setTimeout(() => toggleAdfShipLayer(true), 60);
  }
  if (advCb && advCb.checked) {
    toggleAdversaryLayer(false);
    setTimeout(() => toggleAdversaryLayer(true), 60);
  }
}

function updatePositionLayerControls() {
  const ctrls = document.getElementById('ops-position-layers');
  if (!ctrls) return;
  const googleDiv = document.getElementById('ops-google-map');
  ctrls.style.display = (googleDiv && googleDiv.style.display !== 'none' && opsGoogleMap) ? 'block' : 'none';
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
      // Aircraft card clicked
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
      // Weapon/System card clicked
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
      // Fleet card clicked
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
      // Army vehicle card clicked
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
// Wrap grid builders so a bad data shape / missing field in one area never prevents
// the main nav links and home feature cards from becoming clickable.
try { buildAircraftGrid(); } catch (e) { console.error('[ADF Forge] buildAircraftGrid failed:', e); }
try { buildOpsList(); } catch (e) { console.error('[ADF Forge] buildOpsList failed:', e); }
try { buildBasesList(); } catch (e) { console.error('[ADF Forge] buildBasesList failed:', e); }
try { buildGlossary(); } catch (e) { console.error('[ADF Forge] buildGlossary failed:', e); }
try { buildWeaponsGrid(); } catch (e) { console.error('[ADF Forge] buildWeaponsGrid failed:', e); }
try { buildVehiclesGrid(); } catch (e) { console.error('[ADF Forge] buildVehiclesGrid failed:', e); }
try { buildNavyGrid(); } catch (e) { console.error('[ADF Forge] buildNavyGrid failed:', e); }
try { buildSpaceGrid(); } catch (e) { console.error('[ADF Forge] buildSpaceGrid failed:', e); }
try { updateHeroStats(); } catch (e) { console.error('[ADF Forge] updateHeroStats failed:', e); }
try { initCalibToggle(); } catch (e) { console.error('[ADF Forge] initCalibToggle failed:', e); }
try { initStudyTools(); } catch (e) { console.error('[ADF Forge] initStudyTools failed:', e); }
try { initThemeSwitcher(); } catch (e) { console.error('[ADF Forge] initThemeSwitcher failed:', e); }

initMainNavigation();
initCardClickHandlers();

// ============================================
// TEXT READER / LISTEN FEATURE (cleaned)
// Web Speech API — chunked for progress/seeking, good voice defaults on macOS
// Persists voice + rate. Basic keyboard support when panel is open.
// ============================================

let readerVoices = [];
let readerRate = 0.85;  // Tara at 0.85x sounds the most natural (user preference)
let currentUtterance = null;
let isSpeaking = false;
let isPaused = false;
let stopRequested = false;
let readerReadingSession = 0;

// Progress state (sentence chunks for seeking)
let currentTextChunks = [];
let currentChunkIndex = 0;
let fullReadableText = '';

// Per-section start anchors for consistent "main content" beginning
const sectionStartConfig = {
  'cyberspace': 'Current Cyber Threat Landscape',
  'national-defence': 'Clarifying the Documents',
  'space': 'Key Concepts Every Space Operations Officer',
  'bases': 'ADF Bases',
  'operations': 'ADF Operations',
  'navy': 'Royal Australian Navy',
  'aircraft': 'Royal Australian Air Force',
  'army': 'Australian Army',
  'weapons': 'Weapons & Systems',
  'leadership': 'ADF Leadership'
};

function loadReaderPreferences() {
  try {
    const savedVoice = localStorage.getItem('readerLastVoice');
    const savedRate = parseFloat(localStorage.getItem('readerRate'));
    if (!isNaN(savedRate) && savedRate >= 0.5 && savedRate <= 2) {
      readerRate = savedRate;
    } else {
      readerRate = 0.85;  // default to Tara's sweet spot
    }
    return { savedVoice, savedRate: readerRate };
  } catch (e) {
    readerRate = 0.85;
    return { savedVoice: null, savedRate: 0.85 };
  }
}

function saveReaderRate(rate) {
  readerRate = rate;
  try { localStorage.setItem('readerRate', String(rate)); } catch (e) {}
}

// --- Audio Loop Voice persistence ---
function loadAudioLoopVoice() {
  try {
    audioLoopVoiceName = localStorage.getItem('audioLoopVoiceName') || null;
  } catch (e) {
    audioLoopVoiceName = null;
  }
  return audioLoopVoiceName;
}

function saveAudioLoopVoice(name) {
  audioLoopVoiceName = name || null;
  try {
    if (name) {
      localStorage.setItem('audioLoopVoiceName', name);
    } else {
      localStorage.removeItem('audioLoopVoiceName');
    }
  } catch (e) {}
}

// Cleaned voice loader — user gesture (opening panel) + onvoiceschanged is usually enough
function forceLoadVoices(callback) {
  ensureVoicesListener(); // attach early, especially important for Firefox

  let attempts = 0;
  const maxAttempts = 7;
  function tryLoad() {
    attempts++;
    try {
      const fresh = window.speechSynthesis.getVoices() || [];
      if (fresh.length > 0) {
        readerVoices = fresh;
      }
      populateVoiceSelect();
      populateAudioVoiceSelect(); // also keep the audio loop picker in sync
    } catch (e) {}
    if ((readerVoices && readerVoices.length > 0) || attempts >= maxAttempts) {
      audioLoopVoicesLoaded = true;
      if (typeof callback === 'function') callback();
      return;
    }
    setTimeout(tryLoad, 180);
  }
  tryLoad();
}

// Get a fresh list of voices (handles async nature of the Web Speech API)
function getFreshVoices() {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return readerVoices || [];
    const v = synth.getVoices() || [];
    if (v.length > 0) {
      readerVoices = v;
      return v;
    }
    // If the live call gave nothing, but we previously had some, keep the previous list
    // (prevents the dropdown from going blank after a slow load)
    return readerVoices && readerVoices.length > 0 ? readerVoices : v;
  } catch (e) {
    return readerVoices || [];
  }
}

function initTextReader() {
  const panel = document.getElementById('reader-panel');
  if (!panel) return;
  panel.style.display = 'none';

  ensureVoicesListener(); // help Firefox get voices for the shared readerVoices list

  const playBtn = document.getElementById('reader-play-btn');
  const pauseBtn = document.getElementById('reader-pause-btn');
  const speedInput = document.getElementById('reader-speed');
  const speedVal = document.getElementById('reader-speed-val');

  if (playBtn) playBtn.onclick = playOrResumeCurrentSection;
  if (pauseBtn) pauseBtn.onclick = pauseSpeech;
  // stopSpeech and seekToProgress are wired via inline onclick in HTML

  // Test button removed — Tara is now the fixed high-quality voice

  // Load saved preferences and reflect in UI
  const prefs = loadReaderPreferences();
  readerRate = prefs.savedRate;
  if (speedInput) speedInput.value = String(readerRate);
  if (speedVal) speedVal.textContent = readerRate.toFixed(2) + '×';

  // Sync badge on init — Karen is now the preferred default voice site-wide
  const badge = document.querySelector('.reader-voice-badge');
  if (badge) badge.textContent = `Karen • ${readerRate.toFixed(2)}×`;

  window.speechSynthesis.onvoiceschanged = () => {
    populateVoiceSelect();
    populateAudioVoiceSelect();
  };

  // One reliable kick (user gesture from opening the panel helps some browsers surface voices)
  setTimeout(populateVoiceSelect, 80);
}

function populateVoiceSelect() {
  // Ensures the internal readerVoices list is populated for both reader and audio loops.
  const voices = window.speechSynthesis ? (window.speechSynthesis.getVoices() || []) : [];
  if (voices.length > 0) {
    readerVoices = voices;
  }

  // Keep speed display in sync for the floating reader
  const speedInput = document.getElementById('reader-speed');
  const speedVal = document.getElementById('reader-speed-val');
  if (speedInput) speedInput.value = String(readerRate);
  if (speedVal) speedVal.textContent = readerRate.toFixed(2) + '×';

  // Also refresh the audio loop voice picker if it exists on the page
  if (document.getElementById('audio-voice-select')) {
    populateAudioVoiceSelect();
  }
}

function getBestVoiceFromSelect() {
  // Smart picker used by the floating reader AND as fallback for audio loops.
  // Prefers Karen (premium AU voice) as the new site-wide default, then other high-quality natural voices.
  // Works across Safari, Firefox, and Chrome.
  const voices = getFreshVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Karen (premium) — user's requested default for the whole site
  let v = voices.find(v => /karen/i.test(v.name));
  if (v) return v;

  // 2. Tara (still excellent, previous favourite)
  v = voices.find(v => /tara/i.test(v.name));
  if (v) return v;

  // 3. Other strong natural Australian / Apple voices
  v = voices.find(v => /samantha|siri/i.test(v.name));
  if (v) return v;

  v = voices.find(v => /karen/i.test(v.name) && /en-au/i.test(v.lang || '')); // extra Karen check with lang
  if (v) return v;

  // 4. Other pleasant English voices that often sound good
  v = voices.find(v => {
    const n = v.name.toLowerCase();
    const lang = (v.lang || '').toLowerCase();
    return (n.includes('tessa') || n.includes('matilda') || n.includes('serena') || n.includes('fiona')) ||
           (lang.includes('en-au') && /female|woman|girl/i.test(n));
  });
  if (v) return v;

  // 5. Broader fallback — any clearly English voice
  v = voices.find(v => (v.lang || '').toLowerCase().startsWith('en'));
  if (v) return v;

  return voices[0] || null;
}

// --- Audio Loop dedicated voice handling ---

function getAudioLoopVoice() {
  const voices = getFreshVoices();
  if (!voices || voices.length === 0) return null;

  // If the user picked a specific voice by name, try to find it exactly.
  if (audioLoopVoiceName) {
    let exact = voices.find(v => v.name === audioLoopVoiceName);
    if (exact) return exact;

    // Try a fuzzy match (some browsers slightly rename voices between loads)
    exact = voices.find(v => v.name.toLowerCase().includes(audioLoopVoiceName.toLowerCase().slice(0, 8)));
    if (exact) return exact;
  }

  // Auto / "Best available" — use the same smart logic as the reader (Tara first, etc.)
  // This gives excellent results on Safari/Firefox on macOS and reasonable fallbacks elsewhere.
  return getBestVoiceFromSelect() || voices[0] || null;
}

function populateAudioVoiceSelect() {
  const select = document.getElementById('audio-voice-select');
  if (!select) return;

  ensureVoicesListener(); // Firefox often needs the listener re-attached on interaction

  // Always ask the browser fresh (helps some timing issues)
  try {
    const live = window.speechSynthesis ? (window.speechSynthesis.getVoices() || []) : [];
    if (live.length > 0) readerVoices = live;
  } catch (e) {}

  const voices = getFreshVoices();
  const previousValue = select.value || audioLoopVoiceName;

  // Clear and rebuild
  select.innerHTML = '';

  // Option 0: Auto best (recommended) — now defaults to Karen (premium) site-wide
  const autoOpt = document.createElement('option');
  autoOpt.value = '';
  autoOpt.textContent = '★ Best available (Karen preferred)';
  select.appendChild(autoOpt);

  if (!voices || voices.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '(click ↻ or ▶ Start loop to load voices — browser dependent)';
    select.appendChild(opt);
    // Proactively try to wake voices in the background
    if (window.speechSynthesis) {
      setTimeout(() => { try { window.speechSynthesis.getVoices(); } catch (e) {} }, 50);
    }
    updateAudioVoiceHint();
    return;
  }

  // Add all English voices (and a few others) with nice labels
  const seen = new Set();
  voices.forEach(v => {
    const lang = (v.lang || 'unknown').toUpperCase();
    const name = v.name || 'Unknown voice';

    // Prefer English voices, but show others too so the user has full choice
    const key = name + '|' + lang;
    if (seen.has(key)) return;
    seen.add(key);

    const opt = document.createElement('option');
    opt.value = name;

    let label = name;
    if (lang && lang !== 'UNKNOWN') {
      label += ` (${lang})`;
    }
    // Mark the really good ones — Karen is now the site-wide premium default
    if (/karen/i.test(name)) label += ' ★ premium';
    else if (/tara/i.test(name)) label += ' ★ best';
    else if (/samantha/i.test(name)) label += ' ★ natural';

    opt.textContent = label;
    select.appendChild(opt);
  });

  // Restore previous selection
  if (previousValue) {
    // exact match
    let found = Array.from(select.options).find(o => o.value === previousValue);
    if (!found && previousValue) {
      // try partial
      found = Array.from(select.options).find(o => o.value.toLowerCase().includes(previousValue.toLowerCase().slice(0, 6)));
    }
    if (found) {
      select.value = found.value;
    } else {
      select.value = ''; // fall back to auto
    }
  } else {
    select.value = ''; // default to auto/best
  }

  // Update a small hint
  updateAudioVoiceHint();
}

function updateAudioVoiceHint() {
  const hint = document.getElementById('audio-voice-hint');
  if (!hint) return;

  const select = document.getElementById('audio-voice-select');
  if (!select) return;

  const chosen = select.value;
  const voices = getFreshVoices();

  if (voices.length > 0) {
    if (!chosen) {
      hint.textContent = `auto • ${voices.length} voices available`;
    } else {
      hint.textContent = 'user choice';
    }
  } else {
    hint.textContent = 'click ↻ or start loop to load voices';
  }
}

function setAudioLoopVoice(name) {
  saveAudioLoopVoice(name || null);

  const select = document.getElementById('audio-voice-select');
  if (select) {
    // make sure the UI reflects it (in case called programmatically)
    if (name) {
      const opt = Array.from(select.options).find(o => o.value === name);
      if (opt) select.value = name;
      else select.value = '';
    } else {
      select.value = '';
    }
  }

  updateAudioVoiceHint();

  // If a loop is currently speaking, the new voice will be used on the next item.
  // We could also restart the current utterance, but that can be jarring — we keep it simple.
  if (audioLoopActive && !audioLoopPaused) {
    const info = document.getElementById('audio-loop-info');
    if (info) {
      const old = info.textContent;
      info.textContent = 'Voice updated — will apply to the next item';
      setTimeout(() => {
        if (info && info.textContent.includes('Voice updated')) {
          info.textContent = old || `Listening item ${audioLoopCurrentIndex + 1} of ${audioLoopItems.length}`;
        }
      }, 1400);
    }
  }
}

function refreshAudioVoices() {
  const select = document.getElementById('audio-voice-select');
  const hint = document.getElementById('audio-voice-hint');
  if (select) select.disabled = true;
  if (hint) hint.textContent = 'refreshing...';

  const synth = window.speechSynthesis;
  if (!synth) {
    if (select) select.disabled = false;
    if (hint) hint.textContent = 'speech not supported';
    return;
  }

  // Make sure the voiceschanged listener is attached (important for Firefox)
  ensureVoicesListener();

  // Force enumeration + multiple "warmup" speaks (this is the most reliable cross-browser way
  // to get the full voice list on Chrome/Firefox/Safari — the list often only appears after
  // at least one speak() call has been made).
  let phase = 0;
  const maxPhases = 5;  // one extra phase for Firefox stubbornness

  function doWarmupAndPopulate() {
    phase++;
    try {
      synth.getVoices(); // poke it
    } catch (e) {}

    try {
      // Use a short real-ish string at near-zero volume. Some browsers ignore completely silent ones.
      // Set lang to help Firefox/Safari pick good synthesizers.
      const u = new SpeechSynthesisUtterance('a');
      u.volume = 0.001;
      u.rate = 1.0;
      u.lang = 'en-AU';
      synth.speak(u);

      // Give it a moment to enumerate, then cancel and read the list
      // Slightly longer delay on later phases helps Firefox surface the list.
      const cancelDelay = 260 + (phase * 40);
      setTimeout(() => {
        try { synth.cancel(); } catch (e) {}

        // Now grab whatever the browser is willing to report
        const fresh = synth.getVoices() || [];
        if (fresh.length > 0) {
          readerVoices = fresh;
        }

        populateAudioVoiceSelect();

        const current = getFreshVoices();
        if (hint) {
          if (current.length > 0) {
            hint.textContent = `loaded ${current.length} voices`;
            setTimeout(() => { if (hint) updateAudioVoiceHint(); }, 1600);
          } else {
            hint.textContent = 'still no voices — try starting the loop';
          }
        }

        if (phase >= maxPhases) {
          if (select) select.disabled = false;
          console.log('[AudioLoop] refresh finished — visible voices:', current.length);
          return;
        }

        // Next phase with a bit more delay (helps Firefox)
        setTimeout(doWarmupAndPopulate, 320);
      }, cancelDelay);
    } catch (e) {
      if (phase >= maxPhases) {
        if (select) select.disabled = false;
      } else {
        setTimeout(doWarmupAndPopulate, 300);
      }
    }
  }

  // Kick off the sequence
  setTimeout(doWarmupAndPopulate, 30);
}

// Ensure the voiceschanged listener is attached (Firefox is pickier about this timing)
function ensureVoicesListener() {
  const synth = window.speechSynthesis;
  if (!synth) return;

  // Attach/re-attach a robust handler
  synth.onvoiceschanged = () => {
    try {
      const fresh = synth.getVoices() || [];
      if (fresh.length > 0) readerVoices = fresh;
    } catch (e) {}
    try { populateVoiceSelect(); } catch (e) {}
    try { populateAudioVoiceSelect(); } catch (e) {}
  };
}

// Load saved audio voice preference early
loadAudioLoopVoice();

function updateReaderSectionLabel(sectionId) {
  const nameEl = document.getElementById('reader-section-name');
  if (!nameEl) return;

  const niceNames = {
    'home': 'Home / Overview',
    'national-defence': 'National Defence',
    'bases': 'ADF Bases',
    'operations': 'ADF Operations',
    'navy': 'Royal Australian Navy',
    'aircraft': 'Royal Australian Air Force',
    'army': 'Australian Army',
    'space': 'Space Defence',
    'cyberspace': 'Cyberspace / Cyber Warfare',
    'weapons': 'Weapons & Systems',
    'leadership': 'ADF Leadership'
  };

  const display = niceNames[sectionId] || (sectionId ? sectionId.replace(/-/g, ' ') : 'Current Section');
  nameEl.textContent = display;
}

function getCurrentSectionForReader() {
  if (window.currentSection) return window.currentSection;
  const visible = document.querySelector('section[style*="display: block"], section:not([style*="display: none"])');
  if (visible && visible.id) return visible.id;
  return 'national-defence';
}

function getReadableTextForSection(sectionId) {
  const sectionEl = document.getElementById(sectionId);
  if (!sectionEl) return 'Content for this section is not available for reading.';

  if (sectionId === 'study-tools' || sectionId === 'glossary') {
    return 'Reading mode is disabled for the interactive study tools and glossary.';
  }

  let chunks = [];
  let startElement = null;
  const startText = sectionStartConfig[sectionId];

  if (startText) {
    const candidates = sectionEl.querySelectorAll('h1, h2, h3, h4, p, strong');
    for (const el of candidates) {
      if (el.textContent.includes(startText)) {
        startElement = el;
        break;
      }
    }
  }
  if (!startElement) {
    const main = sectionEl.querySelector('.section-wrap') || sectionEl;
    startElement = main.querySelector('h3');
  }

  const root = startElement ? (startElement.parentElement || sectionEl) : (sectionEl.querySelector('.section-wrap') || sectionEl);
  const selectors = 'h1, h2, h3, h4, p, li, dt, dd, .highlight-box, .info-grid-item, .tool-category, .threat-card, .base-about, .space-card, .fleet-card, .op-details-body, .base-card';

  let collect = false;
  const allPotential = root.querySelectorAll(selectors);

  for (const el of allPotential) {
    if (startElement && el === startElement) collect = true;
    if (!collect && !startElement) collect = true;
    if (!collect) continue;
    if (el.closest('.study-controls, .study-mode-tabs, button, input, select, .reader-panel')) continue;

    const txt = (el.innerText || el.textContent || '').trim();
    if (txt.length > 8) chunks.push(txt);
  }

  const activeDetail = sectionEl.querySelector('#baseCard, .ops-panel .op-details.visible, .space-detail');
  if (activeDetail) {
    const d = activeDetail.innerText.trim();
    if (d.length > 20) chunks.push(d);
  }

  let full = chunks.join('. ').replace(/\s+/g, ' ').replace(/\.\s*\./g, '.').trim();
  if (full.length < 30) {
    full = sectionEl.innerText.replace(/\s+/g, ' ').trim().substring(0, 2200);
  }
  return full || 'No readable text found in this section.';
}

// Slightly improved sentence chunker (handles common abbreviations and titles better)
function chunkTextIntoSentences(text) {
  if (!text) return [];
  // Split keeping punctuation, but protect common abbreviations
  const protected = text
    .replace(/\b(e\.g\.|i\.e\.|U\.S\.|U\.K\.|Dr\.|Mr\.|Mrs\.|Ms\.|No\.|vs\.|etc\.)\s*/gi, (m) => m.replace(/\./g, '•'));
  const parts = protected.split(/([.!?]+(?:\s+|$))/);
  const chunks = [];
  for (let i = 0; i < parts.length; i += 2) {
    let s = (parts[i] || '').trim().replace(/•/g, '.');
    const punct = parts[i + 1] || '';
    if (s) {
      s = s + punct.trim();
      if (s.length > 5) chunks.push(s);
    }
  }
  if (chunks.length === 0 && text.trim().length > 0) chunks.push(text.trim());
  return chunks;
}

function speakNextChunk() {
  // Capture the current session as soon as we enter. Any later onend from an older
  // card will see a different global readerReadingSession and bail cleanly.
  const thisSession = readerReadingSession;

  if (stopRequested || currentChunkIndex >= currentTextChunks.length) {
    stopRequested = false;
    isSpeaking = false;
    isPaused = false;
    updateReaderPlayPauseUI();
    updateProgressUI();
    return;
  }

  if (readerReadingSession !== thisSession) {
    // A newer card (or section) was opened while this chain was pending.
    // Abort without touching progress or speaking stale content.
    return;
  }

  const chunk = currentTextChunks[currentChunkIndex];
  if (!chunk || chunk.length < 4) {
    currentChunkIndex++;
    speakNextChunk();
    return;
  }

  updateProgressUI();  // advance the bar as we start this chunk

  const utterance = new SpeechSynthesisUtterance(chunk);
  const voice = getBestVoiceFromSelect();
  if (voice) utterance.voice = voice;
  utterance.lang = 'en-AU';   // Prefer AU English when available
  utterance.rate = readerRate;
  utterance.pitch = 1.0;
  utterance.volume = 0.96;

  utterance.onend = () => {
    if (stopRequested || readerReadingSession !== thisSession) {
      stopRequested = false; isSpeaking = false; isPaused = false;
      updateReaderPlayPauseUI(); return;
    }
    currentChunkIndex++;
    updateProgressUI();
    speakNextChunk();
  };

  utterance.onerror = () => {
    if (stopRequested || readerReadingSession !== thisSession) {
      stopRequested = false; isSpeaking = false; isPaused = false; updateReaderPlayPauseUI(); return;
    }
    currentChunkIndex++;
    updateProgressUI();
    speakNextChunk();
  };

  currentUtterance = utterance;

  // The cancel + tiny delay + speak pattern is the most reliable cross-browser workaround
  // for the Web Speech API state machine (especially after pause/resume or voice changes).
  setTimeout(() => {
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    } catch (err) {
      currentChunkIndex++;
      speakNextChunk();
    }
  }, 18);
}

function startReadingCurrentSection() {
  readerReadingSession++;
  stopRequested = false;
  window.speechSynthesis.cancel();

  const sectionId = getCurrentSectionForReader();
  const sectionEl = document.getElementById(sectionId);
  if (!sectionEl) return;

  const text = getReadableTextForSection(sectionId);
  if (!text || text.length < 20) return;

  fullReadableText = text;
  currentTextChunks = chunkTextIntoSentences(text);
  currentChunkIndex = 0;
  isSpeaking = true;
  isPaused = false;

  updateReaderSectionLabel(sectionId);
  updateReaderPlayPauseUI();
  updateProgressUI();   // show 0% initially
  speakNextChunk();
}

function startReadingCurrentDetail() {
  const panel = document.getElementById('reader-panel');
  if (!panel || panel.style.display === 'none') return;

  readerReadingSession++;

  let detailEl = null;
  let title = 'Detail';

  // 1. Shared modal (aircraft, navy, army, weapons, space, adversary cards)
  const modal = document.getElementById('aircraftModal');
  const modalInner = document.getElementById('modalInner');
  if (modal && modal.classList.contains('open') && modalInner) {
    detailEl = modalInner;
    const nameEl = modalInner.querySelector('.modal-name, .modal-hero-text .modal-name');
    if (nameEl) title = nameEl.textContent.trim();
  }

  // 2. Base side card
  if (!detailEl) {
    const baseCard = document.getElementById('baseCard');
    if (baseCard && baseCard.classList.contains('visible')) {
      detailEl = baseCard;
      // Try to get a nice title from the rendered card
      const nameEl = baseCard.querySelector('.base-name, h3, .base-card-header');
      if (nameEl) title = nameEl.textContent.trim();
    }
  }

  // 3. Operations side card
  if (!detailEl) {
    const opsCard = document.getElementById('opsCard');
    if (opsCard && (opsCard.classList.contains('visible') || opsCard.style.display === 'block')) {
      detailEl = opsCard;
      const nameEl = opsCard.querySelector('.op-name, h3');
      if (nameEl) title = nameEl.textContent.trim();
    }
  }

  if (!detailEl) return;

  let spoken = '';

  // Special structured extraction for vehicle/aircraft/weapon/space/adversary modal cards
  const isModalCard = detailEl.querySelector('.modal-hero, .modal-body, .modal-desc, .system-item');
  if (isModalCard) {
    // Title: desig + name
    const desigEl = detailEl.querySelector('.modal-desig');
    const nameEl = detailEl.querySelector('.modal-name');
    let cardTitle = '';
    if (desigEl) cardTitle = desigEl.textContent.trim() + ' ';
    if (nameEl) cardTitle += nameEl.textContent.trim();
    cardTitle = cardTitle.trim() || title;

    // Overview: just the description paragraph, no labels or bottom content
    let overview = '';
    const descEl = detailEl.querySelector('.modal-desc');
    if (descEl) {
      overview = descEl.textContent.trim();
    }

    // Key systems section
    let systemsText = '';
    const systemItems = detailEl.querySelectorAll('.system-item');
    if (systemItems.length > 0) {
      systemsText = 'Key systems: ';
      systemItems.forEach((item, idx) => {
        const sysName = item.querySelector('.system-name')?.textContent.trim() || '';
        const sysCode = item.querySelector('.system-code')?.textContent.trim() || '';
        const sysDesc = item.querySelector('.system-desc')?.textContent.trim() || '';
        let layman = item.querySelector('.layman-box')?.textContent.trim() || '';
        layman = layman.replace(/^Plain English\s*/i, '').trim();

        let part = '';
        if (sysName) part += sysName;
        if (sysCode) part += ' ' + sysCode;
        if (sysDesc) part += ': ' + sysDesc;
        if (layman) part += '. In plain English: ' + layman;

        if (idx > 0) systemsText += '. ';
        systemsText += part;
      });
    }

    spoken = cardTitle + '. ';
    if (overview) spoken += overview + '. ';
    if (systemsText) spoken += systemsText + '. ';
  } else {
    // Fallback for base cards, ops cards and any other details: use the full cleaned text
    spoken = (detailEl.innerText || detailEl.textContent || '').trim();
  }

  if (spoken.length < 15) return;

  // To kill any in-flight onend callbacks from the previous card's utterance
  // (which could otherwise advance the index on the *new* chunks), we set
  // stopRequested true + cancel, increment session (so old onends see mismatch),
  // *then* reset state for the fresh card.
  stopRequested = true;
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
  isSpeaking = false;
  isPaused = false;

  // Now load the brand new card's content and start fresh.
  // The session was already incremented at the top of this function so that
  // any onend callbacks from the utterance we just cancelled will see a
  // different readerReadingSession and bail without advancing progress.
  stopRequested = false;
  fullReadableText = spoken;
  currentTextChunks = chunkTextIntoSentences(spoken);
  currentChunkIndex = 0;

  updateReaderSectionLabel(title);
  updateReaderPlayPauseUI();
  updateProgressUI(true);   // force the bar to 0% for the new content

  isSpeaking = true;
  isPaused = false;

  speakNextChunk();
}

// Helper: when a detail card is closed, stop any ongoing speech but stay silent.
// The reader panel can remain open; speaking only resumes when a new card is opened
// or the user explicitly presses Play.
function stopReaderOnCardClose() {
  const panel = document.getElementById('reader-panel');
  if (!panel || panel.style.display === 'none') return;

  stopSpeech();
  updateReaderSectionLabel(getCurrentSectionForReader());
}

// Watch the main detail containers so we stop speaking when the user closes
// a base card, ops card, or any modal card (without opening a replacement).
function setupReaderDetailCloseWatcher() {
  const observer = new MutationObserver(() => {
    const panel = document.getElementById('reader-panel');
    if (!panel || panel.style.display === 'none') return;

    const hasActiveDetail =
      (document.getElementById('aircraftModal')?.classList.contains('open')) ||
      (document.getElementById('baseCard')?.classList.contains('visible')) ||
      (document.getElementById('opsCard') &&
        (document.getElementById('opsCard').classList.contains('visible') ||
         document.getElementById('opsCard').style.display === 'block'));

    if (!hasActiveDetail) {
      stopReaderOnCardClose();
    }
  });

  const modal = document.getElementById('aircraftModal');
  if (modal) observer.observe(modal, { attributes: true, attributeFilter: ['class'] });

  const baseCard = document.getElementById('baseCard');
  if (baseCard) observer.observe(baseCard, { attributes: true, attributeFilter: ['class'] });

  const opsCard = document.getElementById('opsCard');
  if (opsCard) observer.observe(opsCard, { attributes: true, attributeFilter: ['class', 'style'] });
}

function playOrResumeCurrentSection() {
  stopRequested = false;

  if (isPaused && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    isPaused = false;
    isSpeaking = true;
    updateReaderPlayPauseUI();
    return;
  }

  // If we already have chunks from a previous play (even after Stop), resume from current position
  if (currentTextChunks.length > 0 && currentChunkIndex < currentTextChunks.length) {
    isSpeaking = true;
    isPaused = false;
    updateReaderPlayPauseUI();
    speakNextChunk();
    return;
  }

  // No active session or we finished — start fresh from the current section
  startReadingCurrentSection();
}

function pauseSpeech() {
  if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
    window.speechSynthesis.pause();
    isPaused = true;
    isSpeaking = false;
    updateReaderPlayPauseUI();
  }
}

function stopSpeech() {
  stopRequested = true;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  currentUtterance = null;
  isSpeaking = false;
  isPaused = false;
  updateReaderPlayPauseUI();
  updateProgressUI();
}

function updateProgressUI(reset = false) {
  const progress = document.getElementById('reader-progress');
  const timeEl = document.getElementById('reader-progress-time');
  const totalEl = document.getElementById('reader-progress-total');
  if (!progress) return;

  const total = currentTextChunks.length || 1;
  const pct = total > 0 ? Math.min(100, (currentChunkIndex / total) * 100) : 0;
  progress.value = reset ? 0 : pct;

  const wordsSoFar = currentTextChunks.slice(0, currentChunkIndex).join(' ').split(/\s+/).length;
  const totalWords = (fullReadableText || '').split(/\s+/).length || 1;
  const minSoFar = Math.floor(wordsSoFar / 155);
  const minTotal = Math.floor(totalWords / 155);

  if (timeEl) timeEl.textContent = `${minSoFar}:${String(Math.floor((wordsSoFar % 155) / 2.6)).padStart(2, '0')}`;
  if (totalEl) totalEl.textContent = `${minTotal}:${String(Math.floor((totalWords % 155) / 2.6)).padStart(2, '0')}`;
}

function previewProgress(pctStr) {
  // Lightweight preview while dragging — only updates the time labels and visual position.
  // Does NOT restart speech. Actual seek happens on mouse release (onchange).
  if (!currentTextChunks.length) return;

  const progress = document.getElementById('reader-progress');
  const timeEl = document.getElementById('reader-progress-time');
  const totalEl = document.getElementById('reader-progress-total');
  if (!progress) return;

  const target = Math.floor((parseFloat(pctStr) / 100) * currentTextChunks.length);
  const tempIndex = Math.max(0, Math.min(target, currentTextChunks.length - 1));

  const pct = Math.min(100, (tempIndex / currentTextChunks.length) * 100);
  progress.value = pct;

  const wordsSoFar = currentTextChunks.slice(0, tempIndex).join(' ').split(/\s+/).length;
  const totalWords = (fullReadableText || '').split(/\s+/).length || 1;
  const minSoFar = Math.floor(wordsSoFar / 155);
  const minTotal = Math.floor(totalWords / 155);

  if (timeEl) timeEl.textContent = `${minSoFar}:${String(Math.floor((wordsSoFar % 155) / 2.6)).padStart(2, '0')}`;
  if (totalEl) totalEl.textContent = `${minTotal}:${String(Math.floor((totalWords % 155) / 2.6)).padStart(2, '0')}`;
}

function seekToProgress(pctStr) {
  if (!currentTextChunks.length) return;

  const target = Math.floor((parseFloat(pctStr) / 100) * currentTextChunks.length);
  currentChunkIndex = Math.max(0, Math.min(target, currentTextChunks.length - 1));
  updateProgressUI();   // commit the real position

  const wasSpeaking = isSpeaking;
  stopSpeech();         // stop any current utterance

  if (wasSpeaking) {
    // Only auto-resume speaking if we were actively playing before the seek
    setTimeout(() => {
      isSpeaking = true;
      isPaused = false;
      updateReaderPlayPauseUI();
      speakNextChunk();
    }, 80);
  }
  // If we were stopped/paused, just move the position (user can press Play/Resume)
}

function updateReaderPlayPauseUI() {
  const playBtn = document.getElementById('reader-play-btn');
  const pauseBtn = document.getElementById('reader-pause-btn');
  if (!playBtn || !pauseBtn) return;

  if (isSpeaking && !isPaused) {
    playBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';
  } else {
    playBtn.style.display = 'inline-block';
    pauseBtn.style.display = 'none';

    // Show "Resume" if we have a saved position from previous playback
    const hasPosition = currentTextChunks.length > 0 && currentChunkIndex > 0 && currentChunkIndex < currentTextChunks.length;
    playBtn.textContent = (isPaused || hasPosition) ? '▶ Resume' : '▶ Play';
  }
}

function updateSpeechRate(inputEl) {
  if (!inputEl) return;
  const newRate = parseFloat(inputEl.value);
  if (isNaN(newRate)) return;

  saveReaderRate(newRate);

  const valEl = document.getElementById('reader-speed-val');
  if (valEl) valEl.textContent = newRate.toFixed(2) + '×';

  // Update badge rate if visible
  const badge = document.querySelector('.reader-voice-badge');
  if (badge) badge.textContent = `Tara • ${newRate.toFixed(2)}×`;

  // If we're currently speaking, restart the current chunk so the new rate applies immediately
  if (isSpeaking && !isPaused && currentTextChunks.length) {
    const savedIndex = currentChunkIndex;
    stopSpeech();
    setTimeout(() => {
      if (currentTextChunks.length) {
        currentChunkIndex = Math.min(savedIndex, currentTextChunks.length - 1);
        isSpeaking = true; isPaused = false;
        updateReaderPlayPauseUI();
        speakNextChunk();
      }
    }, 80);
  }
}

function toggleReaderPanel() {
  const panel = document.getElementById('reader-panel');
  if (!panel) return;

  const isHidden = panel.style.display === 'none' || panel.style.display === '';
  panel.style.display = isHidden ? 'block' : 'none';

  if (isHidden) {
    forceLoadVoices();
    const currentId = getCurrentSectionForReader();
    updateReaderSectionLabel(currentId);

    // Make sure speed UI reflects current (possibly restored) rate
    const speedInput = document.getElementById('reader-speed');
    const speedVal = document.getElementById('reader-speed-val');
    if (speedInput) speedInput.value = String(readerRate);
    if (speedVal) speedVal.textContent = readerRate.toFixed(2) + '×';

    // Set badge with current rate
    const badge = document.querySelector('.reader-voice-badge');
    if (badge) badge.textContent = `Tara • ${readerRate.toFixed(2)}×`;

    // If we have a stopped/paused session, show the current progress position
    if (currentTextChunks.length > 0) {
      updateProgressUI();
    }
  } else {
    // Closing the panel stops any speech
    if (isSpeaking) stopSpeech();
  }
}

function closeReaderPanel() {
  const panel = document.getElementById('reader-panel');
  if (panel) panel.style.display = 'none';
  if (isSpeaking) stopSpeech();
}

// --- Reader keyboard support (only active while panel is visible) ---
document.addEventListener('keydown', function(e) {
  const panel = document.getElementById('reader-panel');
  if (!panel || panel.style.display === 'none') return;

  if (e.key === 'Escape') {
    e.preventDefault();
    closeReaderPanel();
  }
  if (e.key === ' ' || e.key === 'Spacebar') {
    // Never hijack space (or other keys) when the user is typing in a text field
    const active = document.activeElement;
    const tag = active ? active.tagName : '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON' || (active && active.isContentEditable)) {
      return;
    }
    e.preventDefault();
    if (isSpeaking && !isPaused) {
      pauseSpeech();
    } else {
      playOrResumeCurrentSection();
    }
  }
}, false);

// --- Reader follows section navigation when the panel is open ---
function followReaderToSection(sectionId) {
  if (!sectionId) return;
  window.currentSection = sectionId;

  const panel = document.getElementById('reader-panel');
  if (!panel || panel.style.display === 'none') return;

  updateReaderSectionLabel(sectionId);
  stopSpeech();

  // Small delay so the new section content is visible and getReadableTextForSection can pick it up
  setTimeout(() => {
    startReadingCurrentSection();
  }, 140);
}

// Patch showSection so major nav (feature cards, top nav, etc.) updates the reader if open
const originalShowSection = window.showSection;
if (typeof originalShowSection === 'function') {
  window.showSection = function(id, el) {
    const result = originalShowSection.apply(this, arguments);
    // Only follow with reader if the reader panel is currently visible
    const panel = document.getElementById('reader-panel');
    if (panel && panel.style.display !== 'none') {
      followReaderToSection(id);
    }
    return result;
  };
}

// Catch direct nav-link / data-section clicks and ensure navigation happens.
// We call showSection (which is patched to also handle reader follow *only if* the reader panel is open).
document.addEventListener('click', function(e) {
  const link = e.target.closest('.nav-link, [data-section]');
  if (link) {
    const sectionId = link.getAttribute('data-section') || (link.getAttribute('href') || '').replace('#', '');
    if (sectionId) {
      // Call showSection directly so the page actually navigates.
      showSection(sectionId, link);
    }
  }
}, true);

// When user selects a base or operation while the reader is open,
// switch to reading the specific card content instead of the main section text.
const origSelectBase = window.selectBase;
if (typeof origSelectBase === 'function') {
  window.selectBase = function(id) {
    origSelectBase.apply(this, arguments);
    const panel = document.getElementById('reader-panel');
    if (panel && panel.style.display !== 'none') {
      // When a base is opened, read the base card instead of the whole section
      setTimeout(() => startReadingCurrentDetail(), 120);
    }
  };
}

const origSelectOp = window.selectOp;
if (typeof origSelectOp === 'function') {
  window.selectOp = function(id) {
    origSelectOp.apply(this, arguments);
    const panel = document.getElementById('reader-panel');
    if (panel && panel.style.display !== 'none') {
      // When an operation is opened, read the op card instead of the whole section
      setTimeout(() => startReadingCurrentDetail(), 120);
    }
  };
}

// Wrap the main card/detail openers so that if the reader is open, it switches
// to reading just the opened card (Navy, Army, Air Force, Weapons, Space, etc.)
function wrapDetailOpener(fnName) {
  const orig = window[fnName];
  if (typeof orig === 'function') {
    window[fnName] = function(id) {
      orig.apply(this, arguments);
      const panel = document.getElementById('reader-panel');
      if (panel && panel.style.display !== 'none') {
        setTimeout(() => startReadingCurrentDetail(), 100);
      }
    };
  }
}

wrapDetailOpener('openAircraftModal');
wrapDetailOpener('showMaritimeDetail');
wrapDetailOpener('showVehicleDetail');
wrapDetailOpener('showAdversaryVehicleDetail');
wrapDetailOpener('showWeaponDetail');
wrapDetailOpener('showAdversaryDetail');
wrapDetailOpener('showSpaceDetail');

// Initialize Text Reader (loads saved voice + rate preferences)
try {
  initTextReader();
} catch (e) { /* non-fatal */ }

// Ensure voices listener is attached globally for the audio picker (even if reader init had issues)
try {
  if (window.speechSynthesis) {
    ensureVoicesListener();
  }
} catch (e) {}

// Immediate kick for the audio voice selector so the dropdown is never blank on load
try {
  setTimeout(() => {
    if (document.getElementById('audio-voice-select')) {
      ensureVoicesListener();
      if (typeof forceLoadVoices === 'function') {
        forceLoadVoices();
      } else {
        populateAudioVoiceSelect();
      }
    }
  }, 60);
} catch (e) {}

// Watch for card closes so the reader goes silent (no auto-resume of section text)
try {
  setupReaderDetailCloseWatcher();
} catch (e) { /* non-fatal */ }

// Google Maps (a couple of retries after the async loader is plenty)
setTimeout(ensureGoogleMapsInit, 300);
setTimeout(ensureGoogleMapsInit, 1100);

// Keyboard support (Escape closes modal) — reader adds its own Space/Esc handler when open
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
// (Remaining duplicate audio loop code cleaned up to resolve SyntaxError)
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

/* =====================================================
