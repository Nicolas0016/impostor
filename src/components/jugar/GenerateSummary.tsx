import { useEffect, useState } from 'preact/hooks';
import rolesData from '../../data/roleSelector.json';

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
  difficulty?: string;
  selectedRestrictions?: string[];
  restrictionsEnabled?: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  
  // Cargar configuración del localStorage solo en el cliente
  useEffect(() => {
    const loadConfig = () => {
      try {
        // Verificar si estamos en el navegador
        if (typeof window === 'undefined') {
          console.log('No estamos en el navegador (SSR)');
          setIsLoading(false);
          return;
        }
        
        console.log('Buscando configuración en localStorage...');
        const savedConfig = localStorage.getItem('impostorGameConfig');
        
        if (!savedConfig) {
          console.warn('No se encontró configuración en localStorage');
          // Configuración por defecto completa
          const defaultConfig: GameConfig = {
            players: 9,
            maxImpostors: 2,
            selectedModes: ["guerra-civil", "bufon", "turista", "fuego-rapido"],
            selectedRoles: ["ciego", "mediador", "anarquista", "lider", "mudo"],
            selectedRestriction: "una-silaba",
            difficulty: "media",
            showTutorial: false,
            timePerRound: 60,
            randomMode: false,
            autoAssignRoles: false,
            maxRoles: 5,
            selectedRestrictions: [],
            restrictionsEnabled: true
          };
          
          console.log('Usando configuración por defecto:', defaultConfig);
          setGameConfig(defaultConfig);
          generateSummary(defaultConfig);
          setIsLoading(false);
          return;
        }
        
        console.log('Configuración encontrada en localStorage:', savedConfig);
        const config: GameConfig = JSON.parse(savedConfig);
        console.log('Configuración parseada:', config);
        
        // Asegurarse de que todas las propiedades tengan valores por defecto
        const completeConfig: GameConfig = {
          players: config.players || 9,
          maxImpostors: config.maxImpostors || 2,
          selectedModes: config.selectedModes || [],
          selectedRoles: config.selectedRoles || [],
          selectedRestriction: config.selectedRestriction || null,
          showTutorial: config.showTutorial || false,
          timePerRound: config.timePerRound || 60,
          randomMode: config.randomMode || false,
          autoAssignRoles: config.autoAssignRoles || false,
          maxRoles: config.maxRoles || 5,
          difficulty: config.difficulty || "media",
          selectedRestrictions: config.selectedRestrictions || [],
          restrictionsEnabled: config.restrictionsEnabled !== undefined ? config.restrictionsEnabled : true
        };
        
        setGameConfig(completeConfig);
        generateSummary(completeConfig);
        
      } catch (error) {
        console.error('Error al cargar configuración:', error);
        // Configuración por defecto completa en caso de error
        const defaultConfig: GameConfig = {
          players: 9,
          maxImpostors: 2,
          selectedModes: [],
          selectedRoles: [],
          selectedRestriction: null,
          showTutorial: false,
          timePerRound: 60,
          randomMode: false,
          autoAssignRoles: false,
          maxRoles: 5,
          difficulty: "media",
          selectedRestrictions: [],
          restrictionsEnabled: true
        };
        setGameConfig(defaultConfig);
        generateSummary(defaultConfig);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConfig();
  }, []);
  
  const getModeName = (modeId: string) => {
    const modes: Record<string, string> = {
      'guerra-civil': 'Guerra Civil',
      'bufon': 'Bufón',
      'turista': 'Turista',
      'fuego-rapido': 'Fuego Rápido'
    };
    return modes[modeId] || modeId;
  };
  
  const generateSummary = (config: GameConfig) => {
    console.log('Generando resumen para:', config);
    
    const items: SummaryItem[] = [
      {
        label: 'Jugadores',
        value: `${config.players} jugador${config.players > 1 ? 'es' : ''}`,
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
          : config.selectedModes && config.selectedModes.length > 0 
            ? `${config.selectedModes.length} modalidad${config.selectedModes.length > 1 ? 'es' : ''}: ${config.selectedModes.slice(0, 2).map(getModeName).join(', ')}${config.selectedModes.length > 2 ? '...' : ''}`
            : 'Sin modalidades especiales',
        icon: '🎮',
        color: 'purple'
      },
      {
        label: 'Roles Especiales',
        value: config.autoAssignRoles 
          ? `Asignación automática (${config.maxRoles || 3} roles)`
          : config.selectedRoles && config.selectedRoles.length > 0 
            ? `${config.selectedRoles.length} rol${config.selectedRoles.length > 1 ? 'es' : ''} activo${config.selectedRoles.length > 1 ? 's' : ''}`
            : 'Sin roles especiales',
        icon: '🃏',
        color: 'green'
      },
      {
        label: 'Restricción',
        value: config.selectedRestriction 
          ? getRestrictionName(config.selectedRestriction)
          : config.selectedRestrictions && config.selectedRestrictions.length > 0
            ? `${config.selectedRestrictions.length} restricción${config.selectedRestrictions.length > 1 ? 'es' : ''}`
            : 'Sin restricción especial',
        icon: '🔒',
        color: 'yellow'
      }
    ];
    
    console.log('Items generados:', items);
    setSummaryItems(items);
  };
  
  const getRestrictionName = (restrictionId: string) => {
    const restrictions: Record<string, string> = {
      'mimo': 'Modo Mimo',
      'una-silaba': 'Modo "Una Sílaba"',
      'interrogatorio': 'Modo Interrogatorio',
      'pista-visual': 'Pista Visual'
    };
    
    return restrictions[restrictionId] || restrictionId;
  };
  
  const handleStartGame = () => {
    if (gameConfig) {
      console.log('Iniciando juego con configuración:', gameConfig);
      
      const rolesText = gameConfig.selectedRoles && gameConfig.selectedRoles.length > 0 
        ? rolesData.roles
            .filter(role => gameConfig.selectedRoles.includes(role.id))
            .map(role => `• ${role.name}: ${role.description}`)
            .join('\n')
        : 'Ninguno';
      
      const modesText = gameConfig.selectedModes && gameConfig.selectedModes.length > 0
        ? gameConfig.selectedModes.map(getModeName).join(', ')
        : 'Ninguna';
      
      const restrictionText = gameConfig.selectedRestriction 
        ? getRestrictionName(gameConfig.selectedRestriction)
        : gameConfig.selectedRestrictions && gameConfig.selectedRestrictions.length > 0
          ? gameConfig.selectedRestrictions.map(getRestrictionName).join(', ')
          : 'Ninguna';
      
      alert(`🎮 ¡Partida Configurada! 🎮

👥 Jugadores: ${gameConfig.players}
🎭 Impostores máximos: ${gameConfig.maxImpostors}
📊 Dificultad: ${gameConfig.difficulty || 'media'}

🎯 Modalidades activadas:
${modesText}

🃏 Roles Especiales:
${rolesText}

🔒 Restricción: ${restrictionText}

⏱️ Tiempo por ronda: ${gameConfig.timePerRound} segundos

¡Que comience el juego! 🕵️`);
    }
  };
  
  const handleEditStep = (stepNumber: number) => {
    if (typeof window !== 'undefined' && window.updateStep) {
      window.updateStep(stepNumber);
    }
  };
  
  // Estado de carga
  if (isLoading) {
    return (
      <div class="bg-white rounded-2xl p-8 shadow-xl">
        <div class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">Cargando configuración...</h3>
          <p class="text-gray-500">Buscando datos guardados</p>
        </div>
      </div>
    );
  }
  
  // Estado cuando no hay configuración
  if (!gameConfig) {
    return (
      <div class="bg-white rounded-2xl p-8 shadow-xl">
        <div class="text-center py-12">
          <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">No hay configuración guardada</h3>
          <p class="text-gray-500 mb-6">Configura tu partida primero</p>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/configurar';
              }
            }}
            class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Ir a Configuración
          </button>
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
      
      {/* Botón de debug para probar */}
      <div class="mb-4">
        <button 
          onClick={() => {
            console.log('Configuración actual:', gameConfig);
            console.log('LocalStorage:', localStorage.getItem('impostorGameConfig'));
            alert('Datos de consola mostrados. Revisa la consola del navegador.');
          }}
          class="text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded-lg"
        >
          🔍 Ver datos en consola
        </button>
      </div>
      
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
      
      {/* Detalles de modalidades */}
      {gameConfig.selectedModes && gameConfig.selectedModes.length > 0 && (
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Modalidades Activas</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            {gameConfig.selectedModes.map((modeId, index) => (
              <div key={index} class="bg-purple-50 border border-purple-200 rounded-xl p-3">
                <div class="flex items-center">
                  <span class="text-lg mr-2">🎮</span>
                  <h4 class="font-medium text-purple-800">{getModeName(modeId)}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Lista de roles seleccionados */}
      {gameConfig.selectedRoles && gameConfig.selectedRoles.length > 0 && !gameConfig.autoAssignRoles && (
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Roles Activados ({gameConfig.selectedRoles.length})</h3>
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