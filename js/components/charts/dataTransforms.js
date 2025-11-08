/**
 * Transformaciones de datos reutilizables para los gráficos
 */

import { parseAmount, parseDate } from '../../core/utils.js';

/**
 * Get data by category for a specific KPI metric
 * @param {Array} data - Financial data
 * @param {string} metric - Metric key: 'gastos', 'ingresos', 'perHome', 'transacciones'
 * @returns {Array} Array of [category, value] pairs sorted by value descending
 */
export function getByCategoryByMetric(data, metric = 'gastos') {
    const categories = {};
    const fieldMap = {
        'gastos': 'Gastos',
        'ingresos': 'Ingresos',
        'perHome': 'per Home',
        'transacciones': null // Special case: count transactions
    };
    
    const field = fieldMap[metric] || 'Gastos';
    
    if (metric === 'transacciones') {
        // Count transactions per category
        data.forEach(item => {
            const category = item.Categoria || 'Sin categoría';
            categories[category] = (categories[category] || 0) + 1;
        });
    } else {
        // Sum metric values per category
        data.forEach(item => {
            const amount = parseAmount(item[field] || '0');
            if (amount > 0) {
                const category = item.Categoria || 'Sin categoría';
                categories[category] = (categories[category] || 0) + amount;
            }
        });
    }
    
    return Object.entries(categories)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);
}

export function getExpensesByCategory(data) {
    return getByCategoryByMetric(data, 'gastos');
}

export function getMonthlyFlow(data) {
    const monthlyData = {};
    
    data.forEach(item => {
        const date = parseDate(item['F. Operativa']);
        if (!date) return;
        
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                ingresos: 0,
                gastos: 0,
                perHome: 0,
                balances: []
            };
        }
        
        monthlyData[monthKey].gastos += parseAmount(item.Gastos || '0');
        monthlyData[monthKey].ingresos += parseAmount(item.Ingresos || '0');
        monthlyData[monthKey].perHome += parseAmount(item['per Home'] || '0');
        monthlyData[monthKey].balances.push({
            date: date.getTime(),
            balance: parseAmount(item['Saldo'] || '0')
        });
    });
    
    Object.keys(monthlyData).forEach(key => {
        const entry = monthlyData[key];
        if (entry.balances.length > 0) {
            entry.minBalance = Math.min(...entry.balances.map(b => b.balance));
            entry.balances.sort((a, b) => a.date - b.date);
            entry.finalBalance = entry.balances[entry.balances.length - 1].balance;
        } else {
            entry.minBalance = 0;
            entry.finalBalance = 0;
        }
        delete entry.balances;
    });
    
    return Object.entries(monthlyData).sort(([a], [b]) => a.localeCompare(b));
}
