import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Define explicit routes for our local portal and its assets
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint that never closes, forcing an infinite browser loading indicator
app.get('/infinite-load', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.write('<!-- loading forever -->\n');

  const interval = setInterval(() => {
    if (!res.writableEnded) {
      res.write(' ');
    } else {
      clearInterval(interval);
    }
  }, 5000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

app.get('/Clever.svg', (req, res) => {
  res.sendFile(path.join(__dirname, 'Clever.svg'));
});

app.get('/book.svg', (req, res) => {
  res.sendFile(path.join(__dirname, 'book.svg'));
});

app.get('/poop.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'poop.png'));
});

// Static files (for assets if any)
app.use(express.static(__dirname));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
