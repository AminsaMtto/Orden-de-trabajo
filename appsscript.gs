/**
 * GOOGLE APPS SCRIPT — Pegar en script.google.com
 * 
 * Instrucciones:
 * 1. Ir a https://script.google.com
 * 2. Crear nuevo proyecto
 * 3. Pegar este código completo
 * 4. Cambiar SPREADSHEET_ID por el ID de tu Google Sheet
 * 5. Ejecutar > Implementar > Nueva implementación > Aplicación web
 *    - Ejecutar como: Yo (tu cuenta)
 *    - Quién tiene acceso: Cualquier persona
 * 6. Copiar la URL generada y pegarla en sheets.js (SHEETS_WEBAPP_URL)
 */

const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI'; // <-- REEMPLAZAR
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
  const accion = e.parameter.accion;
  
  if (accion === 'listar') {
    return listarOrdenes();
  }
  
  return ContentService.createTextOutput(
    JSON.stringify({ ok: false, error: 'Acción no reconocida' })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    
    if (body.accion === 'guardar') {
      return guardarOrden(body.datos);
    } else if (body.accion === 'cerrar') {
      return cerrarOrden(body.folio, body.datosCierre);
    }
    
    return respuesta({ ok: false, error: 'Acción no reconocida' });
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
    
    // Formato encabezados
    const headerRange = hoja.getRange(1, 1, 1, ENCABEZADOS.length);
    headerRange.setBackground('#1a3a5c');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    hoja.setFrozenRows(1);
  }
  
  return hoja;
}

function guardarOrden(datos) {
  const hoja = inicializarHoja();
  
  const fila = [
    datos.folio || '',
    datos.fecha_reporte || '',
    datos.hora_reporte || '',
    datos.quien_reporta || '',
    datos.centro_negocio || '',
    datos.tipo_mantenimiento || '',
    datos.equipo_reportado || '',
    datos.no_control || '',
    datos.falla_reportada || '',
    datos.grado_urgencia || '',
    datos.frecuencia_falla || '',
    datos.hora_recibo || '',
    datos.fecha_atencion || '',
    datos.tecnicos || '',
    datos.diagnostico_inicial || '',
    datos.refacciones_requeridas || '',
    datos.refacciones_almacen || '',
    datos.tiempo_entrega_refacciones || '',
    datos.actividades_previas || '',
    datos.inicio_reparacion || '',
    datos.hora_inicio || '',
    datos.fecha_estimada_entrega || '',
    datos.costo_refacciones || '',
    datos.descripcion_reparacion || '',
    datos.fecha_liberacion || '',
    datos.hora_entrega_equipo || '',
    datos.tecnico_entrega || '',
    datos.nombre_firma_recibe || '',
    datos.firma_conformidad || '',
    'ABIERTA',
    ''
  ];
  
  hoja.appendRow(fila);
  
  // Colorear fila según estado
  const ultimaFila = hoja.getLastRow();
  hoja.getRange(ultimaFila, 1, 1, fila.length).setBackground('#fff8e1');
  
  return respuesta({ ok: true, folio: datos.folio });
}

function listarOrdenes() {
  const hoja = inicializarHoja();
  const datos = hoja.getDataRange().getValues();
  
  if (datos.length <= 1) {
    return respuesta({ ok: true, ordenes: [] });
  }
  
  const encabezados = datos[0].map(h => 
    h.toLowerCase().replace(/ /g, '_').replace(/[()\/]/g, '').replace(/\./g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  );
  
  const ordenes = datos.slice(1).map(fila => {
    const obj = {};
    encabezados.forEach((enc, i) => { obj[enc] = fila[i]; });
    return obj;
  });
  
  return respuesta({ ok: true, ordenes });
}

function cerrarOrden(folio, datosCierre) {
  const hoja = inicializarHoja();
  const datos = hoja.getDataRange().getValues();
  
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][0] === folio) {
      const fila = i + 1;
      // Actualizar campos de cierre
      const campos = {
        14: datosCierre.diagnostico_inicial || datos[i][14],
        23: datosCierre.descripcion_reparacion || datos[i][23],
        24: datosCierre.fecha_liberacion || '',
        25: datosCierre.hora_entrega_equipo || '',
        26: datosCierre.tecnico_entrega || '',
        27: datosCierre.nombre_firma_recibe || '',
        28: datosCierre.firma_conformidad || '',
        29: 'CERRADA',
        30: new Date().toLocaleDateString('es-MX')
      };
      
      Object.entries(campos).forEach(([col, val]) => {
        hoja.getRange(fila, parseInt(col) + 1).setValue(val);
      });
      
      // Color verde para órdenes cerradas
      hoja.getRange(fila, 1, 1, datos[i].length).setBackground('#e8f5e9');
      
      return respuesta({ ok: true });
    }
  }
  
  return respuesta({ ok: false, error: 'Folio no encontrado' });
}

function respuesta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
