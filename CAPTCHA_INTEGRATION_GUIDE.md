# CAPTCHA Integration Guide - Hướng dẫn sử dụng hệ thống CAPTCHA

## 🎯 Tổng quan

Hệ thống CAPTCHA đã được **tích hợp hoàn toàn** vào luồng automation chính. Khi CAPTCHA xuất hiện, bot sẽ:

1. **Tự động pause** automation
2. **Phát hiện CAPTCHA** và phân loại (slider/click/text)
3. **Gửi thông báo** cho helper với screenshot và hướng dẫn
4. **Chờ human giải** CAPTCHA (timeout 10 phút)
5. **Tự động resume** automation từ vị trí đã dừng

## 🚀 Cách sử dụng

### 1. Chạy bot với CAPTCHA handling

```bash
# Chế độ Chromium (mặc định)
npm run dev

# Chế độ Chrome thật (khuyến nghị cho production)
npm run dev:real
```

### 2. Test hệ thống CAPTCHA

```bash
# Test chỉ CAPTCHA system
npm run test:captcha

# Test full login với CAPTCHA handling
npm run test:login

# Test với Chrome thật
npm run test:login:real
```

## 📊 Automation Status

Bot sẽ hiển thị trạng thái automation mỗi 5 giây:

```
📊 Automation Status: 3/5 - Perform Login
⏸️ Paused: CAPTCHA detected
```

### Các trạng thái:
- `pending` - Task chưa bắt đầu
- `running` - Task đang chạy
- `completed` - Task hoàn thành
- `paused` - Task bị pause (do CAPTCHA)
- `failed` - Task thất bại

## 🔍 Khi CAPTCHA xuất hiện

### 1. Bot tự động phát hiện và pause

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

1. **Mở browser** và truy cập URL trong `captcha-instructions.json`
2. **Giải CAPTCHA** theo hướng dẫn
3. **Tạo file** `captcha-resolved.json`:

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
🔄 Executing task 4/5: Perform Login
```

## 🛠️ API Methods

### Thêm custom tasks

```typescript
const bot = new TikTokLoginBot();
await bot.init();

// Thêm task tùy chỉnh
bot.addAutomationTask('Navigate to Profile', async () => {
  await bot.navigateToProfile('username');
});

bot.addAutomationTask('Scrape Videos', async () => {
  // Your scraping logic here
});
```

### Kiểm tra trạng thái

```typescript
const status = bot.getAutomationStatus();
console.log('Status:', status);
// Output: { 
//   isPaused: false, 
//   currentTask: "Perform Login", 
//   progress: "3/5",
//   progressPercentage: 60,
//   pauseReason: undefined
// }
```

### Manual control

```typescript
// Pause automation
await bot.automationSystem.pause('Manual pause');

// Resume automation
await bot.automationSystem.resume();

// Stop automation
await bot.automationSystem.stop();
```

## 🔧 Cấu hình

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

## 📋 Các loại CAPTCHA được hỗ trợ

### 1. Slider CAPTCHA
- **Phát hiện**: `.cap-flex`, `#captcha_slide_button`
- **Hướng dẫn**: Kéo thanh trượt để ghép hình

### 2. Click CAPTCHA
- **Phát hiện**: `button[id*="captcha"]`, `[data-testid*="captcha"]`
- **Hướng dẫn**: Click vào các hình ảnh theo yêu cầu

### 3. Text CAPTCHA
- **Phát hiện**: `input[placeholder*="captcha"]`
- **Hướng dẫn**: Nhập các ký tự trong hình

## 🚨 Troubleshooting

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

## 📁 Files quan trọng

### Generated files:
- `automation-state.json` - Trạng thái automation
- `captcha-notifications.json` - Lịch sử CAPTCHA
- `captcha-instructions.json` - Hướng dẫn hiện tại
- `captcha-resolved.json` - File resolution (temporary)

### Source files:
- `src/main.ts` - Main bot class với CAPTCHA integration
- `src/automation-pause-resume.ts` - Automation state management
- `src/captcha-detector.ts` - CAPTCHA detection
- `src/captcha-notification.ts` - CAPTCHA notification system

## 🎯 Best Practices

1. **Luôn sử dụng real Chrome** cho production (`npm run dev:real`)
2. **Monitor logs** để debug issues
3. **Backup state files** trước khi restart
4. **Test thoroughly** trước khi deploy
5. **Có backup plan** nếu CAPTCHA không được giải

## 🔄 Workflow hoàn chỉnh

```
1. Bot khởi động → Init CAPTCHA systems
2. Bot bắt đầu automation → Start CAPTCHA monitoring
3. Bot thực hiện tasks → Monitor for CAPTCHA
4. CAPTCHA xuất hiện → Pause automation + Create notification
5. Helper giải CAPTCHA → Create resolution file
6. Bot detect resolution → Resume automation
7. Bot hoàn thành tasks → Stop CAPTCHA monitoring
```

## 📞 Support

Nếu gặp vấn đề, hãy kiểm tra:

1. Console logs
2. Generated files (`captcha-*.json`, `automation-state.json`)
3. Browser console (nếu chạy non-headless)
4. Network requests trong DevTools

---

**🎉 Hệ thống CAPTCHA đã được tích hợp hoàn toàn! Bot sẽ tự động xử lý CAPTCHA và chờ human giải khi cần thiết.**
