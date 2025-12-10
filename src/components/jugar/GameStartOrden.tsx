import { useEffect, useState } from 'preact/hooks';

interface GameStartOrderProps {
  playerNames: string[];
  onStartGame: () => void;
}

export function GameStartOrder({ playerNames, onStartGame }: GameStartOrderProps) {
  const [startIndex, setStartIndex] = useState(0);
  const [order, setOrder] = useState<string[]>([]);
  
  // Generar orden aleatorio al montar
  useEffect(() => {
    const randomStart = Math.floor(Math.random() * playerNames.length);
    setStartIndex(randomStart);
    
    const newOrder = [];
    for (let i = 0; i < playerNames.length; i++) {
      newOrder.push(playerNames[(randomStart + i) % playerNames.length]);
    }
    setOrder(newOrder);
    
    // Guardar en localStorage
    localStorage.setItem('gameStartOrder', JSON.stringify({
      startIndex: randomStart,
      order: newOrder
    }));
  }, [playerNames]);

  const handleRegenerate = () => {
    const randomStart = Math.floor(Math.random() * playerNames.length);
    setStartIndex(randomStart);
    
    const newOrder = [];
    for (let i = 0; i < playerNames.length; i++) {
      newOrder.push(playerNames[(randomStart + i) % playerNames.length]);
    }
    setOrder(newOrder);
  };

  return (
    <div class="bg-white rounded-2xl p-8 shadow-xl max-w-2xl mx-auto">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">¡Orden de juego definido!</h2>
      <p class="text-gray-600 mb-8">
        El juego comenzará siguiendo este orden (sentido horario):
      </p>
      
      {/* Jugador que inicia destacado */}
      <div class="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl">
        <div class="flex items-center justify-center">
          <div class="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
            👑
          </div>
          <div>
            <h3 class="text-xl font-bold text-orange-800">Comienza:</h3>
            <p class="text-3xl font-bold text-gray-900">{playerNames[startIndex]}</p>
            <p class="text-orange-600">Posición #{startIndex + 1} en el círculo</p>
          </div>
        </div>
      </div>
      
      {/* Lista completa del orden */}
      <div class="mb-8">
        <h3 class="font-semibold text-gray-800 mb-4 text-lg">Orden completo:</h3>
        <div class="space-y-3">
          {order.map((name, index) => (
            <div
              key={index}
              class={`flex items-center p-4 rounded-xl border-2 transition-all ${
                index === 0
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-300'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div class={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-4 ${
                index === 0
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {index + 1}
              </div>
              <div class="flex-1">
                <span class={`font-semibold text-lg ${
                  index === 0 ? 'text-orange-700' : 'text-gray-800'
                }`}>
                  {name}
                </span>
                {index === 0 && (
                  <span class="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full">
                    COMIENZA
                  </span>
                )}
              </div>
              <div class="text-gray-500">
                Posición #{(playerNames.indexOf(name) + 1)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Botones de acción */}
      <div class="flex justify-between">
        <button
          onClick={handleRegenerate}
          class="btn border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Generar nuevo orden
        </button>
        
        <button
          onClick={onStartGame}
          class="btn bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 px-8 py-3 shadow-lg"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          ¡Comenzar juego!
        </button>
      </div>
      
      {/* Instrucciones */}
      <div class="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div class="flex items-start">
          <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="text-blue-700 text-sm">
              <span class="font-semibold">Recordatorio:</span> El juego seguirá este orden para turnos, 
              descripciones de palabras y votaciones. Mantengan este orden durante toda la partida.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}