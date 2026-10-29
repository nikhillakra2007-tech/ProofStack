import os
import json
import time
from playwright.sync_api import sync_playwright

BASE_URL = "https://sentinel-gate-seven.vercel.app"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "docs", "screenshots")
os.makedirs(OUTPUT_DIR, exist_ok=True)

SESSION = {
    "userId": "usr_super_admin",
    "memberId": "nitin-pandey",
    "name": "Nitin Pandey",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "tenantId": "00000000-0000-0000-0000-000000000001",
    "email": "nitin@proofstack.security",
    "role": "super_admin",
    "token": "jwt_rs256_super_admin_token",
    "canOverridePolicy": True
}

TARGETS = [
    {
        "url": f"{BASE_URL}/",
        "file": "landing_hero.png",
        "auth": False,
        "sleep": 3,
    },
    {
        "url": f"{BASE_URL}/studio",
        "file": "studio.png",
        "auth": True,
        "sleep": 6,
    },
    {
        "url": f"{BASE_URL}/cockpit/TASK9142",
        "file": "cockpit.png",
        "auth": True,
        "sleep": 6,
    },
    {
        "url": f"{BASE_URL}/dast",
        "file": "dast.png",
        "auth": True,
        "sleep": 5,
    },
    {
        "url": f"{BASE_URL}/ledger",
        "file": "ledger.png",
        "auth": True,
        "sleep": 5,
    },
    {
        "url": f"{BASE_URL}/login",
        "file": "login.png",
        "auth": False,
        "sleep": 4,
    },
    {
        "url": f"{BASE_URL}/dashboard",
        "file": "dashboard.png",
        "auth": True,
        "sleep": 5,
    },
    {
        "url": f"{BASE_URL}/settings",
        "file": "settings.png",
        "auth": True,
        "sleep": 5,
    },
]

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=2,
        )
        
        # Add cookie
        context.add_cookies([{
            "name": "proofstack_role",
            "value": "super_admin",
            "domain": "sentinel-gate-seven.vercel.app",
            "path": "/",
        }])

        page = context.new_page()

        # Add init script so localStorage has session for auth pages
        init_script = f"""
            localStorage.setItem('proofstack_session', '{json.dumps(SESSION)}');
            localStorage.setItem('proofstack_api_keys', JSON.stringify({{'nebius': 'configured'}}));
        """

        for target in TARGETS:
            url = target["url"]
            filename = target["file"]
            dest = os.path.join(OUTPUT_DIR, filename)
            
            # Create fresh page or clear storage for public pages
            pg = context.new_page()
            if target.get("auth"):
                pg.add_init_script(init_script)
            else:
                pg.add_init_script("""
                    localStorage.removeItem('proofstack_session');
                """)

            print(f"Capturing {url} -> {filename}...")
            try:
                pg.goto(url, wait_until="networkidle", timeout=30000)
                time.sleep(target.get("sleep", 4))
                print(f"  Final URL: {pg.url}")
                pg.screenshot(path=dest, full_page=False)
                size_kb = os.path.getsize(dest) // 1024
                print(f"  [OK] Saved {filename} ({size_kb} KB)")
            except Exception as e:
                print(f"  [ERROR] {filename}: {e}")
            finally:
                pg.close()

        browser.close()
        print("All screenshots captured successfully.")

if __name__ == "__main__":
    run()
