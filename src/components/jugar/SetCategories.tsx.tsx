import { useEffect, useState } from 'preact/hooks';
import defaultCategories from '../../data/defaultCategories.json';

interface Category {
  id: string;
  name: string;
  type: 'single' | 'mixed';
  words: string[];
  pairs?: Array<{ word: string, related: string }>;
  createdAt: string;
  lastUsed: string;
  count: number;
  isDefault?: boolean; // Nueva propiedad para identificar categorías por defecto
}

interface SetCategoriesProps {
  onUpdateConfig?: (key: string, value: any) => void;
}

export default function SetCategories({ onUpdateConfig }: SetCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);



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
      let allCategories: Category[] = [];
      
      if (savedCategories) {
        const customCategories: Category[] = JSON.parse(savedCategories);
        // Filtrar categorías personalizadas que no sean por defecto
        const filteredCustom = customCategories.filter(
          cat => !defaultCategories.some(defaultCat => defaultCat.id === cat.id)
        );
        allCategories = [...allCategories, ...filteredCustom];
      }
      
      setCategories(allCategories);
      
      // Si no hay categorías seleccionadas en la configuración, seleccionar todas las por defecto
      const savedConfig = localStorage.getItem('impostorGameConfig');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        if (!config.selectedCategories || config.selectedCategories.length === 0) {
          const defaultIds = defaultCategories.map(cat => cat.id);
          setSelectedCategories(defaultIds);
          
          localStorage.setItem('impostorGameConfig', JSON.stringify(config));
          
          if (onUpdateConfig) {
            onUpdateConfig('selectedCategories', defaultIds);
          }
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /* ===============================
     BOTÓN: CARGAR DEFAULT
  =============================== */
  const loadDefaultCategories = () => {
    const merged = [
      ...defaultCategories,
      ...categories.filter(
        c => !defaultCategories.some(d => d.id === c.id)
      )
    ];

    setCategories(merged);

    const allIds = merged.map(c => c.id);
    setSelectedCategories(allIds);

    localStorage.setItem('impostorCategories', JSON.stringify(merged));
    localStorage.setItem(
      'impostorGameConfig',
      JSON.stringify({ selectedCategories: allIds })
    );

    if (window.gameConfig) {
      window.gameConfig.selectedCategories = allIds;
    }

    onUpdateConfig?.('selectedCategories', allIds);
    
    // Mostrar confirmación
    alert('¡Categorías por defecto cargadas exitosamente!');
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

  const handleSelectAll = () => {
    const allIds = categories.map(cat => cat.id);
    setSelectedCategories(allIds);
    
    // Actualizar configuración global
    if (window.gameConfig) {
      window.gameConfig.selectedCategories = allIds;
    }
    
    // Actualizar localStorage
    const savedConfig = localStorage.getItem('impostorGameConfig');
    const config = savedConfig ? JSON.parse(savedConfig) : {};
    config.selectedCategories = allIds;
    localStorage.setItem('impostorGameConfig', JSON.stringify(config));
    
    if (onUpdateConfig) {
      onUpdateConfig('selectedCategories', allIds);
    }
  };

  const handleDeselectAll = () => {
    setSelectedCategories([]);
    
    // Actualizar configuración global
    if (window.gameConfig) {
      window.gameConfig.selectedCategories = [];
    }
    
    // Actualizar localStorage
    const savedConfig = localStorage.getItem('impostorGameConfig');
    const config = savedConfig ? JSON.parse(savedConfig) : {};
    config.selectedCategories = [];
    localStorage.setItem('impostorGameConfig', JSON.stringify(config));
    
    if (onUpdateConfig) {
      onUpdateConfig('selectedCategories', []);
    }
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;

    // No permitir eliminar categorías por defecto
    if (categoryToDelete.isDefault) {
      alert('No se pueden eliminar las categorías por defecto');
      setShowDeleteConfirm(false);
      setCategoryToDelete(null);
      return;
    }

    // Filtrar la categoría a eliminar
    const updatedCategories = categories.filter(cat => cat.id !== categoryToDelete.id);
    setCategories(updatedCategories);
    
    // Remover de seleccionadas si estaba seleccionada
    const updatedSelected = selectedCategories.filter(id => id !== categoryToDelete.id);
    setSelectedCategories(updatedSelected);
    
    // Guardar solo categorías personalizadas en localStorage (excluyendo las por defecto)
    const customCategories = updatedCategories.filter(cat => !cat.isDefault);
    localStorage.setItem('impostorCategories', JSON.stringify(customCategories));
    
    // Actualizar configuración global
    if (window.gameConfig) {
      window.gameConfig.selectedCategories = updatedSelected;
    }
    
    // Actualizar localStorage de configuración
    const savedConfig = localStorage.getItem('impostorGameConfig');
    const config = savedConfig ? JSON.parse(savedConfig) : {};
    config.selectedCategories = updatedSelected;
    localStorage.setItem('impostorGameConfig', JSON.stringify(config));
    
    if (onUpdateConfig) {
      onUpdateConfig('selectedCategories', updatedSelected);
    }
    
    // Cerrar modal
    setShowDeleteConfirm(false);
    setCategoryToDelete(null);
  };

  const cancelDeleteCategory = () => {
    setShowDeleteConfirm(false);
    setCategoryToDelete(null);
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

  // Contar categorías personalizadas vs por defecto
  const defaultCategoriesCount = categories.filter(cat => cat.isDefault).length;
  const customCategoriesCount = categories.filter(cat => !cat.isDefault).length;

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

  return (
    <>
      {/* Modal de confirmación para eliminar */}
      {showDeleteConfirm && categoryToDelete && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-red-600 text-2xl">⚠️</span>
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">Eliminar Categoría</h3>
              <p class="text-gray-600">
                ¿Estás seguro de que quieres eliminar la categoría 
                <span class="font-bold text-gray-800"> "{categoryToDelete.name}"</span>?
              </p>
              
              {categoryToDelete.isDefault ? (
                <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p class="text-yellow-700 text-sm">
                    Esta es una categoría por defecto y no se puede eliminar.
                  </p>
                </div>
              ) : (
                <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p class="text-red-700 text-sm">
                    Esta acción no se puede deshacer. Se eliminarán todas las palabras de esta categoría.
                  </p>
                </div>
              )}
            </div>
            
            <div class="flex gap-3">
              <button
                onClick={cancelDeleteCategory}
                class="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteCategory}
                disabled={categoryToDelete.isDefault}
                class={`flex-1 py-3 font-medium rounded-xl transition-colors ${
                  categoryToDelete.isDefault 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div class="bg-white rounded-2xl p-8 shadow-xl">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Categorías de Palabras</h2>
            <p class="text-gray-600">
              Selecciona las categorías con palabras para el juego
            </p>
          </div>
          
          {/* Botón para cargar categorías por defecto */}
          <button
            onClick={loadDefaultCategories}
            class="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all flex items-center shadow-lg hover:shadow-xl"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Cargar Default
          </button>
        </div>


        
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
                  <button
                    onClick={loadDefaultCategories}
                    class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Cargar categorías por defecto
                  </button>
                </div>
              ) : (
                <div class="divide-y divide-gray-100">
                  {filteredCategories.map((category) => {
                    const stats = getCategoryStats(category);
                    const isSelected = selectedCategories.includes(category.id);
                    const isDefault = category.isDefault || false;
                    
                    return (
                      <div 
                        key={category.id} 
                        class={`p-4 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                      >
                        <div class="flex items-start">
                          <div class="flex-shrink-0 pt-1">
                            <input 
                              type="checkbox" 
                              id={`category-${category.id}`}
                              checked={isSelected}
                              onChange={() => handleCategoryToggle(category.id)}
                              class="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                          </div>
                          
                          <div class="ml-3 flex-1">
                            <div class="flex items-center justify-between">
                              <div>
                                <div class="flex items-center">
                                  <span class="font-medium text-gray-900 text-lg">
                                    {category.name}
                                  </span>
                                  {isDefault && (
                                    <span class="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center">
                                      <span class="mr-1">⚡</span> Por defecto
                                    </span>
                                  )}
                                  {category.count > 0 && !isDefault && (
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
                              
                              {/* Botón de eliminar (solo para categorías personalizadas) */}
                              {!isDefault && (
                                <button
                                  onClick={() => handleDeleteCategory(category)}
                                  class="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Eliminar categoría"
                                >
                                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
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

        {/* Botón para agregar nueva categoría */}
        <div class="pt-6 border-t border-gray-200">
          <button
            onClick={handleAddCategory}
            class="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center group shadow-lg hover:shadow-xl"
          >
            <svg class="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Agregar Nueva Categoría Personalizada
          </button>
          
          <p class="text-gray-500 text-sm text-center mt-3">
            Las categorías personalizadas se guardan localmente en tu dispositivo
          </p>
        </div>
      </div>
    </>
  );
}