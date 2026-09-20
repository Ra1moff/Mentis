import React from 'react';
import { Link } from 'react-router-dom';
import { Swords, Brain, Trophy, ArrowRight, Zap, Target, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';

export const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-16 md:py-24 max-w-6xl mx-auto w-full">
        {/* Background Decorative Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-game-blue bg-opacity-5 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <span className="bg-game-blue bg-opacity-35 text-game-lightBlue text-xs font-semibold px-4 py-1.5 rounded-full border border-game-blue border-opacity-30 tracking-widest uppercase mb-6 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Gamified Math Training Arena
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-game-light leading-none mb-6">
            Challenge Your Mind.
          </h1>
          <p className="text-lg sm:text-2xl text-game-lightBlue font-medium max-w-xl mx-auto mb-10 leading-relaxed">
            Solve faster. Think smarter. Pull harder.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mb-16"
        >
          <Link to="/battle" className="game-btn-primary py-3.5 px-8 w-full sm:w-auto text-base flex justify-center items-center gap-2 group">
            Start Battle <Swords className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
          </Link>
          <Link to="/mental" className="game-btn-secondary py-3.5 px-8 w-full sm:w-auto text-base flex justify-center items-center gap-2">
            Mental Arithmetic <Brain className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* Dynamic Minimalist Pulling Illustration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="w-full max-w-2xl glass-panel p-8 rounded-2xl relative overflow-hidden flex flex-col items-center mb-12 border border-game-blue border-opacity-20"
        >
          <div className="w-full flex justify-between items-center relative py-8">
            {/* Center Line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-game-red bg-opacity-70 z-10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 bg-game-red text-[9px] px-2 py-0.5 rounded text-white font-bold tracking-widest uppercase z-10">
              Center
            </div>

            {/* Player 1 Left */}
            <motion.div
              animate={{ x: [-10, 5, -10] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="flex flex-col items-center text-center z-10 w-1/3"
            >
              <div className="text-3xl mb-1">🧍</div>
              <div className="text-xs font-bold text-game-light text-opacity-80">Player 1</div>
              <div className="text-[10px] text-game-green font-semibold mt-1 bg-game-green bg-opacity-10 px-2 py-0.5 rounded border border-game-green border-opacity-20">
                Correct!
              </div>
            </motion.div>

            {/* Rope Line */}
            <div className="flex-1 h-1 bg-game-blue bg-opacity-50 relative">
              {/* Rope knot */}
              <motion.div
                animate={{ x: [-20, 10, -20] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-game-light shadow border-2 border-game-navy"
              />
            </div>

            {/* Player 2 Right */}
            <motion.div
              animate={{ x: [10, -5, 10] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="flex flex-col items-center text-center z-10 w-1/3"
            >
              <div className="text-3xl mb-1">🧍</div>
              <div className="text-xs font-bold text-game-light text-opacity-80">Player 2</div>
              <div className="text-[10px] text-game-red font-semibold mt-1 bg-game-red bg-opacity-10 px-2 py-0.5 rounded border border-game-red border-opacity-20">
                Wrong!
              </div>
            </motion.div>
          </div>
          <div className="text-xs text-game-lightBlue text-center font-medium mt-4">
            Rope pulls dynamically as players answer mathematical equations correctly.
          </div>
        </motion.div>
      </section>

      {/* Explanations Section */}
      <section className="bg-game-navy bg-opacity-40 py-16 px-6 border-t border-game-blue border-opacity-20">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Math Battle */}
          <div className="glass-panel p-8 rounded-xl flex flex-col">
            <div className="w-12 h-12 bg-game-blue bg-opacity-30 rounded-lg flex items-center justify-center mb-6 border border-game-blue border-opacity-30">
              <Swords className="w-6 h-6 text-game-lightBlue" />
            </div>
            <h3 className="text-xl font-bold text-game-light mb-3">Math Battle</h3>
            <p className="text-sm text-game-lightBlue leading-relaxed mb-6 flex-1">
              Engage in a competitive real-time rope-pulling contest against intelligent bots or real online players. Answer formulas to drag your opponent across the victory line.
            </p>
            <Link to="/battle" className="text-game-lightBlue text-sm font-semibold flex items-center gap-1 hover:underline">
              Enter Battle Arena <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Mental Arithmetic */}
          <div className="glass-panel p-8 rounded-xl flex flex-col">
            <div className="w-12 h-12 bg-game-blue bg-opacity-30 rounded-lg flex items-center justify-center mb-6 border border-game-blue border-opacity-30">
              <Brain className="w-6 h-6 text-game-lightBlue" />
            </div>
            <h3 className="text-xl font-bold text-game-light mb-3">Mental Arithmetic</h3>
            <p className="text-sm text-game-lightBlue leading-relaxed mb-6 flex-1">
              Enhance working memory and speed. Watch numbers flash sequentially on screen, remember the running total, and input the sum. Custom configuration settings for digits and speeds.
            </p>
            <Link to="/mental" className="text-game-lightBlue text-sm font-semibold flex items-center gap-1 hover:underline">
              Train Arithmetic <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3: Global Leaderboard */}
          <div className="glass-panel p-8 rounded-xl flex flex-col">
            <div className="w-12 h-12 bg-game-blue bg-opacity-30 rounded-lg flex items-center justify-center mb-6 border border-game-blue border-opacity-30">
              <Trophy className="w-6 h-6 text-game-lightBlue" />
            </div>
            <h3 className="text-xl font-bold text-game-light mb-3">Global Leaderboard</h3>
            <p className="text-sm text-game-lightBlue leading-relaxed mb-6 flex-1">
              Climb the ranks! Compete against global players on Daily, Weekly, Monthly, and All-Time leaderboards. Earn XP, achieve level milestones, and unlock premium badges.
            </p>
            <Link to="/leaderboard" className="text-game-lightBlue text-sm font-semibold flex items-center gap-1 hover:underline">
              View Leaderboards <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature stats banner */}
      <section className="py-16 px-6 max-w-4xl mx-auto w-full text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-game-light mb-12">Enhance Calculations & Focus</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <Gauge className="w-8 h-8 text-game-lightBlue mb-3" />
            <div className="text-3xl font-extrabold text-game-light">100ms</div>
            <div className="text-xs font-semibold text-game-lightBlue uppercase tracking-wider mt-1">Calculation Response</div>
          </div>
          <div className="flex flex-col items-center">
            <Target className="w-8 h-8 text-game-green mb-3" />
            <div className="text-3xl font-extrabold text-game-light">95%+</div>
            <div className="text-xs font-semibold text-game-lightBlue uppercase tracking-wider mt-1">Target Accuracy</div>
          </div>
          <div className="col-span-2 md:col-span-1 flex flex-col items-center">
            <Swords className="w-8 h-8 text-game-orange mb-3" />
            <div className="text-3xl font-extrabold text-game-light">10k+</div>
            <div className="text-xs font-semibold text-game-lightBlue uppercase tracking-wider mt-1">Battles Completed</div>
          </div>
        </div>
      </section>
    </div>
  );
};
