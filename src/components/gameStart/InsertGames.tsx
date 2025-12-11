import { useEffect, useState } from 'preact/hooks';
import ImpostorGame from "../../models/Impostor";

export default function InsertGames() {
  // Inicializar el juego
  const [game] = useState(() => new ImpostorGame(
    ['Juan', 'María', 'Pedro', 'Ana', 'Luis', 'Sofía'],
    3,
    ['clasico', 'turista', 'bufon'],
    ['modo_mimo', 'sin_repetir_letra']
  ));
  
  // Estados reactivos
  const [currentPlayer, setCurrentPlayer] = useState('');
  const [playerInfo, setPlayerInfo] = useState(null);
  const [gameState, setGameState] = useState('config');
  const [round, setRound] = useState(0);
  const [message, setMessage] = useState('Juego listo para comenzar');
  const [showRole, setShowRole] = useState(false);
  const [eliminatedPlayers, setEliminatedPlayers] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [playerToEliminate, setPlayerToEliminate] = useState(null);
  
  // Inicializar el juego
  useEffect(() => {
    iniciarJuego();
  }, []);
  
  function iniciarJuego() {
    game.iniciarJuego({
      players: ['Juan', 'María', 'Pedro', 'Ana', 'Luis', 'Sofía'],
      maxImpostors: 3,
      availableModes: ['clasico', 'turista', 'bufon'],
      restrictions: ['modo_mimo', 'sin_repetir_letra']
    });
    
    setMessage('¡Juego configurado!');
    setGameState('ready');
    setEliminatedPlayers([]);
  }
  
  function comenzarRonda() {
    const palabras = ['manzana', 'computadora', 'playa', 'montaña', 'libro', 'música'];
    const palabraAleatoria = palabras[Math.floor(Math.random() * palabras.length)];
    
    const resultado = game.iniciarNuevaRonda(palabraAleatoria);
    setRound(game.round);
    setMessage(resultado.message);
    setGameState('playing');
    setShowRole(false);
    
    const info = game.obtenerInfoJugadorActual();
    setCurrentPlayer(info.player);
    setPlayerInfo(info);
    setCurrentPlayer
    setEliminatedPlayers([]);
  }
  
  function pasarTurno() {
    if (gameState !== 'playing') return;
    
    const resultado = game.pasarTurno();
    setShowRole(false);
    
    if (resultado.isRoundComplete) {
      setMessage('¡Ronda completada! Todos han visto sus roles.');
      setGameState('voting');
    } else {
      const info = game.obtenerInfoJugadorActual();
      setCurrentPlayer(info.player);
      setPlayerInfo(info);
      setMessage(`Turno de: ${info.player}`);
    }
  }
  
  function mostrarRol() {
    setShowRole(true);
  }
  
  function confirmarEliminacion(jugador) {
    setPlayerToEliminate(jugador);
    setShowConfirmModal(true);
  }
  
  function eliminarJugador() {
    if (!playerToEliminate) return;
    
    const resultado = game.sacarAAlguien(playerToEliminate);
    
    // Actualizar lista de eliminados
    setEliminatedPlayers(prev => [...prev, playerToEliminate]);
    
    // Cerrar modal
    setShowConfirmModal(false);
    setPlayerToEliminate(null);
    
    // Verificar victoria
    if (resultado.gameResult) {
      if (resultado.gameResult === 'TRIPULANTES_GANAN') {
        setMessage('🎉 ¡LOS TRIPULANTES GANARON!');
      } else {
        setMessage('😈 ¡LOS IMPOSTORES GANARON!');
      }
      setGameState('finished');
    } else {
      // Si no hay victoria, mantenerse en estado 'voting' para seguir eliminando
      const eraImpostor = resultado.wasImpostor;
      setMessage(`${playerToEliminate} ha sido eliminado. ${eraImpostor ? '¡Era impostor!' : 'No era impostor.'} Sigan votando.`);
      setGameState('voting');
    }
  }
  
  function cancelarEliminacion() {
    setShowConfirmModal(false);
    setPlayerToEliminate(null);
  }
  
  function verificarVictoriaDirecta() {
    // Usar el método de la clase para verificar
    const estado = game.obtenerEstadoCompleto();
    
    if (estado.impostors.length === 0) {
      setMessage('🎉 ¡LOS TRIPULANTES GANARON!');
      setGameState('finished');
      return true;
    }
    
    const tripulantesCount = estado.players.length - estado.impostors.length;
    if (estado.impostors.length >= tripulantesCount) {
      setMessage('😈 ¡LOS IMPOSTORES GANARON!');
      setGameState('finished');
      return true;
    }
    
    return false;
  }
  
  function iniciarNuevaRonda() {
    const palabras = ['manzana', 'computadora', 'playa', 'montaña', 'libro', 'música'];
    const palabraAleatoria = palabras[Math.floor(Math.random() * palabras.length)];
    
    // NO resetear eliminatedPlayers - los jugadores eliminados permanecen eliminados
    // La clase ya maneja esto internamente
    
    const resultado = game.iniciarNuevaRonda(palabraAleatoria);
    setRound(game.round);
    setMessage(resultado.message);
    setGameState('playing');
    setShowRole(false);
    
    const info = game.obtenerInfoJugadorActual();
    setCurrentPlayer(info.player);
    setPlayerInfo(info);
    setEliminatedPlayers([]);
  }
  
  function reiniciarJuegoCompleto() {
    game.reiniciarJuego();
    setGameState('config');
    setRound(0);
    setCurrentPlayer('');
    setPlayerInfo(null);
    setMessage('Juego listo para comenzar');
    setShowRole(false);
    setEliminatedPlayers([]);
    setShowConfirmModal(false);
    setPlayerToEliminate(null);
  }
  
  // Obtener estado actual del juego
  const estado = game.obtenerEstadoCompleto();
  const jugadoresActivos = estado.players.filter(j => !eliminatedPlayers.includes(j));
  
  // Modal de confirmación
  if (showConfirmModal) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-red-700/50">
          <h2 className="text-2xl font-bold text-white mb-4">⚠️ Confirmar Eliminación</h2>
          
          <div className="bg-red-900/20 p-4 rounded-lg mb-6 border border-red-700/30">
            <p className="text-center text-lg">
              <span className="text-red-400 font-bold">{playerToEliminate}</span>
            </p>
            <p className="text-gray-300 text-center mt-2">
              ¿Estás seguro de que quieres eliminar a este jugador?
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={cancelarEliminacion}
              className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={eliminarJugador}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-4 rounded-lg transition-all font-bold"
            >
              Sí, Eliminar
            </button>
          </div>
          
          <div className="mt-4 text-center text-gray-400 text-sm">
            <p>Esta acción no se puede deshacer</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Renderizado condicional según estado del juego
  if (gameState === 'config' || gameState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          
          <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">Configuración del Juego</h2>
            
            <div className="space-y-4 mb-6">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">👥 Jugadores</h3>
                <div className="flex flex-wrap gap-2">
                  {estado.players.map((jugador, index) => (
                    <span key={index} className={`${eliminatedPlayers.includes(jugador) ? 'bg-red-900/50 line-through' : 'bg-gray-600'} text-white px-3 py-1 rounded-full text-sm`}>
                      {jugador}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-400 mb-1">😈 Impostores</h3>
                  <p className="text-2xl font-bold text-white">{game.maxImpostors} máx</p>
                </div>
                
                <div className="bg-gray-700 px-2 rounded-lg flex items-center gap-4">
                  <h3 className="text-lg font-semibold text-green-400">📊 Ronda</h3>
                  <p className="text-2xl font-bold text-white">{round}</p>
                </div>
              </div>
              
              {eliminatedPlayers.length > 0 && (
                <div className="bg-red-900/30 p-4 rounded-lg border border-red-700/50">
                  <h3 className="text-lg font-semibold text-red-300 mb-2">💀 Eliminados</h3>
                  <div className="flex flex-wrap gap-2">
                    {eliminatedPlayers.map((jugador, index) => (
                      <span key={index} className="bg-red-800 text-red-100 px-3 py-1 rounded-full text-sm">
                        {jugador}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={comenzarRonda}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              🎯 Comenzar Ronda {round + 1}
            </button>
            
          </div>
          
          <div className="mt-6 text-center text-gray-500 text-sm">
            <p>{estado.players.length} jugadores • {game.maxImpostors} impostores máx.</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (gameState === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-block bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full mb-2">
              <span className="text-gray-400">Ronda</span>
              <span className="text-white font-bold ml-2 text-xl">{round}</span>
            </div>
            <p className="text-gray-400">Pasa el dispositivo al jugador indicado</p>
          </div>
          
          {/* Jugador Actual */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-6 text-center shadow-2xl transform transition-all duration-300 hover:shadow-purple-500/20">
            <div className="mb-4">
              <h2 className="text-4xl font-bold text-white mt-2">{currentPlayer}</h2>
            </div>
            
            {!showRole ? (
              <button
                onClick={mostrarRol}
                className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/30 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-lg"
              >
                👁️ Ver mi Palabra
              </button>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                {/* Información del Rol */}
                {playerInfo?.role === 'impostor' ? 
                  <div className="p-6 rounded-xl bg-red-900/40 border-2 border-red-500/50">
                    <h3 className="text-lg font-semibold text-gray-300 mb-3">Tu Palabra</h3>
                    <div className="text-4xl font-bold text-red-400 font-mono tracking-wider">
                      IMPOSTOR
                    </div>
                    <p className="text-red-300 text-sm mt-2">
                      Eres el impostor. ¡No dejes que te descubran!
                    </p>
                  </div>
                : 
                  <div className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-300 mb-3">Tu Palabra</h3>
                    <div className="text-4xl font-bold text-white font-mono tracking-wider">
                      {game.secretWord}
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                      Eres tripulante. ¡Encuentra al impostor!
                    </p>
                  </div>
                }
                
                {/* Botón para pasar turno */}
                <button
                  onClick={pasarTurno}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-lg shadow-lg"
                >
                  ▶️ Pasar Turno
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
    );
  }
  
  if (gameState === 'voting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-red-500 mb-2">🗳️ VOTACIÓN</h1>
            <p className="text-gray-400">Elimina al jugador más sospechoso</p>
            <div className="inline-block bg-gray-800/50 px-3 py-1 rounded-full mt-2">
              <span className="text-gray-400">Ronda</span>
              <span className="text-white font-bold ml-2">{round}</span>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700 mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">Selecciona al jugador a eliminar:</h2>
            
            <div className="space-y-3">
              {jugadoresActivos.map((jugador) => (
                <button
                  key={jugador}
                  onClick={() => confirmarEliminacion(jugador)}
                  className="w-full bg-gradient-to-r from-red-900/40 to-red-800/30 hover:from-red-800 hover:to-red-700 text-white p-4 rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border border-red-900/50 hover:border-red-700 flex items-center justify-between group"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mr-3 group-hover:bg-red-500">
                      <span className="text-xl">👤</span>
                    </div>
                    <span className="text-lg font-semibold">{jugador}</span>
                  </div>
                  <span className="text-red-400 group-hover:text-red-300">❌ Votar</span>
                </button>
              ))}
            </div>
            
            {eliminatedPlayers.length > 0 && (
              <div className="mt-4 p-3 bg-red-900/20 rounded-lg border border-red-800/30">
                <h4 className="text-red-300 text-sm font-semibold mb-2">💀 Jugadores eliminados:</h4>
                <div className="flex flex-wrap gap-2">
                  {eliminatedPlayers.map((jugador, index) => (
                    <span key={index} className="bg-red-800/40 text-red-200 px-2 py-1 rounded-full text-xs">
                      {jugador}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
              <p className="text-gray-400 text-sm text-center">
                Si eliminas a un impostor, la ronda continúa.
              </p>
              <p className="text-gray-400 text-sm text-center mt-1">
                Si eliminas a un tripulante, la ronda también continúa hasta que alguien gane.
              </p>
            </div>
          </div>
          
          {/* Mensaje */}
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-4">
            <p className="text-yellow-400 text-center">{message}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (gameState === 'finished') {
    const ganaronTripulantes = message.includes('TRIPULANTES');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">
              {ganaronTripulantes ? '🏆' : '😈'}
            </div>
            <h1 className={`text-4xl font-bold mb-4 ${ganaronTripulantes ? 'text-green-400' : 'text-red-400'}`}>
              {ganaronTripulantes ? '¡TRIPULANTES GANAN!' : '¡IMPOSTORES GANAN!'}
            </h1>
            <p className="text-gray-400">La ronda ha terminado</p>
            <div className="inline-block bg-gray-800/50 px-3 py-1 rounded-full mt-2">
              <span className="text-gray-400">Ronda final</span>
              <span className="text-white font-bold ml-2">{round}</span>
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 mb-6">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Resumen de la Ronda</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Palabra secreta</p>
                  <p className="text-xl font-bold text-white font-mono mt-1">{game.secretWord}</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Rondas jugadas</p>
                  <p className="text-2xl font-bold text-white">{round}</p>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${ganaronTripulantes ? 'bg-green-900/30 border border-green-700/50' : 'bg-red-900/30 border border-red-700/50'}`}>
                <h3 className="font-semibold text-white mb-2">
                  {ganaronTripulantes ? '🎯 Cómo ganaron los tripulantes:' : '🎭 Cómo ganaron los impostores:'}
                </h3>
                <p className="text-gray-300 text-sm">
                  {ganaronTripulantes 
                    ? 'Eliminaron a todos los impostores antes de ser superados en número.'
                    : 'Lograron igualar o superar en número a los tripulantes restantes.'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-gray-300 mb-2 text-sm">Impostores:</h3>
                  <div className="flex flex-wrap gap-1">
                    {estado.impostors.map((impostor, index) => (
                      <span key={index} className="bg-red-600 text-white px-2 py-1 rounded-full text-xs">
                        {impostor}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-gray-300 mb-2 text-sm">Eliminados:</h3>
                  <div className="flex flex-wrap gap-1">
                    {eliminatedPlayers.map((jugador, index) => (
                      <span key={index} className="bg-gray-600 text-white px-2 py-1 rounded-full text-xs">
                        {jugador}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={iniciarNuevaRonda}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              🎮 Nueva Ronda
            </button>
            
            <button
              onClick={reiniciarJuegoCompleto}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              🔄 Reiniciar Todo
            </button>
          </div>
          
          <div className="mt-6 text-center text-gray-500 text-sm">
            <p>Gracias por jugar IMPOSTOR WEB</p>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}

// CSS para animaciones
const styles = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
`;