interface GameVotingProps {
  round: number;
  message: string;
  jugadoresActivos: string[];
  eliminatedPlayers: string[];
  onConfirmElimination: (jugador: string) => void;
}

export default function GameVoting({ 
  round, 
  message, 
  jugadoresActivos, 
  eliminatedPlayers, 
  onConfirmElimination 
}: GameVotingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-500 mb-2">🗳️ VOTACIÓN</h1>
          <p className="text-gray-400">Elimina al jugador más sospechoso</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Selecciona al jugador a eliminar:</h2>
          
          <div className="space-y-3 overflow-y-auto overflow-x-hidden max-h-96">
            {jugadoresActivos.map((jugador) => (
              <button
                key={jugador}
                onClick={() => onConfirmElimination(jugador)}
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
        </div>
      </div>
    </div>
  );
}