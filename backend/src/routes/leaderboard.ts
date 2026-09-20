import { Router, Request, Response, RequestHandler } from 'express';
import { readDb } from '../db/mockDb';

const router = Router();

// Get Leaderboards
router.get('/', (async (req: Request, res: Response) => {
  try {
    const { filter } = req.query; // 'Daily' | 'Weekly' | 'Monthly' | 'All Time'
    const db = readDb();
    
    // Sort users by XP to generate leaderboard
    let sortedUsers = [...db.users];
    
    // In a fully featured DB, we would filter by date fields of game results.
    // For our mock, we will add slight random variations to the XP/wins for Daily/Weekly tabs
    // so it looks like different players are climbing different boards.
    if (filter === 'Daily') {
      sortedUsers.sort((a, b) => {
        // Daily board: randomize order slightly to simulate active daily competition
        const aVal = a.xp * (0.1 + Math.sin(a.username.charCodeAt(0)) * 0.05);
        const bVal = b.xp * (0.1 + Math.sin(b.username.charCodeAt(0)) * 0.05);
        return bVal - aVal;
      });
    } else if (filter === 'Weekly') {
      sortedUsers.sort((a, b) => {
        const aVal = a.xp * (0.4 + Math.cos(a.username.charCodeAt(0)) * 0.1);
        const bVal = b.xp * (0.4 + Math.cos(b.username.charCodeAt(0)) * 0.1);
        return bVal - aVal;
      });
    } else if (filter === 'Monthly') {
      sortedUsers.sort((a, b) => (b.xp + b.wins * 10) - (a.xp + a.wins * 10));
    } else {
      // All Time
      sortedUsers.sort((a, b) => b.xp - a.xp);
    }

    const leaderboard = sortedUsers.map((u, index) => ({
      rank: index + 1,
      id: u.id,
      username: u.username,
      xp: u.xp,
      wins: u.wins,
      accuracy: u.accuracy,
      level: u.level,
      bestStreak: u.bestStreak
    }));

    return res.json(leaderboard);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}) as RequestHandler);

export default router;
