const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint để nhận payload và chạy scraper
app.post('/api/scrape', async (req, res) => {
    try {
        const payload = req.body;
        
        console.log('\n🚀 ===== TIKTOK SCRAPER PAYLOAD =====');
        console.log('📅 Timestamp:', payload.timestamp);
        console.log('👤 Account ID:', payload.accountId);
        console.log('🔗 Original Account ID:', payload.originalAccountId);
        console.log('📊 Total Valid URLs:', payload.totalValidUrls);
        console.log('❌ Total Invalid URLs:', payload.totalInvalidUrls);
        
        if (payload.invalidUrls && payload.invalidUrls.length > 0) {
            console.log('⚠️  Invalid URLs:');
            payload.invalidUrls.forEach((url, index) => {
                console.log(`   ${index + 1}. ${url}`);
            });
        }
        
        console.log('\n🎬 Valid Video URLs:');
        payload.videoUrls.forEach((url, index) => {
            console.log(`   ${index + 1}. ${url}`);
        });
        
        console.log('\n📦 Full Payload JSON:');
        console.log(JSON.stringify(payload, null, 2));
        console.log('=====================================\n');
        
        // Log to file (optional)
        const fs = require('fs');
        const logEntry = {
            timestamp: new Date().toISOString(),
            payload: payload
        };
        
        // Append to log file
        fs.appendFileSync('scraper-logs.json', JSON.stringify(logEntry) + '\n');
        
        // Trả về response ngay lập tức
        res.json({
            success: true,
            message: 'Request đã được nhận và đang xử lý ngầm',
            data: {
                accountId: payload.accountId,
                totalUrls: payload.totalValidUrls,
                timestamp: payload.timestamp,
                status: 'processing'
            }
        });
        
        // Chạy scraper bất đồng bộ (không block response)
        setImmediate(async () => {
            const processId = Math.random().toString(36).substr(2, 9);
            const timestamp = new Date().toISOString();
            let bot = null;
            
            try {
                console.log(`[${timestamp}] [${processId}] 🤖 Bắt đầu TikTok scraper (chạy ngầm)...`);
                console.log(`[${timestamp}] [${processId}] 📊 Payload:`, JSON.stringify(payload, null, 2));
                
                const { TikTokLoginBot } = require('./dist/main.js');
                bot = new TikTokLoginBot();
                
                // Đăng nhập TikTok
                console.log(`[${timestamp}] [${processId}] 🔐 Đang đăng nhập TikTok...`);
                await bot.login(true); // Sử dụng Chrome thật
                
                // Navigate đến profile của account
                console.log(`[${timestamp}] [${processId}] 👤 Đang navigate đến profile: @${payload.accountId}`);
                await bot.navigateToProfile(payload.accountId);
                
                // Giữ browser mở để xem kết quả
                console.log(`[${timestamp}] [${processId}] ⏳ Giữ browser mở trong 60 giây để xem kết quả...`);
                await new Promise(resolve => setTimeout(resolve, 60000));
                
                console.log(`[${timestamp}] [${processId}] ✅ Scraping hoàn thành!`);
                
            } catch (scraperError) {
                console.error(`[${timestamp}] [${processId}] ❌ Lỗi khi chạy scraper (ngầm):`, scraperError);
            } finally {
                if (bot) {
                    try {
                        await bot.close();
                        console.log(`[${timestamp}] [${processId}] 🔒 Browser đã được đóng`);
                    } catch (closeError) {
                        console.error(`[${timestamp}] [${processId}] ❌ Lỗi khi đóng browser:`, closeError);
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Lỗi khi xử lý payload:', error);
        
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xử lý payload',
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'TikTok Scraper API đang hoạt động',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).json({
        success: false,
        message: 'Lỗi server nội bộ',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint không tồn tại'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 TikTok Scraper Server đang chạy trên port ${PORT}`);
    console.log(`🌐 Truy cập: http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📝 Logs sẽ được lưu vào file: scraper-logs.json`);
});

module.exports = app;


