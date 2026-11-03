// Mobile Navigation, Screen State Router, and Tab Switcher

class MobileAppNavigator {
  constructor() {
    this.currentScreen = 'screen-explore';
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderScreen1Destinations();
    this.renderScreen3FlightResults();
    this.renderScreen4BookingSummary();
  }

  navigateTo(screenId) {
    const screens = document.querySelectorAll('.mobile-screen');
    screens.forEach(screen => {
      screen.classList.remove('active');
    });

    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      this.currentScreen = screenId;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update bottom nav active state
    this.updateBottomNavState(screenId);
  }

  updateBottomNavState(screenId) {
    const tabs = document.querySelectorAll('.mobile-nav-tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    if (screenId === 'screen-explore') {
      const homeTab = document.querySelector('.mobile-nav-tab[data-tab="home"]');
      if (homeTab) homeTab.classList.add('active');
    } else if (screenId === 'screen-flight-details' || screenId === 'screen-search-results') {
      const bookingsTab = document.querySelector('.mobile-nav-tab[data-tab="bookings"]');
      if (bookingsTab) bookingsTab.classList.add('active');
    } else if (screenId === 'screen-booking-summary') {
      const tripsTab = document.querySelector('.mobile-nav-tab[data-tab="trips"]');
      if (tripsTab) tripsTab.classList.add('active');
    }
  }

  bindEvents() {
    // Screen 1 Search bar click -> takes to Screen 2
    const mobileSearchInput = document.getElementById('mobile-search-trigger');
    if (mobileSearchInput) {
      mobileSearchInput.addEventListener('click', () => {
        this.navigateTo('screen-flight-details');
      });
    }

    // Category pills in Screen 1
    const catPills = document.querySelectorAll('.category-pill-item');
    catPills.forEach(pill => {
      pill.addEventListener('click', () => {
        catPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.navigateTo('screen-flight-details');
      });
    });

    // Screen 2 back button -> Screen 1
    const backTo1 = document.getElementById('back-to-screen-1');
    if (backTo1) {
      backTo1.addEventListener('click', () => this.navigateTo('screen-explore'));
    }

    // Screen 2 Route Swap button
    const routeSwapBtn = document.getElementById('mobile-route-swap-btn');
    if (routeSwapBtn) {
      routeSwapBtn.addEventListener('click', () => {
        window.flightSearchEngine.swapRoute();
        this.updateScreen2RouteUI();
      });
    }

    // Screen 2 "Search Flights" button -> Screen 3
    const searchFlightsMobileBtn = document.getElementById('btn-search-flights-mobile');
    if (searchFlightsMobileBtn) {
      searchFlightsMobileBtn.addEventListener('click', () => {
        this.renderScreen3FlightResults();
        this.navigateTo('screen-search-results');
      });
    }

    // Screen 3 back button -> Screen 2
    const backTo2 = document.getElementById('back-to-screen-2');
    if (backTo2) {
      backTo2.addEventListener('click', () => this.navigateTo('screen-flight-details'));
    }

    // Screen 3 filter pills
    const filterPills = document.querySelectorAll('.results-filter-pills .filter-pill');
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.getAttribute('data-filter');
        this.renderScreen3FlightResults(filter);
      });
    });

    // Screen 4 back button -> Screen 3
    const backTo3 = document.getElementById('back-to-screen-3');
    if (backTo3) {
      backTo3.addEventListener('click', () => this.navigateTo('screen-search-results'));
    }

    // Screen 4 "Continue to Payment" -> Open digital boarding pass
    const payBtn = document.getElementById('btn-continue-payment');
    if (payBtn) {
      payBtn.addEventListener('click', () => {
        window.openBoardingPassModal();
      });
    }

    // Bottom Nav Tabs
    const bottomTabs = document.querySelectorAll('.mobile-nav-tab');
    bottomTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabType = tab.getAttribute('data-tab');
        if (tabType === 'home') {
          this.navigateTo('screen-explore');
        } else if (tabType === 'bookings') {
          this.navigateTo('screen-flight-details');
        } else if (tabType === 'trips') {
          this.navigateTo('screen-booking-summary');
        } else if (tabType === 'profile') {
          // Profile view
        }
      });
    });

    // Desktop/Mobile Mode Viewport Toggle Switcher
    const desktopModeBtn = document.getElementById('mode-btn-desktop');
    const mobileModeBtn = document.getElementById('mode-btn-mobile');
    if (desktopModeBtn && mobileModeBtn) {
      desktopModeBtn.addEventListener('click', () => {
        desktopModeBtn.classList.add('active');
        mobileModeBtn.classList.remove('active');
        document.body.classList.remove('force-mobile-preview');
      });

      mobileModeBtn.addEventListener('click', () => {
        mobileModeBtn.classList.add('active');
        desktopModeBtn.classList.remove('active');
        document.body.classList.add('force-mobile-preview');
        this.navigateTo('screen-flight-details');
      });
    }
  }

  updateScreen2RouteUI() {
    const state = window.flightSearchEngine.searchState;
    const originEl = document.getElementById('mobile-route-origin');
    const destEl = document.getElementById('mobile-route-dest');
    const originCityEl = document.getElementById('mobile-route-origin-city');
    const destCityEl = document.getElementById('mobile-route-dest-city');

    if (originEl) originEl.textContent = state.origin;
    if (destEl) destEl.textContent = state.destination;
    if (originCityEl) originCityEl.textContent = state.originCity;
    if (destCityEl) destCityEl.textContent = state.destinationCity;
  }

  renderScreen1Destinations() {
    const container = document.getElementById('mobile-popular-dest-list');
    if (!container) return;

    // First two destinations matching Screen 1 (Maldives $899 & Bali $509/$649)
    const items = POPULAR_DESTINATIONS.slice(0, 2);
    container.innerHTML = items.map(d => `
      <div class="mobile-dest-card" onclick="mobileApp.selectDestination('${d.code}', '${d.city}')">
        <img src="${d.image}" alt="${d.city} Flight">
        <div class="mobile-dest-card-overlay">
          <h4>${d.city}, ${d.country}</h4>
          <div class="mobile-dest-price">From $${d.price} • Direct Flight</div>
        </div>
      </div>
    `).join('');
  }

  selectDestination(code, city) {
    window.flightSearchEngine.searchState.destination = code;
    window.flightSearchEngine.searchState.destinationCity = city;
    this.updateScreen2RouteUI();
    this.navigateTo('screen-flight-details');
  }

  renderScreen3FlightResults(filter = 'best-price') {
    const container = document.getElementById('mobile-flights-list');
    if (!container) return;

    const flights = window.flightSearchEngine.getFilteredFlights(filter);

    container.innerHTML = flights.map(f => `
      <div class="mobile-flight-card" onclick="mobileApp.selectFlight('${f.id}')">
        <div class="mobile-flight-card-header">
          <div class="airline-badge-info">
            <span class="airline-badge-icon">${f.logo}</span>
            <span class="airline-badge-name">${f.airline}</span>
          </div>
          <div class="flight-card-price-right">
            <div class="flight-card-price">$${f.price}</div>
            <div class="flight-card-roundtrip-tag">${f.tripType}</div>
          </div>
        </div>
        <div class="flight-times-timeline">
          <div class="time-box left">
            <div class="flight-time-bold">${f.departureTime}</div>
            <div class="flight-code-sub">${f.from}</div>
          </div>
          <div class="flight-mid-track">
            <span class="track-duration">${f.duration}</span>
            <div class="track-line-visual">
              <span class="track-plane-icon">✈</span>
            </div>
            <span class="track-stops-label">${f.stops}</span>
          </div>
          <div class="time-box right">
            <div class="flight-time-bold">${f.arrivalTime}${f.arrivalDayOffset || ''}</div>
            <div class="flight-code-sub">${f.to}</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  selectFlight(flightId) {
    const flight = FLIGHTS_DATABASE.find(f => f.id === flightId);
    if (flight) {
      window.flightSearchEngine.selectedFlight = flight;
      this.renderScreen4BookingSummary();
      this.navigateTo('screen-booking-summary');
    }
  }

  renderScreen4BookingSummary() {
    const flight = window.flightSearchEngine.selectedFlight || FLIGHTS_DATABASE[0];
    const pricing = window.flightBookingManager.calculatePricing(flight);

    // Update texts on Screen 4
    const destTitle = document.getElementById('summary-dest-title');
    const destSub = document.getElementById('summary-dest-sub');
    const priceAdultsLabel = document.getElementById('summary-price-adults-label');
    const priceAdultsVal = document.getElementById('summary-price-adults-val');
    const priceChildrenRow = document.getElementById('summary-price-children-row');
    const priceChildrenVal = document.getElementById('summary-price-children-val');
    const priceTaxesVal = document.getElementById('summary-price-taxes-val');
    const priceDiscountVal = document.getElementById('summary-price-discount-val');
    const priceTotalVal = document.getElementById('summary-price-total-val');

    if (destTitle) destTitle.textContent = `${flight.toCity} Paradise Flight (${flight.airline})`;
    if (destSub) destSub.textContent = `${flight.fromCity} (${flight.from}) ➔ ${flight.toCity} (${flight.to}) • Direct/1-Stop`;

    if (priceAdultsLabel) priceAdultsLabel.textContent = `$${pricing.basePrice} x ${pricing.adults} Adult${pricing.adults > 1 ? 's' : ''}`;
    if (priceAdultsVal) priceAdultsVal.textContent = `$${pricing.adultTotal.toLocaleString()}`;

    if (priceChildrenRow) {
      if (pricing.children > 0) {
        priceChildrenRow.style.display = 'flex';
        if (priceChildrenVal) priceChildrenVal.textContent = `$${pricing.childTotal.toLocaleString()}`;
      } else {
        priceChildrenRow.style.display = 'none';
      }
    }

    if (priceTaxesVal) priceTaxesVal.textContent = `$${pricing.taxesAndFees}`;
    if (priceDiscountVal) priceDiscountVal.textContent = `-$${pricing.promoDiscount}`;
    if (priceTotalVal) priceTotalVal.textContent = `$${pricing.totalAmount.toLocaleString()}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.mobileApp = new MobileAppNavigator();
});
