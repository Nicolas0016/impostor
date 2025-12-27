import { useEffect, useState } from "preact/hooks";

interface GameVotingProps {
  round: number;
  message: string;
  jugadoresActivos: string[];
  eliminatedPlayers: string[];
  onConfirmElimination: (jugador: string) => void;
  currentVoter: string;
  votingResult: {
    eliminatedPlayer: string | null;
    isImpostor: boolean;
  };
  onContinueAfterResult: () => void;
}

export default function GameVoting({
  round,
  message,
  jugadoresActivos,
  eliminatedPlayers,
  onConfirmElimination,
  currentVoter,
  votingResult,
  onContinueAfterResult
}: GameVotingProps) {
  // Estados locales para la votación por turnos
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [votedPlayers, setVotedPlayers] = useState<string[]>([]);
  const [skippedVoters, setSkippedVoters] = useState<string[]>([]);
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  
  // Inicializar el sistema de votos cuando cambian los jugadores activos
  useEffect(() => {
    if (jugadoresActivos.length > 0) {
      // Reiniciar votación
      setVotes({});
      setVotedPlayers([]);
      setSkippedVoters([]);
      setCurrentVoterIndex(0);
      
      // Si hay resultado previo de eliminación, mostrarlo
      if (votingResult.eliminatedPlayer) {
        console.log(`Resultado previo: ${votingResult.eliminatedPlayer} era impostor: ${votingResult.isImpostor}`);
      }
    }
  }, [jugadoresActivos, round]);

  // Determinar el votante actual
  const currentVoterName = jugadoresActivos[currentVoterIndex] || jugadoresActivos[0] || '';
  
  // Calcular estadísticas
  const totalVotes = votedPlayers.length;
  const totalSkipped = skippedVoters.length;
  const maxVotes = jugadoresActivos.length;
  const allHaveDecided = totalVotes + totalSkipped === maxVotes;
  
  // Función para manejar un voto
  const handleVote = (votedPlayer: string) => {
    if (votedPlayers.includes(currentVoterName) || skippedVoters.includes(currentVoterName)) {
      return; // Ya decidió este jugador
    }
    
    // Registrar el voto
    setVotes(prev => ({
      ...prev,
      [votedPlayer]: (prev[votedPlayer] || 0) + 1
    }));
    
    // Marcar al jugador como que ya votó
    setVotedPlayers(prev => [...prev, currentVoterName]);
    
    // Pasar al siguiente votante automáticamente
    const nextIndex = (currentVoterIndex + 1) % jugadoresActivos.length;
    setCurrentVoterIndex(nextIndex);
  };

  // Función para pasar al siguiente votante sin votar
  const handleSkipVote = () => {
    if (votedPlayers.includes(currentVoterName) || skippedVoters.includes(currentVoterName)) {
      return; // Ya decidió este jugador
    }
    
    // Marcar al jugador como que no votó (saltó su turno)
    setSkippedVoters(prev => [...prev, currentVoterName]);
    
    // Pasar al siguiente votante automáticamente
    const nextIndex = (currentVoterIndex + 1) % jugadoresActivos.length;
    setCurrentVoterIndex(nextIndex);
  };

  // Función para finalizar la votación y determinar al eliminado
  const handleEndVoting = () => {
    if (!allHaveDecided) {
      console.log("No todos han decidido, usando decisiones actuales");
    }
    
    // Encontrar al jugador con más votos
    const voteEntries = Object.entries(votes);
    
    if (voteEntries.length === 0) {
      // Si no hay votos, nadie es eliminado
      onConfirmElimination('');
      return;
    }
    
    // Ordenar por número de votos (descendente)
    voteEntries.sort(([, a], [, b]) => b - a);
    
    const maxVotesCount = voteEntries[0][1];
    
    // Encontrar todos los jugadores con el máximo de votos
    const topPlayers = voteEntries.filter(([, votes]) => votes === maxVotesCount);
    
    if (topPlayers.length === 1) {
      // Solo un jugador tiene más votos - eliminarlo
      const playerToEliminate = topPlayers[0][0];
      onConfirmElimination(playerToEliminate);
    } else {
      // Hay empate - nadie es eliminado
      console.log(`Empate entre: ${topPlayers.map(([name]) => name).join(', ')}`);
      onConfirmElimination('');
    }
    
    // Resetear votación local
    setVotes({});
    setVotedPlayers([]);
    setSkippedVoters([]);
    setCurrentVoterIndex(0);
  };

  // Mostrar resultado de eliminación si existe
  if (votingResult.eliminatedPlayer) {
    if (votingResult.eliminatedPlayer === '') {
      // Caso de empate o nadie eliminado
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 flex items-center justify-center">
          <div className="max-w-md w-full">
            <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-600 to-yellow-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🤝</span>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">
                ¡EMPATE!
              </h2>
              
              <div className="mb-8">
                <p className="text-xl font-bold text-yellow-300 mb-2">
                  Nadie ha sido eliminado
                </p>
                <p className="text-gray-400">
                  Hubo un empate en los votos
                </p>
              </div>
              
              <div className="mb-6 p-4 bg-yellow-900/30 rounded-xl border border-yellow-700/50">
                <p className="text-yellow-300 font-semibold">
                  La votación ha terminado sin un ganador claro
                </p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={onContinueAfterResult}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 text-lg"
                >
                  ➡️ Continuar juego
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Caso normal: alguien fue eliminado
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700 text-center">
            
            
            <h2 className="text-3xl font-bold text-white mb-4">
              {votingResult.isImpostor ? '¡ERA IMPOSTOR!' : 'NO ERA IMPOSTOR'}
            </h2>
            
            
            
            <div className="space-y-4">
              <button
                onClick={onContinueAfterResult}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-4 rounded-lg transition-all duration-300 text-lg"
              >
                ➡️ Continuar juego
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h1 className="text-4xl font-bold text-red-500">🗳️ VOTACIÓN</h1>
          </div>
          <p className="text-gray-400">Vota al jugador más sospechoso</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel izquierdo: Votación actual */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
              

              {/* Lista de jugadores para votar */}
              <h2 className="text-2xl font-bold text-white mb-4">
                {currentVoterName}, selecciona al jugador a eliminar:
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {jugadoresActivos.map((jugador) => {
                  const voteCount = votes[jugador] || 0;
                  const hasVoted = votedPlayers.includes(currentVoterName);
                  const hasSkipped = skippedVoters.includes(currentVoterName);
                  const hasDecided = hasVoted || hasSkipped;
                  const allDecided = allHaveDecided;
                  
                  // Determinar si este jugador es líder
                  const voteValues = Object.values(votes);
                  const maxVoteCount = voteValues.length > 0 ? Math.max(...voteValues) : 0;
                  const isLeading = voteCount === maxVoteCount && voteCount > 0;
                  
                  return (
                    <button
                      key={jugador}
                      onClick={() => !hasDecided && handleVote(jugador)}
                      disabled={hasDecided || allDecided}
                      className={`w-full p-4 rounded-xl text-left transition-all duration-300 border flex items-center justify-between group ${
                        hasDecided || allDecided
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:scale-[1.02] active:scale-[0.98]'
                      } ${
                        isLeading
                          ? 'bg-red-900/40 border-red-600/50 hover:bg-red-800/50'
                          : 'bg-gray-700/50 border-gray-600/50 hover:bg-gray-600/50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                          isLeading ? 'bg-red-600' : 'bg-gray-600'
                        } ${!hasDecided && !allDecided ? 'group-hover:bg-red-500' : ''}`}>
                          <span className="text-white font-bold">
                            {voteCount > 0 ? voteCount : "👤"}
                          </span>
                        </div>
                        <div className='flex gap-2 items-center'>
                          <span className="text-lg font-semibold text-white">{jugador}</span>
                          
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Botones de acción */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSkipVote}
                  disabled={votedPlayers.includes(currentVoterName) || skippedVoters.includes(currentVoterName)}
                  className={`flex-1 p-4 rounded-xl font-bold transition-colors ${
                    votedPlayers.includes(currentVoterName) || skippedVoters.includes(currentVoterName)
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  }`}
                >
                  ⏭️ No votar (Saltar)
                </button>
                
                <button
                  onClick={handleEndVoting}
                  className={`flex-1 p-4 rounded-xl font-bold transition-colors ${
                    allHaveDecided
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  🏁 Finalizar votación
                </button>
              </div>
            </div>
          </div>

           </div>
          </div>
        </div>
  );
}