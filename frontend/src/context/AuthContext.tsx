import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  xp: number;
  level: number;
  wins: number;
  losses: number;
  accuracy: number;
  bestStreak: number;
  mentalBestScore: number;
  achievements: string[];
}

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateLocalStats: (gameStats: {
    won: boolean;
    correctAnswers: number;
    wrongAnswers: number;
    bestStreak: number;
    averageTime: number;
  }) => Promise<{ xpGained: number; unlockedAchievements: string[] }>;
  updateLocalMentalStats: (mentalStats: {
    score: number;
    totalNumbers: number;
    digits: number;
    speed: string;
  }) => Promise<{ xpGained: number }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
import { API_URL } from '../config';

export function calculateLevel(xp: number): number {
  if (xp < 500) return 1;
  if (xp < 1200) return 2;
  if (xp < 2500) return 3;
  if (xp < 5000) return 4;
  if (xp < 10000) return 5;
  return 5 + Math.floor((xp - 10000) / 10000);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('mb_token'));
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Guest User
  const getGuestProfile = (): UserProfile => {
    const cached = localStorage.getItem('mb_guest_profile');
    if (cached) return JSON.parse(cached);

    const initialGuest: UserProfile = {
      id: 'guest',
      username: 'Guest Fighter',
      xp: 0,
      level: 1,
      wins: 0,
      losses: 0,
      accuracy: 0,
      bestStreak: 0,
      mentalBestScore: 0,
      achievements: [],
    };
    localStorage.setItem('mb_guest_profile', JSON.stringify(initialGuest));
    return initialGuest;
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        // Fall back to guest profile
        setUser(getGuestProfile());
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.warn('Backend offline, using guest session');
        setUser(getGuestProfile());
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (emailOrUsername: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem('mb_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    localStorage.setItem('mb_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('mb_token');
    setToken(null);
    setUser(getGuestProfile());
  };

  // Sync game result
  const updateLocalStats = async (gameStats: {
    won: boolean;
    correctAnswers: number;
    wrongAnswers: number;
    bestStreak: number;
    averageTime: number;
  }) => {
    if (token) {
      try {
        const res = await fetch(`${API_URL}/profile/game-result`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(gameStats),
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          return {
            xpGained: data.xpGained,
            unlockedAchievements: data.unlockedAchievements || [],
          };
        }
      } catch (err) {
        console.warn('API error updating stats, updating local guest profile');
      }
    }

    // Update Guest Profile in local storage
    const guest = getGuestProfile();
    let xpGained = gameStats.correctAnswers * 10;
    if (gameStats.won) {
      xpGained += 50;
      guest.wins += 1;
    } else {
      guest.losses += 1;
    }

    if (gameStats.bestStreak >= 10) xpGained += 100;
    else if (gameStats.bestStreak >= 5) xpGained += 25;

    guest.xp += xpGained;
    const oldLevel = guest.level;
    guest.level = calculateLevel(guest.xp);

    if (gameStats.bestStreak > guest.bestStreak) {
      guest.bestStreak = gameStats.bestStreak;
    }

    const currentTotal = gameStats.correctAnswers + gameStats.wrongAnswers;
    if (currentTotal > 0) {
      guest.accuracy = Math.round(
        guest.accuracy * 0.8 + (gameStats.correctAnswers / currentTotal) * 100 * 0.2
      );
    }

    // Achievements for guest
    const unlockedAchievements: string[] = [];
    const checkUnlock = (badge: string) => {
      if (!guest.achievements.includes(badge)) {
        guest.achievements.push(badge);
        unlockedAchievements.push(badge);
      }
    };

    if (guest.wins >= 1) checkUnlock('first_win');
    if (gameStats.bestStreak >= 10) checkUnlock('streak_10');
    if (gameStats.averageTime < 2.0 && gameStats.correctAnswers >= 5) checkUnlock('speed_demon');

    localStorage.setItem('mb_guest_profile', JSON.stringify(guest));
    setUser(guest);

    return {
      xpGained,
      unlockedAchievements,
    };
  };

  // Sync mental score
  const updateLocalMentalStats = async (mentalStats: {
    score: number;
    totalNumbers: number;
    digits: number;
    speed: string;
  }) => {
    if (token) {
      try {
        const res = await fetch(`${API_URL}/profile/mental-result`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(mentalStats),
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          return { xpGained: data.xpGained };
        }
      } catch (err) {
        console.warn('API error updating mental stats');
      }
    }

    const guest = getGuestProfile();
    const isCorrect = mentalStats.score === 100;
    let xpGained = 0;

    if (isCorrect) {
      xpGained = mentalStats.totalNumbers * 5 * mentalStats.digits;
      if (mentalStats.speed === 'Fast') xpGained *= 1.5;
      if (mentalStats.speed === 'Expert') xpGained *= 2;
      xpGained = Math.round(xpGained);
    }

    guest.xp += xpGained;
    guest.level = calculateLevel(guest.xp);

    if (isCorrect && mentalStats.digits >= 2 && !guest.achievements.includes('mental_master')) {
      guest.achievements.push('mental_master');
    }

    if (isCorrect && guest.mentalBestScore < mentalStats.score) {
      guest.mentalBestScore = mentalStats.score;
    }

    localStorage.setItem('mb_guest_profile', JSON.stringify(guest));
    setUser(guest);

    return { xpGained };
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        register,
        logout,
        updateLocalStats,
        updateLocalMentalStats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
