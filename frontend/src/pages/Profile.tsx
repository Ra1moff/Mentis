import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, Flame, Zap, Award, Target, Brain, Lock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export const Profile: React.FC = () => {
  const { user, token } = useAuth();

  // If loading or no user
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto w-full px-6 py-12 flex-1 flex items-center justify-center">
        <span className="text-game-lightBlue font-semibold">Loading player profile...</span>
      </div>
    );
  }

  // Calculate Win Rate
  const totalGames = user.wins + user.losses;
  const winRate = totalGames > 0 ? Math.round((user.wins / totalGames) * 100) : 0;

  // Level Progression XP Bounds
  const getXpThresholds = (lvl: number) => {
    switch (lvl) {
      case 1: return { min: 0, max: 500 };
      case 2: return { min: 500, max: 1200 };
      case 3: return { min: 1200, max: 2500 };
      case 4: return { min: 2500, max: 5000 };
      case 5: return { min: 5000, max: 10000 };
      default:
        const base = 10000 + (lvl - 5) * 10000;
        return { min: base, max: base + 10000 };
    }
  };

  const thresholds = getXpThresholds(user.level);
  const xpNeeded = thresholds.max - thresholds.min;
  const xpCurrent = user.xp - thresholds.min;
  const xpPercent = Math.min(Math.max((xpCurrent / xpNeeded) * 100, 0), 100);

  // List of possible achievements
  const achievementsList = [
    {
      id: 'first_win',
      title: 'First Victory',
      desc: 'Win your first battle in the Arena.',
      icon: '🏆',
      color: 'from-yellow-400 to-amber-500',
    },
    {
      id: 'streak_10',
      title: 'Mathematical Fire',
      desc: 'Achieve an answer/win streak of 10+.',
      icon: '🔥',
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'speed_demon',
      title: 'Speed Demon',
      desc: 'Maintain average speed under 2.0 seconds.',
      icon: '⚡',
      color: 'from-cyan-400 to-blue-500',
    },
    {
      id: 'mental_master',
      title: 'Mental Master',
      desc: 'Complete 2-digit mental arithmetic training.',
      icon: '🧠',
      color: 'from-purple-400 to-pink-500',
    },
    {
      id: 'top_10',
      title: 'Hall of Fame',
      desc: 'Unlock by ranking on the leaderboard.',
      icon: '👑',
      color: 'from-yellow-300 to-yellow-600',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-12 flex-1 flex flex-col justify-start">
      {/* Top Profile Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative border border-game-blue border-opacity-30 mb-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left bg-gradient-to-r from-game-navy to-game-blue/10">
        
        {/* Guest Mode Warn badge */}
        {!token && (
          <div className="absolute top-4 right-4 bg-game-orange bg-opacity-25 border border-game-orange border-opacity-35 text-[10px] text-game-light px-3 py-1 rounded-full flex items-center gap-1 font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-game-orange" /> Unregistered Profile
          </div>
        )}

        {/* Profile Avatar circle */}
        <div className="w-20 h-20 rounded-full bg-game-blue bg-opacity-20 border-2 border-game-lightBlue flex items-center justify-center text-4xl shadow-xl shadow-game-blue/20 select-none">
          {user.username.substring(0, 2).toUpperCase()}
        </div>

        {/* Name / Level */}
        <div className="flex-1 flex flex-col gap-2 w-full">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-game-light tracking-wide">{user.username}</h2>
            <p className="text-xs text-game-lightBlue font-semibold uppercase tracking-wider mt-0.5">Arena Duelist</p>
          </div>

          {/* Level Progress */}
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-game-lightBlue">Level {user.level}</span>
              <span className="text-game-light">{user.xp} / {thresholds.max} XP</span>
            </div>
            {/* Progress bar wrapper */}
            <div className="w-full bg-game-dark bg-opacity-60 h-3 rounded-full overflow-hidden border border-game-blue border-opacity-15 relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-game-blue to-game-lightBlue"
              />
            </div>
            <span className="text-[10px] text-game-lightBlue font-medium">
              {thresholds.max - user.xp} XP remaining until Level {user.level + 1}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <h3 className="font-bold text-lg text-game-light uppercase tracking-wider mb-4 border-b border-game-blue border-opacity-15 pb-2">
        Arena Statistics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        
        {/* Wins */}
        <div className="glass-panel p-5 rounded-xl border border-game-blue border-opacity-20 text-center flex flex-col justify-center">
          <Trophy className="w-6 h-6 text-game-yellow mx-auto mb-2" />
          <div className="text-2xl font-extrabold text-game-light">{user.wins}</div>
          <div className="text-[10px] font-bold text-game-lightBlue uppercase tracking-wider mt-1">Total Wins</div>
        </div>

        {/* Win Rate */}
        <div className="glass-panel p-5 rounded-xl border border-game-blue border-opacity-20 text-center flex flex-col justify-center">
          <Target className="w-6 h-6 text-game-green mx-auto mb-2" />
          <div className="text-2xl font-extrabold text-game-light">{winRate}%</div>
          <div className="text-[10px] font-bold text-game-lightBlue uppercase tracking-wider mt-1">Win Rate</div>
        </div>

        {/* Accuracy */}
        <div className="glass-panel p-5 rounded-xl border border-game-blue border-opacity-20 text-center flex flex-col justify-center">
          <CheckCircle2 className="w-6 h-6 text-game-lightBlue mx-auto mb-2" />
          <div className="text-2xl font-extrabold text-game-light">{user.accuracy}%</div>
          <div className="text-[10px] font-bold text-game-lightBlue uppercase tracking-wider mt-1">Avg Accuracy</div>
        </div>

        {/* Streaks */}
        <div className="glass-panel p-5 rounded-xl border border-game-blue border-opacity-20 text-center flex flex-col justify-center">
          <Flame className="w-6 h-6 text-game-orange mx-auto mb-2" />
          <div className="text-2xl font-extrabold text-game-light">🔥 {user.bestStreak}</div>
          <div className="text-[10px] font-bold text-game-lightBlue uppercase tracking-wider mt-1">Best Streak</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Arithmetic score */}
        <div className="glass-panel p-6 rounded-2xl border border-game-blue border-opacity-20 flex flex-col justify-center gap-3">
          <div className="flex items-center gap-2 font-bold text-base text-game-light border-b border-game-blue border-opacity-15 pb-2.5">
            <Brain className="w-5 h-5 text-game-lightBlue" /> Arithmetic PB
          </div>
          <div className="py-2 text-center">
            <div className="text-4xl font-extrabold text-game-light tracking-wide">{user.mentalBestScore}%</div>
            <p className="text-[10px] font-semibold text-game-lightBlue uppercase mt-1">Best calculation accuracy</p>
          </div>
        </div>

        {/* Trophies cabinet */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <h3 className="font-bold text-lg text-game-light uppercase tracking-wider border-b border-game-blue border-opacity-15 pb-2.5">
            Unlocked Milestones
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievementsList.map((item) => {
              const isUnlocked = user.achievements.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`glass-panel p-4 rounded-xl flex items-center gap-4 border transition-all duration-300 ${
                    isUnlocked
                      ? 'border-game-lightBlue border-opacity-35 bg-gradient-to-r from-game-navy to-game-blue/5'
                      : 'border-game-blue border-opacity-10 opacity-50 bg-game-dark bg-opacity-20'
                  }`}
                >
                  <div className={`text-3xl filter ${isUnlocked ? '' : 'grayscale opacity-30'}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h5 className={`font-bold text-sm ${isUnlocked ? 'text-game-light' : 'text-game-lightBlue'}`}>
                      {item.title}
                    </h5>
                    <p className="text-xs text-game-lightBlue mt-0.5 leading-tight">
                      {item.desc}
                    </p>
                  </div>
                  <div>
                    {!isUnlocked && <Lock className="w-4 h-4 text-game-lightBlue opacity-40" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
