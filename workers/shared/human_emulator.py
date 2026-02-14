import random
import time
import asyncio
from playwright.async_api import Page

class HumanEmulator:
    """Utility class to emulate human-like behavior in browser automation"""
    
    @staticmethod
    async def random_delay(min_seconds=30, max_seconds=120):
        """
        Random delay with Gaussian distribution to mimic human behavior
        """
        # Use Gaussian distribution centered around the middle
        mean = (min_seconds + max_seconds) / 2
        std_dev = (max_seconds - min_seconds) / 6  # 99.7% within range
        delay = random.gauss(mean, std_dev)
        delay = max(min_seconds, min(max_seconds, delay))  # Clamp to range
        
        print(f"⏳ Waiting {delay:.2f} seconds...")
        await asyncio.sleep(delay)
    
    @staticmethod
    async def human_type(page: Page, selector: str, text: str):
        """
        Type text with variable speed and occasional typos
        """
        element = await page.query_selector(selector)
        if not element:
            return False
        
        await element.click()
        await asyncio.sleep(random.uniform(0.3, 0.8))
        
        for char in text:
            await element.type(char, delay=random.randint(50, 200))
            
            # 3% chance of typo followed by correction
            if random.random() < 0.03:
                wrong_char = random.choice('abcdefghijklmnopqrstuvwxyz')
                await element.type(wrong_char, delay=random.randint(50, 150))
                await asyncio.sleep(random.uniform(0.2, 0.5))
                await page.keyboard.press('Backspace')
                await asyncio.sleep(random.uniform(0.1, 0.3))
        
        return True
    
    @staticmethod
    async def random_scroll(page: Page):
        """
        Perform natural scrolling patterns
        """
        scroll_count = random.randint(2, 5)
        for _ in range(scroll_count):
            scroll_amount = random.randint(200, 600)
            await page.evaluate(f'window.scrollBy(0, {scroll_amount})')
            await asyncio.sleep(random.uniform(0.5, 1.5))
        
        # Sometimes scroll back up
        if random.random() < 0.3:
            await page.evaluate(f'window.scrollBy(0, -{random.randint(100, 300)})')
            await asyncio.sleep(random.uniform(0.3, 0.8))
    
    @staticmethod
    async def mouse_movement(page: Page, x: int, y: int):
        """
        Move mouse in a Bezier curve path (simulated)
        """
        # Simple implementation - move in steps
        current_x, current_y = 0, 0
        steps = random.randint(5, 10)
        
        for i in range(steps):
            progress = (i + 1) / steps
            next_x = int(current_x + (x - current_x) * progress)
            next_y = int(current_y + (y - current_y) * progress)
            
            await page.mouse.move(next_x, next_y)
            await asyncio.sleep(random.uniform(0.01, 0.03))
    
    @staticmethod
    def get_random_user_agent():
        """
        Return a random realistic user agent
        """
        user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
        ]
        return random.choice(user_agents)
