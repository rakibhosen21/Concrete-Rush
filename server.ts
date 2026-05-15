import express from 'express';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(process.cwd(), 'users.json');

// Initialize users file if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({}));
}

app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || typeof username !== 'string' || !password || password.length < 6) {
    return res.status(400).json({ error: 'Invalid credentials. Password must be 6+ chars.' });
  }

  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  const normalized = username.toLowerCase();

  if (users[normalized]) {
    return res.status(409).json({ error: 'AGENT ID ALREADY CLAIMED — choose another' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  users[normalized] = {
    username,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
    bestScore: 0,
    totalCoins: 0,
    bestDistance: 0,
    gamesPlayed: 0,
    unlockedSkins: ['NEURAL RUNNER'],
    equippedSkin: 'NEURAL RUNNER'
  };

  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  
  // Don't return password in response
  const { password: _, ...userStats } = users[normalized];
  res.json({ success: true, user: userStats });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Credentials required' });
  }

  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  const normalized = username.toLowerCase();
  const user = users[normalized];

  if (!user) {
    return res.status(404).json({ error: 'AGENT NOT FOUND' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: 'INVALID CREDENTIALS' });
  }

  // Generate a simple session token
  const token = Buffer.from(`${normalized}:${Date.now()}`).toString('base64');
  
  const { password: _, ...userStats } = user;
  res.json({ success: true, user: userStats, token });
});

app.get('/api/user/:username', (req, res) => {
  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  const user = users[req.params.username.toLowerCase()];
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { password: _, ...userStats } = user;
  res.json(userStats);
});

app.post('/api/update', (req, res) => {
  const { username, score, coinsCollected, distance } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  const normalized = username.toLowerCase();
  const user = users[normalized];

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.bestScore = Math.max(user.bestScore, score);
  user.bestDistance = Math.max(user.bestDistance, distance);
  user.totalCoins += coinsCollected;
  user.gamesPlayed += 1;

  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ success: true, user });
});

app.post('/api/garage/action', (req, res) => {
  const { username, action, skinId, cost } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  const user = users[username.toLowerCase()];

  if (!user) return res.status(404).json({ error: 'User not found' });

  if (action === 'UNLOCK') {
    if (user.totalCoins < cost) return res.status(400).json({ error: 'Insufficient $C' });
    if (user.unlockedSkins.includes(skinId)) return res.status(400).json({ error: 'Already unlocked' });
    
    user.totalCoins -= cost;
    user.unlockedSkins.push(skinId);
  } else if (action === 'EQUIP') {
    if (!user.unlockedSkins.includes(skinId)) return res.status(400).json({ error: 'Skin not unlocked' });
    user.equippedSkin = skinId;
  }

  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ success: true, user });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
