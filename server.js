const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// CAPTCHA Storage (In-memory for Railway deployment)
const captchaQueue = new Map(); // notificationId -> captchaData
const captchaResults = new Map(); // notificationId -> result
const captchaStatus = new Map(); // notificationId -> status

// CAPTCHA Data Structure
const createCaptchaData = (notificationId, captchaInfo, screenshot, instructions, url, pageTitle) => ({
  notificationId,
  timestamp: new Date().toISOString(),
  status: 'pending', // pending, solving, solved, timeout
  captchaInfo,
  screenshot,
  instructions,
  url,
  pageTitle,
  solvedBy: null,
  solvedAt: null,
  notes: null
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// CAPTCHA UI page
app.get('/captcha', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'captcha.html'));
});

// ===== CAPTCHA API ENDPOINTS =====

/**
 * GET /api/captcha/queue - Lấy danh sách CAPTCHA cần giải
 */
app.get('/api/captcha/queue', (req, res) => {
    try {
        const pendingCaptchas = Array.from(captchaQueue.values())
            .filter(captcha => captcha.status === 'pending')
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const stats = {
            total: captchaQueue.size,
            pending: pendingCaptchas.length,
            solving: Array.from(captchaQueue.values()).filter(c => c.status === 'solving').length,
            solved: Array.from(captchaQueue.values()).filter(c => c.status === 'solved').length,
            timeout: Array.from(captchaQueue.values()).filter(c => c.status === 'timeout').length
        };

        res.json({
            success: true,
            data: {
                captchas: pendingCaptchas,
                stats: stats
            }
        });
    } catch (error) {
        console.error('❌ Lỗi khi lấy CAPTCHA queue:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy CAPTCHA queue',
            error: error.message
        });
    }
});

/**
 * POST /api/captcha/submit - Bot gửi CAPTCHA cần giải
 */
app.post('/api/captcha/submit', (req, res) => {
    try {
        const { notificationId, captchaInfo, screenshot, instructions, url, pageTitle } = req.body;
        
        if (!notificationId || !captchaInfo) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: notificationId, captchaInfo'
            });
        }

        const captchaData = createCaptchaData(
            notificationId, 
            captchaInfo, 
            screenshot, 
            instructions, 
            url, 
            pageTitle
        );

        captchaQueue.set(notificationId, captchaData);
        captchaStatus.set(notificationId, 'pending');

        console.log(`📧 CAPTCHA submitted to UI queue: ${notificationId}`);
        console.log(`📊 Queue size: ${captchaQueue.size}`);

        res.json({
            success: true,
            message: 'CAPTCHA đã được gửi vào queue',
            data: {
                notificationId: notificationId,
                queueSize: captchaQueue.size
            }
        });
    } catch (error) {
        console.error('❌ Lỗi khi submit CAPTCHA:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi submit CAPTCHA',
            error: error.message
        });
    }
});

/**
 * POST /api/captcha/solve - User giải CAPTCHA
 */
app.post('/api/captcha/solve', (req, res) => {
    try {
        const { notificationId, solved, notes, solvedBy } = req.body;
        
        if (!notificationId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required field: notificationId'
            });
        }

        const captchaData = captchaQueue.get(notificationId);
        if (!captchaData) {
            return res.status(404).json({
                success: false,
                message: 'CAPTCHA không tồn tại hoặc đã hết hạn'
            });
        }

        // Update CAPTCHA status
        captchaData.status = solved ? 'solved' : 'timeout';
        captchaData.solvedBy = solvedBy || 'Unknown User';
        captchaData.solvedAt = new Date().toISOString();
        captchaData.notes = notes;

        // Store result
        captchaResults.set(notificationId, {
            solved: solved,
            solvedAt: captchaData.solvedAt,
            solvedBy: captchaData.solvedBy,
            notes: notes
        });

        captchaStatus.set(notificationId, solved ? 'solved' : 'timeout');

        console.log(`✅ CAPTCHA ${solved ? 'solved' : 'timeout'}: ${notificationId} by ${captchaData.solvedBy}`);

        res.json({
            success: true,
            message: `CAPTCHA đã được ${solved ? 'giải thành công' : 'timeout'}`,
            data: {
                notificationId: notificationId,
                solved: solved,
                solvedAt: captchaData.solvedAt
            }
        });
    } catch (error) {
        console.error('❌ Lỗi khi solve CAPTCHA:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi solve CAPTCHA',
            error: error.message
        });
    }
});

/**
 * GET /api/captcha/status/:notificationId - Kiểm tra trạng thái CAPTCHA
 */
app.get('/api/captcha/status/:notificationId', (req, res) => {
    try {
        const { notificationId } = req.params;
        
        const captchaData = captchaQueue.get(notificationId);
        const result = captchaResults.get(notificationId);
        const status = captchaStatus.get(notificationId);

        if (!captchaData) {
            return res.status(404).json({
                success: false,
                message: 'CAPTCHA không tồn tại'
            });
        }

        res.json({
            success: true,
            data: {
                notificationId: notificationId,
                status: status || captchaData.status,
                result: result,
                captchaData: {
                    timestamp: captchaData.timestamp,
                    captchaType: captchaData.captchaInfo.type,
                    url: captchaData.url,
                    pageTitle: captchaData.pageTitle
                }
            }
        });
    } catch (error) {
        console.error('❌ Lỗi khi check CAPTCHA status:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi check CAPTCHA status',
            error: error.message
        });
    }
});

/**
 * GET /api/captcha/result/:notificationId - Bot lấy kết quả CAPTCHA
 */
app.get('/api/captcha/result/:notificationId', (req, res) => {
    try {
        const { notificationId } = req.params;
        
        const result = captchaResults.get(notificationId);
        const status = captchaStatus.get(notificationId);

        if (!result && !status) {
            return res.json({
                success: true,
                data: {
                    resolved: false,
                    status: 'pending'
                }
            });
        }

        const resolved = status === 'solved' && result && result.solved;

        res.json({
            success: true,
            data: {
                resolved: resolved,
                status: status,
                result: result
            }
        });
    } catch (error) {
        console.error('❌ Lỗi khi get CAPTCHA result:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi get CAPTCHA result',
            error: error.message
        });
    }
});

/**
 * DELETE /api/captcha/cleanup - Cleanup old CAPTCHAs (optional)
 */
app.delete('/api/captcha/cleanup', (req, res) => {
    try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
        
        let cleanedCount = 0;
        
        for (const [notificationId, captchaData] of captchaQueue.entries()) {
            const captchaTime = new Date(captchaData.timestamp);
            if (captchaTime < oneHourAgo && (captchaData.status === 'solved' || captchaData.status === 'timeout')) {
                captchaQueue.delete(notificationId);
                captchaResults.delete(notificationId);
                captchaStatus.delete(notificationId);
                cleanedCount++;
            }
        }

        console.log(`🧹 Cleaned up ${cleanedCount} old CAPTCHAs`);

        res.json({
            success: true,
            message: `Cleaned up ${cleanedCount} old CAPTCHAs`,
            data: {
                cleanedCount: cleanedCount,
                remainingCount: captchaQueue.size
            }
        });
    } catch (error) {
        console.error('❌ Lỗi khi cleanup CAPTCHAs:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cleanup CAPTCHAs',
            error: error.message
        });
    }
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
        timestamp: new Date().toISOString(),
        captcha: {
            queueSize: captchaQueue.size,
            pendingCount: Array.from(captchaQueue.values()).filter(c => c.status === 'pending').length,
            solvedCount: Array.from(captchaQueue.values()).filter(c => c.status === 'solved').length
        }
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
    console.log(`🎯 CAPTCHA UI: http://localhost:${PORT}/captcha`);
    console.log(`📝 Logs sẽ được lưu vào file: scraper-logs.json`);
    console.log(`\n🔧 CAPTCHA API Endpoints:`);
    console.log(`   GET  /api/captcha/queue           - Lấy danh sách CAPTCHA cần giải`);
    console.log(`   POST /api/captcha/submit          - Bot gửi CAPTCHA cần giải`);
    console.log(`   POST /api/captcha/solve           - User giải CAPTCHA`);
    console.log(`   GET  /api/captcha/status/:id      - Kiểm tra trạng thái CAPTCHA`);
    console.log(`   GET  /api/captcha/result/:id      - Bot lấy kết quả CAPTCHA`);
    console.log(`   DELETE /api/captcha/cleanup       - Cleanup old CAPTCHAs`);
});

module.exports = app;


