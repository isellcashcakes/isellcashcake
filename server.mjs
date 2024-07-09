import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Ermittelt den Dateipfad
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Erstellt eine Express-Anwendung
const app = express();
const port = 4000;

// Stellt statische Dateien bereit
app.use(express.static(path.join(__dirname)));

// Route zur Startseite
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route zur Kaufseite
app.get('/buy.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'buy.html'));
});

// Route zur Infoseite
app.get('/info.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'info.html'));
});

// Startet den Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
