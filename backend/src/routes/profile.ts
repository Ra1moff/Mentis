import { Router, Request, Response, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { readDb, writeDb, User } from '../db/mockDb';
import { calculateLevel } from './auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mathbattle-secret-key-12345';

// Middleware to authenticate token
const authenticateToken = (req: Request, res: Response, next: () => void) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    (req as any).userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid session token' });
  }
};

// Update stats after Math Battle game
router.post('/game-result', authenticateToken, (async (req: Request, res: Response) => {
  try {
    const { won, correctAnswers, wrongAnswers, bestStreak, averageTime } = req.body;
    const userId = (req as any).userId;

    const db = readDb();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = db.users[userIndex];

    // Calculate XP updates
    let xpGained = correctAnswers * 10; // +10 XP per correct answer
    if (won) {
      xpGained += 50; // +50 XP for Win
      user.wins += 1;
    } else {
      user.losses += 1;
    }

    // Streak bonuses
    if (bestStreak >= 10) {
      xpGained += 100;
    } else if (bestStreak >= 5) {
      xpGained += 25;
    }

    user.xp += xpGained;
    user.level = calculateLevel(user.xp);

    // Update streaks and performance metrics
    if (bestStreak > user.bestStreak) {
      user.bestStreak = bestStreak;
    }

    // Dynamic running average accuracy
    const totalAns = (user.wins + user.losses) * 10; // estimate total answers or compute locally
    const currentSessionTotal = correctAnswers + wrongAnswers;
    if (currentSessionTotal > 0) {
      const accuracySum = user.accuracy * 0.8 + (correctAnswers / currentSessionTotal) * 100 * 0.2;
      user.accuracy = Math.round(accuracySum);
    }

    // Achievements check
    const newAchievements = [...user.achievements];
    if (user.wins >= 1 && !newAchievements.includes('first_win')) {
      newAchievements.push('first_win');
    }
    if (bestStreak >= 10 && !newAchievements.includes('streak_10')) {
      newAchievements.push('streak_10');
    }
    if (averageTime < 2.0 && correctAnswers >= 5 && !newAchievements.includes('speed_demon')) {
      newAchievements.push('speed_demon');
    }

    user.achievements = newAchievements;
    db.users[userIndex] = user;

    writeDb(db);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.json({
      xpGained,
      user: userWithoutPassword,
      unlockedAchievements: newAchievements.filter(a => !user.achievements.includes(a)),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}) as RequestHandler);

// Update stats after Mental Arithmetic session
router.post('/mental-result', authenticateToken, (async (req: Request, res: Response) => {
  try {
    const { score, totalNumbers, digits, speed } = req.body;
    const userId = (req as any).userId;

    const db = readDb();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = db.users[userIndex];

    // XP calculation: 5 XP per correct number calculated
    // e.g. score represents whether they got it correct (100% or 0%)
    const isCorrect = score === 100;
    let xpGained = 0;
    
    if (isCorrect) {
      xpGained = totalNumbers * 5 * digits; // multipliers for digits size
      if (speed === 'Fast') xpGained *= 1.5;
      if (speed === 'Expert') xpGained *= 2;
      xpGained = Math.round(xpGained);
    }

    user.xp += xpGained;
    user.level = calculateLevel(user.xp);

    if (isCorrect && digits >= 2 && !user.achievements.includes('mental_master')) {
      user.achievements.push('mental_master');
    }

    if (isCorrect && user.mentalBestScore < score) {
      user.mentalBestScore = score;
    }

    db.users[userIndex] = user;
    writeDb(db);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.json({
      xpGained,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}) as RequestHandler);

export default router;
