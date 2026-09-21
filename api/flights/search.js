/**
 * Voya Flights - Vercel / Cloud Serverless Function
 * Handles live Ignav API flight searches with server-side API key protection & CORS.
 */

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Api-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { origin, destination, departure_date, return_date, adults = 1, cabin_class = 'economy' } = req.body || {};

  if (!origin || !destination || !departure_date) {
    return res.status(400).json({ error: 'Missing origin, destination, or departure_date' });
  }

  const IGNAV_API_KEY = process.env.IGNAV_API_KEY || 'ignav_yDo2HmudfFsFIX2AEaRo4dJy1nS2-Izp';
  const IGNAV_URL = 'https://ignav.com/api/fares/one-way';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const ignavRes = await fetch(IGNAV_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': IGNAV_API_KEY
      },
      body: JSON.stringify({
        origin: origin.toUpperCase().trim(),
        destination: destination.toUpperCase().trim(),
        departure_date: departure_date
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (ignavRes.ok) {
      const data = await ignavRes.json();
      const rawFlights = data.itineraries || data.fares || data.flights || [];

      // Transform raw Ignav data to standard Voya schema
      const normalizedFlights = rawFlights.map((it, idx) => {
        const outbound = it.outbound || {};
        const segs = outbound.segments || [];
        const firstSeg = segs[0] || {};
        const lastSeg = segs[segs.length - 1] || firstSeg;

        const carrierName = outbound.carrier || firstSeg.operating_carrier_name || 'Commercial Airline';
        const carrierCode = firstSeg.marketing_carrier_code || 'AA';
        const flightNum = `${carrierCode}-${firstSeg.flight_number || (100 + idx)}`;
        const aircraft = firstSeg.aircraft || 'Airbus / Boeing Jet';

        const depTime = firstSeg.departure_time_local ? firstSeg.departure_time_local.slice(11, 16) : '08:30';
        const arrTime = lastSeg.arrival_time_local ? lastSeg.arrival_time_local.slice(11, 16) : '14:45';

        const totalMinutes = outbound.duration_minutes || 180;
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        const durationStr = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;

        const stopsCount = Math.max(0, segs.length - 1);
        const stopsStr = stopsCount === 0 ? 'Non-Stop Direct' : `${stopsCount} Stop`;

        const priceObj = it.price || {};
        let price = parseFloat(priceObj.amount || 199.0);
        if (return_date) price = price * 1.85;

        return {
          id: it.ignav_id || `FL-${carrierCode}-${flightNum}-${idx}`,
          airline: carrierName,
          airlineCode: carrierCode,
          flightNumber: flightNum,
          from: origin.toUpperCase(),
          to: destination.toUpperCase(),
          departureDate: departure_date,
          departureTime: depTime,
          arrivalTime: arrTime,
          duration: durationStr,
          durationMinutes: totalMinutes,
          stops: stopsStr,
          stopsCount: stopsCount,
          price: Math.round(price * (adults || 1)),
          originalPrice: Math.round(price * 1.25 * (adults || 1)),
          currency: priceObj.currency || 'USD',
          aircraft: aircraft,
          baggage: '1 Carry-on Included',
          status: 'live',
          cabinClass: cabin_class
        };
      });

      return res.status(200).json({
        flights: normalizedFlights,
        count: normalizedFlights.length,
        origin,
        destination,
        departure_date
      });
    }

    return res.status(200).json({ flights: [], count: 0, message: 'No flights found' });

  } catch (err) {
    console.error('Serverless flight search error:', err.message);
    return res.status(500).json({ error: 'flight_search_failed', message: err.message });
  }
}
