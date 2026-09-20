import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, ArrowLeft, RotateCcw, Award, Zap, HelpCircle, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export const MentalArithmeticGame: React.FC = () => {
  const { updateLocalMentalStats } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Params
  const digits = parseInt(searchParams.get('digits') || '2');
  const valuesCount = parseInt(searchParams.get('values') || '10');
  const speed = searchParams.get('speed') || 'Normal';
  const operation = searchParams.get('operation') || 'Addition';

  // Game Loop States
  const [gameState, setGameState] = useState<'countdown' | 'flashing' | 'input' | 'result'>('countdown');
  const [countdown, setCountdown] = useState<number | string>(3);
  const [numbersList, setNumbersList] = useState<number[]>([]);
  const [currentNumberIdx, setCurrentNumberIdx] = useState(-1);
  const [userAnswer, setUserAnswer] = useState('');
  const [correctTotal, setCorrectTotal] = useState(0);
  const [xpGained, setXpGained] = useState(0);

  // Speed timings in ms
  const speedDelay =
    speed === 'Slow'
      ? 3000
      : speed === 'Normal'
      ? 1800
      : speed === 'Fast'
      ? 900
      : 400; // Expert

  // Ref for timer
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize
  useEffect(() => {
    // Generate random values list
    const generated: number[] = [];
    const getRand = (d: number): number => {
      const min = Math.pow(10, d - 1);
      const max = Math.pow(10, d) - 1;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    let totalSum = 0;
    for (let i = 0; i < valuesCount; i++) {
      let val = getRand(digits);
      
      // If Mixed mode, permit negative numbers for subsequent values
      if (operation === 'Mixed' && i > 0) {
        // 40% chance of subtraction
        if (Math.random() < 0.4) {
          // Keep sum positive for easier calculation, check if val < totalSum
          if (val < totalSum) {
            val = -val;
          }
        }
      }
      
      generated.push(val);
      totalSum += val;
    }

    setNumbersList(generated);
    setCorrectTotal(totalSum);

    // Countdown sequence
    let count = 3;
    const countInterval = setInterval(() => {
      if (count > 0) {
        setCountdown(count);
        count--;
      } else {
        setCountdown('START!');
        clearInterval(countInterval);
        setTimeout(() => {
          setGameState('flashing');
          setCurrentNumberIdx(0);
        }, 800);
      }
    }, 1000);

    return () => {
      clearInterval(countInterval);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, [digits, valuesCount, operation]);

  // Flasher Loop
  useEffect(() => {
    if (gameState !== 'flashing' || currentNumberIdx === -1) return;

    if (currentNumberIdx < numbersList.length) {
      // Flash number for (speedDelay - 150ms), then clear it briefly for blinking effect
      flashTimerRef.current = setTimeout(() => {
        setCurrentNumberIdx((prev) => prev + 1);
      }, speedDelay);
    } else {
      // Completed flashing, advance to answer input
      setGameState('input');
    }

    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, [gameState, currentNumberIdx, numbersList, speedDelay]);

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    const parsedAns = parseInt(userAnswer.trim());
    if (isNaN(parsedAns)) return;

    const isCorrect = parsedAns === correctTotal;
    const score = isCorrect ? 100 : 0;

    // Trigger confetti if correct
    if (isCorrect) {
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    // Submit stats
    const statsResult = await updateLocalMentalStats({
      score,
      totalNumbers: valuesCount,
      digits,
      speed,
    });

    setXpGained(statsResult.xpGained);
    setGameState('result');
  };

  const handleRetry = () => {
    // Reload components by redirecting back to setup or reloading location
    navigate(`/mental/game?digits=${digits}&values=${valuesCount}&speed=${speed}&operation=${operation}`);
    window.location.reload();
  };

  // Build formula display text (e.g. "47 + 23 - 8 + 14 = 76")
  const renderFormula = () => {
    let str = '';
    numbersList.forEach((num, index) => {
      if (index === 0) {
        str += num;
      } else {
        str += num >= 0 ? ` + ${num}` : ` - ${Math.abs(num)}`;
      }
    });
    return str;
  };

  const isCurrentCorrect = parseInt(userAnswer.trim()) === correctTotal;

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-12 flex-1 flex flex-col justify-center items-center">
      {/* Header parameters */}
      <div className="flex justify-between items-center w-full max-w-xl mb-10">
        <button
          onClick={() => {
            if (gameState === 'flashing' && !window.confirm('Quit training sessions?')) return;
            navigate('/mental');
          }}
          className="game-btn-secondary py-2 px-4 text-xs flex items-center gap-1 border-opacity-25"
        >
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
        <span className="bg-game-navy bg-opacity-60 text-game-lightBlue text-xs font-bold px-3 py-1 rounded-full border border-game-blue border-opacity-20 uppercase tracking-widest">
          {digits} Digits • {valuesCount} values • {speed}
        </span>
      </div>

      {/* Arena Content */}
      <div className="w-full max-w-xl glass-panel p-8 sm:p-12 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center border border-game-blue border-opacity-30 min-h-[360px]">
        
        {/* Countdown view */}
        {gameState === 'countdown' && (
          <div className="text-center flex flex-col items-center">
            <span className="text-xs font-bold uppercase text-game-lightBlue tracking-widest mb-3">Prepare Memory</span>
            <div className="text-7xl font-black text-game-red glow-red animate-pulse">{countdown}</div>
          </div>
        )}

        {/* Flashing digits view */}
        {gameState === 'flashing' && currentNumberIdx < numbersList.length && (
          <div className="text-center h-48 flex flex-col items-center justify-center relative">
            <span className="text-[10px] text-game-lightBlue font-bold uppercase tracking-widest absolute top-0">
              Value {currentNumberIdx + 1} of {valuesCount}
            </span>
            
            {/* Blinking flash animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentNumberIdx}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1.1, opacity: 1 }}
                exit={{ scale: 1.3, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-6xl sm:text-8xl font-black text-game-light select-none tracking-wide"
              >
                {numbersList[currentNumberIdx] > 0 && currentNumberIdx > 0 ? '+' : ''}
                {numbersList[currentNumberIdx]}
              </motion.div>
            </AnimatePresence>

            {/* Tiny timeline loader under flashed number */}
            <div className="w-32 bg-game-dark bg-opacity-40 h-1 rounded-full overflow-hidden absolute bottom-0 border border-game-blue border-opacity-15">
              <motion.div
                key={`bar-${currentNumberIdx}`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: speedDelay / 1000, ease: 'linear' }}
                className="h-full bg-game-lightBlue"
              />
            </div>
          </div>
        )}

        {/* User sum input view */}
        {gameState === 'input' && (
          <form onSubmit={handleAnswerSubmit} className="w-full flex flex-col items-center gap-6 animate-scale-up">
            <div className="text-center">
              <div className="w-12 h-12 bg-game-blue bg-opacity-20 rounded-full flex items-center justify-center mb-3 mx-auto border border-game-blue border-opacity-35">
                <HelpCircle className="w-6 h-6 text-game-lightBlue" />
              </div>
              <h3 className="text-2xl font-bold text-game-light">What is the total sum?</h3>
              <p className="text-xs text-game-lightBlue mt-1">Review the sequence and calculate the answer.</p>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-xs">
              <input
                type="number"
                pattern="[0-9]*"
                inputMode="numeric"
                autoFocus
                required
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Enter total"
                className="glass-input text-center text-2xl font-bold py-3 border-2 border-game-blue focus:border-game-lightBlue rounded-xl w-full"
              />
              <button type="submit" className="game-btn-primary py-3 font-bold mt-2 shadow-lg w-full">
                Show Result
              </button>
            </div>
          </form>
        )}

        {/* Results view */}
        {gameState === 'result' && (
          <div className="w-full flex flex-col items-center text-center gap-6 animate-scale-up">
            <div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto border-2 ${
                isCurrentCorrect 
                  ? 'bg-game-green bg-opacity-20 border-game-green text-game-green shadow-lg shadow-game-green/10' 
                  : 'bg-game-red bg-opacity-20 border-game-red text-game-red shadow-lg shadow-game-red/10'
              }`}>
                {isCurrentCorrect ? <Check className="w-8 h-8" /> : <X className="w-8 h-8" />}
              </div>
              
              <h3 className={`text-3xl font-extrabold uppercase ${isCurrentCorrect ? 'text-game-green' : 'text-game-red'}`}>
                {isCurrentCorrect ? 'Correct!' : 'Incorrect'}
              </h3>
            </div>

            {/* Reward */}
            {isCurrentCorrect && xpGained > 0 && (
              <div className="bg-game-green/15 text-game-green border border-game-green/30 text-sm font-bold py-2 px-6 rounded-full flex items-center gap-1.5 animate-pulse mt-1">
                <Zap className="w-4 h-4" /> Earned +{xpGained} XP
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="bg-game-dark bg-opacity-65 border border-game-blue border-opacity-20 p-5 rounded-xl w-full text-left">
              <span className="text-[10px] text-game-lightBlue font-bold uppercase tracking-widest">Formula breakdown</span>
              <p className="text-sm font-medium text-game-light leading-relaxed mt-2 select-all whitespace-normal break-words">
                {renderFormula()} = <span className="font-extrabold text-game-green">{correctTotal}</span>
              </p>
              <div className="border-t border-game-blue border-opacity-10 mt-3 pt-3 flex justify-between text-xs font-semibold">
                <span className="text-game-lightBlue">Your Answer:</span>
                <span className={`font-bold ${isCurrentCorrect ? 'text-game-green' : 'text-game-red'}`}>
                  {userAnswer}
                </span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex gap-4 w-full max-w-sm mt-2">
              <button onClick={handleRetry} className="game-btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-1.5">
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
              <button onClick={() => navigate('/mental')} className="game-btn-secondary flex-1 py-3 text-sm">
                Back to Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
