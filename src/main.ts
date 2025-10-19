import puppeteer, { Browser, Page, BrowserContext } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

interface Account {
  username: string;
  password: string;
}

class TikTokLoginBot {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private incognitoContext: BrowserContext | null = null;
  async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Mô phỏng hành vi user thật
  async humanLikeDelay(min: number = 100, max: number = 500): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await this.delay(delay);
  }

  // Mô phỏng typing như user thật
  async humanLikeType(selector: string, text: string): Promise<void> {
    if (!this.page) throw new Error('Page chưa được khởi tạo');
    
    await this.page.focus(selector);
    await this.humanLikeDelay(200, 400);
    
    // Clear field trước
    await this.page.keyboard.down('Control');
    await this.page.keyboard.press('KeyA');
    await this.page.keyboard.up('Control');
    await this.humanLikeDelay(100, 200);
    
    // Type từng ký tự với tốc độ ngẫu nhiên
    for (const char of text) {
      await this.page.keyboard.type(char);
      await this.humanLikeDelay(50, 150);
    }
    
    await this.humanLikeDelay(200, 400);
  }

  // Mô phỏng mouse movement như user thật
  async humanLikeClick(selector: string): Promise<void> {
    if (!this.page) throw new Error('Page chưa được khởi tạo');
    
    // Hover trước khi click
    await this.page.hover(selector);
    await this.humanLikeDelay(200, 400);
    
    // Click với random delay
    await this.page.click(selector);
    await this.humanLikeDelay(300, 600);
  }

  // Mô phỏng scroll như user thật
  async humanLikeScroll(direction: 'up' | 'down' = 'down', distance: number = 300): Promise<void> {
    if (!this.page) throw new Error('Page chưa được khởi tạo');
    
    const steps = Math.floor(Math.random() * 5) + 3; // 3-7 steps
    const stepDistance = distance / steps;
    
    for (let i = 0; i < steps; i++) {
      await this.page.mouse.wheel({ deltaY: direction === 'down' ? stepDistance : -stepDistance });
      await this.humanLikeDelay(100, 300);
    }
  }

  async debugPage(): Promise<void> {
    if (!this.page) return;
    
    console.log('🔍 Debug: Lấy thông tin về page hiện tại...');
    
    try {
      // Lấy URL hiện tại
      const url = await this.page.url();
      console.log(`📍 URL hiện tại: ${url}`);
      
      // Lấy title
      const title = await this.page.title();
      console.log(`📄 Title: ${title}`);
      
    } catch (error) {
      console.error('❌ Lỗi khi debug page:', error);
    }
  }

  async init(): Promise<void> {
    console.log('🚀 Khởi tạo browser như user thật...');
    this.browser = await puppeteer.launch({
      headless: false, // Hiển thị browser để debug
      defaultViewport: null,
      args: [
        '--incognito', // Mở browser ở chế độ ẩn danh
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=VizDisplayCompositor',
        '--disable-web-security',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        '--disable-client-side-phishing-detection',
        '--disable-sync',
        '--disable-default-apps',
        '--disable-extensions-except',
        '--disable-plugins-discovery',
        '--disable-preconnect',
        '--disable-hang-monitor',
        '--disable-prompt-on-repost',
        '--disable-domain-reliability',
        '--disable-component-extensions-with-background-pages',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--no-default-browser-check',
        '--no-pings',
        '--password-store=basic',
        '--use-mock-keychain',
        '--disable-component-update',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-sync',
        '--metrics-recording-only',
        '--no-first-run',
        '--safebrowsing-disable-auto-update',
        '--enable-automation',
        '--disable-automation',
        '--disable-blink-features=AutomationControlled',
        '--exclude-switches=enable-automation',
        '--disable-extensions-except',
        '--disable-plugins-discovery',
        '--disable-preconnect',
        '--disable-hang-monitor',
        '--disable-prompt-on-repost',
        '--disable-domain-reliability',
        '--disable-component-extensions-with-background-pages',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--no-default-browser-check',
        '--no-pings',
        '--password-store=basic',
        '--use-mock-keychain',
        '--disable-component-update',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-sync',
        '--metrics-recording-only',
        '--no-first-run',
        '--safebrowsing-disable-auto-update',
        '--enable-automation',
        '--disable-automation',
        '--disable-blink-features=AutomationControlled',
        '--exclude-switches=enable-automation'
      ]
    });
    
    // this.page = await this.browser.newPage();
    this.page = (await this.browser.pages())[0];
    // Set user agent thật để tránh bị phát hiện là bot
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Ẩn dấu hiệu automation
    await this.page.evaluateOnNewDocument(() => {
      // Xóa webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      // Override plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      
      // Override languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
      
      // Override permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission } as any) :
          originalQuery(parameters)
      );
    });
    
    // Set viewport như user thật
    await this.page.setViewport({
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
      hasTouch: false,
      isLandscape: true,
      isMobile: false,
    });
    
    // Set extra headers
    await this.page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    });
    
    // Thêm random mouse movement để giống user thật
    await this.page.evaluateOnNewDocument(() => {
      // Random mouse movement
      setInterval(() => {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const event = new MouseEvent('mousemove', {
          clientX: x,
          clientY: y,
        });
        document.dispatchEvent(event);
      }, Math.random() * 10000 + 5000); // 5-15 seconds
    });

    console.log('✅ Browser đã được khởi tạo như user thật');
  }

  // Tạo session persistent
  async createPersistentSession(): Promise<void> {
    if (!this.page) throw new Error('Page chưa được khởi tạo');
    
    console.log('🔐 Tạo session persistent...');
    
    // Set cookies để giống user thật
    await this.page.setCookie({
      name: 'sessionid',
      value: this.generateRandomString(32),
      domain: '.tiktok.com',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Lax'
    });
    
    // Set local storage
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
    
    console.log('✅ Session persistent đã được tạo');
  }

  // Tạo random string
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Reset browser về trạng thái mới tinh
  async resetBrowser(): Promise<void> {
    if (!this.page) throw new Error('Page chưa được khởi tạo');
    
    console.log('🔄 Đang reset browser về trạng thái mới tinh...');
    
    try {
      // Xóa tất cả cookies
      await this.page.deleteCookie(...(await this.page.cookies()));
      console.log('✅ Đã xóa tất cả cookies');
      
      // Xóa localStorage
      await this.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      console.log('✅ Đã xóa localStorage và sessionStorage');
      
      // Xóa cache và history
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
      
      // Xóa IndexedDB
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
      
      // Reload page để áp dụng thay đổi
      await this.page.reload({ waitUntil: 'networkidle0' });
      console.log('✅ Đã reload page');
      
      // Đợi một chút để đảm bảo reset hoàn tất
      await this.delay(2000);
      
      console.log('🎉 Browser đã được reset về trạng thái mới tinh!');
      
    } catch (error) {
      console.error('❌ Lỗi khi reset browser:', error);
      throw error;
    }
  }

  // Tạo random user agent
  private getRandomUserAgent(): string {
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

  // Tạo random viewport
  private getRandomViewport() {
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

  // Tạo random timezone
  private getRandomTimezone(): string {
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

  // Tạo random locale
  private getRandomLocale(): string {
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


  // Tìm Chrome executable trên máy
  private findChromeExecutable(): string | undefined {
    const possiblePaths = [
      // Windows paths
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(process.env.PROGRAMFILES || '', 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(process.env['PROGRAMFILES(X86)'] || '', 'Google\\Chrome\\Application\\chrome.exe'),
      // Mac paths
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome Canary',
      // Linux paths
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

  

  // Tạo browser profile hoàn toàn mới với fingerprint ngẫu nhiên
  async createFreshBrowser(useRealChrome: boolean = false): Promise<void> {
    if (useRealChrome) {
      console.log('🆕 Tạo browser profile hoàn toàn mới với Chrome thật...');
    } else {
      console.log('🆕 Tạo browser profile hoàn toàn mới với fingerprint ngẫu nhiên...');
    }
    
    console.log('🌐 Sử dụng IP thật (không dùng proxy)');
    
    // Đóng browser cũ nếu có
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
    
    // Tạo user data dir mới với timestamp và random
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const userDataDir = `./browser-profiles/profile-${timestamp}-${randomId}`;
    
    // Tạo thư mục nếu chưa có
    const fs = require('fs');
    const path = require('path');
    if (!fs.existsSync('./browser-profiles')) {
      fs.mkdirSync('./browser-profiles', { recursive: true });
    }
    
    // Lấy random values
    const randomUserAgent = this.getRandomUserAgent();
    const randomViewport = this.getRandomViewport();
    const randomTimezone = this.getRandomTimezone();
    const randomLocale = this.getRandomLocale();
    
    console.log(`🎲 Random User Agent: ${randomUserAgent}`);
    console.log(`🎲 Random Viewport: ${randomViewport.width}x${randomViewport.height}`);
    console.log(`🎲 Random Timezone: ${randomTimezone}`);
    console.log(`🎲 Random Locale: ${randomLocale}`);
    console.log('🌐 Sử dụng IP thật (không dùng proxy)');
    
    // Tạo args array
    const args = [
      '--incognito', // Mở browser ở chế độ ẩn danh
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=VizDisplayCompositor',
      '--disable-web-security',
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
      '--disable-client-side-phishing-detection',
      '--disable-sync',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-sync',
      '--metrics-recording-only',
      '--no-first-run',
      '--safebrowsing-disable-auto-update',
      '--disable-blink-features=AutomationControlled',
      '--exclude-switches=enable-automation',
      `--lang=${randomLocale}`,
      `--timezone=${randomTimezone}`,
      // Thêm các args để tránh detection
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection',
      '--no-default-browser-check',
      '--no-pings',
      '--password-store=basic',
      '--use-mock-keychain',
      '--disable-component-update',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-sync',
      '--metrics-recording-only',
      '--no-first-run',
      '--safebrowsing-disable-auto-update',
      '--disable-blink-features=AutomationControlled',
      '--exclude-switches=enable-automation',
      // Thêm args để randomize fingerprint
      '--disable-features=VizDisplayCompositor',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu-sandbox',
      '--disable-software-rasterizer',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection',
      '--no-default-browser-check',
      '--no-pings',
      '--password-store=basic',
      '--use-mock-keychain',
      '--disable-component-update',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-sync',
      '--metrics-recording-only',
      '--no-first-run',
      '--safebrowsing-disable-auto-update',
      '--disable-blink-features=AutomationControlled',
      '--exclude-switches=enable-automation'
    ];
    
    // Tìm Chrome executable nếu cần
    const chromeExecutable = useRealChrome ? this.findChromeExecutable() : undefined;
    
    // Launch options
    const launchOptions: any = {
      headless: false,
      ignoreDefaultArgs: true,
      defaultViewport: null,
      userDataDir: userDataDir, // Sử dụng profile mới
      args: args
    };
    
    // Thêm executablePath nếu sử dụng Chrome thật
    if (useRealChrome && chromeExecutable) {
      launchOptions.executablePath = chromeExecutable;
      console.log('🚀 Sử dụng Chrome thật từ máy');
    } else if (useRealChrome) {
      console.log('⚠️ Không tìm thấy Chrome, sử dụng Chromium mặc định');
    } else {
      console.log('🚀 Sử dụng Chromium mặc định');
    }
    
    this.browser = await puppeteer.launch(launchOptions);
    this.page = (await this.browser.pages())[0];
    // this.page = await this.browser.newPage();

    // Set random user agent
    await this.page.setUserAgent(randomUserAgent);
    
    // Ẩn dấu hiệu automation với random fingerprint
    await this.page.evaluateOnNewDocument((ua, locale, timezone, viewport) => {
      // Xóa webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      // Override plugins với random
      const pluginCount = Math.floor(Math.random() * 5) + 3; // 3-7 plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => Array.from({ length: pluginCount }, (_, i) => ({ name: `Plugin ${i + 1}` })),
      });
      
      // Override languages
      Object.defineProperty(navigator, 'languages', {
        get: () => [locale, locale.split('-')[0]],
      });
      
      // Override timezone
      Object.defineProperty(Intl.DateTimeFormat.prototype, 'resolvedOptions', {
        value: () => ({ timeZone: timezone }),
      });
      
      // Override screen resolution với giá trị thật
      Object.defineProperty(screen, 'width', {
        get: () => viewport.width,
      });
      Object.defineProperty(screen, 'height', {
        get: () => viewport.height,
      });
      
      // Override Device Memory API với random values
      Object.defineProperty(navigator, 'deviceMemory', {
        get: () => Math.floor(Math.random() * 8) + 4, // 4-12GB RAM
      });
      
      // Override Hardware Concurrency với random values
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => Math.floor(Math.random() * 8) + 4, // 4-12 cores
      });
      
      // Override Battery API với random values
      Object.defineProperty(navigator, 'getBattery', {
        get: () => () => Promise.resolve({
          charging: Math.random() > 0.5,
          chargingTime: Math.random() * 3600,
          dischargingTime: Math.random() * 7200 + 3600,
          level: Math.random() * 0.5 + 0.3
        })
      });
      
      // Override WebGL fingerprint với random values
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) { // UNMASKED_VENDOR_WEBGL
          const vendors = ['Intel Inc.', 'NVIDIA Corporation', 'AMD', 'Apple Inc.'];
          return vendors[Math.floor(Math.random() * vendors.length)];
        }
        if (parameter === 37446) { // UNMASKED_RENDERER_WEBGL
          const renderers = ['Intel Iris OpenGL Engine', 'NVIDIA GeForce GTX 1060', 'AMD Radeon RX 580', 'Apple M1 GPU'];
          return renderers[Math.floor(Math.random() * renderers.length)];
        }
        return getParameter.call(this, parameter);
      };
      
      // Override AudioContext fingerprint
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const originalCreateAnalyser = AudioContext.prototype.createAnalyser;
        AudioContext.prototype.createAnalyser = function() {
          const analyser = originalCreateAnalyser.call(this);
          const originalGetFloatFrequencyData = analyser.getFloatFrequencyData;
          analyser.getFloatFrequencyData = function(array) {
            originalGetFloatFrequencyData.call(this, array);
            // Thêm noise nhỏ để thay đổi fingerprint
            for (let i = 0; i < array.length; i++) {
              array[i] += (Math.random() - 0.5) * 0.0001;
            }
          };
          return analyser;
        };
      }
      
      // Override permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission } as any) :
          originalQuery(parameters)
      );
      
      // Override canvas fingerprint với pattern phức tạp hơn
      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function(type?: string, quality?: number) {
        const context = this.getContext('2d');
        if (context) {
          // Tạo pattern phức tạp hơn với random noise
          const imageData = context.createImageData(this.width, this.height);
          for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] = Math.floor(Math.random() * 255);     // R
            imageData.data[i + 1] = Math.floor(Math.random() * 255); // G  
            imageData.data[i + 2] = Math.floor(Math.random() * 255); // B
            imageData.data[i + 3] = 255; // A
          }
          context.putImageData(imageData, 0, 0);
        }
        return originalToDataURL.call(this, type, quality);
      };
      
      // Override Chrome runtime
      Object.defineProperty(window, 'chrome', {
        get: () => ({
          runtime: {
            onConnect: undefined,
            onMessage: undefined
          }
        })
      });
      
      // Override automation flags
      Object.defineProperty(navigator, 'permissions', {
        get: () => ({
          query: (parameters: any) => Promise.resolve({ state: 'granted' })
        })
      });
      
      // Override Connection API
      Object.defineProperty(navigator, 'connection', {
        get: () => ({
          effectiveType: '4g',
          rtt: Math.floor(Math.random() * 100) + 50,
          downlink: Math.random() * 10 + 1,
          saveData: false
        })
      });
      
      // Override Media Devices
      Object.defineProperty(navigator, 'mediaDevices', {
        get: () => ({
          enumerateDevices: () => Promise.resolve([
            { deviceId: 'default', kind: 'audioinput', label: 'Default - Microphone' },
            { deviceId: 'default', kind: 'audiooutput', label: 'Default - Speaker' },
            { deviceId: 'default', kind: 'videoinput', label: 'Default - Camera' }
          ])
        })
      });
      
    }, randomUserAgent, randomLocale, randomTimezone, randomViewport);
    
    // Set random viewport
    await this.page.setViewport({
      width: randomViewport.width,
      height: randomViewport.height,
      deviceScaleFactor: Math.random() * 0.5 + 1, // 1.0 - 1.5
      hasTouch: false,
      isLandscape: true,
      isMobile: false,
    });
    
    // Set random headers
    await this.page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': `${randomLocale},${randomLocale.split('-')[0]};q=0.9`,
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
    
    console.log('✅ Browser profile mới với fingerprint ngẫu nhiên và proxy support đã được tạo!');
  }

  // Thêm random delay để giống user thật
  async randomUserDelay(): Promise<void> {
    const delays = [2000, 3000, 4000, 5000, 6000, 7000, 8000];
    const randomDelay = delays[Math.floor(Math.random() * delays.length)];
    console.log(`⏳ Random delay: ${randomDelay}ms`);
    await this.delay(randomDelay);
  }

  // Thêm delay dài hơn giữa các lần thử
  async longRandomDelay(): Promise<void> {
    const delays = [60, 90, 120, 15, 10]; // 1-3 phút
    const randomDelay = delays[Math.floor(Math.random() * delays.length)];
    console.log(`⏳ Long random delay: ${Math.floor(randomDelay/1000)} giây`);
    await this.delay(randomDelay);
  }

  // Thêm human-like behavior patterns
  async simulateHumanBehavior(): Promise<void> {
    if (!this.page) return;
    
    console.log('🤖 Mô phỏng hành vi user thật...');
    
    // Random scroll behavior
    const scrollCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < scrollCount; i++) {
      const scrollDirection = Math.random() > 0.5 ? 'down' : 'up';
      const scrollDistance = Math.floor(Math.random() * 300) + 100;
      await this.humanLikeScroll(scrollDirection, scrollDistance);
      await this.delay(Math.random() * 1000 + 500);
    }
    
    // Random mouse hover over elements
    const hoverElements = await this.page.$$('button, a, input, div[role="button"]');
    if (hoverElements.length > 0) {
      const randomElement = hoverElements[Math.floor(Math.random() * hoverElements.length)];
      try {
        await randomElement.hover();
        await this.delay(Math.random() * 500 + 200);
      } catch (e) {
        // Ignore hover errors
      }
    }
    
    // Random page interaction
    const interactionType = Math.floor(Math.random() * 3);
    switch (interactionType) {
      case 0:
        // Random click on empty area
        // Random mouse wheel
        await this.page.mouse.wheel({ deltaY: Math.random() * 200 - 100 });
        break;
      case 1:
        // Random keyboard press
        await this.page.keyboard.press('Tab');
        break;
      case 2:
        // Random mouse wheel
        await this.page.mouse.wheel({ deltaY: Math.random() * 200 - 100 });
        break;
    }
    
    await this.delay(Math.random() * 1000 + 500);
  }

  // Thêm random typing behavior
  async randomTypingBehavior(): Promise<void> {
    if (!this.page) return;
    
    // Random focus on input fields
    const inputs = await this.page.$$('input[type="text"], input[type="email"], input[type="password"]');
    if (inputs.length > 0) {
      const randomInput = inputs[Math.floor(Math.random() * inputs.length)];
      try {
        await randomInput.focus();
        await this.delay(Math.random() * 500 + 200);
        
        // Random backspace/delete
        if (Math.random() > 0.7) {
          await this.page.keyboard.press('Backspace');
          await this.delay(Math.random() * 200 + 100);
        }
      } catch (e) {
        // Ignore focus errors
      }
    }
  }

  // Thêm random mouse movement với pattern tự nhiên
  async randomMouseMovement(): Promise<void> {
    if (!this.page) return;
    
    const movements = Math.floor(Math.random() * 5) + 3; // 3-7 movements
    
    for (let i = 0; i < movements; i++) {
      // Tạo bezier curve path để giống user thật
      const startX = Math.random() * 800;
      const startY = Math.random() * 600;
      const endX = Math.random() * 800;
      const endY = Math.random() * 600;
      
      const steps = 20;
      for (let j = 0; j <= steps; j++) {
        const t = j / steps;
        // Bezier curve với control points
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
        
        await this.page.mouse.move(x, y);
        await this.delay(Math.random() * 50 + 20);
      }
      
      // Random pause giữa các movements
      await this.delay(Math.random() * 500 + 200);
    }
  }

  // Xóa tất cả browser profiles cũ
  async cleanupOldProfiles(): Promise<void> {
    console.log('🧹 Đang xóa browser profiles cũ...');
    
    try {
      const fs = require('fs');
      const path = require('path');
      
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

  // Tạo browser profile hoàn toàn mới với cleanup trước
  async createCompletelyFreshBrowser(useRealChrome: boolean = false): Promise<void> {
    if (useRealChrome) {
      console.log('🆕 Tạo browser profile hoàn toàn mới với Chrome thật...');
    } else {
      console.log('🆕 Tạo browser profile hoàn toàn mới với cleanup trước...');
    }
    
    console.log('🌐 Sử dụng IP thật (không dùng proxy)');
    
    // Đóng browser cũ nếu có
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
    
    // Xóa tất cả profiles cũ trước
    await this.cleanupOldProfiles();
    
    // Đợi một chút để đảm bảo cleanup hoàn tất
    await this.delay(2000);
    
    // Tạo browser mới
    await this.createFreshBrowser(useRealChrome);
  }


  async navigateToTikTok(): Promise<void> {
    if (!this.page) throw new Error('Page chưa được khởi tạo');
    
    console.log('🌐 Đang truy cập TikTok...');
    
    try {
      await this.page.goto('https://www.tiktok.com', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      console.log('✅ Đã truy cập TikTok');
    } catch (error) {
      console.error('❌ Lỗi khi truy cập TikTok:', error);
        throw error;
    }
  }

  async clickLoginButton(): Promise<void> {
    if (!this.page) throw new Error('Page chưa được khởi tạo');
    
    console.log('🔍 Tìm kiếm nút đăng nhập...');
    
    try {
      // Tìm tất cả các button login và lấy cái cuối cùng
      console.log('🔍 Tìm button login cuối cùng...');
      
      const loginButtonInfo = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('#header-login-button'));
        console.log(`Tìm thấy ${buttons.length} button với ID header-login-button`);
        
        // Lấy button cuối cùng
        if (buttons.length > 0) {
          const lastButton = buttons[buttons.length - 1] as HTMLElement;
          return {
            found: true,
            visible: lastButton.offsetParent !== null,
            disabled: (lastButton as HTMLButtonElement).disabled || false,
            text: lastButton.textContent?.trim() || '',
            className: lastButton.className
          };
        }
        return { found: false };
      });

      console.log('📊 Thông tin button cuối cùng:', loginButtonInfo);

      if (!loginButtonInfo.found) {
        throw new Error('Không tìm thấy button login nào');
      }

      console.log('✅ Đã tìm thấy button login cuối cùng');
      
      // Scroll element vào view nếu cần
      await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('#header-login-button'));
        const lastVisibleButton = buttons[buttons.length - 1] as HTMLElement;
        if (lastVisibleButton && lastVisibleButton.offsetParent !== null) {
          lastVisibleButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      
      // Đợi một chút để đảm bảo element đã scroll vào view
      await this.delay(1000);
      
      // Thử click với nhiều cách khác nhau
      try {
        // Cách 1: Click trực tiếp vào button cuối cùng với hành vi giống user thật
        await this.page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('#header-login-button'));
          const lastVisibleButton = buttons[buttons.length - 1] as HTMLElement;
          if (lastVisibleButton && lastVisibleButton.offsetParent !== null) {
            lastVisibleButton.click();
          }
        });
        console.log('✅ Đã click vào nút đăng nhập cuối cùng (cách 1)');
      } catch (clickError) {
        console.log('🔄 Thử cách click khác...');
        
        // Cách 2: Click bằng selector với :last-of-type
        await this.humanLikeClick('#header-login-button:last-of-type');
        console.log('✅ Đã click vào nút đăng nhập cuối cùng (cách 2)');
      }
      
      // Đợi một chút để modal xuất hiện
      await this.delay(2000);
      
    } catch (error) {
      console.error('❌ Không tìm thấy nút đăng nhập:', error);
      throw error;
    }
  }

  async checkLoginContainer(): Promise<boolean> {
    if (!this.page) throw new Error('Page chưa được khởi tạo');
    
    console.log('🔍 Kiểm tra login container...');
    
    try {
      await this.page.waitForSelector('#loginContainer', { timeout: 5000 });
      console.log('✅ Login container đã xuất hiện');
      return true;
    } catch (error) {
      console.log('❌ Login container không xuất hiện');
      return false;
    }
  }

  async clickPhoneEmailOption(): Promise<void> {
    if (!this.page) throw new Error('Page chưa được khởi tạo');
    
    console.log('🔍 Tìm kiếm tùy chọn "Use phone / email / username"...');
  
    try {
      // Selector chính xác nhất: div có role="link" và chứa text cụ thể
      const element = await this.page.waitForSelector(
        'div#loginContainer > div > div > div > div:nth-child(2)',
        { timeout: 5000 }
      );
      console.log('✅ Đã tìm thấy phần tử "Use phone / email / username"');
      if (!element) {
        throw new Error('Không tìm thấy phần tử "Use phone / email / username"');
      }
  
        await element.click();
      console.log('✅ Đã click vào tùy chọn "Use phone / email / username"');
      
      // Chờ trang chuyển bước
      await this.delay(2000);
    } catch (error) {
      console.error('❌ Lỗi khi click vào tùy chọn số điện thoại/email:', error);      
    }
  }
  

  async clickEmailLoginLink(): Promise<void> {
    if (!this.page) throw new Error('Page chưa được khởi tạo');
    
    console.log('🔍 Tìm kiếm link "Đăng nhập bằng email hoặc tên người dùng"...');
    
    try {
      // Thử nhiều selector khác nhau
      const selectors = [
        'a[href="/login/phone-or-email/email"]',
      ];
      
      let element = null;
      for (const selector of selectors) {
        try {
          element = await this.page.waitForSelector(selector, { timeout: 3000, visible: true });
          if (element) break;
        } catch (e) {
          continue;
        }
      }
      
      if (!element) {
        // Fallback: tìm bằng text content
        element = await this.page.evaluateHandle(() => {
          const links = Array.from(document.querySelectorAll('a'));
          return links.find((link: HTMLAnchorElement) => 
            link.textContent?.includes('email') ||
            link.textContent?.includes('Email') ||
            link.textContent?.includes('tên người dùng') ||
            link.href?.includes('/login/phone-or-email/email')
          );
        });
      }
      
      if (element && element.asElement()) {
        await (element.asElement() as any).click();
        console.log('✅ Đã click vào link đăng nhập bằng email');
      } else {
        throw new Error('Không tìm thấy link đăng nhập bằng email');
      }
      
      await this.delay(2000);
      
    } catch (error) {
      console.error('❌ Không tìm thấy link đăng nhập bằng email:', error);
      throw error;
    }
  }

  async fillLoginForm(username: string, password: string): Promise<void> {
    if (!this.page) throw new Error('Page chưa được khởi tạo');
    
    console.log('📝 Đang điền thông tin đăng nhập...');
    
    try {
      // Đợi và điền username
      await this.page.waitForSelector('input[name="username"]', { timeout: 10000 });
      await this.humanLikeType('input[name="username"]', username);
      console.log('✅ Đã điền username');
      
      // Đợi và điền password với hành vi giống user thật
      await this.page.waitForSelector('input[type="password"]', { timeout: 10000 });
      await this.humanLikeType('input[type="password"]', password);
      console.log('✅ Đã điền password');
      
    } catch (error) {
      console.error('❌ Lỗi khi điền form đăng nhập:', error);
      throw error;
    }
  }

  async submitLogin(): Promise<void> {
    if (!this.page) throw new Error('Page chưa được khởi tạo');
    
    console.log('🚀 Đang submit form đăng nhập...');
    
    try {
      // Tìm submit button với nhiều selector khác nhau
      const submitSelectors = [
        'button[type="submit"]',
        'button[data-e2e="login-button"]',
        'button:has-text("Log in")',
        'button:has-text("Login")',
        'button:has-text("Đăng nhập")',
        '[data-e2e="login-button"]'
      ];
      
      let submitButton = null;
      for (const selector of submitSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 3000, visible: true });
          submitButton = await this.page.$(selector);
          if (submitButton) {
            console.log(`✅ Tìm thấy submit button với selector: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!submitButton) {
        throw new Error('Không tìm thấy submit button');
      }
      
      // Scroll button vào view
      const foundSelector = submitSelectors.find(selector => {
        try {
          return document.querySelector(selector);
        } catch {
          return false;
        }
      });
      
      if (foundSelector) {
        await this.page.evaluate((sel) => {
          const button = document.querySelector(sel);
          if (button) {
            button.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, foundSelector);
      }
      
      // Đợi một chút để đảm bảo button đã scroll vào view
      await this.delay(1000);
      
      // Thử click với nhiều cách khác nhau
      try {
        // Cách 1: Click trực tiếp
        await submitButton.click();
        console.log('✅ Đã submit form đăng nhập (cách 1)');
      } catch (clickError) {
        console.log('🔄 Thử cách click khác...');
        
        // Cách 2: Click bằng evaluate
        await this.page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const submitBtn = buttons.find(btn => 
            btn.type === 'submit' || 
            btn.textContent?.toLowerCase().includes('log in') ||
            btn.textContent?.toLowerCase().includes('login') ||
            btn.textContent?.toLowerCase().includes('đăng nhập')
          );
          if (submitBtn) {
            (submitBtn as HTMLButtonElement).click();
          }
        });
        console.log('✅ Đã submit form đăng nhập (cách 2)');
      }
      
      // Đợi một chút để xem kết quả
      await this.delay(5000);
      
    } catch (error) {
      console.error('❌ Lỗi khi submit form:', error);
      throw error;
    }
  }

  async readAccounts(): Promise<Account[]> {
    try {
      // Ưu tiên sử dụng environment variables (Railway/Production)
      const envAccounts = process.env.ACCOUNTS;
      if (envAccounts && envAccounts.trim()) {
        console.log('🔐 Sử dụng accounts từ environment variables (Railway/Production)');
        
        // Tách theo dấu ; và lọc các giá trị trống
        const accounts = envAccounts.split(";").map(a => a.trim()).filter(Boolean);
        
        if (accounts.length === 0) {
          throw new Error("❌ Không có tài khoản hợp lệ trong biến môi trường ACCOUNTS");
        }
        
        return accounts.map(account => {
          const [username, password] = account.split(':');
          if (!username || !password) {
            throw new Error(`❌ Format tài khoản không hợp lệ: ${account}. Sử dụng format: username:password`);
          }
          return { username: username.trim(), password: password.trim() };
        });
      }
      
      // Fallback về file accounts.txt (Local development)
      console.log('📁 Sử dụng file accounts.txt (Local development)');
      const accountsPath = path.join(__dirname, '..', 'accounts.txt');
      
      const data = fs.readFileSync(accountsPath, 'utf8');
      const lines = data.trim().split('\n').filter(line => line.trim() && !line.startsWith('#'));
      
      if (lines.length === 0) {
        throw new Error("❌ File accounts.txt trống hoặc không có tài khoản hợp lệ");
      }
      
      return lines.map(line => {
        const [username, password] = line.split(':');
        if (!username || !password) {
          throw new Error(`❌ Format tài khoản không hợp lệ: ${line}. Sử dụng format: username:password`);
        }
        return { username: username.trim(), password: password.trim() };
      });
      
    } catch (error) {
      console.error('❌ Lỗi khi đọc accounts:', error);
      throw error;
    }
  }

  async login(useRealChrome: boolean = false): Promise<void> {
    try {
      // Đọc danh sách tài khoản
      const accounts = await this.readAccounts();
      
      if (accounts.length === 0) {
        throw new Error('Không có tài khoản nào trong file accounts.txt');
      }
      
      // Sử dụng tài khoản đầu tiên
      const account = accounts[0];
      console.log(`🔑 Sử dụng tài khoản: ${account.username}`);
      
      // Tạo browser profile hoàn toàn mới với cleanup
      await this.createCompletelyFreshBrowser(useRealChrome);
      
      // Random delay trước khi navigate
      await this.randomUserDelay();
      
      await this.navigateToTikTok();
      await this.createPersistentSession();
      
      // Random mouse movement
      await this.randomMouseMovement();
      
      // Simulate human behavior
      // await this.simulateHumanBehavior();
      
      // Debug page trước khi click
      await this.debugPage();
      
      // Random delay trước khi click
      await this.randomUserDelay();
      
      await this.clickLoginButton();
      
      const hasLoginContainer = await this.checkLoginContainer();
      if (!hasLoginContainer) {
        console.log('⚠️ Login container không xuất hiện, thử debug lại...');
        await this.debugPage();
        throw new Error('Login container không xuất hiện');
      }
      
      await this.clickPhoneEmailOption();
      await this.clickEmailLoginLink();
      
      // Random typing behavior trước khi fill form
      await this.randomTypingBehavior();
      
      await this.fillLoginForm(account.username, account.password);
      
      // Random delay trước khi submit
      await this.randomUserDelay();
      
      await this.submitLogin();
      
      console.log('🎉 Hoàn thành quá trình đăng nhập!');
      
    } catch (error) {
      console.error('❌ Lỗi trong quá trình đăng nhập:', error);
      
      // Debug page khi có lỗi
      console.log('🔍 Debug page khi có lỗi:');
      await this.debugPage();
      
      throw error;
    }
  }

  async navigateToProfile(username: string): Promise<void> {
    try {
      console.log(`👤 Đang navigate đến profile: @${username}`);
      
      // Tạo URL profile TikTok
      const profileUrl = `https://www.tiktok.com/@${username}`;
      console.log(`🔗 Profile URL: ${profileUrl}`);
      
      // Navigate đến profile
      if (!this.page) {
        throw new Error('Page không tồn tại');
      }
      
      await this.page.goto(profileUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Đợi page load
      await this.delay(3000);
      
      // Kiểm tra xem profile có tồn tại không
      const pageTitle = await this.page.title();
      console.log(`📄 Page title: ${pageTitle}`);
      
      // Kiểm tra xem có thông báo lỗi không
      const errorSelectors = [
        'div[data-e2e="user-page-error"]',
        'div[class*="error"]',
        'div[class*="not-found"]',
        'h1[class*="error"]'
      ];
      
      let hasError = false;
      for (const selector of errorSelectors) {
        const errorElement = await this.page.$(selector);
        if (errorElement) {
          console.log(`⚠️ Phát hiện lỗi trên page với selector: ${selector}`);
          hasError = true;
          break;
        }
      }
      
      if (hasError) {
        console.log('❌ Profile không tồn tại hoặc có lỗi');
        throw new Error(`Profile @${username} không tồn tại hoặc không thể truy cập`);
      }
      
      // Kiểm tra xem có thông tin profile không
      const profileSelectors = [
        'h1[data-e2e="user-title"]',
        'h2[data-e2e="user-title"]',
        'div[data-e2e="user-title"]',
        'h1[class*="username"]',
        'h2[class*="username"]'
      ];
      
      let profileFound = false;
      for (const selector of profileSelectors) {
        const profileElement = await this.page.$(selector);
        if (profileElement) {
          const profileText = await this.page.evaluate(el => el?.textContent || '', profileElement);
          console.log(`✅ Tìm thấy profile: ${profileText}`);
          profileFound = true;
          break;
        }
      }
      
      if (!profileFound) {
        console.log('⚠️ Không tìm thấy thông tin profile, nhưng page đã load');
      }
      
      // Scroll xuống để load thêm content
      console.log('📜 Đang scroll để load thêm content...');
      await this.page.evaluate(() => {
        if (document.body) {
          window.scrollTo(0, document.body.scrollHeight);
        }
      });
      
      await this.delay(2000);
      
      // Scroll lên lại
      await this.page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      
      await this.delay(1000);
      
      console.log(`✅ Đã navigate thành công đến profile @${username}`);
      
    } catch (error) {
      console.error(`❌ Lỗi khi navigate đến profile @${username}:`, error);
      throw error;
    }
  }

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

// Hàm main
async function main(): Promise<void> {
  const bot = new TikTokLoginBot();
  
  // Kiểm tra argument từ command line
  const useRealChrome = process.argv.includes('--real');
  
  if (useRealChrome) {
    console.log('🚀 Chế độ Chrome thật được kích hoạt!');
  } else {
    console.log('🚀 Chế độ Chromium mặc định');
  }
  
  console.log('🌐 Sử dụng IP thật (không dùng proxy)');
  
  try {
    await bot.login(useRealChrome);
    
    // Giữ browser mở để xem kết quả
    console.log('⏳ Giữ browser mở trong 30 giây để xem kết quả...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    console.error('💥 Lỗi:', error);
  } finally {
    await bot.close();
  }
}

// Chạy ứng dụng
if (require.main === module) {
  main().catch(console.error);
}

export { TikTokLoginBot };

