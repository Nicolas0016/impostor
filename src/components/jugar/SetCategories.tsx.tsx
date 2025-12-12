import { useEffect, useState } from 'preact/hooks';

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

interface SetCategoriesProps {
  onUpdateConfig?: (key: string, value: any) => void;
}

export default function SetCategories({ onUpdateConfig }: SetCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    
    // Si hay una función de callback, llamarla
    if (onUpdateConfig) {
      onUpdateConfig('selectedCategories', newSelected);
    }
  };

  const handleAddCategory = () => {
    window.location.href = '/create-category';
  };

  // Calcular estadísticas de una categoría
  const getCategoryStats = (category: Category) => {
    if (category.type === 'single') {
      return {
        typeLabel: 'Palabras sueltas',
        count: category.words.length,
        icon: '📝'
      };
    } else {
      const wordCount = category.words.length;
      const pairCount = category.pairs?.length || 0;
      const totalElements = wordCount + (pairCount * 2);
      
      return {
        typeLabel: 'Mixta',
        count: totalElements,
        icon: '🔀',
        details: `${wordCount} palabras, ${pairCount} pares`
      };
    }
  };

  // Filtrar categorías por búsqueda
  const filteredCategories = searchTerm.trim() === '' 
    ? categories 
    : categories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

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

  return (
    <div class="bg-white rounded-2xl p-8 shadow-xl">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Categorías de Palabras</h2>
      <p class="text-gray-600 mb-8">
        Selecciona las categorías que quieres usar en esta partida.
      </p>

      {/* Barra de búsqueda */}
      <div class="mb-8">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Buscar categorías..."
          />
        </div>
      </div>

      {/* Contador de selección */}
      <div class="mb-6 flex items-center justify-between">
        <div>
          <span class="text-sm text-gray-600">
            {filteredCategories.length} categoría{filteredCategories.length !== 1 ? 's' : ''} disponible{filteredCategories.length !== 1 ? 's' : ''}
          </span>
          {searchTerm && (
            <span class="text-sm text-gray-500 ml-2">
              ({filteredCategories.length} resultado{filteredCategories.length !== 1 ? 's' : ''})
            </span>
          )}
        </div>
        <div class="text-sm font-medium text-blue-600">
          {selectedCategories.length} seleccionada{selectedCategories.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Lista de categorías existentes con scroll fijo */}
      <div class="mb-8">
        <div class="border border-gray-200 rounded-xl overflow-hidden">
          <div class="max-h-96 overflow-y-auto">
            {filteredCategories.length === 0 ? (
              <div class="text-center py-12">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="text-gray-400 text-2xl">🔍</span>
                </div>
                <h4 class="text-lg font-semibold text-gray-700 mb-2">No se encontraron categorías</h4>
                <p class="text-gray-500">
                  No hay categorías que coincidan con "{searchTerm}"
                </p>
              </div>
            ) : (
              <div class="divide-y divide-gray-100">
                {filteredCategories.map((category) => {
                  const stats = getCategoryStats(category);
                  const isSelected = selectedCategories.includes(category.id);
                  
                  return (
                    <div 
                      key={category.id} 
                      class={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                      onClick={() => handleCategoryToggle(category.id)}
                    >
                      <div class="flex items-start">
                        <div class="flex-shrink-0 pt-1">
                          <input 
                            type="checkbox" 
                            id={`category-${category.id}`}
                            checked={isSelected}
                            onChange={() => handleCategoryToggle(category.id)}
                            class="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        
                        <div class="ml-3 flex-1">
                          <div class="flex items-center justify-between">
                            <div>
                              <div class="flex items-center">
                                <span class="font-medium text-gray-900 text-lg">
                                  {category.name}
                                </span>
                                {category.count > 0 && (
                                  <span class="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    {category.count} vez{category.count !== 1 ? 'es' : ''}
                                  </span>
                                )}
                              </div>
                              
                              <div class="flex items-center mt-1">
                                <span class="text-sm text-gray-500 mr-4">
                                  {stats.icon} {stats.typeLabel}
                                </span>
                                <span class="text-sm text-gray-500">
                                  • {stats.count} elemento{stats.count !== 1 ? 's' : ''}
                                </span>
                                {stats.details && (
                                  <span class="text-sm text-gray-500 ml-2">
                                    ({stats.details})
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {isSelected && (
                              <div class="flex-shrink-0 ml-4">
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  Seleccionada
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Mostrar algunos ejemplos */}
                          <div class="mt-3">
                            <div class="flex flex-wrap gap-1">
                              {category.type === 'single' && category.words.slice(0, 3).map((word, idx) => (
                                <span key={idx} class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  {word}
                                </span>
                              ))}
                              
                              {category.type === 'mixed' && category.words.slice(0, 2).map((word, idx) => (
                                <span key={idx} class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                  {word}
                                </span>
                              ))}
                              
                              {category.type === 'mixed' && category.pairs && category.pairs.slice(0, 2).map((pair, idx) => (
                                <span key={idx} class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                  {pair.word}→{pair.related}
                                </span>
                              ))}
                              
                              {(category.type === 'single' && category.words.length > 3) && (
                                <span class="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                                  +{category.words.length - 3}
                                </span>
                              )}
                              
                              {(category.type === 'mixed' && 
                                (category.words.length > 2 || (category.pairs?.length || 0) > 2)) && (
                                <span class="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                                  +{(category.words.length - 2) + ((category.pairs?.length || 0) - 2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información sobre selección */}
      <div class="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3">
            <div class="text-sm text-blue-700">
              <span class="font-medium">Seleccionadas {selectedCategories.length} categoría{selectedCategories.length !== 1 ? 's' : ''}.</span>
              {selectedCategories.length === 0 ? (
                <span> Selecciona al menos 1 para usar en el juego.</span>
              ) : (
                <span> Estas se usarán para generar las palabras del juego.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botón para agregar nueva categoría */}
      <div class="pt-6 border-t border-gray-200">
        <button
          onClick={handleAddCategory}
          class="w-full py-4 border-2 border-dashed border-gray-300 text-gray-600 hover:text-gray-800 hover:border-gray-400 rounded-xl transition-all flex items-center justify-center group"
        >
          <svg class="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Agregar Nueva Categoría
        </button>
      </div>
    </div>
  );
}