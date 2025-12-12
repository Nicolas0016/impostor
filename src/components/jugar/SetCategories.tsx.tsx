import { useEffect, useState } from 'preact/hooks';

interface Category {
  id: string;
  name: string;
  type: 'single' | 'pairs' | 'images';
  words: string[];
  pairs?: Array<{word: string, related: string}>;
  imageUrls?: Array<{url: string, word: string}>;
  createdAt: string;
  lastUsed: string;
  count: number;
}

interface SetCategoriesProps {
  onUpdateConfig?: (key: string, value: any) => void;
}

export default function SetCategories({ onUpdateConfig }: SetCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar categorías al montar
  useEffect(() => {
    loadCategories();
  }, []);

  // Cargar configuración seleccionada
  useEffect(() => {
    const savedConfig = localStorage.getItem('impostorGameConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.selectedCategories) {
          setSelectedCategories(config.selectedCategories);
        }
      } catch (error) {
        console.error('Error loading selected categories:', error);
      }
    }
  }, []);

  const loadCategories = () => {
    try {
      const savedCategories = localStorage.getItem('impostorCategories');
      if (savedCategories) {
        const parsed = JSON.parse(savedCategories);
        setCategories(parsed);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    setSelectedCategories(newSelected);
    
    // Actualizar configuración global
    if (window.gameConfig) {
      window.gameConfig.selectedCategories = newSelected;
    }
    
    // Actualizar localStorage
    const savedConfig = localStorage.getItem('impostorGameConfig');
    const config = savedConfig ? JSON.parse(savedConfig) : {};
    config.selectedCategories = newSelected;
    localStorage.setItem('impostorGameConfig', JSON.stringify(config));
  };

  const handleAddCategory = () => {
    // Redirigir a la página de creación de categorías
    window.location.href = '/create-category';
  };

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <div class="bg-white rounded-2xl p-8 shadow-xl">
        <div class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">Cargando categorías...</h3>
        </div>
      </div>
    );
  }

  // Si no hay categorías
  if (categories.length === 0) {
    return (
      <div class="bg-white rounded-2xl p-8 shadow-xl">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Categorías de Palabras</h2>
        <p class="text-gray-600 mb-8">
          Selecciona las categorías con palabras para el juego.
        </p>

        <div class="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-gray-400 text-2xl">📝</span>
          </div>
          <h4 class="text-lg font-semibold text-gray-700 mb-2">No hay categorías creadas</h4>
          <p class="text-gray-500 mb-6">Crea tu primera categoría para comenzar</p>
          <button
            onClick={handleAddCategory}
            class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Crear Primera Categoría
          </button>
        </div>
      </div>
    );
  }

  // Mostrar categorías existentes
  return (
    <div class="bg-white rounded-2xl p-8 shadow-xl">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Categorías de Palabras</h2>
      <p class="text-gray-600 mb-8">
        Selecciona las categorías que quieres usar en esta partida. Los impostores recibirán palabras relacionadas.
      </p>

      {/* Lista de categorías existentes */}
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Tus Categorías ({categories.length})</h3>
        
        <div class="space-y-3">
          {categories.map((category) => (
            <div key={category.id} class="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
              <input 
                type="checkbox" 
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryToggle(category.id)}
                class="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              />
              
              <label 
                for={`category-${category.id}`}
                class="ml-3 flex-1 cursor-pointer"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <span class="font-medium text-gray-800">{category.name}</span>
                    <div class="flex items-center text-sm text-gray-600 mt-1">
                      <span class="mr-3">
                        {category.type === 'single' ? '📝 Palabras sueltas' : 
                         category.type === 'pairs' ? '🔗 Pares relacionados' : '🖼️ Imágenes'}
                      </span>
                      <span>• {category.count || 0} veces usada</span>
                    </div>
                  </div>
                  
                  <span class="text-sm text-gray-500">
                    {category.type === 'single' ? `${category.words.length} palabras` : 
                     category.type === 'pairs' ? `${category.pairs?.length || 0} pares` : 
                     `${category.imageUrls?.length || 0} imágenes`}
                  </span>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Botón para agregar nueva categoría */}
      <div class="mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleAddCategory}
          class="w-full py-4 border-2 border-dashed border-gray-300 text-gray-600 hover:text-gray-800 hover:border-gray-400 rounded-xl transition-all flex items-center justify-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Agregar Nueva Categoría
        </button>
        
        <p class="text-sm text-gray-500 text-center mt-2">
          Te llevará a otra página para crear la categoría
        </p>
      </div>

      {/* Información sobre selección */}
      <div class="mt-6 p-4 bg-blue-50 rounded-xl">
        <p class="text-sm text-blue-700">
          <span class="font-semibold">Nota:</span> Las categorías seleccionadas se usarán para generar las palabras del juego.
          Los impostores recibirán palabras relacionadas a las de los tripulantes.
        </p>
      </div>
    </div>
  );
}