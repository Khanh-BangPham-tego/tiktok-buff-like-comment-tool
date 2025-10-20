# TikTok Bot - Cấu trúc Module

Thư mục `src` đã được cấu trúc lại thành các module riêng biệt để dễ debug và maintain.

## Cấu trúc thư mục

```
src/
├── main.ts                 # Main bot class và entry point
├── interfaces.ts           # Type definitions và interfaces
├── utils.ts               # Utility functions chung
├── browser-manager.ts     # Quản lý browser và anti-detection
├── login-handler.ts       # Xử lý logic đăng nhập TikTok
├── profile-handler.ts     # Xử lý logic profile TikTok
├── account-manager.ts     # Quản lý tài khoản
├── human-behavior.ts      # Mô phỏng hành vi người dùng
└── README.md              # File này
```

## Mô tả các module

### 1. `main.ts`
- **Chức năng**: Main bot class điều phối tất cả các hoạt động
- **Trách nhiệm**: 
  - Khởi tạo và quản lý các handler
  - Cung cấp API chính cho bot
  - Entry point của ứng dụng

### 2. `interfaces.ts`
- **Chức năng**: Định nghĩa các type và interface
- **Chứa**:
  - `Account`: Interface cho tài khoản
  - `BrowserConfig`: Cấu hình browser
  - `LoginResult`: Kết quả đăng nhập
  - `ProfileInfo`: Thông tin profile

### 3. `utils.ts`
- **Chức năng**: Các utility functions chung
- **Chứa**:
  - `Utils.delay()`: Delay execution
  - `Utils.humanLikeDelay()`: Random delay
  - `Utils.generateRandomString()`: Tạo string ngẫu nhiên
  - `Utils.getRandomUserAgent()`: Random user agent
  - `Utils.getRandomViewport()`: Random viewport
  - `Utils.getRandomTimezone()`: Random timezone
  - `Utils.getRandomLocale()`: Random locale

### 4. `browser-manager.ts`
- **Chức năng**: Quản lý browser và anti-detection
- **Trách nhiệm**:
  - Khởi tạo browser với cấu hình anti-detection
  - Tạo random fingerprint
  - Quản lý user data directory
  - Cleanup browser profiles
  - Reset browser state

### 5. `login-handler.ts`
- **Chức năng**: Xử lý logic đăng nhập TikTok
- **Trách nhiệm**:
  - Navigate đến TikTok
  - Click login button
  - Fill login form
  - Submit login
  - Kiểm tra lỗi đăng nhập

### 6. `profile-handler.ts`
- **Chức năng**: Xử lý logic profile TikTok
- **Trách nhiệm**:
  - Navigate đến profile
  - Kiểm tra profile tồn tại
  - Lấy thông tin profile

### 7. `account-manager.ts`
- **Chức năng**: Quản lý tài khoản
- **Trách nhiệm**:
  - Đọc accounts từ file hoặc environment variables
  - Validate account format
  - Cung cấp account cho login

### 8. `human-behavior.ts`
- **Chức năng**: Mô phỏng hành vi người dùng
- **Trách nhiệm**:
  - Human-like typing
  - Human-like clicking
  - Human-like scrolling
  - Random mouse movement
  - Random typing behavior

## Lợi ích của cấu trúc mới

### 1. **Dễ Debug**
- Mỗi module có trách nhiệm rõ ràng
- Lỗi dễ dàng trace về module cụ thể
- Code ngắn gọn, dễ đọc

### 2. **Dễ Maintain**
- Thay đổi logic chỉ cần sửa module tương ứng
- Không ảnh hưởng đến các module khác
- Code tái sử dụng cao

### 3. **Dễ Test**
- Mỗi module có thể test độc lập
- Mock dependencies dễ dàng
- Unit test hiệu quả

### 4. **Dễ Mở rộng**
- Thêm tính năng mới chỉ cần tạo module mới
- Không cần sửa code cũ
- Architecture scalable

## Cách sử dụng

### Khởi tạo bot
```typescript
const bot = new TikTokLoginBot();
await bot.init();
```

### Đăng nhập
```typescript
const result = await bot.login(useRealChrome);
if (result.success) {
  console.log('Đăng nhập thành công!');
} else {
  console.error('Đăng nhập thất bại:', result.error);
}
```

### Truy cập profile
```typescript
const profileInfo = await bot.navigateToProfile('username');
if (profileInfo.exists) {
  console.log('Profile tồn tại:', profileInfo.title);
} else {
  console.error('Profile không tồn tại:', profileInfo.error);
}
```

### Đóng bot
```typescript
await bot.close();
```

## Lưu ý

- Tất cả các module đều sử dụng TypeScript
- Mỗi module có thể import và sử dụng module khác
- Main class `TikTokLoginBot` là entry point chính
- Các handler được khởi tạo sau khi browser ready

