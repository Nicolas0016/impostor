import type ImpostorGame from "../../models/Impostor";
import type { GameState } from './types';

interface GameConfigProps {
  game: ImpostorGame;
  round: number;
  eliminatedPlayers: string[];
  estado: GameState;
  onStartRound: () => void;
  onResetConfig?: () => void;
  onShowImpostors?: () => void; // Nuevo: para mostrar modal de impostores
  roundInfo?: { // Nuevo: información de la ronda anterior
    category?: string;
    palabraTripulante: string;
    palabraImpostor: string;
    roundImpostors?: string[];
  };
}

export default function GameConfig({ 
  game, 
  round, 
  eliminatedPlayers, 
  estado, 
  onStartRound, 
  onResetConfig, 
  onShowImpostors,
  roundInfo 
}: GameConfigProps) {
  
  // Función para obtener información de impostores de la última ronda
  const obtenerInfoUltimaRonda = () => {
    if (!roundInfo || round === 0) return null;
    
    const impostoresCount = roundInfo.roundImpostors?.length || 0;
    const tienePalabraRelacionada = roundInfo.palabraImpostor !== 'IMPOSTOR';
    
    return {
      impostoresCount,
      tienePalabraRelacionada,
      categoria: roundInfo.category,
      palabraTripulante: roundInfo.palabraTripulante,
      palabraImpostor: roundInfo.palabraImpostor
    };
  };
  
  const infoUltimaRonda = obtenerInfoUltimaRonda();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        
        <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Configuración del Juego</h2>
            {estado.storedImpostors && estado.storedImpostors.length > 0 && onShowImpostors && (
              <button
                onClick={onShowImpostors}
                className="bg-red-700 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                title="Ver impostores de rondas anteriores"
              >
                👁️ Ver Impostores
              </button>
            )}
          </div>
          
          <div className="space-y-6 mb-6">
            
            {/* Jugadores */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-blue-400">👥 Jugadores ({estado.players.length})</h3>
                  {eliminatedPlayers.length > 0 && (
                    <span className="bg-red-700 text-white text-xs px-2 py-1 rounded-full">
                      {eliminatedPlayers.length} eliminado(s)
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {estado.players.map((jugador, index) => (
                    <span 
                      key={index} 
                      className="bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-500 transition-colors duration-200"
                    >
                      {jugador}
                    </span>
                  ))}
                </div>
                {eliminatedPlayers.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <p className="text-gray-400 text-sm mb-2">Eliminados:</p>
                    <div className="flex flex-wrap gap-2">
                      {eliminatedPlayers.map((jugador, index) => (
                        <span 
                          key={index} 
                          className="bg-red-900/50 text-gray-300 px-3 py-1.5 rounded-lg text-sm line-through"
                        >
                          {jugador}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center col-span-2 justify-center bg-gradient-to-br from-red-900/30 to-red-800/20 p-4 rounded-lg border border-red-700/30">
                
                  <h3 className="text-lg font-bold text-red-400 ">Impostores {game.maxImpostors}</h3>
                  
              </div>
              
              <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 p-4 rounded-lg border border-green-700/30">
                <div className="flex items-center justify-center">
                  <h3 className="text-lg font-bold text-green-400">{round}°</h3>
                  
                </div>
              </div>
            </div>
            
          </div>
          
          {/* Botones de acción */}
          <div className="space-y-4">
            <button
              onClick={onStartRound}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
            >
              <span className="text-xl">🎯</span>
              <span>Comenzar Ronda {round + 1}</span>
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              {onShowImpostors && estado.storedImpostors && estado.storedImpostors.length > 0 && (
                <button
                  onClick={onShowImpostors}
                  className="w-full bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>👁️</span>
                  <span>Ver Impostores</span>
                </button>
              )}
              
              {onResetConfig && (
                <button
                  onClick={onResetConfig}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>🔄</span>
                  <span>Reiniciar</span>
                </button>
              )}
            </div>
          </div>
          
        </div>
        
      </div>
    </div>
  );
}