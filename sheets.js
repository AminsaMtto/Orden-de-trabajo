/**
 * sheets.js — Integración con Google Sheets via JSONP
 * JSONP evita CORS completamente inyectando un <script> tag
 */

const SHEETS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyB9vWEI2Ct2Wn_eUF2dt6EN9_Aso19yXxowqrIBtIuaVnXDYvDrbgbnxQA2RlKlnfPuw/exec';

// ── JSONP helper ───────────────────────────────────────────────
function jsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = 'cb_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    const script = document.createElement('script');

    // Timeout de 15 segundos
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout'));
    }, 15000);

    function cleanup() {
      clearTimeout(timer);
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    window[callbackName] = function(data) {
      cleanup();
      resolve(data);
    };

    script.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + callbackName;
    script.onerror = () => { cleanup(); reject(new Error('Script load error')); };
    document.head.appendChild(script);
  });
}

// ── Guardar orden ──────────────────────────────────────────────
async function guardarOrden(datos) {
  try {
    const url = SHEETS_WEBAPP_URL
      + '?accion=guardar'
      + '&datos=' + encodeURIComponent(JSON.stringify(datos));
    const result = await jsonp(url);
    return result;
  } catch (err) {
    console.error('guardarOrden error:', err);
    return { ok: false, error: err.message };
  }
}

// ── Obtener órdenes ────────────────────────────────────────────
async function obtenerOrdenes() {
  try {
    const url    = SHEETS_WEBAPP_URL + '?accion=listar';
    const result = await jsonp(url);
    return result.ordenes || [];
  } catch (err) {
    console.error('obtenerOrdenes error:', err);
    return [];
  }
}

// ── Cerrar orden ───────────────────────────────────────────────
async function cerrarOrden(folio, datosCierre) {
  try {
    const url = SHEETS_WEBAPP_URL
      + '?accion=cerrar'
      + '&folio=' + encodeURIComponent(folio)
      + '&datosCierre=' + encodeURIComponent(JSON.stringify(datosCierre));
    const result = await jsonp(url);
    return result;
  } catch (err) {
    console.error('cerrarOrden error:', err);
    return { ok: false, error: err.message };
  }
}

if (typeof module !== 'undefined') {
  module.exports = { guardarOrden, obtenerOrdenes, cerrarOrden };
}
