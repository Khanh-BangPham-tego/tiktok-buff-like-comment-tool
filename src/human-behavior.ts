import { Page } from 'puppeteer';
import { Utils } from './utils';

/**
 * Simulates human-like behavior patterns
 */
export class HumanBehavior {
  /**
   * Human-like typing with random delays
   */
  static async humanLikeType(page: Page, selector: string, text: string): Promise<void> {
    await page.focus(selector);
    await Utils.humanLikeDelay(200, 400);
    
    // Clear field first
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await Utils.humanLikeDelay(100, 200);
    
    // Type each character with random speed
    for (const char of text) {
      await page.keyboard.type(char);
      await Utils.humanLikeDelay(50, 150);
    }
    
    await Utils.humanLikeDelay(200, 400);
  }

  /**
   * Human-like clicking with hover and delay
   */
  static async humanLikeClick(page: Page, selector: string): Promise<void> {
    // Hover before clicking
    await page.hover(selector);
    await Utils.humanLikeDelay(200, 400);
    
    // Click with random delay
    await page.click(selector);
    await Utils.humanLikeDelay(300, 600);
  }

  /**
   * Human-like scrolling with multiple steps
   */
  static async humanLikeScroll(page: Page, direction: 'up' | 'down' = 'down', distance: number = 300): Promise<void> {
    const steps = Math.floor(Math.random() * 5) + 3; // 3-7 steps
    const stepDistance = distance / steps;
    
    for (let i = 0; i < steps; i++) {
      await page.mouse.wheel({ deltaY: direction === 'down' ? stepDistance : -stepDistance });
      await Utils.humanLikeDelay(100, 300);
    }
  }

  /**
   * Simulate random human behavior patterns
   */
  static async simulateHumanBehavior(page: Page): Promise<void> {
    console.log('🤖 Mô phỏng hành vi user thật...');
    
    // Random scroll behavior
    const scrollCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < scrollCount; i++) {
      const scrollDirection = Math.random() > 0.5 ? 'down' : 'up';
      const scrollDistance = Math.floor(Math.random() * 300) + 100;
      await this.humanLikeScroll(page, scrollDirection, scrollDistance);
      await Utils.delay(Math.random() * 1000 + 500);
    }
    
    // Random mouse hover over elements
    const hoverElements = await page.$$('button, a, input, div[role="button"]');
    if (hoverElements.length > 0) {
      const randomElement = hoverElements[Math.floor(Math.random() * hoverElements.length)];
      try {
        await randomElement.hover();
        await Utils.delay(Math.random() * 500 + 200);
      } catch (e) {
        // Ignore hover errors
      }
    }
    
    // Random page interaction
    const interactionType = Math.floor(Math.random() * 3);
    switch (interactionType) {
      case 0:
        // Random mouse wheel
        await page.mouse.wheel({ deltaY: Math.random() * 200 - 100 });
        break;
      case 1:
        // Random keyboard press
        await page.keyboard.press('Tab');
        break;
      case 2:
        // Random mouse wheel
        await page.mouse.wheel({ deltaY: Math.random() * 200 - 100 });
        break;
    }
    
    await Utils.delay(Math.random() * 1000 + 500);
  }

  /**
   * Random typing behavior
   */
  static async randomTypingBehavior(page: Page): Promise<void> {
    // Random focus on input fields
    const inputs = await page.$$('input[type="text"], input[type="email"], input[type="password"]');
    if (inputs.length > 0) {
      const randomInput = inputs[Math.floor(Math.random() * inputs.length)];
      try {
        await randomInput.focus();
        await Utils.delay(Math.random() * 500 + 200);
        
        // Random backspace/delete
        if (Math.random() > 0.7) {
          await page.keyboard.press('Backspace');
          await Utils.delay(Math.random() * 200 + 100);
        }
      } catch (e) {
        // Ignore focus errors
      }
    }
  }

  /**
   * Random mouse movement with natural patterns
   */
  static async randomMouseMovement(page: Page): Promise<void> {
    const movements = Math.floor(Math.random() * 5) + 3; // 3-7 movements
    
    for (let i = 0; i < movements; i++) {
      // Create bezier curve path for natural movement
      const startX = Math.random() * 800;
      const startY = Math.random() * 600;
      const endX = Math.random() * 800;
      const endY = Math.random() * 600;
      
      const steps = 20;
      for (let j = 0; j <= steps; j++) {
        const t = j / steps;
        // Bezier curve with control points
        const controlX1 = startX + (endX - startX) * 0.3 + Math.sin(t * Math.PI) * 50;
        const controlY1 = startY + (endY - startY) * 0.3 + Math.cos(t * Math.PI) * 30;
        const controlX2 = startX + (endX - startX) * 0.7 + Math.sin(t * Math.PI) * 30;
        const controlY2 = startY + (endY - startY) * 0.7 + Math.cos(t * Math.PI) * 40;
        
        // Cubic bezier curve
        const x = Math.pow(1-t, 3) * startX + 
                  3 * Math.pow(1-t, 2) * t * controlX1 + 
                  3 * (1-t) * Math.pow(t, 2) * controlX2 + 
                  Math.pow(t, 3) * endX;
        const y = Math.pow(1-t, 3) * startY + 
                  3 * Math.pow(1-t, 2) * t * controlY1 + 
                  3 * (1-t) * Math.pow(t, 2) * controlY2 + 
                  Math.pow(t, 3) * endY;
        
        await page.mouse.move(x, y);
        await Utils.delay(Math.random() * 50 + 20);
      }
      
      // Random pause between movements
      await Utils.delay(Math.random() * 500 + 200);
    }
  }
}

