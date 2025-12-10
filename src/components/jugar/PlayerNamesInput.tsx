import { useEffect, useState } from 'preact/hooks';

interface PlayerNamesInputProps {
  playerCount: number;
  onNamesSubmitted: (names: string[]) => void;
  onBack: () => void;
}

export function PlayerNamesInput({ playerCount, onNamesSubmitted, onBack }: PlayerNamesInputProps) {
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Inicializar array de nombres vacíos
  useEffect(() => {
    const initialNames = Array(playerCount).fill('');
    setPlayerNames(initialNames);
    setCurrentIndex(0);
    setIsComplete(false);
  }, [playerCount]);

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...playerNames];
    newNames[index] = value.trim();
    setPlayerNames(newNames);
  };

  const handleNext = () => {
    if (currentIndex < playerCount - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Verificar que todos tengan nombre
      const allNamesFilled = playerNames.every(name => name.trim() !== '');
      if (allNamesFilled) {
        setIsComplete(true);
      } else {
        // Encontrar el primer índice sin nombre
        const firstEmpty = playerNames.findIndex(name => name.trim() === '');
        if (firstEmpty !== -1) {
          setCurrentIndex(firstEmpty);
        }
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    if (playerNames.every(name => name.trim() !== '')) {
      onNamesSubmitted(playerNames);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  };

  // Calcular progreso
  const progress = ((currentIndex + 1) / playerCount) * 100;
  const filledCount = playerNames.filter(name => name.trim() !== '').length;

  return (
    <div class="bg-white rounded-2xl p-8 shadow-xl max-w-2xl mx-auto">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Ingresa los nombres de los jugadores</h2>
      <p class="text-gray-600 mb-8">
        Escribe los nombres en el orden en que están sentados (en sentido horario).
      </p>

      {/* Indicador de progreso */}
      <div class="mb-8">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium text-gray-700">
            Jugador {currentIndex + 1} de {playerCount}
          </span>
          <span class="text-sm font-medium text-blue-600">
            {filledCount}/{playerCount} completados
          </span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={`width: ${progress}%`}
          ></div>
        </div>
      </div>

      {/* Visualización de círculos */}
      <div class="flex flex-wrap justify-center gap-4 mb-8">
        {playerNames.map((name, index) => (
          <div
            key={index}
            class={`flex flex-col items-center cursor-pointer transition-all ${
              index === currentIndex ? 'scale-110' : ''
            }`}
            onClick={() => setCurrentIndex(index)}
          >
            <div
              class={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-1 border-2 transition-all ${
                name.trim() !== ''
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent'
                  : index === currentIndex
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-300 text-gray-400'
              }`}
            >
              {name.trim() !== '' ? name.charAt(0).toUpperCase() : index + 1}
            </div>
            <span class={`text-xs font-medium ${
              name.trim() !== '' ? 'text-gray-800' : 'text-gray-500'
            }`}>
              {name.trim() || `Jugador ${index + 1}`}
            </span>
          </div>
        ))}
      </div>

      {/* Input actual */}
      <div class="mb-8">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Nombre del jugador {currentIndex + 1}
          <span class="text-gray-500 ml-1">(posición {currentIndex + 1} en el círculo)</span>
        </label>
        <div class="relative">
          <input
            type="text"
            value={playerNames[currentIndex]}
            onInput={(e) => handleNameChange(currentIndex, (e.target as HTMLInputElement).value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ej: Jugador ${currentIndex + 1}`}
            class="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            autoFocus
          />
          {playerNames[currentIndex].trim() !== '' && (
            <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
        </div>
        <p class="text-sm text-gray-500 mt-2">
          Presiona Enter para pasar al siguiente jugador
        </p>
      </div>

      {/* Lista de nombres ingresados */}
      {filledCount > 0 && (
        <div class="mb-8 bg-gray-50 rounded-xl p-4">
          <h3 class="font-semibold text-gray-700 mb-2">Nombres ingresados:</h3>
          <div class="flex flex-wrap gap-2">
            {playerNames.map((name, index) => (
              name.trim() !== '' && (
                <div
                  key={index}
                  class={`px-3 py-2 rounded-lg flex items-center gap-2 ${
                    index === currentIndex
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-white text-gray-700 border border-gray-200'
                  }`}
                >
                  <span class="font-medium">#{index + 1}</span>
                  <span class="font-semibold">{name}</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Botones de navegación */}
      <div class="flex justify-between">
        <div class="flex gap-4">
          <button
            onClick={onBack}
            class="btn border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>
          
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            class="btn border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>
        </div>

        {isComplete ? (
          <button
            onClick={handleSubmit}
            class="btn bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 px-8 py-3 shadow-lg"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Confirmar nombres
          </button>
        ) : (
          <button
            onClick={handleNext}
            class="btn bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 px-8 py-3"
          >
            {currentIndex === playerCount - 1 ? 'Revisar' : 'Siguiente'}
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Instrucciones */}
      <div class="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-blue-800 mb-1">Instrucciones importantes</h4>
            <ul class="text-blue-700 text-sm space-y-1">
              <li>• Ingresa los nombres en el orden en que están sentados alrededor de la mesa</li>
              <li>• El juego seguirá este orden para turnos y votaciones</li>
              <li>• Puedes hacer clic en cualquier círculo para editar ese nombre</li>
              <li>• Presiona Enter para avanzar rápidamente entre jugadores</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}