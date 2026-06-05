const SHEETS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbwbftRvId7Ragfu3oBWqZQBjNRJHs-45zR4R7lBF3FiwcZZL0PTgJCtI7ZuNK4aFPYYig/exec';

// CORREGIDO: Helper para obtener el token de autenticación
function obtenerToken() {
  try {
    const sesion = JSON.parse(sessionStorage.getItem('aminsa_sesion') || '{}');
    return sesion.token || '';
  } catch(e) {
    return '';
  }
}

// CORREGIDO: Helper para obtener el usuario de autenticación
function obtenerUsuario() {
  try {
    const sesion = JSON.parse(sessionStorage.getItem('aminsa_sesion') || '{}');
    return sesion.usuario || '';
  } catch(e) {
    return '';
  }
}

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
    params.set('centro_de_negocio',     datos.centro_de_negocio || '');
    params.set('tipo_trabajo', datos.tipo_trabajo || '');
    params.set('equipo_reportado',   datos.equipo_reportado || ''); // CORREGIDO: equipo -> equipo_reportado
    params.set('no_control',         datos.no_control || '');
    params.set('falla_reportada',    datos.falla_reportada || ''); // CORREGIDO: falla -> falla_reportada, SIN TRUNCAMIENTO
    params.set('grado_urgencia',    datos.grado_urgencia || ''); // CORREGIDO: urgencia -> grado_urgencia
    params.set('frecuencia_falla',  datos.frecuencia_falla || ''); // CORREGIDO: frecuencia -> frecuencia_falla
    params.set('hora_recibo',        datos.hora_recibo || '');
    params.set('fecha_atencion',     datos.fecha_atencion || '');
    params.set('tecnicos',           datos.tecnicos || '');
    params.set('diagnostico_inicial', datos.diagnostico_inicial || ''); // CORREGIDO: diagnostico -> diagnostico_inicial, SIN TRUNCAMIENTO
    params.set('refacciones_requeridas', datos.refacciones_requeridas || ''); // CORREGIDO: ref_req -> refacciones_requeridas
    params.set('refacciones_almacen', datos.refacciones_almacen || ''); // CORREGIDO: ref_alm -> refacciones_almacen
    params.set('tiempo_entrega_refacciones', datos.tiempo_entrega_refacciones || ''); // CORREGIDO: tiempo_ref -> tiempo_entrega_refacciones
    params.set('actividades_previas', datos.actividades_previas || ''); // CORREGIDO: act_previas -> actividades_previas
    params.set('inicio_reparacion', datos.inicio_reparacion || ''); // CORREGIDO: inicio_rep -> inicio_reparacion
    params.set('hora_inicio',        datos.hora_inicio || '');
    params.set('fecha_estimada_entrega', datos.fecha_estimada_entrega || ''); // CORREGIDO: fecha_est -> fecha_estimada_entrega
    params.set('costo_refacciones', datos.costo_refacciones || ''); // CORREGIDO: costo -> costo_refacciones
    params.set('descripcion_reparacion', datos.descripcion_reparacion || ''); // CORREGIDO: descripcion -> descripcion_reparacion, SIN TRUNCAMIENTO
    params.set('fecha_liberacion',   datos.fecha_liberacion || ''); // CORREGIDO: fecha_lib -> fecha_liberacion
    params.set('hora_entrega_equipo', datos.hora_entrega_equipo || ''); // CORREGIDO: hora_entrega -> hora_entrega_equipo
    params.set('tecnico_entrega',    datos.tecnico_entrega || ''); // CORREGIDO: tec_entrega -> tecnico_entrega
    params.set('nombre_firma_recibe', datos.nombre_firma_recibe || ''); // CORREGIDO: firma_recibe -> nombre_firma_recibe
    params.set('firma_conformidad',  datos.firma_conformidad || ''); // CORREGIDO: firma_conf -> firma_conformidad
    params.set('estado',             datos.estado || 'ABIERTA'); // NUEVO: Guardar estado explícitamente
    params.set('token',              obtenerToken()); // CORREGIDO: Enviar token de autenticación
    params.set('usuario',            obtenerUsuario()); // CORREGIDO: Enviar usuario para validación

    const url = SHEETS_WEBAPP_URL + '?' + params.toString();

    const response = await fetch(url, { method: 'GET' });
    const result   = await response.json();

    return result;
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── Obtener órdenes ────────────────────────────────────────────
async function obtenerOrdenes() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(SHEETS_WEBAPP_URL + '?accion=listar&token=' + encodeURIComponent(obtenerToken()) + '&usuario=' + encodeURIComponent(obtenerUsuario()), { signal: controller.signal });
    clearTimeout(timer);
    const result = await response.json();
    return result.ordenes || [];
  } catch (err) {
    return [];
  }
}

// ── Cerrar orden ───────────────────────────────────────────────
async function cerrarOrden(folio, datosCierre) {
  try {
    const params = new URLSearchParams();
    params.set('accion',        'cerrar');
    params.set('folio',         folio);
    params.set('tipo_trabajo', datosCierre.tipo_trabajo || '');
    params.set('hora_recibo',   datosCierre.hora_recibo || '');
    params.set('fecha_atencion',datosCierre.fecha_atencion || '');
    params.set('tecnicos',      datosCierre.tecnicos || '');
    params.set('diagnostico_inicial', datosCierre.diagnostico_inicial || ''); // CORREGIDO: diagnostico -> diagnostico_inicial
    params.set('refacciones_requeridas', datosCierre.refacciones_requeridas || ''); // CORREGIDO: ref_req -> refacciones_requeridas
    params.set('refacciones_almacen', datosCierre.refacciones_almacen || ''); // CORREGIDO: ref_alm -> refacciones_almacen
    params.set('tiempo_entrega_refacciones', datosCierre.tiempo_entrega_refacciones || ''); // CORREGIDO: tiempo_ref -> tiempo_entrega_refacciones
    params.set('actividades_previas', datosCierre.actividades_previas || ''); // CORREGIDO: act_previas -> actividades_previas
    params.set('inicio_reparacion', datosCierre.inicio_reparacion || ''); // CORREGIDO: inicio_rep -> inicio_reparacion
    params.set('hora_inicio',   datosCierre.hora_inicio || '');
    params.set('fecha_estimada_entrega', datosCierre.fecha_estimada_entrega || ''); // CORREGIDO: fecha_est -> fecha_estimada_entrega
    params.set('costo_refacciones', datosCierre.costo_refacciones || ''); // CORREGIDO: costo -> costo_refacciones
    params.set('descripcion_reparacion', datosCierre.descripcion_reparacion || ''); // CORREGIDO: descripcion -> descripcion_reparacion, SIN TRUNCAMIENTO
    params.set('fecha_liberacion', datosCierre.fecha_liberacion || ''); // CORREGIDO: fecha_lib -> fecha_liberacion
    params.set('hora_entrega_equipo', datosCierre.hora_entrega_equipo || ''); // CORREGIDO: hora_entrega -> hora_entrega_equipo
    params.set('tecnico_entrega', datosCierre.tecnico_entrega || ''); // CORREGIDO: tec_entrega -> tecnico_entrega
    params.set('nombre_firma_recibe', datosCierre.nombre_firma_recibe || ''); // CORREGIDO: firma_recibe -> nombre_firma_recibe
    params.set('firma_conformidad', datosCierre.firma_conformidad || ''); // CORREGIDO: firma_conf -> firma_conformidad
    params.set('horas_efectivas', datosCierre.horas_efectivas || ''); // NUEVO: Horas efectivas
    params.set('tipo_mantenimiento', datosCierre.tipo_mantenimiento || ''); // NUEVO: Tipo de mantenimiento (MAYOR/MENOR)
    params.set('estado', 'CERRADA'); // NUEVO: Actualizar estado a CERRADA
    params.set('fecha_cierre', new Date().toISOString().split('T')[0]); // NUEVO: Guardar fecha de cierre actual
    params.set('token', obtenerToken()); // CORREGIDO: Enviar token de autenticación
    params.set('usuario', obtenerUsuario()); // CORREGIDO: Enviar usuario para validación

    const url = SHEETS_WEBAPP_URL + '?' + params.toString();
    const response = await fetch(url, { method: 'GET' });
    const result   = await response.json();
    return result;
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── Guardar configuración de horas laborables ─────────────────────
async function guardarConfiguracionHoras(configHoras) {
  try {
    const params = new URLSearchParams();
    params.set('accion', 'guardarConfigHoras');
    params.set('config', JSON.stringify(configHoras));
    params.set('token', obtenerToken()); // CORREGIDO: Enviar token de autenticación
    params.set('usuario', obtenerUsuario()); // CORREGIDO: Enviar usuario para validación

    const url = SHEETS_WEBAPP_URL + '?' + params.toString();
    const response = await fetch(url, { method: 'GET' });
    const result = await response.json();
    return result;
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── Obtener configuración de horas laborables ───────────────────
async function obtenerConfiguracionHoras() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(SHEETS_WEBAPP_URL + '?accion=obtenerConfigHoras&token=' + encodeURIComponent(obtenerToken()) + '&usuario=' + encodeURIComponent(obtenerUsuario()), { signal: controller.signal });
    clearTimeout(timer);
    const result = await response.json();
    return result.config || {};
  } catch (err) {
    return {};
  }
}

// ── Guardar configuración de usuarios ───────────────────────────
async function guardarConfiguracionUsuarios(usuarios) {
  try {
    const params = new URLSearchParams();
    params.set('accion', 'guardarConfigUsuarios');
    params.set('usuarios', JSON.stringify(usuarios));
    params.set('token', obtenerToken()); // CORREGIDO: Enviar token de autenticación
    params.set('usuario', obtenerUsuario()); // CORREGIDO: Enviar usuario para validación

    // CORREGIDO: Usar GET sin no-cors para poder detectar errores
    const response = await fetch(SHEETS_WEBAPP_URL + '?' + params.toString(), {
      method: 'GET'
    });
    const result = await response.json();
    return result;
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── Obtener configuración de usuarios ───────────────────────────
async function obtenerConfiguracionUsuarios() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(SHEETS_WEBAPP_URL + '?accion=obtenerConfigUsuarios&token=' + encodeURIComponent(obtenerToken()) + '&usuario=' + encodeURIComponent(obtenerUsuario()), { signal: controller.signal });
    clearTimeout(timer);
    const result = await response.json();
    return result.usuarios || [];
  } catch (err) {
    return [];
  }
}

if (typeof module !== 'undefined') {
  module.exports = { 
    guardarOrden, 
    obtenerOrdenes, 
    cerrarOrden,
    guardarConfiguracionHoras,
    obtenerConfiguracionHoras,
    guardarConfiguracionUsuarios,
    obtenerConfiguracionUsuarios
  };
}
