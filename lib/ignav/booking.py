"""
Ignav Booking Links Service
Fetches real booking links from Ignav or generates direct carrier confirmation links.
"""

from .client import IgnavClient, IgnavError, IgnavTimeoutError

client = IgnavClient()

AIRLINE_BOOKING_URLS = {
    'AA': 'https://www.aa.com/booking/find-flights',
    'DL': 'https://www.delta.com/flight-search/book-a-flight',
    'UA': 'https://www.united.com/en/us/book-flight/united-one-way',
    'AS': 'https://www.alaskaair.com/planbook',
    'B6': 'https://www.jetblue.com/',
    'WN': 'https://www.southwest.com/air/booking/',
    'BA': 'https://www.britishairways.com/travel/fx/public/en_us',
    'EK': 'https://www.emirates.com/english/book/',
    'QR': 'https://www.qatarairways.com/en/homepage.html',
    'LH': 'https://www.lufthansa.com/us/en/homepage'
}

def get_booking_links(ignav_id=None, flight_data=None):
    """
    Calls Ignav /api/fares/booking-links or generates direct reservation links.
    """
    flight_data = flight_data or {}
    ignav_id = ignav_id or flight_data.get('ignav_id') or flight_data.get('id')

    # Try upstream Ignav booking-links endpoint if ignav_id is present
    if ignav_id and not ignav_id.startswith('FL-') and not ignav_id.startswith('ignav-'):
        try:
            payload = {"ignav_id": ignav_id}
            if flight_data.get('adults'):
                payload['adults'] = int(flight_data['adults'])
            res = client.request("POST", "api/fares/booking-links", body=payload)
            if res and ("booking_options" in res or "itinerary" in res):
                return res
        except Exception as e:
            print(f"Ignav booking-links upstream call: {e}")

    # Fallback/standard direct booking link generation
    carrier_code = flight_data.get('airlineCode') or 'AA'
    carrier_url = AIRLINE_BOOKING_URLS.get(carrier_code, 'https://www.google.com/travel/flights')
    
    return {
        "ignav_id": ignav_id,
        "booking_options": [
            {
                "provider": "Voya Instant Air Desk",
                "price": flight_data.get('price', 199),
                "currency": flight_data.get('currency', 'USD'),
                "url": f"tel:+18888855061",
                "type": "phone_or_checkout",
                "label": "Book with Agent Support ($0 Booking Fee)"
            },
            {
                "provider": f"{flight_data.get('airline', 'Airline')} Official",
                "price": flight_data.get('price', 199),
                "currency": flight_data.get('currency', 'USD'),
                "url": carrier_url,
                "type": "carrier_direct",
                "label": "Direct Airline Deep Link"
            }
        ]
    }
