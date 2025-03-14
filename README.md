# Minecraft Bot Controller

A multi-threaded Minecraft bot controller that can spawn multiple bots to join a Minecraft server. This tool is designed for testing server load capacity.

## Features

- Spawn multiple bot instances with configurable settings
- Each bot runs in its own thread for better performance
- Bots can perform various actions: walking, jumping, rotating, chatting, digging, and placing blocks
- Configurable delay between bot connections
- Command-line interface for controlling bots
- Configuration can be saved and loaded from a file
- Support for connecting through various proxy types (HTTP, HTTPS, SOCKS4, SOCKS5)
- Proxy rotation for distributing bots across multiple IPs
- Load proxies from text file

## Requirements

- Node.js (v14 or higher recommended)
- Minecraft server version 1.20.4

## Installation

1. Make sure you have Node.js installed
2. Clone or download this repository
3. Open a terminal/command prompt in the project directory
4. Run `npm install` to install dependencies

## Usage

1. Start the bot controller:
   ```
   node index.js
   ```

2. Use the following commands in the console:
   - `help` - Show available commands
   - `start` - Start the bots
   - `stop` - Stop all bots
   - `config` - Show current configuration
   - `set <key> <value>` - Change a configuration value
   - `proxy <on|off>` - Enable or disable proxy
   - `proxytype <http|https|socks4|socks5>` - Set proxy protocol type
   - `setproxy <host> <port> [username] [password]` - Set proxy details
   - `addproxy <host:port:username:password>` - Add proxy to rotation list
   - `clearproxies` - Clear proxy rotation list
   - `rotateproxies <on|off>` - Enable or disable proxy rotation
   - `loadproxies <filename>` - Load proxies from a text file
   - `saveproxies <filename>` - Save current proxy list to a text file
   - `showproxies` - Show all proxies in the rotation list
   - `save` - Save current configuration to file
   - `status` - Show status of running bots
   - `exit` - Exit the program

## Configuration

You can configure the bot behavior by editing the `config.json` file or using the `set` command:

- `host` - Minecraft server address (default: "localhost")
- `port` - Minecraft server port (default: 25565)
- `version` - Minecraft version (default: "1.20.4")
- `botCount` - Number of bots to spawn (default: 5)
- `joinDelay` - Delay between bot connections in ms (default: 2000)
- `moveInterval` - How often bots perform actions in ms (default: 1000)
- `chatInterval` - How often bots send chat messages in ms (default: 10000)
- `chatMessages` - Array of possible chat messages
- `actions` - Array of possible actions (available: "jump", "rotate", "walk", "chat", "dig", "placeBlock")
- `username` - Base username for bots (will be appended with a number)
- `auth` - Authentication type ("offline" or "microsoft")
- `proxy` - Proxy configuration

Example configuration:
```json
{
  "host": "anarchy.example.com",
  "port": 25565,
  "version": "1.20.4",
  "botCount": 20,
  "joinDelay": 5000,
  "moveInterval": 2000,
  "chatInterval": 15000,
  "chatMessages": ["Hello", "Hi there", "What's up?", "Nice server"],
  "actions": ["jump", "rotate", "walk", "chat", "dig"],
  "username": "Player_",
  "auth": "offline",
  "proxy": {
    "enabled": false,
    "type": "http",
    "host": "127.0.0.1",
    "port": 8080,
    "username": "",
    "password": "",
    "rotateProxies": false,
    "proxyList": []
  }
}
```

## Using Proxies

To bypass IP restrictions on servers, you can use proxies:

1. Enable proxy support:
   ```
   proxy on
   ```

2. Set the proxy type (HTTP, HTTPS, SOCKS4, or SOCKS5):
   ```
   proxytype http
   ```

3. Set the proxy server:
   ```
   setproxy 127.0.0.1 8080
   ```
   
   If your proxy requires authentication:
   ```
   setproxy 127.0.0.1 8080 username password
   ```

4. For multiple proxies (proxy rotation):
   ```
   addproxy 192.168.1.1:1080
   addproxy 192.168.1.2:1080:username:password
   rotateproxies on
   ```

5. Load proxies from a text file:
   ```
   loadproxies proxies.txt
   ```
   
   The text file should contain one proxy per line in the format:
   ```
   host:port
   host:port:username:password
   ```

6. Start the bots:
   ```
   start
   ```

## Examples

1. Connect to a specific server:
   ```
   set host anarchy.example.com
   set port 25565
   start
   ```

2. Increase the number of bots:
   ```
   set botCount 50
   set joinDelay 5000
   start
   ```

3. Change bot actions:
   ```
   set actions ["walk", "jump", "rotate"]
   start
   ```

4. Use an HTTP proxy server:
   ```
   proxy on
   proxytype http
   setproxy 192.168.1.100 8080
   start
   ```

5. Use multiple HTTP proxies:
   ```
   proxy on
   proxytype http
   loadproxies proxies.txt
   rotateproxies on
   set botCount 30
   start
   ```

## Notes

- Using too many bots may cause performance issues on your computer
- Some servers may have anti-bot measures that could prevent the bots from joining
- Use responsibly and only on servers where you have permission to test
- When using proxies, make sure they support the protocol you selected (HTTP, HTTPS, SOCKS4, or SOCKS5)
- For best results with proxy rotation, use a number of bots that is a multiple of your proxy count
- Free public proxies may be unreliable or have high latency

## Disclaimer

This tool is for educational and testing purposes only. Use it responsibly and only on servers where you have permission to do so. The author is not responsible for any misuse of this software. 