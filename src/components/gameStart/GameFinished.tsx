import type ImpostorGame from "../../models/Impostor";
import type { GameState } from './types';

interface GameFinishedProps {
  round: number;
  message: string;
  ganaronTripulantes: boolean;
  game: ImpostorGame;
  estado: GameState;
  eliminatedPlayers: string[];
  onNewRound: () => void;
  onRestart: () => void;
}

export default function GameFinished({ 
  round, 
  message, 
  ganaronTripulantes, 
  game, 
  estado, 
  eliminatedPlayers,
  onNewRound,
  onRestart
}: GameFinishedProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">
            {ganaronTripulantes ? '🏆' : '😈'}
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${ganaronTripulantes ? 'text-green-400' : 'text-red-400'}`}>
            {ganaronTripulantes ? '¡TRIPULANTES GANAN!' : '¡IMPOSTORES GANAN!'}
          </h1>
          <p className="text-gray-400">La ronda ha terminado</p>
          <div className="inline-block bg-gray-800/50 px-3 py-1 rounded-full mt-2">
            <span className="text-gray-400">Ronda final</span>
            <span className="text-white font-bold ml-2">{round}</span>
          </div>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Resumen de la Ronda</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Palabra secreta</p>
                <p className="text-xl font-bold text-white font-mono mt-1">{game.secretWord}</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Rondas jugadas</p>
                <p className="text-2xl font-bold text-white">{round}</p>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${ganaronTripulantes ? 'bg-green-900/30 border border-green-700/50' : 'bg-red-900/30 border border-red-700/50'}`}>
              <h3 className="font-semibold text-white mb-2">
                {ganaronTripulantes ? '🎯 Cómo ganaron los tripulantes:' : '🎭 Cómo ganaron los impostores:'}
              </h3>
              <p className="text-gray-300 text-sm">
                {ganaronTripulantes 
                  ? 'Eliminaron a todos los impostores antes de ser superados en número.'
                  : 'Lograron igualar o superar en número a los tripulantes restantes.'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-gray-300 mb-2 text-sm">Impostores:</h3>
                <div className="flex flex-wrap gap-1">
                  {estado.impostors.map((impostor, index) => (
                    <span key={index} className="bg-red-600 text-white px-2 py-1 rounded-full text-xs">
                      {impostor}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-gray-300 mb-2 text-sm">Eliminados:</h3>
                <div className="flex flex-wrap gap-1">
                  {eliminatedPlayers.map((jugador, index) => (
                    <span key={index} className="bg-gray-600 text-white px-2 py-1 rounded-full text-xs">
                      {jugador}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onNewRound}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            🎮 Nueva Ronda
          </button>
          
          <button
            onClick={onRestart}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            🔄 Reiniciar Todo
          </button>
        </div>
        
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Gracias por jugar IMPOSTOR WEB</p>
        </div>
      </div>
    </div>
  );
}