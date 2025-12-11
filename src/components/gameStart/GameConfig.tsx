import type ImpostorGame from "../../models/Impostor";
import type { GameState } from './types';

interface GameConfigProps {
  game: ImpostorGame;
  round: number;
  eliminatedPlayers: string[];
  estado: GameState;
  onStartRound: () => void;
}

export default function GameConfig({ game, round, eliminatedPlayers, estado, onStartRound }: GameConfigProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        
        <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Configuración del Juego</h2>
          
          <div className="space-y-4 mb-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">👥 Jugadores</h3>
              <div className="flex flex-wrap gap-2">
                {estado.players.map((jugador, index) => (
                  <span 
                    key={index} 
                    className={`${eliminatedPlayers.includes(jugador) ? 'bg-red-900/50 line-through' : 'bg-gray-600'} text-white px-3 py-1 rounded-full text-sm`}
                  >
                    {jugador}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-red-400 mb-1">😈 Impostores</h3>
                <p className="text-2xl font-bold text-white">{game.maxImpostors} máx</p>
              </div>
              
              <div className="bg-gray-700 px-2 rounded-lg flex items-center gap-4">
                <h3 className="text-lg font-semibold text-green-400">📊 Ronda</h3>
                <p className="text-2xl font-bold text-white">{round}</p>
              </div>
            </div>
            
            {eliminatedPlayers.length > 0 && (
              <div className="bg-red-900/30 p-4 rounded-lg border border-red-700/50">
                <h3 className="text-lg font-semibold text-red-300 mb-2">💀 Eliminados</h3>
                <div className="flex flex-wrap gap-2">
                  {eliminatedPlayers.map((jugador, index) => (
                    <span key={index} className="bg-red-800 text-red-100 px-3 py-1 rounded-full text-sm">
                      {jugador}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={onStartRound}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            🎯 Comenzar Ronda {round + 1}
          </button>
          
        </div>
        
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>{estado.players.length} jugadores • {game.maxImpostors} impostores máx.</p>
        </div>
      </div>
    </div>
  );
}