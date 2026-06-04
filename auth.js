// ── VERIFICACIÓN DE SESIÓN COMPARTIDA ─────────────────────────────────
const SESION_TIMEOUT_MS = 1 * 60 * 60 * 1000; // 8 horas de expiración

function verificarSesion() {
  const sesionRaw = sessionStorage.getItem('aminsa_sesion');
  if (!sesionRaw) {
    window.location.href = 'login.html';
    return false;
  }
  
  try {
    const sesion = JSON.parse(sesionRaw);
    
    // Verificar expiración de sesión
    if (sesion.timestamp) {
      const edad = Date.now() - sesion.timestamp;
      if (edad > SESION_TIMEOUT_MS) {
        sessionStorage.removeItem('aminsa_sesion');
        window.location.href = 'login.html';
        return false;
      }
    }
    
    return sesion;
  } catch(e) {
    sessionStorage.removeItem('aminsa_sesion');
    window.location.href = 'login.html';
    return false;
  }
}

function verificarPermiso(permiso) {
  const sesion = verificarSesion();
  if (!sesion) return false;
  
  const permisos = sesion.permisos || {};
  return permisos[permiso] === true;
}

function cerrarSesion() {
  sessionStorage.removeItem('aminsa_sesion');
  window.location.href = 'login.html';
}

function obtenerSesion() {
  const sesionRaw = sessionStorage.getItem('aminsa_sesion');
  if (!sesionRaw) return null;
  
  try {
    return JSON.parse(sesionRaw);
  } catch(e) {
    return null;
  }
}
