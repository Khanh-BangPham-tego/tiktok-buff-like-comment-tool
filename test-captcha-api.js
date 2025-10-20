const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

/**
 * Test CAPTCHA API endpoints
 */
async function testCaptchaAPI() {
    const baseUrl = 'http://localhost:3000';
    
    console.log('🧪 Testing CAPTCHA API endpoints...\n');
    
    try {
        // 1. Test health check
        console.log('1️⃣ Testing health check...');
        const healthResponse = await fetch(`${baseUrl}/api/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData);
        console.log('');
        
        // 2. Test CAPTCHA queue (should be empty)
        console.log('2️⃣ Testing CAPTCHA queue...');
        const queueResponse = await fetch(`${baseUrl}/api/captcha/queue`);
        const queueData = await queueResponse.json();
        console.log('✅ CAPTCHA queue:', queueData);
        console.log('');
        
        // 3. Test submit CAPTCHA
        console.log('3️⃣ Testing submit CAPTCHA...');
        const testCaptcha = {
            notificationId: 'test_captcha_123',
            captchaInfo: {
                type: 'slider',
                isPresent: true,
                selectors: ['.cap-flex'],
                timestamp: new Date().toISOString(),
                url: 'https://www.tiktok.com/login'
            },
            screenshot: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // 1x1 pixel
            instructions: [
                'Đây là CAPTCHA slider',
                'Kéo thanh trượt để ghép hình hoàn chỉnh',
                'Kéo từ trái sang phải cho đến khi hình khớp'
            ],
            url: 'https://www.tiktok.com/login',
            pageTitle: 'TikTok Login'
        };
        
        const submitResponse = await fetch(`${baseUrl}/api/captcha/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testCaptcha)
        });
        const submitData = await submitResponse.json();
        console.log('✅ Submit CAPTCHA:', submitData);
        console.log('');
        
        // 4. Test CAPTCHA queue again (should have 1 item)
        console.log('4️⃣ Testing CAPTCHA queue after submit...');
        const queueResponse2 = await fetch(`${baseUrl}/api/captcha/queue`);
        const queueData2 = await queueResponse2.json();
        console.log('✅ CAPTCHA queue after submit:', queueData2);
        console.log('');
        
        // 5. Test CAPTCHA status
        console.log('5️⃣ Testing CAPTCHA status...');
        const statusResponse = await fetch(`${baseUrl}/api/captcha/status/test_captcha_123`);
        const statusData = await statusResponse.json();
        console.log('✅ CAPTCHA status:', statusData);
        console.log('');
        
        // 6. Test solve CAPTCHA
        console.log('6️⃣ Testing solve CAPTCHA...');
        const solveResponse = await fetch(`${baseUrl}/api/captcha/solve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                notificationId: 'test_captcha_123',
                solved: true,
                solvedBy: 'Test User',
                notes: 'Test solve via API'
            })
        });
        const solveData = await solveResponse.json();
        console.log('✅ Solve CAPTCHA:', solveData);
        console.log('');
        
        // 7. Test CAPTCHA result
        console.log('7️⃣ Testing CAPTCHA result...');
        const resultResponse = await fetch(`${baseUrl}/api/captcha/result/test_captcha_123`);
        const resultData = await resultResponse.json();
        console.log('✅ CAPTCHA result:', resultData);
        console.log('');
        
        // 8. Test cleanup
        console.log('8️⃣ Testing cleanup...');
        const cleanupResponse = await fetch(`${baseUrl}/api/captcha/cleanup`, {
            method: 'DELETE'
        });
        const cleanupData = await cleanupResponse.json();
        console.log('✅ Cleanup:', cleanupData);
        console.log('');
        
        console.log('🎉 All CAPTCHA API tests passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run tests
if (require.main === module) {
    testCaptchaAPI().catch(console.error);
}

module.exports = { testCaptchaAPI };
