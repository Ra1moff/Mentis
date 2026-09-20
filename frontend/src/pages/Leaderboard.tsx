import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Star, Target, Crown, Calendar, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../config';

interface LeaderboardUser {
  rank: number;
  id: string;
  username: string;
  xp: number;
  wins: number;
  accuracy: number;
  level: number;
  bestStreak: number;
}

export const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'Daily' | 'Weekly' | 'Monthly' | 'All Time'>('All Time');
  const [rankings, setRankings] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const tabs = ['Daily', 'Weekly', 'Monthly', 'All Time'] as const;

  const fetchLeaderboard = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/leaderboard?filter=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setRankings(data);
      } else {
        throw new Error('Failed to load scoreboard');
      }
    } catch (err) {
      console.warn('Backend offline, loading fallback local leaderboard data.');
      // Create local fallback sorted by XP
      const fallbackList = [
        { rank: 1, id: 'user-1', username: 'Alex', xp: 2480, wins: 35, accuracy: 88, level: 4, bestStreak: 12 },
        { rank: 2, id: 'user-2', username: 'John', xp: 2310, wins: 32, accuracy: 85, level: 4, bestStreak: 9 },
        { rank: 3, id: 'user-3', username: 'Mike', xp: 2240, wins: 28, accuracy: 91, level: 3, bestStreak: 11 },
      ];

      // If active user exists, inject them
      if (user) {
        const userExists = fallbackList.some(u => u.id === user.id || u.username === user.username);
        if (!userExists) {
          fallbackList.push({
            rank: 4,
            id: user.id,
            username: user.username,
            xp: user.xp,
            wins: user.wins,
            accuracy: user.accuracy,
            level: user.level,
            bestStreak: user.bestStreak,
          });
        }
      }

      // Re-sort
      fallbackList.sort((a, b) => b.xp - a.xp);
      const rankedFallback = fallbackList.map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));

      setRankings(rankedFallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab, user]);

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-12 flex-1 flex flex-col justify-start">
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-game-light tracking-wide flex items-center justify-center gap-3">
          <Trophy className="text-game-yellow w-10 h-10 animate-pulse" /> Hall of Fame
        </h2>
        <p className="text-game-lightBlue text-sm sm:text-base mt-2">
          Compare your arithmetic agility and battle points on the global scoreboard.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-game-blue border-opacity-20 gap-2 mb-8 justify-center sm:justify-start">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-4 font-bold text-sm transition-all duration-200 border-b-2 flex items-center gap-1.5 ${
              activeTab === tab
                ? 'text-game-lightBlue border-game-lightBlue'
                : 'text-game-light opacity-50 border-transparent hover:opacity-85'
            }`}
          >
            <Calendar className="w-4 h-4" /> {tab}
          </button>
        ))}
      </div>

      {/* Ranking List Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-game-blue border-opacity-30">
        <div className="p-4 bg-game-navy bg-opacity-40 border-b border-game-blue border-opacity-30 grid grid-cols-12 text-xs font-bold text-game-lightBlue uppercase tracking-wider text-center sm:text-left">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-5 sm:col-span-4 pl-4">Combatant</div>
          <div className="col-span-2 text-center">Level</div>
          <div className="col-span-3 sm:col-span-2 text-center">Wins</div>
          <div className="hidden sm:block col-span-2 text-center">Accuracy</div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <RefreshCw className="w-8 h-8 text-game-lightBlue animate-spin" />
            <span className="text-sm text-game-lightBlue">Loading scoreboard...</span>
          </div>
        ) : (
          <div className="flex flex-col">
            {rankings.map((item, index) => {
              const isCurrentUser = item.username === user?.username || item.id === user?.id;
              
              // Custom rank symbols
              let rankBadge = <span className="text-sm font-bold text-game-light opacity-75">#{item.rank}</span>;
              if (item.rank === 1) rankBadge = <Crown className="w-5.5 h-5.5 text-game-yellow mx-auto drop-shadow-[0_0_8px_rgba(233,196,106,0.3)]" />;
              else if (item.rank === 2) rankBadge = <Medal className="w-5.5 h-5.5 text-game-light mx-auto" />;
              else if (item.rank === 3) rankBadge = <Medal className="w-5.5 h-5.5 text-game-orange mx-auto" />;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={item.id || item.username}
                  className={`grid grid-cols-12 py-4 border-b border-game-blue border-opacity-10 items-center hover:bg-game-blue hover:bg-opacity-5 transition-colors ${
                    isCurrentUser ? 'bg-game-blue bg-opacity-10 font-bold border-l-4 border-l-game-lightBlue' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-2 text-center flex items-center justify-center">
                    {rankBadge}
                  </div>

                  {/* Username */}
                  <div className="col-span-5 sm:col-span-4 pl-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-game-blue bg-opacity-20 border border-game-blue border-opacity-30 hidden sm:flex items-center justify-center text-sm">
                      {item.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-game-light text-sm truncate max-w-[130px] sm:max-w-none">
                        {item.username}
                      </span>
                      <span className="text-[10px] text-game-lightBlue font-semibold uppercase tracking-wider">
                        {item.xp} XP
                      </span>
                    </div>
                  </div>

                  {/* Level */}
                  <div className="col-span-2 text-center">
                    <span className="bg-game-navy bg-opacity-70 border border-game-blue border-opacity-20 px-2.5 py-0.5 rounded text-xs text-game-lightBlue">
                      Lvl {item.level}
                    </span>
                  </div>

                  {/* Wins */}
                  <div className="col-span-3 sm:col-span-2 text-center text-sm text-game-light">
                    {item.wins}
                  </div>

                  {/* Accuracy */}
                  <div className="hidden sm:block col-span-2 text-center text-sm font-semibold text-game-green">
                    {item.accuracy}%
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
