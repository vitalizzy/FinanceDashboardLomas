const GLOBAL_METHODS = {
    updateDashboard: app => app.updateDashboard(),
    clearAllFilters: app => app.handleClearAllFilters(),
    selectPendingCategory: (app, event, category) => app.handleSelectPendingCategory(event, category),
    selectPendingMonth: (app, event, month) => app.handleSelectPendingMonth(event, month),
    applyPendingSelection: app => app.handleApplyPendingSelection(),
    clearPendingSelection: app => app.handleClearPendingSelection(),
    exportToCSV: app => app.handleExportToCSV()
};

/**
 * Registers the public surface required by inline handlers on index.html.
 */
export function registerGlobalActions(appInstance) {
    Object.entries(GLOBAL_METHODS).forEach(([name, handler]) => {
        window[name] = (...args) => handler(appInstance, ...args);
    });

    console.log('✅ Global dashboard actions registered', Object.keys(GLOBAL_METHODS));
}
