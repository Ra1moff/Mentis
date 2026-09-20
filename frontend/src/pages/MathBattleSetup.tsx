import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io, Socket } from 'socket.io-client';
import { Swords, Bot, Users, Play, Code, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { BACKEND_URL } from '../config';

let socket: Socket | null = null;
const SOCKET_URL = BACKEND_URL;

export const MathBattleSetup: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Configurations
  const [opponent, setOpponent] = useState<'bot' | 'player'>('bot');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [maxQuestions, setMaxQuestions] = useState<number>(10);

  // Multiplayer States
  const [mode, setMode] = useState<'options' | 'create' | 'join' | 'lobby'>('options');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [currentRoom, setCurrentRoom] = useState<any>(null);
  const [socketError, setSocketError] = useState('');
  const [countdownVal, setCountdownVal] = useState<string | number | null>(null);
  const [isJoined, setIsJoined] = useState(false);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  const initSocket = () => {
    if (!socket) {
      socket = io(SOCKET_URL);
      
      socket.on('connect_error', () => {
        setSocketError('Unable to connect to multiplayer server. Make sure backend is running.');
        setMode('options');
      });

      socket.on('errorMsg', (msg: string) => {
        setSocketError(msg);
        setMode('options');
      });

      socket.on('roomState', (state: any) => {
        setCurrentRoom(state);
        setMode('lobby');
        setSocketError('');
        
        // If state.status is playing, redirect to game screen!
        if (state.status === 'playing') {
          navigate(`/battle/game?roomId=${state.roomId}`);
        }
      });

      socket.on('countdown', (val: any) => {
        setCountdownVal(val);
        if (val === 'GO!') {
          setTimeout(() => {
            if (currentRoom) {
              navigate(`/battle/game?roomId=${currentRoom.roomId}`);
            }
          }, 800);
        }
      });

      socket.on('opponentDisconnected', (msg: string) => {
        setSocketError(msg);
        setMode('options');
      });
    }
  };

  const handleStartBotGame = () => {
    navigate(`/battle/game?opponent=bot&difficulty=${difficulty}&questions=${maxQuestions}`);
  };

  const handleCreateRoom = () => {
    initSocket();
    setCountdownVal(null);
    if (socket) {
      socket.emit('createRoom', {
        username: user?.username || 'Player 1',
        difficulty,
        maxQuestions,
      });
    }
  };

  const handleJoinRoom = () => {
    if (!roomCodeInput.trim()) {
      setSocketError('Room code is required.');
      return;
    }
    initSocket();
    setCountdownVal(null);
    if (socket) {
      socket.emit('joinRoom', {
        roomId: roomCodeInput.trim().toUpperCase(),
        username: user?.username || 'Player 2',
      });
    }
  };

  const handleToggleReady = () => {
    if (socket && currentRoom) {
      socket.emit('playerReady', { roomId: currentRoom.roomId });
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-12 flex-1 flex flex-col justify-center">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-game-light tracking-wide flex items-center justify-center gap-3">
          <Swords className="text-game-lightBlue w-10 h-10 animate-bounce-slow" /> Battle Ground Configuration
        </h2>
        <p className="text-game-lightBlue text-sm sm:text-base mt-2">
          Select your settings, invite friends, and pull your way to victory.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <div className="md:col-span-2 glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-6 border border-game-blue border-opacity-20">
          {mode !== 'lobby' ? (
            <>
              {/* Opponent Choice */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold uppercase tracking-wider text-game-lightBlue">Choose Opponent</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setOpponent('bot');
                      setMode('options');
                    }}
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl font-bold border transition-all duration-300 ${
                      opponent === 'bot'
                        ? 'bg-game-blue bg-opacity-30 border-game-lightBlue text-game-light scale-102 shadow-lg shadow-game-lightBlue/10'
                        : 'border-game-blue border-opacity-30 bg-game-dark bg-opacity-30 text-game-lightBlue hover:bg-game-navy hover:text-game-light'
                    }`}
                  >
                    <Bot className="w-5 h-5" /> Versus AI Bot
                  </button>
                  <button
                    onClick={() => {
                      setOpponent('player');
                      setMode('options');
                    }}
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl font-bold border transition-all duration-300 ${
                      opponent === 'player'
                        ? 'bg-game-blue bg-opacity-30 border-game-lightBlue text-game-light scale-102 shadow-lg shadow-game-lightBlue/10'
                        : 'border-game-blue border-opacity-30 bg-game-dark bg-opacity-30 text-game-lightBlue hover:bg-game-navy hover:text-game-light'
                    }`}
                  >
                    <Users className="w-5 h-5" /> Multiplayer Duel
                  </button>
                </div>
              </div>

              {/* Difficulty Selection */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold uppercase tracking-wider text-game-lightBlue">Game Difficulty</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`p-3 rounded-lg font-bold border transition-all duration-200 text-sm ${
                        difficulty === diff
                          ? diff === 'Easy'
                            ? 'bg-game-green bg-opacity-25 border-game-green text-game-light shadow-md shadow-game-green/10'
                            : diff === 'Medium'
                            ? 'bg-game-blue bg-opacity-40 border-game-lightBlue text-game-light shadow-md shadow-game-lightBlue/10'
                            : 'bg-game-red bg-opacity-20 border-game-red text-game-light shadow-md shadow-game-red/10'
                          : 'border-game-blue border-opacity-30 bg-game-dark bg-opacity-25 text-game-lightBlue hover:bg-game-navy hover:text-game-light'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Questions */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold uppercase tracking-wider text-game-lightBlue">Number of Questions</label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      onClick={() => setMaxQuestions(num)}
                      className={`p-3 rounded-lg font-bold border transition-all duration-200 text-sm ${
                        maxQuestions === num
                          ? 'bg-game-blue bg-opacity-40 border-game-lightBlue text-game-light shadow-md'
                          : 'border-game-blue border-opacity-30 bg-game-dark bg-opacity-25 text-game-lightBlue hover:bg-game-navy'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            // Room Lobby Content
            <div className="flex flex-col items-center justify-center py-6 text-center">
              {countdownVal !== null ? (
                <div className="flex flex-col items-center justify-center h-48 animate-scale-up">
                  <div className="text-xs uppercase text-game-lightBlue font-bold tracking-widest mb-2">Prepare for Combat</div>
                  <div className="text-7xl font-extrabold text-game-red glow-red tracking-wider animate-pulse">
                    {countdownVal}
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col gap-6">
                  <div>
                    <span className="text-xs font-semibold bg-game-blue bg-opacity-35 text-game-lightBlue px-3 py-1 rounded-full border border-game-blue border-opacity-30">
                      Multiplayer Lobby
                    </span>
                    <h3 className="text-3xl font-extrabold text-game-light mt-4 tracking-wide">
                      Room: <span className="text-game-lightBlue select-all">{currentRoom?.roomId}</span>
                    </h3>
                    <p className="text-xs text-game-lightBlue mt-1">Share this code with your opponent to connect.</p>
                  </div>

                  <div className="w-full border-y border-game-blue border-opacity-20 py-6 grid grid-cols-2 gap-4">
                    {currentRoom?.playerOrder.map((pid: string, idx: number) => {
                      const p = currentRoom.players[pid];
                      return (
                        <div
                          key={pid}
                          className="glass-panel p-4 rounded-xl flex flex-col items-center relative border border-game-blue border-opacity-30"
                        >
                          <div className="text-3xl mb-1">{idx === 0 ? '🧍' : '🧍'}</div>
                          <span className="font-bold text-game-light text-sm truncate max-w-full">
                            {p.username}
                          </span>
                          <span className="text-xs text-game-lightBlue">Lvl {p.level || 1}</span>

                          <div className="mt-3">
                            {p.ready ? (
                              <span className="text-xs bg-game-green bg-opacity-20 border border-game-green border-opacity-40 text-game-light px-3 py-1 rounded-full flex items-center gap-1 font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-game-green" /> Ready
                              </span>
                            ) : (
                              <span className="text-xs bg-game-navy bg-opacity-60 border border-game-blue border-opacity-30 text-game-lightBlue px-3 py-1 rounded-full font-semibold">
                                Preparing
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {currentRoom?.playerOrder.length < 2 && (
                      <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center border-dashed border-2 border-game-blue border-opacity-40 opacity-70">
                        <span className="text-2xl mb-1 animate-pulse">⏳</span>
                        <span className="text-xs font-semibold text-game-lightBlue">Waiting for Player 2...</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleToggleReady}
                    className={`py-3.5 font-bold rounded-xl shadow-lg w-full text-base tracking-wider transition-all duration-300 ${
                      currentRoom?.players[socket?.id || '']?.ready
                        ? 'bg-game-green text-game-light'
                        : 'game-btn-primary'
                    }`}
                  >
                    {currentRoom?.players[socket?.id || '']?.ready ? 'Ready! Waiting...' : 'I Am Ready'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border border-game-blue border-opacity-20">
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-lg text-game-light border-b border-game-blue border-opacity-20 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-game-lightBlue" /> Arena Duel
            </h4>

            {socketError && (
              <div className="bg-game-red bg-opacity-20 border border-game-red border-opacity-50 text-game-light text-xs p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-game-red flex-shrink-0 mt-0.5" />
                <span>{socketError}</span>
              </div>
            )}

            {opponent === 'bot' ? (
              <p className="text-sm text-game-lightBlue leading-relaxed">
                Test your calculating limits against a computer-guided bot. Ideal for offline practice and training. Bots respond at custom speed delays depending on difficulty settings.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {mode === 'options' && (
                  <>
                    <p className="text-sm text-game-lightBlue leading-relaxed">
                      Fight side-by-side with friends. Create a room to get a code, or join an active room.
                    </p>
                    <button onClick={handleCreateRoom} className="game-btn-primary py-3 w-full text-sm">
                      Create Battle Room
                    </button>
                    <div className="text-center text-xs text-game-lightBlue font-semibold uppercase">Or</div>
                    <button
                      onClick={() => setMode('join')}
                      className="game-btn-secondary py-3 w-full text-sm flex items-center justify-center gap-1.5"
                    >
                      <Code className="w-4 h-4" /> Enter Room Code
                    </button>
                  </>
                )}

                {mode === 'join' && (
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-game-lightBlue">Room Code</label>
                    <input
                      type="text"
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value)}
                      placeholder="e.g. MB-4827"
                      className="glass-input text-sm py-2 text-center tracking-widest uppercase font-bold"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setMode('options')}
                        className="game-btn-secondary py-2 text-xs flex-1"
                      >
                        Cancel
                      </button>
                      <button onClick={handleJoinRoom} className="game-btn-primary py-2 text-xs flex-1">
                        Join Battle
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'lobby' && (
                  <div className="flex flex-col gap-3 text-center">
                    <p className="text-xs text-game-lightBlue leading-relaxed">
                      Lobby active. Once all combatants mark themselves as Ready, the math equations stream immediately.
                    </p>
                    <button
                      onClick={() => {
                        if (socket) socket.disconnect();
                        socket = null;
                        setMode('options');
                        setCurrentRoom(null);
                      }}
                      className="game-btn-secondary py-2.5 text-xs text-game-red border-game-red border-opacity-30 hover:bg-game-red hover:bg-opacity-10"
                    >
                      Leave Lobby
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {opponent === 'bot' && (
            <button
              onClick={handleStartBotGame}
              className="game-btn-primary py-3.5 w-full font-bold flex items-center justify-center gap-2 mt-6"
            >
              Start Bot Match <Play className="w-4 h-4 fill-current" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
