import os
import time
from playwright.sync_api import sync_playwright

BASE_URL = "https://proofstack-cockpit.vercel.app"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "docs", "screenshots")
os.makedirs(OUTPUT_DIR, exist_ok=True)

PAGES = [
    ("/", "landing_hero.png"),
    ("/dashboard", "dashboard.png"),
    ("/control-plane", "control_plane.png"),
    ("/library", "library.png"),
    ("/cockpit/TASK9142", "cockpit.png"),
    ("/dast", "dast.png"),
    ("/ledger", "ledger.png"),
    ("/studio", "studio.png"),
    ("/findings", "findings.png"),
    ("/login", "login.png"),
]

def capture_all():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=2,  # Crisp high-DPI
        )
        page = context.new_page()

        for path, filename in PAGES:
            target_url = f"{BASE_URL}{path}"
            target_path = os.path.join(OUTPUT_DIR, filename)
            print(f"Capturing {target_url} -> {filename}...")
            try:
                page.goto(target_url, wait_until="networkidle", timeout=30000)
                time.sleep(2)  # Allow rendering to settle
                page.screenshot(path=target_path, full_page=False)
                print(f"Saved: {target_path}")
            except Exception as e:
                print(f"Error capturing {target_url}: {e}")

        browser.close()

if __name__ == "__main__":
    capture_all()
