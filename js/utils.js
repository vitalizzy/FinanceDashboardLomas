/**
 * ============================================================================
 * UTILIDADES GENERALES
 * ============================================================================
 */

/**
 * Implementación de debounce para optimizar eventos repetitivos
 */
export function debounce(fn, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * Convierte un color hexadecimal a formato RGBA
 */
export function hexToRgba(hex, alpha = 1) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Parsea texto en formato TSV y lo convierte en array de objetos
 */
export function parseTSV(tsvText) {
    const lines = tsvText.split('\n');
    const headers = lines[0].split('\t');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = lines[i].split('\t');
            const row = {};
            headers.forEach((header, index) => {
                row[header.trim()] = values[index] ? values[index].trim() : '';
            });
            data.push(row);
        }
    }
    return data;
}

export function parseAmount(amountStr) {
    // Manejar valores null, undefined, o no-string
    if (!amountStr && amountStr !== 0) return 0;
    
    // Si ya es un número, devolverlo directamente
    if (typeof amountStr === 'number') return amountStr;
    
    // Convertir a string si no lo es
    const strValue = String(amountStr);
    if (strValue === '') return 0;
    
    // Limpiar y parsear
    let cleanStr = strValue.replace(/€/g, '').replace(/"/g, '').trim();
    if (!cleanStr) return 0;
    
    if (cleanStr.includes('.') && cleanStr.includes(',')) {
        cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
    } else if (cleanStr.includes(',') && !cleanStr.includes('.')) {
        cleanStr = cleanStr.replace(',', '.');
    }
    
    const result = parseFloat(cleanStr);
    return isNaN(result) ? 0 : result;
}

export function parseDate(dateStr) {
    if (!dateStr) return null;
    
    // Convertir a string si no lo es
    const strValue = String(dateStr).trim();
    if (!strValue) return null;
    
    let date;
    if (strValue.includes('/')) {
        const parts = strValue.split('/');
        date = new Date(parts[2], parts[1] - 1, parts[0]);
    } else {
        date = new Date(strValue);
    }
    return !isNaN(date.getTime()) ? date : null;
}
