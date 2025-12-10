import { useEffect, useState } from 'preact/hooks';

interface Restriction {
  id: string;
  name: string;
  description: string;
  difficulty: 'baja' | 'media' | 'alta';
  icon?: string;
  effect: string;
}

interface RestrictionSelectorProps {
  restrictions?: Restriction[];
}

export function RestrictionSelector({ restrictions: propRestrictions }: RestrictionSelectorProps) {
  const defaultRestrictions: Restriction[] = [
    {
      id: 'mimo',
      name: 'Modo Mimo',
      description: 'En esta ronda nadie habla. Solo se pueden hacer gestos.',
      difficulty: 'alta',
      icon: '🤐',
      effect: 'El impostor la tiene difícil aquí'
    },
    {
      id: 'una-silaba',
      name: 'Modo "Una Sílaba"',
      description: 'Los jugadores solo pueden describir la palabra usando palabras de una sola sílaba.',
      difficulty: 'media',
      icon: '🔤',
      effect: 'Si alguien usa más sílabas, es sospechoso o penalizado'
    },
    {
      id: 'interrogatorio',
      name: 'Modo Interrogatorio',
      description: 'Nadie dice palabras al aire. Se designa un "Detective" (rotativo) que le pregunta a cada uno.',
      difficulty: 'media',
      icon: '🕵️',
      effect: 'Preguntas dirigidas para descubrir al impostor'
    },
    {
      id: 'pista-visual',
      name: 'Pista Visual',
      description: 'En lugar de texto, la app muestra una imagen borrosa o un icono.',
      difficulty: 'baja',
      icon: '🖼️',
      effect: 'Todos ven la misma imagen, el impostor ve una imagen diferente o nada'
    }
  ];

  const [selectedRestriction, setSelectedRestriction] = useState<string | null>(null);
  const restrictions = propRestrictions || defaultRestrictions;

  useEffect(() => {
    const savedConfig = localStorage.getItem('impostorGameConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.selectedRestriction) {
          setSelectedRestriction(config.selectedRestriction);
        }
      } catch (error) {
        console.error('Error al cargar configuración:', error);
      }
    }
  }, []);

  useEffect(() => {
    const config = JSON.parse(localStorage.getItem('impostorGameConfig') || '{}');
    config.selectedRestriction = selectedRestriction;
    localStorage.setItem('impostorGameConfig', JSON.stringify(config));
    
    if (window.updateConfig) {
      window.updateConfig('selectedRestriction', selectedRestriction);
    }
  }, [selectedRestriction]);

  const handleRestrictionSelect = (restrictionId: string) => {
    if (selectedRestriction === restrictionId) {
      setSelectedRestriction(null);
    } else {
      setSelectedRestriction(restrictionId);
    }
  };

  const getDifficultyClasses = (difficulty: string) => {
    switch (difficulty) {
      case 'baja': return 'bg-green-100 text-green-800 border-green-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div class="bg-white rounded-2xl p-8 shadow-xl">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Restricciones de Juego</h2>
      <p class="text-gray-600 mb-8">
        Elige una restricción especial para agregar un desafío único a la partida. Solo se puede activar una restricción por juego.
      </p>

      <div class="mb-8">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Restricciones Disponibles</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {restrictions.map(restriction => {
            const isSelected = selectedRestriction === restriction.id;
            
            return (
              <div
                key={restriction.id}
                onClick={() => handleRestrictionSelect(restriction.id)}
                class={`restriction-card border-2 rounded-xl p-4 transition-all relative cursor-pointer hover:shadow-lg ${
                  isSelected
                    ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md ring-2 ring-green-200 ring-opacity-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {isSelected && (
                  <div class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                
                <div class="flex items-start mb-3">
                  {restriction.icon && (
                    <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mr-3">
                      <span class="text-2xl">{restriction.icon}</span>
                    </div>
                  )}
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <h4 class="font-semibold text-gray-800">
                        {restriction.name}
                      </h4>
                      <span class={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${getDifficultyClasses(restriction.difficulty)}`}>
                        {restriction.difficulty === 'baja' ? 'Fácil' : 
                         restriction.difficulty === 'media' ? 'Media' : 'Difícil'}
                      </span>
                    </div>
                    <p class="text-sm mt-2 text-gray-600">
                      {restriction.description}
                    </p>
                  </div>
                </div>
                
                <div class="mt-3 pt-3 border-t border-gray-100 border-dashed">
                  <div class="flex items-start">
                    <svg class="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-xs text-blue-600">
                      <span class="font-semibold">Efecto:</span> {restriction.effect}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!selectedRestriction && (
        <div class="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p class="text-sm text-yellow-700 font-medium">
                No has seleccionado ninguna restricción
              </p>
              <p class="text-xs text-yellow-600 mt-1">
                Si no seleccionas una, el juego será sin restricciones especiales.
                Haz clic en cualquier tarjeta para seleccionar una restricción.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

declare global {
  interface Window {
    updateConfig?: (key: string, value: any) => void;
  }
}