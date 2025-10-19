# 🎵 TikTok Scraper Tool - UI Guide

## 🚀 Cách sử dụng UI

### 1. Khởi động UI
```bash
# Cài đặt dependencies
npm install

# Khởi động UI server
npm run ui
```

Truy cập: http://localhost:3000

### 2. Sử dụng giao diện

#### 📱 Input Account ID
- **Format 1**: `@user6549097821308`
- **Format 2**: `https://www.tiktok.com/@user6549097821308`
- **Format 3**: `user6549097821308` (không cần @)

#### 🎬 Input Video URLs
Mỗi video URL một dòng:
```
https://www.tiktok.com/@kimberlykimpena/video/7548676769721650462?is_from_webapp=1&sender_device=pc
https://www.tiktok.com/@fff66043/video/7530470979471084807?is_from_webapp=1&sender_device=pc
```

### 3. Tính năng UI

#### ✅ Validation tự động
- Kiểm tra format Account ID
- Validate TikTok video URLs
- Hiển thị lỗi real-time

#### 🎨 UI Features
- **Responsive design**: Hoạt động trên mobile/desktop
- **Loading states**: Hiển thị khi đang xử lý
- **Success/Error styling**: Visual feedback
- **Auto-clear**: Nút xóa tất cả

#### 📊 Kết quả
- Hiển thị thống kê
- Log payload ra console
- Lưu logs vào file `scraper-logs.json`

## 🔧 Backend API

### Endpoints

#### `POST /api/scrape`
Nhận payload từ UI và log ra console.

**Request Body:**
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "accountId": "user6549097821308",
  "originalAccountId": "@user6549097821308",
  "videoUrls": [
    "https://www.tiktok.com/@kimberlykimpena/video/7548676769721650462?is_from_webapp=1&sender_device=pc"
  ],
  "invalidUrls": [],
  "totalValidUrls": 1,
  "totalInvalidUrls": 0
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payload đã được nhận và xử lý thành công",
  "data": {
    "accountId": "user6549097821308",
    "totalUrls": 1,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### `GET /api/health`
Health check endpoint.

## 📁 Cấu trúc file

```
tiktok-tool/
├── public/
│   ├── index.html          # UI chính
│   ├── style.css           # Styling
│   └── script.js           # JavaScript logic
├── src/
│   └── main.ts             # TikTok automation code
├── server.js               # Express server
├── package.json            # Dependencies
└── scraper-logs.json       # Logs (tự tạo)
```

## 🎯 Workflow

1. **User nhập data** → UI validation
2. **Submit form** → Gửi POST request
3. **Backend nhận** → Log payload ra console
4. **Response** → Hiển thị kết quả cho user

## 🔄 Tích hợp với TikTok Code

Để tích hợp với code TikTok hiện có:

1. **Thay thế endpoint** trong `script.js`:
```javascript
// Thay vì gửi đến /api/scrape
// Gọi trực tiếp TikTok automation
const result = await callTikTokAutomation(payload);
```

2. **Tạo function** trong `src/main.ts`:
```typescript
export async function scrapeVideos(accountId: string, videoUrls: string[]) {
  // Logic scrape videos
  // Sử dụng TikTokLoginBot hiện có
}
```

3. **Import và sử dụng**:
```javascript
import { scrapeVideos } from './src/main.js';
```

## 🚀 Scripts

```bash
# Chạy UI server
npm run ui

# Chạy TikTok automation (không UI)
npm run scrape

# Build TypeScript
npm run build

# Development mode
npm run dev
```

## 📝 Logs

Logs được lưu vào `scraper-logs.json`:
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "payload": {
    "accountId": "user6549097821308",
    "videoUrls": [...],
    "totalValidUrls": 5
  }
}
```

## 🎨 Customization

### Thay đổi styling
Chỉnh sửa `public/style.css`:
- Colors: `#667eea`, `#764ba2`
- Fonts: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`
- Layout: Responsive grid

### Thay đổi validation
Chỉnh sửa `public/script.js`:
- `validateAccountId()`: Logic validate account
- `validateVideoUrls()`: Logic validate URLs

### Thay đổi backend
Chỉnh sửa `server.js`:
- `/api/scrape`: Xử lý payload
- Logging: Format logs
- Response: Custom response format


