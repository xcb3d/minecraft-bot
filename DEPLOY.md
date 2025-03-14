# Hướng dẫn triển khai Minecraft Bot trên máy chủ đám mây

Tài liệu này hướng dẫn cách triển khai Minecraft Bot trên các máy chủ đám mây để sử dụng địa chỉ IP của máy chủ đó kết nối đến server Minecraft.

## 1. Triển khai trên VPS (Virtual Private Server)

### Chuẩn bị

1. Đăng ký một VPS từ các nhà cung cấp như DigitalOcean, Vultr, Linode, AWS, Google Cloud, Azure...
2. Chọn hệ điều hành Ubuntu/Debian (khuyến nghị) hoặc Windows
3. Đảm bảo VPS có địa chỉ IP công khai

### Triển khai trên Ubuntu/Debian

1. **Kết nối SSH vào VPS**

2. **Cài đặt Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Cài đặt Git**:
   ```bash
   sudo apt-get install git
   ```

4. **Tải mã nguồn bot**:
   ```bash
   git clone https://github.com/yourusername/cilis-minecraft-bot.git
   cd cilis-minecraft-bot
   npm install
   ```

5. **Cấu hình bot**:
   ```bash
   nano config.json
   ```
   - Chỉnh sửa thông tin server Minecraft
   - Đảm bảo `autoStart` được đặt thành `true`
   - Lưu file (Ctrl+O, Enter, Ctrl+X)

6. **Chạy bot**:
   ```bash
   node index.js
   ```

7. **Giữ bot chạy liên tục với PM2**:
   ```bash
   npm install -g pm2
   pm2 start index.js --name minecraft-bot
   pm2 save
   pm2 startup
   ```

8. **Kiểm tra trạng thái bot**:
   ```bash
   pm2 logs minecraft-bot
   ```

### Triển khai trên Windows VPS

1. **Kết nối Remote Desktop vào VPS**

2. **Cài đặt Node.js**:
   - Tải Node.js từ https://nodejs.org/
   - Cài đặt với các tùy chọn mặc định

3. **Cài đặt Git**:
   - Tải Git từ https://git-scm.com/download/win
   - Cài đặt với các tùy chọn mặc định

4. **Tải mã nguồn bot**:
   - Mở PowerShell hoặc Command Prompt
   ```powershell
   git clone https://github.com/yourusername/cilis-minecraft-bot.git
   cd cilis-minecraft-bot
   npm install
   ```

5. **Cấu hình bot**:
   - Mở file `config.json` bằng Notepad hoặc trình soạn thảo khác
   - Chỉnh sửa thông tin server Minecraft
   - Đảm bảo `autoStart` được đặt thành `true`
   - Lưu file

6. **Chạy bot**:
   ```powershell
   node index.js
   ```

7. **Tạo dịch vụ Windows để giữ bot chạy liên tục**:
   ```powershell
   npm install -g node-windows
   ```
   - Tạo file `service.js` với nội dung:
   ```javascript
   var Service = require('node-windows').Service;
   var svc = new Service({
     name: 'Minecraft Bot',
     description: 'Minecraft Bot Service',
     script: require('path').join(__dirname, 'index.js'),
     env: {
       CLOUD_ENV: 'true'
     }
   });
   svc.on('install', function() {
     svc.start();
   });
   svc.install();
   ```
   - Chạy file này để tạo dịch vụ:
   ```powershell
   node service.js
   ```

## 2. Triển khai trên Heroku

1. **Đăng ký tài khoản Heroku** tại https://signup.heroku.com/

2. **Cài đặt Heroku CLI**:
   ```powershell
   npm install -g heroku
   ```

3. **Đăng nhập và tạo ứng dụng**:
   ```powershell
   heroku login
   heroku create cilis-minecraft-bot
   ```

4. **Đẩy mã nguồn lên Heroku**:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku master
   ```

5. **Bật worker**:
   ```powershell
   heroku ps:scale worker=1
   ```

6. **Kiểm tra logs**:
   ```powershell
   heroku logs --tail
   ```

## 3. Triển khai trên Railway

1. **Đăng ký tài khoản Railway** tại https://railway.app/

2. **Tạo dự án mới**:
   - Chọn "Deploy from GitHub repo"
   - Kết nối với GitHub và chọn repository của bạn

3. **Cấu hình biến môi trường**:
   - Thêm biến `NODE_ENV` với giá trị `production`

4. **Deploy**:
   - Railway sẽ tự động triển khai ứng dụng của bạn

## Lưu ý quan trọng

1. **Bảo mật**:
   - Không chia sẻ thông tin đăng nhập VPS của bạn
   - Sử dụng mật khẩu mạnh hoặc xác thực SSH key
   - Cập nhật hệ thống thường xuyên

2. **Sử dụng có trách nhiệm**:
   - Chỉ sử dụng bot trên các server mà bạn được phép
   - Không sử dụng bot để tấn công hoặc làm quá tải server

3. **Tối ưu hóa**:
   - Điều chỉnh số lượng bot phù hợp với tài nguyên của VPS
   - Giám sát tài nguyên sử dụng để tránh quá tải

4. **Khắc phục sự cố**:
   - Kiểm tra logs nếu bot không hoạt động
   - Đảm bảo cổng kết nối đến server Minecraft không bị chặn bởi tường lửa 