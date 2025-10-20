# CAPTCHA API System - Hướng dẫn sử dụng

## 🎯 Tổng quan

Hệ thống CAPTCHA API đã được implement hoàn chỉnh để hỗ trợ deployment trên Railway. Thay vì sử dụng file system, hệ thống sử dụng web API và UI để xử lý CAPTCHA.

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   TikTok Bot    │    │   Web Server    │    │   CAPTCHA UI    │
│                 │    │                 │    │                 │
│ 1. Detect CAPTCHA│───▶│ 2. Store in Queue│───▶│ 3. Show to User │
│ 4. Poll for result│◀───│ 5. Process result│◀───│ 6. User solves  │
│ 7. Resume automation│    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 API Endpoints

### **1. Health Check**
```http
GET /api/health
```
**Response:**
```json
{
  "status": "OK",
  "message": "TikTok Scraper API đang hoạt động",
  "timestamp": "2025-10-19T23:43:34.104Z",
  "captcha": {
    "queueSize": 0,
    "pendingCount": 0,
    "solvedCount": 0
  }
}
```

### **2. Submit CAPTCHA (Bot → Server)**
```http
POST /api/captcha/submit
```
**Request Body:**
```json
{
  "notificationId": "captcha_1234567890_abc123",
  "captchaInfo": {
    "type": "slider",
    "isPresent": true,
    "selectors": [".cap-flex"],
    "timestamp": "2025-10-19T23:43:34.104Z",
    "url": "https://www.tiktok.com/login"
  },
  "screenshot": "base64_encoded_image",
  "instructions": [
    "Đây là CAPTCHA slider",
    "Kéo thanh trượt để ghép hình hoàn chỉnh"
  ],
  "url": "https://www.tiktok.com/login",
  "pageTitle": "TikTok Login"
}
```

### **3. Get CAPTCHA Queue (UI)**
```http
GET /api/captcha/queue
```
**Response:**
```json
{
  "success": true,
  "data": {
    "captchas": [
      {
        "notificationId": "captcha_1234567890_abc123",
        "timestamp": "2025-10-19T23:43:34.104Z",
        "status": "pending",
        "captchaInfo": {
          "type": "slider",
          "isPresent": true,
          "selectors": [".cap-flex"]
        },
        "screenshot": "base64_encoded_image",
        "instructions": ["Hướng dẫn giải CAPTCHA"],
        "url": "https://www.tiktok.com/login",
        "pageTitle": "TikTok Login"
      }
    ],
    "stats": {
      "total": 1,
      "pending": 1,
      "solving": 0,
      "solved": 0,
      "timeout": 0
    }
  }
}
```

### **4. Solve CAPTCHA (User → Server)**
```http
POST /api/captcha/solve
```
**Request Body:**
```json
{
  "notificationId": "captcha_1234567890_abc123",
  "solved": true,
  "solvedBy": "Web UI User",
  "notes": "Solved successfully"
}
```

### **5. Get CAPTCHA Result (Bot ← Server)**
```http
GET /api/captcha/result/:notificationId
```
**Response:**
```json
{
  "success": true,
  "data": {
    "resolved": true,
    "status": "solved",
    "result": {
      "solved": true,
      "solvedAt": "2025-10-19T23:43:35.265Z",
      "solvedBy": "Web UI User",
      "notes": "Solved successfully"
    }
  }
}
```

### **6. Check CAPTCHA Status**
```http
GET /api/captcha/status/:notificationId
```

### **7. Cleanup Old CAPTCHAs**
```http
DELETE /api/captcha/cleanup
```

## 🎨 CAPTCHA UI

### **Truy cập UI:**
```
http://localhost:3000/captcha
```

### **Tính năng UI:**
- **Real-time updates** - Auto-refresh mỗi 5 giây
- **Statistics dashboard** - Hiển thị số liệu CAPTCHA
- **Screenshot display** - Hiển thị ảnh CAPTCHA
- **Instructions** - Hướng dẫn giải theo từng loại
- **One-click solve** - Mark as solved hoặc skip
- **Auto-refresh toggle** - Bật/tắt auto-refresh

### **UI Layout:**
```
┌─────────────────────────────────────────┐
│ 🎯 CAPTCHA Solver Dashboard              │
├─────────────────────────────────────────┤
│ 📊 Stats: Total(1) Pending(1) Solved(0) │
├─────────────────────────────────────────┤
│ 📋 CAPTCHA Queue                        │
│ ┌─────────────────────────────────────┐ │
│ │ 🎚️ SLIDER CAPTCHA                   │ │
│ │ 📸 [Screenshot]                     │ │
│ │ 📝 Instructions...                  │ │
│ │ 🔗 https://tiktok.com/login          │ │
│ │ [✅ Mark as Solved] [❌ Skip]       │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 🚀 Cách sử dụng

### **1. Start Server:**
```bash
node server.js
```

### **2. Truy cập CAPTCHA UI:**
```
http://localhost:3000/captcha
```

### **3. Bot sẽ tự động:**
- Detect CAPTCHA
- Submit lên server
- Poll for result
- Resume automation khi có kết quả

### **4. User giải CAPTCHA:**
- Xem CAPTCHA trong UI
- Click "Mark as Solved" hoặc "Skip"
- Bot tự động nhận kết quả và tiếp tục

## 🧪 Testing

### **Test API endpoints:**
```bash
node test-captcha-api.js
```

### **Test với curl:**
```bash
# Health check
curl http://localhost:3000/api/health

# Get queue
curl http://localhost:3000/api/captcha/queue

# Submit test CAPTCHA
curl -X POST http://localhost:3000/api/captcha/submit \
  -H "Content-Type: application/json" \
  -d '{"notificationId":"test123","captchaInfo":{"type":"slider"}}'
```

## 📊 Data Storage

### **In-memory Storage (Railway compatible):**
- `captchaQueue` - Map chứa CAPTCHA data
- `captchaResults` - Map chứa kết quả giải
- `captchaStatus` - Map chứa trạng thái

### **Data Structure:**
```javascript
{
  notificationId: "captcha_1234567890_abc123",
  timestamp: "2025-10-19T23:43:34.104Z",
  status: "pending", // pending, solving, solved, timeout
  captchaInfo: {
    type: "slider",
    isPresent: true,
    selectors: [".cap-flex"],
    timestamp: "2025-10-19T23:43:34.104Z",
    url: "https://www.tiktok.com/login"
  },
  screenshot: "base64_encoded_image",
  instructions: ["Hướng dẫn giải CAPTCHA"],
  url: "https://www.tiktok.com/login",
  pageTitle: "TikTok Login",
  solvedBy: null,
  solvedAt: null,
  notes: null
}
```

## 🔄 Luồng hoạt động

### **1. Bot phát hiện CAPTCHA:**
```
🚨 CAPTCHA detected
📤 Submitting to API...
✅ CAPTCHA submitted to UI queue
⏳ Waiting for user to solve...
```

### **2. Server lưu vào queue:**
```
📧 CAPTCHA submitted to UI queue: captcha_1234567890_abc123
📊 Queue size: 1
```

### **3. UI hiển thị CAPTCHA:**
```
📋 CAPTCHA Queue (1 pending)
🎚️ SLIDER CAPTCHA
📸 [Screenshot]
📝 Kéo thanh trượt để ghép hình
🔗 https://tiktok.com/login
[✅ Mark as Solved] [❌ Skip]
```

### **4. User giải CAPTCHA:**
```
✅ CAPTCHA solved: captcha_1234567890_abc123 by Web UI User
```

### **5. Bot nhận kết quả:**
```
✅ CAPTCHA đã được giải bởi người thật
🔄 Resuming automation...
```

## 🎯 Ưu điểm

### **✅ Railway Compatible:**
- Không cần file system
- In-memory storage
- Stateless design

### **✅ Real-time Updates:**
- Auto-refresh UI
- Live statistics
- Instant feedback

### **✅ User Friendly:**
- Intuitive interface
- Clear instructions
- One-click actions

### **✅ Scalable:**
- API-based architecture
- Easy to extend
- Multiple bot support

## 🚨 Lưu ý

### **Memory Management:**
- CAPTCHA data được lưu trong memory
- Tự động cleanup sau 1 giờ
- Có thể extend với Redis cho production

### **Security:**
- CORS enabled
- Input validation
- Error handling

### **Performance:**
- Auto-refresh mỗi 5 giây
- Efficient polling
- Minimal overhead

---

**🎉 Hệ thống CAPTCHA API đã sẵn sàng cho Railway deployment!**
