export interface Category {
  id: string;
  name: string;
  type: 'single' | 'mixed';
  words: string[];
  pairs?: Array<{word: string, related: string}>;
  createdAt: string;
  lastUsed: string;
  count: number;
}

export interface GameState {
  round: number;
  players: string[];
  originalPlayers: string[];
  impostors: string[];
  currentPlayer: string;
  turnOrder: string[];
  secretWord: string;
  impostorWord: string; // Nueva: palabra para impostor
  currentCategory?: string;
  isRoundActive: boolean;
  categories: Category[];
  totalWordsAvailable: number;
  storedImpostors: Array<{ // Nueva: impostores almacenados por ronda
    round: number;
    impostors: string[];
  }>;
}

export interface PlayerInfo {
  player: string;
  role: string;
  word: string;
  round: number;
  category?: string;
  palabraAyuda?: string; // Nueva: mensaje de ayuda para impostores
}

export interface EliminateResult {
  eliminated: string;
  wasImpostor: boolean;
  remainingImpostors: string[];
  remainingPlayers: string[];
  gameResult: string | null;
}

// Nuevas interfaces para las funcionalidades añadidas
export interface RoundInfo {
  round: number;
  impostorsCount: number;
  message: string;
  turnOrder: string[];
  category?: string;
  palabraTripulante: string;
  palabraImpostor: string;
  roundImpostors: string[]; // Nueva: impostores de esta ronda
}

export interface ImpostorRoundInfo {
  round: number;
  impostors: string[];
  count: number;
  palabraTripulante: string;
  palabraImpostor: string;
  category?: string;
}

export interface ImpostorSpecificInfo {
  esImpostor: boolean;
  info?: {
    palabraTripulante: string;
    palabraImpostor: string;
    ayuda: string;
  };
}

export interface GameConfigData {
  players: number;
  maxImpostors: number;
  selectedModes: string[];
  selectedRoles: string[];
  selectedRestriction: string | null;
  showTutorial: boolean;
  timePerRound: number;
  randomMode?: boolean;
  autoAssignRoles?: boolean;
  maxRoles?: number;
  difficulty?: string;
  selectedRestrictions?: string[];
  restrictionsEnabled?: boolean;
  playerNames?: string[];
  selectedCategories?: string[];
}

// Interface para el componente GameConfig
export interface GameConfigProps {
  game: any; // Podrías tipar esto mejor con tu clase ImpostorGame
  round: number;
  eliminatedPlayers: string[];
  estado: GameState;
  onStartRound: () => void;
  onResetConfig?: () => void;
  onShowImpostors?: () => void;
  roundInfo?: {
    category?: string;
    palabraTripulante: string;
    palabraImpostor: string;
    roundImpostors?: string[];
  };
}

// Interface para el componente GamePlaying
export interface GamePlayingProps {
  round: number;
  currentPlayer: string;
  playerInfo: PlayerInfo | null;
  game: any;
  showRole: boolean;
  onShowRole: () => void;
  onPassTurn: () => void;
  roundInfo?: {
    category?: string;
    palabraTripulante: string;
    palabraImpostor: string;
    roundImpostors?: string[];
  };
}

// Interface para el componente GameVoting
export interface GameVotingProps {
  round: number;
  message: string;
  jugadoresActivos: string[];
  eliminatedPlayers: string[];
  onConfirmElimination: (jugador: string) => void;
  onShowImpostors?: () => void;
  roundInfo?: {
    category?: string;
    palabraTripulante: string;
    palabraImpostor: string;
    roundImpostors?: string[];
  };
}

// Interface para el componente GameFinished
export interface GameFinishedProps {
  round: number;
  message: string;
  ganaronTripulantes: boolean;
  game: any;
  estado: GameState;
  eliminatedPlayers: string[];
  onNewRound: () => void;
  onRestart: () => void;
  onShowImpostors?: () => void;
  allImpostorsHistory?: Array<{
    round: number;
    impostors: string[];
    palabraTripulante: string;
    palabraImpostor: string;
    category?: string;
  }>;
}