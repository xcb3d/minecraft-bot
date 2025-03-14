const mineflayer = require('mineflayer');
const { Worker } = require('worker_threads');
const readline = require('readline');
const path = require('path');
const fs = require('fs');
const { loadProxiesFromFile, saveProxiesToFile } = require('./proxy-loader');
const { generateRandomName, generateRandomNames } = require('./name-generator');

// Khởi động health check server nếu đang chạy trên Render
const isCloudEnvironment = process.env.NODE_ENV === 'production' || process.env.CLOUD_ENV === 'true';
if (isCloudEnvironment && process.env.PORT) {
  require('./health-check');
  console.log('Health check server started for Render');
}

// Configuration
const DEFAULT_CONFIG = {
  host: '26.109.237.223',
  port: 57764,
  version: '1.20.4',
  botCount: 5,
  joinDelay: 2000, // Delay between bot connections in ms
  moveInterval: 1000, // How often bots move in ms
  chatInterval: 10000, // How often bots chat in ms
  chatMessages: ['Hello', 'Hi there', 'What\'s up?', 'Nice server'],
  actions: ['jump', 'rotate', 'walk', 'chat'], // Available actions
  auth: 'offline', // 'offline' or 'microsoft'
  proxy: {
    enabled: false,
    type: 'http', // 'http', 'https', 'socks4', or 'socks5'
    host: '127.0.0.1',
    port: 8080,
    username: '',
    password: '',
    rotateProxies: false,
    proxyList: []
  },
  autoStart: false // Tự động khởi động bot khi chạy
};

// Load config from file if exists
let config = DEFAULT_CONFIG;
const configPath = path.join(__dirname, 'config.json');

if (fs.existsSync(configPath)) {
  try {
    const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config = { ...DEFAULT_CONFIG, ...fileConfig };
    console.log('Loaded configuration from config.json');
  } catch (err) {
    console.error('Error loading config file:', err.message);
  }
} else {
  // Save default config
  fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
  console.log('Created default config.json file');
}

// Create CLI interface if not in cloud environment
let rl;
if (!isCloudEnvironment) {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.on('line', (input) => {
    processCommand(input);
  });
  
  rl.on('close', () => {
    commands.stop();
    process.exit(0);
  });
}

// Active workers
const workers = new Map();
let isRunning = false;

// Command handlers
const commands = {
  help: () => {
    console.log('\nAvailable commands:');
    console.log('  start - Start the bots');
    console.log('  stop - Stop all bots');
    console.log('  config - Show current configuration');
    console.log('  set <key> <value> - Change a configuration value');
    console.log('  proxy <on|off> - Enable or disable proxy');
    console.log('  proxytype <http|https|socks4|socks5> - Set proxy protocol type');
    console.log('  setproxy <host> <port> [username] [password] - Set proxy details');
    console.log('  addproxy <host:port:username:password> - Add proxy to rotation list');
    console.log('  clearproxies - Clear proxy rotation list');
    console.log('  rotateproxies <on|off> - Enable or disable proxy rotation');
    console.log('  loadproxies <filename> - Load proxies from a text file');
    console.log('  saveproxies <filename> - Save current proxy list to a text file');
    console.log('  showproxies - Show all proxies in the rotation list');
    console.log('  save - Save current configuration to file');
    console.log('  status - Show status of running bots');
    console.log('  exit - Exit the program');
    console.log('  help - Show this help message\n');
  },
  
  start: () => {
    if (isRunning) {
      console.log('Bots are already running. Use "stop" to stop them first.');
      return;
    }
    
    isRunning = true;
    console.log(`Starting ${config.botCount} bots...`);
    
    // Tạo danh sách tên ngẫu nhiên trước
    const randomNames = generateRandomNames(config.botCount);
    console.log('Generated random names for bots:');
    randomNames.forEach((name, index) => {
      console.log(`  Bot ${index}: ${name}`);
    });
    
    // Start bots with delay between each
    for (let i = 0; i < config.botCount; i++) {
      setTimeout(() => {
        // Sử dụng tên từ danh sách đã tạo
        const username = randomNames[i];
        startBotWorker(i, username);
      }, i * config.joinDelay);
    }
  },
  
  stop: () => {
    if (!isRunning) {
      console.log('No bots are running.');
      return;
    }
    
    console.log('Stopping all bots...');
    workers.forEach((worker) => {
      worker.terminate();
    });
    
    workers.clear();
    isRunning = false;
    console.log('All bots stopped.');
  },
  
  config: () => {
    console.log('\nCurrent configuration:');
    Object.entries(config).forEach(([key, value]) => {
      console.log(`  ${key}: ${JSON.stringify(value)}`);
    });
    console.log('');
  },
  
  set: (key, value) => {
    if (!(key in config)) {
      console.log(`Unknown configuration key: ${key}`);
      console.log(`Available keys: ${Object.keys(config).join(', ')}`);
      return;
    }
    
    // Parse value based on the type of the current value
    let parsedValue;
    try {
      if (Array.isArray(config[key])) {
        parsedValue = JSON.parse(value);
        if (!Array.isArray(parsedValue)) {
          throw new Error('Value must be an array');
        }
      } else if (typeof config[key] === 'number') {
        parsedValue = Number(value);
        if (isNaN(parsedValue)) {
          throw new Error('Value must be a number');
        }
      } else if (typeof config[key] === 'boolean') {
        parsedValue = value.toLowerCase() === 'true';
      } else {
        parsedValue = value;
      }
    } catch (err) {
      console.log(`Error parsing value: ${err.message}`);
      return;
    }
    
    config[key] = parsedValue;
    console.log(`Set ${key} = ${JSON.stringify(parsedValue)}`);
  },
  
  proxy: (state) => {
    if (state !== 'on' && state !== 'off') {
      console.log('Usage: proxy <on|off>');
      return;
    }
    
    config.proxy.enabled = (state === 'on');
    console.log(`Proxy ${config.proxy.enabled ? 'enabled' : 'disabled'}`);
  },
  
  proxytype: (type) => {
    const validTypes = ['http', 'https', 'socks4', 'socks5'];
    if (!validTypes.includes(type)) {
      console.log(`Invalid proxy type: ${type}`);
      console.log(`Valid types: ${validTypes.join(', ')}`);
      return;
    }
    
    config.proxy.type = type;
    console.log(`Proxy type set to ${type}`);
  },
  
  setproxy: (host, port, username, password) => {
    if (!host || !port) {
      console.log('Usage: setproxy <host> <port> [username] [password]');
      return;
    }
    
    config.proxy.host = host;
    config.proxy.port = parseInt(port, 10);
    
    if (username) config.proxy.username = username;
    if (password) config.proxy.password = password;
    
    console.log(`Proxy set to ${host}:${port}`);
    if (username) console.log(`Proxy authentication: ${username}:${password ? '********' : ''}`);
  },
  
  addproxy: (proxyString) => {
    if (!proxyString) {
      console.log('Usage: addproxy <host:port:username:password>');
      console.log('Note: username and password are optional');
      return;
    }
    
    const parts = proxyString.split(':');
    if (parts.length < 2) {
      console.log('Invalid proxy format. Use host:port:username:password');
      return;
    }
    
    const proxy = {
      type: config.proxy.type, // Use the current proxy type
      host: parts[0],
      port: parseInt(parts[1], 10),
      username: parts.length > 2 ? parts[2] : '',
      password: parts.length > 3 ? parts[3] : ''
    };
    
    if (!config.proxy.proxyList) {
      config.proxy.proxyList = [];
    }
    
    config.proxy.proxyList.push(proxy);
    console.log(`Added proxy ${proxy.host}:${proxy.port} (${proxy.type}) to rotation list`);
    console.log(`Total proxies in rotation: ${config.proxy.proxyList.length}`);
  },
  
  clearproxies: () => {
    config.proxy.proxyList = [];
    console.log('Cleared proxy rotation list');
  },
  
  rotateproxies: (state) => {
    if (state !== 'on' && state !== 'off') {
      console.log('Usage: rotateproxies <on|off>');
      return;
    }
    
    config.proxy.rotateProxies = (state === 'on');
    console.log(`Proxy rotation ${config.proxy.rotateProxies ? 'enabled' : 'disabled'}`);
    
    if (config.proxy.rotateProxies && (!config.proxy.proxyList || config.proxy.proxyList.length === 0)) {
      console.log('Warning: Proxy rotation enabled but no proxies in rotation list');
      console.log('Use "addproxy <host:port:username:password>" to add proxies');
    }
  },
  
  loadproxies: (filename) => {
    if (!filename) {
      console.log('Usage: loadproxies <filename>');
      return;
    }
    
    // Nếu không có đường dẫn, giả định file nằm trong thư mục hiện tại
    const filePath = path.isAbsolute(filename) ? filename : path.join(__dirname, filename);
    
    const proxies = loadProxiesFromFile(filePath);
    if (proxies.length > 0) {
      // Thêm loại proxy vào mỗi proxy đã tải
      proxies.forEach(proxy => {
        proxy.type = config.proxy.type;
      });
      
      config.proxy.proxyList = proxies;
      console.log(`Đã tải ${proxies.length} proxy vào danh sách xoay vòng`);
      
      // Tự động bật chế độ xoay vòng proxy nếu có proxy
      if (proxies.length > 1) {
        config.proxy.rotateProxies = true;
        console.log('Đã bật chế độ xoay vòng proxy');
      }
      
      // Tự động bật proxy nếu có proxy
      if (!config.proxy.enabled) {
        config.proxy.enabled = true;
        console.log('Đã bật chế độ sử dụng proxy');
      }
    }
  },
  
  saveproxies: (filename) => {
    if (!filename) {
      console.log('Usage: saveproxies <filename>');
      return;
    }
    
    if (!config.proxy.proxyList || config.proxy.proxyList.length === 0) {
      console.log('No proxies to save. Add proxies first using addproxy command.');
      return;
    }
    
    // Nếu không có đường dẫn, giả định file nằm trong thư mục hiện tại
    const filePath = path.isAbsolute(filename) ? filename : path.join(__dirname, filename);
    
    if (saveProxiesToFile(filePath, config.proxy.proxyList)) {
      console.log(`Đã lưu ${config.proxy.proxyList.length} proxy vào file ${filename}`);
    }
  },
  
  showproxies: () => {
    if (!config.proxy.proxyList || config.proxy.proxyList.length === 0) {
      console.log('No proxies in rotation list.');
      return;
    }
    
    console.log(`\nProxy rotation list (${config.proxy.proxyList.length} proxies):`);
    config.proxy.proxyList.forEach((proxy, index) => {
      console.log(`  ${index + 1}. ${proxy.host}:${proxy.port} (${proxy.type || config.proxy.type})${proxy.username ? ` (auth: ${proxy.username})` : ''}`);
    });
    console.log('');
  },
  
  save: () => {
    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log('Configuration saved to config.json');
    } catch (err) {
      console.error('Error saving configuration:', err.message);
    }
  },
  
  status: () => {
    if (!isRunning) {
      console.log('No bots are running.');
      return;
    }
    
    console.log(`\nRunning ${workers.size} bots:`);
    workers.forEach((worker, id) => {
      console.log(`  Bot ${id}: running`);
    });
    console.log('');
  },
  
  exit: () => {
    commands.stop();
    rl.close();
    process.exit(0);
  }
};

// Get a proxy for a specific bot
function getProxyForBot(botId) {
  if (!config.proxy.enabled) {
    return null;
  }
  
  // If proxy rotation is enabled and we have proxies in the list
  if (config.proxy.rotateProxies && config.proxy.proxyList && config.proxy.proxyList.length > 0) {
    // Use bot ID to select a proxy from the list
    const proxyIndex = botId % config.proxy.proxyList.length;
    return config.proxy.proxyList[proxyIndex];
  }
  
  // Otherwise use the main proxy config
  return {
    type: config.proxy.type,
    host: config.proxy.host,
    port: config.proxy.port,
    username: config.proxy.username,
    password: config.proxy.password
  };
}

// Start a bot in a worker thread
function startBotWorker(id, username) {
  // Get proxy for this bot
  const proxy = getProxyForBot(id);
  
  const worker = new Worker('./bot-worker.js', {
    workerData: {
      id,
      username,
      host: config.host,
      port: config.port,
      version: config.version,
      auth: config.auth,
      moveInterval: config.moveInterval,
      chatInterval: config.chatInterval,
      chatMessages: config.chatMessages,
      actions: config.actions,
      proxy: proxy
    }
  });
  
  worker.on('message', (message) => {
    console.log(message);
  });
  
  worker.on('error', (err) => {
    console.error(`[Bot ${id}] Error: ${err.message}`);
    workers.delete(id);
  });
  
  worker.on('exit', (code) => {
    console.log(`[Bot ${id}] Exited with code ${code}`);
    workers.delete(id);
    
    // If all workers have exited, set isRunning to false
    if (workers.size === 0) {
      isRunning = false;
    }
  });
  
  workers.set(id, worker);
  console.log(`Started bot ${id} with name "${username}"${proxy ? ` using proxy ${proxy.host}:${proxy.port} (${proxy.type})` : ''}`);
}

// Process user commands
function processCommand(input) {
  const args = input.trim().split(' ');
  const cmd = args.shift().toLowerCase();
  
  if (cmd in commands) {
    commands[cmd](...args);
  } else {
    console.log(`Unknown command: ${cmd}. Type "help" for available commands.`);
  }
}

// Start CLI or auto-start bots in cloud environment
console.log('Minecraft Bot Controller');

if (isCloudEnvironment) {
  console.log('Running in cloud environment');
  if (config.autoStart) {
    console.log('Auto-starting bots...');
    commands.start();
  } else {
    console.log('Auto-start is disabled. Set autoStart: true in config.json to enable.');
  }
} else {
  console.log('Type "help" for available commands');
} 