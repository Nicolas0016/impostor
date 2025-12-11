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
}

export default function GamePlaying({ 
  round, 
  currentPlayer, 
  playerInfo, 
  game, 
  showRole, 
  onShowRole, 
  onPassTurn 
}: GamePlayingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-block bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full mb-2">
            <span className="text-gray-400">Ronda</span>
            <span className="text-white font-bold ml-2 text-xl">{round}</span>
          </div>
          <p className="text-gray-400">Pasa el dispositivo al jugador indicado</p>
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
              Descubir Palabra
            </button>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              {playerInfo?.role === 'impostor' ? 
                <div className="p-6 rounded-xl bg-red-900/40 border-2 border-red-500/50">
                  <div className="text-4xl font-bold text-red-400 font-mono tracking-wider">
                    IMPOSTOR
                  </div>
                </div>
              : 
                <div className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
                  <div className="text-4xl font-bold text-white font-mono tracking-wider">
                    {game.secretWord}
                  </div>
                </div>
              }
              
              {/* Botón para pasar turno */}
              <button
                onClick={onPassTurn}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-lg shadow-lg"
              >
                Pasar Turno
              </button>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}