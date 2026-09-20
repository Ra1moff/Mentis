import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Swords, Home, Trophy, Award, Zap, Clock, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const MathBattleResult: React.FC = () => {
  const location = useLocation();
  const state = location.state || {};

  const {
    won = false,
    opponentType = 'bot',
    difficulty = 'Medium',
    maxQuestions = 10,
    p1Stats = { score: 0, correct: 0, wrong: 0, accuracy: 0, avgTime: 0.0, bestStreak: 0 },
    p2Stats = { username: 'AI Bot', score: 0, correct: 0, wrong: 0, accuracy: 0, bestStreak: 0 },
    xpGained = 0,
    unlockedAchievements = [] as string[],
  } = state;

  const achievementMeta: { [key: string]: { title: string; desc: string; icon: string } } = {
    first_win: { title: 'First Victory', desc: 'Won your first battle in the Arena!', icon: '🏆' },
    streak_10: { title: 'Mathematical Fire', desc: 'Achieved an answer streak of 10+!', icon: '🔥' },
    speed_demon: { title: 'Speed Demon', desc: 'Maintained an average answer speed under 2.0s!', icon: '⚡' },
    mental_master: { title: 'Mental Master', desc: 'Completed 2-digit mental arithmetic training!', icon: '🧠' },
    top_10: { title: 'Hall of Fame', desc: 'Climbed into the top 10 on the leaderboards!', icon: '👑' },
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-12 flex-1 flex flex-col justify-center items-center">
      {/* Dynamic Header */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-center mb-8"
      >
        <span className="bg-game-navy bg-opacity-60 text-game-lightBlue text-xs font-bold px-4 py-1.5 rounded-full border border-game-blue border-opacity-35 tracking-widest uppercase mb-4 inline-block">
          Battle Finished • vs {opponentType === 'bot' ? 'AI Bot' : 'Player'}
        </span>
        <h2
          className={`text-5xl sm:text-7xl font-black uppercase tracking-wider mb-2 ${
            won ? 'text-game-green glow-green' : 'text-game-red glow-red'
          }`}
        >
          {won ? 'YOU WIN 🏆' : 'YOU LOSE'}
        </h2>
        <p className="text-game-lightBlue text-sm sm:text-base font-semibold">
          Difficulty: {difficulty} • {maxQuestions} Questions Round
        </p>
      </motion.div>

      {/* Reward Card */}
      {xpGained > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 rounded-xl border border-game-green border-opacity-30 flex items-center justify-between gap-6 mb-8 w-full max-w-xl bg-gradient-to-r from-game-navy to-game-green/5"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-game-green bg-opacity-15 rounded-lg border border-game-green border-opacity-35 flex items-center justify-center">
              <Zap className="w-6 h-6 text-game-green animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-game-light text-base">Combat Rewards</h4>
              <p className="text-xs text-game-lightBlue">Experience points loaded to profile.</p>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-game-green tracking-wide">
            +{xpGained} <span className="text-xs font-bold uppercase text-game-lightBlue">XP</span>
          </div>
        </motion.div>
      )}

      {/* Stats Comparison Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mb-10"
      >
        {/* Player 1 Stats */}
        <div className="glass-panel p-6 rounded-2xl relative border border-game-blue border-opacity-30">
          <div className="absolute top-4 right-4 bg-game-blue bg-opacity-20 text-[10px] text-game-lightBlue font-bold uppercase px-2 py-0.5 rounded border border-game-blue border-opacity-20">
            Player
          </div>
          <h3 className="font-bold text-lg text-game-light border-b border-game-blue border-opacity-20 pb-3 mb-4">
            Your Performance
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-game-lightBlue">Accuracy</span>
              <span className="font-bold text-game-light">{p1Stats.accuracy}%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-game-lightBlue">Correct Answers</span>
              <span className="font-bold text-game-green">
                {p1Stats.correct} <span className="text-xs text-game-lightBlue">/ {p1Stats.correct + p1Stats.wrong}</span>
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-game-lightBlue">Avg. Time Used</span>
              <span className="font-bold text-game-light flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-game-lightBlue" /> {p1Stats.avgTime}s
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-game-lightBlue">Best Answer Streak</span>
              <span className="font-bold text-game-orange">🔥 {p1Stats.bestStreak}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-game-blue border-opacity-10 pt-3">
              <span className="text-game-lightBlue font-bold">Total Points</span>
              <span className="font-extrabold text-game-lightBlue text-lg">{p1Stats.score}</span>
            </div>
          </div>
        </div>

        {/* Player 2 Stats */}
        <div className="glass-panel p-6 rounded-2xl relative border border-game-blue border-opacity-20">
          <div className="absolute top-4 right-4 bg-game-navy text-[10px] text-game-lightBlue font-bold uppercase px-2 py-0.5 rounded border border-game-blue border-opacity-15">
            Opponent
          </div>
          <h3 className="font-bold text-lg text-game-light border-b border-game-blue border-opacity-20 pb-3 mb-4">
            {p2Stats.username}
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-game-lightBlue">Accuracy</span>
              <span className="font-bold text-game-light">{p2Stats.accuracy}%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-game-lightBlue">Correct Answers</span>
              <span className="font-bold text-game-light">
                {p2Stats.correct} <span className="text-xs text-game-lightBlue">/ {p2Stats.correct + p2Stats.wrong}</span>
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-game-lightBlue">Avg. Time Used</span>
              <span className="font-bold text-game-light flex items-center gap-1 opacity-50">
                <Clock className="w-3.5 h-3.5 text-game-lightBlue" /> --
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-game-lightBlue">Best Answer Streak</span>
              <span className="font-bold text-game-light">🔥 {p2Stats.bestStreak}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-game-blue border-opacity-10 pt-3">
              <span className="text-game-lightBlue font-bold">Total Points</span>
              <span className="font-extrabold text-game-light text-lg">{p2Stats.score}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Unlocked Achievements Section */}
      {unlockedAchievements && unlockedAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-3xl flex flex-col items-center gap-4 bg-game-blue bg-opacity-15 p-6 rounded-2xl border border-game-lightBlue border-opacity-25 mb-10 text-center"
        >
          <div className="flex items-center gap-1.5 text-game-orange font-bold uppercase tracking-wider text-xs">
            <Sparkles className="w-4 h-4 text-game-orange" /> Unlocked Trophies!
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-2">
            {unlockedAchievements.map((badge: string) => {
              const info = achievementMeta[badge] || { title: badge, desc: 'Unlocked new milestone!', icon: '🏆' };
              return (
                <div
                  key={badge}
                  className="glass-panel p-4 rounded-xl flex items-center gap-3 border border-game-orange border-opacity-20 text-left bg-gradient-to-r from-game-navy to-game-orange/5"
                >
                  <div className="text-3xl">{info.icon}</div>
                  <div>
                    <h5 className="font-bold text-game-light text-sm">{info.title}</h5>
                    <p className="text-xs text-game-lightBlue mt-0.5">{info.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center"
      >
        <Link
          to="/battle"
          className="game-btn-primary py-3.5 px-8 flex justify-center items-center gap-2 font-bold"
        >
          <Swords className="w-5 h-5" /> Play Again
        </Link>
        <Link
          to="/"
          className="game-btn-secondary py-3.5 px-8 flex justify-center items-center gap-2 font-bold"
        >
          <Home className="w-5 h-5" /> Back to Home
        </Link>
      </motion.div>
    </div>
  );
};
