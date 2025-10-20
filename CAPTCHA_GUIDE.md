# CAPTCHA Handling System Guide

## Tổng quan

Hệ thống CAPTCHA handling được thiết kế để tự động phát hiện và xử lý CAPTCHA trong quá trình automation TikTok. Khi CAPTCHA xuất hiện, hệ thống sẽ:

1. **Tự động pause** automation
2. **Gửi thông báo** cho helper để giải CAPTCHA
3. **Chờ human giải** CAPTCHA
4. **Tự động resume** automation từ vị trí đã dừng

## Cấu trúc Files

```
src/
├── captcha-detector.ts          # Phát hiện CAPTCHA
├── captcha-notification.ts      # Gửi thông báo cho helper
├── automation-pause-resume.ts   # Universal pause/resume system
├── main.ts                      # Tích hợp CAPTCHA system
└── interfaces.ts                # Các interface mới
```

## Cách sử dụng

### 1. Chạy bot với CAPTCHA handling

```typescript
import { TikTokLoginBot } from './src/main';

const bot = new TikTokLoginBot();
await bot.init();

// Login với CAPTCHA handling
const result = await bot.login(true); // useRealChrome = true
```

### 2. Thêm custom tasks

```typescript
// Thêm task tùy chỉnh
bot.addAutomationTask('Navigate to Profile', async () => {
  await bot.navigateToProfile('username');
});

bot.addAutomationTask('Scrape Videos', async () => {
  // Your scraping logic here
});
```

### 3. Kiểm tra trạng thái automation

```typescript
const status = bot.getAutomationStatus();
console.log('Status:', status);
// Output: { isPaused: false, currentTask: "Navigate to TikTok", progress: "3/8" }
```

## Khi CAPTCHA xuất hiện

### 1. Bot tự động pause

```
🚨 CAPTCHA detected - pausing automation...
📧 CAPTCHA notification created: captcha_1234567890_abc123
📋 Human instructions created: ./captcha-instructions.json
⏳ Đợi người thật giải CAPTCHA...
```

### 2. Files được tạo

- `captcha-notifications.json` - Lưu thông tin CAPTCHA
- `captcha-instructions.json` - Hướng dẫn cho helper
- `automation-state.json` - Trạng thái automation hiện tại

### 3. Helper giải CAPTCHA

1. Mở browser và truy cập URL trong `captcha-instructions.json`
2. Giải CAPTCHA theo hướng dẫn
3. Tạo file `captcha-resolved.json`:

```json
{
  "resolved": true,
  "notificationId": "captcha_1234567890_abc123"
}
```

### 4. Bot tự động resume

```
✅ CAPTCHA đã được giải bởi người thật
🔄 Resuming automation...
🔄 Executing task 4/8: Click Login Button
```

## Các loại CAPTCHA được hỗ trợ

### 1. Slider CAPTCHA
- **Phát hiện**: `.cap-flex`, `#captcha_slide_button`
- **Hướng dẫn**: Kéo thanh trượt để ghép hình

### 2. Click CAPTCHA
- **Phát hiện**: `button[id*="captcha"]`, `[data-testid*="captcha"]`
- **Hướng dẫn**: Click vào các hình ảnh theo yêu cầu

### 3. Text CAPTCHA
- **Phát hiện**: `input[placeholder*="captcha"]`
- **Hướng dẫn**: Nhập các ký tự trong hình

## Testing

### Test toàn bộ hệ thống

```bash
npm run dev:real
# hoặc
ts-node example-captcha-test.ts
```

### Test chỉ CAPTCHA detection

```bash
ts-node example-captcha-test.ts --detection-only
```

## Cấu hình

### Timeout settings

```typescript
// Trong captcha-notification.ts
const timeoutMs = 600000; // 10 phút (có thể thay đổi)
```

### Check interval

```typescript
// Trong captcha-detector.ts
setInterval(checkCaptcha, 2000); // 2 giây (có thể thay đổi)
```

## Troubleshooting

### 1. CAPTCHA không được phát hiện

- Kiểm tra selectors trong `captcha-detector.ts`
- Thêm selector mới nếu cần
- Kiểm tra console logs

### 2. Bot không resume sau khi giải CAPTCHA

- Kiểm tra file `captcha-resolved.json` có đúng format không
- Kiểm tra `notificationId` có khớp không
- Kiểm tra logs để xem lỗi

### 3. Automation bị stuck

- Xóa file `automation-state.json` để reset
- Xóa file `captcha-resolved.json` nếu có
- Restart bot

## Advanced Usage

### Custom CAPTCHA handlers

```typescript
// Thêm custom CAPTCHA type
const customSelectors = {
  custom: [
    '.my-custom-captcha',
    '[data-captcha="custom"]'
  ]
};
```

### Webhook notifications

```typescript
// Gửi thông báo qua webhook
const webhookUrl = 'https://your-webhook-url.com/captcha';
await fetch(webhookUrl, {
  method: 'POST',
  body: JSON.stringify(captchaInfo)
});
```

## Monitoring

### Logs quan trọng

- `🔍 Bắt đầu monitoring CAPTCHA...` - CAPTCHA detection started
- `🚨 CAPTCHA detected` - CAPTCHA found
- `⏳ Đợi người thật giải CAPTCHA...` - Waiting for human
- `✅ CAPTCHA đã được giải` - CAPTCHA resolved
- `🔄 Resuming automation...` - Automation resumed

### Files để monitor

- `captcha-notifications.json` - Tất cả CAPTCHA events
- `automation-state.json` - Trạng thái automation
- `captcha-instructions.json` - Hướng dẫn hiện tại

## Best Practices

1. **Luôn sử dụng real Chrome** cho production
2. **Monitor logs** để debug issues
3. **Backup state files** trước khi restart
4. **Test thoroughly** trước khi deploy
5. **Có backup plan** nếu CAPTCHA không được giải

## Support

Nếu gặp vấn đề, hãy kiểm tra:

1. Console logs
2. Generated files (`captcha-*.json`)
3. Browser console (nếu chạy non-headless)
4. Network requests trong DevTools

