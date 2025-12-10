import { useState } from 'preact/hooks';

export default function PlayerSelector() {
  const [playerCount, setPlayerCount] = useState(6);
  const [maxImpostors, setMaxImpostors] = useState(2);

  const handleSliderChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setPlayerCount(parseInt(target.value));
    console.log(playerCount);
    
  };

  const handleImpostorSelect = (value: number) => {
    setMaxImpostors(value);
  };

  return (
    <div class="bg-white rounded-2xl p-8 shadow-xl">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">¿Cuántos jugadores son?</h2>
      <p class="text-gray-600 mb-8">
        Selecciona el número de jugadores para ajustar automáticamente los roles.
      </p>

      {/* Selector de jugadores */}
      <div class="mb-10">
        <div class="flex items-center justify-between mb-4">
          <span class="text-lg font-medium text-gray-700">
            Número de jugadores
          </span>
          <span id="playerCount" class="text-3xl font-bold text-blue-600">
            {playerCount}
          </span>
        </div>

        <input
          type="range"
          id="playersSlider"
          min="4"
          max="15"
          value={playerCount}
          onChange={handleSliderChange}
          class="w-full h-2 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-full cursor-pointer 
                 [&::-webkit-slider-thumb]:appearance-none 
                 [&::-webkit-slider-thumb]:h-6 
                 [&::-webkit-slider-thumb]:w-6 
                 [&::-webkit-slider-thumb]:rounded-full 
                 [&::-webkit-slider-thumb]:bg-gradient-to-r 
                 [&::-webkit-slider-thumb]:from-blue-500 
                 [&::-webkit-slider-thumb]:to-purple-600 
                 [&::-webkit-slider-thumb]:shadow-lg 
                 [&::-webkit-slider-thumb]:shadow-blue-200/50 
                 [&::-webkit-slider-thumb]:border-2 
                 [&::-webkit-slider-thumb]:border-white 
                 [&::-webkit-slider-thumb]:transition-all 
                 [&::-webkit-slider-thumb]:duration-200
                 [&::-webkit-slider-thumb]:hover:scale-110
                 [&::-webkit-slider-thumb]:hover:shadow-xl
                 [&::-webkit-slider-thumb]:hover:shadow-blue-300/50
                 
                 [&::-moz-range-track]:bg-gradient-to-r 
                 [&::-moz-range-track]:from-blue-400 
                 [&::-moz-range-track]:via-purple-400 
                 [&::-moz-range-track]:to-pink-400 
                 [&::-moz-range-track]:h-2 
                 [&::-moz-range-track]:rounded-full
                 
                 [&::-moz-range-thumb]:h-6 
                 [&::-moz-range-thumb]:w-6 
                 [&::-moz-range-thumb]:rounded-full 
                 [&::-moz-range-thumb]:border-2 
                 [&::-moz-range-thumb]:shadow-lg  
                 [&::-moz-range-thumb]:cursor-pointer
                 [&::-moz-range-thumb]:transition-all 
                 [&::-moz-range-thumb]:duration-200
                 
                 hover:[&::-webkit-slider-thumb]:scale-110"
        />

        <div class="flex justify-between text-sm text-gray-500 mt-2">
          <span>4 (mínimo)</span>
          <span>8 (recomendado)</span>
          <span>15 (máximo)</span>
        </div>
      </div>

      {/* Selector de impostores */}
      <div class="mb-10">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">
          Límite de impostores
        </h3>
        <p class="text-gray-600 mb-4 text-sm">
          ¿Cuántos impostores máximo quieres que haya?
        </p>

        <div class="grid grid-cols-3 gap-4">
          <button
            onClick={() => handleImpostorSelect(1)}
            class={`impostor-option py-4 rounded-xl border-2 transition-all text-center ${
              maxImpostors === 1
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div class="text-2xl font-bold text-gray-700 mb-1">1</div>
          </button>

          <button
            onClick={() => handleImpostorSelect(2)}
            class={`impostor-option py-4 rounded-xl border-2 transition-all text-center ${
              maxImpostors === 2
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div class="text-2xl font-bold text-gray-700 mb-1">2</div>
          </button>

          <button
            onClick={() => handleImpostorSelect(3)}
            class={`impostor-option py-4 rounded-xl border-2 transition-all text-center ${
              maxImpostors === 3
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div class="text-2xl font-bold text-gray-700 mb-1">3</div>
          </button>
        </div>
      </div>

      <style>
        {`
          .impostor-option {
            transition: all 0.3s ease;
          }
          
          .impostor-option:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          }
          
          input[type="range"]::-webkit-slider-thumb {
            box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
            border: 2px solid white;
          }
        `}
      </style>
    </div>
  );
}