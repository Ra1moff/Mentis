import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import leaderboardRoutes from './routes/leaderboard';
import { setupSocketHandlers } from './socket/roomManager';

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS middleware configurations
app.use(cors({
  origin: '*', // Allows local testing across ports/devices
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

import { readDb, writeDb } from './db/mockDb';

// Express API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Feedback Submission Endpoint
app.post('/api/feedback', (req, res) => {
  try {
    const { username, email, message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const db = readDb();
    
    // Safety check for feedbacks array existence
    if (!db.feedbacks) {
      db.feedbacks = [];
    }

    const newFeedback = {
      id: `fb-${Math.random().toString(36).substring(2, 9)}`,
      username: username || 'Anonymous Guest',
      email: email || '',
      message: message.trim(),
      createdAt: new Date().toISOString()
    };

    db.feedbacks.push(newFeedback);
    writeDb(db);

    console.log(`[Feedback] Saved feedback from ${newFeedback.username}`);

    // Telegram Bot dispatching
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId && botToken !== 'YOUR_TELEGRAM_BOT_TOKEN' && chatId !== 'YOUR_TELEGRAM_CHAT_ID') {
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const textMessage = `🚨 *New MathBattle Feedback!*\n\n` +
                          `👤 *User:* ${newFeedback.username}\n` +
                          `📧 *Contact:* ${newFeedback.email || 'None'}\n` +
                          `📅 *Date:* ${new Date(newFeedback.createdAt).toLocaleString()}\n\n` +
                          `💬 *Message:*\n${newFeedback.message}`;

      fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: textMessage,
          parse_mode: 'Markdown'
        })
      })
      .then(async (response) => {
        if (!response.ok) {
          const errText = await response.text();
          console.error('[Telegram] API response error:', errText);
        } else {
          console.log('[Telegram] Notification dispatched successfully.');
        }
      })
      .catch((err) => {
        console.error('[Telegram] Connection dispatch error:', err);
      });
    }

    return res.status(201).json({ success: true, message: 'Thank you for your feedback!' });
  } catch (err) {
    console.error('Error saving feedback:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Simple Health Status
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mathbattle-backend' });
});

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Bind real-time socket actions
setupSocketHandlers(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`MathBattle Game Server running on port ${PORT}`);
  console.log(`=========================================`);
});
