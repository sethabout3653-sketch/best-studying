import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import proxy from 'express-http-proxy';

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

// Proxy route for the main page of the embedded application
app.use('/classroom-embed', proxy('https://mathscience.glenoriebakery.com.au/', {
  proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
    proxyReqOpts.headers['host'] = 'mathscience.glenoriebakery.com.au';
    return proxyReqOpts;
  },
  userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
    const newHeaders = { ...headers };
    // Remove frame-blocking headers
    delete newHeaders['x-frame-options'];
    delete newHeaders['content-security-policy'];
    return newHeaders;
  },
  proxyPathResolver: function(req) {
    return '/';
  }
}));

// Fallback proxy to capture all other requests (such as /assets/*, fonts, and stylesheets)
app.use('/', proxy('https://mathscience.glenoriebakery.com.au/', {
  proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
    proxyReqOpts.headers['host'] = 'mathscience.glenoriebakery.com.au';
    return proxyReqOpts;
  },
  userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
    const newHeaders = { ...headers };
    // Remove frame-blocking headers
    delete newHeaders['x-frame-options'];
    delete newHeaders['content-security-policy'];
    return newHeaders;
  }
}));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
