import express from 'express';
import path from 'path';
import fs from 'fs';
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

app.post('/api/register', (req, res) => {
  const { username } = req.body;
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Invalid agent ID' });
  }

  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  const normalized = username.toLowerCase();

  if (users[normalized]) {
    return res.status(409).json({ error: 'AGENT ID ALREADY CLAIMED — choose another' });
  }

  users[normalized] = {
    username,
    createdAt: new Date().toISOString(),
    bestScore: 0,
    totalCoins: 0,
    bestDistance: 0,
    gamesPlayed: 0
  };

  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ success: true, user: users[normalized] });
});

app.get('/api/user/:username', (req, res) => {
  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  const user = users[req.params.username.toLowerCase()];
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
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
