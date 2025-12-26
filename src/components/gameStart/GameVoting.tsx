import confetti from 'canvas-confetti';
import { useEffect, useRef, useState } from 'preact/hooks';

interface GameVotingProps {
  round: number;
  message: string;
  jugadoresActivos: string[];
  eliminatedPlayers: string[];
  onConfirmElimination: (jugador: string) => void;
  onShowImpostors?: () => void; // Opcional: para mostrar info de impostores
  roundInfo?: {
    roundImpostors?: string[];
    palabraImpostor?: string;
  };
}

export default function GameVoting({ 
  round, 
  message, 
  jugadoresActivos, 
  eliminatedPlayers, 
  onConfirmElimination,
  onShowImpostors,
  roundInfo 
}: GameVotingProps) {
  const [showImpostorEliminatedModal, setShowImpostorEliminatedModal] = useState(false);
  const [eliminatedImpostor, setEliminatedImpostor] = useState<string | null>(null);
  const [wasImpostor, setWasImpostor] = useState(false);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);

  // Función para disparar confeti
  const shootConfetti = () => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;

    const myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true
    });

    // Confeti más colorido
    myConfetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff0000', '#ff6b6b', '#ffd93d', '#6bcf7f', '#4d96ff']
    });

    // Lluvia de confeti
    setTimeout(() => {
      myConfetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff0000', '#ff6b6b']
      });
    }, 250);

    setTimeout(() => {
      myConfetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#4d96ff', '#6bcf7f']
      });
    }, 500);
  };

  // Función para manejar eliminación
  const handleElimination = (jugador: string) => {
    // Verificar si el jugador era impostor
    const eraImpostor = roundInfo?.roundImpostors?.includes(jugador) || false;
    
    if (eraImpostor) {
      setEliminatedImpostor(jugador);
      setWasImpostor(true);
      setShowImpostorEliminatedModal(true);
      shootConfetti();
    } else {
      setEliminatedImpostor(jugador);
      setWasImpostor(false);
      setShowImpostorEliminatedModal(true);
    }
    
    // Llamar a la función original después de 2 segundos
    setTimeout(() => {
      onConfirmElimination(jugador);
      setShowImpostorEliminatedModal(false);
    }, 2000);
  };

  // Canvas para confeti
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '100';
    document.body.appendChild(canvas);
    
    confettiCanvasRef.current = canvas;
    
    return () => {
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, []);

  return (
    <>
      {/* Modal cuando eliminan a un impostor */}
      {showImpostorEliminatedModal && eliminatedImpostor && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl p-8 shadow-2xl border-4 transform transition-all duration-500 scale-100 ${wasImpostor 
            ? 'bg-gradient-to-br from-red-900/90 to-red-800/80 border-red-500 animate-pulse' 
            : 'bg-gradient-to-br from-blue-900/90 to-blue-800/80 border-blue-500'
          }`}>
            <div className="text-center">
              {/* Icono */}
              <div className={`text-6xl mb-4 ${wasImpostor ? 'text-red-300' : 'text-blue-300'}`}>
                {wasImpostor ? '🎉' : '😢'}
              </div>
              
              {/* Título */}
              <h2 className={`text-4xl font-bold mb-3 ${wasImpostor ? 'text-yellow-300' : 'text-white'}`}>
                {wasImpostor ? '¡IMPOSTOR ELIMINADO!' : 'Tripulante eliminado'}
              </h2>
              
              {/* Nombre del jugador */}
              <div className={`text-3xl font-bold mb-4 ${wasImpostor ? 'text-red-200' : 'text-blue-200'}`}>
                {eliminatedImpostor}
              </div>
              
              {/* Mensaje */}
              <p className={`text-xl mb-6 ${wasImpostor ? 'text-yellow-200' : 'text-gray-300'}`}>
                {wasImpostor 
                  ? '¡Los tripulantes están un paso más cerca de la victoria!' 
                  : 'Los impostores siguen entre nosotros...'}
              </p>
              
              {/* Contador */}
              <div className="text-5xl font-bold text-white animate-bounce">
                ...
              </div>
              
              {/* Información extra para impostores */}
              {wasImpostor && roundInfo?.palabraImpostor && roundInfo.palabraImpostor !== 'IMPOSTOR' && (
                <div className="mt-4 p-3 bg-yellow-900/40 rounded-lg">
                  <p className="text-yellow-200 text-sm">
                    Palabra del impostor: <span className="font-bold">"{roundInfo.palabraImpostor}"</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-red-500 mb-2 animate-pulse">🗳️ VOTACIÓN</h1>
            <p className="text-gray-400">Elimina al jugador más sospechoso</p>
            
            {/* Botón para ver impostores (opcional) */}
            {onShowImpostors && (
              <button
                onClick={onShowImpostors}
                className="mt-4 inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 px-4 rounded-lg transition-all duration-300"
              >
                <span>👁️ Ver impostores</span>
              </button>
            )}
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700 mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">Selecciona al jugador a eliminar:</h2>
            
            <div className="space-y-3 overflow-y-auto overflow-x-hidden max-h-96">
              {jugadoresActivos.map((jugador) => {
                const esImpostor = roundInfo?.roundImpostors?.includes(jugador);
                
                return (
                  <button
                    key={jugador}
                    onClick={() => handleElimination(jugador)}
                    className={`w-full text-white p-4 rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border flex items-center justify-between group
                      ${esImpostor 
                        ? 'bg-gradient-to-r from-red-900/50 to-red-800/40 hover:from-red-800 hover:to-red-700 border-red-800/60' 
                        : 'bg-gradient-to-r from-gray-800/60 to-gray-900/40 hover:from-gray-700 hover:to-gray-800 border-gray-700'
                      }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform
                        ${esImpostor ? 'bg-red-600 group-hover:bg-red-500' : 'bg-gray-600 group-hover:bg-gray-500'}`}>
                        <span className="text-xl">{esImpostor ? '😈' : '👤'}</span>
                      </div>
                      <div className="text-left">
                        <span className="text-lg font-semibold block">{jugador}</span>
                        {esImpostor && (
                          <span className="text-xs text-red-400 font-bold bg-red-900/30 px-2 py-1 rounded-full">
                            IMPOSTOR
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`group-hover:scale-125 transition-transform
                      ${esImpostor ? 'text-red-400 group-hover:text-red-300' : 'text-gray-400 group-hover:text-gray-300'}`}>
                      ❌ Votar
                    </span>
                  </button>
                );
              })}
            </div>
            
            {eliminatedPlayers.length > 0 && (
              <div className="mt-4 p-3 bg-gray-900/40 rounded-lg border border-gray-700">
                <h4 className="text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                  <span className="text-red-400">💀</span> Jugadores eliminados:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {eliminatedPlayers.map((jugador, index) => {
                    const eraImpostor = roundInfo?.roundImpostors?.includes(jugador);
                    
                    return (
                      <span 
                        key={index} 
                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1
                          ${eraImpostor 
                            ? 'bg-red-800/60 text-red-200 border border-red-700/50' 
                            : 'bg-gray-700/60 text-gray-300 border border-gray-600/50'
                          }`}
                      >
                        {jugador}
                        {eraImpostor && <span className="text-xs">(I)</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}