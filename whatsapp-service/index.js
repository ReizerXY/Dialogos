// whatsapp-service/index.js
require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const path = require('path');

// --- Helpers de log con timestamp ---
const log = (...args) => console.log(`[${new Date().toISOString()}]`, ...args);
const logError = (...args) => console.error(`[${new Date().toISOString()}]`, ...args);

// Enmascara un numero de telefono para no exponerlo en logs
const maskNumber = (n) => {
    if (!n || typeof n !== 'string') return '***';
    if (n.length <= 4) return '***';
    return `${n.slice(0, 2)}***${n.slice(-2)}`;
};

// --- Variables de estado ---
let isReady = false;
let lastDisconnectAt = null;
let client = null;

const app = express();
app.use(express.json({ limit: '100kb' }));

// --- API_KEY de autenticacion ---
const API_KEY = process.env.API_KEY;

if (!API_KEY || API_KEY.length < 16) {
    logError('FATAL: API_KEY no definida o demasiado corta en .env');
    process.exit(1);
}

// Middleware que valida el header X-API-KEY
function requireApiKey(req, res, next) {
    const provided = req.headers['x-api-key'];
    if (!provided || provided !== API_KEY) {
        logError(`Intento de acceso no autorizado desde ${req.ip} a ${req.path}`);
        return res.status(401).json({ error: 'No autorizado.' });
    }
    next();
}

// --- Funcion para crear el cliente ---
function createClient() {
    return new Client({
        authStrategy: new LocalAuth({
            clientId: 'agenda-anahuac',
            dataPath: path.join(__dirname, 'sessions')
        }),
        puppeteer: {
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ],
            headless: true
        }
    });
}

// --- Funcion para inicializar el cliente ---
function initializeClient() {
    if (client) {
        log('Cliente anterior detectado. Destruyendo...');
        try {
            client.destroy();
        } catch (e) {
            logError('Error destruyendo cliente previo:', e.message);
        }
        client = null;
    }

    log('Creando nuevo cliente de WhatsApp...');
    client = createClient();

    client.on('qr', (qr) => {
        log('[QR] Escanea este codigo:');
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        isReady = true;
        lastDisconnectAt = null;
        log('[READY] WhatsApp conectado correctamente.');
    });

    client.on('authenticated', () => {
        log('[AUTH] Autenticacion exitosa.');
    });

    client.on('auth_failure', (msg) => {
        isReady = false;
        lastDisconnectAt = Date.now();
        logError('[AUTH-FAIL] Fallo de autenticacion:', msg);
    });

    client.on('disconnected', (reason) => {
        isReady = false;
        lastDisconnectAt = Date.now();
        log(`[DISCONNECTED] WhatsApp desconectado (${reason}). El watchdog intentara reconectar.`);
    });

    client.on('error', (err) => {
        logError('[ERROR] Error del cliente:', err.message);
    });

    log('Inicializando cliente...');
    client.initialize().catch((err) => {
        logError('[INIT-ERROR] Error en initialize():', err.message);
        isReady = false;
        lastDisconnectAt = Date.now();
    });
}

// =====================================================
// API HTTP
// =====================================================

// Health check publico (para monitoreo)
app.get('/health', (req, res) => {
    res.json({
        status: isReady ? 'connected' : 'disconnected',
        uptime: Math.floor(process.uptime()),
    });
});

// Enviar mensaje (requiere API_KEY)
app.post('/send', requireApiKey, async (req, res) => {
    if (!isReady) {
        return res.status(503).json({ error: 'WhatsApp no esta conectado.' });
    }

    const { number, message } = req.body;

    if (!number || !/^\d{10,15}$/.test(number)) {
        return res.status(400).json({ error: 'Numero invalido.' });
    }

    if (!message || typeof message !== 'string' || message.length > 4096) {
        return res.status(400).json({ error: 'Mensaje invalido.' });
    }

    try {
        // Delay humano ANTES de enviar
        await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 2000));

        const numberId = await client.getNumberId(number);

        if (!numberId) {
            log(`[WARN] No se pudo resolver ${maskNumber(number)}. Intentando @c.us...`);
            await client.sendMessage(`${number}@c.us`, message);
        } else {
            await client.sendMessage(numberId._serialized, message);
        }

        log(`[SENT] Mensaje enviado a ${maskNumber(number)}`);
        res.json({ success: true });

    } catch (error) {
        logError(`[SEND-ERROR] Fallo envio a ${maskNumber(number)}:`, error.message);
        res.status(500).json({ error: 'Error interno.' });
    }
});

// Reiniciar el cliente manualmente (requiere API_KEY)
app.post('/restart', requireApiKey, (req, res) => {
    log('[RESTART] Reinicio manual solicitado.');
    isReady = false;
    initializeClient();
    res.json({ success: true, message: 'Reiniciando cliente...' });
});

// =====================================================
// Watchdog: si el cliente lleva >5 min desconectado, se reinicia solo
// =====================================================
setInterval(() => {
    if (!isReady && lastDisconnectAt && (Date.now() - lastDisconnectAt) > 5 * 60 * 1000) {
        log('[WATCHDOG] Cliente desconectado >5 min. Reiniciando...');
        lastDisconnectAt = null;
        initializeClient();
    }
}, 60 * 1000);

// =====================================================
// Cleanup en SIGTERM/SIGINT
// =====================================================
async function gracefulShutdown(signal) {
    log(`[SHUTDOWN] Recibida senal ${signal}. Cerrando limpiamente...`);
    isReady = false;

    if (client) {
        try {
            await client.destroy();
            log('[SHUTDOWN] Cliente destruido correctamente.');
        } catch (e) {
            logError('[SHUTDOWN] Error al destruir cliente:', e.message);
        }
    }

    setTimeout(() => {
        log('[SHUTDOWN] Saliendo del proceso.');
        process.exit(0);
    }, 2000);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('uncaughtException', (err) => {
    logError('[UNCAUGHT] Excepcion no capturada:', err.message);
    logError(err.stack);
});

process.on('unhandledRejection', (reason) => {
    logError('[UNHANDLED] Promesa rechazada sin manejar:', reason);
});

// =====================================================
// Arrancar servidor
// =====================================================
const PORT = process.env.PORT || 3001;

app.listen(PORT, '127.0.0.1', () => {
    log(`[START] Microservicio WhatsApp en http://127.0.0.1:${PORT}`);
    initializeClient();
});