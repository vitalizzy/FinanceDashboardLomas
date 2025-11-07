/**
 * ============================================================================
 * ICON SYSTEM - Gestor de Iconos SVG
 * ============================================================================
 * 
 * Sistema centralizado para usar iconos SVG en toda la aplicación.
 * Proporciona métodos para insertar iconos como elementos DOM o como strings HTML.
 */

export const ICON_NAMES = {
    // Charts & Analytics
    CHART_LINE: 'chart-line',
    CHART_BAR: 'chart-bar',
    TRENDING_UP: 'trending-up',
    TRENDING_DOWN: 'trending-down',
    DOLLAR_SIGN: 'dollar-sign',
    
    // Actions
    DOWNLOAD: 'download',
    UPLOAD: 'upload',
    EDIT: 'edit',
    TRASH: 'trash',
    SETTINGS: 'settings',
    
    // Filters & Search
    FILTER: 'filter',
    SEARCH: 'search',
    
    // UI Controls
    CLOSE: 'x-close',
    CHECK: 'check',
    MENU: 'menu',
    CALENDAR: 'calendar',
    CLOCK: 'clock',
    
    // Navigation
    ARROW_UP: 'arrow-up',
    ARROW_DOWN: 'arrow-down',
    HOME: 'home',
    
    // Status & Feedback
    ALERT_CIRCLE: 'alert-circle',
    ALERT_TRIANGLE: 'alert-triangle',
    INFO: 'info',
    LOADER: 'loader',
    
    // Visibility
    EYE: 'eye',
    EYE_OFF: 'eye-off',
    
    // Theme
    SUN: 'sun',
    MOON: 'moon',
    
    // Tables
    TABLE: 'table'
};

/**
 * Clase para gestionar iconos SVG
 */
export class IconManager {
    constructor({ iconPath = 'assets/icons' } = {}) {
        this.iconPath = iconPath;
        this.cache = new Map();
    }

    /**
     * Obtiene la ruta del icono
     * @param {string} iconName - Nombre del icono (ej: 'chart-line')
     * @returns {string} Ruta del archivo SVG
     */
    getIconPath(iconName) {
        return `${this.iconPath}/${iconName}.svg`;
    }

    /**
     * Crea un elemento <img> con el icono
     * @param {string} iconName - Nombre del icono
     * @param {Object} options - Opciones adicionales
     * @returns {HTMLImageElement} Elemento img
     * 
     * @example
     * const img = iconManager.createIconImg('download', { 
     *     className: 'btn-icon', 
     *     alt: 'Descargar',
     *     width: 24,
     *     height: 24
     * });
     */
    createIconImg(iconName, options = {}) {
        const img = document.createElement('img');
        img.src = this.getIconPath(iconName);
        img.alt = options.alt || iconName;
        img.className = options.className || 'icon';
        
        if (options.width) img.width = options.width;
        if (options.height) img.height = options.height;
        if (options.title) img.title = options.title;
        
        return img;
    }

    /**
     * Crea un elemento <svg> inline (requiere fetch del SVG)
     * @param {string} iconName - Nombre del icono
     * @param {Object} options - Opciones adicionales
     * @returns {Promise<SVGElement>} Elemento SVG
     * 
     * @example
     * const svg = await iconManager.createIconSVG('download', {
     *     className: 'btn-icon',
     *     width: 24,
     *     height: 24,
     *     color: '#0066cc'
     * });
     */
    async createIconSVG(iconName, options = {}) {
        try {
            // Intentar obtener del caché
            let svgContent = this.cache.get(iconName);
            
            if (!svgContent) {
                // Fetch del archivo SVG
                const response = await fetch(this.getIconPath(iconName));
                if (!response.ok) throw new Error(`Icon not found: ${iconName}`);
                svgContent = await response.text();
                this.cache.set(iconName, svgContent);
            }

            // Crear elemento SVG desde el contenido
            const parser = new DOMParser();
            const doc = parser.parseFromString(svgContent, 'image/svg+xml');
            const svg = doc.documentElement;

            // Aplicar opciones
            if (options.className) svg.classList.add(...options.className.split(' '));
            if (options.width) svg.setAttribute('width', options.width);
            if (options.height) svg.setAttribute('height', options.height);
            if (options.viewBox) svg.setAttribute('viewBox', options.viewBox);

            // Aplicar color si se especifica
            if (options.color) {
                svg.style.stroke = options.color;
            }

            return svg;
        } catch (error) {
            console.error(`Error loading icon: ${iconName}`, error);
            // Retornar icono de fallback
            return this._createFallbackIcon(options);
        }
    }

    /**
     * Retorna el HTML del icono como string (para innerHTML)
     * @param {string} iconName - Nombre del icono
     * @param {Object} options - Opciones adicionales
     * @returns {string} HTML del icono
     * 
     * @example
     * const html = iconManager.getIconHTML('download', {
     *     className: 'btn-icon',
     *     width: 24
     * });
     * button.innerHTML = html + ' Descargar';
     */
    getIconHTML(iconName, options = {}) {
        const classes = options.className ? ` class="${options.className}"` : ' class="icon"';
        const width = options.width ? ` width="${options.width}"` : '';
        const height = options.height ? ` height="${options.height}"` : '';
        const attrs = `${classes}${width}${height}`;
        
        return `<img src="${this.getIconPath(iconName)}" alt="${options.alt || iconName}"${attrs} />`;
    }

    /**
     * Inserta un icono en un elemento existente
     * @param {HTMLElement} container - Elemento donde insertar el icono
     * @param {string} iconName - Nombre del icono
     * @param {Object} options - Opciones adicionales
     * 
     * @example
     * iconManager.insertIcon(button, 'download', { className: 'btn-icon' });
     */
    insertIcon(container, iconName, options = {}) {
        const icon = this.createIconImg(iconName, options);
        container.appendChild(icon);
    }

    /**
     * Icono de fallback en caso de error
     * @private
     */
    _createFallbackIcon(options = {}) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        
        if (options.className) svg.classList.add(...options.className.split(' '));
        if (options.width) svg.setAttribute('width', options.width);
        if (options.height) svg.setAttribute('height', options.height);

        // Crear un círculo genérico de fallback
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '12');
        circle.setAttribute('cy', '12');
        circle.setAttribute('r', '10');
        svg.appendChild(circle);

        return svg;
    }

    /**
     * Precargar múltiples iconos en el caché
     * @param {Array<string>} iconNames - Lista de nombres de iconos
     */
    async preloadIcons(iconNames) {
        const promises = iconNames.map(name =>
            fetch(this.getIconPath(name))
                .then(r => r.text())
                .then(content => this.cache.set(name, content))
                .catch(e => console.warn(`Failed to preload icon: ${name}`, e))
        );
        await Promise.all(promises);
    }

    /**
     * Obtener lista de todos los iconos disponibles
     */
    getAvailableIcons() {
        return Object.values(ICON_NAMES);
    }
}

/**
 * Instancia global del gestor de iconos
 * Usar como: window.iconManager.createIconImg('download')
 */
export const iconManager = new IconManager();

// Hacer disponible globalmente
window.iconManager = iconManager;
window.ICON_NAMES = ICON_NAMES;
