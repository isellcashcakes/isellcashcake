// server.mjs

import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { Server as SocketServer } from 'socket.io';
import fetch from 'node-fetch';

// Wartungsmodus aktivieren/deaktivieren
const maintenanceMode = true;

// HTTP Server erstellen
const server = http.createServer(async (req, res) => {
    try {
        if (maintenanceMode) {
            const offlinePage = await fs.readFile('./public/offline.html');
            res.writeHead(503, { 'Content-Type': 'text/html' });
            res.end(offlinePage);
            return;
        }

        let filePath = '.' + req.url;
        if (filePath === './') {
            filePath = './public/index.html';
        } else {
            filePath = './public' + req.url;
        }

        const extname = path.extname(filePath);
        let contentType = 'text/html';
        switch (extname) {
            case '.js':
                contentType = 'application/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            default:
                contentType = 'text/html';
        }

        const data = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    } catch (error) {
        console.error(error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
});

// Starte den HTTP Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// WebSocket Server einrichten
const io = new SocketServer(server);

// Funktion zum Abrufen der Kryptopreise
async function fetchCryptoPrices() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=litecoin,polygon&vs_currencies=usd');
        if (!response.ok) {
            throw new Error('Failed to fetch prices');
        }
        const data = await response.json();
        const ltcUSD = data.litecoin.usd;
        const maticUSD = data.polygon.usd;

        // Senden der Preise an alle verbundenen Clients
        io.emit('cryptoPrices', { ltcUSD, maticUSD });
    } catch (error) {
        console.error('Error fetching prices:', error);
    }
}

// WebSocket Ereignisbehandlung
io.on('connection', (socket) => {
    console.log('A client connected');

    // Senden der aktuellen Preise bei Verbindungsaufbau
    fetchCryptoPrices();

    // Timer für periodische Aktualisierung der Preise
    const interval = setInterval(fetchCryptoPrices, 10000);

    // Socket Verbindung schließen
    socket.on('disconnect', () => {
        console.log('A client disconnected');
        clearInterval(interval); // Stoppe den Preisaktualisierungs-Intervall
    });
});
