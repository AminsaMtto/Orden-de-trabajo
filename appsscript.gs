const SPREADSHEET_ID = '1blnOE_ixZQq6CFF90-JU4nSQJh4uzqOgUUtdN2MkewM';
const HOJA_NOMBRE = 'Ordenes';

const ENCABEZADOS = [
  'Folio', 'Fecha Reporte', 'Hora Reporte', 'Quién Reporta',
  'Centro Negocio', 'Tipo Mantenimiento', 'Equipo Reportado',
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
    const p      = e.parameter;
    const accion = p.accion;

    if (accion === 'listar') {
      return respuesta(listarOrdenes_data());
    }

    if (accion === 'guardar') {
      // Leer campos individuales
      const datos = {
        folio:                      p.folio        || '',
        fecha_reporte:              p.fecha_reporte || '',
        hora_reporte:               p.hora_reporte  || '',
        quien_reporta:              p.quien_reporta || '',
        centro_negocio:             p.centro_negocio || '',
        tipo_mantenimiento:         p.tipo_mant     || '',
        equipo_reportado:           p.equipo        || '',
        no_control:                 p.no_control    || '',
        falla_reportada:            p.falla         || '',
        grado_urgencia:             p.urgencia      || '',
        frecuencia_falla:           p.frecuencia    || '',
        hora_recibo:                p.hora_recibo   || '',
        fecha_atencion:             p.fecha_atencion || '',
        tecnicos:                   p.tecnicos      || '',
        diagnostico_inicial:        p.diagnostico   || '',
        refacciones_requeridas:     p.ref_req       || '',
        refacciones_almacen:        p.ref_alm       || '',
        tiempo_entrega_refacciones: p.tiempo_ref    || '',
        actividades_previas:        p.act_previas   || '',
        inicio_reparacion:          p.inicio_rep    || '',
        hora_inicio:                p.hora_inicio   || '',
        fecha_estimada_entrega:     p.fecha_est     || '',
        costo_refacciones:          p.costo         || '',
        descripcion_reparacion:     p.descripcion   || '',
        fecha_liberacion:           p.fecha_lib     || '',
        hora_entrega_equipo:        p.hora_entrega  || '',
        tecnico_entrega:            p.tec_entrega   || '',
        nombre_firma_recibe:        p.firma_recibe  || '',
        firma_conformidad:          p.firma_conf    || ''
      };
      return respuesta(guardarOrden_data(datos));
    }

    if (accion === 'cerrar') {
      const datosCierre = {
        hora_recibo:                  p.hora_recibo   || '',
        fecha_atencion:               p.fecha_atencion|| '',
        tecnicos:                     p.tecnicos      || '',
        diagnostico_inicial:          p.diagnostico   || '',
        refacciones_requeridas:       p.ref_req       || '',
        refacciones_almacen:          p.ref_alm       || '',
        tiempo_entrega_refacciones:   p.tiempo_ref    || '',
        actividades_previas:          p.act_previas   || '',
        inicio_reparacion:            p.inicio_rep    || '',
        hora_inicio:                  p.hora_inicio   || '',
        fecha_estimada_entrega:       p.fecha_est     || '',
        costo_refacciones:            p.costo         || '',
        descripcion_reparacion:       p.descripcion   || '',
        fecha_liberacion:             p.fecha_lib     || '',
        hora_entrega_equipo:          p.hora_entrega  || '',
        tecnico_entrega:              p.tec_entrega   || '',
        nombre_firma_recibe:          p.firma_recibe  || '',
        firma_conformidad:            p.firma_conf    || ''
      };
      return respuesta(cerrarOrden_data(p.folio, datosCierre));
    }

    if (accion === 'eliminar' && p.folio) {
      return respuesta(eliminarOrden_data(p.folio));
    }

    if (accion === 'login') {
      const u = p.usuario;
      const pw = p.password;
      return respuesta(verificarLogin(u, pw));
    }

    return respuesta({ ok: false, error: 'Accion no reconocida: ' + accion });
  } catch (err) {
    return respuesta({ ok: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.accion === 'guardar') return respuesta(guardarOrden_data(body.datos));
    if (body.accion === 'cerrar')  return respuesta(cerrarOrden_data(body.folio, body.datosCierre));
    return respuesta({ ok: false, error: 'Accion no reconocida' });
  } catch (err) {
    return respuesta({ ok: false, error: err.toString() });
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
    datos.folio, datos.fecha_reporte, datos.hora_reporte,
    datos.quien_reporta, datos.centro_negocio, datos.tipo_mantenimiento,
    datos.equipo_reportado, datos.no_control, datos.falla_reportada,
    datos.grado_urgencia, datos.frecuencia_falla, datos.hora_recibo,
    datos.fecha_atencion, datos.tecnicos, datos.diagnostico_inicial,
    datos.refacciones_requeridas, datos.refacciones_almacen,
    datos.tiempo_entrega_refacciones, datos.actividades_previas,
    datos.inicio_reparacion, datos.hora_inicio,
    datos.fecha_estimada_entrega, datos.costo_refacciones,
    datos.descripcion_reparacion, datos.fecha_liberacion,
    datos.hora_entrega_equipo, datos.tecnico_entrega,
    datos.nombre_firma_recibe, datos.firma_conformidad,
    'ABIERTA', ''
  ];
  hoja.appendRow(fila);
  hoja.getRange(hoja.getLastRow(), 1, 1, fila.length).setBackground('#fff8e1');
  return { ok: true, folio: datos.folio };
}

// Convierte cualquier valor de celda a string limpio
function celda(val) {
  if (val === null || val === undefined || val === '') return '';
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return '';
    // Google Sheets codifica horas como fechas en 1899-12-30
    // Si el año es 1899, es una hora → HH:MM
    if (val.getFullYear() === 1899) {
      return String(val.getHours()).padStart(2,'0') + ':' +
             String(val.getMinutes()).padStart(2,'0');
    }
    // Fecha normal → dd/mm/yyyy
    return String(val.getDate()).padStart(2,'0') + '/' +
           String(val.getMonth()+1).padStart(2,'0') + '/' +
           val.getFullYear();
  }
  return String(val);
}

function listarOrdenes_data() {
  const hoja  = inicializarHoja();
  const datos = hoja.getDataRange().getValues();
  if (datos.length <= 1) return { ok: true, ordenes: [] };

  const enc = datos[0].map(h =>
    String(h).toLowerCase()
      .replace(/ /g,'_')
      .replace(/[()\/]/g,'')
      .replace(/\./g,'')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  );

  const ordenes = datos.slice(1).map(fila => {
    const obj = {};
    enc.forEach((e, i) => { obj[e] = celda(fila[i]); });
    return obj;
  });

  return { ok: true, ordenes };
}

function cerrarOrden_data(folio, datosCierre) {
  const hoja  = inicializarHoja();
  const datos = hoja.getDataRange().getValues();
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][0]) === String(folio)) {
      const fila = i + 1;
      const campos = {
        11: datosCierre.hora_recibo               || celda(datos[i][11]),
        12: datosCierre.fecha_atencion            || celda(datos[i][12]),
        13: datosCierre.tecnicos                  || celda(datos[i][13]),
        14: datosCierre.diagnostico_inicial       || celda(datos[i][14]),
        15: datosCierre.refacciones_requeridas    || celda(datos[i][15]),
        16: datosCierre.refacciones_almacen       || celda(datos[i][16]),
        17: datosCierre.tiempo_entrega_refacciones|| celda(datos[i][17]),
        18: datosCierre.actividades_previas       || celda(datos[i][18]),
        19: datosCierre.inicio_reparacion         || celda(datos[i][19]),
        20: datosCierre.hora_inicio               || celda(datos[i][20]),
        21: datosCierre.fecha_estimada_entrega    || celda(datos[i][21]),
        22: datosCierre.costo_refacciones         || celda(datos[i][22]),
        23: datosCierre.descripcion_reparacion    || celda(datos[i][23]),
        24: datosCierre.fecha_liberacion          || '',
        25: datosCierre.hora_entrega_equipo       || '',
        26: datosCierre.tecnico_entrega           || '',
        27: datosCierre.nombre_firma_recibe       || '',
        28: datosCierre.firma_conformidad         || '',
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

function verificarLogin(usuario, password) {
  try {
    const ss   = SpreadsheetApp.openById(SPREADSHEET_ID);
    let hoja   = ss.getSheetByName('Usuarios');
    if (!hoja) {
      // Crear hoja de usuarios si no existe con admin por defecto
      hoja = ss.insertSheet('Usuarios');
      hoja.appendRow(['Nombre', 'Usuario', 'Password', 'Rol', 'Activo']);
      hoja.appendRow(['Administrador', 'admin', 'aminsa2025', 'Administrador', 'SI']);
      const h = hoja.getRange(1, 1, 1, 5);
      h.setBackground('#1a3a5c');
      h.setFontColor('#ffffff');
      h.setFontWeight('bold');
    }
    const datos = hoja.getDataRange().getValues();
    for (let i = 1; i < datos.length; i++) {
      const fila = datos[i];
      const uNombre  = fila[0];
      const uUsuario = String(fila[1]).trim().toLowerCase();
      const uPass    = String(fila[2]).trim();
      const uRol     = fila[3];
      const uActivo  = String(fila[4]).trim().toUpperCase();
      if (uUsuario === String(usuario).trim().toLowerCase() &&
          uPass    === String(password).trim() &&
          uActivo  === 'SI') {
        return { ok: true, usuario: { nombre: uNombre, usuario: uUsuario, rol: uRol } };
      }
    }
    return { ok: false, error: 'Usuario o contraseña incorrectos' };
  } catch(err) {
    return { ok: false, error: err.toString() };
  }
}

function eliminarOrden_data(folio) {
  const hoja  = inicializarHoja();
  const datos = hoja.getDataRange().getValues();
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][0]) === String(folio)) {
      hoja.deleteRow(i + 1);
      return { ok: true, folio: folio };
    }
  }
  return { ok: false, error: 'Folio no encontrado: ' + folio };
}

function respuesta(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
