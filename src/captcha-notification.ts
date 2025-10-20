import { Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { CaptchaInfo } from './captcha-detector';

export interface CaptchaNotification {
  id: string;
  timestamp: string;
  status: 'waiting' | 'resolved' | 'timeout';
  captchaInfo: CaptchaInfo;
  screenshot: string;
  instructions: string[];
  currentUrl: string;
  pageTitle: string;
}

export class CaptchaNotificationSystem {
  private page: Page;
  private notificationFile = './captcha-notifications.json';
  private instructionsFile = './captcha-instructions.json';

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Create CAPTCHA notification
   */
  async createNotification(captchaInfo: CaptchaInfo): Promise<CaptchaNotification> {
    const notification: CaptchaNotification = {
      id: this.generateNotificationId(),
      timestamp: new Date().toISOString(),
      status: 'waiting',
      captchaInfo,
      screenshot: await this.takeScreenshot(),
      instructions: this.generateInstructions(captchaInfo.type),
      currentUrl: this.page.url(),
      pageTitle: await this.page.title()
    };

    // Save notification
    await this.saveNotification(notification);

    // Create human instructions
    await this.createHumanInstructions(notification);

    console.log('📧 CAPTCHA notification created:', notification.id);
    return notification;
  }

  /**
   * Save notification to file
   */
  private async saveNotification(notification: CaptchaNotification): Promise<void> {
    try {
      const notifications = this.loadNotifications();
      notifications.push(notification);
      fs.writeFileSync(this.notificationFile, JSON.stringify(notifications, null, 2));
    } catch (error) {
      console.error('❌ Lỗi khi lưu notification:', error);
    }
  }

  /**
   * Load notifications from file
   */
  private loadNotifications(): CaptchaNotification[] {
    try {
      if (fs.existsSync(this.notificationFile)) {
        const data = fs.readFileSync(this.notificationFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('❌ Lỗi khi load notifications:', error);
    }
    return [];
  }

  /**
   * Create human instructions
   */
  private async createHumanInstructions(notification: CaptchaNotification): Promise<void> {
    const instructions = {
      notificationId: notification.id,
      timestamp: notification.timestamp,
      status: 'waiting_for_human',
      message: 'CAPTCHA detected - human intervention required',
      currentUrl: notification.currentUrl,
      pageTitle: notification.pageTitle,
      captchaType: notification.captchaInfo.type,
      instructions: notification.instructions,
      screenshot: notification.screenshot,
      nextSteps: [
        '1. Mở browser và truy cập URL hiện tại',
        '2. Giải CAPTCHA theo hướng dẫn bên dưới',
        '3. Tạo file captcha-resolved.json với nội dung: {"resolved": true, "notificationId": "' + notification.id + '"}',
        '4. Bot sẽ tự động tiếp tục automation'
      ]
    };

    fs.writeFileSync(this.instructionsFile, JSON.stringify(instructions, null, 2));
    console.log('📋 Human instructions created:', this.instructionsFile);
  }

  /**
   * Check if CAPTCHA is resolved
   */
  async checkCaptchaResolved(notificationId: string): Promise<boolean> {
    try {
      // Check resolution file
      if (fs.existsSync('./captcha-resolved.json')) {
        const data = JSON.parse(fs.readFileSync('./captcha-resolved.json', 'utf8'));
        if (data.resolved === true && data.notificationId === notificationId) {
          // Update notification status
          await this.updateNotificationStatus(notificationId, 'resolved');
          
          // Clean up resolution file
          fs.unlinkSync('./captcha-resolved.json');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('❌ Lỗi khi kiểm tra CAPTCHA resolution:', error);
      return false;
    }
  }

  /**
   * Update notification status
   */
  private async updateNotificationStatus(notificationId: string, status: 'resolved' | 'timeout'): Promise<void> {
    try {
      const notifications = this.loadNotifications();
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.status = status;
        fs.writeFileSync(this.notificationFile, JSON.stringify(notifications, null, 2));
      }
    } catch (error) {
      console.error('❌ Lỗi khi update notification status:', error);
    }
  }

  /**
   * Wait for human to resolve CAPTCHA
   */
  async waitForHumanResolution(notificationId: string, timeoutMs: number = 600000): Promise<boolean> {
    console.log('⏳ Đợi người thật giải CAPTCHA...');
    console.log(`📋 Xem hướng dẫn tại: ${this.instructionsFile}`);
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const resolved = await this.checkCaptchaResolved(notificationId);
      if (resolved) {
        console.log('✅ CAPTCHA đã được giải bởi người thật');
        return true;
      }
      
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      console.log(`⏳ Đã chờ ${elapsed}s - vẫn đang chờ human giải CAPTCHA...`);
      
      await new Promise(resolve => setTimeout(resolve, 10000)); // Check every 10 seconds
    }
    
    console.log('⏰ Timeout - CAPTCHA không được giải trong thời gian cho phép');
    await this.updateNotificationStatus(notificationId, 'timeout');
    return false;
  }

  /**
   * Take screenshot
   */
  private async takeScreenshot(): Promise<string> {
    try {
      const screenshot = await this.page.screenshot({ 
        fullPage: true,
        encoding: 'base64'
      });
      return screenshot;
    } catch (error) {
      console.error('❌ Lỗi khi chụp screenshot:', error);
      return '';
    }
  }

  /**
   * Generate instructions based on CAPTCHA type
   */
  private generateInstructions(type: string): string[] {
    switch (type) {
      case 'slider':
        return [
          'Đây là CAPTCHA slider',
          'Kéo thanh trượt để ghép hình hoàn chỉnh',
          'Kéo từ trái sang phải cho đến khi hình khớp'
        ];
      case 'click':
        return [
          'Đây là CAPTCHA click',
          'Click vào các hình ảnh theo yêu cầu',
          'Ví dụ: "Click vào tất cả hình có xe hơi"'
        ];
      case 'text':
        return [
          'Đây là CAPTCHA text',
          'Nhập các ký tự bạn thấy trong hình',
          'Chú ý phân biệt chữ hoa và chữ thường'
        ];
      default:
        return [
          'Đây là CAPTCHA không xác định',
          'Làm theo hướng dẫn trên màn hình',
          'Hoàn thành yêu cầu để tiếp tục'
        ];
    }
  }

  /**
   * Generate notification ID
   */
  private generateNotificationId(): string {
    return `captcha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

