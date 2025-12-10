import { useEffect, useState } from 'preact/hooks';
import rolesData from '../../data/roleSelector.json';

interface Role {
  id: string;
  name: string;
  description: string;
  type: 'civil' | 'impostor' | 'neutral' | 'especial';
  difficulty: 'baja' | 'media' | 'alta';
  icon?: string;
}

interface RoleSelectorProps {
  roles?: Role[];
}

export default function RoleSelector({ roles: propRoles }: RoleSelectorProps) {
  // Usar datos del JSON si no se pasan como prop
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [autoAssign, setAutoAssign] = useState(true);
  const [maxRoles, setMaxRoles] = useState(3);
  const roles = propRoles || rolesData.roles.slice(0, 11); // Primeros 11 roles por defecto

  // Cargar selección guardada al montar
  useEffect(() => {
    const savedConfig = localStorage.getItem('impostorGameConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.selectedRoles) {
          setSelectedRoles(config.selectedRoles);
        }
        if (config.autoAssignRoles !== undefined) {
          setAutoAssign(config.autoAssignRoles);
        }
        if (config.maxRoles) {
          setMaxRoles(config.maxRoles);
        }
      } catch (error) {
        console.error('Error al cargar configuración:', error);
      }
    }
  }, []);

  // Guardar cambios en localStorage
  useEffect(() => {
    const config = JSON.parse(localStorage.getItem('impostorGameConfig') || '{}');
    config.selectedRoles = selectedRoles;
    config.autoAssignRoles = autoAssign;
    config.maxRoles = maxRoles;
    localStorage.setItem('impostorGameConfig', JSON.stringify(config));
    
    // Actualizar configuración global
    if (window.updateConfig) {
      window.updateConfig('selectedRoles', selectedRoles);
      window.updateConfig('autoAssignRoles', autoAssign);
      window.updateConfig('maxRoles', maxRoles);
    }
  }, [selectedRoles, autoAssign, maxRoles]);

  const toggleRole = (roleId: string) => {
    if (autoAssign) return;
    
    if (selectedRoles.includes(roleId)) {
      // Deseleccionar rol
      setSelectedRoles(prev => prev.filter(id => id !== roleId));
    } else {
      // Verificar si se puede agregar más roles
      if (selectedRoles.length >= maxRoles) {
        return; // No hacer nada, ya se alcanzó el límite
      }
      // Agregar rol
      setSelectedRoles(prev => [...prev, roleId]);
    }
  };

  const handleAutoAssignToggle = (isAuto: boolean) => {
    setAutoAssign(isAuto);
    if (isAuto) {
      // Limpiar selección manual si se activa auto asignación
      setSelectedRoles([]);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'civil': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'impostor': return 'bg-red-100 text-red-800 border-red-200';
      case 'neutral': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'especial': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'civil': return 'Civil';
      case 'impostor': return 'Impostor';
      case 'neutral': return 'Neutral';
      case 'especial': return 'Especial';
      default: return type;
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'baja': return 'Fácil';
      case 'media': return 'Media';
      case 'alta': return 'Difícil';
      default: return difficulty;
    }
  };

  const getDifficultyClasses = (difficulty: string) => {
    switch (difficulty) {
      case 'baja': return 'bg-green-100 text-green-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'alta': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Verificar si una opción está deshabilitada
  const isRoleDisabled = (roleId: string) => {
    if (autoAssign) return true;
    if (selectedRoles.includes(roleId)) return false; // Los ya seleccionados se pueden deseleccionar
    return selectedRoles.length >= maxRoles; // Deshabilitar si se alcanzó el límite
  };

  return (
    <div class="bg-white rounded-2xl p-8 shadow-xl">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Configura los Roles</h2>
      <p class="text-gray-600 mb-8">
        Selecciona qué roles especiales estarán disponibles en la partida. Estos agregarán nuevas mecánicas y estrategias.
      </p>

      {/* Contador de roles seleccionados */}
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div class="flex flex-col justify-between">
          <div>
            <h4 class="font-semibold text-blue-800 mb-1">
              Roles seleccionados: <span class={`text-xl font-bold ${selectedRoles.length === maxRoles ? 'text-red-600' : 'text-blue-600'}`}>
                {selectedRoles.length}
              </span>/{maxRoles}
            </h4>
          </div>
          <div class="flex  flex-col space-x-4">
            <span class="text-sm text-gray-600 font-medium">Límite máximo:</span>
            <div class="flex items-center space-x-2 p-1 rounded-lg ">
              {[2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  onClick={() => {
                    setMaxRoles(num);
                    // Si hay más roles seleccionados que el nuevo límite, eliminar los extras
                    if (selectedRoles.length > num) {
                      setSelectedRoles(prev => prev.slice(0, num));
                    }
                  }}
                  class={`w-8 h-8 rounded-full flex items-center justify-center font-medium transition-all ${
                    maxRoles === num
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'bg-gray-300 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de roles */}
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Roles Disponibles</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map(role => {
            const isSelected = selectedRoles.includes(role.id);
            const isDisabled = isRoleDisabled(role.id);
            
            return (
              <div
                key={role.id}
                onClick={() => !isDisabled && toggleRole(role.id)}
                class={`role-card border-2 rounded-xl p-4 transition-all ${
                  isDisabled
                    ? 'opacity-60 cursor-not-allowed border-gray-100 bg-gray-50'
                    : 'cursor-pointer hover:shadow-lg'
                } ${
                  isSelected
                    ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                style={isDisabled ? { pointerEvents: 'none' } : {}}
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <h4 class={`font-semibold ${isDisabled ? 'text-gray-500' : 'text-gray-800'}`}>
                      {role.name}
                    </h4>
                    <span class={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getTypeColor(role.type)}`}>
                      {getTypeText(role.type)}
                    </span>
                  </div>
                  <div class={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-transparent shadow-sm'
                      : isDisabled
                      ? 'border-gray-300 bg-gray-100'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}>
                    {isSelected ? (
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isDisabled && selectedRoles.length >= maxRoles ? (
                      <span class="text-xs text-gray-500">✗</span>
                    ) : null}
                  </div>
                </div>
                <p class={`text-sm mb-3 ${isDisabled ? 'text-gray-500' : 'text-gray-600'}`}>
                  {role.description}
                </p>
                <div class="flex items-center justify-between">
                  <span class={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyClasses(role.difficulty)} ${isDisabled ? 'opacity-75' : ''}`}>
                    Dificultad: {getDifficultyText(role.difficulty)}
                  </span>
                  <div class="flex items-center space-x-1">
                    {isDisabled && !isSelected && (
                      <span class="text-xs text-gray-500 flex items-center">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Límite alcanzado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modo aleatorio de asignación */}
      <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-semibold text-gray-800 mb-1">Asignación Automática de Roles</h4>
            <p class="text-sm text-gray-600">
              {autoAssign 
                ? 'Los roles se asignarán aleatoriamente según el número de jugadores'
                : 'Selecciona manualmente los roles que quieres en la partida'}
            </p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoAssign}
              onChange={(e) => handleAutoAssignToggle((e.target as HTMLInputElement).checked)}
              class="sr-only peer"
            />
            <div class="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-purple-600 transition-colors"></div>
            <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6 shadow-sm"></div>
          </label>
        </div>
        
        {autoAssign && (
          <div class="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <p class="text-sm text-blue-700">
              <span class="font-semibold">Nota:</span> Con la asignación automática activada, 
              el sistema elegirá {maxRoles} rol(es) aleatoriamente entre todos los disponibles.
            </p>
          </div>
        )}
      </div>

      {/* Indicador visual del límite */}
      {selectedRoles.length === maxRoles && !autoAssign && (
        <div class="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span class="text-sm text-yellow-700 font-medium">
              Has alcanzado el límite de {maxRoles} roles. Para seleccionar otro rol, primero deselecciona uno.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Declarar la interfaz global para TypeScript
declare global {
  interface Window {
    updateConfig?: (key: string, value: any) => void;
  }
}