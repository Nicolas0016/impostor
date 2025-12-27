import { useEffect, useState } from 'preact/hooks';
import { CategoryNameInput } from './CategoryNameInput';
import { PairsSection } from './PairsSection';
import { SingleWordsSection } from './SingleWordsSection';

interface Category {
  id: string;
  name: string;
  type: 'mixed';
  words: string[];
  pairs: Array<{word: string, related: string}>;
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
      const savedCategories = localStorage.getItem('impostorCategories');
      const categories = savedCategories ? JSON.parse(savedCategories) : [];
      
      const updatedCategories = [...categories, newCategory];
      localStorage.setItem('impostorCategories', JSON.stringify(updatedCategories));
      
      setTimeout(() => {
        window.location.href = '/jugar';
      }, 1500);
      
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDuplicateName = () => {
    return existingCategories.some(cat => 
      cat.name.toLowerCase() === categoryName.trim().toLowerCase()
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900  shadow-xl overflow-hidden">
      <div className="p-6 md:p-8">
        <CategoryNameInput 
          categoryName={categoryName}
          setCategoryName={setCategoryName}
          isDuplicate={isDuplicateName()}
        />

        {/* Navegación entre secciones */}
        <div className="mb-8">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveSection('single')}
              className={`flex-1 py-4 px-6 text-center font-medium text-lg transition-colors border-b-2 ${
                activeSection === 'single'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-center">
                <span className="text-2xl mr-3">📝</span>
                <div className="text-left">
                  <div>Palabras</div>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setActiveSection('pairs')}
              className={`flex-1 py-4 px-6 text-center font-medium text-lg transition-colors border-b-2 ${
                activeSection === 'pairs'
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-center">
                <span className="text-2xl mr-3">🔗</span>
                <div className="text-left">
                  <div>Pares</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Contenido según sección activa */}
        {activeSection === 'single' ? (
          <SingleWordsSection
            singleWords={singleWords}
            onAddWord={addSingleWord}
            onUpdateWord={updateSingleWord}
            onRemoveWord={removeSingleWord}
          />
        ) : (
          <PairsSection
            pairs={pairs}
            onAddPair={addPair}
            onUpdatePair={updatePair}
            onRemovePair={removePair}
          />
        )}

        {/* Botones de acción */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
           
            <div className="flex-1"></div>
            
            <button
              onClick={saveCategory}
              disabled={isSubmitting || isDuplicateName() || !validateForm()}
              className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center ${
                isSubmitting || isDuplicateName() || !validateForm()
                  ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed'
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
                  Guardar Categoría
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}