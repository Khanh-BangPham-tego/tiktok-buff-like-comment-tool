/**
 * Utility functions for the TikTok bot
 */

export class Utils {
  /**
   * Delay execution for specified milliseconds
   */
  static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate random delay between min and max milliseconds
   */
  static async humanLikeDelay(min: number = 100, max: number = 500): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await this.delay(delay);
  }

  /**
   * Generate random string of specified length
   */
  static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Get random user agent
   */
  static getRandomUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36'
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  /**
   * Get random viewport configuration
   */
  static getRandomViewport() {
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
      { width: 1536, height: 864 },
      { width: 1280, height: 720 },
      { width: 1600, height: 900 },
      { width: 1024, height: 768 }
    ];
    return viewports[Math.floor(Math.random() * viewports.length)];
  }

  /**
   * Get random timezone
   */
  static getRandomTimezone(): string {
    const timezones = [
      'America/New_York',
      'America/Los_Angeles',
      'America/Chicago',
      'Europe/London',
      'Europe/Paris',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Australia/Sydney'
    ];
    return timezones[Math.floor(Math.random() * timezones.length)];
  }

  /**
   * Get random locale
   */
  static getRandomLocale(): string {
    const locales = [
      'en-US',
      // 'en-GB',
      // 'en-CA',
      // 'en-AU',
      // 'fr-FR',
      // 'de-DE',
      // 'es-ES',
      // 'it-IT',
      // 'pt-BR',
      // 'ja-JP',
      // 'ko-KR',
      // 'zh-CN'
    ];
    return locales[Math.floor(Math.random() * locales.length)];
  }

  /**
   * Generate random delay for user behavior simulation
   */
  static async randomUserDelay(): Promise<void> {
    const delays = [2000, 3000, 4000, 5000, 6000, 7000, 8000];
    const randomDelay = delays[Math.floor(Math.random() * delays.length)];
    console.log(`⏳ Random delay: ${randomDelay}ms`);
    await this.delay(randomDelay);
  }

  /**
   * Generate long random delay
   */
  static async longRandomDelay(): Promise<void> {
    const delays = [60, 90, 120, 15, 10]; // 1-3 phút
    const randomDelay = delays[Math.floor(Math.random() * delays.length)];
    console.log(`⏳ Long random delay: ${Math.floor(randomDelay/1000)} giây`);
    await this.delay(randomDelay);
  }
}

