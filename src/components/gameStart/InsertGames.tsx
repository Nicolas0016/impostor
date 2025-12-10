import { useEffect, useState } from 'preact/hooks';

interface GameStartProps {
  playerCount: number;
  onComplete: (playerNames: string[]) => void;
  onBack: () => void;
}

export default function InsertGames({ playerCount, onComplete, onBack }: GameStartProps) {
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Inicializar nombres
  useEffect(() => {
    const initialNames = Array(playerCount).fill('');
    setPlayerNames(initialNames);
    setCurrentIndex(0);
  }, [playerCount]);
  
  const handleNameChange = (value: string) => {
    const newNames = [...playerNames];
    newNames[currentIndex] = value.trim();
    setPlayerNames(newNames);
  };
  
  const handleNext = () => {
    if (currentIndex < playerCount - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Al llegar al último jugador, usar nombres o defaults
      const finalNames = playerNames.map((name, idx) => 
        name.trim() || `Jugador ${idx + 1}`
      );
      onComplete(finalNames);
    }
  };
  
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  // Nombre actual o default
  const currentName = playerNames[currentIndex] || `Jugador ${currentIndex + 1}`;
  const displayName = playerNames[currentIndex].trim() || `Jugador ${currentIndex + 1}`;
  
  return (
    <div class="bg-white rounded-2xl p-8 shadow-xl max-w-md mx-auto">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Configurar jugadores</h2>
      <p class="text-gray-600 mb-8">
        Ingresa el nombre de cada jugador en el orden en que están sentados.
      </p>
      
      {/* Indicador de progreso */}
      <div class="mb-8">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium text-gray-700">
            Jugador {currentIndex + 1} de {playerCount}
          </span>
          <span class="text-sm font-medium text-blue-600">
            {playerNames.filter(n => n.trim() !== '').length}/{playerCount}
          </span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={`width: ${((currentIndex + 1) / playerCount) * 100}%`}
          ></div>
        </div>
      </div>
      
      {/* Input actual */}
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">
          Nombre del jugador #{currentIndex + 1}
        </h3>
        
        <input
          type="text"
          value={playerNames[currentIndex]}
          onInput={(e) => handleNameChange((e.target as HTMLInputElement).value)}
          placeholder={`Ej: Jugador ${currentIndex + 1}`}
          class="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all mb-2"
          autoFocus
        />
        
        <p class="text-sm text-gray-500">
          {playerNames[currentIndex].trim() === '' 
            ? `Se usará "Jugador ${currentIndex + 1}" si dejas el campo vacío`
            : `Nombre establecido: ${playerNames[currentIndex]}`}
        </p>
      </div>
      
      {/* Vista previa de nombres */}
      <div class="mb-8 bg-gray-50 rounded-xl p-4">
        <h4 class="font-medium text-gray-700 mb-2">Nombres establecidos:</h4>
        <div class="grid grid-cols-2 gap-2">
          {playerNames.map((name, idx) => (
            <div 
              key={idx}
              class={`p-2 rounded border ${
                idx === currentIndex 
                  ? 'bg-blue-50 border-blue-300 text-blue-700' 
                  : 'bg-white border-gray-200 text-gray-700'
              } ${name.trim() === '' ? 'opacity-60' : ''}`}
            >
              <div class="flex items-center">
                <span class="font-bold mr-2">#{idx + 1}</span>
                <span class="truncate">{name.trim() || `Jugador ${idx + 1}`}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Botones de navegación */}
      <div class="flex justify-between">
        <div class="flex gap-2">
          <button
            onClick={onBack}
            class="btn border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2"
          >
            <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>
          
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            class="btn border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>
        </div>
        
        <button
          onClick={handleNext}
          class="btn bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 px-6 py-2"
        >
          {currentIndex === playerCount - 1 ? 'Finalizar' : 'Siguiente'}
          <svg class="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Instrucciones */}
      <div class="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
        <div class="flex items-start">
          <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-blue-700">
            Si dejas un campo vacío, se asignará automáticamente "Jugador X". 
            Puedes editar los nombres más adelante si es necesario.
          </p>
        </div>
      </div>
    </div>
  );
}