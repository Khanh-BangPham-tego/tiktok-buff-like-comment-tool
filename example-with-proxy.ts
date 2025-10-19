import { TikTokLoginBot } from './src/main';

async function main(): Promise<void> {
  const bot = new TikTokLoginBot();
  
  try {
    console.log('🚀 Khởi tạo TikTok Login Bot (không dùng proxy)...');
    
    // Thực hiện đăng nhập
    await bot.login();
    
    console.log('✅ Đăng nhập thành công!');
    
    // Giữ browser mở để xem kết quả
    console.log('⏳ Giữ browser mở trong 30 giây để xem kết quả...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await bot.close();
  }
}

// Chạy ứng dụng
if (require.main === module) {
  main().catch(console.error);
}

export { main };

