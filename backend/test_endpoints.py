"""
Quick endpoint smoke-test for Strikebase backend.
Usage:
    python test_endpoints.py [base_url]
Default base_url: http://localhost:8000
"""
import sys
import time
import json
import httpx

BASE = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "http://localhost:8000"

_PASS = "\033[92m PASS\033[0m"
_FAIL = "\033[91m FAIL\033[0m"
_SKIP = "\033[93m SKIP\033[0m"

results = []


def check(label: str, ok: bool, detail: str = ""):
    tag = _PASS if ok else _FAIL
    msg = f"{tag}  {label}"
    if detail:
        msg += f"\n       {detail}"
    print(msg)
    results.append(ok)
    return ok


# Fixed credentials — reused every run so Supabase email rate limits are never hit.
TEST_EMAIL    = "strikebase_smoketest@mailinator.com"
TEST_PASSWORD = "Str0ng!Pass99"


def main():
    token = None
    scan_id = None
    email    = TEST_EMAIL
    password = TEST_PASSWORD

    print(f"\n  Target: {BASE}\n")

    # ── Health ────────────────────────────────────────────────────────────────
    print("── Health ──────────────────────────────────────────────")
    r = httpx.get(f"{BASE}/health", timeout=15)
    check("GET /health → 200", r.status_code == 200)
    body = r.json()
    check("  supabase reachable", body.get("supabase") == "ok", str(body))
    check("  db connected",       body.get("database") == "ok", str(body))

    # ── SERP debug ────────────────────────────────────────────────────────────
    print("\n── SERP debug ──────────────────────────────────────────")
    try:
        r = httpx.get(f"{BASE}/test/serp", timeout=60)
        check("GET /test/serp → 200", r.status_code == 200, r.text[:200])
        body = r.json()
        check("  raw_status received", "raw_status" in body, str(body)[:200])
        check("  SERP returned data", body.get("raw_status") == 200,
              f"raw_status={body.get('raw_status')}  preview={str(body.get('raw_body_preview',''))[:120]}")
    except httpx.TimeoutException:
        print(f"{_SKIP}  GET /test/serp — timed out (Bright Data slow/unreachable)")

    # ── Auth: login first; register only if the account doesn't exist yet ───────
    # This avoids hitting Supabase's email-signup rate limit on repeated runs.
    print("\n── Auth ─────────────────────────────────────────────────")
    login_r = httpx.post(f"{BASE}/auth/login",
                         json={"email": email, "password": password}, timeout=20)
    if login_r.status_code == 200:
        token = login_r.json().get("access_token")
        check("POST /auth/login → 200 (existing account)", True)
        check("  returns access_token", bool(token))
    else:
        # Account doesn't exist — register it (first run only)
        reg_r = httpx.post(f"{BASE}/auth/register",
                           json={"email": email, "password": password, "display_name": "Smoke Tester"},
                           timeout=20)
        ok = check("POST /auth/register → 200 (new account)", reg_r.status_code == 200, reg_r.text[:300])
        if ok:
            token = reg_r.json().get("access_token")
            check("  returns access_token", bool(token), f"token={str(token)[:40]}")

        # Confirm login now works after registration
        login_r2 = httpx.post(f"{BASE}/auth/login",
                               json={"email": email, "password": password}, timeout=20)
        ok2 = check("POST /auth/login → 200 (after register)", login_r2.status_code == 200, login_r2.text[:300])
        if ok2:
            token = login_r2.json().get("access_token") or token

    if not token:
        print(f"\n{_SKIP}  No token — skipping auth-required tests\n")
        _summary()
        return

    headers = {"Authorization": f"Bearer {token}"}

    # ── Auth: forgot-password (just check it returns 200, no real email) ─────
    r = httpx.post(f"{BASE}/auth/forgot-password",
                   json={"email": "nobody@mailinator.com"}, timeout=15)
    check("POST /auth/forgot-password → 200", r.status_code == 200, r.text[:200])

    # ── Users ─────────────────────────────────────────────────────────────────
    print("\n── Users ────────────────────────────────────────────────")
    r = httpx.get(f"{BASE}/users/me", headers=headers, timeout=15)
    check("GET /users/me → 200", r.status_code == 200, r.text[:200])

    r = httpx.put(f"{BASE}/users/me", headers=headers,
                  json={"display_name": "Tester", "skills": ["Python", "FastAPI"],
                        "hourly_rate": 50, "experience": "mid"},
                  timeout=15)
    check("PUT /users/me → 200", r.status_code == 200, r.text[:200])

    # ── Scan ─────────────────────────────────────────────────────────────────
    print("\n── Scan ─────────────────────────────────────────────────")
    r = httpx.post(f"{BASE}/scan", headers=headers,
                   json={"query": "python developer", "platforms": ["upwork"],
                         "skills": ["Python"], "hourly_rate": 50, "experience": "mid"},
                   timeout=30)
    ok = check("POST /scan → 200", r.status_code == 200, r.text[:300])
    if ok:
        body = r.json()
        scan_id = body.get("scan_id")
        check("  returns scan_id", bool(scan_id), f"scan_id={scan_id}")

    # Poll for results (up to 30 s)
    if scan_id:
        print(f"  Polling scan {scan_id} ...", end="", flush=True)
        for _ in range(12):
            time.sleep(2.5)
            r = httpx.get(f"{BASE}/opportunities/{scan_id}", headers=headers, timeout=15)
            if r.status_code == 200 and r.json().get("status") != "processing":
                break
            print(".", end="", flush=True)
        print()
        check("GET /opportunities/{scan_id} → 200", r.status_code == 200, r.text[:300])

    # ── Scan history ──────────────────────────────────────────────────────────
    print("\n── History ──────────────────────────────────────────────")
    r = httpx.get(f"{BASE}/scans/history", headers=headers, timeout=15)
    check("GET /scans/history → 200", r.status_code == 200, r.text[:200])

    # ── Analyze ───────────────────────────────────────────────────────────────
    print("\n── Analyze ──────────────────────────────────────────────")
    r = httpx.post(f"{BASE}/jobs/analyze", headers=headers,
                   json={"description": "Looking for a Python developer to build a REST API with FastAPI. Budget $500-$1000."},
                   timeout=60)
    check("POST /jobs/analyze → 200", r.status_code == 200, r.text[:300])

    # ── Suggestions ───────────────────────────────────────────────────────────
    print("\n── Suggestions ──────────────────────────────────────────")
    r = httpx.post(f"{BASE}/suggestions", headers=headers,
                   json={"skills": ["Python", "FastAPI"], "experience": "mid"},
                   timeout=60)
    check("POST /suggestions → 200", r.status_code == 200, r.text[:300])

    _summary()


def _summary():
    total = len(results)
    passed = sum(results)
    failed = total - passed
    print(f"\n{'─'*54}")
    print(f"  {passed}/{total} passed", end="")
    if failed:
        print(f"  (\033[91m{failed} failed\033[0m)")
    else:
        print("  \033[92mall green\033[0m")
    print()


if __name__ == "__main__":
    main()
