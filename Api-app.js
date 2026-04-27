// ==========================================
// API ACTIONS: ARSIP (READ, CREATE, UPDATE, DELETE)
// ==========================================

function getArsipList() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ws = ss.getSheetByName("arsip");
    
    if (!ws) {
      return { status: "error", message: "Sheet 'arsip' tidak ditemukan", data: [] };
    }
    
    // PERBAIKAN PENTING: getDisplayValues() mengubah semua format menjadi Teks Murni
    // Ini mencegah Silent Crash / Timeout saat mengirim data kembali ke HTML
    var data = ws.getDataRange().getDisplayValues();
    
    if (data.length < 2) {
      return { status: "success", data: [] }; 
    }
    
    var headers = data[0];
    var result = [];
    
    // Batasi ambil 500 data terakhir agar web tetap cepat
    var startIndex = Math.max(1, data.length - 500); 
    
    for (var i = startIndex; i < data.length; i++) {
      var row = data[i];
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j] || ""; 
      }
      result.push(obj);
    }
    
    return { status: "success", data: result.reverse() };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

function simpanArsipWeb(data) {
  try {
    var ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("arsip");
    ws.appendRow([data.id, data["Nomor Surat"], data["Nopol"], data["Status"]]);
    return { status: "success", message: "Data Arsip berhasil disimpan!" };
  } catch (e) { 
    return { status: "error", message: e.toString() }; 
  }
}

function editArsipWeb(data) {
  try {
    var ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("arsip");
    // Gunakan getDisplayValues untuk komparasi string yang lebih aman
    var sheetData = ws.getDataRange().getDisplayValues();
    
    for (var i = 1; i < sheetData.length; i++) {
      // Cari baris berdasarkan ID atau Nomor Surat
      if (sheetData[i][0] == data.id || sheetData[i][1] == data["Nomor Surat"]) {
        ws.getRange(i + 1, 1).setValue(data.id); 
        ws.getRange(i + 1, 2).setValue(data["Nomor Surat"]);
        ws.getRange(i + 1, 3).setValue(data["Nopol"]);
        ws.getRange(i + 1, 4).setValue(data["Status"]);
        return { status: "success", message: "Data Arsip berhasil diubah!" };
      }
    }
    return { status: "error", message: "Data arsip tidak ditemukan untuk diedit." };
  } catch (e) { 
    return { status: "error", message: e.toString() }; 
  }
}

function hapusArsipWeb(id) {
  try {
    var ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("arsip");
    var sheetData = ws.getDataRange().getDisplayValues();
    
    for (var i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0] == id || sheetData[i][1] == id) { 
        ws.deleteRow(i + 1);
        return { status: "success", message: "Arsip berhasil dihapus permanen!" };
      }
    }
    return { status: "error", message: "Data arsip tidak ditemukan." };
  } catch (e) { 
    return { status: "error", message: e.toString() }; 
  }
}

// ==========================================
// API ACTIONS: BOX (READ, CREATE, UPDATE, DELETE)
// ==========================================

function getBoxList() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ws = ss.getSheetByName("box");
    
    if (!ws) {
      return { status: "error", message: "Sheet 'box' tidak ditemukan", data: [] };
    }
    
    var data = ws.getDataRange().getDisplayValues();
    if (data.length < 2) {
      return { status: "success", data: [] }; 
    }
    
    var headers = data[0];
    var result = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j] || ""; 
      }
      result.push(obj);
    }
    
    return { status: "success", data: result };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

function simpanBoxWeb(data) {
  try {
    var ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("box");
    ws.appendRow([data.id, data["Nama Box"], data["Range Isi"]]);
    return { status: "success", message: "Box berhasil ditambahkan!" };
  } catch (e) { 
    return { status: "error", message: e.toString() }; 
  }
}

function editBoxWeb(data) {
  try {
    var ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("box");
    var sheetData = ws.getDataRange().getDisplayValues();
    
    for (var i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0] == data.id || sheetData[i][1] == data["Nama Box"]) {
        ws.getRange(i + 1, 1).setValue(data.id);
        ws.getRange(i + 1, 2).setValue(data["Nama Box"]);
        ws.getRange(i + 1, 3).setValue(data["Range Isi"]);
        return { status: "success", message: "Data Box berhasil diubah!" };
      }
    }
    return { status: "error", message: "Data box tidak ditemukan." };
  } catch (e) { 
    return { status: "error", message: e.toString() }; 
  }
}

function hapusBoxWeb(id) {
  try {
    var ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("box");
    var sheetData = ws.getDataRange().getDisplayValues();
    
    for (var i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0] == id || sheetData[i][1] == id) {
        ws.deleteRow(i + 1);
        return { status: "success", message: "Box berhasil dihapus!" };
      }
    }
    return { status: "error", message: "Data box tidak ditemukan." };
  } catch (e) { 
    return { status: "error", message: e.toString() }; 
  }
}