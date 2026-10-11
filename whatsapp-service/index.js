// whatsapp-service/index.js
require('dotenv').config();
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// --- Configuración del cliente de WhatsApp ---
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'agenda-anahuac',
        dataPath: path.join(__dirname, 'sessions')
    }),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

let isReady = false;

// --- Eventos de WhatsApp ---
client.on('qr', (qr) => {
    console.log('📱 Escanea este código QR con el WhatsApp del número que usarás:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    isReady = true;
    console.log('✅ WhatsApp conectado correctamente.');
});

client.on('disconnected', (reason) => {
    isReady = false;
    console.log('❌ WhatsApp desconectado:', reason);
    client.initialize();
});

// --- API HTTP para que Laravel se comunique ---

app.get('/health', (req, res) => {
    res.json({ status: isReady ? 'connected' : 'disconnected' });
});

// Endpoint para enviar mensajes
app.post('/send', async (req, res) => {
    if (!isReady) {
        return res.status(503).json({ error: 'WhatsApp no está conectado.' });
    }

    const { number, message, filePath } = req.body;

    if (!number || !/^\d{10,15}$/.test(number)) {
        return res.status(400).json({ error: 'Número de destino inválido.' });
    }

    try {
        // ✅ Resolver el número a un ID válido de WhatsApp
        // getNumberId intenta obtener el identificador serializado del contacto
        const numberId = await client.getNumberId(number);

        if (!numberId) {
            // Si getNumberId devuelve null, el número no está registrado en WhatsApp
            // o no se pudo resolver el LID (contacto nuevo sin conversación previa)
            console.log(`⚠️ No se pudo resolver el número ${number}. Intentando con formato @c.us...`);

            // Último intento: construir el chatId manualmente
            const chatId = `${number}@c.us`;
            await client.sendMessage(chatId, message, { caption: message });
        } else {
            // ✅ numberId._serialized ya contiene el formato correcto (puede ser @c.us o @lid)
            await client.sendMessage(numberId._serialized, message, { caption: message });
        }

        // Simular comportamiento humano (retraso aleatorio)
        await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 2000));

        console.log(`📤 Mensaje enviado a ${number}`);
        res.json({ success: true });

    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        res.status(500).json({ error: 'Error interno al enviar el mensaje.' });
    }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Microservicio de WhatsApp escuchando en http://localhost:${PORT}`);
    client.initialize();
});