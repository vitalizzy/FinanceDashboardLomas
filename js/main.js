import { ErrorHandler } from './core/errors.js';
import { DashboardApp } from './app/DashboardApp.js';
import { registerGlobalActions } from './app/globalActions.js';

window._charts = window._charts || {};

const dashboardApp = new DashboardApp();
registerGlobalActions(dashboardApp);

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await dashboardApp.init();
    } catch (error) {
        ErrorHandler.handle(error);
    }
});
