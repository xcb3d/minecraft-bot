/**
 * Health Check Script
 * 
 * Script này tạo một HTTP server đơn giản để Render có thể kiểm tra trạng thái của dịch vụ.
 * Điều này giúp ngăn dịch vụ bị tạm dừng sau một thời gian không hoạt động.
 */

const http = require('http');

// Tạo HTTP server đơn giản
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Minecraft Bot is running');
});

// Lấy port từ biến môi trường hoặc sử dụng port 8080 mặc định
const PORT = process.env.PORT || 8080;

// Khởi động server
server.listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
});

// Xử lý tắt server khi ứng dụng kết thúc
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Health check server closed');
    process.exit(0);
  });
});

// Export server để có thể sử dụng trong index.js
module.exports = server; 