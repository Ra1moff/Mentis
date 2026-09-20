import { Router, Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readDb, writeDb, User } from '../db/mockDb';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mathbattle-secret-key-12345';

// Helper function to calculate level based on XP
export function calculateLevel(xp: number): number {
  if (xp < 500) return 1;
  if (xp < 1200) return 2;
  if (xp < 2500) return 3;
  // level = floor(sqrt(xp / 200)) or linear progression
  // Let's implement level requirements: L1: 0, L2: 500, L3: 1200, L4: 2500, L5: 5000, L6: 10000, etc.
  if (xp < 5000) return 4;
  if (xp < 10000) return 5;
  return 5 + Math.floor((xp - 10000) / 10000);
}

// Register
router.post('/register', (async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const db = readDb();
    
    // Check if user exists
    const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      return res.status(400).json({ error: 'Username or email already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser: User = {
      id: `user-${Math.random().toString(36).substring(2, 9)}`,
      username,
      email,
      passwordHash,
      xp: 0,
      level: 1,
      wins: 0,
      losses: 0,
      accuracy: 0,
      bestStreak: 0,
      mentalBestScore: 0,
      achievements: [],
    };

    db.users.push(newUser);
    writeDb(db);

    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
    
    // Omit password hash in response
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}) as RequestHandler);

// Login
router.post('/login', (async (req: Request, res: Response) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'Email/Username and password are required' });
    }

    const db = readDb();
    const user = db.users.find(
      u => u.email.toLowerCase() === emailOrUsername.toLowerCase() ||
           u.username.toLowerCase() === emailOrUsername.toLowerCase()
    );

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    // Omit password hash in response
    const { passwordHash: _, ...userWithoutPassword } = user;

    return res.json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}) as RequestHandler);

// Get authenticated user
router.get('/me', (async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const db = readDb();
    const user = db.users.find(u => u.id === decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}) as RequestHandler);

export default router;
