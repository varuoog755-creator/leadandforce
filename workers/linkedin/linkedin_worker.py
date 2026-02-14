import asyncio
import os
import json
import psycopg2
from playwright.async_api import async_playwright, Page, Browser
from cryptography.fernet import Fernet
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.human_emulator import HumanEmulator
from shared.warmup_scheduler import WarmupScheduler

class LinkedInWorker:
    def __init__(self, database_url: str):
        self.database_url = database_url
        self.browser: Browser = None
        self.emulator = HumanEmulator()
    
    async def init_browser(self, proxy_config=None):
        """Initialize Playwright browser with anti-detection measures"""
        playwright = await async_playwright().start()
        
        launch_options = {
            'headless': False,  # Set to True in production
            'args': [
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security'
            ]
        }
        
        if proxy_config:
            launch_options['proxy'] = {
                'server': f"{proxy_config['ip']}:{proxy_config['port']}",
                'username': proxy_config.get('username'),
                'password': proxy_config.get('password')
            }
        
        self.browser = await playwright.chromium.launch(**launch_options)
        return self.browser
    
    async def login(self, page: Page, username: str, password: str):
        """Login to LinkedIn with human-like behavior"""
        try:
            print(f"🔐 Logging in as {username}...")
            await page.goto('https://www.linkedin.com/login', wait_until='domcontentloaded')
            await self.emulator.random_delay(2, 4)
            
            # Type username
            await self.emulator.human_type(page, '#username', username)
            await self.emulator.random_delay(1, 2)
            
            # Type password
            await self.emulator.human_type(page, '#password', password)
            await self.emulator.random_delay(1, 2)
            
            # Click login
            await page.click('button[type="submit"]')
            await page.wait_for_load_state('networkidle', timeout=30000)
            
            # Check for CAPTCHA or security challenge
            if 'checkpoint' in page.url or 'challenge' in page.url:
                print("⚠️ Security challenge detected! Manual intervention required.")
                return False
            
            # Save cookies for future use
            cookies = await page.context.cookies()
            print("✅ Login successful")
            return cookies
            
        except Exception as e:
            print(f"❌ Login failed: {str(e)}")
            return False
    
    async def send_connection_request(self, page: Page, profile_url: str, note: str = None):
        """Send connection request with optional personalized note"""
        try:
            print(f"🔗 Visiting profile: {profile_url}")
            await page.goto(profile_url, wait_until='domcontentloaded')
            await self.emulator.random_delay(3, 8)
            
            # Random scroll to mimic reading profile
            await self.emulator.random_scroll(page)
            await self.emulator.random_delay(2, 5)
            
            # Find and click Connect button
            connect_button = await page.query_selector('button:has-text("Connect"), button[aria-label*="Connect"]')
            
            if not connect_button:
                print("⚠️ Connect button not found - may already be connected")
                return 'ALREADY_CONNECTED'
            
            await connect_button.click()
            await asyncio.sleep(random.uniform(1, 2))
            
            # Check if note option appears
            add_note_button = await page.query_selector('button:has-text("Add a note")')
            
            if add_note_button and note:
                await add_note_button.click()
                await asyncio.sleep(random.uniform(0.5, 1))
                
                # Type personalized note
                note_textarea = await page.query_selector('textarea[name="message"]')
                if note_textarea:
                    await self.emulator.human_type(page, 'textarea[name="message"]', note)
                    await asyncio.sleep(random.uniform(1, 2))
            
            # Click Send
            send_button = await page.query_selector('button:has-text("Send"), button[aria-label*="Send"]')
            if send_button:
                await send_button.click()
                print("✅ Connection request sent successfully")
                return 'SUCCESS'
            
            return 'FAILED'
            
        except Exception as e:
            print(f"❌ Failed to send connection request: {str(e)}")
            return 'ERROR'
    
    async def scrape_sales_navigator(self, page: Page, search_url: str, limit: int = 50):
        """Scrape profiles from LinkedIn Sales Navigator search"""
        try:
            print(f"🔍 Scraping Sales Navigator: {search_url}")
            await page.goto(search_url, wait_until='domcontentloaded')
            await self.emulator.random_delay(3, 6)
            
            profiles = []
            
            # Scroll to load more results
            for _ in range(5):
                await self.emulator.random_scroll(page)
                await asyncio.sleep(random.uniform(2, 4))
            
            # Extract profile data
            profile_cards = await page.query_selector_all('.artdeco-list__item')
            
            for card in profile_cards[:limit]:
                try:
                    name_elem = await card.query_selector('.artdeco-entity-lockup__title')
                    title_elem = await card.query_selector('.artdeco-entity-lockup__subtitle')
                    link_elem = await card.query_selector('a[href*="/sales/lead/"]')
                    
                    if name_elem and link_elem:
                        name = await name_elem.inner_text()
                        title = await title_elem.inner_text() if title_elem else ''
                        profile_url = await link_elem.get_attribute('href')
                        
                        profiles.append({
                            'name': name.strip(),
                            'title': title.strip(),
                            'profile_url': profile_url
                        })
                
                except Exception as e:
                    continue
            
            print(f"✅ Scraped {len(profiles)} profiles")
            return profiles
            
        except Exception as e:
            print(f"❌ Scraping failed: {str(e)}")
            return []
    
    async def process_campaign(self, campaign_id: str):
        """Process a LinkedIn campaign - main worker function"""
        conn = psycopg2.connect(self.database_url)
        cursor = conn.cursor()
        
        try:
            # Get campaign details
            cursor.execute("""
                SELECT c.*, sa.username, sa.encrypted_credentials, sa.warmup_day, 
                       sa.daily_action_count, sa.proxy_ip, sa.proxy_port
                FROM campaigns c
                JOIN social_accounts sa ON c.social_account_id = sa.id
                WHERE c.id = %s AND c.status = 'active'
            """, (campaign_id,))
            
            campaign = cursor.fetchone()
            if not campaign:
                print("❌ Campaign not found or inactive")
                return
            
            # Initialize browser with proxy
            proxy_config = {
                'ip': campaign[11],
                'port': campaign[12]
            } if campaign[11] else None
            
            await self.init_browser(proxy_config)
            context = await self.browser.new_context(
                user_agent=self.emulator.get_random_user_agent()
            )
            page = await context.new_page()
            
            # Login
            # Decrypt credentials here (simplified)
            username = campaign[7]
            password = "decrypted_password"  # Implement decryption
            
            cookies = await self.login(page, username, password)
            if not cookies:
                print("❌ Login failed, aborting campaign")
                return
            
            # Check warmup limits
            warmup_day = campaign[9]
            daily_count = campaign[10]
            
            if not WarmupScheduler.should_perform_action(daily_count, 'connect', warmup_day):
                print(f"⚠️ Daily limit reached for warmup day {warmup_day}")
                return
            
            # Scrape or get leads
            # Implementation continues...
            
            print("✅ Campaign processing complete")
            
        except Exception as e:
            print(f"❌ Campaign processing error: {str(e)}")
        finally:
            if self.browser:
                await self.browser.close()
            cursor.close()
            conn.close()

# Worker entry point
if __name__ == "__main__":
    import random
    DATABASE_URL = os.getenv('DATABASE_URL')
    worker = LinkedInWorker(DATABASE_URL)
    
    # This would be called by BullMQ worker
    # asyncio.run(worker.process_campaign('campaign-id'))
