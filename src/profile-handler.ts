import { Page } from 'puppeteer';
import { Utils } from './utils';
import { ProfileInfo } from './interfaces';

/**
 * Handles TikTok profile operations
 */
export class ProfileHandler {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a TikTok profile
   */
  async navigateToProfile(username: string): Promise<ProfileInfo> {
    try {
      console.log(`👤 Đang navigate đến profile: @${username}`);
      
      // Create TikTok profile URL
      const profileUrl = `https://www.tiktok.com/@${username}`;
      console.log(`🔗 Profile URL: ${profileUrl}`);
      
      if (!this.page) {
        throw new Error('Page không tồn tại');
      }
      
      await this.page.goto(profileUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Wait for page to load
      await Utils.delay(3000);
      
      // Check if profile exists
      const pageTitle = await this.page.title();
      console.log(`📄 Page title: ${pageTitle}`);
      
      // Check for error messages
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
        return {
          username,
          exists: false,
          error: `Profile @${username} không tồn tại hoặc không thể truy cập`
        };
      }
      
      // Check for profile information
      const profileSelectors = [
        'h1[data-e2e="user-title"]',
        'h2[data-e2e="user-title"]',
        'div[data-e2e="user-title"]',
        'h1[class*="username"]',
        'h2[class*="username"]'
      ];
      
      let profileFound = false;
      let profileTitle = '';
      for (const selector of profileSelectors) {
        const profileElement = await this.page.$(selector);
        if (profileElement) {
          profileTitle = await this.page.evaluate(el => el?.textContent || '', profileElement);
          console.log(`✅ Tìm thấy profile: ${profileTitle}`);
          profileFound = true;
          break;
        }
      }
      
      if (!profileFound) {
        console.log('⚠️ Không tìm thấy thông tin profile, nhưng page đã load');
      }
      
      // Scroll down to load more content
      console.log('📜 Đang scroll để load thêm content...');
      await this.page.evaluate(() => {
        if (document.body) {
          window.scrollTo(0, document.body.scrollHeight);
        }
      });
      
      await Utils.delay(2000);
      
      // Scroll back up
      await this.page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      
      await Utils.delay(1000);
      
      console.log(`✅ Đã navigate thành công đến profile @${username}`);
      
      return {
        username,
        title: profileTitle,
        exists: true
      };
      
    } catch (error) {
      console.error(`❌ Lỗi khi navigate đến profile @${username}:`, error);
      return {
        username,
        exists: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get profile information
   */
  async getProfileInfo(username: string): Promise<ProfileInfo> {
    return await this.navigateToProfile(username);
  }

  /**
   * Check if profile exists
   */
  async checkProfileExists(username: string): Promise<boolean> {
    const profileInfo = await this.navigateToProfile(username);
    return profileInfo.exists;
  }
}

