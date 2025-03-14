const mineflayer = require('mineflayer');
const { workerData, parentPort } = require('worker_threads');
const Vec3 = require('vec3');
const socks = require('socks');
const HttpProxyAgent = require('http-proxy-agent').HttpProxyAgent;
const HttpsProxyAgent = require('https-proxy-agent').HttpsProxyAgent;

// Extract worker data
const {
  id,
  username,
  host,
  port,
  version,
  auth,
  moveInterval,
  chatInterval,
  chatMessages,
  actions,
  proxy
} = workerData;

// Create bot instance with proxy support if enabled
function createBotWithProxy() {
  const options = {
    host,
    port,
    username,
    version,
    auth,
    viewDistance: 'tiny',
    defaultChatPatterns: false,
    chatLengthLimit: 100
  };

  // If proxy is configured, set up the proxy agent
  if (proxy) {
    sendMessage(`Connecting via ${proxy.type} proxy: ${proxy.host}:${proxy.port}`);
    
    // Xử lý dựa trên loại proxy
    if (proxy.type === 'socks4' || proxy.type === 'socks5') {
      // Sử dụng SOCKS proxy
      const socksClient = new socks.SocksClient({
        proxy: {
          host: proxy.host,
          port: proxy.port,
          type: proxy.type === 'socks4' ? 4 : 5,
          userId: proxy.username || undefined,
          password: proxy.password || undefined
        },
        command: 'connect',
        destination: {
          host: host,
          port: port
        }
      });

      // Set up custom connect function for mineflayer
      options.connect = client => {
        socksClient.connect()
          .then(info => {
            client.setSocket(info.socket);
            client.emit('connect');
          })
          .catch(err => {
            sendMessage(`Proxy connection error: ${err.message}`);
            client.emit('error', err);
          });
      };
    } else if (proxy.type === 'http' || proxy.type === 'https') {
      // Sử dụng HTTP/HTTPS proxy
      const proxyUrl = `${proxy.type}://${proxy.username ? `${proxy.username}:${proxy.password}@` : ''}${proxy.host}:${proxy.port}`;
      
      // Tạo agent phù hợp với loại proxy
      const agent = proxy.type === 'http' 
        ? new HttpProxyAgent(proxyUrl)
        : new HttpsProxyAgent(proxyUrl);
      
      // Thiết lập agent cho mineflayer
      options.agent = agent;
    }
  }

  return mineflayer.createBot(options);
}

// Create the bot
const bot = createBotWithProxy();

// Send message to parent process
function sendMessage(message) {
  parentPort.postMessage(`[${username}] ${message}`);
}

// Random number between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Random element from array
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Bot actions
const botActions = {
  jump: () => {
    bot.setControlState('jump', true);
    setTimeout(() => {
      bot.setControlState('jump', false);
    }, 500);
    sendMessage('Jumped');
  },
  
  rotate: () => {
    const yaw = Math.random() * Math.PI * 2;
    const pitch = Math.random() * Math.PI - (Math.PI / 2);
    bot.look(yaw, pitch, true);
    sendMessage(`Rotated to yaw=${yaw.toFixed(2)}, pitch=${pitch.toFixed(2)}`);
  },
  
  walk: () => {
    // Random direction
    const directions = ['forward', 'back', 'left', 'right'];
    const direction = randomElement(directions);
    
    // Set control state
    bot.setControlState(direction, true);
    
    // Stop after random time
    const walkTime = randomInt(500, 2000);
    setTimeout(() => {
      bot.setControlState(direction, false);
    }, walkTime);
    
    sendMessage(`Walking ${direction} for ${walkTime}ms`);
  },
  
  chat: () => {
    if (chatMessages.length === 0) return;
    
    const message = randomElement(chatMessages);
    bot.chat(message);
    sendMessage(`Sent chat: ${message}`);
  },
  
  // Additional actions can be added here
  dig: () => {
    const block = bot.blockAtCursor();
    if (block) {
      bot.dig(block);
      sendMessage(`Digging block: ${block.name}`);
    } else {
      sendMessage('No block to dig');
    }
  },
  
  placeBlock: () => {
    // Try to place a block from inventory if available
    const blocks = bot.inventory.items().filter(item => item.name.includes('_block') || item.name.includes('dirt') || item.name.includes('stone'));
    
    if (blocks.length > 0) {
      const block = randomElement(blocks);
      bot.equip(block, 'hand');
      
      // Find a place to put the block
      const targetBlock = bot.blockAtCursor();
      if (targetBlock) {
        const faces = [
          new Vec3(0, 1, 0),  // up
          new Vec3(0, -1, 0), // down
          new Vec3(1, 0, 0),  // east
          new Vec3(-1, 0, 0), // west
          new Vec3(0, 0, 1),  // south
          new Vec3(0, 0, -1)  // north
        ];
        
        const face = randomElement(faces);
        bot.placeBlock(targetBlock, face);
        sendMessage(`Placed block: ${block.name}`);
      } else {
        sendMessage('No target block to place against');
      }
    } else {
      sendMessage('No blocks in inventory');
    }
  }
};

// Register bot event handlers
bot.on('spawn', () => {
  sendMessage('Đã tham gia vào thế giới');
  
  // Start random actions
  startRandomActions();
  
  // Start random chat
  if (chatInterval > 0 && chatMessages.length > 0) {
    startRandomChat();
  }
});

bot.on('login', () => {
  sendMessage('Đã đăng nhập vào server');
});

bot.on('kicked', (reason) => {
  let kickReason = reason;
  
  // Xử lý các trường hợp khác nhau của reason
  if (typeof reason === 'object') {
    try {
      // Nếu là JSON, chuyển thành chuỗi
      kickReason = JSON.stringify(reason, null, 2);
    } catch (e) {
      // Nếu không thể chuyển thành JSON, lấy các thuộc tính
      if (reason.text) {
        kickReason = reason.text;
      } else if (reason.message) {
        kickReason = reason.message;
      } else if (reason.toString && reason.toString() !== '[object Object]') {
        kickReason = reason.toString();
      } else {
        // Liệt kê tất cả các thuộc tính
        kickReason = 'Kick reason properties: ' + Object.keys(reason).join(', ');
        for (const key in reason) {
          if (reason.hasOwnProperty(key) && reason[key]) {
            kickReason += `\n- ${key}: ${reason[key]}`;
          }
        }
      }
    }
  }
  
  sendMessage(`Kicked from server: ${kickReason}`);
  process.exit(1);
});

bot.on('error', (err) => {
  sendMessage(`Error: ${err.message}`);
  process.exit(1);
});

bot.on('end', () => {
  sendMessage('Disconnected from server');
  process.exit(0);
});

// Start performing random actions
function startRandomActions() {
  if (moveInterval <= 0 || actions.length === 0) return;
  
  const actionInterval = setInterval(() => {
    // Filter available actions
    const availableActions = actions.filter(action => action in botActions);
    
    if (availableActions.length > 0) {
      // Perform random action
      const action = randomElement(availableActions);
      botActions[action]();
    }
  }, moveInterval);
  
  // Clean up on exit
  parentPort.on('close', () => {
    clearInterval(actionInterval);
  });
}

// Start sending random chat messages
function startRandomChat() {
  const interval = setInterval(() => {
    botActions.chat();
  }, chatInterval);
  
  // Clean up on exit
  parentPort.on('close', () => {
    clearInterval(interval);
  });
}

// Handle messages from parent
parentPort.on('message', (message) => {
  if (message === 'exit') {
    bot.quit();
    process.exit(0);
  }
}); 