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

export default class ImpostorGame {
    // Configuración inicial
    private originalPlayers: string[]; // Jugadores totales al inicio
    players: string[]; // Jugadores activos actuales
    maxImpostors: number;
    availableModes: string[];
    restrictions: string[];
    
    // Categorías para las palabras
    private selectedCategories: Category[] = [];
    
    // Estado del juego
    round: number;
    currentPlayerIndex: number;
    turnOrder: number[];
    secretWord: string;
    impostorWord: string; // Nueva: palabra para impostor
    rolesForRound: Map<string, string>; // jugador -> rol
    impostorsForRound: string[];
    isRoundActive: boolean;
    
    // Estadísticas de palabras
    private usedWords: Set<string> = new Set();
    private currentCategory?: Category;
    
    constructor(
        players: string[] = [],
        maxImpostors: number = 1,
        availableModes: string[] = [],
        restrictions: string[] = [],
        categories: Category[] = []
    ) {
        this.originalPlayers = [...players];
        this.players = [...players];
        this.maxImpostors = maxImpostors;
        this.availableModes = availableModes;
        this.restrictions = restrictions;
        this.selectedCategories = categories;
        
        // Estado inicial
        this.round = 0;
        this.currentPlayerIndex = 0;
        this.turnOrder = [];
        this.secretWord = '';
        this.impostorWord = '';
        this.rolesForRound = new Map();
        this.impostorsForRound = [];
        this.isRoundActive = false;
    }
    
    // Configura el juego inicial
    iniciarJuego(config: {
        players: string[],
        maxImpostors: number,
        availableModes: string[],
        restrictions: string[],
        categories?: Category[]
    }) {
        this.originalPlayers = [...config.players];
        this.players = [...config.players];
        this.maxImpostors = config.maxImpostors;
        this.availableModes = config.availableModes;
        this.restrictions = config.restrictions;
        this.selectedCategories = config.categories || [];
        this.round = 0;
        this.usedWords.clear();
        
        console.log(`Juego configurado con ${this.players.length} jugadores`);
        console.log(`Máximo de impostores: ${this.maxImpostors}`);
        console.log(`Categorías cargadas: ${this.selectedCategories.length}`);
        console.log(`Palabras totales disponibles: ${this.getTotalWordsCount()}`);
        console.log(this.selectedCategories);
    }
    
    // Obtiene el total de palabras disponibles en todas las categorías
    private getTotalWordsCount(): number {
        let total = 0;
        this.selectedCategories.forEach(category => {
            total += category.words.length;
            if (category.pairs) {
                total += category.pairs.length * 2;
            }
        });
        return total;
    }
    
    // Selecciona una palabra aleatoria del pool disponible
    private seleccionarPalabraAleatoria(): string {
        // Si no hay categorías, usar lista por defecto
        if (this.selectedCategories.length === 0) {
            const defaultWords = ['manzana', 'computadora', 'playa', 'montaña', 'libro', 'música'];
            return defaultWords[Math.floor(Math.random() * defaultWords.length)];
        }
        
        // Seleccionar una categoría aleatoria
        const randomCategory = this.selectedCategories[
            Math.floor(Math.random() * this.selectedCategories.length)
        ];
        
        // Incrementar contador de uso de la categoría
        randomCategory.count = (randomCategory.count || 0) + 1;
        randomCategory.lastUsed = new Date().toISOString();
        this.currentCategory = randomCategory;
        
        console.log(`Categoría seleccionada: ${randomCategory.name} (${randomCategory.type})`);
        
        // Seleccionar palabra según el tipo de categoría
        if (randomCategory.type === 'single') {
            // Para categorías de palabras sueltas
            const availableWords = randomCategory.words.filter(
                word => !this.usedWords.has(word)
            );
            
            if (availableWords.length === 0) {
                // Si todas las palabras fueron usadas, resetear
                this.usedWords.clear();
                return randomCategory.words[Math.floor(Math.random() * randomCategory.words.length)];
            }
            
            const selectedWord = availableWords[Math.floor(Math.random() * availableWords.length)];
            this.usedWords.add(selectedWord);
            return selectedWord;
            
        } else {
            // Para categorías mixtas
            // Decidir aleatoriamente si usar palabra suelta o par
            const useSingleWord = Math.random() < 0.5 || randomCategory.pairs?.length === 0;
            
            if (useSingleWord && randomCategory.words.length > 0) {
                const availableWords = randomCategory.words.filter(
                    word => !this.usedWords.has(word)
                );
                
                if (availableWords.length === 0) {
                    this.usedWords.clear();
                    return randomCategory.words[Math.floor(Math.random() * randomCategory.words.length)];
                }
                
                const selectedWord = availableWords[Math.floor(Math.random() * availableWords.length)];
                this.usedWords.add(selectedWord);
                return selectedWord;
                
            } else if (randomCategory.pairs && randomCategory.pairs.length > 0) {
                // Seleccionar un par aleatorio
                const randomPair = randomCategory.pairs[
                    Math.floor(Math.random() * randomCategory.pairs.length)
                ];
                
                // Marcar ambas palabras como usadas
                this.usedWords.add(randomPair.word);
                this.usedWords.add(randomPair.related);
                
                return randomPair.word; // Los tripulantes ven esta palabra
            }
        }
        
        // Fallback
        return 'palabra';
    }
    
    // Encuentra una palabra relacionada para el impostor
    private encontrarPalabraRelacionada(palabraTripulante: string): string {
        if (!this.currentCategory) {
            return 'IMPOSTOR';
        }
        
        // Buscar si la palabra está en algún par de la categoría actual
        if (this.currentCategory.pairs) {
            const pair = this.currentCategory.pairs.find(p => p.word === palabraTripulante);
            if (pair) {
                return pair.related; // Devolver la palabra relacionada del par
            }
            
            // Buscar inverso (por si la palabra es la "relacionada")
            const reversePair = this.currentCategory.pairs.find(p => p.related === palabraTripulante);
            if (reversePair) {
                return reversePair.word;
            }
        }
        
        // Si no hay par directo, buscar palabras relacionadas por categoría
        if (this.currentCategory.type === 'single') {
            // Para categorías de palabras sueltas, usar otra palabra de la misma categoría
            const otrasPalabras = this.currentCategory.words.filter(
                word => word !== palabraTripulante && !this.usedWords.has(word)
            );
            
            if (otrasPalabras.length > 0) {
                return otrasPalabras[Math.floor(Math.random() * otrasPalabras.length)];
            }
            
            // Si no hay otras palabras disponibles, usar la primera diferente
            const palabraDiferente = this.currentCategory.words.find(word => word !== palabraTripulante);
            if (palabraDiferente) {
                return palabraDiferente;
            }
        }
        
        // Fallback: buscar en todas las categorías
        for (const category of this.selectedCategories) {
            if (category === this.currentCategory) continue;
            
            // Buscar palabra similar (misma longitud o que empiece con misma letra)
            const palabraSimilar = category.words.find(word => 
                word.length === palabraTripulante.length || 
                word[0] === palabraTripulante[0]
            );
            
            if (palabraSimilar) {
                return palabraSimilar;
            }
        }
        
        return 'IMPOSTOR';
    }
    
    // Inicia una nueva ronda
    iniciarNuevaRonda(): {
        round: number,
        impostorsCount: number,
        message: string,
        turnOrder: string[],
        category?: string,
        palabraTripulante: string,
        palabraImpostor: string
    } {
        // RESET: Al comenzar nueva ronda, restaurar todos los jugadores originales
        this.players = [...this.originalPlayers];
        
        this.round++;
        this.isRoundActive = true;
        
        // Determinar cuántos impostores para esta ronda
        const impostorsCount = this.calcularImpostoresParaRonda();
        
        // Seleccionar palabra para tripulantes
        const palabraTripulante = this.seleccionarPalabraAleatoria();
        this.secretWord = palabraTripulante;
        
        // Determinar palabra para impostor (50% de chance de palabra relacionada)
        let palabraImpostor = 'IMPOSTOR';
        if (Math.random() < 0.5 && this.selectedCategories.length > 0) {
            palabraImpostor = this.encontrarPalabraRelacionada(palabraTripulante);
        }
        this.impostorWord = palabraImpostor;
        
        // Generar roles para todos los jugadores
        this.generarRolesParaRonda(impostorsCount);
        
        // Crear orden aleatorio de turnos
        this.turnOrder = this.generarOrdenTurnos();
        this.currentPlayerIndex = 0;
        
        const message = this.round === 1 
            ? "¡Primera ronda! Vamos con 1 impostor sin modalidades especiales."
            : `Ronda ${this.round}: ${impostorsCount} impostor(es)`;
        
        console.log(`=== INICIANDO RONDA ${this.round} ===`);
        console.log(`Categoría: ${this.currentCategory?.name || 'Aleatoria'}`);
        console.log(`Palabra para tripulantes: ${this.secretWord}`);
        console.log(`Palabra para impostor: ${this.impostorWord}`);
        console.log(`Jugadores activos: ${this.players.length}`);
        console.log(`Impostores: ${this.impostorsForRound.join(', ')}`);
        console.log(`Orden de turnos: ${this.getCurrentTurnOrder().join(' → ')}`);
        
        return {
            round: this.round,
            impostorsCount,
            message,
            turnOrder: this.getCurrentTurnOrder(),
            category: this.currentCategory?.name,
            palabraTripulante: this.secretWord,
            palabraImpostor: this.impostorWord
        };
    }
    
    // Calcula cuántos impostores habrá esta ronda
    private calcularImpostoresParaRonda(): number {
        if (this.round === 1) return 1;
        if (this.round <= 3) return Math.min(2, this.maxImpostors);
        if (this.round <= 6) return Math.min(3, this.maxImpostors);
        return Math.min(4, this.maxImpostors);
    }
    
    // Genera roles aleatorios para todos los jugadores
    private generarRolesParaRonda(impostorsCount: number) {
        this.rolesForRound.clear();
        this.impostorsForRound = [];
        
        // Crear copia aleatoria de jugadores
        const shuffledPlayers = [...this.players].sort(() => Math.random() - 0.5);
        
        // Asignar impostores
        for (let i = 0; i < impostorsCount && i < shuffledPlayers.length; i++) {
            const impostor = shuffledPlayers[i];
            this.rolesForRound.set(impostor, 'impostor');
            this.impostorsForRound.push(impostor);
        }
        
        // Resto son normales
        for (let i = impostorsCount; i < shuffledPlayers.length; i++) {
            this.rolesForRound.set(shuffledPlayers[i], 'normal');
        }
        
        console.log("Roles asignados:");
        this.rolesForRound.forEach((rol, jugador) => {
            console.log(`  ${jugador}: ${rol}`);
        });
    }
    
    // Genera un orden aleatorio pero secuencial para los turnos
    private generarOrdenTurnos(): number[] {
        // Generar un índice aleatorio para empezar
        const startIndex = Math.floor(Math.random() * this.players.length);
        
        // Crear array de índices [0, 1, 2, ..., n-1]
        const indices = Array.from({ length: this.players.length }, (_, i) => i);
        
        // Reorganizar para empezar desde startIndex y seguir en orden
        const turnOrder = [];
        for (let i = 0; i < this.players.length; i++) {
            const index = (startIndex + i) % this.players.length;
            turnOrder.push(index);
        }
        
        return turnOrder;
    }
    
    // Obtiene los nombres en el orden actual de turnos
    getCurrentTurnOrder(): string[] {
        return this.turnOrder.map(index => this.players[index]);
    }
    
    // Mueve al siguiente turno
    pasarTurno(): {
        nextPlayer: string | null,
        currentPlayer: string | null,
        isRoundComplete: boolean
    } {
        if (!this.isRoundActive) {
            return {
                nextPlayer: null,
                currentPlayer: null,
                isRoundComplete: true
            };
        }
        
        const currentPlayer = this.players[this.turnOrder[this.currentPlayerIndex]];
        
        // Avanzar al siguiente jugador
        this.currentPlayerIndex++;
        
        // Verificar si terminó la ronda
        if (this.currentPlayerIndex >= this.players.length) {
            this.isRoundActive = false;
            return {
                nextPlayer: null,
                currentPlayer: null,
                isRoundComplete: true
            };
        }
        
        const nextPlayer = this.players[this.turnOrder[this.currentPlayerIndex]];
        
        console.log(`Turno pasado. Ahora le toca a: ${nextPlayer}`);
        
        return {
            nextPlayer,
            currentPlayer: nextPlayer, // El que ahora tiene el turno
            isRoundComplete: false
        };
    }
    
    // Obtiene la información del jugador actual
    obtenerInfoJugadorActual(): {
        player: string,
        role: string,
        word: string,
        round: number,
        category?: string
    } {
        const playerIndex = this.turnOrder[this.currentPlayerIndex];
        const player = this.players[playerIndex];
        const role = this.rolesForRound.get(player) || 'normal';
        
        // Determinar qué palabra ve el jugador
        let word = this.secretWord;
        if (role === 'impostor') {
            word = this.impostorWord === 'IMPOSTOR' ? 'IMPOSTOR' : this.impostorWord;
        }
        
        return {
            player,
            role,
            word,
            round: this.round,
            category: this.currentCategory?.name
        };
    }
    
    // Obtiene información específica de un jugador (para mostrar en su turno)
    obtenerInfoParaJugador(jugador: string): {
        role: string,
        word: string,
        isYourTurn: boolean,
        category?: string
    } {
        const role = this.rolesForRound.get(jugador) || 'normal';
        const isYourTurn = this.players[this.turnOrder[this.currentPlayerIndex]] === jugador;
        
        let word = this.secretWord;
        if (role === 'impostor') {
            word = this.impostorWord === 'IMPOSTOR' ? 'IMPOSTOR' : this.impostorWord;
        }
        
        return {
            role,
            word,
            isYourTurn,
            category: this.currentCategory?.name
        };
    }
    
    // Elimina a un jugador y verifica condiciones de victoria
    sacarAAlguien(jugadorEliminado: string): {
        eliminated: string,
        wasImpostor: boolean,
        remainingImpostors: string[],
        remainingPlayers: string[],
        gameResult: string | null
    } {
        const wasImpostor = this.impostorsForRound.includes(jugadorEliminado);
        
        // Eliminar al jugador de la lista de jugadores activos
        const playerIndex = this.players.indexOf(jugadorEliminado);
        if (playerIndex > -1) {
            this.players.splice(playerIndex, 1);
        }
        
        // Eliminar de impostores si lo era
        if (wasImpostor) {
            const impostorIndex = this.impostorsForRound.indexOf(jugadorEliminado);
            if (impostorIndex > -1) {
                this.impostorsForRound.splice(impostorIndex, 1);
            }
        }
        
        // Eliminar de roles
        this.rolesForRound.delete(jugadorEliminado);
        
        // Recalcular turnOrder
        this.recalcularTurnOrder();
        
        // Verificar condiciones de victoria
        const gameResult = this.verificarCondicionesVictoria();
        
        console.log(`Jugador eliminado: ${jugadorEliminado}`);
        console.log(`¿Era impostor? ${wasImpostor}`);
        console.log(`Impostores restantes: ${this.impostorsForRound.length}`);
        console.log(`Jugadores activos restantes: ${this.players.length}`);
        console.log(`Jugadores totales originales: ${this.originalPlayers.length}`);
        
        return {
            eliminated: jugadorEliminado,
            wasImpostor,
            remainingImpostors: [...this.impostorsForRound],
            remainingPlayers: [...this.players],
            gameResult
        };
    }
    
    // Recalcula el orden de turnos después de eliminar a alguien
    private recalcularTurnOrder() {
        // Convertir índices actuales a jugadores
        const currentTurnOrderPlayers = this.turnOrder
            .map(index => this.players[index])
            .filter(player => player !== undefined);
        
        // Crear nuevo turnOrder basado en los jugadores actuales
        this.turnOrder = currentTurnOrderPlayers
            .map(player => this.players.indexOf(player))
            .filter(index => index !== -1);
        
        // Ajustar currentPlayerIndex si es necesario
        if (this.currentPlayerIndex >= this.turnOrder.length) {
            this.currentPlayerIndex = Math.max(0, this.turnOrder.length - 1);
        }
    }
    
    // Verifica si alguien ganó
    private verificarCondicionesVictoria(): string | null {
        // Si no hay impostores, ganan los tripulantes
        if (this.impostorsForRound.length === 0) {
            return 'TRIPULANTES_GANAN';
        }
        
        // Si hay igual o más impostores que tripulantes, ganan los impostores
        const tripulantesCount = this.players.length - this.impostorsForRound.length;
        if (this.impostorsForRound.length >= tripulantesCount) {
            return 'IMPOSTORES_GANAN';
        }
        
        // Si solo queda 1 jugador total
        if (this.players.length === 1) {
            const remainingPlayer = this.players[0];
            if (this.impostorsForRound.includes(remainingPlayer)) {
                return 'IMPOSTORES_GANAN';
            } else {
                return 'TRIPULANTES_GANAN';
            }
        }
        
        // El juego continúa
        return null;
    }
    
    // Obtiene las categorías seleccionadas
    obtenerCategoriasSeleccionadas(): Category[] {
        return [...this.selectedCategories];
    }
    
    // Para debugging o administración
    obtenerEstadoCompleto(): {
        round: number,
        players: string[], // Jugadores activos
        originalPlayers: string[], // Todos los jugadores
        impostors: string[],
        currentPlayer: string,
        turnOrder: string[],
        secretWord: string,
        impostorWord: string,
        currentCategory?: string,
        isRoundActive: boolean,
        categories: Category[],
        totalWordsAvailable: number
    } {
        return {
            round: this.round,
            players: [...this.players],
            originalPlayers: [...this.originalPlayers],
            impostors: [...this.impostorsForRound],
            currentPlayer: this.players[this.turnOrder[this.currentPlayerIndex]] || '',
            turnOrder: this.getCurrentTurnOrder(),
            secretWord: this.secretWord,
            impostorWord: this.impostorWord,
            currentCategory: this.currentCategory?.name,
            isRoundActive: this.isRoundActive,
            categories: [...this.selectedCategories],
            totalWordsAvailable: this.getTotalWordsCount()
        };
    }
    
    // Obtiene todos los jugadores (incluyendo eliminados)
    obtenerTodosLosJugadores(): string[] {
        return [...this.originalPlayers];
    }
    
    // Reinicia el juego completo
    reiniciarJuego() {
        this.originalPlayers = ['Juan', 'María', 'Pedro', 'Ana', 'Luis', 'Sofía'];
        this.players = [...this.originalPlayers];
        this.round = 0;
        this.currentPlayerIndex = 0;
        this.turnOrder = [];
        this.secretWord = '';
        this.impostorWord = '';
        this.rolesForRound.clear();
        this.impostorsForRound = [];
        this.isRoundActive = false;
        this.usedWords.clear();
        this.currentCategory = undefined;
        
        console.log("Juego reiniciado completamente");
    }
}