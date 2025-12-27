import { useEffect, useState } from 'preact/hooks';
import ImpostorGame from "../../models/Impostor";
import GameConfig from './GameConfig';
import GameFinished from './GameFinished';
import GamePlaying from './GamePlaying';
import GameVoting from './GameVoting';
import type { PlayerInfo } from './types';

interface Category {
  id: string;
  name: string;
  type: 'single' | 'mixed';
  words: string[];
  pairs?: Array<{word: string, related: string}>;
  createdAt: string;
  lastUsed: string;
  count: number;
}

interface GameConfigData {
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
  playerNames?: string[];
  selectedCategories?: string[];
}

export default function InsertGames() {
  // Estados para la configuración
  const [game, setGame] = useState<ImpostorGame | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  
  // Estados reactivos del juego
  const [currentPlayer, setCurrentPlayer] = useState<string>('');
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [gameState, setGameState] = useState<'config' | 'ready' | 'playing' | 'voting' | 'finished'>('config');
  const [round, setRound] = useState<number>(game?.round || 0);
  const [message, setMessage] = useState<string>('Juego listo para comenzar');
  const [showRole, setShowRole] = useState<boolean>(false);
  const [eliminatedPlayers, setEliminatedPlayers] = useState<string[]>([]);
  const [roundInfo, setRoundInfo] = useState<{
    category?: string;
    palabraTripulante: string;
    palabraImpostor: string;
    roundImpostors?: string[];
  }>({
    palabraTripulante: '',
    palabraImpostor: ''
  });
  
  // Estados para el componente GameVoting
  const [playerToEliminate, setPlayerToEliminate] = useState<string | null>(null);
  const [votingResult, setVotingResult] = useState<{
    eliminatedPlayer: string | null;
    isImpostor: boolean;
  }>({
    eliminatedPlayer: null,
    isImpostor: false
  });
  
  // Historial de impostores
  const [allImpostorsHistory, setAllImpostorsHistory] = useState<Array<{
    round: number;
    impostors: string[];
    palabraTripulante: string;
    palabraImpostor: string;
    category?: string;
  }>>([]);

  // Cargar configuración desde localStorage
  useEffect(() => {
    const loadGameConfig = () => {
      try {
        setIsLoading(true);
        
        if (typeof window === 'undefined') {
          setConfigError("No se puede acceder a localStorage");
          setIsLoading(false);
          return;
        }

        const savedConfig = localStorage.getItem('impostorGameConfig');
        
        if (!savedConfig) {
          setConfigError("No hay configuración guardada. Por favor, configura el juego primero.");
          setIsLoading(false);
          return;
        }

        const config: GameConfigData = JSON.parse(savedConfig);
        console.log('Configuración cargada del localStorage:', config);

        // Validar que haya jugadores
        if (!config.playerNames || !Array.isArray(config.playerNames) || config.playerNames.length === 0) {
          setConfigError("Configuración inválida: No hay jugadores definidos. Por favor, agrega los nombres de los jugadores.");
          setIsLoading(false);
          return;
        }

        // Filtrar nombres vacíos
        const validPlayers = config.playerNames.filter((name: string) => 
          name && typeof name === 'string' && name.trim() !== ''
        );

        if (validPlayers.length < 3) {
          setConfigError(`Se necesitan al menos 3 jugadores. Solo hay ${validPlayers.length} jugadores válidos.`);
          setIsLoading(false);
          return;
        }

        // Validar impostores
        const impostorCount = config.maxImpostors || 1;
        const maxAllowedImpostors = validPlayers.length >= 9 ? 3 : 
                                    validPlayers.length >= 6 ? 2 : 1;
        
        if (impostorCount > maxAllowedImpostors) {
          setConfigError(`Demasiados impostores para ${validPlayers.length} jugadores. Máximo permitido: ${maxAllowedImpostors}. Ajusta la configuración.`);
          setIsLoading(false);
          return;
        }

        // Cargar todas las categorías disponibles
        const savedCategories = localStorage.getItem('impostorCategories');
        let allCategories: Category[] = [];
        
        if (savedCategories) {
          try {
            allCategories = JSON.parse(savedCategories);
            console.log(`Todas las categorías cargadas: ${allCategories.length}`);
          } catch (error) {
            console.error('Error al cargar categorías:', error);
          }
        }

        // Filtrar categorías seleccionadas
        let categoriesToUse: Category[] = [];
        if (config.selectedCategories && config.selectedCategories.length > 0) {
          categoriesToUse = allCategories.filter(category => 
            config.selectedCategories?.includes(category.id)
          );
          console.log(`Categorías seleccionadas: ${categoriesToUse.length} de ${allCategories.length}`);
        }

        // Crear el juego con la configuración cargada
        const newGame = new ImpostorGame(
          validPlayers,
          impostorCount,
          config.selectedModes || [],
          config.selectedRestrictions || (config.selectedRestriction ? [config.selectedRestriction] : []),
          categoriesToUse
        );
        
        setGame(newGame);
        
        // Inicializar el juego
        newGame.iniciarJuego({
          players: validPlayers,
          maxImpostors: impostorCount,
          availableModes: config.selectedModes || [],
          restrictions: config.selectedRestrictions || (config.selectedRestriction ? [config.selectedRestriction] : []),
          categories: categoriesToUse
        });
        
        setMessage('¡Juego configurado desde los datos guardados!');
        setGameState('ready');
        setEliminatedPlayers([]);
        setConfigError(null);
        
        // Mostrar debug info
        const estado = newGame.obtenerEstadoCompleto();
        console.log('Estado del juego:', {
          jugadores: estado.players.length,
          categoriasCargadas: estado.categories.length,
          palabrasDisponibles: estado.totalWordsAvailable,
          categorias: estado.categories.map(c => c.name)
        });
        
      } catch (error) {
        console.error('Error al cargar configuración:', error);
        setConfigError("Error al cargar la configuración guardada. Por favor, verifica los datos.");
      } finally {
        setIsLoading(false);
      }
    };

    loadGameConfig();
  }, []);
  
  function comenzarRonda(): void {
    if (!game) return;
    
    const resultado = game.iniciarNuevaRonda();
    setRound(game.round);
    setMessage(resultado.message);
    setGameState('playing');
    setShowRole(false);
    setVotingResult({ eliminatedPlayer: null, isImpostor: false });
    
    // Guardar información de la ronda
    setRoundInfo({
      category: resultado.category,
      palabraTripulante: resultado.palabraTripulante,
      palabraImpostor: resultado.palabraImpostor,
      roundImpostors: resultado.roundImpostors
    });
    
    // Actualizar historial de impostores
    const impostorsInfo = game.obtenerImpostoresRonda();
    setAllImpostorsHistory(prev => [...prev, impostorsInfo]);
    
    const info = game.obtenerInfoJugadorActual();
    setCurrentPlayer(info.player);
    setPlayerInfo(info);
    setEliminatedPlayers([]);
    
    console.log(`Ronda ${game.round} iniciada`);
    console.log(`Categoría: ${resultado.category || 'Aleatoria'}`);
    console.log(`Palabra tripulantes: ${resultado.palabraTripulante}`);
    console.log(`Palabra impostor: ${resultado.palabraImpostor}`);
    console.log(`Impostores: ${resultado.roundImpostors?.join(', ') || 'Ninguno'}`);
  }
  
  function pasarTurno(): void {
    if (!game || gameState !== 'playing') return;
    
    const resultado = game.pasarTurno();
    setShowRole(false);
    
    if (resultado.isRoundComplete) {
      setMessage('¡Ronda completada! Todos han visto sus roles. Iniciando votación...');
      setTimeout(() => {
        setGameState('voting');
      }, 1500);
    } else {
      const info = game.obtenerInfoJugadorActual();
      setCurrentPlayer(info.player);
      setPlayerInfo(info);
      setMessage(`Turno de: ${info.player}`);
    }
  }
  
  function mostrarRol(): void {
    setShowRole(true);
  }
  
  // Función para manejar la eliminación desde GameVoting
  function handleConfirmElimination(jugador: string): void {
    if (!game) return;
    
    const resultado = game.sacarAAlguien(jugador);
    
    // Actualizar lista de eliminados
    setEliminatedPlayers(prev => [...prev, jugador]);
    
    // Guardar resultado para mostrar en GameVoting
    setVotingResult({
      eliminatedPlayer: jugador,
      isImpostor: resultado.wasImpostor
    });
    
    // Verificar victoria
    if (resultado.gameResult) {
      if (resultado.gameResult === 'TRIPULANTES_GANAN') {
        setMessage('🎉 ¡LOS TRIPULANTES GANARON!');
      } else {
        setMessage('😈 ¡LOS IMPOSTORES GANARON!');
      }
      setGameState('finished');
    } else {
      // Si no hay victoria, mostrar resultado de eliminación
      setMessage(`${jugador} ha sido eliminado. ${resultado.wasImpostor ? '¡Era impostor!' : 'No era impostor.'}`);
      
      // Permanecer en estado 'voting' para seguir votando
      // GameVoting mostrará el resultado y permitirá continuar
    }
  }
  
  function iniciarNuevaRonda(): void {
    if (!game) return;
    
    const resultado = game.iniciarNuevaRonda();
    setRound(game.round);
    setMessage(resultado.message);
    setGameState('playing');
    setShowRole(false);
    setVotingResult({ eliminatedPlayer: null, isImpostor: false });
    
    // Actualizar información de la ronda
    setRoundInfo({
      category: resultado.category,
      palabraTripulante: resultado.palabraTripulante,
      palabraImpostor: resultado.palabraImpostor,
      roundImpostors: resultado.roundImpostors
    });
    
    // Actualizar historial de impostores
    const impostorsInfo = game.obtenerImpostoresRonda();
    setAllImpostorsHistory(prev => [...prev, impostorsInfo]);
    
    const info = game.obtenerInfoJugadorActual();
    setCurrentPlayer(info.player);
    setPlayerInfo(info);
    setEliminatedPlayers([]);
    
    console.log(`Nueva ronda ${game.round}: ${resultado.category || 'Aleatoria'}`);
  }
  
  function reiniciarJuegoCompleto(): void {
    if (!game) return;
    
    game.reiniciarJuego();
    setGameState('config');
    setRound(0);
    setCurrentPlayer('');
    setPlayerInfo(null);
    setMessage('Juego listo para comenzar');
    setShowRole(false);
    setEliminatedPlayers([]);
    setVotingResult({ eliminatedPlayer: null, isImpostor: false });
    setRoundInfo({
      palabraTripulante: '',
      palabraImpostor: ''
    });
    setAllImpostorsHistory([]);
    
    // Recargar configuración desde localStorage
    const savedConfig = localStorage.getItem('impostorGameConfig');
    if (savedConfig) {
      try {
        const config: GameConfigData = JSON.parse(savedConfig);
        const validPlayers = config.playerNames?.filter(name => name && name.trim() !== '') || [];
        
        if (validPlayers.length >= 3) {
          // Cargar todas las categorías disponibles
          const savedCategories = localStorage.getItem('impostorCategories');
          let allCategories: Category[] = [];
          
          if (savedCategories) {
            allCategories = JSON.parse(savedCategories);
          }
          
          // Filtrar categorías seleccionadas
          let categoriesToUse: Category[] = [];
          if (config.selectedCategories && config.selectedCategories.length > 0) {
            categoriesToUse = allCategories.filter(category => 
              config.selectedCategories?.includes(category.id)
            );
          }
          
          const newGame = new ImpostorGame(
            validPlayers,
            config.maxImpostors || 1,
            config.selectedModes || [],
            config.selectedRestrictions || (config.selectedRestriction ? [config.selectedRestriction] : []),
            categoriesToUse
          );
          
          setGame(newGame);
          newGame.iniciarJuego({
            players: validPlayers,
            maxImpostors: config.maxImpostors || 1,
            availableModes: config.selectedModes || [],
            restrictions: config.selectedRestrictions || (config.selectedRestriction ? [config.selectedRestriction] : []),
            categories: categoriesToUse
          });
          
          setMessage('¡Juego reiniciado con configuración guardada!');
          setGameState('ready');
        }
      } catch (error) {
        console.error('Error al recargar configuración:', error);
      }
    }
  }
  
  // Función para reiniciar votación (después de mostrar resultados)
  function reiniciarVotacion(): void {
    setVotingResult({ eliminatedPlayer: null, isImpostor: false });
    setMessage('Continuando votación...');
    // El estado sigue siendo 'voting', solo se limpia el resultado
  }
  
  // Función para continuar después de mostrar resultados de eliminación
  function continuarDespuesDeEliminacion(): void {
    if (votingResult.eliminatedPlayer) {
      // Si eliminamos a alguien, reiniciamos la votación para continuar
      reiniciarVotacion();
    }
  }
  
  // Estado de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Cargando configuración...</h3>
            <p className="text-gray-400">Buscando datos del juego en localStorage</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Estado de error
  if (configError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-red-700/50 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Error en la configuración</h3>
            <p className="text-red-300 mb-6">{configError}</p>
            <div className="space-y-4">
              <button
                onClick={() => window.location.href = '/configurar'}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300"
              >
                🎮 Ir a Configurar Juego
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('impostorGameConfig');
                  localStorage.removeItem('impostorCategories');
                  window.location.reload();
                }}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300"
              >
                🗑️ Borrar Configuración y Reiniciar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Si no hay juego configurado aún
  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-yellow-700/50 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Esperando configuración</h3>
            <p className="text-yellow-300 mb-6">No hay juego configurado aún</p>
            <button
              onClick={() => window.location.href = '/configurar'}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300"
            >
              🎮 Ir a Configurar Juego
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Obtener estado actual del juego
  const estado = game.obtenerEstadoCompleto();
  const jugadoresActivos = estado.players.filter(j => !eliminatedPlayers.includes(j));
  
  // Renderizado condicional según estado del juego
  switch (gameState) {
    case 'config':
    case 'ready':
      return (
        <GameConfig
          game={game}
          round={round}
          eliminatedPlayers={eliminatedPlayers}
          estado={estado}
          onStartRound={comenzarRonda}
          roundInfo={roundInfo}
        />
      );
      
    case 'playing':
      return (
        <GamePlaying
          round={round}
          currentPlayer={currentPlayer}
          playerInfo={playerInfo}
          game={game}
          showRole={showRole}
          onShowRole={mostrarRol}
          onPassTurn={pasarTurno}
          roundInfo={roundInfo}
        />
      );
      
    case 'voting':
      return (
        <GameVoting
          round={round}
          message={message}
          jugadoresActivos={jugadoresActivos}
          eliminatedPlayers={eliminatedPlayers}
          onConfirmElimination={handleConfirmElimination}
          currentVoter={jugadoresActivos[0]} // Primer jugador activo comienza votando
          votingResult={votingResult}
          onContinueAfterResult={continuarDespuesDeEliminacion}
        />
      );
      
    case 'finished':
      const ganaronTripulantes = message.includes('TRIPULANTES');
      return (
        <GameFinished
          round={round}
          message={message}
          ganaronTripulantes={ganaronTripulantes}
          game={game}
          estado={estado}
          eliminatedPlayers={eliminatedPlayers}
          onNewRound={iniciarNuevaRonda}
          onRestart={reiniciarJuegoCompleto}
          allImpostorsHistory={allImpostorsHistory}
        />
      );
      
    default:
      return null;
  }
}