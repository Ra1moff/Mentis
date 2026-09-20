import * as fs from 'fs';
import * as path from 'path';

const DB_FILE = path.join(__dirname, '../../db.json');

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  xp: number;
  level: number;
  wins: number;
  losses: number;
  accuracy: number;
  bestStreak: number;
  mentalBestScore: number;
  achievements: string[];
}

export interface LeaderboardEntry {
  username: string;
  xp: number;
  wins: number;
  accuracy: number;
  level: number;
  updatedAt: string;
}

export interface DbSchema {
  users: User[];
  leaderboards: LeaderboardEntry[];
  dailyChallengeAnswers: { [userId: string]: { score: number; accuracy: number; date: string } };
  feedbacks: Array<{ id: string; username: string; email?: string; message: string; createdAt: string }>;
}

function getInitialDb(): DbSchema {
  return {
    users: [
      {
        id: 'user-1',
        username: 'Alex',
        email: 'alex@mathbattle.com',
        passwordHash: '$2a$10$xyz', // Mocked hash
        xp: 2480,
        level: 4,
        wins: 35,
        losses: 12,
        accuracy: 88,
        bestStreak: 12,
        mentalBestScore: 92,
        achievements: ['first_win', 'streak_10', 'mental_master'],
      },
      {
        id: 'user-2',
        username: 'John',
        email: 'john@mathbattle.com',
        passwordHash: '$2a$10$xyz',
        xp: 2310,
        level: 4,
        wins: 32,
        losses: 15,
        accuracy: 85,
        bestStreak: 9,
        mentalBestScore: 84,
        achievements: ['first_win', 'speed_demon'],
      },
      {
        id: 'user-3',
        username: 'Mike',
        email: 'mike@mathbattle.com',
        passwordHash: '$2a$10$xyz',
        xp: 2240,
        level: 3,
        wins: 28,
        losses: 10,
        accuracy: 91,
        bestStreak: 11,
        mentalBestScore: 88,
        achievements: ['first_win', 'top_10'],
      }
    ],
    leaderboards: [],
    dailyChallengeAnswers: {},
    feedbacks: [],
  };
}

export function readDb(): DbSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDb();
      writeDb(initial);
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading mock database:', err);
    return getInitialDb();
  }
}

export function writeDb(data: DbSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing mock database:', err);
  }
}
