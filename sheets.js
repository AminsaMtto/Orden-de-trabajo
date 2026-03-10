/**
 * sheets.js — Integración con Google Sheets
 * Usa peticiones GET con parámetros para evitar CORS completamente
 */

const SHEETS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyB9vWEI2Ct2Wn_eUF2dt6EN9_Aso19yXxowqrIBtIuaVnXDYvDrbgbnxQA2RlKlnfPuw/exec';

// ── Guardar orden (GET para evitar CORS) ───────────────────────
async function guardarOrden(datos) {
  try {
    const url = SHEETS_WEBAPP_URL
      + '?accion=guardar'
      + '&datos=' + encodeURIComponent(JSON.stringify(datos));

    const response = await fetch(url, { method: 'GET' });
    const result   = await response.json();
    return result;
  } catch (err) {
    console.error('guardarOrden error:', err);
    return { ok: false, error: err.message };
  }
}

// ── Obtener órdenes ────────────────────────────────────────────
async function obtenerOrdenes() {
  try {
    const response = await fetch(SHEETS_WEBAPP_URL + '?accion=listar', { method: 'GET' });
    const result   = await response.json();
    return result.ordenes || [];
  } catch (err) {
    console.error('obtenerOrdenes error:', err);
    return [];
  }
}

// ── Cerrar orden (GET para evitar CORS) ───────────────────────
async function cerrarOrden(folio, datosCierre) {
  try {
    const url = SHEETS_WEBAPP_URL
      + '?accion=cerrar'
      + '&folio=' + encodeURIComponent(folio)
      + '&datosCierre=' + encodeURIComponent(JSON.stringify(datosCierre));

    const response = await fetch(url, { method: 'GET' });
    const result   = await response.json();
    return result;
  } catch (err) {
    console.error('cerrarOrden error:', err);
    return { ok: false, error: err.message };
  }
}

if (typeof module !== 'undefined') {
  module.exports = { guardarOrden, obtenerOrdenes, cerrarOrden };
}
