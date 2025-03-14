const fs = require('fs');
const path = require('path');

/**
 * Đọc danh sách proxy từ file văn bản
 * Mỗi dòng trong file có định dạng host:port hoặc host:port:username:password
 * @param {string} filePath - Đường dẫn đến file proxy
 * @returns {Array} - Mảng các proxy đã được phân tích
 */
function loadProxiesFromFile(filePath) {
  try {
    // Kiểm tra xem file có tồn tại không
    if (!fs.existsSync(filePath)) {
      console.error(`File không tồn tại: ${filePath}`);
      return [];
    }

    // Đọc nội dung file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Tách các dòng và lọc bỏ dòng trống
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    // Phân tích mỗi dòng thành đối tượng proxy
    const proxies = lines.map(line => {
      const parts = line.trim().split(':');
      
      if (parts.length < 2) {
        console.warn(`Bỏ qua dòng không hợp lệ: ${line}`);
        return null;
      }
      
      return {
        host: parts[0],
        port: parseInt(parts[1], 10),
        username: parts.length > 2 ? parts[2] : '',
        password: parts.length > 3 ? parts[3] : ''
      };
    }).filter(proxy => proxy !== null);
    
    console.log(`Đã tải ${proxies.length} proxy từ file ${filePath}`);
    return proxies;
  } catch (error) {
    console.error(`Lỗi khi đọc file proxy: ${error.message}`);
    return [];
  }
}

/**
 * Lưu danh sách proxy vào file văn bản
 * @param {string} filePath - Đường dẫn đến file proxy
 * @param {Array} proxies - Mảng các proxy cần lưu
 * @returns {boolean} - true nếu lưu thành công, false nếu có lỗi
 */
function saveProxiesToFile(filePath, proxies) {
  try {
    // Chuyển đổi mỗi proxy thành chuỗi định dạng host:port:username:password
    const lines = proxies.map(proxy => {
      if (proxy.username && proxy.password) {
        return `${proxy.host}:${proxy.port}:${proxy.username}:${proxy.password}`;
      }
      return `${proxy.host}:${proxy.port}`;
    });
    
    // Ghi vào file
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`Đã lưu ${proxies.length} proxy vào file ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Lỗi khi lưu file proxy: ${error.message}`);
    return false;
  }
}

module.exports = {
  loadProxiesFromFile,
  saveProxiesToFile
}; 