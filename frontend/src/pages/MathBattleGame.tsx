import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { generateQuestion, Question } from '../shared/questionGenerator';
import { io, Socket } from 'socket.io-client';

import confetti from 'canvas-confetti';
import { Swords, Bot, User, Clock, AlertCircle, ArrowLeft, Trophy, Sparkles, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BACKEND_URL } from '../config';
import { getSocket, disconnectSocket } from '../socketManager';

export const MathBattleGame: React.FC = () => {
  const { user, updateLocalStats } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Route parameters
  const roomId = searchParams.get('roomId');
  const opponentType = searchParams.get('opponent') || 'bot'; // 'bot' or 'player'
  const isMultiplayer = !!roomId;

  // Local game settings
  const gameDifficulty = (searchParams.get('difficulty') || 'Medium') as 'Easy' | 'Medium' | 'Hard';
  const maxQuestions = parseInt(searchParams.get('questions') || '10');

  // Match State
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState<number | string | null>(3);
  const [ropePosition, setRopePosition] = useState(0); // -100 to +100
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [p1Answers, setP1Answers] = useState({ correct: 0, wrong: 0, streak: 0, bestStreak: 0, times: [] as number[] });
  const [p2Answers, setP2Answers] = useState({ correct: 0, wrong: 0, streak: 0, bestStreak: 0, times: [] as number[] });
  const [winnerId, setWinnerId] = useState<string | null>(null);

  // Question State
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answerInput, setAnswerInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timerLeft, setTimerLeft] = useState(10.0); // 10s timer

  // Multiplayer Room State
  const [roomState, setRoomState] = useState<any>(null);
  const [mySocketId, setMySocketId] = useState<string>('');

  // References
  const inputRef = useRef<HTMLInputElement>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const botIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const questionStartTimeRef = useRef<number>(0);

  // Refs for tracking stale state closures in Bot timing loops
  const isPlayingRef = useRef(isPlaying);
  const winnerIdRef = useRef(winnerId);
  const difficultyRef = useRef(gameDifficulty);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    winnerIdRef.current = winnerId;
  }, [winnerId]);

  useEffect(() => {
    difficultyRef.current = gameDifficulty;
  }, [gameDifficulty]);

  // Setup game modes
  useEffect(() => {
    if (isMultiplayer) {
      // Reuse the existing socket from socketManager (created in MathBattleSetup)
      const socket = getSocket();
      setMySocketId(socket.id || '');

      // Clear previous listeners to avoid duplicates
      socket.off('roomState');
      socket.off('countdown');

      socket.on('roomState', (state: any) => {
        setRoomState(state);
        setRopePosition(state.ropePosition);

        // Update P1 (Left) and P2 (Right) scores
        const p1Id = state.playerOrder[0];
        const p2Id = state.playerOrder[1];
        if (state.players[p1Id]) setP1Score(state.players[p1Id].score);
        if (state.players[p2Id]) setP2Score(state.players[p2Id].score);

        // Sync question
        const isP1 = socket.id === p1Id;
        const currentIdx = state[isP1 ? 'p1Idx' : 'p2Idx'] || 0;
        
        if (state.status === 'playing') {
          setIsPlaying(true);
          setCountdown(null);
          
          if (currentIdx < state.maxQuestions) {
            const nextQ = state.questions[currentIdx];
            if (!currentQuestion || currentQuestion.id !== nextQ.id) {
              setCurrentQuestion(nextQ);
              setQuestionIndex(currentIdx);
              setAnswerInput('');
              setTimerLeft(10.0);
              questionStartTimeRef.current = Date.now();
            }
          } else {
            // Player finished all their questions, wait for opponent
            setCurrentQuestion(null);
          }
        }

        if (state.status === 'finished') {
          setIsPlaying(false);
          setWinnerId(state.winnerId);
          handleFinishGame(state.winnerId === mySocketId, state);
        }
      });

      socket.on('countdown', (val: any) => {
        setCountdown(val);
        if (val === 'GO!') {
          setIsPlaying(true);
          setTimeout(() => setCountdown(null), 500);
        }
      });

      // Immediately request current room state in case countdown already fired
      socket.emit('joinRoom', {
        roomId,
        username: user?.username || 'Player',
      });

      return () => {
        // Don't disconnect socket here — just remove listeners
        socket.off('roomState');
        socket.off('countdown');
      };
    } else {
      // Single Player Vs Bot
      // Trigger local countdown
      let count = 3;
      const interval = setInterval(() => {
        if (count > 0) {
          setCountdown(count);
          count--;
        } else {
          setCountdown('GO!');
          clearInterval(interval);
          setTimeout(() => {
            setCountdown(null);
            isPlayingRef.current = true;
            setIsPlaying(true);
            startBotBattle();
          }, 800);
        }
      }, 1000);

      return () => {
        clearInterval(interval);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (botIntervalRef.current) clearTimeout(botIntervalRef.current);
      };
    }
  }, [isMultiplayer, roomId]);

  // Start question timer (Local play)
  useEffect(() => {
    if (!isPlaying || isMultiplayer || winnerId) return;

    // Reset timer
    setTimerLeft(10.0);
    questionStartTimeRef.current = Date.now();

    timerIntervalRef.current = setInterval(() => {
      setTimerLeft((prev) => {
        if (prev <= 0.1) {
          // Timeout! Process wrong answer
          handleTimeout();
          return 10.0;
        }
        return Math.round((prev - 0.1) * 10) / 10;
      });
    }, 100);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isPlaying, questionIndex, isMultiplayer, winnerId]);

  // Focus input automatically
  useEffect(() => {
    if (isPlaying && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isPlaying, questionIndex, feedback]);

  // Local Bot logic
  const startBotBattle = () => {
    // Generate first question
    const q = generateQuestion(difficultyRef.current);
    setCurrentQuestion(q);
    setQuestionIndex(0);
    scheduleBotAction();
  };

  const scheduleBotAction = () => {
    if (winnerIdRef.current || !isPlayingRef.current) return;

    // Define response characteristics based on difficulty
    let minDelay = 4000;
    let maxDelay = 8000;
    let accuracy = 0.55; // Easy

    if (difficultyRef.current === 'Medium') {
      minDelay = 3000;
      maxDelay = 6000;
      accuracy = 0.75;
    } else if (difficultyRef.current === 'Hard') {
      minDelay = 1500;
      maxDelay = 3500;
      accuracy = 0.90;
    }

    const delay = Math.random() * (maxDelay - minDelay) + minDelay;

    botIntervalRef.current = setTimeout(() => {
      if (winnerIdRef.current || !isPlayingRef.current) return;

      // Bot answers
      const botCorrect = Math.random() < accuracy;
      const botTime = delay / 1000;

      let pullPower = -3;
      if (botCorrect) {
        if (botTime <= 2.0) pullPower = 15;
        else if (botTime <= 5.0) pullPower = 10;
        else pullPower = 5;

        // Bot correct
        setP2Answers((prev) => {
          const s = prev.streak + 1;
          return {
            correct: prev.correct + 1,
            wrong: prev.wrong,
            streak: s,
            bestStreak: Math.max(prev.bestStreak, s),
            times: [...prev.times, botTime],
          };
        });
      } else {
        // Bot wrong
        setP2Answers((prev) => ({
          ...prev,
          wrong: prev.wrong + 1,
          streak: 0,
        }));
      }

      setP2Score((prev) => prev + (botCorrect ? 10 : 0));

      // Update rope: Bot pulls RIGHT (+)
      setRopePosition((prev) => {
        let nextPos = prev + (botCorrect ? pullPower : -3);
        if (nextPos > 100) nextPos = 100;
        if (nextPos < -100) nextPos = -100;

        // Check if Bot wins
        if (nextPos >= 100) {
          setWinnerId('bot');
          isPlayingRef.current = false;
          setIsPlaying(false);
          handleFinishGame(false);
        }
        return nextPos;
      });

      // Schedule next bot answer
      scheduleBotAction();
    }, delay);
  };

  const handleTimeout = () => {
    // Mark wrong answer
    setFeedback('wrong');
    setP1Answers((prev) => ({
      ...prev,
      wrong: prev.wrong + 1,
      streak: 0,
    }));

    // Update rope: Player 1 penalty pulls towards Bot (+)
    setRopePosition((prev) => {
      let nextPos = prev + 3; // penalty pulls rope right
      if (nextPos > 100) nextPos = 100;
      if (nextPos >= 100) {
        setWinnerId('bot');
        setIsPlaying(false);
        handleFinishGame(false);
      }
      return nextPos;
    });

    setTimeout(() => {
      setFeedback(null);
      advanceQuestion();
    }, 800);
  };

  const advanceQuestion = () => {
    const nextIdx = questionIndex + 1;
    if (nextIdx >= maxQuestions) {
      // Finished all questions, evaluate end state
      setIsPlaying(false);
      
      // Determine winner based on rope position
      if (ropePosition < 0) {
        setWinnerId('player1');
        handleFinishGame(true);
      } else if (ropePosition > 0) {
        setWinnerId('bot');
        handleFinishGame(false);
      } else {
        // Tie
        setWinnerId('tie');
        handleFinishGame(false);
      }
      return;
    }
    
    setQuestionIndex(nextIdx);
    setCurrentQuestion(generateQuestion(gameDifficulty));
    setAnswerInput('');
  };

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPlaying || !currentQuestion || feedback) return;

    const timeUsed = (Date.now() - questionStartTimeRef.current) / 1000;
    const ansNum = parseInt(answerInput.trim());

    if (isNaN(ansNum)) return;

    if (isMultiplayer) {
      const socket = getSocket();
      if (socket) {
        socket.emit('submitAnswer', {
          roomId,
          answer: ansNum,
          timeUsed,
        });
      }
      // Optimistic client visual feedback
      const isCorrect = ansNum === currentQuestion.answer;
      setFeedback(isCorrect ? 'correct' : 'wrong');
      setTimeout(() => setFeedback(null), 600);
    } else {
      // Single Player Vs Bot
      const isCorrect = ansNum === currentQuestion.answer;
      setFeedback(isCorrect ? 'correct' : 'wrong');

      let pullPower = -3;
      if (isCorrect) {
        if (timeUsed <= 2.0) pullPower = 15;
        else if (timeUsed <= 5.0) pullPower = 10;
        else pullPower = 5;

        setP1Answers((prev) => {
          const s = prev.streak + 1;
          return {
            correct: prev.correct + 1,
            wrong: prev.wrong,
            streak: s,
            bestStreak: Math.max(prev.bestStreak, s),
            times: [...prev.times, timeUsed],
          };
        });
        setP1Score((prev) => prev + 10);
      } else {
        setP1Answers((prev) => ({
          ...prev,
          wrong: prev.wrong + 1,
          streak: 0,
        }));
      }

      // Update rope: Player pulls LEFT (-)
      setRopePosition((prev) => {
        let nextPos = prev - (isCorrect ? pullPower : -3);
        if (nextPos < -100) nextPos = -100;
        if (nextPos > 100) nextPos = 100;

        // Check if player wins
        if (nextPos <= -100) {
          setWinnerId('player1');
          setIsPlaying(false);
          handleFinishGame(true);
        }
        return nextPos;
      });

      setTimeout(() => {
        setFeedback(null);
        advanceQuestion();
      }, 600);
    }
  };

  const handleFinishGame = async (won: boolean, serverState?: any) => {
    // Trigger confetti on win
    if (won) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });
    }

    // Save game stats
    const averageTime = p1Answers.times.length > 0
      ? p1Answers.times.reduce((a, b) => a + b, 0) / p1Answers.times.length
      : 10.0;

    const gameStats = {
      won,
      correctAnswers: p1Answers.correct,
      wrongAnswers: p1Answers.wrong,
      bestStreak: p1Answers.bestStreak,
      averageTime: parseFloat(averageTime.toFixed(1)),
    };

    const result = await updateLocalStats(gameStats);

    // Redirect to results screen with complete stats after brief delay
    setTimeout(() => {
      navigate('/battle/result', {
        state: {
          won,
          opponentType,
          difficulty: gameDifficulty,
          maxQuestions,
          p1Stats: {
            score: p1Score,
            correct: p1Answers.correct,
            wrong: p1Answers.wrong,
            accuracy: Math.round((p1Answers.correct / (p1Answers.correct + p1Answers.wrong || 1)) * 100),
            avgTime: gameStats.averageTime,
            bestStreak: p1Answers.bestStreak,
          },
          p2Stats: isMultiplayer && serverState
            ? {
                username: (Object.values(serverState.players) as any[]).find((p: any) => p.id !== mySocketId)?.username || 'Opponent',
                score: (Object.values(serverState.players) as any[]).find((p: any) => p.id !== mySocketId)?.score || 0,
                correct: (Object.values(serverState.players) as any[]).find((p: any) => p.id !== mySocketId)?.correctAnswers || 0,
                wrong: (Object.values(serverState.players) as any[]).find((p: any) => p.id !== mySocketId)?.wrongAnswers || 0,
                accuracy: (Object.values(serverState.players) as any[]).find((p: any) => p.id !== mySocketId)?.accuracy || 0,
                bestStreak: (Object.values(serverState.players) as any[]).find((p: any) => p.id !== mySocketId)?.bestStreak || 0,
              }
            : {
                username: 'AI Bot',
                score: p2Score,
                correct: p2Answers.correct,
                wrong: p2Answers.wrong,
                accuracy: Math.round((p2Answers.correct / (p2Answers.correct + p2Answers.wrong || 1)) * 100),
                bestStreak: p2Answers.bestStreak,
              },
          xpGained: result.xpGained,
          unlockedAchievements: result.unlockedAchievements,
        },
      });
    }, 3000);
  };

  // Determine positions for rendering
  // P1 moves right to left. P2 moves left to right.
  // ropePosition is -100 to +100.
  // Center is 0. P1 pulling moves it left (-), P2 moves it right (+).
  const knotOffset = `calc(50% + ${ropePosition * 0.35}%)`;
  const p1Left = `calc(15% + ${ropePosition * 0.15}%)`;
  const p2Right = `calc(15% - ${ropePosition * 0.15}%)`;

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-8 max-w-6xl mx-auto w-full relative">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to quit the battle?')) {
              navigate('/battle');
            }
          }}
          className="game-btn-secondary py-2 px-4 text-xs flex items-center gap-1 border-opacity-25"
        >
          <ArrowLeft className="w-4 h-4" /> Quit Match
        </button>
        <div className="flex items-center gap-4 bg-game-navy bg-opacity-65 border border-game-blue border-opacity-35 px-4 py-2 rounded-xl">
          <span className="text-xs uppercase font-bold text-game-lightBlue tracking-widest">
            {isMultiplayer ? `Room: ${roomId}` : `${gameDifficulty} Bot Match`}
          </span>
        </div>
      </div>

      {/* Countdown overlay */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-game-dark bg-opacity-90 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="text-8xl sm:text-9xl font-extrabold text-game-red glow-red"
            >
              {countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rope Pulling Arena */}
      <div className="glass-panel p-6 sm:p-10 rounded-2xl relative overflow-hidden flex flex-col border border-game-blue border-opacity-30 mb-8 flex-1 min-h-[300px]">
        {/* Victory thresholds */}
        <div className="absolute top-0 bottom-0 left-[5%] w-0.5 border-l border-dashed border-game-lightBlue border-opacity-30 flex items-center justify-center">
          <span className="text-[10px] text-game-lightBlue font-bold uppercase tracking-widest rotate-90 whitespace-nowrap origin-center">
            P1 Win Zone
          </span>
        </div>
        <div className="absolute top-0 bottom-0 right-[5%] w-0.5 border-r border-dashed border-game-lightBlue border-opacity-30 flex items-center justify-center">
          <span className="text-[10px] text-game-lightBlue font-bold uppercase tracking-widest -rotate-90 whitespace-nowrap origin-center">
            P2 Win Zone
          </span>
        </div>

        {/* Center line (Red Line) */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-game-red bg-opacity-80 z-10 shadow-lg flex items-center justify-center">
          <div className="bg-game-red text-white text-[9px] font-bold py-0.5 px-2 rounded tracking-widest uppercase -translate-y-12">
            Victory Red
          </div>
        </div>

        {/* Dynamic Combat Layout */}
        <div className="flex-1 flex items-center relative py-12">
          {/* Character 1 (Player 1) */}
          <motion.div
            style={{ left: p1Left }}
            animate={
              isPlaying && feedback === 'correct'
                ? { scale: [1, 1.1, 1] }
                : isPlaying && feedback === 'wrong'
                ? { x: [0, -10, 0] }
                : {}
            }
            className="absolute -translate-x-1/2 flex flex-col items-center z-20 text-center select-none"
          >
            <div className="w-16 h-16 rounded-full bg-game-blue bg-opacity-30 border-2 border-game-lightBlue flex items-center justify-center text-4xl shadow-xl shadow-game-blue/20">
              🧍
            </div>
            <div className="text-sm font-bold text-game-light mt-2 max-w-[120px] truncate">
              {user?.username || 'Player 1'}
            </div>
            <div className="text-xs text-game-lightBlue font-semibold mt-0.5">Score: {p1Score}</div>
          </motion.div>

          {/* Rope & Knot */}
          <div className="absolute left-[15%] right-[15%] h-1 bg-gradient-to-r from-game-lightBlue/30 via-game-light/80 to-game-lightBlue/30 shadow-sm flex items-center">
            {/* Rope knot */}
            <motion.div
              style={{ left: knotOffset }}
              animate={winnerId ? { scale: [1, 1.3, 1.1] } : {}}
              className="absolute -translate-x-1/2 w-5 h-5 rounded-full bg-game-red border-2 border-game-light shadow-lg flex items-center justify-center cursor-pointer"
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </motion.div>
          </div>

          {/* Character 2 (Bot or Player 2) */}
          <motion.div
            style={{ right: p2Right }}
            className="absolute translate-x-1/2 flex flex-col items-center z-20 text-center select-none"
          >
            <div className="w-16 h-16 rounded-full bg-game-navy border-2 border-game-blue flex items-center justify-center text-4xl shadow-xl shadow-game-navy/40">
              {isMultiplayer ? '🧍' : '🤖'}
            </div>
            <div className="text-sm font-bold text-game-light mt-2 max-w-[120px] truncate">
              {isMultiplayer
                ? (Object.values(roomState?.players || {}) as any[]).find((p: any) => p.id !== mySocketId)?.username || 'Player 2'
                : 'AI Bot'}
            </div>
            <div className="text-xs text-game-lightBlue font-semibold mt-0.5">Score: {p2Score}</div>
          </motion.div>
        </div>

        {/* Score indicator bar */}
        <div className="w-full bg-game-navy bg-opacity-50 h-2 rounded-full overflow-hidden border border-game-blue border-opacity-20 mt-6 relative">
          <div
            style={{ width: `${50 + ropePosition / 2}%` }}
            className="h-full bg-gradient-to-r from-game-red to-game-green transition-all duration-300 ease-out"
          />
        </div>
        <div className="flex justify-between items-center text-xs text-game-lightBlue mt-2 font-semibold uppercase tracking-wider">
          <span>P1 pulls Left</span>
          <span className="text-game-light font-bold">Rope Offset: {Math.abs(Math.round(ropePosition))}%</span>
          <span>P2 pulls Right</span>
        </div>
      </div>

      {/* Control Area (Question, Input, Timer) */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row gap-6 items-center justify-between border border-game-blue border-opacity-30 relative overflow-hidden">
        {/* Answer Feedback Banner overlay */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className={`absolute inset-0 z-10 flex items-center justify-center font-extrabold text-2xl uppercase tracking-widest ${
                feedback === 'correct'
                  ? 'bg-game-green bg-opacity-95 text-white glow-green'
                  : 'bg-game-red bg-opacity-95 text-white glow-red'
              }`}
            >
              {feedback === 'correct' ? (
                <span className="flex items-center gap-2"><Check className="w-7 h-7" /> Correct Answer!</span>
              ) : (
                <span className="flex items-center gap-2"><X className="w-7 h-7" /> Incorrect Answer!</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {isPlaying && currentQuestion ? (
          <>
            {/* Timer & Index */}
            <div className="flex flex-col gap-2 items-center md:items-start w-full md:w-auto">
              <div className="flex items-center gap-2 text-game-lightBlue text-xs font-semibold uppercase tracking-wider">
                <Clock className="w-4 h-4 text-game-lightBlue" /> Time Remaining
              </div>
              <div className="text-4xl font-extrabold text-game-light tracking-wide flex items-baseline gap-1 select-none">
                {timerLeft.toFixed(1)}<span className="text-sm font-semibold text-game-lightBlue">s</span>
              </div>
              {/* Visual mini progress timer */}
              <div className="w-32 bg-game-dark bg-opacity-40 h-1.5 rounded-full overflow-hidden border border-game-blue border-opacity-15">
                <div
                  style={{ width: `${(timerLeft / 10) * 100}%` }}
                  className={`h-full transition-all duration-100 ease-linear ${
                    timerLeft < 3.0 ? 'bg-game-red' : timerLeft < 6.0 ? 'bg-game-orange' : 'bg-game-lightBlue'
                  }`}
                />
              </div>
              <span className="text-xs text-game-lightBlue mt-1 font-semibold">
                Question {questionIndex + 1} of {maxQuestions}
              </span>
            </div>

            {/* Central Mathematical Question */}
            <div className="flex flex-col items-center justify-center flex-1 py-4">
              <span className="text-[10px] text-game-lightBlue font-bold uppercase tracking-widest mb-1 select-none">
                Solve Formula
              </span>
              <div className="text-5xl sm:text-6xl font-extrabold text-game-light tracking-tight select-none">
                {currentQuestion.text}
              </div>
            </div>

            {/* Answer input */}
            <form onSubmit={handleAnswerSubmit} className="flex flex-col gap-2 w-full md:w-64">
              <label className="text-xs font-semibold uppercase tracking-wider text-game-lightBlue md:text-left text-center">
                Input Answer
              </label>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="number"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  placeholder="?"
                  className="glass-input flex-1 py-3 text-center text-xl font-bold rounded-lg border-2 border-game-blue focus:border-game-lightBlue focus:ring-1 focus:ring-game-lightBlue"
                  disabled={!!feedback}
                  required
                />
                <button
                  type="submit"
                  disabled={!answerInput || !!feedback}
                  className="game-btn-primary px-4 py-3 text-sm flex items-center justify-center"
                >
                  Submit
                </button>
              </div>
              <span className="text-[10px] text-game-lightBlue text-center md:text-left mt-1 font-medium opacity-70">
                Press Enter to Submit
              </span>
            </form>
          </>
        ) : winnerId ? (
          <div className="w-full text-center py-6 animate-scale-up">
            <h3 className="text-3xl font-extrabold tracking-wide mb-2">
              {winnerId === 'player1' || winnerId === user?.id ? (
                <span className="text-game-green glow-green flex items-center justify-center gap-2">
                  <Trophy className="w-7 h-7" /> VICTORY!
                </span>
              ) : winnerId === 'tie' || winnerId === 'TIE' ? (
                <span className="text-game-orange">MATCH DRAW!</span>
              ) : (
                <span className="text-game-red glow-red flex items-center justify-center gap-2">
                  DEFEAT!
                </span>
              )}
            </h3>
            <p className="text-sm text-game-lightBlue">Evaluating statistics, please wait...</p>
          </div>
        ) : (
          <div className="w-full text-center py-6">
            <p className="text-sm text-game-lightBlue">Waiting for next question stream...</p>
          </div>
        )}
      </div>
    </div>
  );
};
