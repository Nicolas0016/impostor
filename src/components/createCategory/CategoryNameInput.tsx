
interface CategoryNameInputProps {
  categoryName: string;
  setCategoryName: (name: string) => void;
  isDuplicate: boolean;
}

export function CategoryNameInput({
  categoryName,
  setCategoryName,
  isDuplicate
}: CategoryNameInputProps) {
  return (
    <div className="mb-8">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Nombre de la categoría *
      </label>
      <input
        type="text"
        value={categoryName}
        onChange={(e) => setCategoryName((e.target as HTMLInputElement).value)}
        className="w-full p-4 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        placeholder="Frutas, Animales, Sinónimos, etc."
        maxLength={50}
      />
      {isDuplicate && categoryName.trim() && (
        <div className="mt-2 flex items-center text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900 p-3 rounded-lg">
          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Ya existe una categoría con este nombre
        </div>
      )}
    </div>
  );
}