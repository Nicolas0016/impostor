import confetti from 'canvas-confetti';
import { useEffect } from 'preact/hooks';
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
  onShowImpostors?: () => void; // Nueva: para mostrar modal de impostores
  allImpostorsHistory?: Array<{ // Nueva: historial completo de impostores
    round: number;
    impostors: string[];
    palabraTripulante: string;
    palabraImpostor: string;
    category?: string;
  }>;
}

export default function GameFinished({ 
  round, 
  message, 
  ganaronTripulantes, 
  game, 
  estado, 
  eliminatedPlayers,
  onNewRound,
  onRestart,
  onShowImpostors,
  allImpostorsHistory = []
}: GameFinishedProps) {

  useEffect(() => {
    // Solo disparar confeti si ganaron los tripulantes
    if (ganaronTripulantes) {
      const count = 200;
      const defaults = {
        origin: { y: 0.7 }
      };

      function fire(particleRatio: number, opts: any) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        });
      }

      // Configuración del confeti
      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      
      fire(0.2, {
        spread: 60,
      });
      
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
      });
      
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
      });
      
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    }
  }, [ganaronTripulantes]); // Solo se ejecuta cuando cambia ganaronTripulantes

  // Calcular estadísticas
  const jugadoresTotales = estado.originalPlayers.length;
  const jugadoresActivos = estado.players.length;
  const porcentajeEliminados = jugadoresTotales > 0 ? 
    ((eliminatedPlayers.length / jugadoresTotales) * 100).toFixed(0) : '0';
  
  // Encontrar impostor más frecuente (si hay historial)
  const impostorStats: Record<string, number> = {};
  allImpostorsHistory.forEach(ronda => {
    ronda.impostors.forEach(impostor => {
      impostorStats[impostor] = (impostorStats[impostor] || 0) + 1;
    });
  });
  
  const impostorMasFrecuente = Object.entries(impostorStats).sort((a, b) => b[1] - a[1])[0];

  // Contar rondas con palabra relacionada para impostor
  const rondasConPalabraRelacionada = allImpostorsHistory.filter(
    ronda => ronda.palabraImpostor !== 'IMPOSTOR'
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4 animate-bounce">
            🏆
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${ganaronTripulantes ? 'text-green-400' : 'text-red-400'}`}>
            {ganaronTripulantes ? '¡TRIPULANTES GANAN!' : '¡IMPOSTORES GANAN!'}
          </h1>
        </div>
        
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">📊 Estadísticas Finales</h2>
          </div>
          
          <div className="space-y-5">
            {/* Resumen general */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/60 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Jugadores Totales</p>
                  <p className="text-3xl font-bold text-white">{jugadoresTotales}</p>
                </div>
                <div className="bg-gray-900/60 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Jugadores Activos</p>
                  <p className="text-3xl font-bold text-green-400">{jugadoresActivos}</p>
                </div>
            </div>
            
            {/* Palabras de la ronda final */}
            <div className="bg-gray-900/60 p-5 rounded-xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/40 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Para Tripulantes</p>
                  <p className="text-xl font-bold text-white font-mono mt-1 break-all">{estado.secretWord}</p>
                </div>
                <div className="bg-gray-800/40 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Para Impostor</p>
                  <p className={`text-xl font-bold font-mono mt-1 break-all ${estado.impostorWord !== 'IMPOSTOR' ? 'text-yellow-400' : 'text-red-400'}`}>
                    {estado.impostorWord !== 'IMPOSTOR' ? estado.impostorWord : ""}
                  </p>
                  {estado.impostorWord !== 'IMPOSTOR' && (
                    <p className="text-yellow-300 text-xs mt-1">(Palabra relacionada)</p>
                  )}
                </div>
              </div>
            </div>     
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onRestart}
            className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-3"
          >
            <span className="text-left">
              <span className="block text-sm font-normal">Reiniciar</span>
            </span>
          </button>
          
          <button
            onClick={onNewRound}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-3"
          >
            <span className="text-left">
              <span className="block text-sm font-normal">Continuar</span>
            </span>
          </button>
        </div>
        
        
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>🎉 Gracias por jugar IMPOSTOR WEB 🎉</p>
          {ganaronTripulantes ? (
            <p className="text-green-400/70 mt-1">¡Los tripulantes han sobrevivido a la amenaza impostora!</p>
          ) : (
            <p className="text-red-400/70 mt-1">¡Los impostores han tomado el control del juego!</p>
          )}
        </div>
      </div>
    </div>
  );
}