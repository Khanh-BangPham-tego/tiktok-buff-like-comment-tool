// DOM Elements
const form = document.getElementById('scraperForm');
const accountIdInput = document.getElementById('accountId');
const videoUrlsInput = document.getElementById('videoUrls');
const submitBtn = document.getElementById('submitBtn');
const clearBtn = document.getElementById('clearBtn');
const resultSection = document.getElementById('result');
const resultContent = document.getElementById('resultContent');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoading = submitBtn.querySelector('.btn-loading');

// Utility functions
function showLoading() {
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'flex';
}

function hideLoading() {
    submitBtn.disabled = false;
    btnText.style.display = 'block';
    btnLoading.style.display = 'none';
}

function showResult(content, isError = false) {
    resultContent.textContent = content;
    resultContent.className = isError ? 'result-content error' : 'result-content';
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

function hideResult() {
    resultSection.style.display = 'none';
}

// Validate account ID
function validateAccountId(accountId) {
    if (!accountId.trim()) {
        return 'Account ID không được để trống';
    }
    
    // Check if it's a TikTok URL
    if (accountId.includes('tiktok.com')) {
        const match = accountId.match(/@([^/?]+)/);
        if (match) {
            return { isValid: true, username: match[1] };
        }
        return 'URL TikTok không hợp lệ';
    }
    
    // Check if it's a username (starts with @)
    if (accountId.startsWith('@')) {
        return { isValid: true, username: accountId.substring(1) };
    }
    
    // Check if it's just a username without @
    if (accountId.match(/^[a-zA-Z0-9._]+$/)) {
        return { isValid: true, username: accountId };
    }
    
    return 'Format Account ID không hợp lệ. Sử dụng @username hoặc URL TikTok';
}

// Validate video URLs
function validateVideoUrls(urls) {
    if (!urls.trim()) {
        return 'Danh sách video URLs không được để trống';
    }
    
    const urlList = urls.split('\n').map(url => url.trim()).filter(url => url);
    
    if (urlList.length === 0) {
        return 'Không có video URL hợp lệ nào';
    }
    
    const validUrls = [];
    const invalidUrls = [];
    
    urlList.forEach(url => {
        if (url.includes('tiktok.com') && url.includes('/video/')) {
            validUrls.push(url);
        } else {
            invalidUrls.push(url);
        }
    });
    
    if (validUrls.length === 0) {
        return 'Không có video URL TikTok hợp lệ nào';
    }
    
    return {
        isValid: true,
        validUrls,
        invalidUrls
    };
}

// Format payload for backend
function formatPayload(accountId, videoUrls) {
    const timestamp = new Date().toISOString();
    
    return {
        timestamp,
        accountId: accountId.username,
        originalAccountId: accountIdInput.value.trim(),
        videoUrls: videoUrls.validUrls,
        invalidUrls: videoUrls.invalidUrls,
        totalValidUrls: videoUrls.validUrls.length,
        totalInvalidUrls: videoUrls.invalidUrls.length
    };
}

// Handle form submission
async function handleSubmit(event) {
    event.preventDefault();
    
    // Hide previous results
    hideResult();
    
    // Get form data
    const accountIdValue = accountIdInput.value.trim();
    const videoUrlsValue = videoUrlsInput.value.trim();
    
    // Validate account ID
    const accountValidation = validateAccountId(accountIdValue);
    if (typeof accountValidation === 'string') {
        showResult(`❌ Lỗi Account ID: ${accountValidation}`, true);
        accountIdInput.classList.add('error');
        return;
    }
    accountIdInput.classList.remove('error');
    
    // Validate video URLs
    const urlsValidation = validateVideoUrls(videoUrlsValue);
    if (typeof urlsValidation === 'string') {
        showResult(`❌ Lỗi Video URLs: ${urlsValidation}`, true);
        videoUrlsInput.classList.add('error');
        return;
    }
    videoUrlsInput.classList.remove('error');
    
    // Show loading
    showLoading();
    
    try {
        // Format payload
        const payload = formatPayload(accountValidation, urlsValidation);
        
        // Log payload to console (for debugging)
        console.log('📦 Payload được gửi:', payload);
        
        // Simulate API call (replace with actual endpoint)
        const response = await fetch('/api/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Show success result ngay lập tức
        const resultText = `✅ Request đã được gửi thành công!\n\n📊 Thông tin:\n- Account: @${payload.accountId}\n- Video hợp lệ: ${payload.totalValidUrls}\n- Video không hợp lệ: ${payload.totalInvalidUrls}\n\n🤖 Bot đang chạy ngầm:\n1. Đang đăng nhập TikTok...\n2. Sẽ navigate đến profile @${payload.accountId}\n3. Browser sẽ mở để xem kết quả\n\n💡 Bạn có thể tiếp tục sử dụng UI trong khi bot chạy ngầm!\n\n📦 Payload đã gửi:\n${JSON.stringify(payload, null, 2)}`;
        showResult(resultText);
        
        // Add success styling
        accountIdInput.classList.add('success');
        videoUrlsInput.classList.add('success');
        
        // Clear form sau 3 giây để user có thể gửi request mới
        setTimeout(() => {
            accountIdInput.value = '';
            videoUrlsInput.value = '';
            accountIdInput.classList.remove('success', 'error');
            videoUrlsInput.classList.remove('success', 'error');
            hideResult();
        }, 3000);
        
    } catch (error) {
        console.error('❌ Lỗi khi gửi request:', error);
        
        // Show error result
        const errorText = `❌ Lỗi khi gửi request:\n\n${error.message}\n\n📦 Payload (đã log ra console):\n${JSON.stringify(formatPayload(accountValidation, urlsValidation), null, 2)}`;
        showResult(errorText, true);
        
        // Add error styling
        accountIdInput.classList.add('error');
        videoUrlsInput.classList.add('error');
    } finally {
        hideLoading();
    }
}

// Handle clear button
function handleClear() {
    accountIdInput.value = '';
    videoUrlsInput.value = '';
    hideResult();
    
    // Remove all styling
    accountIdInput.classList.remove('success', 'error');
    videoUrlsInput.classList.remove('success', 'error');
}

// Input validation on change
function handleInputChange(input, validator) {
    input.addEventListener('input', function() {
        const value = this.value.trim();
        if (value) {
            const validation = validator(value);
            if (typeof validation === 'string') {
                this.classList.add('error');
                this.classList.remove('success');
            } else {
                this.classList.add('success');
                this.classList.remove('error');
            }
        } else {
            this.classList.remove('success', 'error');
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners
    form.addEventListener('submit', handleSubmit);
    clearBtn.addEventListener('click', handleClear);
    
    // Add real-time validation
    handleInputChange(accountIdInput, validateAccountId);
    handleInputChange(videoUrlsInput, validateVideoUrls);
    
    // Add placeholder examples
    accountIdInput.addEventListener('focus', function() {
        if (!this.value) {
            this.placeholder = 'Ví dụ: @user6549097821308 hoặc https://www.tiktok.com/@user6549097821308';
        }
    });
    
    videoUrlsInput.addEventListener('focus', function() {
        if (!this.value) {
            this.placeholder = 'Ví dụ:\nhttps://www.tiktok.com/@kimberlykimpena/video/7548676769721650462?is_from_webapp=1&sender_device=pc\nhttps://www.tiktok.com/@fff66043/video/7530470979471084807?is_from_webapp=1&sender_device=pc';
        }
    });
    
    console.log('🎵 TikTok Tool UI đã sẵn sàng!');
});


