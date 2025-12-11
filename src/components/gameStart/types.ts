export interface GameState {
  round: number;
  players: string[];
  originalPlayers: string[];
  impostors: string[];
  currentPlayer: string;
  turnOrder: string[];
  secretWord: string;
  isRoundActive: boolean;
}

export interface PlayerInfo {
  player: string;
  role: string;
  word: string;
  round: number;
}

export interface EliminateResult {
  eliminated: string;
  wasImpostor: boolean;
  remainingImpostors: string[];
  remainingPlayers: string[];
  gameResult: string | null;
}