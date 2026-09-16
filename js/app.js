// Main Application Controller & End-to-End Flight Booking Funnel (V5)

let currentPickerMode = 'origin';
let currentFunnelStep = 'page-home';

document.addEventListener('DOMContentLoaded', async () => {
  renderDesktopDestinations();
  renderDesktopDeals();
  renderDesktopPlans();
  bindSearchConsole();
  bindModals();
  bindNewsletter();
  bindContactForms();
  
  // Initialize default flights and airports
  await window.flightSearchEngine.initAirports();
  
  // Pre-fetch initial route flights (JFK -> LAX)
  await window.flightSearchEngine.fetchLiveFlights('JFK', 'LAX', '2026-10-15');
  window.populateAirlinesFilter();
  window.renderFlightResults();

  // Click outside to close inline airport dropdowns
  document.addEventListener('click', (e) => {
    const originField = document.getElementById('origin-field');
    const destField = document.getElementById('dest-field');
    if (originField && !originField.contains(e.target)) {
      const d = document.getElementById('origin-airport-dropdown');
      if (d) d.classList.remove('active');
    }
    if (destField && !destField.contains(e.target)) {
      const d = document.getElementById('dest-airport-dropdown');
      if (d) d.classList.remove('active');
    }
  });

  // ESC key to close dropdowns and modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeAllInlineDropdowns();
      window.closeFlightReconfirmModal();
    }
  });
});

// Funnel Navigation Controller: Manages pages, dynamic header, minimal footer, and adaptive mobile nav
window.navigateToFunnel = function(pageId) {
  const isFunnelStep = ['page-results', 'page-checkout', 'page-confirmation'].includes(pageId);
  const isContentPage = ['page-about', 'page-contact', 'page-privacy', 'page-terms', 'page-refund', 'page-disclaimer'].includes(pageId);

  const pages = document.querySelectorAll('.funnel-page');
  pages.forEach(p => p.classList.remove('active'));

  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add('active');
    currentFunnelStep = pageId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const siteHeader = document.querySelector('.site-header');
  const footer = document.getElementById('footer');
  const state = (window.flightSearchEngine && window.flightSearchEngine.searchState) || { origin: 'JFK', destination: 'LAX', departDate: '15 Oct 2026' };

  // 1. Dynamic Desktop Header State
  if (siteHeader) {
    if (isFunnelStep) {
      siteHeader.classList.add('funnel-mode');
      const routePill = document.getElementById('funnel-header-route');
      const dateTag = document.getElementById('funnel-header-date');
      if (routePill) routePill.innerHTML = `${state.origin} ➔ ${state.destination}`;
      if (dateTag) dateTag.textContent = `${state.departDate || '15 Oct 2026'}`;
    } else {
      siteHeader.classList.remove('funnel-mode');
      // Highlight active nav item
      document.querySelectorAll('.nav-menu .nav-item a').forEach(a => a.classList.remove('active'));
      if (pageId === 'page-home') {
        const homeLink = document.querySelector('.nav-menu .nav-item a[onclick*="page-home"]');
        if (homeLink) homeLink.classList.add('active');
      } else if (pageId === 'page-about') {
        const aboutLink = document.querySelector('.nav-menu .nav-item a[onclick*="page-about"]');
        if (aboutLink) aboutLink.classList.add('active');
      } else if (pageId === 'page-contact') {
        const contactLink = document.querySelector('.nav-menu .nav-item a[onclick*="page-contact"]');
        if (contactLink) contactLink.classList.add('active');
      }
    }
  }

  // 2. Dynamic Footer State (Minimal on Results, Checkout, Confirmation; Full on Home and Policy pages)
  if (footer) {
    if (isFunnelStep) {
      footer.classList.add('minimal-footer');
    } else {
      footer.classList.remove('minimal-footer');
    }
  }

  // 3. Dynamic Mobile App Top Header (Back button hidden on Home, shown on all other pages)
  const mobileBackBtn = document.getElementById('mobile-back-action');
  if (mobileBackBtn) {
    if (pageId === 'page-home') {
      mobileBackBtn.classList.remove('show-back');
    } else {
      mobileBackBtn.classList.add('show-back');
      mobileBackBtn.onclick = () => {
        if (pageId === 'page-results') window.navigateToFunnel('page-home');
        else if (pageId === 'page-checkout') window.navigateToFunnel('page-results');
        else if (pageId === 'page-confirmation') window.navigateToFunnel('page-home');
        else window.navigateToFunnel('page-home');
      };
    }
  }

  // 4. Dynamic Mobile App Bottom Sticky Navigation (Changes per Funnel Step)
  updateMobileBottomNav(pageId);
};

// Adaptive Mobile Sticky Navigation Bar
function updateMobileBottomNav(pageId) {
  const navContainer = document.getElementById('mobile-bottom-nav');
  if (!navContainer) return;

  if (pageId === 'page-home' || pageId.startsWith('page-about') || pageId.startsWith('page-contact') || pageId.startsWith('page-privacy') || pageId.startsWith('page-terms') || pageId.startsWith('page-refund') || pageId.startsWith('page-disclaimer')) {
    navContainer.innerHTML = `
      <div class="mobile-tab-item ${pageId === 'page-home' ? 'active' : ''}" onclick="window.navigateToFunnel('page-home');">
        <svg class="svg-icon" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Home</span>
      </div>
      <div class="mobile-tab-item" onclick="window.navigateToFunnel('page-results');">
        <svg class="svg-icon" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        <span>Flights</span>
      </div>
      <div class="mobile-tab-item ${pageId === 'page-about' ? 'active' : ''}" onclick="window.navigateToFunnel('page-about');">
        <svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <span>About</span>
      </div>
      <a href="tel:+18883190130" class="mobile-tab-item" style="color: #0284c7; text-decoration: none;">
        <svg class="svg-icon" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        <span>Call Desk</span>
      </a>
    `;
  } else if (pageId === 'page-results') {
    navContainer.innerHTML = `
      <div class="mobile-tab-item" onclick="window.navigateToFunnel('page-home');">
        <svg class="svg-icon" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Home</span>
      </div>
      <div class="mobile-tab-item active" onclick="window.openMobileFilters();" id="mobile-tab-filter" style="position: relative;">
        <div style="position: relative; display: inline-flex;">
          <svg class="svg-icon" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          <span class="mobile-filter-badge" id="mobile-nav-filter-count" style="position: absolute; top: -6px; right: -12px; font-size: 0.65rem; padding: 1px 5px; background: #0f62fe; border-radius: 10px; color: #ffffff; line-height: 1.2;">All</span>
        </div>
        <span>Filters</span>
      </div>
      <a href="tel:+18883190130" class="mobile-tab-item" style="color: #0284c7; text-decoration: none;">
        <svg class="svg-icon" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        <span>Call Desk</span>
      </a>
      <div class="mobile-tab-item" onclick="window.cycleMobileSort();">
        <svg class="svg-icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
        <span id="mobile-nav-sort-label">Sort: Low</span>
      </div>
    `;
  } else if (pageId === 'page-checkout') {
    navContainer.innerHTML = `
      <div class="mobile-tab-item" onclick="window.navigateToFunnel('page-home');">
        <svg class="svg-icon" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Home</span>
      </div>
      <div class="mobile-tab-item" onclick="window.navigateToFunnel('page-results');">
        <svg class="svg-icon" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        <span>Flights</span>
      </div>
      <a href="tel:+18883190130" class="mobile-tab-item" style="color: #0284c7; text-decoration: none;">
        <svg class="svg-icon" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        <span>Call Desk</span>
      </a>
      <div class="mobile-tab-item active" onclick="document.getElementById('passenger-checkout-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));">
        <svg class="svg-icon" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span>Confirm</span>
      </div>
    `;
  } else if (pageId === 'page-confirmation') {
    navContainer.innerHTML = `
      <div class="mobile-tab-item" onclick="window.navigateToFunnel('page-home');">
        <svg class="svg-icon" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Home</span>
      </div>
      <div class="mobile-tab-item active" onclick="window.print()">
        <svg class="svg-icon" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        <span>Print Pass</span>
      </div>
      <a href="tel:+18883190130" class="mobile-tab-item" style="color: #0284c7; text-decoration: none;">
        <svg class="svg-icon" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        <span>Flyer Help</span>
      </a>
      <div class="mobile-tab-item" onclick="window.navigateToFunnel('page-home')">
        <svg class="svg-icon" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        <span>Book New</span>
      </div>
    `;
  }
}

// Execute Flight Search (Transitions to Step 2 of Funnel with Ignav Live API)
window.executeFlightSearch = async function() {
  const state = window.flightSearchEngine.searchState;
  
  // Transition to results page immediately with radar scanning state
  window.navigateToFunnel('page-results');

  const container = document.getElementById('flight-results-container');
  if (container) {
    const origName = state.originCity || state.origin;
    const destName = state.destinationCity || state.destination;

    container.innerHTML = `
      <div class="flight-search-loading-card">
        <div class="loader-visual-wrap">
          <div class="loader-pulse-ring"></div>
          <div class="loader-plane-circle">
            <svg class="loader-plane-svg" viewBox="0 0 24 24">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </div>
        </div>

        <h3 class="loader-heading">Searching Available Flights</h3>
        
        <div class="loader-route-badge">
          <span>${origName} (${state.origin})</span>
          <svg class="loader-arrow-icon" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          <span>${destName} (${state.destination})</span>
        </div>

        <div class="loader-progress-track">
          <div class="loader-progress-bar"></div>
        </div>

        <div class="loader-status-meta">
          <span class="loader-pulse-dot"></span>
          <span>Checking real-time airline fares & seat availability across 500+ airlines…</span>
        </div>
      </div>
    `;
  }

  // Query live Ignav API
  await window.flightSearchEngine.fetchLiveFlights(state.origin, state.destination, state.departDate);

  // Populate dynamic airline filter checkboxes with real counts & price range slider
  window.populateAirlinesFilter();

  // Render fresh results
  window.renderFlightResults();
};

// Populate Dynamic Airlines Filter with Real Counts from Cached Results
window.populateAirlinesFilter = function() {
  const flights = window.flightSearchEngine.cachedFlights;
  const listEl = document.getElementById('airlines-checkbox-list');
  if (!listEl) return;

  const counts = {};
  flights.forEach(f => {
    const name = f.airline || 'Commercial Airline';
    counts[name] = (counts[name] || 0) + 1;
  });

  const names = Object.keys(counts);
  if (names.length === 0) {
    listEl.innerHTML = `<span style="font-size: 0.8rem; color: #94a3b8;">No airlines available</span>`;
    return;
  }

  listEl.innerHTML = names.map(name => `
    <label class="filter-check-item">
      <input type="checkbox" name="filter-airline" value="${escapeQuotes(name)}" checked onchange="applyFilters()">
      <span>${name} <small>(${counts[name]})</small></span>
    </label>
  `).join('');

  // Dynamically set Max Price Slider according to actual flight prices
  const prices = flights.map(f => Number(f.price) || 0).filter(p => p > 0);
  if (prices.length > 0) {
    const minP = Math.floor(Math.min(...prices));
    const maxP = Math.ceil(Math.max(...prices));
    const slider = document.getElementById('price-range-slider');
    const display = document.getElementById('price-slider-display');
    if (slider) {
      slider.min = minP;
      slider.max = Math.max(minP + 20, maxP);
      slider.value = slider.max;
    }
    if (display) {
      display.textContent = `$${slider.value}`;
    }
    window.flightSearchEngine.filterState.maxPrice = Number(slider.value);
  }
};

// Real-Time Results Filter Engine
window.applyFilters = function() {
  const stops = Array.from(document.querySelectorAll('input[name="filter-stop"]:checked')).map(el => el.value);
  const times = Array.from(document.querySelectorAll('input[name="filter-time"]:checked')).map(el => el.value);
  const slider = document.getElementById('price-range-slider');
  const maxPrice = slider ? Number(slider.value) : 3000;
  const airlines = Array.from(document.querySelectorAll('input[name="filter-airline"]:checked')).map(el => el.value);
  const cabins = Array.from(document.querySelectorAll('input[name="filter-cabin"]:checked')).map(el => el.value);

  window.flightSearchEngine.filterState.stops = stops;
  window.flightSearchEngine.filterState.times = times;
  window.flightSearchEngine.filterState.maxPrice = maxPrice;
  window.flightSearchEngine.filterState.airlines = airlines;
  window.flightSearchEngine.filterState.cabins = cabins;

  // Update mobile filter badge count
  const allStops = document.querySelectorAll('input[name="filter-stop"]').length;
  const allTimes = document.querySelectorAll('input[name="filter-time"]').length;
  const allAirlines = document.querySelectorAll('input[name="filter-airline"]').length;
  const allCabins = document.querySelectorAll('input[name="filter-cabin"]').length;

  let activeFilterCount = 0;
  if (stops.length < allStops) activeFilterCount++;
  if (times.length < allTimes) activeFilterCount++;
  if (airlines.length < allAirlines) activeFilterCount++;
  if (cabins.length < allCabins) activeFilterCount++;

  const badge = document.getElementById('mobile-filter-badge-count');
  if (badge) {
    badge.textContent = activeFilterCount > 0 ? `${activeFilterCount}` : 'All';
  }
  const navBadge = document.getElementById('mobile-nav-filter-count');
  if (navBadge) {
    navBadge.textContent = activeFilterCount > 0 ? `${activeFilterCount}` : 'All';
  }

  window.renderFlightResults();
};

// Reset All Filters to Default Active
window.resetAllFilters = function() {
  document.querySelectorAll('input[name="filter-stop"]').forEach(el => el.checked = true);
  document.querySelectorAll('input[name="filter-time"]').forEach(el => el.checked = true);
  document.querySelectorAll('input[name="filter-airline"]').forEach(el => el.checked = true);
  document.querySelectorAll('input[name="filter-cabin"]').forEach(el => el.checked = true);

  const slider = document.getElementById('price-range-slider');
  if (slider) {
    slider.value = slider.max;
    const display = document.getElementById('price-slider-display');
    if (display) display.textContent = `$${slider.max}`;
  }

  // Reset sort to cheapest
  document.querySelectorAll('.sort-pill-btn').forEach(b => b.classList.remove('active'));
  const cheapBtn = document.querySelector('.sort-pill-btn[data-sort="cheapest"]');
  if (cheapBtn) cheapBtn.classList.add('active');
  window.flightSearchEngine.filterState.sort = 'cheapest';

  const badge = document.getElementById('mobile-filter-badge-count');
  if (badge) badge.textContent = 'All';
  const navBadge = document.getElementById('mobile-nav-filter-count');
  if (navBadge) navBadge.textContent = 'All';

  applyFilters();
};

// Slider Real-Time Drag Handler
window.handlePriceSliderChange = function(val) {
  const display = document.getElementById('price-slider-display');
  if (display) display.textContent = `$${val}`;
  applyFilters();
};

// Sort Selection Tabs Handler
window.handleSortSelection = function(sortType, btn) {
  document.querySelectorAll('.sort-pill-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  window.flightSearchEngine.filterState.sort = sortType;
  
  const formatted = sortType.charAt(0).toUpperCase() + sortType.slice(1);
  const sortLabel = document.getElementById('mobile-sort-btn-label');
  if (sortLabel) {
    sortLabel.textContent = `Sort: ${formatted}`;
  }
  const navSortLabel = document.getElementById('mobile-nav-sort-label');
  if (navSortLabel) {
    navSortLabel.textContent = `Sort: ${formatted}`;
  }
  
  applyFilters();
};

// Mobile Filter Sheet Open / Close / Cycle
window.openMobileFilters = function() {
  const sidebar = document.getElementById('results-filters-sidebar');
  const backdrop = document.getElementById('mobile-filter-backdrop');
  if (sidebar) sidebar.classList.add('mobile-open');
  if (backdrop) backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeMobileFilters = function() {
  const sidebar = document.getElementById('results-filters-sidebar');
  const backdrop = document.getElementById('mobile-filter-backdrop');
  if (sidebar) sidebar.classList.remove('mobile-open');
  if (backdrop) backdrop.classList.remove('active');
  document.body.style.overflow = '';
};

window.cycleMobileSort = function() {
  const sorts = ['cheapest', 'fastest', 'best', 'departure'];
  const current = window.flightSearchEngine.filterState.sort || 'cheapest';
  const next = sorts[(sorts.indexOf(current) + 1) % sorts.length];
  const btn = document.querySelector(`.sort-pill-btn[data-sort="${next}"]`);
  window.handleSortSelection(next, btn);
};

// Render Flight Search Results (Step 2 of Funnel - Matching Image 1)
window.renderFlightResults = function() {
  const container = document.getElementById('flight-results-container');
  if (!container) return;

  const state = window.flightSearchEngine.searchState;

  // Update Top Sub-Strip and Results Headline
  const stripTitle = document.getElementById('results-strip-route-title');
  const stripDetails = document.getElementById('results-strip-details');
  const headTitle = document.getElementById('results-headline-route');
  const countText = document.getElementById('results-count-text');

  if (stripTitle) stripTitle.innerHTML = `${state.originCity} ➔ ${state.destinationCity}`;
  if (stripDetails) stripDetails.textContent = `${state.departDate} · ${state.adults} pax · ${state.cabinClass}`;
  if (headTitle) headTitle.innerHTML = `${state.originCity} ➔ ${state.destinationCity}`;

  // 1. API Error Handling (Timeout, Error, No Results from API)
  const searchError = window.flightSearchEngine.searchError;
  if (searchError) {
    if (countText) countText.textContent = `0 flights found`;

    if (searchError.type === 'timeout') {
      container.innerHTML = `
        <div class="flight-status-card timeout">
          <div class="status-icon-bubble">
            <svg class="svg-icon" viewBox="0 0 24 24" style="width: 38px; height: 38px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <h3>Flight search is taking longer than expected.</h3>
          <p class="status-desc">The live airline reservation network is currently responding slowly. Please retry your flight query.</p>
          <div class="status-btn-group">
            <button class="btn-status-primary" onclick="window.triggerFlightSearch()">Try Again</button>
          </div>
        </div>
      `;
      return;
    }

    if (searchError.type === 'error') {
      container.innerHTML = `
        <div class="flight-status-card error">
          <div class="status-icon-bubble">
            <svg class="svg-icon" viewBox="0 0 24 24" style="width: 38px; height: 38px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h3>We couldn't load flight availability right now.</h3>
          <p class="status-desc">An error occurred while communicating with the flight fare system. Please try searching again.</p>
          <div class="status-btn-group">
            <button class="btn-status-primary" onclick="window.triggerFlightSearch()">Search Again</button>
          </div>
        </div>
      `;
      return;
    }

    if (searchError.type === 'no_results') {
      container.innerHTML = `
        <div class="flight-status-card no-results">
          <div class="status-icon-bubble">
            <svg class="svg-icon" viewBox="0 0 24 24" style="width: 38px; height: 38px;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h3>No flights found for your search.</h3>
          <p class="status-desc">There are no scheduled direct or connecting flights matching this exact route and date.</p>
          <div class="search-suggestions-box">
            <h5>Suggestions:</h5>
            <ul>
              <li>Try another date</li>
              <li>Try nearby airports</li>
              <li>Try removing filters</li>
            </ul>
          </div>
          <div class="status-btn-group">
            <button class="btn-status-primary" onclick="window.navigateToFunnel('page-home')">Modify Dates or Route</button>
            <button class="btn-status-secondary" onclick="window.resetAllFilters()">Reset Filters</button>
          </div>
        </div>
      `;
      return;
    }
  }

  const flights = window.flightSearchEngine.getFilteredFlights();
  if (countText) countText.textContent = `${flights.length} flights found`;

  const mobileCountChip = document.getElementById('mobile-apply-count-chip');
  if (mobileCountChip) {
    mobileCountChip.textContent = `(${flights.length} Flights)`;
  }

  // 2. Client-side filters returning 0 items
  if (flights.length === 0) {
    container.innerHTML = `
      <div class="flight-status-card no-results">
        <div class="status-icon-bubble">
          <svg class="svg-icon" viewBox="0 0 24 24" style="width: 38px; height: 38px;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <h3>No flights found for your search.</h3>
        <p class="status-desc">No flights currently match your active filter selections.</p>
        <div class="search-suggestions-box">
          <h5>Suggestions:</h5>
          <ul>
            <li>Try another date</li>
            <li>Try nearby airports</li>
            <li>Try removing filters</li>
          </ul>
        </div>
        <div class="status-btn-group">
          <button class="btn-status-primary" onclick="resetAllFilters()">Reset All Filters</button>
          <button class="btn-status-secondary" onclick="window.navigateToFunnel('page-home')">Change Route</button>
        </div>
      </div>
    `;
    return;
  }

  // 3. Render Real Flight Cards with Real Airline Logos and Live Fares
  container.innerHTML = flights.map(f => {
    const logoHtml = window.getAirlineLogoHTML 
      ? window.getAirlineLogoHTML(f.airlineCode || f.airline, f.airline)
      : (window.getAirlineLogoSVG ? window.getAirlineLogoSVG(f.airlineCode || f.airline) : `✈️`);
    const mainPrice = Number(f.price).toFixed(2);
    const statusLabel = f.status === 'live' ? 'Live Fare' : 'Verified Fare';

    return `
      <div class="flight-card-v2">
        <div class="flight-card-grid">
          <!-- Airline with Real Logo -->
          <div class="flight-airline-col">
            <div class="airline-logo-wrap">
              ${logoHtml}
            </div>
            <div class="airline-text-wrap">
              <h4>${f.airline}</h4>
              <div class="airline-meta-sub">
                <span>${f.flightNumber}</span>
                <span class="flight-stop-chip ${f.stopsCount === 0 ? 'nonstop' : 'stop'}">
                  ${f.stopsCount === 0 ? '<svg class="svg-icon" style="width: 11px; height: 11px; display: inline-block; vertical-align: -1px; margin-right: 3px;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Non-stop' : f.stops}
                </span>
              </div>
            </div>
          </div>

          <!-- Timeline -->
          <div class="flight-timeline-col">
            <div class="time-block origin">
              <span class="time-val">${f.departureTime}</span>
              <span class="airport-code">${f.from}</span>
            </div>

            <div class="timeline-visual-track">
              <span class="track-duration-label">${f.duration}</span>
              <div class="track-svg-line">
                <span class="track-dot"></span>
                <span class="track-bar"></span>
                <svg class="track-plane-icon" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                <span class="track-bar"></span>
                <span class="track-dot"></span>
              </div>
              <span class="track-type-label">${f.stopsCount === 0 ? 'Direct' : f.stopsCount + ' stop'}</span>
            </div>

            <div class="time-block dest">
              <span class="time-val">${f.arrivalTime}${f.arrivalDayOffset || ''}</span>
              <span class="airport-code">${f.to}</span>
            </div>
          </div>

          <!-- Pricing & CTA -->
          <div class="flight-pricing-col">
            <div class="price-main-val">$${mainPrice}</div>
            <div class="price-per-pax">Per Person · ${f.currency || 'USD'}</div>
            <button class="btn-select-book" onclick="openFlightReconfirmModal('${f.id}')">
              <span>Select &amp; Book</span>
              <svg class="svg-icon" style="width: 14px; height: 14px;" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        <!-- Footer Perks -->
        <div class="flight-card-footer-strip">
          <span class="fare-perk-pill">
            <svg class="perk-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18v3"/><path d="M20 18v3"/><path d="M4 11h16a1 1 0 0 1 1 1v4a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-4a1 1 0 0 1 1-1z"/><path d="M6 11V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6"/></svg>
            <span>${f.cabinClass || 'Economy'}</span>
          </span>
          <span class="fare-perk-pill green">
            <svg class="perk-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
            <span>${statusLabel}</span>
          </span>
          <span class="fare-perk-pill">
            <svg class="perk-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="7" width="12" height="13" rx="2.5"/><path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"/><line x1="6" y1="12" x2="18" y2="12"/><circle cx="9" cy="20" r="1"/><circle cx="15" cy="20" r="1"/></svg>
            <span>${f.baggage || '1 Carry-on Included'}</span>
          </span>
        </div>
      </div>
    `;
  }).join('');
};


// Filter pills handler on Results Page (for quick filter buttons if clicked)
window.filterResults = function(btn, filterType) {
  document.querySelectorAll('.results-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  window.flightSearchEngine.filterState.sort = filterType;
  window.renderFlightResults();
};

// ==========================================================================
// STEP 2.5: FLIGHT SELECTION RE-CONFIRMATION POPUP MODAL (Matching Image 2)
// Vertical timeline, airline logo, route, pricing, and "Book Now ➔" button
// ==========================================================================

window.openFlightReconfirmModal = function(flightId) {
  try {
    const flight = (window.flightSearchEngine && window.flightSearchEngine.cachedFlights ? window.flightSearchEngine.cachedFlights.find(f => String(f.id) === String(flightId)) : null) || 
                   (window.flightSearchEngine && window.flightSearchEngine.cachedFlights ? window.flightSearchEngine.cachedFlights[0] : null);

    if (!flight) {
      console.warn('No flight available to confirm');
      return;
    }

    window.flightSearchEngine.selectedFlight = flight;

    const modal = document.getElementById('flight-reconfirm-modal');
    const detailsBox = document.getElementById('reconfirm-flight-details');
    if (!detailsBox || !modal) return;

    const logoHtml = window.getAirlineLogoHTML ? window.getAirlineLogoHTML(flight.airlineCode || flight.airline, flight.airline) : (window.getAirlineLogoSVG ? window.getAirlineLogoSVG(flight.airlineCode || flight.airline) : `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>`);
    const origPrice = (flight.originalPrice || (flight.price * 1.5)).toFixed(2);
    const mainPrice = Number(flight.price).toFixed(2);

    detailsBox.innerHTML = `
      <div class="reconfirm-v2-header">
        <div>
          <h3>${flight.from} → ${flight.to}</h3>
          <p>${flight.airline} · ${flight.cabinClass || 'Economy'}</p>
        </div>
        <button class="reconfirm-v2-close" onclick="closeFlightReconfirmModal()" aria-label="Close">
          <svg class="svg-icon" viewBox="0 0 24 24" style="width: 18px; height: 18px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="reconfirm-v2-card-box">
        <div class="reconfirm-v2-route-bar">
          <span class="route-text">
            <svg class="svg-icon" style="width: 16px; height: 16px; color: #0f62fe;" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            ${flight.from} - ${flight.to}
          </span>
          <span class="date-text">${flight.departureDate || 'Sep 15, 2026'}</span>
        </div>

        <div class="reconfirm-v2-airline">
          <div class="airline-logo-box">
            ${logoHtml}
          </div>
          <div>
            <h4>${flight.airline}, ${flight.cabinClass || 'Economy'}</h4>
            <span>${flight.airlineCode}, ${flight.flightNumber}</span>
          </div>
        </div>

      <div class="reconfirm-v2-timeline">
        <div class="timeline-v2-stop">
          <span class="timeline-v2-circle"></span>
          <div class="timeline-v2-meta">
            <span class="timeline-v2-time">${flight.departureTime}</span>
            <span class="timeline-v2-code">${flight.from}</span>
          </div>
        </div>

        <div class="timeline-v2-line">
          <span><svg class="svg-icon" viewBox="0 0 24 24" style="width: 13px; height: 13px; display: inline-block; vertical-align: -2px; margin-right: 4px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${flight.duration}</span>
        </div>

        <div class="timeline-v2-stop">
          <span class="timeline-v2-circle"></span>
          <div class="timeline-v2-meta">
            <span class="timeline-v2-time">${flight.arrivalTime}${flight.arrivalDayOffset || ''}</span>
            <span class="timeline-v2-code">${flight.to}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="reconfirm-v2-footer">
      <div class="reconfirm-v2-price-wrap">
        <span class="old-price">$${origPrice}</span>
        <div class="current-price">$${mainPrice}</div>
        <span class="pax-note">per person · ${flight.currency || 'USD'}</span>
      </div>

      <button class="btn-reconfirm-book" onclick="proceedFromReconfirmToCheckout()">
        <span>Book Now</span>
        <svg class="svg-icon" viewBox="0 0 24 24" style="width: 15px; height: 15px; display: inline-block; vertical-align: -2px; margin-left: 4px;"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </button>
    </div>
  `;

  modal.classList.add('active');
  } catch (err) {
    console.error('Error opening flight reconfirm modal:', err);
  }
};

window.closeFlightReconfirmModal = function() {
  const modal = document.getElementById('flight-reconfirm-modal');
  if (modal) modal.classList.remove('active');
};

// Price Hold Live Countdown Timer (Image 3: "Price Hold Expires: 11:36")
let countdownInterval = null;
window.startPriceHoldCountdown = function(durationMinutes = 11, durationSeconds = 36) {
  if (countdownInterval) clearInterval(countdownInterval);
  let totalSeconds = durationMinutes * 60 + durationSeconds;

  const timerEl = document.getElementById('price-hold-countdown');
  const updateTimer = () => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (timerEl) {
      timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    if (totalSeconds > 0) {
      totalSeconds--;
    } else {
      clearInterval(countdownInterval);
    }
  };

  updateTimer();
  countdownInterval = setInterval(updateTimer, 1000);
};

// Proceed from Reconfirmation to Checkout (Step 3 of Funnel - Matching Image 3)
window.proceedFromReconfirmToCheckout = function() {
  window.closeFlightReconfirmModal();
  const flight = window.flightSearchEngine.selectedFlight;
  if (!flight) return;

  const pricing = window.flightBookingManager.calculatePricing(flight);
  
  // Populate Selected Flight Itinerary Box (Image 3)
  const itizedBox = document.getElementById('checkout-itinerary-box');
  const logoHtml = window.getAirlineLogoHTML ? window.getAirlineLogoHTML(flight.airlineCode || flight.airline, flight.airline) : (window.getAirlineLogoSVG ? window.getAirlineLogoSVG(flight.airlineCode || flight.airline) : `✈️`);

  if (itizedBox) {
    itizedBox.innerHTML = `
      <div style="font-size: 0.85rem; font-weight: 700; color: #0f62fe; margin-bottom: 12px;">
        ➔ Depart, ${flight.departureDate || 'Tue, Sep 15, 2026'}
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; padding: 4px;">
            ${logoHtml}
          </div>
          <div>
            <h5 style="font-size: 0.95rem; font-weight: 800; color: #071938;">${flight.airline} - ${flight.flightNumber}</h5>
            <span style="font-size: 0.78rem; color: #64748b;">${flight.cabinClass || 'Economy'}</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="text-align: right;">
            <div style="font-size: 1.1rem; font-weight: 800; color: #071938;">${flight.departureTime}</div>
            <div style="font-size: 0.8rem; font-weight: 700; color: #64748b;">${flight.from}</div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
            <span style="font-size: 0.74rem; font-weight: 700; color: #64748b; display: inline-flex; align-items: center; gap: 4px;">
              <svg class="svg-icon" style="width: 12px; height: 12px; color: #94a3b8;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${flight.duration}
            </span>
            <span style="width: 40px; height: 2px; background: #cbd5e1;"></span>
          </div>
          <div>
            <div style="font-size: 1.1rem; font-weight: 800; color: #071938;">${flight.arrivalTime}${flight.arrivalDayOffset || ''}</div>
            <div style="font-size: 0.8rem; font-weight: 700; color: #64748b;">${flight.to}</div>
          </div>
        </div>
      </div>
    `;
  }

  // Update Right Sidebar Price Breakdown (Image 3)
  const baseLabel = document.getElementById('checkout-base-label');
  const baseVal = document.getElementById('checkout-base-val');
  const totalVal = document.getElementById('checkout-total-val');

  if (baseLabel) baseLabel.textContent = `Base Fare (${pricing.adults} Adult${pricing.adults > 1 ? 's' : ''})`;
  if (baseVal) baseVal.textContent = `USD $${Number(flight.price).toFixed(2)}`;
  if (totalVal) totalVal.textContent = `USD $${Number(flight.price).toFixed(2)}`;

  // Start the 11:36 countdown timer
  startPriceHoldCountdown(11, 36);

  window.navigateToFunnel('page-checkout');
};

// Step 4: Submit Booking Request — NO fake PNRs, NO fake ticket issuance
window.handleConfirmBooking = async function(event) {
  event.preventDefault();
  const flight = window.flightSearchEngine.selectedFlight;
  if (!flight) {
    console.error('[Booking] No selected flight found');
    return;
  }

  const firstName = (document.getElementById('pass-lead-name') || document.getElementById('pass-first-name') || {}).value || '';
  const middleName = (document.getElementById('pass-middle-name') || {}).value || '';
  const lastName = (document.getElementById('pass-last-name') || {}).value || '';
  const email = (document.getElementById('pass-contact-email') || {}).value || '';
  const phone = (document.getElementById('pass-contact-phone') || {}).value || '';
  const gender = (document.getElementById('pass-gender') || {}).value || '';
  
  const dobDay = (document.getElementById('pass-dob-day') || {}).value || '';
  const dobMonth = (document.getElementById('pass-dob-month') || {}).value || '';
  const dobYear = (document.getElementById('pass-dob-year') || {}).value || '';
  const dob = (dobDay && dobMonth && dobYear) ? `${dobDay}/${dobMonth}/${dobYear}` : '';

  const billCountry = (document.getElementById('bill-country') || {}).value || '';
  const billState = (document.getElementById('bill-state') || {}).value || '';
  const billAddress1 = (document.getElementById('bill-address1') || {}).value || '';
  const billAddress2 = (document.getElementById('bill-address2') || {}).value || '';
  const billCity = (document.getElementById('bill-city') || {}).value || '';
  const billZip = (document.getElementById('bill-zip') || {}).value || '';

  const cardName = (document.getElementById('card-name') || {}).value || '';
  const rawCard = (document.getElementById('card-number') || {}).value || '';
  const cardLast4 = rawCard.replace(/\D/g, '').slice(-4);
  const cardExpMonth = (document.getElementById('card-exp-month') || {}).value || '';
  const cardExpYear = (document.getElementById('card-exp-year') || {}).value || '';
  const cardExpiry = (cardExpMonth && cardExpYear) ? `${cardExpMonth}/${cardExpYear}` : '';

  const submitBtn = document.querySelector('.btn-confirm-secure-book');
  const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Submitting Request…</span>`;
  }

  try {
    const result = await window.flightBookingManager.submitBookingRequest(flight, {
      firstName,
      middleName,
      lastName,
      email,
      phone,
      gender,
      dob,
      dob_day: dobDay,
      dob_month: dobMonth,
      dob_year: dobYear,
      billingCountry: billCountry,
      billingState: billState,
      billingAddress: `${billAddress1} ${billAddress2}`.trim(),
      billingCity: billCity,
      billingZip: billZip,
      cardName,
      cardLast4,
      cardExpiry
    });

    const requestRef = result.requestRef || 'N/A';
    const req = result.request || {};

    // Populate confirmation page with comprehensive booking request info
    const refEl = document.getElementById('conf-request-ref');
    if (refEl) refEl.textContent = requestRef;

    const nameEl = document.getElementById('conf-passenger-name');
    if (nameEl) nameEl.textContent = `${firstName} ${lastName}`.trim() || 'Valued Passenger';

    const emailEl = document.getElementById('conf-contact-email');
    if (emailEl) emailEl.textContent = email || '—';

    const phoneEl = document.getElementById('conf-contact-phone');
    if (phoneEl) phoneEl.textContent = phone || '—';

    const airlineNameEl = document.getElementById('conf-airline-name');
    if (airlineNameEl) airlineNameEl.textContent = `${flight.airline} · ${flight.flightNumber}`;

    const cabinEl = document.getElementById('conf-cabin-class');
    if (cabinEl) cabinEl.textContent = `${flight.cabinClass || 'Economy'} Class`;

    const dateEl = document.getElementById('conf-depart-date');
    if (dateEl) dateEl.textContent = flight.departureDate || window.flightSearchEngine.searchState.departDate;

    const departTimeEl = document.getElementById('conf-depart-time');
    if (departTimeEl) departTimeEl.textContent = flight.departureTime || '—';

    const arrivalTimeEl = document.getElementById('conf-arrival-time');
    if (arrivalTimeEl) arrivalTimeEl.textContent = `${flight.arrivalTime || '—'}${flight.arrivalDayOffset || ''}`;

    const fromCodeEl = document.getElementById('conf-from-code');
    if (fromCodeEl) fromCodeEl.textContent = flight.from;

    const toCodeEl = document.getElementById('conf-to-code');
    if (toCodeEl) toCodeEl.textContent = flight.to;

    const fromCityEl = document.getElementById('conf-from-city');
    if (fromCityEl) fromCityEl.textContent = window.flightSearchEngine.searchState.originCity || flight.from;

    const toCityEl = document.getElementById('conf-to-city');
    if (toCityEl) toCityEl.textContent = window.flightSearchEngine.searchState.destinationCity || flight.to;

    const durationValEl = document.getElementById('conf-duration-val');
    if (durationValEl) durationValEl.textContent = flight.duration || 'Direct';

    const logoBoxEl = document.getElementById('conf-airline-logo-box');
    if (logoBoxEl) {
      const logoHtml = window.getAirlineLogoHTML ? window.getAirlineLogoHTML(flight.airlineCode || flight.airline, flight.airline) : '';
      if (logoHtml) logoBoxEl.innerHTML = logoHtml;
    }

    const priceEl = document.getElementById('conf-price-summary');
    if (priceEl) priceEl.textContent = `USD $${Number(flight.price).toFixed(2)}`;

    window.navigateToFunnel('page-confirmation');

  } catch (err) {
    console.error('[Booking] Request submission error:', err);
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
};

// Render Popular Destinations
function renderDesktopDestinations() {
  const container = document.getElementById('destinations-grid');
  if (!container) return;

  container.innerHTML = POPULAR_DESTINATIONS.map(d => `
    <div class="dest-card" onclick="handleSelectDestinationCard('${d.code}', '${d.city}', '${d.country}')">
      <img src="${d.image}" alt="${d.city} Flight">
      <div class="dest-card-overlay">
        <span class="dest-card-badge">Non-Stop</span>
        <div class="dest-card-info">
          <h4>${d.city}</h4>
          <p>${d.country}</p>
          <div class="dest-card-meta">
            <span style="font-size: 0.75rem; color: #cbd5e1;">Airfare from</span>
            <div class="dest-card-price">$${d.price}</div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Render Top Flight Deals & Offers
function renderDesktopDeals() {
  const container = document.getElementById('deals-grid');
  if (!container) return;

  container.innerHTML = TOP_FLIGHT_DEALS.map(deal => `
    <div class="deal-card">
      <div class="deal-card-media">
        <img src="${deal.image}" alt="${deal.title}">
        <span class="deal-discount-badge">${deal.discount}</span>
      </div>
      <div class="deal-card-body">
        <h4>${deal.title}</h4>
        <div class="deal-route">
          <svg class="svg-icon" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 4px;" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          ${deal.route}
        </div>
        <div class="deal-amenities">
          <span><svg class="svg-icon" style="width: 13px; height: 13px; display: inline-block; vertical-align: -2px; margin-right: 3px;" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>${deal.airline}</span> • <span>${deal.type.split('•')[1] || 'Direct Flight'}</span>
        </div>
        <div class="deal-footer">
          <div>
            <span class="deal-price-current">$${deal.price}</span>
            <span class="deal-price-old">$${deal.originalPrice}</span>
          </div>
          <button class="btn-primary" style="padding: 6px 14px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;" onclick="handleBookDeal('${deal.title}', ${deal.price})">
            <span>Book Deal</span>
            <svg class="svg-icon" style="width: 13px; height: 13px;" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Render Cabin Experience Plans
function renderDesktopPlans() {
  const container = document.getElementById('plans-grid');
  if (!container) return;

  const plansHtml = CABIN_PLANS.map(plan => `
    <div class="plan-card ${plan.featured ? 'featured' : ''}">
      ${plan.featured ? `<span class="plan-top-badge">${plan.badge}</span>` : ''}
      <div>
        <div class="plan-icon">${plan.icon}</div>
        <h4 class="plan-title">${plan.title}</h4>
        <p class="plan-desc">${plan.subtitle}</p>
        
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
          ${plan.features.map(f => `
            <li style="font-size: 0.78rem; display: flex; align-items: center; gap: 6px; color: #475569;">
              <svg class="svg-icon" style="width: 13px; height: 13px; color: #0f62fe; flex-shrink: 0;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              <span>${f}</span>
            </li>
          `).join('')}
        </ul>

        <div class="plan-price-block">
          <span class="plan-price-label">Fares starting from</span>
          <div class="plan-price">$${plan.price} <small style="font-size: 0.8rem; font-weight: 500; color: #64748b;">/ flight</small></div>
        </div>
      </div>

      <button class="plan-btn" onclick="selectCabinClassPlan('${plan.title}')">
        Select ${plan.title}
      </button>
    </div>
  `).join('');

  container.innerHTML = plansHtml;
}

// Bind Flight Search Console & UI Controls
function bindSearchConsole() {
  // Set default dates if not set
  const departInput = document.getElementById('depart-date-input');
  const returnInput = document.getElementById('return-date-input');
  
  if (departInput) {
    const today = new Date().toISOString().split('T')[0];
    departInput.min = today;
    if (!departInput.value) departInput.value = '2026-10-15';
    handleDateChange('depart', departInput.value);
  }
  
  if (returnInput) {
    if (!returnInput.value) returnInput.value = '2026-10-22';
    if (departInput && departInput.value) returnInput.min = departInput.value;
    handleDateChange('return', returnInput.value);
  }

  // Click outside to close passenger dropdown
  document.addEventListener('click', (e) => {
    const paxDropdown = document.getElementById('passenger-counter-dropdown');
    const paxTrigger = document.getElementById('passenger-selector-trigger');
    if (paxDropdown && paxDropdown.classList.contains('active')) {
      if (!paxDropdown.contains(e.target) && !paxTrigger.contains(e.target)) {
        paxDropdown.classList.remove('active');
      }
    }
  });

  // Checkout form submit
  const checkoutForm = document.getElementById('passenger-checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', window.handleConfirmBooking);
  }
}

// Passenger dropdown toggle
window.togglePassengerDropdown = function(event) {
  if (event) {
    event.stopPropagation();
  }
  const paxDropdown = document.getElementById('passenger-counter-dropdown');
  if (!paxDropdown) return;
  // Close any open airport dropdowns
  window.closeAllInlineDropdowns();
  paxDropdown.classList.toggle('active');
};

// Date picker trigger for Departure / Return
window.triggerDatePicker = function(mode) {
  if (mode === 'return' && window.flightSearchEngine.searchState.tripType === 'One Way') {
    return;
  }
  const inputId = mode === 'depart' ? 'depart-date-input' : 'return-date-input';
  const input = document.getElementById(inputId);
  if (!input) return;

  try {
    if (typeof input.showPicker === 'function') {
      input.showPicker();
    } else {
      input.focus();
    }
  } catch (err) {
    input.focus();
  }
};

// Handle Date Change
window.handleDateChange = function(mode, value) {
  if (!value) return;
  const state = window.flightSearchEngine.searchState;
  const dateObj = new Date(value + 'T00:00:00');
  const dayName = isNaN(dateObj.getTime()) ? '' : dateObj.toLocaleDateString('en-US', { weekday: 'long' });

  if (mode === 'depart') {
    state.departDate = value;
    const subEl = document.getElementById('depart-date-sub');
    if (subEl) subEl.textContent = dayName;

    // Ensure return date is not earlier than departure
    const returnInput = document.getElementById('return-date-input');
    if (returnInput) {
      returnInput.min = value;
      if (returnInput.value && returnInput.value < value) {
        returnInput.value = value;
        state.returnDate = value;
        const returnSub = document.getElementById('return-date-sub');
        if (returnSub) returnSub.textContent = dayName;
      }
    }
  } else if (mode === 'return') {
    state.returnDate = value;
    const subEl = document.getElementById('return-date-sub');
    if (subEl) subEl.textContent = dayName;
  }
};

// Trip type tab buttons (Round Trip & One Way)
window.handleTripType = function(btn, type) {
  document.querySelectorAll('.trip-tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  window.flightSearchEngine.searchState.tripType = type;

  const returnField = document.getElementById('return-date-field');
  const returnInput = document.getElementById('return-date-input');
  const returnSub = document.getElementById('return-date-sub');

  if (type === 'One Way') {
    window.flightSearchEngine.searchState.returnDate = null;
    if (returnField) {
      returnField.style.opacity = '0.4';
      returnField.style.pointerEvents = 'none';
      returnField.style.cursor = 'not-allowed';
    }
    if (returnInput) {
      returnInput.disabled = true;
    }
    if (returnSub) {
      returnSub.textContent = 'One Way (No Return)';
    }
  } else {
    // Round Trip
    if (returnField) {
      returnField.style.opacity = '1';
      returnField.style.pointerEvents = 'auto';
      returnField.style.cursor = 'pointer';
    }
    if (returnInput) {
      returnInput.disabled = false;
      const departInput = document.getElementById('depart-date-input');
      const departVal = departInput ? departInput.value : '2026-10-15';
      if (!returnInput.value || returnInput.value < departVal) {
        returnInput.value = departVal;
      }
      window.flightSearchEngine.searchState.returnDate = returnInput.value;
      const dateObj = new Date(returnInput.value + 'T00:00:00');
      if (returnSub) {
        returnSub.textContent = isNaN(dateObj.getTime()) ? '' : dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      }
    }
  }
};

// Passenger counter adjustments
window.changePassengers = function(type, delta) {
  const summary = window.flightSearchEngine.updatePassengerCount(type, delta);
  const state = window.flightSearchEngine.searchState;

  const adultVal = document.getElementById('adult-count');
  const childVal = document.getElementById('child-count');
  const infantVal = document.getElementById('infant-count');
  const summaryText = document.getElementById('passenger-summary-text');
  const subText = document.getElementById('passenger-sub-text');

  if (adultVal) adultVal.textContent = state.adults;
  if (childVal) childVal.textContent = state.children;
  if (infantVal) infantVal.textContent = state.infants;
  if (summaryText) summaryText.textContent = summary;
  
  const totalBags = (state.adults + state.children) * 2;
  if (subText) subText.textContent = `Economy • ${totalBags} Bags`;
};

// Toggle Direct Flights Only
window.toggleDirectFlights = function(checked) {
  window.flightSearchEngine.searchState.directOnly = checked;
  if (currentFunnelStep === 'page-results') {
    window.renderFlightResults();
  }
};

// Swap departure and arrival route
window.swapSearchRoute = function() {
  window.flightSearchEngine.swapRoute();
  const state = window.flightSearchEngine.searchState;

  const origCode = document.getElementById('origin-code');
  const origCity = document.getElementById('origin-city');
  const destCode = document.getElementById('dest-code');
  const destCity = document.getElementById('dest-city');

  if (origCode) origCode.textContent = state.origin;
  if (origCity) origCity.textContent = `${state.originCity} (${state.origin})`;
  if (destCode) destCode.textContent = state.destination;
  if (destCity) destCity.textContent = `${state.destinationCity} (${state.destination})`;
};

// Select destination from homepage grid
window.handleSelectDestinationCard = function(code, city, country) {
  const state = window.flightSearchEngine.searchState;
  state.destination = code;
  state.destinationCity = city;
  state.destinationAirport = `${city} International Airport`;

  const destCode = document.getElementById('dest-code');
  const destCity = document.getElementById('dest-city');
  if (destCode) destCode.textContent = code;
  if (destCity) destCity.textContent = `${city} (${code}), ${country}`;

  window.executeFlightSearch();
};

// Select cabin class from plans section
window.selectCabinClassPlan = function(className) {
  window.flightSearchEngine.searchState.cabinClass = className;
  const cabinSelect = document.getElementById('cabin-select');
  if (cabinSelect) cabinSelect.value = className;
  document.getElementById('search-console').scrollIntoView({ behavior: 'smooth' });
};

// Book promotional deal
window.handleBookDeal = function(dealTitle, price) {
  window.executeFlightSearch();
};

// ==========================================================================
// INLINE ATTACHED AIRPORT AUTOCOMPLETE DROPDOWN (Matching Image 4)
// Directly attached below From/To fields inside the booking search form
// ==========================================================================

window.toggleInlineAirportDropdown = function(event, mode) {
  if (event) event.stopPropagation();
  const dropdown = document.getElementById(`${mode === 'origin' ? 'origin' : 'dest'}-airport-dropdown`);
  const otherDropdown = document.getElementById(`${mode === 'origin' ? 'dest' : 'origin'}-airport-dropdown`);
  
  if (otherDropdown) otherDropdown.classList.remove('active');
  if (!dropdown) return;

  const isOpening = !dropdown.classList.contains('active');
  dropdown.classList.toggle('active');

  if (isOpening) {
    const input = document.getElementById(`${mode === 'origin' ? 'origin' : 'dest'}-search-input`);
    if (input) {
      setTimeout(() => input.focus(), 80);
      filterInlineAirports(mode, input.value);
    }
  }
};

window.filterInlineAirports = function(mode, query) {
  const container = document.getElementById(`${mode === 'origin' ? 'origin' : 'dest'}-airports-list`);
  if (!container) return;

  const matches = window.flightSearchEngine.searchAirports(query, 25);
  if (matches.length === 0) {
    container.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #64748b; font-size: 0.85rem;">
        No commercial airports found matching "<strong>${escapeQuotes(query)}</strong>".
      </div>
    `;
    return;
  }

  container.innerHTML = matches.map(a => `
    <div class="inline-airport-item" onclick="selectInlineAirport('${mode}', '${escapeQuotes(a.code)}')">
      <div class="inline-airport-info">
        <div class="inline-airport-city">${a.city || a.name}${a.country ? ', ' + a.country : ''}</div>
        <div class="inline-airport-name">${a.name || a.city + ' Airport'}</div>
      </div>
      <span class="inline-airport-badge">${a.code}</span>
    </div>
  `).join('');
};

window.selectInlineAirport = function(mode, code, city, name, country) {
  const state = window.flightSearchEngine.searchState;
  const ap = window.flightSearchEngine.getAirport(code);
  if (ap) {
    city = ap.city || city || code;
    name = ap.name || name || `${code} International Airport`;
    country = ap.country || country || '';
  }

  if (mode === 'origin') {
    state.origin = code;
    state.originCity = city;
    state.originAirport = name;

    const codeEl = document.getElementById('origin-code');
    const cityEl = document.getElementById('origin-city');
    if (codeEl) codeEl.textContent = code;
    if (cityEl) cityEl.textContent = `${city} (${code})${country ? ', ' + country : ''}`;

    const dropdown = document.getElementById('origin-airport-dropdown');
    if (dropdown) dropdown.classList.remove('active');

    // Automatically transition to destination dropdown naturally
    setTimeout(() => {
      window.toggleInlineAirportDropdown(null, 'destination');
    }, 120);
  } else {
    if (code === state.origin) {
      return;
    }

    state.destination = code;
    state.destinationCity = city;
    state.destinationAirport = name;

    const codeEl = document.getElementById('dest-code');
    const cityEl = document.getElementById('dest-city');
    if (codeEl) codeEl.textContent = code;
    if (cityEl) cityEl.textContent = `${city} (${code})${country ? ', ' + country : ''}`;

    const dropdown = document.getElementById('dest-airport-dropdown');
    if (dropdown) dropdown.classList.remove('active');
  }
};

window.closeAllInlineDropdowns = function() {
  const originD = document.getElementById('origin-airport-dropdown');
  const destD = document.getElementById('dest-airport-dropdown');
  if (originD) originD.classList.remove('active');
  if (destD) destD.classList.remove('active');
};

// Backward-compatibility wrapper
window.openAirportPicker = function(mode) {
  window.toggleInlineAirportDropdown(null, mode);
};

window.populateAirportsPicker = function() {
  window.filterInlineAirports('origin', '');
  window.filterInlineAirports('destination', '');
};

function escapeQuotes(str) {
  if (!str) return '';
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// Modal bindings
function bindModals() {
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
}

// Newsletter & Lead Web3Forms Submissions
function bindNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletter-email');
      const email = emailInput ? emailInput.value.trim() : '';
      if (!email) return;

      const btn = form.querySelector('.btn-subscribe');
      const originalText = btn ? btn.innerHTML : '';
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span>Subscribing…</span>`;
      }

      try {
        if (window.sendWeb3FormEmail) {
          await window.sendWeb3FormEmail({
            subject: `🔔 Secret Airfare Alerts Subscription: ${email}`,
            name: "Secret Airfare Subscriber",
            email: email,
            message: `New user subscribed for Secret Airfare Alerts from Voyage Viste home page: ${email}`
          });
        }
      } catch (err) {
        console.warn('Newsletter Web3Forms error:', err);
      }

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span style="display: inline-flex; align-items: center; gap: 4px;"><svg class="svg-icon" style="width: 14px; height: 14px;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Subscribed!</span>`;
        setTimeout(() => {
          btn.innerHTML = originalText;
        }, 3000);
      }
      form.reset();
    });
  }
}

// Contact Page & Modal Web3Forms Submissions
function bindContactForms() {
  // 1. Contact Us Page Form (#contact-page-inquiry-form)
  const contactPageForm = document.getElementById('contact-page-inquiry-form');
  if (contactPageForm) {
    contactPageForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactPageForm.querySelector('button[type="submit"]');
      const origBtnContent = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Sending Inquiry…</span>`;
      }

      const name = (document.getElementById('contact-p-name') || {}).value || '';
      const email = (document.getElementById('contact-p-email') || {}).value || '';
      const phone = (document.getElementById('contact-p-phone') || {}).value || '';
      const service = (document.getElementById('contact-p-service') || {}).value || 'General Flights';
      const message = (document.getElementById('contact-p-message') || {}).value || '';

      const feedbackEl = document.getElementById('contact-page-form-feedback');

      try {
        if (window.sendWeb3FormEmail) {
          await window.sendWeb3FormEmail({
            subject: `📩 New Travel Inquiry from ${name} (${service})`,
            name: name,
            email: email,
            phone: phone,
            travel_service: service,
            message: `VOYAGE VISTE CONTACT INQUIRY:
----------------------------
Customer: ${name}
Email: ${email}
Phone: ${phone}
Service: ${service}

Details / Message:
${message}`
          });
        }

        if (feedbackEl) {
          feedbackEl.style.display = 'flex';
          feedbackEl.innerHTML = `
            <svg class="svg-icon" style="width: 20px; height: 20px; color: #10b981; flex-shrink: 0;" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <div>
              <strong>Inquiry Received!</strong>
              <p style="margin: 2px 0 0 0; font-size: 0.85rem;">Thank you, ${name}. A dedicated travel consultant will review your itinerary and contact you shortly.</p>
            </div>
          `;
        }

        contactPageForm.reset();
      } catch (err) {
        console.warn('Contact page Web3Forms error:', err);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origBtnContent;
        }
      }
    });
  }

  // 2. Flight Consultation Modal Form (#contact-inquiry-form)
  const contactModalForm = document.getElementById('contact-inquiry-form');
  if (contactModalForm) {
    contactModalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactModalForm.querySelector('button[type="submit"]');
      const origBtnContent = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Requesting…</span>`;
      }

      const name = (document.getElementById('modal-c-name') || {}).value || '';
      const phone = (document.getElementById('modal-c-phone') || {}).value || '';
      const query = (document.getElementById('modal-c-query') || {}).value || '';

      try {
        if (window.sendWeb3FormEmail) {
          await window.sendWeb3FormEmail({
            subject: `📞 Flight Consultation Request from ${name}`,
            name: name,
            phone: phone,
            flight_query: query,
            message: `FREE FLIGHT CONSULTATION REQUEST:
---------------------------------
Customer Name: ${name}
Phone Number: ${phone}
Query / Routing: ${query}`
          });
        }

        if (submitBtn) {
          submitBtn.innerHTML = `<span style="display: inline-flex; align-items: center; gap: 6px;"><svg class="svg-icon" style="width: 15px; height: 15px;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Request Received!</span>`;
        }

        setTimeout(() => {
          const modal = document.getElementById('contact-modal');
          if (modal) modal.classList.remove('active');
          contactModalForm.reset();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origBtnContent;
          }
        }, 1800);

      } catch (err) {
        console.warn('Modal Web3Forms error:', err);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origBtnContent;
        }
      }
    });
  }
}

// ==========================================================================
// IN-PLACE MODIFY SEARCH (Results Page: #results-modify-drawer)
// Allows changing destination/origin/date directly without redirecting home
// ==========================================================================
window.toggleResultsModifySearch = function(forceOpen) {
  const drawer = document.getElementById('results-modify-drawer');
  const btnLabel = document.getElementById('modify-search-btn-label');
  if (!drawer) return;

  const isCurrentlyOpen = drawer.style.display !== 'none';
  const shouldOpen = forceOpen !== undefined ? forceOpen : !isCurrentlyOpen;

  if (shouldOpen) {
    const state = window.flightSearchEngine.searchState;
    const origInput = document.getElementById('modify-origin-input');
    const destInput = document.getElementById('modify-dest-input');
    const dateInput = document.getElementById('modify-depart-date');
    const paxSelect = document.getElementById('modify-adults-count');
    const cabinSelect = document.getElementById('modify-cabin-class');

    if (origInput) {
      origInput.value = state.originCity ? `${state.originCity} (${state.origin})` : state.origin;
      origInput.dataset.code = state.origin;
    }
    if (destInput) {
      destInput.value = state.destinationCity ? `${state.destinationCity} (${state.destination})` : state.destination;
      destInput.dataset.code = state.destination;
    }
    if (dateInput && state.departDate) {
      dateInput.value = state.departDate;
    }
    if (paxSelect && state.passengers) {
      paxSelect.value = String(state.passengers);
    }
    if (cabinSelect && state.cabin) {
      cabinSelect.value = state.cabin;
    }

    drawer.style.display = 'block';
    if (btnLabel) btnLabel.textContent = 'Close';
    if (origInput) {
      setTimeout(() => origInput.focus(), 80);
    }
  } else {
    drawer.style.display = 'none';
    if (btnLabel) btnLabel.textContent = 'Modify Search';
    const origDrop = document.getElementById('modify-origin-dropdown');
    const destDrop = document.getElementById('modify-dest-dropdown');
    if (origDrop) origDrop.style.display = 'none';
    if (destDrop) destDrop.style.display = 'none';
  }
};

window.filterModifyAirports = function(type, query) {
  const dropdown = document.getElementById(`modify-${type}-dropdown`);
  if (!dropdown) return;

  if (!query || query.trim().length < 2) {
    dropdown.style.display = 'none';
    return;
  }

  const results = window.flightSearchEngine.searchAirports(query, 10);
  if (!results || results.length === 0) {
    dropdown.innerHTML = `<div style="padding: 10px; font-size: 0.8rem; color: #94a3b8; text-align: center;">No commercial airports found</div>`;
    dropdown.style.display = 'block';
    return;
  }

  dropdown.innerHTML = results.map(a => `
    <div class="dropdown-item" onclick="selectModifyAirport('${type}', '${a.code}', '${escapeQuotes(a.city)}', '${escapeQuotes(a.name)}', '${escapeQuotes(a.country)}')">
      <div>
        <strong style="color: #071938;">${a.city || a.name}</strong>
        <span style="font-size: 0.72rem; color: #64748b; margin-left: 4px;">${a.name || ''}</span>
      </div>
      <span style="background: #eff6ff; color: #0f62fe; font-weight: 800; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px;">${a.code}</span>
    </div>
  `).join('');
  dropdown.style.display = 'block';
};

window.selectModifyAirport = function(type, code, city, name, country) {
  const input = document.getElementById(`modify-${type}-input`);
  const dropdown = document.getElementById(`modify-${type}-dropdown`);

  if (input) {
    input.value = `${city || code} (${code})`;
    input.dataset.code = code;
  }
  if (dropdown) {
    dropdown.style.display = 'none';
  }
};

window.swapModifyAirports = function() {
  const origInput = document.getElementById('modify-origin-input');
  const destInput = document.getElementById('modify-dest-input');
  if (!origInput || !destInput) return;

  const tempVal = origInput.value;
  const tempCode = origInput.dataset.code || '';

  origInput.value = destInput.value;
  origInput.dataset.code = destInput.dataset.code || '';

  destInput.value = tempVal;
  destInput.dataset.code = tempCode;
};

window.executeModifySearch = function() {
  const origInput = document.getElementById('modify-origin-input');
  const destInput = document.getElementById('modify-dest-input');
  const dateInput = document.getElementById('modify-depart-date');
  const paxSelect = document.getElementById('modify-adults-count');
  const cabinSelect = document.getElementById('modify-cabin-class');

  const state = window.flightSearchEngine.searchState;

  // Extract Origin Code
  let originCode = origInput ? (origInput.dataset.code || '') : '';
  if (!originCode && origInput && origInput.value) {
    const match = origInput.value.match(/\b([A-Z]{3})\b/i);
    if (match) originCode = match[1].toUpperCase();
  }
  if (!originCode) originCode = state.origin || 'JFK';

  // Extract Dest Code
  let destCode = destInput ? (destInput.dataset.code || '') : '';
  if (!destCode && destInput && destInput.value) {
    const match = destInput.value.match(/\b([A-Z]{3})\b/i);
    if (match) destCode = match[1].toUpperCase();
  }
  if (!destCode) destCode = state.destination || 'LAX';

  if (originCode === destCode) {
    alert('Origin and Destination airports cannot be identical.');
    return;
  }

  // Update State
  state.origin = originCode;
  const origAp = window.flightSearchEngine.getAirport(originCode);
  if (origAp) state.originCity = origAp.city;

  state.destination = destCode;
  const destAp = window.flightSearchEngine.getAirport(destCode);
  if (destAp) state.destinationCity = destAp.city;

  if (dateInput && dateInput.value) {
    state.departDate = dateInput.value;
  }
  if (paxSelect && paxSelect.value) {
    state.passengers = parseInt(paxSelect.value, 10) || 1;
  }
  if (cabinSelect && cabinSelect.value) {
    state.cabin = cabinSelect.value;
  }

  // Update Homepage search input sync if elements exist
  const origCodeEl = document.getElementById('origin-code');
  const origCityEl = document.getElementById('origin-city');
  if (origCodeEl) origCodeEl.textContent = state.origin;
  if (origCityEl) origCityEl.textContent = `${state.originCity || state.origin} (${state.origin})`;

  const destCodeEl = document.getElementById('dest-code');
  const destCityEl = document.getElementById('dest-city');
  if (destCodeEl) destCodeEl.textContent = state.destination;
  if (destCityEl) destCityEl.textContent = `${state.destinationCity || state.destination} (${state.destination})`;

  // Update Results Strip
  const stripTitle = document.getElementById('results-strip-route-title');
  const stripDetails = document.getElementById('results-strip-details');
  if (stripTitle) {
    stripTitle.textContent = `${state.originCity || state.origin} ➔ ${state.destinationCity || state.destination}`;
  }
  if (stripDetails) {
    stripDetails.textContent = `${state.departDate} · ${state.passengers} pax · ${state.cabin}`;
  }

  // Close modify drawer smoothly
  window.toggleResultsModifySearch(false);

  // Re-run flight search directly on results page!
  window.executeFlightSearch();
};

// Global click listener to close modify dropdowns when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('#modify-origin-input') && !e.target.closest('#modify-origin-dropdown')) {
    const d = document.getElementById('modify-origin-dropdown');
    if (d) d.style.display = 'none';
  }
  if (!e.target.closest('#modify-dest-input') && !e.target.closest('#modify-dest-dropdown')) {
    const d = document.getElementById('modify-dest-dropdown');
    if (d) d.style.display = 'none';
  }
});

// URL Hash routing support (#about, #contact, #privacy, #terms, #refund, #disclaimer)
function handleHashRoute() {
  const hash = window.location.hash ? window.location.hash.replace('#', '').toLowerCase() : '';
  const hashMap = {
    'about': 'page-about',
    'about-us': 'page-about',
    'contact': 'page-contact',
    'contact-us': 'page-contact',
    'privacy': 'page-privacy',
    'privacy-policy': 'page-privacy',
    'terms': 'page-terms',
    'terms-and-conditions': 'page-terms',
    'refund': 'page-refund',
    'refund-policy': 'page-refund',
    'disclaimer': 'page-disclaimer',
    'flights': 'page-results',
    'home': 'page-home'
  };
  if (hashMap[hash]) {
    window.navigateToFunnel(hashMap[hash]);
  }
}
window.addEventListener('hashchange', handleHashRoute);
window.addEventListener('DOMContentLoaded', handleHashRoute);

