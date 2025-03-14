# Hướng dẫn triển khai Minecraft Bot trên Render

Tài liệu này hướng dẫn cách triển khai Minecraft Bot trên Render để sử dụng địa chỉ IP của Render kết nối đến server Minecraft.

## Triển khai tự động với nút Deploy to Render

1. Nhấp vào nút "Deploy to Render" bên dưới:

   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

2. Đăng nhập vào tài khoản Render của bạn (hoặc đăng ký nếu chưa có)

3. Render sẽ tự động cấu hình và triển khai bot dựa trên file `render.yaml`

4. Sau khi triển khai hoàn tất, bạn có thể xem logs để kiểm tra trạng thái của bot

## Triển khai thủ công

Nếu bạn muốn triển khai thủ công, hãy làm theo các bước sau:

1. **Đăng ký tài khoản Render**:
   - Truy cập https://render.com/ và đăng ký tài khoản
   - Bạn có thể đăng ký bằng GitHub, GitLab hoặc email

2. **Tạo dịch vụ mới**:
   - Đăng nhập vào Render Dashboard
   - Chọn "New" > "Background Worker"

3. **Kết nối repository**:
   - Kết nối với GitHub/GitLab repository của bạn
   - Hoặc sử dụng tùy chọn "Public Git repository" và nhập URL của repository

4. **Cấu hình dịch vụ**:
   - Đặt tên cho dịch vụ (ví dụ: "minecraft-bot")
   - Chọn vùng triển khai gần với server Minecraft để giảm độ trễ
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `node index.js`
   - Chọn gói "Free"

5. **Thêm biến môi trường**:
   - Thêm biến `NODE_ENV` với giá trị `production`
   - Thêm biến `CLOUD_ENV` với giá trị `true`

6. **Tạo dịch vụ**:
   - Nhấn "Create Background Worker"
   - Render sẽ bắt đầu triển khai ứng dụng của bạn

## Cấu hình bot

Bot đã được cấu hình sẵn để chạy trên Render với các thiết lập sau:

- `autoStart: true`: Bot sẽ tự động khởi động khi triển khai
- `botCount: 3`: Số lượng bot được giảm xuống để phù hợp với tài nguyên của Render
- `proxy.enabled: false`: Tắt tính năng proxy vì chúng ta đang sử dụng IP của Render

Bạn có thể điều chỉnh các thiết lập này trong file `config.json` trước khi triển khai.

## Kiểm tra logs

Sau khi triển khai, bạn có thể xem logs để kiểm tra trạng thái của bot:

1. Truy cập Render Dashboard
2. Chọn dịch vụ "minecraft-bot"
3. Chọn tab "Logs"
4. Xem logs để kiểm tra xem bot có kết nối thành công đến server Minecraft không

## Lưu ý quan trọng

1. **Giới hạn tài nguyên**:
   - Gói miễn phí của Render có 512MB RAM và CPU chia sẻ
   - Số lượng bot đã được giảm xuống 3 để phù hợp với tài nguyên

2. **Thời gian chạy**:
   - Render cung cấp 750 giờ miễn phí mỗi tháng (đủ cho 1 dịch vụ chạy liên tục)

3. **IP chia sẻ**:
   - Render sử dụng hệ thống IP chia sẻ cho các dịch vụ miễn phí
   - Nhiều ứng dụng có thể sử dụng cùng một địa chỉ IP

4. **Khởi động lại định kỳ**:
   - Render có thể khởi động lại dịch vụ định kỳ để bảo trì
   - Bot sẽ tự động kết nối lại sau khi khởi động lại

## Khắc phục sự cố

Nếu bot không hoạt động, hãy kiểm tra logs để xác định nguyên nhân:

1. **Lỗi kết nối**:
   - Kiểm tra xem địa chỉ server Minecraft có chính xác không
   - Kiểm tra xem server Minecraft có chấp nhận kết nối từ IP của Render không

2. **Lỗi tài nguyên**:
   - Nếu bot sử dụng quá nhiều tài nguyên, hãy giảm số lượng bot
   - Kiểm tra tab "Metrics" để xem mức sử dụng CPU và RAM

3. **Lỗi khởi động**:
   - Kiểm tra logs để xem lỗi khi khởi động
   - Đảm bảo rằng tất cả các gói phụ thuộc đã được cài đặt 