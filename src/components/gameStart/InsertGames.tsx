import { useEffect, useState } from 'preact/hooks';
import ImpostorGame from "../../models/Impostor";
import ConfirmModal from './ConfirmModal';
import GameConfig from './GameConfig';
import GameFinished from './GameFinished';
import GamePlaying from './GamePlaying';
import GameVoting from './GameVoting';
import type { PlayerInfo } from './types';

export default function InsertGames() {
  // Inicializar el juego
  const [game] = useState(() => new ImpostorGame(
    ['Juan', 'María', 'Pedro', 'Ana', 'Luis', 'Sofía'],
    3,
    ['clasico', 'turista', 'bufon'],
    ['modo_mimo', 'sin_repetir_letra']
  ));
  
  // Estados reactivos
  const [currentPlayer, setCurrentPlayer] = useState<string>('');
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [gameState, setGameState] = useState<'config' | 'ready' | 'playing' | 'voting' | 'finished'>('config');
  const [round, setRound] = useState<number>(0);
  const [message, setMessage] = useState<string>('Juego listo para comenzar');
  const [showRole, setShowRole] = useState<boolean>(false);
  const [eliminatedPlayers, setEliminatedPlayers] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [playerToEliminate, setPlayerToEliminate] = useState<string | null>(null);
  
  // Inicializar el juego
  useEffect(() => {
    iniciarJuego();
  }, []);
  
  function iniciarJuego(): void {
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
  
  function comenzarRonda(): void {
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
    setEliminatedPlayers([]);
  }
  
  function pasarTurno(): void {
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
  
  function mostrarRol(): void {
    setShowRole(true);
  }
  
  function confirmarEliminacion(jugador: string): void {
    setPlayerToEliminate(jugador);
    setShowConfirmModal(true);
  }
  
  function eliminarJugador(): void {
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
  
  function cancelarEliminacion(): void {
    setShowConfirmModal(false);
    setPlayerToEliminate(null);
  }
  
  function iniciarNuevaRonda(): void {
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
    setEliminatedPlayers([]);
  }
  
  function reiniciarJuegoCompleto(): void {
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
  if (showConfirmModal && playerToEliminate) {
    return (
      <ConfirmModal
        playerToEliminate={playerToEliminate}
        onCancel={cancelarEliminacion}
        onConfirm={eliminarJugador}
      />
    );
  }
  
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
        />
      );
      
    case 'voting':
      return (
        <GameVoting
          round={round}
          message={message}
          jugadoresActivos={jugadoresActivos}
          eliminatedPlayers={eliminatedPlayers}
          onConfirmElimination={confirmarEliminacion}
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
        />
      );
      
    default:
      return null;
  }
}