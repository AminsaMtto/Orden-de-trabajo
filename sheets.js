/**
 * sheets.js — Módulo de integración con Google Sheets
 * 
 * CONFIGURACIÓN REQUERIDA:
 * 1. Crear un Google Sheet con las columnas definidas abajo
 * 2. Publicar un Google Apps Script como Web App (ver README.md)
 * 3. Reemplazar SHEETS_WEBAPP_URL con la URL del Web App
 */

const SHEETS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyB9vWEI2Ct2Wn_eUF2dt6EN9_Aso19yXxowqrIBtIuaVnXDYvDrbgbnxQA2RlKlnfPuw/exec'; // <-- REEMPLAZAR

// Columnas del Google Sheet (en orden)
const COLUMNAS = [
  'folio',           // A
  'fecha_reporte',   // B
  'hora_reporte',    // C
  'quien_reporta',   // D
  'centro_negocio',  // E
  'tipo_mantenimiento', // F
  'equipo_reportado',// G
  'no_control',      // H
  'falla_reportada', // I
  'grado_urgencia',  // J
  'frecuencia_falla',// K
  'hora_recibo',     // L
  'fecha_atencion',  // M
  'tecnicos',        // N
  'diagnostico_inicial', // O
  'refacciones_requeridas', // P
  'refacciones_almacen',   // Q
  'tiempo_entrega_refacciones', // R
  'actividades_previas', // S
  'inicio_reparacion',   // T
  'hora_inicio',         // U
  'fecha_estimada_entrega', // V
  'costo_refacciones',   // W
  'descripcion_reparacion', // X
  'fecha_liberacion',    // Y
  'hora_entrega_equipo', // Z
  'tecnico_entrega',     // AA
  'nombre_firma_recibe', // AB
  'firma_conformidad',   // AC
  'estado',              // AD: ABIERTA | CERRADA
  'fecha_cierre',        // AE
];

/**
 * Guarda una orden en Google Sheets
 * @param {Object} datos - Objeto con los datos de la orden
 * @returns {Promise<{ok: boolean, folio: string, error?: string}>}
 */
async function guardarOrden(datos) {
  if (!SHEETS_WEBAPP_URL || SHEETS_WEBAPP_URL === 'TU_URL_DE_APPS_SCRIPT_AQUI') {
    console.warn('⚠️  sheets.js: SHEETS_WEBAPP_URL no configurada. Guardando solo en localStorage.');
    return { ok: false, error: 'URL no configurada' };
  }

  try {
    const response = await fetch(SHEETS_WEBAPP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'guardar', datos }),
    });
    const result = await response.json();
    return result;
  } catch (err) {
    console.error('Error al guardar en Sheets:', err);
    return { ok: false, error: err.message };
  }
}

/**
 * Obtiene todas las órdenes desde Google Sheets
 * @returns {Promise<Array>}
 */
async function obtenerOrdenes() {
  if (!SHEETS_WEBAPP_URL || SHEETS_WEBAPP_URL === 'TU_URL_DE_APPS_SCRIPT_AQUI') {
    return [];
  }

  try {
    const response = await fetch(`${SHEETS_WEBAPP_URL}?accion=listar`);
    const result = await response.json();
    return result.ordenes || [];
  } catch (err) {
    console.error('Error al obtener órdenes de Sheets:', err);
    return [];
  }
}

/**
 * Cierra una orden en Google Sheets
 * @param {string} folio
 * @param {Object} datosCierre
 * @returns {Promise<{ok: boolean}>}
 */
async function cerrarOrden(folio, datosCierre) {
  if (!SHEETS_WEBAPP_URL || SHEETS_WEBAPP_URL === 'TU_URL_DE_APPS_SCRIPT_AQUI') {
    return { ok: false, error: 'URL no configurada' };
  }

  try {
    const response = await fetch(SHEETS_WEBAPP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'cerrar', folio, datosCierre }),
    });
    return await response.json();
  } catch (err) {
    console.error('Error al cerrar orden en Sheets:', err);
    return { ok: false, error: err.message };
  }
}

// Exportar para uso en otros archivos (si se usa como módulo)
if (typeof module !== 'undefined') {
  module.exports = { guardarOrden, obtenerOrdenes, cerrarOrden, COLUMNAS };
}
