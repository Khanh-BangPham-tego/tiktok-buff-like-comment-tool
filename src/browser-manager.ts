import puppeteer, { Browser, Page, BrowserContext } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { Utils } from './utils';
import { BrowserConfig } from './interfaces';

/**
 * Manages browser operations and configurations
 */
export class BrowserManager {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private incognitoContext: BrowserContext | null = null;

  /**
   * Initialize browser with basic configuration
   */
  async init(): Promise<void> {
    console.log('🚀 Khởi tạo browser như user thật...');
    this.browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      ignoreDefaultArgs: ['--enable-automation'],
      args: [
        '--incognito',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--no-zygote',
        '--mute-audio',
        '--disable-extensions',
        '--disable-infobars',
        '--window-size=1366,768',
      ],
    });
    
    this.page = (await this.browser.pages())[0];
    await this.setupPage();
    console.log('✅ Browser đã được khởi tạo như user thật');
  }

  /**
   * Setup page with anti-detection measures
   */
  private async setupPage(): Promise<void> {
    if (!this.page) return;

    // Set user agent
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Hide automation signs
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
      
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission } as any) :
          originalQuery(parameters)
      );
    });
    
    // Set viewport
    await this.page.setViewport({
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: true,
      isMobile: false,
    });
    
    // Set headers
    await this.page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    });
  }

  /**
   * Create fresh browser with random fingerprint
   */
  async createFreshBrowser(useRealChrome: boolean = false): Promise<void> {
    console.log('🆕 Tạo browser profile hoàn toàn mới với fingerprint ngẫu nhiên...');
    
    // Close existing browser
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
    
    // Create new user data directory
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const userDataDir = `./browser-profiles/profile-${timestamp}-${randomId}`;
    
    // Create directory if not exists
    if (!fs.existsSync('./browser-profiles')) {
      fs.mkdirSync('./browser-profiles', { recursive: true });
    }
    
    // Get random values
    const randomUserAgent = Utils.getRandomUserAgent();
    const randomViewport = Utils.getRandomViewport();
    const randomTimezone = Utils.getRandomTimezone();
    const randomLocale = Utils.getRandomLocale();
    
    console.log(`🎲 Random User Agent: ${randomUserAgent}`);
    console.log(`🎲 Random Viewport: ${randomViewport.width}x${randomViewport.height}`);
    console.log(`🎲 Random Timezone: ${randomTimezone}`);
    console.log(`🎲 Random Locale: ${randomLocale}`);
    
    // Launch options
    const launchOptions: any = {
      headless: true,
      ignoreDefaultArgs: ['--enable-automation'],
      defaultViewport: null,
      userDataDir: userDataDir,
      args: [
        '--incognito',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--mute-audio',
        '--disable-extensions',
        '--disable-infobars',
        '--window-size=1366,768',
        '--disable-accelerated-2d-canvas',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=VizDisplayCompositor',
        '--disable-web-security',
        '--disable-features=TranslateUI',
      ]
    };
    
    // Add Chrome executable if using real Chrome
    if (useRealChrome) {
      const chromeExecutable = this.findChromeExecutable();
      if (chromeExecutable) {
        launchOptions.executablePath = chromeExecutable;
        console.log('🚀 Sử dụng Chrome thật từ máy');
      } else {
        console.log('⚠️ Không tìm thấy Chrome, sử dụng Chromium mặc định');
      }
    }
    
    this.browser = await puppeteer.launch(launchOptions);
    this.page = (await this.browser.pages())[0];
    
    // Setup page with random fingerprint
    await this.setupRandomFingerprint(randomUserAgent, randomLocale, randomTimezone, randomViewport);
    
    console.log('✅ Browser profile mới với fingerprint ngẫu nhiên đã được tạo!');
  }

  /**
   * Setup random fingerprint for anti-detection
   */
  private async setupRandomFingerprint(userAgent: string, locale: string, timezone: string, viewport: any): Promise<void> {
    if (!this.page) return;

    await this.page.setUserAgent(userAgent);
    
    await this.page.evaluateOnNewDocument((ua, locale, timezone, viewport) => {
      // Hide webdriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      // Random plugins
      const pluginCount = Math.floor(Math.random() * 5) + 3;
      Object.defineProperty(navigator, 'plugins', {
        get: () => Array.from({ length: pluginCount }, (_, i) => ({ name: `Plugin ${i + 1}` })),
      });
      
      // Languages
      Object.defineProperty(navigator, 'languages', {
        get: () => [locale, locale.split('-')[0]],
      });
      
      // Timezone
      Object.defineProperty(Intl.DateTimeFormat.prototype, 'resolvedOptions', {
        value: () => ({ timeZone: timezone }),
      });
      
      // Screen resolution
      Object.defineProperty(screen, 'width', {
        get: () => viewport.width,
      });
      Object.defineProperty(screen, 'height', {
        get: () => viewport.height,
      });
      
      // Device memory
      Object.defineProperty(navigator, 'deviceMemory', {
        get: () => Math.floor(Math.random() * 8) + 4,
      });
      
      // Hardware concurrency
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => Math.floor(Math.random() * 8) + 4,
      });
      
      // Battery API
      Object.defineProperty(navigator, 'getBattery', {
        get: () => () => Promise.resolve({
          charging: Math.random() > 0.5,
          chargingTime: Math.random() * 3600,
          dischargingTime: Math.random() * 7200 + 3600,
          level: Math.random() * 0.5 + 0.3
        })
      });
      
      // WebGL fingerprint
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) {
          const vendors = ['Intel Inc.', 'NVIDIA Corporation', 'AMD', 'Apple Inc.'];
          return vendors[Math.floor(Math.random() * vendors.length)];
        }
        if (parameter === 37446) {
          const renderers = ['Intel Iris OpenGL Engine', 'NVIDIA GeForce GTX 1060', 'AMD Radeon RX 580', 'Apple M1 GPU'];
          return renderers[Math.floor(Math.random() * renderers.length)];
        }
        return getParameter.call(this, parameter);
      };
      
      // Chrome runtime
      Object.defineProperty(window, 'chrome', {
        get: () => ({
          runtime: {
            onConnect: undefined,
            onMessage: undefined
          }
        })
      });
      
    }, userAgent, locale, timezone, viewport);
    
    // Set viewport
    await this.page.setViewport({
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: Math.random() * 0.5 + 1,
      hasTouch: false,
      isLandscape: true,
      isMobile: false,
    });
    
    // Set headers
    await this.page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': `${locale},${locale.split('-')[0]};q=0.9`,
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0'
    });
  }

  /**
   * Find Chrome executable on the system
   */
  private findChromeExecutable(): string | undefined {
    const possiblePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(process.env.PROGRAMFILES || '', 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(process.env['PROGRAMFILES(X86)'] || '', 'Google\\Chrome\\Application\\chrome.exe'),
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome Canary',
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome-beta',
      '/usr/bin/google-chrome-unstable',
      '/opt/google/chrome/chrome',
      '/opt/google/chrome/google-chrome',
      '/snap/bin/chromium',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser'
    ];

    for (const chromePath of possiblePaths) {
      if (fs.existsSync(chromePath)) {
        console.log(`✅ Tìm thấy Chrome tại: ${chromePath}`);
        return chromePath;
      }
    }
    
    console.log('⚠️ Không tìm thấy Chrome, sử dụng Chromium mặc định');
    return undefined;
  }

  /**
   * Create persistent session
   */
  async createPersistentSession(): Promise<void> {
    if (!this.page) throw new Error('Page chưa được khởi tạo');
    
    console.log('🔐 Tạo session persistent...');
    
    // Only set cookies, localStorage will be set after navigation
    await this.page.setCookie({
      name: 'sessionid',
      value: Utils.generateRandomString(32),
      domain: '.tiktok.com',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Lax'
    });
    
    console.log('✅ Session persistent đã được tạo');
  }

  /**
   * Set localStorage after navigation
   */
  async setLocalStorage(): Promise<void> {
    if (!this.page) throw new Error('Page chưa được khởi tạo');
    
    try {
      await this.page.evaluate(() => {
        localStorage.setItem('user_preferences', JSON.stringify({
          theme: 'light',
          language: 'en',
          notifications: true
        }));
        
        sessionStorage.setItem('session_data', JSON.stringify({
          timestamp: Date.now(),
          user_agent: navigator.userAgent,
          screen_resolution: `${screen.width}x${screen.height}`
        }));
      });
      console.log('✅ Đã set localStorage và sessionStorage');
    } catch (error) {
      console.log('⚠️ Không thể set localStorage:', error);
    }
  }

  /**
   * Reset browser to clean state
   */
  async resetBrowser(): Promise<void> {
    if (!this.page) throw new Error('Page chưa được khởi tạo');
    
    console.log('🔄 Đang reset browser về trạng thái mới tinh...');
    
    try {
      await this.page.deleteCookie(...(await this.page.cookies()));
      console.log('✅ Đã xóa tất cả cookies');
      
      await this.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      console.log('✅ Đã xóa localStorage và sessionStorage');
      
      await this.page.evaluate(() => {
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              caches.delete(name);
            });
          });
        }
      });
      console.log('✅ Đã xóa cache');
      
      await this.page.evaluate(() => {
        if ('indexedDB' in window) {
          indexedDB.databases().then(databases => {
            databases.forEach(db => {
              if (db.name) {
                indexedDB.deleteDatabase(db.name);
              }
            });
          });
        }
      });
      console.log('✅ Đã xóa IndexedDB');
      
      await this.page.reload({ waitUntil: 'networkidle0' });
      console.log('✅ Đã reload page');
      
      await Utils.delay(2000);
      console.log('🎉 Browser đã được reset về trạng thái mới tinh!');
      
    } catch (error) {
      console.error('❌ Lỗi khi reset browser:', error);
      throw error;
    }
  }

  /**
   * Cleanup old browser profiles
   */
  async cleanupOldProfiles(): Promise<void> {
    console.log('🧹 Đang xóa browser profiles cũ...');
    
    try {
      const profilesDir = './browser-profiles';
      if (fs.existsSync(profilesDir)) {
        const files = fs.readdirSync(profilesDir);
        files.forEach((file: string) => {
          const filePath = path.join(profilesDir, file);
          if (fs.statSync(filePath).isDirectory()) {
            fs.rmSync(filePath, { recursive: true, force: true });
            console.log(`✅ Đã xóa profile: ${file}`);
          }
        });
      }
      
      console.log('✅ Đã xóa tất cả browser profiles cũ!');
    } catch (error) {
      console.error('❌ Lỗi khi xóa profiles cũ:', error);
    }
  }

  /**
   * Create completely fresh browser with cleanup
   */
  async createCompletelyFreshBrowser(useRealChrome: boolean = false): Promise<void> {
    console.log('🆕 Tạo browser profile hoàn toàn mới với cleanup trước...');
    
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
    
    await this.cleanupOldProfiles();
    await Utils.delay(2000);
    await this.createFreshBrowser(useRealChrome);
  }

  /**
   * Navigate to URL
   */
  async navigateTo(url: string): Promise<void> {
    if (!this.page) throw new Error('Page chưa được khởi tạo');
    
    console.log(`🌐 Đang truy cập: ${url}`);
    
    try {
      await this.page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      console.log('✅ Đã truy cập thành công');
    } catch (error) {
      console.error('❌ Lỗi khi truy cập:', error);
      throw error;
    }
  }

  /**
   * Debug current page
   */
  async debugPage(): Promise<void> {
    if (!this.page) return;
    
    console.log('🔍 Debug: Lấy thông tin về page hiện tại...');
    
    try {
      const url = await this.page.url();
      console.log(`📍 URL hiện tại: ${url}`);
      
      const title = await this.page.title();
      console.log(`📄 Title: ${title}`);
      
    } catch (error) {
      console.error('❌ Lỗi khi debug page:', error);
    }
  }

  /**
   * Get current page
   */
  getPage(): Page | null {
    return this.page;
  }

  /**
   * Get current browser
   */
  getBrowser(): Browser | null {
    return this.browser;
  }

  /**
   * Close browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      if (this.incognitoContext) {
        try {
          await this.incognitoContext.close();
        } catch {}
        this.incognitoContext = null;
      }
      await this.browser.close();
      console.log('🔒 Browser đã được đóng');
    }
  }
}
