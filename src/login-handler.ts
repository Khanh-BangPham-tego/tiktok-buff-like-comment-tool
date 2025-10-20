import { Page } from 'puppeteer';
import { HumanBehavior } from './human-behavior';
import { Utils } from './utils';
import { Account, LoginResult } from './interfaces';

/**
 * Handles TikTok login operations
 */
export class LoginHandler {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to TikTok
   */
  async navigateToTikTok(): Promise<void> {
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

  /**
   * Click login button
   */
  async clickLoginButton(): Promise<void> {
    console.log('🔍 Tìm kiếm nút đăng nhập...');
    
    try {
      console.log('🔍 Tìm button login cuối cùng...');
      
      const loginButtonInfo = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('#header-login-button'));
        console.log(`Tìm thấy ${buttons.length} button với ID header-login-button`);
        
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
      
      // Scroll element into view
      await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('#header-login-button'));
        const lastVisibleButton = buttons[buttons.length - 1] as HTMLElement;
        if (lastVisibleButton && lastVisibleButton.offsetParent !== null) {
          lastVisibleButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      
      await Utils.delay(1000);
      
      // Try clicking with different methods
      try {
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
        await HumanBehavior.humanLikeClick(this.page, '#header-login-button:last-of-type');
        console.log('✅ Đã click vào nút đăng nhập cuối cùng (cách 2)');
      }
      
      await Utils.delay(2000);
      
    } catch (error) {
      console.error('❌ Không tìm thấy nút đăng nhập:', error);
      throw error;
    }
  }

  /**
   * Check if login container appears
   */
  async checkLoginContainer(): Promise<boolean> {
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

  /**
   * Click phone/email option
   */
  async clickPhoneEmailOption(): Promise<void> {
    console.log('🔍 Tìm kiếm tùy chọn "Use phone / email / username"...');
  
    try {
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
      
      await Utils.delay(2000);
    } catch (error) {
      console.error('❌ Lỗi khi click vào tùy chọn số điện thoại/email:', error);      
    }
  }

  /**
   * Click email login link
   */
  async clickEmailLoginLink(): Promise<void> {
    console.log('🔍 Tìm kiếm link "Đăng nhập bằng email hoặc tên người dùng"...');
    
    try {
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
        // Fallback: find by text content
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
      
      await Utils.delay(2000);
      
    } catch (error) {
      console.error('❌ Không tìm thấy link đăng nhập bằng email:', error);
      throw error;
    }
  }

  /**
   * Fill login form
   */
  async fillLoginForm(username: string, password: string): Promise<void> {
    console.log('📝 Đang điền thông tin đăng nhập...');
    
    try {
      // Wait and fill username
      await this.page.waitForSelector('input[name="username"]', { timeout: 10000 });
      await HumanBehavior.humanLikeType(this.page, 'input[name="username"]', username);
      console.log('✅ Đã điền username');
      
      // Wait and fill password
      await this.page.waitForSelector('input[type="password"]', { timeout: 10000 });
      await HumanBehavior.humanLikeType(this.page, 'input[type="password"]', password);
      console.log('✅ Đã điền password');
      
    } catch (error) {
      console.error('❌ Lỗi khi điền form đăng nhập:', error);
      throw error;
    }
  }

  /**
   * Submit login form
   */
  async submitLogin(): Promise<void> {
    console.log('🚀 Đang submit form đăng nhập...');
    
    try {
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
      
      // Scroll button into view
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
      
      await Utils.delay(1000);
      
      // Try clicking with different methods
      try {
        await submitButton.click();
        console.log('✅ Đã submit form đăng nhập (cách 1)');
      } catch (clickError) {
        console.log('🔄 Thử cách click khác...');
        
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
      
      await Utils.delay(5000);
      await this.checkLoginFormErrors();
      
    } catch (error) {
      console.error('❌ Lỗi khi submit form:', error);
      throw error;
    }
  }

  /**
   * Check for login form errors
   */
  async checkLoginFormErrors(): Promise<void> {
    try {
      if (!this.page) {
        console.log('⚠️ Page không tồn tại, không thể kiểm tra form errors');
        return;
      }
      
      console.log('🔍 Kiểm tra form đăng nhập có thẻ báo lỗi hay không...');
      
      let errorElement = await this.page.waitForSelector('#loginContainer div[type="error"] span', { timeout: 10000 });

      if (errorElement) {
        const errorText = await errorElement.evaluate(el => el.textContent?.trim() || '');
        console.log('❌ ===== FORM ĐĂNG NHẬP CÓ LỖI =====');
        console.log('📋 Danh sách lỗi được phát hiện:');
        console.log(errorText);
        console.log('=====================================');
        throw new Error(`Form đăng nhập có lỗi: ${errorText}`);
      } else {
        console.log('✅ Không phát hiện lỗi nào trong form đăng nhập');
      }
      
    } catch (error) {
      if (error instanceof Error && error.message.includes('Form đăng nhập có lỗi')) {
        throw error; // Re-throw login form errors
      }
      console.log('⚠️ Lỗi khi kiểm tra form errors:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Complete login process
   */
  async login(account: Account): Promise<LoginResult> {
    try {
      console.log(`🔑 Sử dụng tài khoản: ${account.username}`);
      await this.navigateToTikTok();
      // Random delay before clicking
      await Utils.randomUserDelay();
      
      // Random mouse movement
      await HumanBehavior.randomMouseMovement(this.page);
      
      // Debug page before clicking
      await this.debugPage();
      
      // Random delay before clicking
      await Utils.randomUserDelay();
      
      await this.clickLoginButton();
      
      const hasLoginContainer = await this.checkLoginContainer();
      if (!hasLoginContainer) {
        console.log('⚠️ Login container không xuất hiện, thử debug lại...');
        await this.debugPage();
        throw new Error('Login container không xuất hiện');
      }
      
      await this.clickPhoneEmailOption();
      await this.clickEmailLoginLink();
      
      // Random typing behavior before filling form
      await HumanBehavior.randomTypingBehavior(this.page);
      
      await this.fillLoginForm(account.username, account.password);
      
      // Random delay before submit
      await Utils.randomUserDelay();
      
      await this.submitLogin();
      
      console.log('🎉 Hoàn thành quá trình đăng nhập!');
      
      return { success: true, account };
      
    } catch (error) {
      console.error('❌ Lỗi trong quá trình đăng nhập:', error);
      
      // Debug page when error occurs
      console.log('🔍 Debug page khi có lỗi:');
      await this.debugPage();
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        account 
      };
    }
  }

  /**
   * Debug current page
   */
  async debugPage(): Promise<void> {
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
}
