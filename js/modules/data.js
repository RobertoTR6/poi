// --- /js/modules/data.js ---
const DB_KEY = 'insnsb_app_db';
let DATABASE = null; // Almacenará la base de datos en memoria

/**
 * Carga la base de datos desde localStorage. Si no existe,
 * la inicializa desde el archivo JSON de datos iniciales.
 */
async function loadDb() {
    let dbJson = localStorage.getItem(DB_KEY);
    if (!dbJson) {
        console.log("Inicializando base de datos desde initial-data.json...");
        // La URL es relativa al HTML que carga el script (index.html)
        const response = await fetch('data/initial-data.json');
        const initialData = await response.json();
        dbJson = JSON.stringify(initialData);
        localStorage.setItem(DB_KEY, dbJson);
    }
    DATABASE = JSON.parse(dbJson);
}

/**
 * Guarda el estado actual de la base de datos en memoria a localStorage.
 */
function saveDb() {
    if (DATABASE) {
        localStorage.setItem(DB_KEY, JSON.stringify(DATABASE));
    }
}

// ---- API Pública del Servicio de Datos ----
export const dataService = {
    // Método para asegurar que la BD está cargada antes de cualquier operación
    async init() {
        if (!DATABASE) {
            await loadDb();
        }
    },
    
    // Métodos Genéricos CRUD
    async getAll(collection) {
        await this.init();
        return [...(DATABASE[collection] || [])]; // Retorna una copia para evitar mutaciones directas
    },

    async getById(collection, id) {
        await this.init();
        return DATABASE[collection]?.find(item => item.id === id);
    },

    // --- FUNCIÓN 'add' MODIFICADA PARA SER MÁS ROBUSTA ---
    async add(collection, newItem) {
        await this.init();
        newItem.id = newItem.id || `${collection.slice(0, 2)}-${Date.now()}`;
        
        // Si la colección no existe, créala sobre la marcha.
        if (!DATABASE[collection]) {
            console.warn(`DataService: La colección "${collection}" no existía. Creándola sobre la marcha.`);
            DATABASE[collection] = [];
        }

        DATABASE[collection].push(newItem);
        saveDb();
        return newItem;
    },
    
    async update(collection, updatedItem) {
        await this.init();
        const index = DATABASE[collection].findIndex(item => item.id === updatedItem.id);
        if (index > -1) {
            DATABASE[collection][index] = updatedItem;
            saveDb();
            return updatedItem;
        }
        return null;
    },

    async delete(collection, id) {
        await this.init();
        const initialLength = DATABASE[collection].length;
        DATABASE[collection] = DATABASE[collection].filter(item => item.id !== id);
        if (DATABASE[collection].length < initialLength) {
            saveDb();
            return true;
        }
        return false;
    },
    
    // Métodos específicos que usan los genéricos
    async getUnidadPorCodigo(codigo) { const all = await this.getAll('unidades'); return all.find(u => u.codigo === codigo); },
    async getSubunidadPorCodigo(codigo) { const all = await this.getAll('subunidades'); return all.find(s => s.codigo === codigo); },
    async getSubunidadesPorUnidad(unidadCodigo) { const all = await this.getAll('subunidades'); return all.filter(s => s.unidadCodigo === unidadCodigo); },
    async getCentroDeCostoPorCodigo(codigo) { const all = await this.getAll('centrosDeCosto'); return all.find(c => c.codigo === codigo); },
    async getCentrosDeCostoPorSubunidad(subunidadCodigo) { const all = await this.getAll('centrosDeCosto'); return all.filter(c => c.subunidadCodigo === subunidadCodigo); },
    async getPlanPorId(id) { return this.getById('planes', id); },
    async getOeiPorCodigo(codigo) { const all = await this.getAll('oeis'); return all.find(o => o.codigo === codigo); }
};