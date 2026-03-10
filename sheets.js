/**
 * sheets.js — Integración con Google Sheets
 * Usa fetch con modo cors y un iframe oculto como fallback para guardar
 */

const SHEETS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbwAnpy2AfWhA-u8cF6Y3tpEMDDzveAkKZBDTzfVVbA4YOsxFLTwItQL1l1auTiWOe-1bg/exec';

// ── Guardar orden — usa iframe para evitar CORS en POST ────────
function guardarOrden(datos) {
  return new Promise((resolve) => {
    try {
      // Crear un form oculto que hace submit a un iframe
      const iframeName = 'iframe_' + Date.now();
      const iframe = document.createElement('iframe');
      iframe.name = iframeName;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = SHEETS_WEBAPP_URL;
      form.target = iframeName;
      form.style.display = 'none';

      // Campo con todos los datos como JSON
      const input = document.createElement('input');
      input.type  = 'hidden';
      input.name  = 'payload';
      input.value = JSON.stringify({ accion: 'guardar', datos });
      form.appendChild(input);

      document.body.appendChild(form);

      // Limpiar después de enviar
      iframe.onload = () => {
        setTimeout(() => {
          document.body.removeChild(form);
          document.body.removeChild(iframe);
        }, 1000);
        resolve({ ok: true });
      };

      // Timeout de seguridad
      setTimeout(() => resolve({ ok: true }), 5000);

      form.submit();
    } catch (err) {
      resolve({ ok: false, error: err.message });
    }
  });
}

// ── Obtener órdenes — GET funciona sin CORS ────────────────────
async function obtenerOrdenes() {
  try {
    const response = await fetch(SHEETS_WEBAPP_URL + '?accion=listar');
    const result   = await response.json();
    return result.ordenes || [];
  } catch (err) {
    console.error('obtenerOrdenes error:', err);
    return [];
  }
}

// ── Cerrar orden — mismo método iframe ────────────────────────
function cerrarOrden(folio, datosCierre) {
  return new Promise((resolve) => {
    try {
      const iframeName = 'iframe_' + Date.now();
      const iframe = document.createElement('iframe');
      iframe.name = iframeName;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = SHEETS_WEBAPP_URL;
      form.target = iframeName;
      form.style.display = 'none';

      const input = document.createElement('input');
      input.type  = 'hidden';
      input.name  = 'payload';
      input.value = JSON.stringify({ accion: 'cerrar', folio, datosCierre });
      form.appendChild(input);

      document.body.appendChild(form);

      iframe.onload = () => {
        setTimeout(() => {
          document.body.removeChild(form);
          document.body.removeChild(iframe);
        }, 1000);
        resolve({ ok: true });
      };

      setTimeout(() => resolve({ ok: true }), 5000);
      form.submit();
    } catch (err) {
      resolve({ ok: false, error: err.message });
    }
  });
}

if (typeof module !== 'undefined') {
  module.exports = { guardarOrden, obtenerOrdenes, cerrarOrden };
}
