import { useState, useEffect } from 'preact/hooks';

interface Category {
  id: string;
  name: string;
  type: 'mixed'; // Cambiado a 'mixed' porque tiene ambos
  words: string[];
  pairs: Array<{word: string, related: string}>; // Ya no es opcional
  createdAt: string;
  lastUsed: string;
  count: number;
}

export default function CategoryCreator() {
  const [categoryName, setCategoryName] = useState('');
  const [singleWords, setSingleWords] = useState<string[]>(['', '']);
  const [pairs, setPairs] = useState<Array<{word: string, related: string}>>([
    { word: '', related: '' },
    { word: '', related: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingCategories, setExistingCategories] = useState<Category[]>([]);
  const [activeSection, setActiveSection] = useState<'single' | 'pairs'>('single');

  // Cargar categorías existentes
  useEffect(() => {
    loadExistingCategories();
  }, []);

  const loadExistingCategories = () => {
    try {
      const savedCategories = localStorage.getItem('impostorCategories');
      if (savedCategories) {
        const parsed = JSON.parse(savedCategories);
        setExistingCategories(parsed);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Manejar palabras sueltas
  const addSingleWord = () => {
    setSingleWords([...singleWords, '']);
  };

  const updateSingleWord = (index: number, value: string) => {
    const newWords = [...singleWords];
    newWords[index] = value;
    setSingleWords(newWords);
  };

  const removeSingleWord = (index: number) => {
    if (singleWords.length > 2) {
      const newWords = singleWords.filter((_, i) => i !== index);
      setSingleWords(newWords);
    }
  };

  // Manejar pares relacionados
  const addPair = () => {
    setPairs([...pairs, { word: '', related: '' }]);
  };

  const updatePair = (index: number, field: 'word' | 'related', value: string) => {
    const newPairs = [...pairs];
    newPairs[index][field] = value;
    setPairs(newPairs);
  };

  const removePair = (index: number) => {
    if (pairs.length > 2) {
      const newPairs = pairs.filter((_, i) => i !== index);
      setPairs(newPairs);
    }
  };

  // Validar formulario
  const validateForm = () => {
    if (!categoryName.trim()) {
      return false;
    }

    // Validar que haya al menos algún contenido
    const validWords = singleWords.filter(word => word.trim() !== '');
    const validPairs = pairs.filter(pair => 
      pair.word.trim() !== '' && pair.related.trim() !== ''
    );

    if (validWords.length === 0 && validPairs.length === 0) {
      return false;
    }

    if (validWords.length === 1) {
      return false;
    }

    if (validPairs.length === 1) {
      return false;
    }

    return true;
  };

  // Guardar categoría
  const saveCategory = () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const newCategory: Category = {
      id: `cat_${Date.now()}`,
      name: categoryName.trim(),
      type: 'mixed',
      words: singleWords.filter(w => w.trim() !== ''),
      pairs: pairs.filter(p => p.word.trim() !== '' && p.related.trim() !== ''),
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      count: 0
    };

    try {
      // Cargar categorías existentes
      const savedCategories = localStorage.getItem('impostorCategories');
      const categories = savedCategories ? JSON.parse(savedCategories) : [];
      
      // Agregar nueva categoría
      const updatedCategories = [...categories, newCategory];
      localStorage.setItem('impostorCategories', JSON.stringify(updatedCategories));
      
      // Mostrar mensaje de éxito
      const wordsCount = newCategory.words.length;
      const pairsCount = newCategory.pairs.length;
      
      // Redirigir después de un segundo
      setTimeout(() => {
        window.location.href = '/jugar';
      }, 1500);
      
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verificar si ya existe una categoría con el mismo nombre
  const isDuplicateName = () => {
    return existingCategories.some(cat => 
      cat.name.toLowerCase() === categoryName.trim().toLowerCase()
    );
  };

  // Calcular estadísticas
  const getStats = () => {
    const validWords = singleWords.filter(word => word.trim() !== '').length;
    const validPairs = pairs.filter(pair => 
      pair.word.trim() !== '' && pair.related.trim() !== ''
    ).length;
    
    return { validWords, validPairs };
  };

  const stats = getStats();

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

      {/* Formulario */}
      <div className="p-6 md:p-8">
        {/* Nombre de la categoría */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la categoría *
          </label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName((e.target as HTMLInputElement).value)}
            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            placeholder="Ej: Frutas, Animales, Sinónimos, etc."
            maxLength={50}
          />
          {isDuplicateName() && categoryName.trim() && (
            <div className="mt-2 flex items-center text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Ya existe una categoría con este nombre
            </div>
          )}
          <p className="mt-2 text-sm text-gray-500">
            Todos los contenidos (palabras sueltas y pares) se agruparán bajo este nombre
          </p>
        </div>

        {/* Navegación entre secciones */}
        <div className="mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveSection('single')}
              className={`flex-1 py-4 px-6 text-center font-medium text-lg transition-colors border-b-2 ${
                activeSection === 'single'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center">
                <span className="text-2xl mr-3">📝</span>
                <div className="text-left">
                  <div>Palabras Sueltas</div>
                  <div className="text-sm font-normal">
                    {stats.validWords} palabra{stats.validWords !== 1 ? 's' : ''} agregada{stats.validWords !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setActiveSection('pairs')}
              className={`flex-1 py-4 px-6 text-center font-medium text-lg transition-colors border-b-2 ${
                activeSection === 'pairs'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center">
                <span className="text-2xl mr-3">🔗</span>
                <div className="text-left">
                  <div>Pares Relacionados</div>
                  <div className="text-sm font-normal">
                    {stats.validPairs} par{stats.validPairs !== 1 ? 'es' : ''} agregado{stats.validPairs !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Contenido según sección activa */}
        {activeSection === 'single' ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Palabras Sueltas</h3>
              <button
                onClick={addSingleWord}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Agregar palabra
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Agrega palabras individuales que pertenezcan a esta categoría.
              Los impostores recibirán palabras relacionadas automáticamente.
            </p>

            <div className="space-y-4">
              {singleWords.map((word, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold">{index + 1}</span>
                  </div>
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => updateSingleWord(index, (e.target as HTMLInputElement).value)}
                    className="flex-1 p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    placeholder={`Palabra ${index + 1}`}
                  />
                  {singleWords.length > 2 && (
                    <button
                      onClick={() => removeSingleWord(index)}
                      className="flex-shrink-0 w-12 h-12 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center"
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
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Pares Relacionados</h3>
              <button
                onClick={addPair}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Agregar par
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Crea pares donde la primera palabra es para tripulantes y la segunda para impostores.
              Puedes no agregar pares si solo usas palabras sueltas.
            </p>

            <div className="space-y-6">
              {pairs.map((pair, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl p-6 hover:border-green-300 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-green-600 font-bold">{index + 1}</span>
                      </div>
                      <span className="text-lg font-medium text-gray-700">Par #{index + 1}</span>
                    </div>
                    {pairs.length > 2 && (
                      <button
                        onClick={() => removePair(index)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center"
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
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                          <span className="text-blue-600 text-sm font-bold">👥</span>
                        </div>
                        <label className="block text-sm font-medium text-gray-700">
                          Palabra para tripulantes
                        </label>
                      </div>
                      <input
                        type="text"
                        value={pair.word}
                        onChange={(e) => updatePair(index, 'word', (e.target as HTMLInputElement).value)}
                        className="w-full p-4 border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        placeholder="Ej: Gato"
                      />
                      <p className="mt-2 text-sm text-blue-600">
                        Los tripulantes recibirán esta palabra
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-2">
                          <span className="text-red-600 text-sm font-bold">😈</span>
                        </div>
                        <label className="block text-sm font-medium text-gray-700">
                          Palabra para impostores
                        </label>
                      </div>
                      <input
                        type="text"
                        value={pair.related}
                        onChange={(e) => updatePair(index, 'related', (e.target as HTMLInputElement).value)}
                        className="w-full p-4 border-2 border-red-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                        placeholder="Ej: Perro"
                      />
                      <p className="mt-2 text-sm text-red-600">
                        Los impostores recibirán esta palabra
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-start">
                <span className="text-green-500 text-xl mr-3">💡</span>
                <div>
                  <p className="text-sm text-green-700 font-medium mb-2">Ejemplos de pares relacionados:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-white p-3 rounded-lg border border-green-100">
                      <span className="font-medium text-green-700">Sinónimos:</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-blue-600">Feliz</span>
                        <span className="text-gray-400 mx-2">→</span>
                        <span className="text-red-600">Contento</span>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-green-100">
                      <span className="font-medium text-green-700">Opuestos:</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-blue-600">Caliente</span>
                        <span className="text-gray-400 mx-2">→</span>
                        <span className="text-red-600">Frío</span>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-green-100">
                      <span className="font-medium text-green-700">Categorías:</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-blue-600">Sandía</span>
                        <span className="text-gray-400 mx-2">→</span>
                        <span className="text-red-600">Fruta</span>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-green-100">
                      <span className="font-medium text-green-700">Relaciones:</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-blue-600">Gato</span>
                        <span className="text-gray-400 mx-2">→</span>
                        <span className="text-red-600">Perro</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={() => window.location.href = '/jugar'}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </button>
            
            <div className="flex-1"></div>
            
            <button
              onClick={saveCategory}
              disabled={isSubmitting || isDuplicateName() || !validateForm()}
              className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center ${
                isSubmitting || isDuplicateName() || !validateForm()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transform hover:-translate-y-0.5'
              } text-white`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar Categoría Completa
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}