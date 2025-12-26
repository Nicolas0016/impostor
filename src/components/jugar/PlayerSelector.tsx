import { useEffect, useState } from 'preact/hooks';

export default function PlayerSelector() {
  const [playerNames, setPlayerNames] = useState<string[]>(['', '', '', '']);
  const [maxImpostors, setMaxImpostors] = useState(1);
  const [availableImpostorOptions, setAvailableImpostorOptions] = useState<number[]>([1]);

  // Cargar configuración al montar
  useEffect(() => {
    const savedConfig = localStorage.getItem('impostorGameConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.playerNames && Array.isArray(config.playerNames)) {
          // Si hay menos de 4 nombres, completamos con campos vacíos
          const loadedNames = [...config.playerNames];
          while (loadedNames.length < 4) {
            loadedNames.push('');
          }
          setPlayerNames(loadedNames);
        }
        if (config.maxImpostors) setMaxImpostors(config.maxImpostors);
      } catch (error) {
        console.error('Error al cargar configuración:', error);
        // Configuración por defecto
        setPlayerNames(['', '', '', '']);
      }
    }
  }, []);

  // Actualizar opciones de impostores según cantidad de jugadores
  useEffect(() => {
    const validPlayers = playerNames.filter(name => name.trim() !== '').length;
    
    if (validPlayers <= 3) {
      setAvailableImpostorOptions([1]);
      // Si el máximo actual no está disponible, ajustarlo
      if (maxImpostors !== 1) setMaxImpostors(1);
    } else if (validPlayers >= 4 && validPlayers <= 5) {
      setAvailableImpostorOptions([1, 2]);
      // Ajustar si el máximo actual no está disponible
      if (maxImpostors > 2) setMaxImpostors(2);
    } else if (validPlayers >= 6 && validPlayers <= 8) {
      setAvailableImpostorOptions([1, 2]);
      // Ajustar si el máximo actual no está disponible
      if (maxImpostors > 2) setMaxImpostors(2);
    } else if (validPlayers >= 9 && validPlayers <= 15) {
      setAvailableImpostorOptions([1, 2, 3]);
      // No ajustamos porque 3 está disponible
    }
    
    // Guardar configuración actualizada
    saveConfig();
  }, [playerNames]);

  const saveConfig = () => {
    const validPlayers = playerNames.filter(name => name.trim() !== '');
    const config = JSON.parse(localStorage.getItem('impostorGameConfig') || '{}');
    config.playerNames = validPlayers;
    config.maxImpostors = maxImpostors;
    config.playerCount = validPlayers.length;
    localStorage.setItem('impostorGameConfig', JSON.stringify(config));
    
    // Notificar a window.updateConfig si existe
    if (window.updateConfig) {
      window.updateConfig('playerNames', validPlayers);
      window.updateConfig('maxImpostors', maxImpostors);
      window.updateConfig('playerCount', validPlayers.length);
    }
  };

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
    
    // Si estamos llenando el último campo, agregar uno nuevo (hasta 15)
    if (index === playerNames.length - 1 && 
        value.trim() !== '' && 
        playerNames.length < 15) {
      setPlayerNames([...newNames, '']);
    }
    
    // Si eliminamos el penúltimo y el último está vacío, eliminar el último
    if (index < playerNames.length - 1 && 
        value.trim() === '' && 
        playerNames.length > 4 &&
        playerNames[playerNames.length - 1] === '') {
      setPlayerNames(newNames.slice(0, -1));
    }
  };

  const handleImpostorSelect = (value: number) => {
    setMaxImpostors(value);
    if (window.updateConfig) {
      window.updateConfig('maxImpostors', value);
    }
  };

  const validPlayers = playerNames.filter(name => name.trim() !== '').length;

  return (
    <div class="bg-white rounded-2xl p-8 shadow-xl">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">¿Quiénes van a jugar?</h2>
      <p class="text-gray-600 mb-8">
        Escribe los nombres de los jugadores en orden. Se agregarán más campos automáticamente.
      </p>

      {/* Lista de nombres de jugadores */}
      <div class="mb-10">

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {playerNames.map((name, index) => (
            <div key={index} class="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(index, (e.target as HTMLInputElement).value)}
                placeholder={`Jugador ${index + 1}`}
                class="w-full p-4 pl-10 border-2 border-gray-200 rounded-xl 
                       focus:border-blue-300 focus:ring-2 focus:ring-blue-100 
                       transition-all outline-none text-gray-700
                       placeholder:text-gray-400"
                maxLength={20}
              />
              <div class="absolute left-3 top-1/2 transform -translate-y-1/2 
                        text-gray-400 font-medium">
                {index + 1}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Selector de impostores (dinámico según jugadores) */}
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">
          Límite de impostores
        </h3>
        <div class="grid grid-cols-3 gap-4">
          {availableImpostorOptions.includes(1) && (
            <button
              onClick={() => handleImpostorSelect(1)}
              disabled={!availableImpostorOptions.includes(1)}
              class={`impostor-option py-4 rounded-xl border-2 transition-all text-center ${
                maxImpostors === 1 && validPlayers >= 3
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              } ${!availableImpostorOptions.includes(1) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div class="text-2xl font-bold text-gray-700 mb-1">1</div>
              <div class="text-xs text-gray-500">3-5 jugadores</div>
            </button>
          )}

          {availableImpostorOptions.includes(2) && (
            <button
              onClick={() => handleImpostorSelect(2)}
              disabled={!availableImpostorOptions.includes(2)}
              class={`impostor-option py-4 rounded-xl border-2 transition-all text-center ${
                maxImpostors === 2
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              } ${!availableImpostorOptions.includes(2) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div class="text-2xl font-bold text-gray-700 mb-1">2</div>
              <div class="text-xs text-gray-500">6-8 jugadores</div>
            </button>
          )}

          {availableImpostorOptions.includes(3) && (
            <button
              onClick={() => handleImpostorSelect(3)}
              disabled={!availableImpostorOptions.includes(3)}
              class={`impostor-option py-4 rounded-xl border-2 transition-all text-center ${
                maxImpostors === 3
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              } ${!availableImpostorOptions.includes(3) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div class="text-2xl font-bold text-gray-700 mb-1">3</div>
              <div class="text-xs text-gray-500">9+ jugadores</div>
            </button>
          )}
        </div>
      </div>

      <style>
        {`
          .impostor-option {
            transition: all 0.3s ease;
          }
          
          .impostor-option:hover:not([disabled]) {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          }
          
          input[type="text"]:focus {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
        `}
      </style>
    </div>
  );
}

// Extender la interfaz Window para TypeScript
declare global {
  interface Window {
    updateConfig?: (key: string, value: any) => void;
  }
}