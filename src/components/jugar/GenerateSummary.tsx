import { useEffect, useState } from 'preact/hooks';
import rolesData from '../../data/roleSelector.json'; // Ajusta la ruta según tu estructura

interface GameConfig {
  players: number;
  maxImpostors: number;
  selectedModes: string[];
  selectedRoles: string[];
  selectedRestriction: string | null;
  showTutorial: boolean;
  timePerRound: number;
  randomMode?: boolean;
  autoAssignRoles?: boolean;
  maxRoles?: number;
}

interface SummaryItem {
  label: string;
  value: string;
  icon: string;
  color: string;
}

export default function GenerateSummary() {
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [summaryItems, setSummaryItems] = useState<SummaryItem[]>([]);
  
  // Cargar configuración del localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('impostorGameConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setGameConfig(config);
        generateSummary(config);
      } catch (error) {
        console.error('Error al cargar configuración:', error);
      }
    }
  }, []);
  
  const generateSummary = (config: GameConfig) => {
    const items: SummaryItem[] = [
      {
        label: 'Jugadores',
        value: `${config.players} jugadores`,
        icon: '👥',
        color: 'blue'
      },
      {
        label: 'Impostores',
        value: `Máximo ${config.maxImpostors} impostor${config.maxImpostors > 1 ? 'es' : ''}`,
        icon: '🎭',
        color: 'red'
      },
      {
        label: 'Modalidades',
        value: config.randomMode 
          ? 'Modo aleatorio activado' 
          : config.selectedModes?.length > 0 
            ? `${config.selectedModes.length} modalidad${config.selectedModes.length > 1 ? 'es' : ''} seleccionada${config.selectedModes.length > 1 ? 's' : ''}`
            : 'Sin modalidades especiales',
        icon: '🎮',
        color: 'purple'
      },
      {
        label: 'Roles Especiales',
        value: config.autoAssignRoles 
          ? `Asignación automática (${config.maxRoles || 3} roles)`
          : config.selectedRoles?.length > 0 
            ? `${config.selectedRoles.length} rol${config.selectedRoles.length > 1 ? 'es' : ''} activo${config.selectedRoles.length > 1 ? 's' : ''}`
            : 'Sin roles especiales',
        icon: '🃏',
        color: 'green'
      },
      {
        label: 'Restricción',
        value: config.selectedRestriction 
          ? getRestrictionName(config.selectedRestriction)
          : 'Sin restricción especial',
        icon: '🔒',
        color: 'yellow'
      }
    ];
    
    setSummaryItems(items);
  };
  
  const getRestrictionName = (restrictionId: string) => {
    const restrictions = {
      'mimo': 'Modo Mimo',
      'una-silaba': 'Modo "Una Sílaba"',
      'interrogatorio': 'Modo Interrogatorio',
      'pista-visual': 'Pista Visual'
    };
    
    return restrictions[restrictionId as keyof typeof restrictions] || restrictionId;
  };
  
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
      case 'purple': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const handleStartGame = () => {
    // Mostrar alert con la configuración completa
    if (gameConfig) {
      const rolesText = gameConfig.selectedRoles?.length > 0 
        ? rolesData.roles
            .filter(role => gameConfig.selectedRoles.includes(role.id))
            .map(role => `• ${role.name}`)
            .join('\n')
        : 'Ninguno';
      
      alert(`🎮 ¡Partida Configurada! 🎮

👥 Jugadores: ${gameConfig.players}
🎭 Impostores máximos: ${gameConfig.maxImpostors}

🎯 Roles Especiales:
${rolesText}

🔒 Restricción: ${getRestrictionName(gameConfig.selectedRestriction || 'Ninguna')}

¡Que comience el juego! 🕵️`);
      
      // Aquí normalmente redirigirías a la página del juego
      // window.location.href = '/jugar/partida';
    }
  };
  
  const handleEditStep = (stepNumber: number) => {
    if (window.updateStep) {
      window.updateStep(stepNumber);
    }
  };
  
  if (!gameConfig) {
    return (
      <div class="bg-white rounded-2xl p-8 shadow-xl">
        <div class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">Cargando configuración...</h3>
          <p class="text-gray-500">Preparando el resumen de tu partida</p>
        </div>
      </div>
    );
  }
  
  return (
    <div class="bg-white rounded-2xl p-8 shadow-xl">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Resumen de la Partida</h2>
      <p class="text-gray-600 mb-8">
        Revisa toda la configuración antes de comenzar. ¡Todo está listo para jugar!
      </p>
      
      {/* Tarjeta principal de resumen */}
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold text-gray-800">Partida #{Math.floor(Math.random() * 1000)}</h3>
            <p class="text-gray-600 text-sm">Configuración personalizada</p>
          </div>
        </div>
        
        {/* Grid de resumen */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summaryItems.map((item, index) => (
            <div 
              key={index}
              class="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleEditStep(index + 1)}
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center">
                  <span class="text-xl mr-2">{item.icon}</span>
                  <h4 class="font-semibold text-gray-800">{item.label}</h4>
                </div>
              </div>
              <p class="text-gray-600 text-sm">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Lista de roles seleccionados */}
      {gameConfig.selectedRoles && gameConfig.selectedRoles.length > 0 && !gameConfig.autoAssignRoles && (
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Roles Activados</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rolesData.roles
              .filter(role => gameConfig.selectedRoles.includes(role.id))
              .map(role => (
                <div key={role.id} class="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      {role.icon && <span class="text-lg mr-2">{role.icon}</span>}
                      <h4 class="font-medium text-gray-800">{role.name}</h4>
                    </div>
                    <span class={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      role.type === 'civil' ? 'bg-blue-100 text-blue-800' :
                      role.type === 'impostor' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {role.type === 'civil' ? 'Civil' : 
                       role.type === 'impostor' ? 'Impostor' : 'Neutral'}
                    </span>
                  </div>
                  <p class="text-xs text-gray-600 mt-2">{role.description}</p>
                </div>
              ))}
          </div>
        </div>
      )}
      
      {/* Instrucciones finales */}
      <div class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8">
        <div class="flex items-start">
          <div class="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-green-800 mb-2">¡Todo listo para jugar!</h3>
            <ul class="text-green-700 text-sm space-y-2">
              <li class="flex items-start">
                <span class="font-bold mr-2">1.</span>
                <span>El moderador recibirá las palabras secretas y las repartirá</span>
              </li>
              <li class="flex items-start">
                <span class="font-bold mr-2">2.</span>
                <span>Los jugadores con roles especiales recibirán instrucciones adicionales</span>
              </li>
              <li class="flex items-start">
                <span class="font-bold mr-2">3.</span>
                <span>Recuerda explicar las reglas especiales y restricciones a todos</span>
              </li>
              <li class="flex items-start">
                <span class="font-bold mr-2">4.</span>
                <span>¡Diviértete y buena suerte descubriendo al impostor!</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
    </div>
  );
}

declare global {
  interface Window {
    updateStep?: (step: number) => void;
  }
}