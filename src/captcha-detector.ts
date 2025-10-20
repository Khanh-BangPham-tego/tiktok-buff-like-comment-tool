import { Page } from 'puppeteer';

export interface CaptchaInfo {
  isPresent: boolean;
  type: 'slider' | 'click' | 'text' | 'unknown';
  selectors: string[];
  timestamp: string;
  url: string;
}

export class CaptchaDetector {
  private page: Page;
  private isMonitoring = false;
  private captchaCallbacks: Array<(info: CaptchaInfo) => void> = [];

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Start monitoring for CAPTCHA
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('🔍 Bắt đầu monitoring CAPTCHA...');

    // Setup DOM mutation observer
    await this.setupMutationObserver();

    // Setup periodic checking
    this.startPeriodicCheck();
  }

  /**
   * Stop monitoring
   */
  async stopMonitoring(): Promise<void> {
    this.isMonitoring = false;
    console.log('⏹️ Dừng monitoring CAPTCHA');
    
    // Clean up DOM observer if exists
    try {
      await this.page.evaluate(() => {
        if ((window as any).captchaObserver) {
          (window as any).captchaObserver.disconnect();
          (window as any).captchaObserver = null;
        }
      });
    } catch (error) {
      // Ignore errors when cleaning up
    }
  }

  /**
   * Check if page is still valid
   */
  private isPageValid(): boolean {
    try {
      return !this.page.isClosed() && this.page.url() !== 'about:blank';
    } catch {
      return false;
    }
  }

  /**
   * Setup DOM mutation observer
   */
  private async setupMutationObserver(): Promise<void> {
    await this.page.evaluate(() => {
      const captchaSelectors = [
        'div#captcha-verify-container-main-page'
      ];

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                
                const isCaptcha = captchaSelectors.some(selector => {
                  try {
                    return element.matches(selector) || element.querySelector(selector);
                  } catch {
                    return false;
                  }
                });

                if (isCaptcha) {
                  console.log('🚨 CAPTCHA detected via DOM mutation!');
                  window.dispatchEvent(new CustomEvent('captchaDetected', {
                    detail: { 
                      element: element.outerHTML,
                      timestamp: new Date().toISOString(),
                      url: window.location.href
                    }
                  }));
                }
              }
            });
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
      });

      (window as any).captchaObserver = observer;
    });

    // Listen for CAPTCHA events
    await this.page.exposeFunction('onCaptchaDetected', (data: any) => {
      this.handleCaptchaDetected(data);
    });

    await this.page.evaluate(() => {
      window.addEventListener('captchaDetected', (event: any) => {
        (window as any).onCaptchaDetected(event.detail);
      });
    });
  }

  /**
   * Start periodic checking
   */
  private startPeriodicCheck(): void {
    const checkInterval = setInterval(async () => {
      if (!this.isMonitoring) {
        clearInterval(checkInterval);
        return;
      }

      // Check if page is still valid before checking CAPTCHA
      if (!this.isPageValid()) {
        console.log('⚠️ Page không còn hợp lệ, dừng periodic check');
        clearInterval(checkInterval);
        this.isMonitoring = false;
        return;
      }

      try {
        const captchaInfo = await this.checkCurrentCaptcha();
        if (captchaInfo.isPresent) {
          this.handleCaptchaDetected(captchaInfo);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('detached') || errorMessage.includes('Target closed')) {
          console.log('⚠️ Page/Frame detached, dừng CAPTCHA monitoring');
          clearInterval(checkInterval);
          this.isMonitoring = false;
        } else {
          console.error('❌ Lỗi trong periodic check:', error);
        }
      }
    }, 2000); // Check every 2 seconds
  }

  /**
   * Check current page for CAPTCHA
   */
  async checkCurrentCaptcha(): Promise<CaptchaInfo> {
    try {
      // Check if page is still valid
      if (!this.isPageValid()) {
        console.log('⚠️ Page không còn hợp lệ, dừng CAPTCHA monitoring');
        await this.stopMonitoring();
        return { isPresent: false, type: 'unknown', selectors: [], timestamp: new Date().toISOString(), url: '' };
      }

      const captchaInfo = await this.page.evaluate(() => {
        const selectors = {
          slider: [
            'div#captcha-verify-container-main-page div:nth-child(2)',
          ],
          click: [
            'div#captcha-verify-container-main-page button[id="captcha_slide_button"]',
          ],
          text: [
            'input[placeholder*="captcha"]',
            'input[placeholder*="verification"]',
            '.captcha-input'
          ]
        };

        let foundSelectors: string[] = [];
        let type: 'slider' | 'click' | 'text' | 'unknown' = 'unknown';

        // Check each type
        for (const [captchaType, typeSelectors] of Object.entries(selectors)) {
          for (const selector of typeSelectors) {
            try {
              if (document.querySelector(selector)) {
                foundSelectors.push(selector);
                type = captchaType as any;
                break;
              }
            } catch {
              continue;
            }
          }
          if (foundSelectors.length > 0) break;
        }

        return {
          isPresent: foundSelectors.length > 0,
          type,
          selectors: foundSelectors,
          timestamp: new Date().toISOString(),
          url: window.location.href
        };
      });

      return captchaInfo;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('detached') || errorMessage.includes('Target closed')) {
        console.log('⚠️ Page/Frame đã bị detached, dừng CAPTCHA monitoring');
        await this.stopMonitoring();
        return { isPresent: false, type: 'unknown', selectors: [], timestamp: new Date().toISOString(), url: '' };
      }
      throw error;
    }
  }

  /**
   * Handle CAPTCHA detected
   */
  private handleCaptchaDetected(data: any): void {
    const captchaInfo: CaptchaInfo = {
      isPresent: true,
      type: data.type || 'unknown',
      selectors: data.selectors || [],
      timestamp: data.timestamp || new Date().toISOString(),
      url: data.url || this.page.url()
    };

    console.log('🚨 CAPTCHA detected:', captchaInfo);
    
    // Notify all callbacks
    this.captchaCallbacks.forEach(callback => callback(captchaInfo));
  }

  /**
   * Add CAPTCHA detection callback
   */
  onCaptchaDetected(callback: (info: CaptchaInfo) => void): void {
    this.captchaCallbacks.push(callback);
  }

  /**
   * Remove all callbacks
   */
  clearCallbacks(): void {
    this.captchaCallbacks = [];
  }
}

