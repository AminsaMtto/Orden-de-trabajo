const SPREADSHEET_ID = '1blnOE_ixZQq6CFF90-JU4nSQJh4uzqOgUUtdN2MkewM';
const HOJA_NOMBRE = 'Ordenes';

const ENCABEZADOS = [
  'Folio', 'Fecha Reporte', 'Hora Reporte', 'Quién Reporta',
  'Centro de Negocio', 'Tipo Mantenimiento', 'Equipo Reportado',
  'No. Control', 'Falla Reportada', 'Grado Urgencia', 'Frecuencia Falla',
  'Hora Recibo', 'Fecha Atención', 'Técnico(s)', 'Diagnóstico Inicial',
  'Refacciones Requeridas', 'Refacciones en Almacén', 'Tiempo Entrega Refacciones',
  'Actividades Previas', 'Inicio Reparación', 'Hora Inicio',
  'Fecha Estimada Entrega', 'Costo Refacciones', 'Descripción Reparación',
  'Fecha Liberación', 'Hora Entrega Equipo', 'Técnico Entrega',
  'Nombre/Firma Recibe', 'Firma Conformidad', 'Estado', 'Fecha Cierre'
];

function doGet(e) {
  try {
    const accion   = e.parameter.accion;
    const callback = e.parameter.callback; // para JSONP

    let resultado;

    if (accion === 'listar') {
      resultado = listarOrdenes_data();
    } else if (accion === 'guardar' && e.parameter.datos) {
      const datos = JSON.parse(e.parameter.datos);
      resultado = guardarOrden_data(datos);
    } else if (accion === 'cerrar' && e.parameter.folio) {
      const folio       = e.parameter.folio;
      const datosCierre = JSON.parse(e.parameter.datosCierre || '{}');
      resultado = cerrarOrden_data(folio, datosCierre);
    } else {
      resultado = { ok: false, error: 'Accion no reconocida: ' + accion };
    }

    // Si viene callback = JSONP
    if (callback) {
      return ContentService
        .createTextOutput(callback + '(' + JSON.stringify(resultado) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return ContentService
      .createTextOutput(JSON.stringify(resultado))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const body      = JSON.parse(e.postData.contents);
    const accion    = body.accion;
    let resultado;

    if (accion === 'guardar') resultado = guardarOrden_data(body.datos);
    else if (accion === 'cerrar') resultado = cerrarOrden_data(body.folio, body.datosCierre);
    else resultado = { ok: false, error: 'Accion no reconocida' };

    return ContentService
      .createTextOutput(JSON.stringify(resultado))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function inicializarHoja() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let hoja = ss.getSheetByName(HOJA_NOMBRE);
  if (!hoja) {
    hoja = ss.insertSheet(HOJA_NOMBRE);
    hoja.appendRow(ENCABEZADOS);
    const h = hoja.getRange(1, 1, 1, ENCABEZADOS.length);
    h.setBackground('#1a3a5c');
    h.setFontColor('#ffffff');
    h.setFontWeight('bold');
    hoja.setFrozenRows(1);
  }
  return hoja;
}

function guardarOrden_data(datos) {
  const hoja = inicializarHoja();
  const fila = [
    datos.folio || '', datos.fecha_reporte || '', datos.hora_reporte || '',
    datos.quien_reporta || '', datos.centro_negocio || '', datos.tipo_mantenimiento || '',
    datos.equipo_reportado || '', datos.no_control || '', datos.falla_reportada || '',
    datos.grado_urgencia || '', datos.frecuencia_falla || '', datos.hora_recibo || '',
    datos.fecha_atencion || '', datos.tecnicos || '', datos.diagnostico_inicial || '',
    datos.refacciones_requeridas || '', datos.refacciones_almacen || '',
    datos.tiempo_entrega_refacciones || '', datos.actividades_previas || '',
    datos.inicio_reparacion || '', datos.hora_inicio || '',
    datos.fecha_estimada_entrega || '', datos.costo_refacciones || '',
    datos.descripcion_reparacion || '', datos.fecha_liberacion || '',
    datos.hora_entrega_equipo || '', datos.tecnico_entrega || '',
    datos.nombre_firma_recibe || '', datos.firma_conformidad || '',
    'ABIERTA', ''
  ];
  hoja.appendRow(fila);
  hoja.getRange(hoja.getLastRow(), 1, 1, fila.length).setBackground('#fff8e1');
  return { ok: true, folio: datos.folio };
}

function listarOrdenes_data() {
  const hoja  = inicializarHoja();
  const datos = hoja.getDataRange().getValues();
  if (datos.length <= 1) return { ok: true, ordenes: [] };
  const enc = datos[0].map(h =>
    h.toLowerCase().replace(/ /g,'_').replace(/[()\/]/g,'').replace(/\./g,'')
     .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  );
  const ordenes = datos.slice(1).map(fila => {
    const obj = {};
    enc.forEach((e, i) => { obj[e] = fila[i]; });
    return obj;
  });
  return { ok: true, ordenes };
}

function cerrarOrden_data(folio, datosCierre) {
  const hoja  = inicializarHoja();
  const datos = hoja.getDataRange().getValues();
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][0]) === String(folio)) {
      const fila   = i + 1;
      const campos = {
        14: datosCierre.diagnostico_inicial    || datos[i][14],
        23: datosCierre.descripcion_reparacion || datos[i][23],
        24: datosCierre.fecha_liberacion       || '',
        25: datosCierre.hora_entrega_equipo    || '',
        26: datosCierre.tecnico_entrega        || '',
        27: datosCierre.nombre_firma_recibe    || '',
        28: datosCierre.firma_conformidad      || '',
        29: 'CERRADA',
        30: new Date().toLocaleDateString('es-MX')
      };
      Object.entries(campos).forEach(([col, val]) => {
        hoja.getRange(fila, parseInt(col) + 1).setValue(val);
      });
      hoja.getRange(fila, 1, 1, datos[i].length).setBackground('#e8f5e9');
      return { ok: true };
    }
  }
  return { ok: false, error: 'Folio no encontrado: ' + folio };
}
