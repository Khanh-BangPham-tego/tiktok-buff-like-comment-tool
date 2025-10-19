# Chức năng Tab Ẩn Danh - TikTok Tool

## Tổng quan
Đã thêm chức năng mở tab ẩn danh trước khi navigate tới TikTok để tăng tính bảo mật và tránh bị phát hiện.

## Các thay đổi đã thực hiện

### 1. Thêm method `openIncognitoTab()`
- Tạo context ẩn danh mới
- Navigate tới Google trước để tạo lịch sử browsing
- Đóng tab ẩn danh sau khi hoàn thành
- Không làm gián đoạn quá trình chính nếu có lỗi

### 2. Cập nhật các method khởi tạo browser
- `init()`: Mở tab ẩn danh trước khi tạo page chính
- `createFreshBrowser()`: Mở tab ẩn danh trong browser profile mới
- `createFreshBrowserWithoutProxy()`: Mở tab ẩn danh khi không dùng proxy

## Cách sử dụng

### Chạy test chức năng mới
```bash
npx ts-node test-incognito.ts
```

### Chạy với các tùy chọn khác nhau
```bash
# Sử dụng Chrome thật
npm run start -- --real

# Tắt proxy
npm run start -- --no-proxy

# Sử dụng Firefox
npm run start -- --firefox

# Sử dụng Edge
npm run start -- --edge
```

## Lợi ích của chức năng mới

1. **Tăng tính bảo mật**: Tab ẩn danh không lưu cookies, history, cache
2. **Tránh bị phát hiện**: Tạo lịch sử browsing tự nhiên trước khi vào TikTok
3. **Tăng độ tin cậy**: Giảm khả năng bị TikTok phát hiện là bot
4. **Tương thích ngược**: Không ảnh hưởng đến các chức năng hiện có

## Luồng hoạt động mới

1. Khởi tạo browser
2. **Mở tab ẩn danh** ← Chức năng mới
3. Navigate tới Google trong tab ẩn danh
4. Đóng tab ẩn danh
5. Tạo page chính
6. Navigate tới TikTok
7. Thực hiện các thao tác đăng nhập

## Lưu ý

- Chức năng này hoạt động tự động, không cần cấu hình thêm
- Nếu có lỗi khi mở tab ẩn danh, chương trình vẫn tiếp tục hoạt động bình thường
- Tab ẩn danh sẽ được đóng tự động sau khi hoàn thành
