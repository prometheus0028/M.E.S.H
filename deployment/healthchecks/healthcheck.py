"""Health check probe script for deployment monitoring."""

import sys
import json
import urllib.request
import urllib.error


def check_backend_health(url: str = "http://localhost:8000/health") -> int:
    """Probe the backend /health endpoint and return exit code 0 if accessible."""
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=3) as response:
            if response.status == 200:
                payload = json.loads(response.read().decode("utf-8"))
                status = payload.get("status")
                print(f"[HEALTHCHECK OK] Status: {status}, Service: {payload.get('service')}")
                return 0
            else:
                print(f"[HEALTHCHECK FAIL] Non-200 response: {response.status}")
                return 1
    except urllib.error.URLError as e:
        print(f"[HEALTHCHECK ERROR] Failed to connect to {url}: {e.reason}")
        return 1
    except Exception as e:
        print(f"[HEALTHCHECK EXCEPTION] {e}")
        return 1


if __name__ == "__main__":
    target_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000/health"
    sys.exit(check_backend_health(target_url))
