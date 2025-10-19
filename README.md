# TikTok Login Automation

Dự án tự động đăng nhập TikTok sử dụng Puppeteer và TypeScript.

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Build project:
```bash
npm run build
```

## Sử dụng

### Chạy trực tiếp với ts-node (khuyến nghị cho development):
```bash
npm run dev
```

### Chạy với Chrome thật (khuyến nghị để bypass rate limiting):
```bash
npm run dev:real
# hoặc
yarn dev --real
```

### Chạy với Chrome thật + Tắt proxy (khi bị rate limiting):
```bash
npm run dev:clean
# hoặc
yarn dev:clean
# hoặc
yarn dev --real --no-proxy
```

### Chạy với Firefox (khuyến nghị để bypass detection):
```bash
npm run dev:firefox
# hoặc
yarn dev:firefox
# hoặc
yarn dev --firefox --no-proxy
```

### Chạy với Edge:
```bash
npm run dev:edge
# hoặc
yarn dev:edge
# hoặc
yarn dev --edge --no-proxy
```

### Chạy sau khi build:
```bash
npm start
```

## Cấu hình

### File accounts.txt
Tạo file `accounts.txt` trong thư mục gốc với format:
```
username1:password1
username2:password2
```

Ví dụ:
```
nohalab850@memeazon.com:Bang#150902
```

## Tính năng

- ✅ Tự động mở browser và truy cập TikTok
- ✅ Click vào nút đăng nhập
- ✅ Kiểm tra login container xuất hiện
- ✅ Chọn tùy chọn "Sử dụng số điện thoại/email/tên người dùng"
- ✅ Click vào link "Đăng nhập bằng email hoặc tên người dùng"
- ✅ Điền thông tin username và password từ file accounts.txt
- ✅ Submit form đăng nhập
- ✅ Giữ browser mở để xem kết quả

## Cải tiến Anti-Detection

- ✅ **Browser Fingerprinting**: Override WebGL, AudioContext, Device APIs
- ✅ **Screen Resolution**: Sử dụng các giá trị thật thay vì random
- ✅ **Canvas Fingerprint**: Pattern phức tạp hơn để tránh detection
- ✅ **Mouse Movement**: Bezier curve path giống user thật
- ✅ **Human Behavior**: Random scroll, hover, click patterns
- ✅ **Random Delays**: Delay dài giữa các lần thử (1-3 phút)
- ✅ **Stealth Overrides**: Ẩn tất cả dấu hiệu automation

## Lưu ý

- Browser sẽ chạy ở chế độ hiển thị (không headless) để dễ debug
- Sau khi đăng nhập thành công, browser sẽ mở trong 30 giây để xem kết quả
- Đảm bảo file `accounts.txt` có format đúng: `username:password`

## Giải quyết vấn đề "Maximum number of attempts reached"

Nếu bạn gặp lỗi này, code đã được cải tiến với:

### 🆕 Browser Profile Reset cải tiến
- ✅ **Fingerprint hoàn toàn mới**: Random user agent, viewport, timezone, locale
- ✅ **WebGL/AudioContext fingerprint**: Random values để tránh detection
- ✅ **Canvas fingerprint**: Pattern phức tạp với random noise
- ✅ **Device APIs**: Random device memory, hardware concurrency, battery
- ✅ **Connection API**: Random network characteristics
- ✅ **Media Devices**: Random device enumeration
- ✅ **Cleanup profiles cũ**: Xóa tất cả profiles cũ trước khi tạo mới

### 🌐 Proxy Support
- ✅ **Hỗ trợ nhiều loại proxy**: HTTP, HTTPS, SOCKS4, SOCKS5
- ✅ **Random proxy selection**: Tự động chọn proxy ngẫu nhiên
- ✅ **Proxy authentication**: Hỗ trợ username/password
- ✅ **Dynamic proxy management**: Thêm/xóa proxy trong runtime
- ✅ **Proxy error handling**: Xử lý lỗi proxy gracefully

### 🚀 Chrome Thật Support
- ✅ **Sử dụng Chrome thật**: Tự động phát hiện Chrome trên máy
- ✅ **Fingerprint tự nhiên**: Chrome thật có fingerprint hoàn toàn tự nhiên
- ✅ **Không bị phát hiện**: TikTok không thể phân biệt với user thật
- ✅ **Cross-platform**: Hỗ trợ Windows, Mac, Linux
- ✅ **Fallback**: Tự động fallback về Chromium nếu không tìm thấy Chrome

### 🦊 Firefox Support
- ✅ **Sử dụng Firefox thật**: Tự động phát hiện Firefox trên máy
- ✅ **Fingerprint hoàn toàn khác**: Firefox có fingerprint khác với Chrome
- ✅ **Ít bị phát hiện**: Firefox ít bị TikTok track hơn Chrome
- ✅ **Cross-platform**: Hỗ trợ Windows, Mac, Linux
- ✅ **User Agent đa dạng**: Nhiều version Firefox khác nhau

### 🌐 Edge Support
- ✅ **Sử dụng Edge thật**: Tự động phát hiện Edge trên máy
- ✅ **Fingerprint Microsoft**: Edge có fingerprint riêng của Microsoft
- ✅ **Ít phổ biến**: Ít bị TikTok track hơn Chrome
- ✅ **Cross-platform**: Hỗ trợ Windows, Mac, Linux
- ✅ **User Agent Edge**: User agent đặc trưng của Edge

### 📋 Cách sử dụng Proxy
1. Thêm proxy vào `src/main.ts`:
```typescript
private proxyList: string[] = [
  'http://proxy1.example.com:8080',
  'http://proxy2.example.com:3128',
  'socks5://proxy3.example.com:1080'
];
```

2. Hoặc thêm proxy động:
```typescript
const bot = new TikTokLoginBot();
bot.addProxy('http://proxy.example.com:8080');
```

3. Chạy bot:
```bash
npm run dev
```

Xem chi tiết trong [PROXY_GUIDE.md](PROXY_GUIDE.md)

### 📋 Cách sử dụng Chrome thật
1. **Cài đặt Chrome** (nếu chưa có):
   - Tải về từ: https://www.google.com/chrome/
   - Hoặc cài qua package manager

2. **Chạy với Chrome thật**:
   ```bash
   # Sử dụng npm
   npm run dev:real
   
   # Sử dụng yarn
   yarn dev --real
   
   # Hoặc trực tiếp
   npx ts-node src/main.ts --real
   ```

3. **Kiểm tra Chrome được phát hiện**:
   - Bot sẽ tự động tìm Chrome trên máy
   - Log sẽ hiển thị đường dẫn Chrome được sử dụng
   - Nếu không tìm thấy, sẽ fallback về Chromium

4. **Lợi ích của Chrome thật**:
   - Fingerprint hoàn toàn tự nhiên
   - Không bị TikTok phát hiện là automation
   - Performance tốt hơn Chromium
   - Hỗ trợ đầy đủ các tính năng Chrome

1. **Browser Profile Mới**: Mỗi lần chạy tạo profile hoàn toàn mới
2. **Fingerprint Random**: WebGL, AudioContext, Device APIs được randomize
3. **Human Behavior**: Mouse movement, scroll, hover giống user thật
4. **Long Delays**: Delay 1-3 phút giữa các lần thử
5. **Stealth Mode**: Ẩn tất cả dấu hiệu automation

### Khuyến nghị:
- Chạy code trên máy khác hoặc network khác
- Sử dụng VPN để thay đổi IP
- Tăng delay giữa các lần thử
- Đảm bảo không có browser profile cũ

## Scripts

- `npm run ui`: Chạy web UI server (http://localhost:3000)
- `npm run scrape`: Chạy TikTok automation (không UI)
- `npm run dev`: Chạy trực tiếp với ts-node
- `npm run build`: Build TypeScript thành JavaScript
- `npm start`: Chạy file JavaScript đã build
- `npm run watch`: Build và watch changes

## 🌐 Web UI

Tool hiện có giao diện web đẹp với:

### ✨ Tính năng UI
- **2 Input fields**: Account ID và Video URLs
- **Real-time validation**: Kiểm tra format tự động
- **Responsive design**: Hoạt động trên mọi thiết bị
- **Loading states**: Hiển thị khi đang xử lý
- **Success/Error feedback**: Visual feedback rõ ràng

### 🚀 Cách sử dụng UI
```bash
# Cài đặt dependencies
npm install

# Khởi động UI
npm run ui

# Truy cập: http://localhost:3000
```

### 📱 Input Format
- **Account ID**: `@user6549097821308` hoặc full URL
- **Video URLs**: Mỗi URL một dòng
- **Auto-validation**: Kiểm tra format TikTok

### 📊 Backend API
- `POST /api/scrape`: Nhận payload và log ra console
- `GET /api/health`: Health check
- Logs được lưu vào `scraper-logs.json`

# tiktok-buff-like-comment-tool
