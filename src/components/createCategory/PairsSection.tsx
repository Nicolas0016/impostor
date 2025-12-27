
interface Pair {
  word: string;
  related: string;
}

interface PairsSectionProps {
  pairs: Pair[];
  onAddPair: () => void;
  onUpdatePair: (index: number, field: 'word' | 'related', value: string) => void;
  onRemovePair: (index: number) => void;
}

export function PairsSection({
  pairs,
  onAddPair,
  onUpdatePair,
  onRemovePair
}: PairsSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Pares Relacionados
        </h3>
      </div>

      <div className="space-y-6">
        {pairs.map((pair, index) => (
          <div key={index} className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-green-300 dark:hover:border-green-700 group transition-colors relative bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="absolute top-0 right-0">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 font-bold group-hover:text-green-300 dark:group-hover:text-green-600">
                    {index + 1}
                  </span>
                </div>
              </div>
              {pairs.length > 2 && (
                <button
                  onClick={() => onRemovePair(index)}
                  className="px-4 py-2 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Eliminar
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <input
                  type="text"
                  value={pair.word}
                  onChange={(e) => onUpdatePair(index, 'word', (e.target as HTMLInputElement).value)}
                  className="w-full p-4 border-2 border-blue-300 dark:border-blue-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Ej: Gato"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={pair.related}
                  onChange={(e) => onUpdatePair(index, 'related', (e.target as HTMLInputElement).value)}
                  className="w-full p-4 border-2 border-red-300 dark:border-red-700 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Ej: Perro"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={onAddPair}
          className="px-4 py-4 w-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Agregar par
        </button> 
      </div>

    </div>
  );
}