const HOJA_PREVENTIVO = 'Preventivos';

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    let result;
    
    if (body.accion === 'guardarPreventivo') {
      result = guardarPreventivo_data(body.datos);
    } else if (body.accion === 'listarPreventivos') {
      result = listarPreventivos_data();
    } else if (body.accion === 'actualizarPreventivo') {
      result = actualizarPreventivo_data(body.id, body.datos);
    } else if (body.accion === 'eliminarPreventivo') {
      result = eliminarPreventivo_data(body.id);
    } else {
      result = { ok: false, error: 'Acción no reconocida' };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function guardarPreventivo_data(datos) {
  const hoja = SpreadsheetApp.openById('ID_TU_SHEET').getSheetByName(HOJA_PREVENTIVO);
  const fila = [
    datos.equipo, datos.centro_de_negocio, datos.frecuencia,
    datos.ultimo_mantenimiento, datos.proximo_mantenimiento,
    datos.tecnico, datos.observaciones, datos.estado
  ];
  hoja.appendRow(fila);
  return { ok: true };
}

function listarPreventivos_data() {
  const hoja = SpreadsheetApp.openById('ID_TU_SHEET').getSheetByName(HOJA_PREVENTIVO);
  const datos = hoja.getDataRange().getValues();
  const encabezados = datos[0];
  const filas = datos.slice(1).map(fila => {
    const objeto = {};
    encabezados.forEach((header, index) => {
      objeto[header.toLowerCase().replace(/\s+/g, '_')] = fila[index] || '';
    });
    return objeto;
  });
  return { ok: true, preventivos: filas };
}
