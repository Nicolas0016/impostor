import type ImpostorGame from "../../models/Impostor";
import type { PlayerInfo } from './types';

interface GamePlayingProps {
  round: number;
  currentPlayer: string;
  playerInfo: PlayerInfo | null;
  game: ImpostorGame;
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

export default function GamePlaying({ 
  round, 
  currentPlayer, 
  playerInfo, 
  game, 
  showRole, 
  onShowRole, 
  onPassTurn,
  roundInfo 
}: GamePlayingProps) {

  // Verificar si el jugador actual es impostor y tiene palabra relacionada
  const esImpostorConPalabraRelacionada = 
    playerInfo?.role === 'impostor' && 
    roundInfo?.palabraImpostor !== 'IMPOSTOR';

  // Obtener el turno actual (esto depende de cómo esté implementado tu juego)
  // Si no hay método público, puedes calcularlo de otra forma
  const currentTurn = playerInfo ? 1 : 0; // Esto es un placeholder

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Header con información de la ronda */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full mb-2">
            <span className="text-gray-400">Ronda</span>
            <span className="text-white font-bold ml-2 text-xl">{round}</span>
            
          </div>
        </div>
        
        {/* Jugador Actual */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-6 text-center shadow-2xl transform transition-all duration-300 hover:shadow-purple-500/20">
          <div className="mb-4">
            <h2 className="text-4xl font-bold text-white mt-2">{currentPlayer}</h2>
          </div>
          
          {!showRole ? (
            <button
              onClick={onShowRole}
              className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/30 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-lg"
            >
              Descubrir Palabra
            </button>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              {/* Información del rol */}
              {playerInfo?.role === 'impostor' ? (
                <div className="space-y-4">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-red-900/60 to-red-800/40 border-2 border-red-500/50 shadow-lg">
                    <div className="text-3xl font-bold text-red-300 font-mono tracking-wider mb-2">
                      IMPOSTOR
                    </div>
                    <div className="text-lg text-red-200">
                      {esImpostorConPalabraRelacionada ? playerInfo?.word : "Tu misión es no ser descubierto"}
                    </div>
                  </div>
                </div>
                  ):  (
                /* Información para TRIPULANTE */
                <div className="space-y-4">
                  {/* Palabra secreta */}
                  <div className="p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg">
                    <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">
                      Palabra secreta de la ronda
                    </div>
                    <div className="text-3xl font-bold text-white font-mono tracking-wider">
                      {playerInfo?.word || roundInfo?.palabraTripulante || game.secretWord}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Botón para pasar turno */}
              <button
                onClick={onPassTurn}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-lg shadow-lg flex items-center justify-center gap-2"
              >
                <span>Pasar Turno</span>
              </button>
              
            </div>
          )}
        </div>
        <footer className="flex justify-center">

          <p className="text-gray-400">Pasa el dispositivo al jugador indicado</p>
        </footer>
      </div>
    </div>
  );
}