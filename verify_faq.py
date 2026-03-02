from playwright.sync_api import sync_playwright

def verify_faq():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Go to the local server
        page.goto("http://localhost:8000")

        # Scroll to FAQ section
        faq_section = page.locator("#faq")
        faq_section.scroll_into_view_if_needed()

        # Take initial screenshot of FAQ section
        page.screenshot(path="faq_initial.png", full_page=True)

        # Click the first FAQ question to open it
        first_faq_question = page.locator(".faq-question").first
        first_faq_question.click()

        # Wait a bit for any transition
        page.wait_for_timeout(500)

        # Take screenshot of open FAQ
        page.screenshot(path="faq_open.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_faq()