import { useEffect, useState } from 'preact/hooks';
interface Mechanic {
  id: string;
  name: string;
  description: string;
  difficulty: 'baja' | 'media' | 'alta' | string;
}

interface ModeSelectorProps {
  mechanics: Mechanic[];
}

export function ModeSelector({ mechanics }: ModeSelectorProps) {
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [randomMode, setRandomMode] = useState(false);

  // Cargar selección guardada al montar
  useEffect(() => {
    const savedConfig = localStorage.getItem('impostorGameConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.selectedModes) {
          setSelectedModes(config.selectedModes);
        }
        if (config.randomMode) {
          setRandomMode(true);
        }
      } catch (error) {
        console.error('Error al cargar configuración:', error);
      }
    }
  }, []);

  // Guardar cambios en localStorage
  useEffect(() => {
    const config = JSON.parse(localStorage.getItem('impostorGameConfig') || '{}');
    config.selectedModes = selectedModes;
    config.randomMode = randomMode;
    localStorage.setItem('impostorGameConfig', JSON.stringify(config));
    
    // Actualizar configuración global
    if (window.updateConfig) {
      window.updateConfig('selectedModes', selectedModes);
      window.updateConfig('randomMode', randomMode);
    }
  }, [selectedModes, randomMode]);

  const toggleMode = (modeId: string) => {
    if (randomMode) return; // No permitir selección si modo aleatorio está activado
    
    setSelectedModes(prev => {
      if (prev.includes(modeId)) {
        return prev.filter(id => id !== modeId);
      } else {
        return [...prev, modeId];
      }
    });
  };

  const handleRandomModeToggle = (isRandom: boolean) => {
    setRandomMode(isRandom);
    
    if (isRandom) {
      // Limpiar selecciones cuando se activa modo aleatorio
      setSelectedModes([]);
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'baja': return 'Fácil';
      case 'media': return 'Media';
      case 'alta': return 'Difícil';
      default: return difficulty;
    }
  };

  const getDifficultyClasses = (difficulty: string) => {
    switch (difficulty) {
      case 'baja': return 'bg-green-100 text-green-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'alta': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div class="bg-white rounded-2xl p-8 shadow-xl">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Selecciona los agregados a la partida</h2>
      <p class="text-gray-600 mb-8">
        Incluye una o varias modalidades para tu partida. Puedes combinar diferentes estilos.
      </p>

      {/* Modalidades principales */}
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Modalidades Principales</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mechanics.map(mechanic => {
            const isSelected = selectedModes.includes(mechanic.id);
            
            return (
              <div
                key={mechanic.id}
                onClick={() => toggleMode(mechanic.id)}
                class={`mode-card border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-300 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                } ${randomMode ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-semibold text-gray-800">{mechanic.name}</h4>
                  <div class={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <p class="text-sm text-gray-600">{mechanic.description}</p>
                <div class="mt-3">
                  <span class={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyClasses(mechanic.difficulty)}`}>
                    {getDifficultyText(mechanic.difficulty)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modo aleatorio */}
      <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-semibold text-gray-800 mb-1">Modo Aleatorio</h4>
            <p class="text-sm text-gray-600">
              Deja que el sistema elija modalidades aleatorias cada ronda
            </p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={randomMode}
              onChange={(e) => handleRandomModeToggle((e.target as HTMLInputElement).checked)}
              class="sr-only peer"
            />
            <div class="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition-colors"></div>
            <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
          </label>
        </div>
      </div>

      {/* Instrucciones */}
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-blue-800 mb-1">Consejos de selección</h4>
            <ul class="text-blue-700 text-sm space-y-1">
              <li>• Para principiantes: Selecciona 1-2 modalidades simples</li>
              <li>• Para expertos: Combina 3+ modalidades para mayor desafío</li>
              <li>• El modo aleatorio mantiene la partida impredecible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Declarar la interfaz global para TypeScript
declare global {
  interface Window {
    updateConfig?: (key: string, value: any) => void;
  }
}

// Estilos CSS (opcional, puedes usar Tailwind en su lugar)
const styles = `
  .mode-card {
    transition: all 0.3s ease;
  }
  
  .mode-card:hover {
    transform: translateY(-2px);
  }
`;