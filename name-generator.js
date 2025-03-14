/**
 * Bộ tạo tên ngẫu nhiên cho bot Minecraft
 * Tạo các tên người chơi ngẫu nhiên, chân thực và đa dạng
 */

// Danh sách các tiền tố tên
const prefixes = [
  'Cool', 'Pro', 'Epic', 'Mega', 'Ultra', 'Super', 'Hyper', 'Master', 'Elite', 'Legend',
  'Shadow', 'Dark', 'Light', 'Fire', 'Ice', 'Thunder', 'Storm', 'Blaze', 'Frost', 'Void',
  'Swift', 'Ninja', 'Sniper', 'Warrior', 'Knight', 'Mage', 'Wizard', 'Hunter', 'Archer', 'Assassin',
  'Pixel', 'Craft', 'Mine', 'Block', 'Diamond', 'Gold', 'Iron', 'Emerald', 'Obsidian', 'Redstone',
  'Sky', 'Star', 'Moon', 'Sun', 'Galaxy', 'Cosmic', 'Astro', 'Space', 'Nova', 'Nebula',
  'Toxic', 'Venom', 'Poison', 'Acid', 'Lava', 'Magma', 'Flame', 'Inferno', 'Burn', 'Cinder',
  'Silent', 'Stealth', 'Ghost', 'Phantom', 'Spirit', 'Soul', 'Wraith', 'Specter', 'Shade', 'Mist'
];

// Danh sách các gốc tên
const roots = [
  'Player', 'Gamer', 'Gaming', 'Play', 'Game', 'Stream', 'Streamer', 'Tube', 'Tuber', 'Cast',
  'Wolf', 'Fox', 'Bear', 'Tiger', 'Lion', 'Eagle', 'Hawk', 'Falcon', 'Dragon', 'Phoenix',
  'Blade', 'Sword', 'Axe', 'Bow', 'Arrow', 'Shield', 'Armor', 'Helmet', 'Dagger', 'Mace',
  'Craft', 'Mine', 'Dig', 'Build', 'Create', 'Destroy', 'Explore', 'Adventure', 'Journey', 'Quest',
  'Slayer', 'Killer', 'Hunter', 'Seeker', 'Finder', 'Tracker', 'Stalker', 'Chaser', 'Runner', 'Jumper',
  'Spark', 'Flare', 'Blaze', 'Ember', 'Flame', 'Frost', 'Freeze', 'Chill', 'Snow', 'Ice',
  'Byte', 'Bit', 'Code', 'Hack', 'Tech', 'Cyber', 'Digital', 'Virtual', 'Net', 'Web'
];

// Danh sách các hậu tố tên
const suffixes = [
  'X', 'XD', 'HD', '3D', '4K', 'Pro', 'God', 'King', 'Lord', 'Master',
  '123', '321', '999', '777', '666', '420', '69', '1337', '2023', '2024',
  'YT', 'TV', 'Live', 'TTV', 'Stream', 'Gaming', 'Plays', 'Games', 'Clips', 'Moments',
  'OP', 'GG', 'EZ', 'MVP', 'ACE', 'WIN', 'PRO', 'NOOB', 'HAX', 'PWN',
  'MC', 'Mine', 'Craft', 'Block', 'Cube', 'Pixel', 'Voxel', 'World', 'Land', 'Realm'
];

// Danh sách các tên đặc biệt (không theo công thức)
const specialNames = [
  'NotABot', 'TotallyHuman', 'RealPlayer', 'NotHacking', 'LegitPlayer', 'JustPlaying',
  'HerobrineFan', 'EndermanSlayer', 'CreeperHunter', 'ZombieKiller', 'SkeletonArcher',
  'DiamondMiner', 'EmeraldTrader', 'NetherExplorer', 'EndDragonSlayer', 'WitherKiller',
  'VillagerFriend', 'PiglinTrader', 'AxolotlTamer', 'BeeKeeper', 'FoxTamer',
  'RedstoneEngineer', 'CommandBlockWizard', 'BuildMaster', 'ParkourPro', 'SpeedRunner',
  'xXShadowXx', 'DarkLord99', 'EliteSniper', 'ProGamer123', 'MasterBuilder',
  'Steve', 'Alex', 'Notch', 'Jeb_', 'Dinnerbone', 'Grumm', 'MHF_Steve', 'MHF_Alex'
];

// Tạo tên ngẫu nhiên theo công thức
function generateStructuredName() {
  const usePrefix = Math.random() > 0.3; // 70% có tiền tố
  const useSuffix = Math.random() > 0.4; // 60% có hậu tố
  
  const prefix = usePrefix ? prefixes[Math.floor(Math.random() * prefixes.length)] : '';
  const root = roots[Math.floor(Math.random() * roots.length)];
  const suffix = useSuffix ? suffixes[Math.floor(Math.random() * suffixes.length)] : '';
  
  // Thêm số ngẫu nhiên vào tên (30% cơ hội)
  const addNumber = Math.random() > 0.7;
  const number = addNumber ? Math.floor(Math.random() * 1000) : '';
  
  // Kết hợp các phần
  let name = '';
  
  if (prefix) {
    name += prefix;
  }
  
  name += root;
  
  if (number) {
    name += number;
  }
  
  if (suffix) {
    name += suffix;
  }
  
  return name;
}

// Tạo tên ngẫu nhiên (có thể là tên đặc biệt hoặc tên theo công thức)
function generateRandomName() {
  // 20% cơ hội lấy tên đặc biệt
  if (Math.random() < 0.2) {
    return specialNames[Math.floor(Math.random() * specialNames.length)];
  }
  
  // 80% cơ hội tạo tên theo công thức
  return generateStructuredName();
}

// Tạo tên ngẫu nhiên và đảm bảo độ dài phù hợp (3-16 ký tự)
function generateValidMinecraftName() {
  let name;
  let attempts = 0;
  
  do {
    name = generateRandomName();
    
    // Nếu tên quá dài, cắt bớt
    if (name.length > 16) {
      name = name.substring(0, 16);
    }
    
    attempts++;
    // Nếu đã thử nhiều lần mà không tìm được tên phù hợp, tạo tên đơn giản
    if (attempts > 10) {
      const simple = 'Player' + Math.floor(Math.random() * 10000);
      return simple.substring(0, 16);
    }
  } while (name.length < 3 || name.length > 16);
  
  return name;
}

// Tạo danh sách tên ngẫu nhiên
function generateRandomNames(count) {
  const names = [];
  const usedNames = new Set(); // Để tránh trùng lặp
  
  for (let i = 0; i < count; i++) {
    let name;
    do {
      name = generateValidMinecraftName();
    } while (usedNames.has(name));
    
    usedNames.add(name);
    names.push(name);
  }
  
  return names;
}

module.exports = {
  generateRandomName: generateValidMinecraftName,
  generateRandomNames
}; 