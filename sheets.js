/**
 * sheets.js — Integración con Google Sheets via Apps Script
 * Usa URLSearchParams para evitar el problema de CORS con fetch+JSON
 */

const SHEETS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyB9vWEI2Ct2Wn_eUF2dt6EN9_Aso19yXxowqrIBtIuaVnXDYvDrbgbnxQA2RlKlnfPuw/exec';

// ── Guardar orden ──────────────────────────────────────────────
async function guardarOrden(datos) {
  try {
    const params = new URLSearchParams();
    params.append('accion', 'guardar');
    params.append('datos', JSON.stringify(datos));

    await fetch(SHEETS_WEBAPP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    // Con no-cors la respuesta es opaca pero si no lanzó error = guardó OK
    return { ok: true };
  } catch (err) {
    console.error('guardarOrden error:', err);
    return { ok: false, error: err.message };
  }
}

// ── Obtener órdenes ────────────────────────────────────────────
async function obtenerOrdenes() {
  try {
    const response = await fetch(
      SHEETS_WEBAPP_URL + '?accion=listar',
      { method: 'GET' }
    );
    const result = await response.json();
    return result.ordenes || [];
  } catch (err) {
    console.error('obtenerOrdenes error:', err);
    return [];
  }
}

// ── Cerrar orden ───────────────────────────────────────────────
async function cerrarOrden(folio, datosCierre) {
  try {
    const params = new URLSearchParams();
    params.append('accion', 'cerrar');
    params.append('folio', folio);
    params.append('datosCierre', JSON.stringify(datosCierre));

    await fetch(SHEETS_WEBAPP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    return { ok: true };
  } catch (err) {
    console.error('cerrarOrden error:', err);
    return { ok: false, error: err.message };
  }
}

if (typeof module !== 'undefined') {
  module.exports = { guardarOrden, obtenerOrdenes, cerrarOrden };
}
