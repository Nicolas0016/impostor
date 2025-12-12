import type ImpostorGame from "../../models/Impostor";
import type { GameState } from './types';

interface GameConfigProps {
  game: ImpostorGame;
  round: number;
  eliminatedPlayers: string[];
  estado: GameState;
  onStartRound: () => void;
  onResetConfig?: () => void;
}

export default function GameConfig({ game, round, eliminatedPlayers, estado, onStartRound, onResetConfig }: GameConfigProps) {
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        
        <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Configuración del Juego</h2>
            <button
              onClick={() => window.location.href = '/jugar'}
              className="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-lg transition-colors"
            >
              ✏️ Editar
            </button>
          </div>
          
          <div className="space-y-4 mb-6">
            {/* Jugadores */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-blue-400">👥 Jugadores ({estado.players.length})</h3>
                <span className="text-sm text-gray-400">Guardados</span>
              </div>
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
            
            {/* Estadísticas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-red-400 mb-1">😈 Impostores</h3>
                    <p className="text-2xl font-bold text-white">{game.maxImpostors} máx</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-400">Configuración:</span>
                    <p className="text-sm text-gray-300">
                      {estado.players.length >= 9 ? '3 permitidos' : 
                       estado.players.length >= 6 ? '2 permitidos' : '1 permitido'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-green-400 mb-1">📊 Ronda</h3>
                    <p className="text-2xl font-bold text-white">{round}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-400">Jugadores vivos:</span>
                    <p className="text-sm text-green-300">
                      {estado.players.length - eliminatedPlayers.length} de {estado.players.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Eliminados */}
            {eliminatedPlayers.length > 0 && (
              <div className="bg-red-900/30 p-4 rounded-lg border border-red-700/50">
                <h3 className="text-lg font-semibold text-red-300 mb-2">💀 Eliminados ({eliminatedPlayers.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {eliminatedPlayers.map((jugador, index) => (
                    <span key={index} className="bg-red-800 text-red-100 px-3 py-1 rounded-full text-sm">
                      {jugador}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Info de configuración */}
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700/30">
              <h3 className="text-lg font-semibold text-blue-300 mb-2">📋 Configuración Cargada</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">Jugadores:</span>
                  <p className="text-white">{estado.players.length}</p>
                </div>
                <div>
                  <span className="text-gray-400">Impostores máx:</span>
                  <p className="text-white">{game.maxImpostors}</p>
                </div>
                <div>
                  <span className="text-gray-400">Ronda actual:</span>
                  <p className="text-white">{round}</p>
                </div>
                <div>
                  <span className="text-gray-400">Estado:</span>
                  <p className="text-green-300">✓ Configuración válida</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Botón para comenzar */}
          <div className="space-y-4">
            <button
              onClick={onStartRound}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              🎯 Comenzar Ronda {round + 1}
            </button>
            
            {onResetConfig && (
              <button
                onClick={onResetConfig}
                className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-2 px-4 rounded-lg transition-all duration-300"
              >
                🔄 Reiniciar con nueva configuración
              </button>
            )}
          </div>
        </div>
        
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>{estado.players.length} jugadores • {game.maxImpostors} impostores máx • Ronda {round}</p>
          <p className="text-gray-600 mt-1">Configuración cargada desde localStorage</p>
        </div>
      </div>
    </div>
  );
}