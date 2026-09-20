import { Server, Socket } from 'socket.io';
import { GameState, createInitialState, processAnswer, Player } from '../engine/gameEngine';
import { generateQuestion } from '../engine/questionGenerator';

const rooms = new Map<string, GameState>();

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Create Room
    socket.on('createRoom', ({ username, difficulty, maxQuestions }) => {
      const roomId = `MB-${Math.floor(1000 + Math.random() * 9000)}`;
      const state = createInitialState(roomId, difficulty, parseInt(maxQuestions) || 10);
      
      const newPlayer: Player = {
        id: socket.id,
        username: username || 'Player 1',
        score: 0,
        accuracy: 100,
        correctAnswers: 0,
        wrongAnswers: 0,
        totalTime: 0,
        streak: 0,
        bestStreak: 0,
      };

      state.players[socket.id] = newPlayer;
      state.playerOrder.push(socket.id);
      
      rooms.set(roomId, state);
      socket.join(roomId);

      socket.emit('roomState', state);
      console.log(`Room created: ${roomId} by ${socket.id}`);
    });

    // Join Room
    socket.on('joinRoom', ({ roomId, username }) => {
      const state = rooms.get(roomId);
      if (!state) {
        socket.emit('errorMsg', 'Room not found.');
        return;
      }

      // If the socket is already in the room, just sync state and return
      if (state.players[socket.id]) {
        socket.emit('roomState', state);
        return;
      }

      if (state.playerOrder.length >= 2) {
        socket.emit('errorMsg', 'Room is full.');
        return;
      }

      const newPlayer: Player = {
        id: socket.id,
        username: username || 'Player 2',
        score: 0,
        accuracy: 100,
        correctAnswers: 0,
        wrongAnswers: 0,
        totalTime: 0,
        streak: 0,
        bestStreak: 0,
      };

      state.players[socket.id] = newPlayer;
      state.playerOrder.push(socket.id);
      
      socket.join(roomId);
      
      io.to(roomId).emit('roomState', state);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Toggle Ready State
    socket.on('playerReady', ({ roomId }) => {
      const state = rooms.get(roomId);
      if (!state) return;

      const player = state.players[socket.id];
      if (!player) return;

      // In real-time room, we can store ready states
      // Let's add a dynamic field or just track if both players are in room
      // Since it's a two-player game, if both players are present, we can mark them ready
      // Let's store ready status on the socket or inside state.
      // We can attach a `ready` property to players
      (player as any).ready = !(player as any).ready;

      // If both players are in the room and both are ready, start countdown!
      const playerIds = state.playerOrder;
      const allReady = playerIds.length === 2 && playerIds.every(id => (state.players[id] as any).ready);

      if (allReady) {
        state.status = 'countdown';
        io.to(roomId).emit('roomState', state);

        // Populate questions for the battle
        state.questions = [];
        for (let i = 0; i < state.maxQuestions; i++) {
          state.questions.push(generateQuestion(state.difficulty));
        }
        state.currentQuestion = state.questions[0];

        // Trigger countdown sequence
        let count = 3;
        const interval = setInterval(() => {
          if (count > 0) {
            io.to(roomId).emit('countdown', count);
            count--;
          } else {
            clearInterval(interval);
            state.status = 'playing';
            io.to(roomId).emit('countdown', 'GO!');
            io.to(roomId).emit('roomState', state);
          }
        }, 1000);
      } else {
        io.to(roomId).emit('roomState', state);
      }
    });

    // Submit Answer
    socket.on('submitAnswer', ({ roomId, answer, timeUsed }) => {
      let state = rooms.get(roomId);
      if (!state || state.status !== 'playing') return;

      const player = state.players[socket.id];
      if (!player) return;

      // We process the answer
      state = processAnswer(state, socket.id, parseInt(answer), timeUsed);

      // Check if this player has finished all their questions
      const isPlayer1 = state.playerOrder[0] === socket.id;
      const currentIdxKey = isPlayer1 ? 'p1Idx' : 'p2Idx';
      if (!(state as any)[currentIdxKey]) {
        (state as any)[currentIdxKey] = 0;
      }
      (state as any)[currentIdxKey]++;

      const currentIdx = (state as any)[currentIdxKey];

      // If game is not finished and there are more questions for this player
      if (state.status === 'playing') {
        if (currentIdx >= state.maxQuestions) {
          // Player finished all questions, check if opponent also finished
          const opponentId = state.playerOrder.find(id => id !== socket.id);
          const oppIdx = (state as any)[opponentId === state.playerOrder[0] ? 'p1Idx' : 'p2Idx'] || 0;
          
          if (!opponentId || oppIdx >= state.maxQuestions) {
            // Both finished, set game finished and decide winner based on rope position
            state.status = 'finished';
            if (state.ropePosition < 0) {
              state.winnerId = state.playerOrder[0];
            } else if (state.ropePosition > 0) {
              state.winnerId = state.playerOrder[1];
            } else {
              // Tie, or choose player with higher score
              const p1Score = state.players[state.playerOrder[0]].score;
              const p2Score = state.players[state.playerOrder[1]].score;
              if (p1Score > p2Score) {
                state.winnerId = state.playerOrder[0];
              } else if (p2Score > p1Score) {
                state.winnerId = state.playerOrder[1];
              } else {
                state.winnerId = 'TIE';
              }
            }
          }
        }
      }

      rooms.set(roomId, state);
      io.to(roomId).emit('roomState', state);
    });

    // Restart game
    socket.on('restartGame', ({ roomId }) => {
      const oldState = rooms.get(roomId);
      if (!oldState) return;

      // Reset state but keep players
      const state = createInitialState(roomId, oldState.difficulty, oldState.maxQuestions);
      oldState.playerOrder.forEach(id => {
        state.playerOrder.push(id);
        state.players[id] = {
          id,
          username: oldState.players[id].username,
          score: 0,
          accuracy: 100,
          correctAnswers: 0,
          wrongAnswers: 0,
          totalTime: 0,
          streak: 0,
          bestStreak: 0,
        };
      });

      rooms.set(roomId, state);
      io.to(roomId).emit('roomState', state);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      
      // Clean up rooms where this socket was a player
      for (const [roomId, state] of rooms.entries()) {
        if (state.players[socket.id]) {
          // If in progress, end game or notify other player
          const opponentId = state.playerOrder.find(id => id !== socket.id);
          if (opponentId) {
            socket.to(roomId).emit('opponentDisconnected', 'Your opponent disconnected.');
            // Update room state
            state.status = 'finished';
            state.winnerId = opponentId;
            io.to(roomId).emit('roomState', state);
          } else {
            // Delete room if empty
            rooms.delete(roomId);
          }
        }
      }
    });
  });
}
