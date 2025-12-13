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
    
    // Nuevas propiedades para almacenar impostores
    private storedImpostors: Map<number, string[]> = new Map(); // ronda -> impostores
    private roundImpostors: string[] = []; // Impostores de la ronda actual
    
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
        this.round = 3; // Cambié de 3 a 0 para empezar desde ronda 0
        this.currentPlayerIndex = 0;
        this.turnOrder = [];
        this.secretWord = '';
        this.impostorWord = '';
        this.rolesForRound = new Map();
        this.impostorsForRound = [];
        this.isRoundActive = false;
        this.roundImpostors = [];
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
        this.storedImpostors.clear();
        this.roundImpostors = [];
        
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
    
    // Verifica si existe una palabra relacionada para la palabra dada
    private existePalabraRelacionada(palabraTripulante: string): boolean {
        if (!this.currentCategory) {
            return false;
        }
        
        // Buscar si la palabra está en algún par de la categoría actual
        if (this.currentCategory.pairs) {
            const pair = this.currentCategory.pairs.find(p => p.word === palabraTripulante);
            if (pair) {
                return true;
            }
            
            // Buscar inverso (por si la palabra es la "relacionada")
            const reversePair = this.currentCategory.pairs.find(p => p.related === palabraTripulante);
            if (reversePair) {
                return true;
            }
        }
        
        // Si la categoría es de palabras sueltas, buscar otra palabra diferente
        if (this.currentCategory.type === 'single') {
            const otrasPalabras = this.currentCategory.words.filter(
                word => word !== palabraTripulante && !this.usedWords.has(word)
            );
            return otrasPalabras.length > 0;
        }
        
        return false;
    }
    
    // Inicia una nueva ronda
    iniciarNuevaRonda(): {
        round: number,
        impostorsCount: number,
        message: string,
        turnOrder: string[],
        category?: string,
        palabraTripulante: string,
        palabraImpostor: string,
        roundImpostors: string[] // Nuevo: impostores de esta ronda
    } {
        // RESET: Al comenzar nueva ronda, restaurar todos los jugadores originales
        this.players = [...this.originalPlayers];
        
        // Limpiar impostores de la ronda anterior
        this.roundImpostors = [];
        
        this.round++;
        this.isRoundActive = true;
        
        // Determinar cuántos impostores para esta ronda
        const impostorsCount = this.calcularImpostoresParaRonda();
        
        // Seleccionar palabra para tripulantes
        let palabraTripulante = '';
        let palabraImpostor = 'IMPOSTOR';
        let intentos = 0;
        const maxIntentos = 10; // Límite de intentos para evitar bucle infinito
        
        // Intentar seleccionar una palabra que tenga relación disponible
        do {
            palabraTripulante = this.seleccionarPalabraAleatoria();
            
            // Verificar si existe palabra relacionada para esta palabra
            if (this.round >= 3 && this.selectedCategories.length > 0) {
                if (this.existePalabraRelacionada(palabraTripulante)) {
                    palabraImpostor = this.encontrarPalabraRelacionada(palabraTripulante);
                    break; // Salir del bucle si encontramos palabra con relación
                }
            } else {
                // Para rondas 1 y 2, o si no hay categorías seleccionadas
                break;
            }
            
            intentos++;
        } while (intentos < maxIntentos);
        
        // Si después de los intentos no encontramos palabra con relación,
        // usar la última palabra seleccionada
        if (intentos >= maxIntentos) {
            console.warn(`No se encontró palabra con relación después de ${maxIntentos} intentos. Usando palabra sin relación.`);
        }
        
        this.secretWord = palabraTripulante;
        this.impostorWord = palabraImpostor;
        
        // Generar roles para todos los jugadores
        this.generarRolesParaRonda(impostorsCount);
        
        // Almacenar impostores de esta ronda
        this.roundImpostors = [...this.impostorsForRound];
        this.storedImpostors.set(this.round, [...this.impostorsForRound]);
        
        // Crear orden aleatorio de turnos
        this.turnOrder = this.generarOrdenTurnos();
        this.currentPlayerIndex = 0;
        
        const message = this.round === 1 
            ? "¡Primera ronda! Vamos con 1 impostor sin modalidades especiales."
            : this.round === 2
            ? "¡Segunda ronda! Aún sin palabras relacionadas para impostores."
            : `Ronda ${this.round}: ${impostorsCount} impostor(es) con palabra relacionada`;
        
        console.log(`=== INICIANDO RONDA ${this.round} ===`);
        console.log(`Categoría: ${this.currentCategory?.name || 'Aleatoria'}`);
        console.log(`Palabra para tripulantes: ${this.secretWord}`);
        console.log(`Palabra para impostor: ${this.impostorWord}`);
        console.log(`Tiene palabra relacionada: ${palabraImpostor !== 'IMPOSTOR'}`);
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
            palabraImpostor: this.impostorWord,
            roundImpostors: [...this.roundImpostors]
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
        category?: string,
        palabraAyuda?: string
    } {
        const playerIndex = this.turnOrder[this.currentPlayerIndex];
        const player = this.players[playerIndex];
        const role = this.rolesForRound.get(player) || 'normal';
        
        // Determinar qué palabra ve el jugador
        let word = this.secretWord;
        let palabraAyuda = undefined;
        
        if (role === 'impostor') {
            word = this.impostorWord === 'IMPOSTOR' ? 'IMPOSTOR' : this.impostorWord;
            
            // Si el impostor tiene palabra relacionada, mostrar ayuda
            if (this.impostorWord !== 'IMPOSTOR') {
                palabraAyuda = this.impostorWord;
            }
        }
        
        return {
            player,
            role,
            word,
            round: this.round,
            category: this.currentCategory?.name,
            palabraAyuda
        };
    }
    
    // Obtiene información específica de un jugador (para mostrar en su turno)
    obtenerInfoParaJugador(jugador: string): {
        role: string,
        word: string,
        isYourTurn: boolean,
        category?: string,
        palabraAyuda?: string
    } {
        const role = this.rolesForRound.get(jugador) || 'normal';
        const isYourTurn = this.players[this.turnOrder[this.currentPlayerIndex]] === jugador;
        
        let word = this.secretWord;
        let palabraAyuda = undefined;
        
        if (role === 'impostor') {
            word = this.impostorWord === 'IMPOSTOR' ? 'IMPOSTOR' : this.impostorWord;
            
            // Si el impostor tiene palabra relacionada, mostrar ayuda
            if (this.impostorWord !== 'IMPOSTOR') {
                palabraAyuda = `Eres el IMPOSTOR. Los tripulantes ven: "${this.secretWord}". Tú ves: "${this.impostorWord}". Tu misión es no ser descubierto.`;
            }
        }
        
        return {
            role,
            word,
            isYourTurn,
            category: this.currentCategory?.name,
            palabraAyuda
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
    
    // Método para obtener la información del impostor
    obtenerInfoImpostor(jugador: string): {
        esImpostor: boolean,
        palabra: string,
        palabraAyuda?: string
    } {
        const esImpostor = this.impostorsForRound.includes(jugador);
        let palabra = '';
        let palabraAyuda = undefined;
        
        if (esImpostor) {
            palabra = this.impostorWord;
            // Si el impostor tiene palabra relacionada (no es "IMPOSTOR")
            if (this.impostorWord !== 'IMPOSTOR') {
                palabraAyuda = `Tu palabra es: "${this.impostorWord}". Recuerda que los tripulantes ven: "${this.secretWord}"`;
            }
        }
        
        return {
            esImpostor,
            palabra,
            palabraAyuda
        };
    }
    
    // Método para preguntar quiénes son los impostores en la ronda
    obtenerImpostoresRonda(): {
        round: number,
        impostors: string[],
        count: number,
        palabraTripulante: string,
        palabraImpostor: string,
        category?: string
    } {
        return {
            round: this.round,
            impostors: [...this.roundImpostors],
            count: this.roundImpostors.length,
            palabraTripulante: this.secretWord,
            palabraImpostor: this.impostorWord,
            category: this.currentCategory?.name
        };
    }
    
    // Método para obtener todos los impostores almacenados por ronda
    obtenerTodosLosImpostores(): Array<{
        round: number,
        impostors: string[],
        palabraTripulante: string,
        palabraImpostor: string,
        category?: string
    }> {
        const result = [];
        for (const [round, impostors] of this.storedImpostors.entries()) {
            // Para almacenar las palabras necesitaríamos otro mapa
            // Por ahora devolvemos la información disponible
            const roundInfo = {
                round: Number(round),
                impostors,
                palabraTripulante: 'No disponible en historial',
                palabraImpostor: 'No disponible en historial',
                category: 'No disponible en historial'
            };
            result.push(roundInfo);
        }
        return result;
    }
    
    // Método específico para obtener información del impostor (si lo es)
    obtenerInfoImpostorSiEs(jugador: string): {
        esImpostor: boolean,
        info?: {
            palabraTripulante: string,
            palabraImpostor: string,
            ayuda: string
        }
    } {
        const esImpostor = this.impostorsForRound.includes(jugador);
        
        if (!esImpostor) {
            return { esImpostor: false };
        }
        
        // Si es impostor y tiene palabra relacionada
        if (this.impostorWord !== 'IMPOSTOR') {
            return {
                esImpostor: true,
                info: {
                    palabraTripulante: this.secretWord,
                    palabraImpostor: this.impostorWord,
                    ayuda: `Como impostor, conoces que los tripulantes tienen la palabra "${this.secretWord}". Tu palabra es "${this.impostorWord}". ¡No dejes que te descubran!`
                }
            };
        }
        
        // Si es impostor normal (sin palabra relacionada)
        return {
            esImpostor: true,
            info: {
                palabraTripulante: this.secretWord,
                palabraImpostor: 'IMPOSTOR',
                ayuda: 'Eres el impostor. Los tripulantes tienen una palabra secreta que tú no conoces. ¡Intenta no ser descubierto!'
            }
        };
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
        totalWordsAvailable: number,
        storedImpostors: Array<{round: number, impostors: string[]}> // Nuevo
    } {
        const storedImpostorsArray = [];
        for (const [round, impostors] of this.storedImpostors.entries()) {
            storedImpostorsArray.push({
                round: Number(round),
                impostors: [...impostors]
            });
        }
        
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
            totalWordsAvailable: this.getTotalWordsCount(),
            storedImpostors: storedImpostorsArray
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
        this.storedImpostors.clear();
        this.roundImpostors = [];
        
        console.log("Juego reiniciado completamente");
    }
}