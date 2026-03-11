/**
 * sheets.js — Integración con Google Sheets
 * Usa fetch con mode: 'no-cors' para guardar y GET normal para leer
 * El truco: guardamos via GET con parámetros cortos (datos comprimidos)
 * y leemos via GET normal que sí funciona sin CORS
 */

const SHEETS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyrP_UdUQWXnQkNqOZatGUQ3jJHZwn2A5w7lhb5R0lZTAmKMgi0vDlO3IdSvmjx2iAbCw/exec';

// ── Guardar orden ──────────────────────────────────────────────
// Divide los datos en campos individuales para no exceder el límite de URL
async function guardarOrden(datos) {
  try {
    // Enviamos cada campo por separado como parámetro GET
    const params = new URLSearchParams();
    params.set('accion', 'guardar');
    // Enviamos los campos más cortos directamente
    params.set('folio',              datos.folio || '');
    params.set('fecha_reporte',      datos.fecha_reporte || '');
    params.set('hora_reporte',       datos.hora_reporte || '');
    params.set('quien_reporta',      datos.quien_reporta || '');
    params.set('centro_negocio',     datos.centro_negocio || '');
    params.set('tipo_mant',          datos.tipo_mantenimiento || '');
    params.set('equipo',             datos.equipo_reportado || '');
    params.set('no_control',         datos.no_control || '');
    params.set('falla',              (datos.falla_reportada || '').substring(0, 200));
    params.set('urgencia',           datos.grado_urgencia || '');
    params.set('frecuencia',         datos.frecuencia_falla || '');
    params.set('hora_recibo',        datos.hora_recibo || '');
    params.set('fecha_atencion',     datos.fecha_atencion || '');
    params.set('tecnicos',           datos.tecnicos || '');
    params.set('diagnostico',        (datos.diagnostico_inicial || '').substring(0, 200));
    params.set('ref_req',            datos.refacciones_requeridas || '');
    params.set('ref_alm',            datos.refacciones_almacen || '');
    params.set('tiempo_ref',         datos.tiempo_entrega_refacciones || '');
    params.set('act_previas',        datos.actividades_previas || '');
    params.set('inicio_rep',         datos.inicio_reparacion || '');
    params.set('hora_inicio',        datos.hora_inicio || '');
    params.set('fecha_est',          datos.fecha_estimada_entrega || '');
    params.set('costo',              datos.costo_refacciones || '');
    params.set('descripcion',        (datos.descripcion_reparacion || '').substring(0, 200));
    params.set('fecha_lib',          datos.fecha_liberacion || '');
    params.set('hora_entrega',       datos.hora_entrega_equipo || '');
    params.set('tec_entrega',        datos.tecnico_entrega || '');
    params.set('firma_recibe',       datos.nombre_firma_recibe || '');
    params.set('firma_conf',         datos.firma_conformidad || '');

    const url = SHEETS_WEBAPP_URL + '?' + params.toString();
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
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(SHEETS_WEBAPP_URL + '?accion=listar', { signal: controller.signal });
    clearTimeout(timer);
    const result = await response.json();
    return result.ordenes || [];
  } catch (err) {
    console.warn('obtenerOrdenes:', err.message);
    return [];
  }
}

// ── Cerrar orden ───────────────────────────────────────────────
async function cerrarOrden(folio, datosCierre) {
  try {
    const params = new URLSearchParams();
    params.set('accion',       'cerrar');
    params.set('folio',        folio);
    params.set('descripcion',  (datosCierre.descripcion_reparacion || '').substring(0, 200));
    params.set('fecha_lib',    datosCierre.fecha_liberacion || '');
    params.set('hora_entrega', datosCierre.hora_entrega_equipo || '');
    params.set('tec_entrega',  datosCierre.tecnico_entrega || '');
    params.set('firma_recibe', datosCierre.nombre_firma_recibe || '');
    params.set('firma_conf',   datosCierre.firma_conformidad || '');

    const url = SHEETS_WEBAPP_URL + '?' + params.toString();
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
