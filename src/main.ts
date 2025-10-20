import { BrowserManager } from './browser-manager';
import { LoginHandler } from './login-handler';
import { ProfileHandler } from './profile-handler';
import { AccountManager } from './account-manager';
import { HumanBehavior } from './human-behavior';
import { Utils } from './utils';
import { Account, LoginResult, ProfileInfo, CaptchaInfo } from './interfaces';
import { CaptchaDetector } from './captcha-detector';
import { CaptchaNotificationSystem } from './captcha-notification';
import { AutomationPauseResumeSystem } from './automation-pause-resume';

/**
 * Main TikTok Bot class that orchestrates all operations
 */
class TikTokLoginBot {
  private browserManager: BrowserManager;
  private loginHandler: LoginHandler | null = null;
  private profileHandler: ProfileHandler | null = null;
  private captchaDetector: CaptchaDetector | null = null;
  private captchaNotificationSystem: CaptchaNotificationSystem | null = null;
  private automationSystem: AutomationPauseResumeSystem;

  constructor() {
    this.browserManager = new BrowserManager();
    this.automationSystem = new AutomationPauseResumeSystem();
  }

  /**
   * Initialize the bot
   */
  async init(): Promise<void> {
    await this.browserManager.init();
    const page = this.browserManager.getPage();
    if (page) {
      this.loginHandler = new LoginHandler(page);
      this.profileHandler = new ProfileHandler(page);
      this.captchaDetector = new CaptchaDetector(page);
      this.captchaNotificationSystem = new CaptchaNotificationSystem(page);
      
      // Setup CAPTCHA detection callback
      this.setupCaptchaHandling();
    }
  }

  /**
   * Setup CAPTCHA handling
   */
  private setupCaptchaHandling(): void {
    if (!this.captchaDetector || !this.captchaNotificationSystem) {
      console.log('⚠️ CAPTCHA systems not initialized');
      return;
    }

    this.captchaDetector.onCaptchaDetected(async (captchaInfo: CaptchaInfo) => {
      console.log('🚨 CAPTCHA detected - pausing automation...');
      
      // Pause automation
      await this.automationSystem.pause('CAPTCHA detected');
      
      // Create notification
      const notification = await this.captchaNotificationSystem!.createNotification(captchaInfo);
      
      // Wait for human to resolve CAPTCHA
      const resolved = await this.captchaNotificationSystem!.waitForHumanResolution(notification.id);
      
      if (resolved) {
        console.log('✅ CAPTCHA resolved - resuming automation...');
        await this.automationSystem.resume();
      } else {
        console.log('⏰ CAPTCHA timeout - stopping automation');
        await this.automationSystem.stop();
      }
    });

    console.log('🔍 CAPTCHA handling setup completed');
  }

  /**
   * Add automation task
   */
  addAutomationTask(name: string, taskFunction: () => Promise<any>): string {
    return this.automationSystem.addTask(name, taskFunction);
  }

  /**
   * Get automation status
   */
  getAutomationStatus() {
    const status = this.automationSystem.getStatus();
    const progress = this.automationSystem.getProgress();
    const currentTask = this.automationSystem.getCurrentTaskName();
    
    return {
      isPaused: status.isPaused,
      currentTask,
      progress: `${status.completedTasks}/${status.totalTasks}`,
      progressPercentage: progress,
      pauseReason: status.pauseReason
    };
  }

  /**
   * Start CAPTCHA monitoring
   */
  async startCaptchaMonitoring(): Promise<void> {
    if (this.captchaDetector) {
      await this.captchaDetector.startMonitoring();
      console.log('🔍 CAPTCHA monitoring started');
    }
  }

  /**
   * Stop CAPTCHA monitoring
   */
  async stopCaptchaMonitoring(): Promise<void> {
    if (this.captchaDetector) {
      await this.captchaDetector.stopMonitoring();
      console.log('⏹️ CAPTCHA monitoring stopped');
    }
  }

  /**
   * Create persistent session
   */
  async createPersistentSession(): Promise<void> {
    await this.browserManager.createPersistentSession();
  }

  /**
   * Reset browser to clean state
   */
  async resetBrowser(): Promise<void> {
    await this.browserManager.resetBrowser();
  }

  /**
   * Create fresh browser with random fingerprint
   */
  async createFreshBrowser(useRealChrome: boolean = false): Promise<void> {
    await this.browserManager.createFreshBrowser(useRealChrome);
    const page = this.browserManager.getPage();
    if (page) {
      this.loginHandler = new LoginHandler(page);
      this.profileHandler = new ProfileHandler(page);
      this.captchaDetector = new CaptchaDetector(page);
      this.captchaNotificationSystem = new CaptchaNotificationSystem(page);
      this.setupCaptchaHandling();
    }
  }

  /**
   * Create completely fresh browser with cleanup
   */
  async createCompletelyFreshBrowser(useRealChrome: boolean = false): Promise<void> {
    await this.browserManager.createCompletelyFreshBrowser(useRealChrome);
    const page = this.browserManager.getPage();
    if (page) {
      this.loginHandler = new LoginHandler(page);
      this.profileHandler = new ProfileHandler(page);
      this.captchaDetector = new CaptchaDetector(page);
      this.captchaNotificationSystem = new CaptchaNotificationSystem(page);
      this.setupCaptchaHandling();
    }
  }

  /**
   * Navigate to TikTok
   */
  async navigateToTikTok(): Promise<void> {
    if (!this.loginHandler) throw new Error('Login handler chưa được khởi tạo');
    await this.loginHandler.navigateToTikTok();
  }

  /**
   * Login with account using automation system
   */
  async login(useRealChrome: boolean = false): Promise<LoginResult> {
    try {
      // Clear previous tasks
      await this.automationSystem.clearTasks();
      
      // Get first account
      const account = await AccountManager.getFirstAccount();
      
      // Add automation tasks
      this.addAutomationTask('Create Fresh Browser', async () => {
        await this.createCompletelyFreshBrowser(useRealChrome);
      });
      
      this.addAutomationTask('Create Persistent Session', async () => {
        await this.createPersistentSession();
      });
      
      this.addAutomationTask('Random Mouse Movement', async () => {
        const page = this.browserManager.getPage();
        if (page) {
          await HumanBehavior.randomMouseMovement(page);
        }
      });
      
      this.addAutomationTask('Navigate to TikTok', async () => {
        if (!this.loginHandler) {
          throw new Error('Login handler chưa được khởi tạo');
        }
        await this.loginHandler.navigateToTikTok();
      });
      
      this.addAutomationTask('Perform Login', async () => {
        if (!this.loginHandler) {
          throw new Error('Login handler chưa được khởi tạo');
        }
        return await this.loginHandler.login(account);
      });
      
      // Start CAPTCHA monitoring
      await this.startCaptchaMonitoring();
      
      // Start automation execution
      await this.automationSystem.startExecution();
      
      // Get login result from the last task
      const loginTask = this.automationSystem.getTaskById(
        this.automationSystem.getStatus().tasks.find(t => t.name === 'Perform Login')?.id || ''
      );
      
      if (loginTask && loginTask.result) {
        return loginTask.result;
      } else if (loginTask && loginTask.error) {
        return {
          success: false,
          error: loginTask.error,
          account
        };
      } else {
        return {
          success: false,
          error: 'Login task không hoàn thành',
          account
        };
      }
      
    } catch (error) {
      console.error('❌ Lỗi trong quá trình đăng nhập:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    } finally {
      // Stop CAPTCHA monitoring
      await this.stopCaptchaMonitoring();
    }
  }

  /**
   * Navigate to profile
   */
  async navigateToProfile(username: string): Promise<ProfileInfo> {
    if (!this.profileHandler) {
      throw new Error('Profile handler chưa được khởi tạo');
    }
    return await this.profileHandler.navigateToProfile(username);
  }

  /**
   * Get profile information
   */
  async getProfileInfo(username: string): Promise<ProfileInfo> {
    if (!this.profileHandler) {
      throw new Error('Profile handler chưa được khởi tạo');
    }
    return await this.profileHandler.getProfileInfo(username);
  }

  /**
   * Check if profile exists
   */
  async checkProfileExists(username: string): Promise<boolean> {
    if (!this.profileHandler) {
      throw new Error('Profile handler chưa được khởi tạo');
    }
    return await this.profileHandler.checkProfileExists(username);
  }

  /**
   * Debug current page
   */
  async debugPage(): Promise<void> {
    await this.browserManager.debugPage();
  }

  /**
   * Close browser
   */
  async close(): Promise<void> {
    // Stop CAPTCHA monitoring
    await this.stopCaptchaMonitoring();
    
    // Stop automation if running
    if (this.automationSystem.isAutomationRunning()) {
      await this.automationSystem.stop();
    }
    
    // Close browser
    await this.browserManager.close();
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const bot = new TikTokLoginBot();
  
  // Check command line arguments
  const useRealChrome = process.argv.includes('--real');
  
  if (useRealChrome) {
    console.log('🚀 Chế độ Chrome thật được kích hoạt!');
  } else {
    console.log('🚀 Chế độ Chromium mặc định');
  }
  
  console.log('🌐 Sử dụng IP thật (không dùng proxy)');
  
  try {
    await bot.init();
    
    // Show automation status periodically
    const statusInterval = setInterval(() => {
      const status = bot.getAutomationStatus();
      if (status.currentTask !== 'No current task') {
        console.log(`📊 Automation Status: ${status.progress} - ${status.currentTask}`);
        if (status.isPaused) {
          console.log(`⏸️ Paused: ${status.pauseReason}`);
        }
      }
    }, 5000);
    
    const result = await bot.login(useRealChrome);
    
    clearInterval(statusInterval);
    
    if (result.success) {
      console.log('🎉 Đăng nhập thành công!');
      
      // Keep browser open to see result
      console.log('⏳ Giữ browser mở trong 30 giây để xem kết quả...');
      await Utils.delay(30000);
    } else {
      console.error('❌ Đăng nhập thất bại:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Lỗi:', error);
  } finally {
    await bot.close();
  }
}

// Run the application
if (require.main === module) {
  main().catch(console.error);
}

export { TikTokLoginBot };
