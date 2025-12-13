interface SingleWordsSectionProps {
  singleWords: string[];
  onAddWord: () => void;
  onUpdateWord: (index: number, value: string) => void;
  onRemoveWord: (index: number) => void;
}

export function SingleWordsSection({
  singleWords,
  onAddWord,
  onUpdateWord,
  onRemoveWord
}: SingleWordsSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Palabras Sueltas
        </h3>
        <button
          onClick={onAddWord}
          className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Agregar palabra
        </button>
      </div>

      <div className="space-y-4">
        {singleWords.map((word, index) => (
          <div key={index} className="flex items-center gap-3">
            <input
              type="text"
              value={word}
              onChange={(e) => onUpdateWord(index, (e.target as HTMLInputElement).value)}
              className="flex-1 p-4 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder={`Palabra ${index + 1}`}
            />
            {singleWords.length > 2 && (
              <button
                onClick={() => onRemoveWord(index)}
                className="flex-shrink-0 w-12 h-12 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-800 transition-colors flex items-center justify-center"
                title="Eliminar palabra"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}