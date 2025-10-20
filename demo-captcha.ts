import { TikTokLoginBot } from './src/main';

/**
 * Demo: CAPTCHA handling trong thực tế
 */
async function demoCaptchaHandling(): Promise<void> {
  console.log('🎬 Demo: CAPTCHA handling system');
  console.log('================================');
  
  const bot = new TikTokLoginBot();
  
  try {
    await bot.init();
    
    // Thêm các tasks demo
    bot.addAutomationTask('Navigate to TikTok', async () => {
      console.log('🌐 Navigating to TikTok...');
      await bot.navigateToTikTok();
      return 'Navigation completed';
    });
    
    bot.addAutomationTask('Click Login Button', async () => {
      console.log('🔑 Clicking login button...');
      // Simulate login button click
      await new Promise(resolve => setTimeout(resolve, 1000));
      return 'Login button clicked';
    });
    
    bot.addAutomationTask('Fill Login Form', async () => {
      console.log('📝 Filling login form...');
      // Simulate form filling
      await new Promise(resolve => setTimeout(resolve, 2000));
      return 'Form filled';
    });
    
    bot.addAutomationTask('Submit Login', async () => {
      console.log('🚀 Submitting login...');
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      return 'Login submitted';
    });
    
    // Bắt đầu CAPTCHA monitoring
    await bot.startCaptchaMonitoring();
    
    console.log('\n📊 Automation Status:');
    console.log(bot.getAutomationStatus());
    
    console.log('\n🚀 Starting automation...');
    console.log('💡 Trong thực tế, nếu có CAPTCHA xuất hiện:');
    console.log('   1. Bot sẽ tự động pause');
    console.log('   2. Tạo file captcha-instructions.json');
    console.log('   3. Chờ human giải CAPTCHA');
    console.log('   4. Tự động resume khi giải xong');
    
    // Chạy automation (trong demo này sẽ không có CAPTCHA thật)
    await bot.automationSystem.startExecution();
    
    console.log('\n✅ Demo completed!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  } finally {
    await bot.close();
  }
}

/**
 * Demo: Manual CAPTCHA simulation
 */
async function demoManualCaptcha(): Promise<void> {
  console.log('🎭 Demo: Manual CAPTCHA simulation');
  console.log('==================================');
  
  const bot = new TikTokLoginBot();
  
  try {
    await bot.init();
    
    // Thêm task sẽ trigger CAPTCHA
    bot.addAutomationTask('Trigger CAPTCHA', async () => {
      console.log('🚨 Simulating CAPTCHA detection...');
      
      // Simulate CAPTCHA detection
      const mockCaptchaInfo = {
        isPresent: true,
        type: 'slider' as const,
        selectors: ['.cap-flex'],
        timestamp: new Date().toISOString(),
        url: 'https://www.tiktok.com/login'
      };
      
      // Trigger CAPTCHA callback manually
      if (bot['captchaDetector']) {
        bot['captchaDetector']['handleCaptchaDetected'](mockCaptchaInfo);
      }
      
      return 'CAPTCHA triggered';
    });
    
    // Start monitoring
    await bot.startCaptchaMonitoring();
    
    console.log('🔍 CAPTCHA monitoring started');
    console.log('⏳ Starting automation...');
    
    // Start automation
    await bot.automationSystem.startExecution();
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  } finally {
    await bot.close();
  }
}

// Main demo function
async function main(): Promise<void> {
  const demoType = process.argv[2];
  
  switch (demoType) {
    case 'basic':
      await demoCaptchaHandling();
      break;
    case 'manual':
      await demoManualCaptcha();
      break;
    default:
      console.log('🎬 Available demos:');
      console.log('  npm run demo:basic   - Basic CAPTCHA handling demo');
      console.log('  npm run demo:manual  - Manual CAPTCHA simulation');
      break;
  }
}

// Run demo
if (require.main === module) {
  main().catch(console.error);
}
