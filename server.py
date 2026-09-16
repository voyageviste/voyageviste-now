#!/usr/bin/env python3
"""
Voya Flights - High Performance Web & API Server
Exposes dedicated backend services under /api/* powered by lib/ignav/
Serves static assets and proxies flight search, details, and booking links.
Returns ONLY real Ignav API data — never fake or mock data.
"""

import http.server
import socketserver
import json
import urllib.parse
import sys
import os

from lib.ignav import (
    search_flights,
    search_airports,
    get_flight_details,
    get_booking_links,
    IgnavTimeoutError,
    IgnavError
)

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3333

class VoyaFlightHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Api-Key')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, status_code, data):
        body = json.dumps(data).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        
        # Dedicated Airport Search Service: /api/airports
        if parsed.path == '/api/airports':
            query_params = urllib.parse.parse_qs(parsed.query)
            q = query_params.get('q', [''])[0]
            limit = int(query_params.get('limit', [15])[0])
            try:
                airports = search_airports(q, limit=limit)
                self.send_json(200, airports)
            except Exception as e:
                self.send_json(500, {'error': 'airport_search_failed', 'message': str(e)})
            return

        # Dedicated Health Endpoint
        if parsed.path == '/api/health':
            self.send_json(200, {'status': 'healthy', 'service': 'Voya Flights API'})
            return

        # Clean URL mapping for Rail landing pages
        if parsed.path in ('/trains-in-usa', '/trains-in-usa/', '/amtrak', '/amtrak/'):
            self.path = '/trains-in-usa.html'
        elif parsed.path in ('/trains-in-canada', '/trains-in-canada/', '/viarail', '/viarail/', '/via-rail', '/via-rail/'):
            self.path = '/trains-in-canada.html'
        
        return super().do_GET()

    def do_HEAD(self):
        # Clean URL mapping for HEAD requests (curl -I, health checks)
        req_path = self.path.split('?')[0]
        if req_path in ('/trains-in-usa', '/trains-in-usa/', '/amtrak', '/amtrak/'):
            self.path = '/trains-in-usa.html'
        elif req_path in ('/trains-in-canada', '/trains-in-canada/', '/viarail', '/viarail/', '/via-rail', '/via-rail/'):
            self.path = '/trains-in-canada.html'
        return super().do_HEAD()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        post_body = self.rfile.read(content_length) if content_length > 0 else b'{}'
        
        try:
            req_data = json.loads(post_body.decode('utf-8')) if post_body else {}
        except Exception:
            self.send_json(400, {'error': 'invalid_json', 'message': 'Invalid JSON in request body'})
            return

        # Dedicated Flight Search Service: /api/flights/search (also /api/search)
        if parsed.path in ('/api/flights/search', '/api/search'):
            origin = req_data.get('origin', '').strip().upper()
            destination = req_data.get('destination', '').strip().upper()
            departure_date = req_data.get('departure_date', '').strip()
            return_date = req_data.get('return_date', '').strip() or None
            adults = req_data.get('adults', 1)
            cabin_class = req_data.get('cabin_class', 'economy')

            if not origin or not destination or not departure_date:
                self.send_json(400, {
                    'error': 'validation_error',
                    'message': 'Missing required fields: origin, destination, departure_date'
                })
                return

            print(f"[Search] {origin}→{destination} {departure_date} rt={return_date} adults={adults} cabin={cabin_class}")

            try:
                flights = search_flights(
                    origin=origin,
                    destination=destination,
                    departure_date=departure_date,
                    return_date=return_date,
                    adults=adults,
                    cabin_class=cabin_class
                )

                if not flights:
                    self.send_json(200, {
                        'flights': [],
                        'count': 0,
                        'message': 'No flights found for this route and date.',
                        'suggestions': [
                            'Try another date',
                            'Try nearby airports',
                            'Try removing filters'
                        ]
                    })
                    return
                else:
                    self.send_json(200, {
                        'flights': flights,
                        'count': len(flights),
                        'origin': origin,
                        'destination': destination,
                        'departure_date': departure_date
                    })
                    return

            except IgnavTimeoutError as err:
                print(f"[Search] Ignav API timed out: {err}")
                self.send_json(504, {
                    'error': 'timeout',
                    'message': 'Flight search timed out. Please try again.',
                    'flights': []
                })
                return

            except IgnavError as err:
                print(f"[Search] Ignav API error: {err}")
                self.send_json(502, {
                    'error': 'upstream_error',
                    'message': 'Flight fare system temporarily unavailable.',
                    'flights': []
                })
                return

            except Exception as err:
                print(f"[Search] Unexpected error: {type(err).__name__}: {err}")
                self.send_json(500, {
                    'error': 'server_error',
                    'message': 'An unexpected error occurred.',
                    'flights': []
                })
                return

        # Dedicated Flight Details Service: /api/flights/details
        if parsed.path == '/api/flights/details':
            flight_id = req_data.get('id') or req_data.get('flight_id') or req_data.get('ignav_id')
            if not flight_id:
                self.send_json(400, {'error': 'validation_error', 'message': 'Missing required parameter: id'})
                return
            try:
                details = get_flight_details(flight_id, req_data)
                self.send_json(200, details)
            except Exception as e:
                self.send_json(500, {'error': 'details_error', 'message': str(e)})
            return

        # Dedicated Booking Links Service: /api/flights/booking-links
        if parsed.path == '/api/flights/booking-links':
            ignav_id = req_data.get('ignav_id') or req_data.get('id')
            try:
                booking_data = get_booking_links(ignav_id=ignav_id, flight_data=req_data)
                self.send_json(200, booking_data)
            except Exception as e:
                self.send_json(500, {'error': 'booking_error', 'message': str(e)})
            return

        # Booking Request Submission: /api/booking/request
        if parsed.path == '/api/booking/request':
            # Accept and log booking requests (lead capture)
            contact_email = req_data.get('email', '')
            contact_phone = req_data.get('phone', '')
            passenger_name = req_data.get('passenger_name', '')
            flight_id = req_data.get('flight_id', '')
            flight_info = req_data.get('flight_info', {})

            # Generate a request reference number
            import time
            import hashlib
            ref_input = f"{contact_email}{flight_id}{time.time()}"
            ref_hash = hashlib.md5(ref_input.encode()).hexdigest()[:8].upper()
            request_ref = f"VR-{ref_hash}"

            print(f"[BookingRequest] Ref={request_ref} Passenger={passenger_name} Email={contact_email} Flight={flight_id}")

            self.send_json(200, {
                'success': True,
                'request_ref': request_ref,
                'message': 'Your booking request has been received. Our travel experts will contact you within 24 hours.',
                'next_steps': [
                    'Our agent will call you to confirm the fare and availability',
                    'You will receive a quote confirmation by email',
                    'Payment is processed securely with the airline or our PCI-compliant system',
                    'E-ticket will be issued upon successful payment'
                ]
            })
            return

        self.send_json(404, {'error': 'not_found', 'message': f'Endpoint not found: {parsed.path}'})

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), VoyaFlightHandler) as httpd:
        print(f"✈️ Voya Flights Server active at http://localhost:{PORT}")
        print(f"   Real API only — no mock data")
        httpd.serve_forever()

if __name__ == '__main__':
    run_server()
