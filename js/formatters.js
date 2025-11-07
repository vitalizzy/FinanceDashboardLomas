/**
 * ============================================================================
 * SISTEMA DE FORMATEO DE NÚMEROS
 * ============================================================================
 */

import { NUMBER_FORMAT_CONFIG } from './config.js';

// Cache de formateadores para optimizar rendimiento
const formatters = {
    number: new Intl.NumberFormat(NUMBER_FORMAT_CONFIG.locale, NUMBER_FORMAT_CONFIG.defaults.number),
    currency: new Intl.NumberFormat(NUMBER_FORMAT_CONFIG.locale, NUMBER_FORMAT_CONFIG.defaults.currency),
    percent: new Intl.NumberFormat(NUMBER_FORMAT_CONFIG.locale, NUMBER_FORMAT_CONFIG.defaults.percent)
};

export function formatNumber(value, minimumFractionDigits = null, maximumFractionDigits = null) {
    if (value === null || value === undefined || isNaN(value)) return '';
    
    if (minimumFractionDigits !== null || maximumFractionDigits !== null) {
        const options = {
            ...NUMBER_FORMAT_CONFIG.defaults.number,
            useGrouping: true
        };
        if (minimumFractionDigits !== null) options.minimumFractionDigits = minimumFractionDigits;
        if (maximumFractionDigits !== null) options.maximumFractionDigits = maximumFractionDigits;
        return new Intl.NumberFormat(NUMBER_FORMAT_CONFIG.locale, options).format(value);
    }

    return formatters.number.format(value);
}

export function formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return formatters.currency.format(0);
    }
    return formatters.currency.format(amount);
}

export function formatPercent(value) {
    if (value === null || value === undefined || isNaN(value)) return '0,0%';
    return formatters.percent.format(value);
}
