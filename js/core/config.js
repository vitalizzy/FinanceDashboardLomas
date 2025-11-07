/**
 * ============================================================================
 * CONFIGURACIÓN GLOBAL DE LA APLICACIÓN
 * ============================================================================
 */

export const APP_CONFIG = {
    // Data source
    DATA_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRbRz_jPWvTjSM4jmrlUdShW9JzuNagS1LaSQ43rUupeA4e6XbdEqg-UupxL7mn5lNwGftn_8FDPikX/pub?gid=1981585980&single=true&output=tsv',
    
    // Business constants
    TOTAL_HOMES: 160,
    
    // UI constants
    DEFAULT_ITEMS_PER_PAGE: 50,
    DEFAULT_SORT_COLUMN: 'F. Operativa',
    DEFAULT_SORT_DIRECTION: 'desc',
    DEFAULT_FILTER: 'current_year',
    
    // Performance
    SEARCH_DEBOUNCE_DELAY: 300,
    
    // Chart colors
    CHART_COLORS: {
        INCOME: '--color-ingresos',
        EXPENSES: '--color-gastos',
        PER_HOME: '--color-per-home',
        BALANCE: '--color-balance',
        SALDO_MINIMO: '--color-saldo-minimo'
    },
    
    // Date formats
    DATE_FORMAT_LOCALE: 'es-ES',
    DATE_FORMAT_OPTIONS: { day: '2-digit', month: 'long', year: 'numeric' },
    
    // Storage keys
    STORAGE_KEYS: {
        LANGUAGE: 'dashboardLanguage'
    },
    
    // Error messages
    ERROR_MESSAGES: {
        LOAD_FAILED: 'Error al cargar los datos',
        NO_DATA: 'No se encontraron datos en el archivo TSV',
        NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet',
        PARSE_ERROR: 'Error al procesar los datos'
    }
};

export const NUMBER_FORMAT_CONFIG = {
    locale: 'es-ES',
    currency: 'EUR',
    defaults: {
        number: {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: true
        },
        currency: {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: true
        },
        percent: {
            style: 'percent',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }
    }
};
