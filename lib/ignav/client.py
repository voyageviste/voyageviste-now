"""
Ignav API Client
Handles authentication, request execution, timeouts, and structured error responses.
"""

import json
import urllib.request
import urllib.error
import urllib.parse
import socket

IGNAV_API_KEY = "ignav_yDo2HmudfFsFIX2AEaRo4dJy1nS2-Izp"
IGNAV_BASE_URL = "https://ignav.com"
DEFAULT_TIMEOUT = 18

class IgnavError(Exception):
    def __init__(self, message, status_code=500, error_type="api_error"):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_type = error_type

class IgnavTimeoutError(IgnavError):
    def __init__(self, message="Flight search is taking longer than expected."):
        super().__init__(message, status_code=504, error_type="timeout")

class IgnavClient:
    def __init__(self, api_key=None, base_url=None, timeout=DEFAULT_TIMEOUT):
        self.api_key = api_key or IGNAV_API_KEY
        self.base_url = (base_url or IGNAV_BASE_URL).rstrip('/')
        self.timeout = timeout

    def request(self, method, path, params=None, body=None, timeout=None):
        url = f"{self.base_url}/{path.lstrip('/')}"
        if params:
            query_str = urllib.parse.urlencode(params)
            url = f"{url}?{query_str}"

        headers = {
            "X-Api-Key": self.api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "VoyaFlights-Backend/1.0"
        }

        data_bytes = None
        if body is not None:
            data_bytes = json.dumps(body).encode('utf-8')

        req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)
        req_timeout = timeout if timeout is not None else self.timeout

        try:
            with urllib.request.urlopen(req, timeout=req_timeout) as response:
                resp_bytes = response.read()
                if not resp_bytes:
                    return {}
                return json.loads(resp_bytes.decode('utf-8'))

        except (socket.timeout, urllib.error.URLError) as e:
            if isinstance(e, socket.timeout) or (isinstance(e, urllib.error.URLError) and isinstance(e.reason, socket.timeout)):
                raise IgnavTimeoutError("Flight search is taking longer than expected.")
            raise IgnavError(f"Network error communicating with Ignav: {str(e)}", status_code=502, error_type="upstream_error")

        except urllib.error.HTTPError as he:
            err_body = he.read().decode('utf-8', errors='ignore')
            err_msg = f"HTTP {he.code}"
            try:
                err_json = json.loads(err_body)
                if isinstance(err_json, dict) and "error" in err_json:
                    err_val = err_json["error"]
                    if isinstance(err_val, dict) and "message" in err_val:
                        err_msg = err_val["message"]
                    elif isinstance(err_val, str):
                        err_msg = err_val
            except Exception:
                if err_body:
                    err_msg = err_body[:200]

            if he.code in (408, 504):
                raise IgnavTimeoutError("Flight search is taking longer than expected.")
            raise IgnavError(err_msg, status_code=he.code, error_type="upstream_error")

        except Exception as ex:
            raise IgnavError(f"Unexpected error: {str(ex)}", status_code=500, error_type="internal_error")
