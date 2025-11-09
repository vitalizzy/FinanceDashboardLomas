# OAuth 2.0 Implementation Guide for Google Sheets API

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup Steps](#setup-steps)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Modifications](#frontend-modifications)
6. [Security Considerations](#security-considerations)
7. [Testing & Deployment](#testing--deployment)

---

## Overview

OAuth 2.0 es un protocolo de autorización que permite a los usuarios autenticarse y autorizar aplicaciones de terceros para acceder a sus recursos sin exponer sus credenciales.

**Problemas actuales sin OAuth 2.0:**
- ❌ URL del Google Sheet visible en el código del cliente
- ❌ Cualquier usuario puede acceder directamente al Sheet
- ❌ Sin control de autenticación
- ❌ Sin auditoría de quién accede a qué datos

**Ventajas con OAuth 2.0:**
- ✅ Credenciales seguras en el servidor
- ✅ Autenticación de usuarios
- ✅ Control granular de permisos
- ✅ Auditoría y logging
- ✅ Cumplimiento de regulaciones (GDPR, etc.)

---

## Architecture

### Flujo de OAuth 2.0 con Google Sheets

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO/NAVEGADOR                        │
│                                                                 │
│  1. Inicia sesión                                              │
│  5. Recibe token JWT                                           │
│  7. Usa token para pedir datos                                │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ HTTP/HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TU SERVIDOR (Backend)                        │
│                                                                 │
│  - Express.js / Node.js                                        │
│  - Maneja OAuth 2.0 flow                                       │
│  - Almacena credenciales de Google                             │
│  - Autentica usuarios                                          │
│  - Autoriza acceso a Google Sheets                             │
│  - Implementa lógica de negocio                                │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ Google Sheets API v4
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE SHEETS API                            │
│                                                                 │
│  - Datos protegidos                                            │
│  - Solo acceso autorizado                                      │
│  - Auditoría de cambios                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Tipos de OAuth 2.0 Flow

Para esta aplicación, recomendamos:

**Opción 1: Service Account (Recomendado)**
- ✅ Simple implementación
- ✅ Sin intervención del usuario
- ✅ Ideal para datos internos/de empresa
- ⚠️ Menos control granular por usuario

**Opción 2: User OAuth Flow**
- ✅ Máximo control y seguridad
- ✅ Cada usuario se autentica con Google
- ⚠️ Más complejo de implementar
- ⚠️ Requiere que usuarios tengan cuenta Google

---

## Setup Steps

### 1. Google Cloud Console Setup

#### 1.1 Crear un proyecto
```bash
# En Google Cloud Console (console.cloud.google.com)
1. Crear nuevo proyecto: "FinanceDashboard"
2. Esperar a que se cree
3. Seleccionar el proyecto
```

#### 1.2 Habilitar Google Sheets API
```bash
1. Ir a "APIs & Services" → "Library"
2. Buscar "Google Sheets API"
3. Hacer clic en "Enable"
4. Ir a "Google Drive API" → "Enable"
```

#### 1.3 Crear Service Account (Opción 1)
```bash
1. Ir a "APIs & Services" → "Credentials"
2. Hacer clic en "Create Credentials" → "Service Account"
3. Rellenar nombre: "FinanceDashboard-Service"
4. Hacer clic en "Create and Continue"
5. Hacer clic en "Continue" (sin asignar roles aquí)
6. En la sección "Service Accounts", hacer clic en el email creado
7. Ir a "Keys" → "Add Key" → "Create new key"
8. Seleccionar "JSON"
9. Guardar el archivo en el servidor como `google-credentials.json`
```

#### 1.4 Compartir el Sheet con el Service Account
```bash
1. Copiar el email del Service Account (email-algo@project.iam.gserviceaccount.com)
2. Abrir tu Google Sheet
3. Hacer clic en "Share"
4. Pegar el email
5. Asignar permisos (Editor)
6. Enviar
```

### 2. Backend Setup

#### 2.1 Instalar dependencias

```bash
# En el servidor (Node.js)
npm install express jsonwebtoken dotenv google-auth-library googleapis cors
npm install --save-dev nodemon

# Para manejo de sesiones (opcional pero recomendado)
npm install express-session passport passport-google-oauth20
```

#### 2.2 Variables de entorno

Crear archivo `.env` en la raíz del servidor:

```env
# Google Sheets
GOOGLE_SHEET_ID=tu_id_del_sheet_aqui
GOOGLE_CREDENTIALS_PATH=./google-credentials.json

# JWT
JWT_SECRET=tu_secreto_super_seguro_aleatorio
JWT_EXPIRATION=7d

# Server
PORT=3001
NODE_ENV=production

# CORS
FRONTEND_URL=https://tu-dominio.com
```

**⚠️ IMPORTANTE**: Nunca commitear `.env` a git. Agregarlo a `.gitignore`:

```
# .gitignore
.env
.env.local
google-credentials.json
node_modules/
```

---

## Backend Implementation

### 1. Service Account Approach (Recomendado para datos internos)

#### 1.1 server.js - Configuración básica

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());

// Cargar credenciales de Google
const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH;
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

// Crear cliente de Google
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

const sheets = google.sheets({ version: 'v4', auth });

// =====================================
// MIDDLEWARE DE AUTENTICACIÓN
// =====================================

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido o expirado' });
        }
        req.user = user;
        next();
    });
}

// =====================================
// RUTAS DE AUTENTICACIÓN
// =====================================

/**
 * POST /api/auth/login
 * Autentica un usuario (en producción, usar OAuth 2.0)
 */
app.post('/api/auth/login', (req, res) => {
    // En una aplicación real, validarías credenciales contra una BD
    // Para demostración, aceptamos cualquier usuario
    
    const user = {
        id: req.body.userId || 'user123',
        email: req.body.email || 'user@example.com',
        role: req.body.role || 'viewer' // 'viewer', 'editor', 'admin'
    };

    // Generar JWT
    const token = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION
    });

    res.json({
        token,
        user,
        expiresIn: process.env.JWT_EXPIRATION
    });
});

/**
 * POST /api/auth/verify
 * Verifica si un token es válido
 */
app.post('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({
        valid: true,
        user: req.user
    });
});

// =====================================
// RUTAS DE DATOS (Google Sheets)
// =====================================

/**
 * GET /api/data/transactions
 * Obtiene las transacciones del Google Sheet
 * Solo accesible con token válido
 */
app.get('/api/data/transactions', authenticateToken, async (req, res) => {
    try {
        console.log(`📊 Fetching data for user: ${req.user.email}`);

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Sheet1!A:Z' // Ajusta según tu estructura
        });

        const rows = response.data.values;

        if (!rows || rows.length === 0) {
            return res.json({ data: [] });
        }

        // Transformar a formato estructurado
        const headers = rows[0];
        const data = rows.slice(1).map(row => {
            const item = {};
            headers.forEach((header, index) => {
                item[header] = row[index] || '';
            });
            return item;
        });

        res.json({ data });

    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ 
            error: 'Error al obtener datos',
            details: error.message 
        });
    }
});

/**
 * GET /api/data/summary
 * Obtiene datos resumidos (con posible caché)
 */
app.get('/api/data/summary', authenticateToken, async (req, res) => {
    try {
        // Implementar lógica de cálculo en backend
        // en lugar de en el cliente
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Summary!A:Z'
        });

        res.json({ data: response.data.values || [] });

    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ 
            error: 'Error al obtener resumen'
        });
    }
});

/**
 * POST /api/data/update
 * Actualiza datos en el Google Sheet (si el usuario es editor)
 */
app.post('/api/data/update', authenticateToken, async (req, res) => {
    // Verificar permisos
    if (req.user.role !== 'editor' && req.user.role !== 'admin') {
        return res.status(403).json({ 
            error: 'No tienes permiso para editar datos' 
        });
    }

    try {
        const { range, values } = req.body;

        // Validar entrada
        if (!range || !values) {
            return res.status(400).json({ 
                error: 'Falta información de actualización' 
            });
        }

        // Log de auditoría
        console.log(`📝 User ${req.user.email} updating range: ${range}`);

        const response = await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range,
            valueInputOption: 'RAW',
            resource: { values }
        });

        res.json({ 
            success: true,
            updatedCells: response.data.updatedCells 
        });

    } catch (error) {
        console.error('Error updating data:', error);
        res.status(500).json({ 
            error: 'Error al actualizar datos' 
        });
    }
});

// =====================================
// MANEJO DE ERRORES
// =====================================

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Error interno del servidor' 
    });
});

// =====================================
// INICIAR SERVIDOR
// =====================================

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
    console.log(`📊 Google Sheet ID: ${process.env.GOOGLE_SHEET_ID}`);
});
```

#### 1.2 package.json

```json
{
  "name": "finance-dashboard-backend",
  "version": "1.0.0",
  "description": "Backend for Finance Dashboard with OAuth 2.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "express-session": "^1.17.3",
    "google-auth-library": "^8.8.0",
    "googleapis": "^118.0.0",
    "jsonwebtoken": "^9.0.0",
    "passport": "^0.6.0",
    "passport-google-oauth20": "^2.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
```

---

## Frontend Modifications

### 1. Servicio de Autenticación

Crear archivo `js/services/AuthService.js`:

```javascript
/**
 * ============================================================================
 * SERVICIO DE AUTENTICACIÓN OAUTH 2.0
 * ============================================================================
 */

export class AuthService {
    constructor(apiBaseUrl = 'http://localhost:3001/api') {
        this.apiBaseUrl = apiBaseUrl;
        this.tokenKey = 'auth_token';
        this.userKey = 'auth_user';
    }

    /**
     * Iniciar sesión
     */
    async login(email, password) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const { token, user } = await response.json();

            // Guardar token y usuario
            localStorage.setItem(this.tokenKey, token);
            localStorage.setItem(this.userKey, JSON.stringify(user));

            return { token, user };

        } catch (error) {
            console.error('❌ Login error:', error);
            throw error;
        }
    }

    /**
     * Verificar si existe un token válido
     */
    async verifyToken() {
        const token = this.getToken();
        
        if (!token) return null;

        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                return await response.json();
            } else {
                this.logout();
                return null;
            }

        } catch (error) {
            console.error('❌ Token verification error:', error);
            this.logout();
            return null;
        }
    }

    /**
     * Cerrar sesión
     */
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    }

    /**
     * Obtener token almacenado
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * Obtener usuario almacenado
     */
    getUser() {
        const user = localStorage.getItem(this.userKey);
        return user ? JSON.parse(user) : null;
    }

    /**
     * Verificar si usuario está autenticado
     */
    isAuthenticated() {
        return !!this.getToken();
    }

    /**
     * Obtener header de autorización
     */
    getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
}

export const authService = new AuthService(
    process.env.REACT_APP_API_URL || 'http://localhost:3001/api'
);
```

### 2. Modificar DataService

Actualizar `js/services/DataService.js` para usar el backend:

```javascript
/**
 * Modificación de DataService para usar OAuth 2.0
 */

import { authService } from './AuthService.js';

export class DataService {
    constructor(apiBaseUrl = 'http://localhost:3001/api') {
        this.apiBaseUrl = apiBaseUrl;
    }

    /**
     * Obtener transacciones del backend (con autenticación)
     */
    async fetchTransactions() {
        try {
            const token = authService.getToken();
            
            if (!token) {
                throw new Error('No authentication token. Please login first.');
            }

            const response = await fetch(
                `${this.apiBaseUrl}/data/transactions`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expirado
                    authService.logout();
                    window.location.href = '/login';
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const { data } = await response.json();
            return data;

        } catch (error) {
            console.error('❌ Error fetching transactions:', error);
            throw error;
        }
    }

    /**
     * Obtener resumen
     */
    async fetchSummary() {
        try {
            const token = authService.getToken();
            
            if (!token) {
                throw new Error('No authentication token');
            }

            const response = await fetch(
                `${this.apiBaseUrl}/data/summary`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const { data } = await response.json();
            return data;

        } catch (error) {
            console.error('❌ Error fetching summary:', error);
            throw error;
        }
    }
}
```

### 3. Crear componente de Login

Crear `js/components/auth/LoginDialog.js`:

```javascript
/**
 * ============================================================================
 * COMPONENTE DE LOGIN CON OAUTH 2.0
 * ============================================================================
 */

import { authService } from '../../services/AuthService.js';

export class LoginDialog {
    constructor() {
        this.isOpen = false;
    }

    /**
     * Abrir diálogo de login
     */
    open() {
        this.isOpen = true;
        this.render();
    }

    /**
     * Cerrar diálogo
     */
    close() {
        this.isOpen = false;
        const dialog = document.getElementById('login-dialog');
        if (dialog) dialog.style.display = 'none';
    }

    /**
     * Manejar submit del formulario
     */
    async handleLogin(event) {
        event.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const { user, token } = await authService.login(email, password);
            console.log('✅ Login exitoso:', user);
            
            this.close();
            
            // Recargar la aplicación
            window.location.reload();

        } catch (error) {
            console.error('❌ Error de login:', error);
            alert('Error en login. Verifica tus credenciales.');
        }
    }

    /**
     * Renderizar formulario de login
     */
    render() {
        const dialogHTML = `
            <div id="login-dialog" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 1000;">
                <div style="background: white; padding: 30px; border-radius: 8px; width: 90%; max-width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2>🔐 Iniciar Sesión</h2>
                    
                    <form onsubmit="window.loginDialog.handleLogin(event)">
                        <div style="margin-bottom: 15px;">
                            <label for="login-email">Email:</label>
                            <input type="email" id="login-email" required style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>

                        <div style="margin-bottom: 15px;">
                            <label for="login-password">Contraseña:</label>
                            <input type="password" id="login-password" required style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>

                        <button type="submit" style="width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Iniciar Sesión
                        </button>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', dialogHTML);
        window.loginDialog = this;
    }
}
```

### 4. Integrar en DashboardApp

Modificar `js/app/DashboardApp.js`:

```javascript
import { authService } from '../services/AuthService.js';
import { LoginDialog } from '../components/auth/LoginDialog.js';

export class DashboardApp {
    constructor() {
        this.loginDialog = new LoginDialog();
    }

    async init() {
        // Verificar autenticación antes de iniciar
        const isAuthenticated = authService.isAuthenticated();
        const verified = isAuthenticated ? await authService.verifyToken() : null;

        if (!verified) {
            console.log('⚠️ No autenticado. Mostrando login...');
            this.loginDialog.open();
            return;
        }

        console.log('✅ Autenticado como:', verified.user.email);

        // Continuar con inicialización normal
        // ... resto del código
    }
}
```

---

## Security Considerations

### 1. Almacenamiento Seguro de Tokens

❌ **NO HACER:**
```javascript
// Evitar localStorage para tokens sensibles
localStorage.setItem('token', token); // ¡INSEGURO!
```

✅ **HACER:**
```javascript
// Usar httpOnly cookies (servidor las gestiona)
// El servidor envía la cookie automáticamente
// El cliente no puede acceder a ella vía JavaScript
```

**Backend - Enviar cookie httpOnly:**
```javascript
res.cookie('authToken', token, {
    httpOnly: true,      // No accesible vía JavaScript
    secure: true,        // Solo HTTPS
    sameSite: 'Strict',  // Proteger CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
});
```

### 2. HTTPS en Producción

```bash
# Usar HTTPS OBLIGATORIO
- Certificado SSL/TLS (Let's Encrypt)
- Redirigir HTTP → HTTPS
- HSTS headers
```

### 3. CORS Configuration

```javascript
const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600
};

app.use(cors(corsOptions));
```

### 4. Rate Limiting

```bash
npm install express-rate-limit

// En server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de 100 peticiones por IP
});

app.use(limiter);
```

### 5. Validación de entrada

```javascript
// Validar siempre datos del cliente
function validateUserInput(data) {
    if (typeof data.email !== 'string' || !data.email.includes('@')) {
        throw new Error('Email inválido');
    }
    
    if (typeof data.password !== 'string' || data.password.length < 6) {
        throw new Error('Contraseña inválida');
    }
}
```

### 6. Logging y Auditoría

```javascript
// Log todas las operaciones sensibles
app.post('/api/data/update', authenticateToken, (req, res) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        userId: req.user.id,
        action: 'UPDATE_DATA',
        range: req.body.range,
        ip: req.ip
    };
    
    fs.appendFileSync('audit.log', JSON.stringify(logEntry) + '\n');
    
    // ... resto del código
});
```

---

## Testing & Deployment

### 1. Testing Local

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
# Abrir http://localhost:5500 (Live Server)

# Probar login
email: test@example.com
password: test123
```

### 2. Deployment en Producción

#### Opción 1: Heroku

```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Crear app
heroku create finance-dashboard-api

# Configurar variables de entorno
heroku config:set JWT_SECRET="tu_secreto_aqui"
heroku config:set GOOGLE_SHEET_ID="tu_id_aqui"
heroku config:set FRONTEND_URL="https://tu-dominio.com"

# Agregar archivo google-credentials.json
heroku config:set GOOGLE_CREDENTIALS="$(cat google-credentials.json)"

# Deploy
git push heroku main
```

#### Opción 2: AWS Lambda + API Gateway

```bash
# Instalar Serverless Framework
npm install -g serverless

# Crear función
serverless create --template aws-nodejs-http-api

# Deploy
serverless deploy
```

#### Opción 3: DigitalOcean / VPS

```bash
# SSH a servidor
ssh root@tu_ip

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clonar repositorio
git clone tu_repo

# Instalar dependencias
npm install

# Usar PM2 para gestionar proceso
npm install -g pm2
pm2 start server.js --name "finance-api"
pm2 startup
pm2 save
```

### 3. Variables de Entorno en Producción

```
# .env.production
NODE_ENV=production
PORT=3001
JWT_SECRET=secreto_muy_seguro_aleatorio_123456789
GOOGLE_SHEET_ID=1A2B3C4D5E...
GOOGLE_CREDENTIALS_PATH=./google-credentials.json
FRONTEND_URL=https://finance-dashboard.miempresa.com
```

### 4. Health Check Endpoint

```javascript
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Monitorear con: curl https://api.miempresa.com/api/health
```

---

## Beneficios vs. Desventajas

### ✅ Ventajas de OAuth 2.0

- **Seguridad**: Credenciales de Google Sheet nunca expuestas al cliente
- **Autenticación**: Solo usuarios autorizados acceden a datos
- **Auditoría**: Registro completo de quién accede a qué
- **Control de acceso**: Permisos granulares (read-only, editor, admin)
- **Escalabilidad**: Fácil agregar más usuarios
- **Cumplimiento**: GDPR, HIPAA, etc.

### ⚠️ Desventajas

- **Complejidad**: Requiere backend
- **Costo**: Servidor (aunque mínimo en dev)
- **Latencia**: Una capa más en la arquitectura
- **Mantenimiento**: Gestionar servidor, actualizaciones

---

## Conclusión

OAuth 2.0 es la forma correcta y segura de proteger acceso a APIs. Para esta aplicación:

1. **Corto plazo**: Service Account (simple, efectivo)
2. **Mediano plazo**: Agregar User OAuth (máximo control)
3. **Largo plazo**: Integrar con sistema de permisos empresarial

¿Preguntas? Crear un issue o contactar al equipo de desarrollo.
