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
  playerNames?: string[]; // Agregar esta propiedad
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
            players: 6,
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
            restrictionsEnabled: true,
            playerNames: ["Ana", "Carlos", "Marta", "David", "Laura", "Pedro"] // Nombres por defecto
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
          players: config.players || (config.playerNames ? config.playerNames.length : 6),
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
          restrictionsEnabled: config.restrictionsEnabled !== undefined ? config.restrictionsEnabled : true,
          playerNames: config.playerNames || generateDefaultNames(config.players || 6)
        };
        
        setGameConfig(completeConfig);
        generateSummary(completeConfig);
        
      } catch (error) {
        console.error('Error al cargar configuración:', error);
        // Configuración por defecto completa en caso de error
        const defaultConfig: GameConfig = {
          players: 6,
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
          restrictionsEnabled: true,
          playerNames: ["Ana", "Carlos", "Marta", "David", "Laura", "Pedro"]
        };
        setGameConfig(defaultConfig);
        generateSummary(defaultConfig);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConfig();
  }, []);
  
  // Generar nombres por defecto según la cantidad de jugadores
  const generateDefaultNames = (playerCount: number): string[] => {
    const defaultNames = [
      "Ana", "Carlos", "Marta", "David", "Laura", "Pedro", 
      "Sofía", "Javier", "Elena", "Miguel", "Lucía", "Pablo",
      "Clara", "Diego", "Raquel", "Álvaro"
    ];
    
    return defaultNames.slice(0, playerCount);
  };
  
  // Formatear la lista de jugadores
  const formatPlayerList = (players: string[]): string => {
    if (!players || players.length === 0) {
      return "Sin jugadores";
    }
    
    const validPlayers = players.filter(name => name && name.trim() !== '');
    
    if (validPlayers.length <= 5) {
      // Mostrar todos los nombres
      return validPlayers.join(', ');
    } else {
      // Mostrar primeros 5 y agregar "..."
      const firstFive = validPlayers.slice(0, 5);
      return `${firstFive.join(', ')}...`;
    }
  };
  
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
    
    const playerCount = config.playerNames ? config.playerNames.length : config.players;
    const playerList = config.playerNames ? formatPlayerList(config.playerNames) : `${playerCount} jugadores`;
    
    const items: SummaryItem[] = [
      {
        label: 'Jugadores',
        value: playerList,
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
      
      const playerList = gameConfig.playerNames 
        ? gameConfig.playerNames.filter(name => name && name.trim() !== '').join(', ')
        : `${gameConfig.players} jugadores`;
      
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
      
      {/* Sección de jugadores con nombres */}
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Lista de Jugadores ({gameConfig.playerNames?.length || gameConfig.players})</h3>
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
          <div class="flex flex-wrap gap-3">
            {gameConfig.playerNames && gameConfig.playerNames
              .filter(name => name && name.trim() !== '')
              .slice(0, 5) // Mostrar solo los primeros 5
              .map((name, index) => (
                <div key={index} class="flex items-center bg-white border border-blue-200 rounded-xl px-4 py-3 shadow-sm">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span class="text-blue-600 font-medium">{index + 1}</span>
                  </div>
                  <span class="font-medium text-gray-800">{name}</span>
                </div>
              ))}
            
            {/* Mostrar "..." si hay más de 5 jugadores */}
            {gameConfig.playerNames && gameConfig.playerNames.filter(name => name && name.trim() !== '').length > 5 && (
              <div class="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <span class="text-gray-500 font-medium">+</span>
                </div>
                <span class="font-medium text-gray-600">
                  y {gameConfig.playerNames.filter(name => name && name.trim() !== '').length - 5} más...
                </span>
              </div>
            )}
            
            {/* Mensaje si no hay nombres */}
            {(!gameConfig.playerNames || gameConfig.playerNames.length === 0) && (
              <div class="text-center w-full py-4">
                <p class="text-gray-500">No se han especificado nombres de jugadores</p>
              </div>
            )}
          </div>
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
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      
      <style>
        {`
          .player-card {
            transition: all 0.3s ease;
          }
          
          .player-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          }
        `}
      </style>
    </div>
  );
}

declare global {
  interface Window {
    updateStep?: (step: number) => void;
  }
}