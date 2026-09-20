import { Question } from './questionGenerator';

export interface Player {
  id: string;
  username: string;
  score: number;
  accuracy: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalTime: number;
  streak: number;
  bestStreak: number;
}

export interface GameState {
  roomId: string;
  players: { [id: string]: Player };
  playerOrder: string[]; // [Player 1 ID, Player 2 ID]
  difficulty: 'Easy' | 'Medium' | 'Hard';
  maxQuestions: number;
  currentQuestionIndex: number;
  questions: Question[];
  currentQuestion: Question | null;
  ropePosition: number; // -100 (P1 Wins) to +100 (P2 Wins), 0 is center
  status: 'waiting' | 'ready' | 'countdown' | 'playing' | 'finished';
  winnerId: string | null;
  questionTimer: number; // seconds
}

export function createInitialState(
  roomId: string,
  difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium',
  maxQuestions: number = 10
): GameState {
  return {
    roomId,
    players: {},
    playerOrder: [],
    difficulty,
    maxQuestions,
    currentQuestionIndex: 0,
    questions: [],
    currentQuestion: null,
    ropePosition: 0,
    status: 'waiting',
    winnerId: null,
    questionTimer: 10,
  };
}

export function calculatePullPower(correct: boolean, timeUsed: number): number {
  if (!correct) {
    return -3;
  }
  // Max time is 10s
  if (timeUsed <= 2.0) {
    return 15; // Fast
  } else if (timeUsed <= 5.0) {
    return 10; // Normal
  } else {
    return 5; // Slow
  }
}

export function processAnswer(
  state: GameState,
  playerId: string,
  submittedAnswer: number,
  timeUsed: number
): GameState {
  if (state.status !== 'playing' || !state.currentQuestion) return state;

  const player = state.players[playerId];
  if (!player) return state;

  const isPlayer1 = state.playerOrder[0] === playerId;
  const isCorrect = submittedAnswer === state.currentQuestion.answer;

  const pullPower = calculatePullPower(isCorrect, timeUsed);

  // Update player stats
  player.totalTime += timeUsed;
  if (isCorrect) {
    player.correctAnswers += 1;
    player.streak += 1;
    if (player.streak > player.bestStreak) {
      player.bestStreak = player.streak;
    }
  } else {
    player.wrongAnswers += 1;
    player.streak = 0;
  }
  player.score = player.correctAnswers * 10 + player.bestStreak * 5;
  player.accuracy = Math.round(
    (player.correctAnswers / (player.correctAnswers + player.wrongAnswers)) * 100
  );

  // Update rope position: Player 1 pulls left (-), Player 2 pulls right (+)
  if (isPlayer1) {
    // Correct answer pulls towards P1 (subtracting position)
    // Wrong answer pulls towards P2 (adding position due to penalty)
    state.ropePosition -= pullPower;
  } else {
    // Correct answer pulls towards P2 (adding position)
    // Wrong answer pulls towards P1 (subtracting position due to penalty)
    state.ropePosition += pullPower;
  }

  // Clamping ropePosition between -100 and +100
  if (state.ropePosition < -100) state.ropePosition = -100;
  if (state.ropePosition > 100) state.ropePosition = 100;

  // Check win condition based on rope threshold
  if (state.ropePosition <= -100) {
    state.status = 'finished';
    state.winnerId = state.playerOrder[0];
  } else if (state.ropePosition >= 100) {
    state.status = 'finished';
    state.winnerId = state.playerOrder[1];
  }

  return state;
}
