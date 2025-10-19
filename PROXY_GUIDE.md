# Hướng dẫn sử dụng Proxy với TikTok Login Bot

## Tổng quan

TikTok Login Bot đã được cải tiến với hỗ trợ proxy để thay đổi IP address và bypass rate limiting. Khi bị giới hạn "Maximum number of attempts reached", việc sử dụng proxy sẽ giúp bạn có thể đăng nhập lại.

## Cách thêm Proxy

### 1. Thêm proxy trực tiếp trong code

Mở file `src/main.ts` và tìm dòng:

```typescript
private proxyList: string[] = [
  // Thêm danh sách proxy của bạn ở đây
  // 'http://proxy1:port',
  // 'http://proxy2:port',
];
```

Thay thế bằng danh sách proxy thực tế:

```typescript
private proxyList: string[] = [
  'http://proxy1.example.com:8080',
  'http://proxy2.example.com:3128',
  'socks5://proxy3.example.com:1080',
  'http://username:password@proxy4.example.com:8080',
];
```

### 2. Thêm proxy động trong code

```typescript
const bot = new TikTokLoginBot();

// Thêm proxy đơn lẻ
bot.addProxy('http://proxy1.example.com:8080');

// Thêm nhiều proxy cùng lúc
bot.addProxies([
  'http://proxy1.example.com:8080',
  'http://proxy2.example.com:3128',
  'socks5://proxy3.example.com:1080'
]);

// Hiển thị danh sách proxy
bot.showProxies();

// Xóa tất cả proxy
bot.clearProxies();
```

## Các loại Proxy được hỗ trợ

### 1. HTTP Proxy
```
http://proxy.example.com:8080
http://username:password@proxy.example.com:8080
```

### 2. HTTPS Proxy
```
https://proxy.example.com:8080
https://username:password@proxy.example.com:8080
```

### 3. SOCKS5 Proxy
```
socks5://proxy.example.com:1080
socks5://username:password@proxy.example.com:1080
```

### 4. SOCKS4 Proxy
```
socks4://proxy.example.com:1080
```

## Lấy Proxy miễn phí

### 1. Proxy miễn phí (không ổn định)
- https://www.proxy-list.download/
- https://free-proxy-list.net/
- https://www.proxynova.com/proxy-server-list/

### 2. Proxy trả phí (ổn định hơn)
- https://www.brightdata.com/
- https://www.oxylabs.io/
- https://smartproxy.com/
- https://www.proxyscrape.com/

## Cách sử dụng

### 1. Chạy với proxy
```bash
npm run dev
```

Bot sẽ tự động chọn proxy ngẫu nhiên từ danh sách và sử dụng để kết nối.

### 2. Kiểm tra proxy hoạt động
Khi chạy bot, bạn sẽ thấy log:
```
🎲 Random User Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
🎲 Random Viewport: 1920x1080
🎲 Random Timezone: America/New_York
🎲 Random Locale: en-US
🌐 Random Proxy: http://proxy1.example.com:8080
```

## Xử lý lỗi Proxy

### 1. Proxy không hoạt động
Nếu proxy không hoạt động, bot sẽ báo lỗi:
```
❌ Lỗi khi kết nối proxy: Error: net::ERR_PROXY_CONNECTION_FAILED
```

**Giải pháp:**
- Kiểm tra proxy có hoạt động không
- Thử proxy khác
- Xóa proxy lỗi khỏi danh sách

### 2. Proxy bị chặn bởi TikTok
Nếu TikTok chặn proxy, bot sẽ báo lỗi:
```
❌ Lỗi khi truy cập TikTok: Error: net::ERR_TUNNEL_CONNECTION_FAILED
```

**Giải pháp:**
- Sử dụng proxy từ quốc gia khác
- Sử dụng proxy residential thay vì datacenter
- Thử proxy khác

## Cải tiến Browser Profile Reset

### 1. Fingerprint hoàn toàn mới
Mỗi lần tạo browser mới, bot sẽ:
- Tạo user data directory mới
- Random user agent
- Random viewport
- Random timezone
- Random locale
- Random WebGL fingerprint
- Random AudioContext fingerprint
- Random Canvas fingerprint
- Random Device Memory
- Random Hardware Concurrency
- Random Battery API
- Random Connection API
- Random Media Devices

### 2. Cleanup profiles cũ
Trước khi tạo browser mới, bot sẽ:
- Xóa tất cả browser profiles cũ
- Đợi 2 giây để đảm bảo cleanup hoàn tất
- Tạo profile hoàn toàn mới

## Lưu ý quan trọng

### 1. Chất lượng Proxy
- Sử dụng proxy chất lượng cao
- Tránh proxy miễn phí (thường bị chặn)
- Sử dụng proxy residential thay vì datacenter

### 2. Tần suất sử dụng
- Không sử dụng quá nhiều lần liên tiếp
- Đợi ít nhất 1-2 giờ giữa các lần thử
- Sử dụng proxy khác nhau cho mỗi lần thử

### 3. Bảo mật
- Không chia sẻ proxy với người khác
- Sử dụng proxy riêng cho mỗi tài khoản
- Thay đổi proxy thường xuyên

## Troubleshooting

### 1. Bot không kết nối được
- Kiểm tra proxy có hoạt động không
- Kiểm tra firewall/antivirus
- Thử proxy khác

### 2. TikTok vẫn phát hiện
- Sử dụng proxy residential
- Thay đổi user agent
- Thay đổi timezone
- Đợi lâu hơn giữa các lần thử

### 3. Lỗi "Maximum number of attempts reached"
- Sử dụng proxy khác
- Đợi ít nhất 1-2 giờ
- Thay đổi tài khoản
- Sử dụng VPN thay vì proxy

## Ví dụ sử dụng

```typescript
import { TikTokLoginBot } from './src/main';

async function main() {
  const bot = new TikTokLoginBot();
  
  // Thêm proxy
  bot.addProxies([
    'http://proxy1.example.com:8080',
    'http://proxy2.example.com:3128',
    'socks5://proxy3.example.com:1080'
  ]);
  
  // Hiển thị danh sách proxy
  bot.showProxies();
  
  try {
    await bot.login();
    console.log('✅ Đăng nhập thành công!');
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await bot.close();
  }
}

main();
```

## Kết luận

Với hỗ trợ proxy và cải tiến browser profile reset, TikTok Login Bot giờ đây có khả năng bypass rate limiting tốt hơn nhiều. Hãy sử dụng proxy chất lượng cao và tuân thủ các lưu ý để đạt hiệu quả tốt nhất.

