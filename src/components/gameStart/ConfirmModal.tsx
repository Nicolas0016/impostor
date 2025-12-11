interface ConfirmModalProps {
  playerToEliminate: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({ playerToEliminate, onCancel, onConfirm }: ConfirmModalProps) {
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
            onClick={onCancel}
            className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
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