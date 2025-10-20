import { TikTokLoginBot } from './src/main';

/**
 * Test CAPTCHA handling system
 */
async function testCaptchaSystem(): Promise<void> {
  console.log('🧪 Testing CAPTCHA handling system...');
  
  const bot = new TikTokLoginBot();
  
  try {
    await bot.init();
    
    // Test automation status
    console.log('📊 Initial automation status:', bot.getAutomationStatus());
    
    // Add some test tasks
    bot.addAutomationTask('Test Task 1', async () => {
      console.log('✅ Test Task 1 completed');
      return 'Task 1 result';
    });
    
    bot.addAutomationTask('Test Task 2', async () => {
      console.log('✅ Test Task 2 completed');
      return 'Task 2 result';
    });
    
    // Test CAPTCHA monitoring
    console.log('🔍 Starting CAPTCHA monitoring...');
    await bot.startCaptchaMonitoring();
    
    // Show status
    console.log('📊 Automation status after adding tasks:', bot.getAutomationStatus());
    
    // Keep monitoring for a while
    console.log('⏳ Monitoring for 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Stop monitoring
    await bot.stopCaptchaMonitoring();
    console.log('⏹️ CAPTCHA monitoring stopped');
    
    console.log('✅ CAPTCHA system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await bot.close();
  }
}

/**
 * Test full login with CAPTCHA handling
 */
async function testFullLogin(): Promise<void> {
  console.log('🧪 Testing full login with CAPTCHA handling...');
  
  const bot = new TikTokLoginBot();
  
  try {
    await bot.init();
    
    // Check command line arguments
    const useRealChrome = process.argv.includes('--real');
    
    console.log('🚀 Testing login with CAPTCHA handling...');
    console.log(`🌐 Using ${useRealChrome ? 'real Chrome' : 'Chromium'}`);
    
    const result = await bot.login(useRealChrome);
    
    if (result.success) {
      console.log('🎉 Login test successful!');
    } else {
      console.log('❌ Login test failed:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Test error:', error);
  } finally {
    await bot.close();
  }
}

// Main test function
async function main(): Promise<void> {
  const testType = process.argv[2];
  
  switch (testType) {
    case 'captcha':
      await testCaptchaSystem();
      break;
    case 'login':
      await testFullLogin();
      break;
    default:
      console.log('🧪 Available tests:');
      console.log('  npm run test:captcha  - Test CAPTCHA system only');
      console.log('  npm run test:login   - Test full login with CAPTCHA');
      console.log('  npm run test:login -- --real  - Test with real Chrome');
      break;
  }
}

// Run tests
if (require.main === module) {
  main().catch(console.error);
}
