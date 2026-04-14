// === Fungsi untuk menerima input dari HTML dialog/sidebar ===
function inputDataBibit(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Sheet tidak ditemukan');
  var headerMap = buildHeaderMap(sheet);
  var lastRow = sheet.getLastRow();
  var newRow = lastRow + 1;
  var totalCols = sheet.getLastColumn();
  // Pastikan kolom utama ada
  var colsNeeded = [
    { name: "Nomor Surat", mapKey: "nomorsurat" },
    { name: "Status Approval", mapKey: "statusapproval" },
    { name: "Approved By", mapKey: "approvedby" },
    { name: "Approved At", mapKey: "approvedat" },
    { name: "Dibuat Oleh", mapKey: "dibuatoleh" },
    { name: "Driver", mapKey: "driver" },
    { name: "Kode Verifikasi", mapKey: "kodeverifikasi" },
    { name: "Link PDF", mapKey: "linkpdf" },
    { name: "Status Kirim", mapKey: "statuskirim" }
  ];
  for (var c = 0; c < colsNeeded.length; c++) {
    var colName = colsNeeded[c].name;
    var mapKey = colsNeeded[c].mapKey;
    if (headerMap[mapKey] === -1) {
      totalCols++;
      sheet.getRange(1, totalCols).setValue(colName);
    }
  }
  totalCols = sheet.getLastColumn();
  headerMap = buildHeaderMap(sheet);
  var rowData = new Array(totalCols).fill("");
  if (headerMap.tanggal >= 0) rowData[headerMap.tanggal] = data.tanggal || "";
  if (headerMap.bulan >= 0 && data.tanggal) {
    var d = new Date(data.tanggal + "T00:00:00");
    if (!isNaN(d.getTime())) {
      rowData[headerMap.bulan] = Utilities.formatDate(d, "Asia/Makassar", "MMMM yyyy");
    }
  }
  if (headerMap.bibit >= 0) rowData[headerMap.bibit] = data.bibit || "";
  if (headerMap.masuk >= 0) rowData[headerMap.masuk] = Number(data.masuk) || 0;
  if (headerMap.keluar >= 0) rowData[headerMap.keluar] = Number(data.keluar) || 0;
  if (headerMap.mati >= 0) rowData[headerMap.mati] = Number(data.mati) || 0;
  if (headerMap.sumber >= 0) rowData[headerMap.sumber] = data.sumber || "";
  if (headerMap.tujuan >= 0) rowData[headerMap.tujuan] = data.tujuan || "";
  // Kolom Dibuat Oleh
  var dibuatOlehCol = headerMap.dibuatoleh;
  if (dibuatOlehCol === -1) {
    totalCols++;
    sheet.getRange(1, totalCols).setValue("Dibuat Oleh");
    dibuatOlehCol = totalCols - 1;
  }
  rowData[dibuatOlehCol] = data.dibuatOleh || "";
  // Kolom Driver
  var driverCol = headerMap.driver;
  if (driverCol === -1) {
    totalCols++;
    sheet.getRange(1, totalCols).setValue("Driver");
    driverCol = totalCols - 1;
  }
  rowData[driverCol] = data.driver || "";
  // Hitung total = masuk - keluar - mati
  if (headerMap.total >= 0) {
    var masuk = Number(data.masuk) || 0;
    var keluar = Number(data.keluar) || 0;
    var mati = Number(data.mati) || 0;
    rowData[headerMap.total] = masuk - keluar - mati;
  }
  // Generate kode verifikasi 10 karakter
  var verifyCol = headerMap.kodeverifikasi;
  if (verifyCol === -1) {
    totalCols++;
    sheet.getRange(1, totalCols).setValue("Kode Verifikasi");
    verifyCol = totalCols - 1;
  }
  rowData[verifyCol] = generateVerificationCode(10);
  // Kolom Nomor Surat
  var nomorSuratCol = headerMap.nomorsurat;
  if (nomorSuratCol === -1) {
    totalCols++;
    sheet.getRange(1, totalCols).setValue("Nomor Surat");
    nomorSuratCol = totalCols - 1;
  }
  var nomorSurat = generateNomorSurat(newRow, data.tanggal || new Date().toISOString().split("T")[0]);
  rowData[nomorSuratCol] = nomorSurat;
  // Kolom link PDF
  var linkPdfCol = headerMap.linkpdf;
  if (linkPdfCol === -1) {
    totalCols++;
    sheet.getRange(1, totalCols).setValue("Link PDF");
    linkPdfCol = totalCols - 1;
  }
  // Tulis baris baru ke sheet
  sheet.getRange(newRow, 1, 1, totalCols).setValues([rowData]);
  // Generate PDF Surat Jalan dan simpan ke Drive
  var pdfUrl = "";
  try {
    var tanggalStr = data.tanggal || new Date().toISOString().split("T")[0];
    var bibitStr = data.bibit || "-";
    var keluarNum = Number(data.keluar) || 0;
    var sumberStr = data.sumber || "-";
    var tujuanStr = data.tujuan || "-";
    var kodeVer = rowData[verifyCol];
    var dibuatOlehStr = data.dibuatOleh || "-";
    var driverStr = data.driver || "-";
    pdfUrl = generateSuratJalanPdf(tanggalStr, bibitStr, keluarNum, sumberStr, tujuanStr, kodeVer, nomorSurat, dibuatOlehStr, driverStr);
    if (pdfUrl) {
      sheet.getRange(newRow, linkPdfCol + 1).setValue(pdfUrl);
      savePdfLinkToSheet(nomorSurat, tanggalStr, bibitStr, tujuanStr, pdfUrl, dibuatOlehStr, driverStr);
    }
  } catch (pdfErr) {
    Logger.log("inputDataBibit: PDF generation gagal: " + pdfErr.message);
  }
  return { success: true, nomorSurat: nomorSurat, linkPdf: pdfUrl };
}
// === Kirim Otomatis ke WhatsApp via Fonnte ===
// Semua jenis bibit tetap dikirim, tapi analisis tim hanya fokus pada "SENGON POTTING"
const TOKEN_FONNTE = "VDFAKtD3JhwNymAf6Sgz";
const NOMOR_ADMIN = "120363225239992587@g.us,120363420098143015@g.us";
const SHEET_NAME = "Bibit";
const MASTER_SHEET_NAME = "Master";
const FOLDER_SURAT_JALAN = "Surat Jalan Bibit";

// === Inisialisasi Sheet Master untuk dropdown Dibuat Oleh & Driver ===
function initMasterSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var master = ss.getSheetByName(MASTER_SHEET_NAME);
  if (!master) {
    master = ss.insertSheet(MASTER_SHEET_NAME);
    master.getRange(1, 1).setValue("Dibuat Oleh");
    master.getRange(1, 2).setValue("Driver");
    // Contoh data awal — bisa diedit langsung di sheet
    master.getRange(2, 1).setValue("Admin Nursery");
    master.getRange(3, 1).setValue("Petugas Nursery");
    master.getRange(2, 2).setValue("Sopir 1");
    master.getRange(3, 2).setValue("Sopir 2");
    master.autoResizeColumns(1, 2);
  }
  return master;
}

// === Ambil daftar dropdown dari sheet Master ===
function getDropdownOptions() {
  var master = initMasterSheet();
  var data = master.getDataRange().getValues();
  var dibuatOleh = [];
  var driver = [];
  for (var i = 1; i < data.length; i++) {
    var nama = (data[i][0] || "").toString().trim();
    var drv = (data[i][1] || "").toString().trim();
    if (nama) dibuatOleh.push(nama);
    if (drv) driver.push(drv);
  }
  return { dibuatOleh: dibuatOleh, driver: driver };
}

// === Handler CORS Preflight OPTIONS ===
function doOptions(e) {
  return ContentService.createTextOutput()
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
}

// === Web API — doPost (Terima data dari form) ===
function doPost(e) {
  Logger.log("POST DATA: " + (e && e.postData && e.postData.contents ? e.postData.contents : "(no data)"));
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Sheet not found" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var body = e.parameter;
    var headerMap = buildHeaderMap(sheet);

    // === Handler Approval ===
    if (body.action === "approve" && body.nomorSurat) {
      // Pastikan kolom approval, approvedBy, approvedAt ada
      var approvalCol = headerMap.statusapproval;
      var approvedByCol = headerMap.approvedby;
      var approvedAtCol = headerMap.approvedat;
      var nomorSuratCol = headerMap.nomorsurat;
      var totalCols = sheet.getLastColumn();
      var headers = sheet.getRange(1, 1, 1, totalCols).getValues()[0].map(function(h){return h.toString().toLowerCase();});

      // Tambah kolom jika belum ada
      if (approvalCol === undefined || approvalCol === -1) {
        approvalCol = totalCols;
        sheet.getRange(1, approvalCol + 1).setValue("Status Approval");
        totalCols++;
      }
      if (approvedByCol === undefined || approvedByCol === -1) {
        approvedByCol = totalCols;
        sheet.getRange(1, approvedByCol + 1).setValue("Approved By");
        totalCols++;
      }
      if (approvedAtCol === undefined || approvedAtCol === -1) {
        approvedAtCol = totalCols;
        sheet.getRange(1, approvedAtCol + 1).setValue("Approved At");
        totalCols++;
      }
      if (nomorSuratCol === undefined || nomorSuratCol === -1) {
        // Coba cari header "No" atau "Nomor Surat"
        nomorSuratCol = headers.findIndex(function(h){return h.indexOf("nomor surat")!==-1||h==="no";});
        if (nomorSuratCol === -1) {
          return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Kolom Nomor Surat tidak ditemukan" }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }

      var data = sheet.getDataRange().getValues();
      var found = false;
      for (var i = 1; i < data.length; i++) {
        var val = (data[i][nomorSuratCol]||"").toString().trim();
        if (val === body.nomorSurat) {
          sheet.getRange(i+1, approvalCol+1).setValue(body.status||"approved");
          sheet.getRange(i+1, approvedByCol+1).setValue(body.approvedBy||"");
          sheet.getRange(i+1, approvedAtCol+1).setValue(body.approvedAt||new Date());
          found = true;
          break;
        }
      }
      if (!found) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Nomor Surat tidak ditemukan" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Approval berhasil disimpan" }))
      .setMimeType(ContentService.MimeType.JSON);
    }

    // === Handler Input Data Bibit (default) ===
    var lastRow = sheet.getLastRow();
    var newRow = lastRow + 1;
    var totalCols = sheet.getLastColumn();
    
    // Pre-create all required columns first to get correct count
    // Urutan penting: Nomor Surat, Status Approval,Approved By,Approved At, kemudian field lain
    var colsNeeded = [
      { name: "Nomor Surat", mapKey: "nomorsurat" },
      { name: "Status Approval", mapKey: "statusapproval" },
      { name: "Approved By", mapKey: "approvedby" },
      { name: "Approved At", mapKey: "approvedat" },
      { name: "Dibuat Oleh", mapKey: "dibuatoleh" },
      { name: "Driver", mapKey: "driver" },
      { name: "Kode Verifikasi", mapKey: "kodeverifikasi" },
      { name: "Link PDF", mapKey: "linkpdf" },
      { name: "Status Kirim", mapKey: "statuskirim" }
    ];
    
    // Tambah kolom baru secara urut (tidak lompat)
    for (var c = 0; c < colsNeeded.length; c++) {
      var colName = colsNeeded[c].name;
      var mapKey = colsNeeded[c].mapKey;
      if (headerMap[mapKey] === -1) {
        totalCols++;
        sheet.getRange(1, totalCols).setValue(colName);
      }
    }
    
    // Rebuild headerMap after adding columns
    totalCols = sheet.getLastColumn();
    headerMap = buildHeaderMap(sheet);
    
    // Now create rowData with correct size
    var rowData = new Array(totalCols).fill("");

    // Isi data sesuai posisi header
    if (headerMap.tanggal >= 0) rowData[headerMap.tanggal] = body.tanggal || "";
    if (headerMap.bulan >= 0 && body.tanggal) {
      var d = new Date(body.tanggal + "T00:00:00");
      if (!isNaN(d.getTime())) {
        rowData[headerMap.bulan] = Utilities.formatDate(d, "Asia/Makassar", "MMMM yyyy");
      }
    }
    if (headerMap.bibit >= 0) rowData[headerMap.bibit] = body.bibit || "";
    if (headerMap.masuk >= 0) rowData[headerMap.masuk] = Number(body.masuk) || 0;
    if (headerMap.keluar >= 0) rowData[headerMap.keluar] = Number(body.keluar) || 0;
    if (headerMap.mati >= 0) rowData[headerMap.mati] = Number(body.mati) || 0;
    if (headerMap.sumber >= 0) rowData[headerMap.sumber] = body.sumber || "";
    if (headerMap.tujuan >= 0) rowData[headerMap.tujuan] = body.tujuan || "";

    // Kolom Dibuat Oleh
    var dibuatOlehCol = headerMap.dibuatoleh;
    if (dibuatOlehCol === -1) {
      totalCols++;
      sheet.getRange(1, totalCols).setValue("Dibuat Oleh");
      dibuatOlehCol = totalCols - 1;
    }
    rowData[dibuatOlehCol] = body.dibuat_oleh || body.dibuatOleh || "";

    // Kolom Driver
    var driverCol = headerMap.driver;
    if (driverCol === -1) {
      totalCols++;
      sheet.getRange(1, totalCols).setValue("Driver");
      driverCol = totalCols - 1;
    }
    rowData[driverCol] = body.driver || "";

    // Hitung total = masuk - keluar - mati (kumulatif bisa dihitung ulang di sheet)
    if (headerMap.total >= 0) {
      var masuk = Number(body.masuk) || 0;
      var keluar = Number(body.keluar) || 0;
      var mati = Number(body.mati) || 0;
      rowData[headerMap.total] = masuk - keluar - mati;
    }

    // Generate kode verifikasi 10 karakter
    var verifyCol = headerMap.kodeverifikasi;
    if (verifyCol === -1) {
      totalCols++;
      sheet.getRange(1, totalCols).setValue("Kode Verifikasi");
      verifyCol = totalCols - 1;
    }
    rowData[verifyCol] = generateVerificationCode(10);

    // Kolom Nomor Surat
    var nomorSuratCol = headerMap.nomorsurat;
    if (nomorSuratCol === -1) {
      totalCols++;
      sheet.getRange(1, totalCols).setValue("Nomor Surat");
      nomorSuratCol = totalCols - 1;
    }
    var nomorSurat = generateNomorSurat(newRow, body.tanggal || new Date().toISOString().split("T")[0]);
    rowData[nomorSuratCol] = nomorSurat;
    
    // Kolom link PDF
    var linkPdfCol = headerMap.linkpdf;
    if (linkPdfCol === -1) {
      totalCols++;
      sheet.getRange(1, totalCols).setValue("Link PDF");
      linkPdfCol = totalCols - 1;
    }

    // Tulis baris baru ke sheet
    sheet.getRange(newRow, 1, 1, totalCols).setValues([rowData]);

    // Refresh headerMap untuk mendapatkan posisi kolom terbaru
    var finalHeaderMap = buildHeaderMap(sheet);
    var finalLinkPdfCol = finalHeaderMap.linkpdf >= 0 ? finalHeaderMap.linkpdf + 1 : linkPdfCol + 1;
    var finalNomorSuratCol = finalHeaderMap.nomorsurat >= 0 ? finalHeaderMap.nomorsurat + 1 : nomorSuratCol + 1;
    
    // Generate PDF Surat Jalan dan simpan ke Drive
    var pdfUrl = "";

    try {
      var tanggalStr = body.tanggal || new Date().toISOString().split("T")[0];
      var bibitStr = body.bibit || "-";
      var keluarNum = Number(body.keluar) || 0;
      var sumberStr = body.sumber || "-";
      var tujuanStr = body.tujuan || "-";
      var kodeVer = rowData[verifyCol];
      var dibuatOlehStr = body.dibuat_oleh || body.dibuatOleh || "-";
      var driverStr = body.driver || "-";
      pdfUrl = generateSuratJalanPdf(tanggalStr, bibitStr, keluarNum, sumberStr, tujuanStr, kodeVer, nomorSurat, dibuatOlehStr, driverStr);

      // Simpan link PDF dan nomor surat ke sheet utama
      if (pdfUrl) {
        sheet.getRange(newRow, finalLinkPdfCol).setValue(pdfUrl);
        // Simpan juga ke sheet khusus link PDF
        savePdfLinkToSheet(nomorSurat, tanggalStr, bibitStr, tujuanStr, pdfUrl, dibuatOlehStr, driverStr);
      }
    } catch (pdfErr) {
      Logger.log("doPost: PDF generation gagal: " + pdfErr.message);
    }
// === Simpan data link PDF ke sheet khusus ===
function savePdfLinkToSheet(nomorSurat, tanggal, bibit, tujuan, linkPdf, dibuatOleh, driver) {
  var SHEET_LINKS = "SuratJalanLinks";
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_LINKS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_LINKS);
    sheet.appendRow(["Nomor Surat", "Tanggal", "Bibit", "Tujuan", "Link PDF", "Dibuat Oleh", "Driver"]);
  }
  sheet.appendRow([
    nomorSurat,
    tanggal,
    bibit,
    tujuan,
    linkPdf,
    dibuatOleh,
    driver
  ]);
}

    // Auto-kirim notifikasi WhatsApp via Fonnte
    try {
      var updatedData = sheet.getDataRange().getValues();
      var updatedHeaderMap = buildHeaderMap(sheet);
      var rowValues = newRow > 1 ? updatedData[newRow - 1] : [];
      kirimPesanFonnte(sheet, newRow, updatedHeaderMap, updatedData, rowValues);
    } catch (fonntErr) {
      Logger.log("doPost: Fonnte auto-send gagal: " + fonntErr.message);
    }

     // Return response dengan nomorSurat dan linkPdf
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      row: newRow,
      nomorSurat: nomorSurat,
      linkPdf: pdfUrl,
      message: "Data berhasil disimpan"
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        "Access-Control-Allow-Origin": "*"
      });

  } catch (err) {
    Logger.log("doPost error: " + err.message);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.message
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// === Web API — doGet ===
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Sheet not found" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var headerMap = buildHeaderMap(sheet);
  var allData = sheet.getDataRange().getValues();

  // === Dropdowns endpoint: ?action=dropdowns ===
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action.toString().trim() : "";
  if (action === "dropdowns") {
    var opts = getDropdownOptions();
    return ContentService.createTextOutput(JSON.stringify(opts))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        "Access-Control-Allow-Origin": "*"
      });
  }

  // === Verify endpoint: ?verify=KODE10CHAR ===
  var verifyCode = (e && e.parameter && e.parameter.verify) ? e.parameter.verify.toString().trim() : "";
  if (verifyCode) {
    var verifyResp = handleVerify(verifyCode, headerMap, allData);
    return verifyResp;
  }

  var rows = [];

  for (var i = 1; i < allData.length; i++) {
    var r = allData[i];
    var tanggalRaw = safeGet(r, headerMap.tanggal, "");
    var tanggal = "";
    if (tanggalRaw instanceof Date && !isNaN(tanggalRaw)) {
      tanggal = Utilities.formatDate(tanggalRaw, "Asia/Makassar", "yyyy-MM-dd");
    } else if (tanggalRaw) {
      tanggal = tanggalRaw.toString();
    }
    if (!tanggal) continue;

    rows.push({
      no: i,
      tanggal: tanggal,
      bulan: safeGet(r, headerMap.bulan, ""),
      bibit: safeGet(r, headerMap.bibit, "").toString().trim(),
      masuk: safeNum(r, headerMap.masuk, 0),
      keluar: safeNum(r, headerMap.keluar, 0),
      mati: safeNum(r, headerMap.mati, 0),
      total: safeNum(r, headerMap.total, 0),
      sumber: safeGet(r, headerMap.sumber, "").toString().trim(),
      tujuan: safeGet(r, headerMap.tujuan, "").toString().trim(),
      nomorSurat: safeGet(r, headerMap.nomorsurat, "").toString().trim(),
      statusApproval: safeGet(r, headerMap.statusapproval, "").toString().trim(),
      approvedBy: safeGet(r, headerMap.approvedby, "").toString().trim(),
      approvedAt: safeGet(r, headerMap.approvedat, "").toString().trim(),
      statusKirim: safeGet(r, headerMap.statuskirim, "").toString().trim(),
      kodeVerifikasi: safeGet(r, headerMap.kodeverifikasi, "").toString().trim(),
      linkPdf: safeGet(r, headerMap.linkpdf, "").toString().trim(),
      dibuatOleh: safeGet(r, headerMap.dibuatoleh, "").toString().trim(),
      driver: safeGet(r, headerMap.driver, "").toString().trim()
    });
  }

  var output = JSON.stringify({ data: rows, count: rows.length, timestamp: new Date().toISOString() });
  return ContentService.createTextOutput(output)
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      "Access-Control-Allow-Origin": "*"
    });
}

// === Verify handler — cari kode verifikasi di sheet ===
function handleVerify(code, headerMap, allData) {
  for (var i = 1; i < allData.length; i++) {
    var r = allData[i];
    var kode = safeGet(r, headerMap.kodeverifikasi, "").toString().trim();
    if (kode === code) {
      var tanggalRaw = safeGet(r, headerMap.tanggal, "");
      var tanggal = "";
      if (tanggalRaw instanceof Date && !isNaN(tanggalRaw)) {
        tanggal = Utilities.formatDate(tanggalRaw, "Asia/Makassar", "yyyy-MM-dd");
      } else if (tanggalRaw) {
        tanggal = tanggalRaw.toString();
      }

      var result = {
        valid: true,
        tanggal: tanggal,
        bibit: safeGet(r, headerMap.bibit, "").toString().trim(),
        masuk: safeNum(r, headerMap.masuk, 0),
        keluar: safeNum(r, headerMap.keluar, 0),
        mati: safeNum(r, headerMap.mati, 0),
        sumber: safeGet(r, headerMap.sumber, "").toString().trim(),
        tujuan: safeGet(r, headerMap.tujuan, "").toString().trim(),
        kodeVerifikasi: kode
      };
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Kode tidak ditemukan
  return ContentService.createTextOutput(JSON.stringify({ valid: false, error: "Kode verifikasi tidak ditemukan" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// === Menu Manual ===
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Montana AI")
    .addItem("Kirim baris aktif", "sendSelectedRow")
    .addItem("Tes kirim baris ke-2", "testKirimManual")
    .addItem("Scan & kirim pending", "scanAndSendPendingRows")
    .addSeparator()
    .addItem("Inisialisasi Sheet Master (Dropdown)", "initMasterSheet")
    .addToUi();
}

// === FUNGSI MENU: Kirim Baris Aktif ===
function sendSelectedRow() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    SpreadsheetApp.getUi().alert(`Sheet "${SHEET_NAME}" tidak ditemukan.`);
    return;
  }
  const row = sheet.getActiveRange().getRow();
  if (row <= 1) {
    SpreadsheetApp.getUi().alert("Silakan pilih baris data (bukan header) untuk dikirim.");
    return;
  }

  const headerMap = buildHeaderMap(sheet);
  const allData = sheet.getDataRange().getValues();

  SpreadsheetApp.getUi().alert(`Mencoba mengirim data dari baris ${row}...`);
  kirimPesanFonnte(sheet, row, headerMap, allData, allData[row - 1]);
}

// === FUNGSI MENU: Tes Kirim Baris 2 ===
function testKirimManual() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    SpreadsheetApp.getUi().alert(`Sheet "${SHEET_NAME}" tidak ditemukan.`);
    return;
  }

  const headerMap = buildHeaderMap(sheet);
  const allData = sheet.getDataRange().getValues();
  const rowToTest = 2;

  if (allData.length < rowToTest) {
    SpreadsheetApp.getUi().alert("Tidak ada data di baris 2 untuk dites.");
    return;
  }

  SpreadsheetApp.getUi().alert("Mencoba mengirim data dari baris 2...");
  kirimPesanFonnte(sheet, rowToTest, headerMap, allData, allData[rowToTest - 1]);
}

// === Helper ===
function generateVerificationCode(length) {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  var code = '';
  for (var i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateNomorSurat(rowNum, tanggal) {
  var bulanRomawi = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
  var d = new Date(tanggal + 'T00:00:00');
  if (isNaN(d.getTime())) d = new Date();
  var bulan = bulanRomawi[d.getMonth()] || 'I';
  var tahun = d.getFullYear();
  var nomor = ('0000' + rowNum).slice(-4);
  return 'SJ-BIBIT/' + nomor + '/' + bulan + '/' + tahun;
}

// === Get or create Drive folder ===
function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

// === Generate Surat Jalan PDF dan simpan ke Drive ===
function generateSuratJalanPdf(tanggal, bibit, keluar, sumber, tujuan, kodeVerifikasi, nomorSurat, dibuatOleh, driver, approvedBy, jabatanApprover) {
  dibuatOleh = dibuatOleh || "-";
  driver = driver || "-";
  approvedBy = approvedBy || "";
  jabatanApprover = jabatanApprover || "";
  var folder = getOrCreateFolder(FOLDER_SURAT_JALAN);

  var tanggalFormatted = formatTanggalWITA(tanggal);

  // Build HTML untuk PDF
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8">'
    + '<style>'
    + 'body { font-family: Arial, sans-serif; margin: 40px 50px; color: #1a1a1a; font-size: 12px; }'
    + '.header { text-align: center; border-bottom: 3px solid #10b981; padding-bottom: 12px; margin-bottom: 20px; }'
    + '.header h1 { margin: 0; font-size: 18px; color: #1a1a1a; }'
    + '.header p { margin: 2px 0; font-size: 11px; color: #666; }'
    + '.title { text-align: center; margin: 24px 0 8px; }'
    + '.title h2 { margin: 0; font-size: 16px; letter-spacing: 1px; }'
    + '.title p { margin: 4px 0 0; font-size: 11px; color: #666; }'
    + '.info { margin: 20px 0; }'
    + '.info-row { display: flex; margin: 4px 0; font-size: 12px; }'
    + '.info-label { width: 140px; font-weight: bold; }'
    + 'table { width: 100%; border-collapse: collapse; margin: 16px 0; }'
    + 'th { background: #10b981; color: white; padding: 8px 10px; text-align: left; font-size: 11px; }'
    + 'td { padding: 8px 10px; border: 1px solid #ddd; font-size: 11px; }'
    + '.note { font-style: italic; font-size: 10px; color: #666; margin: 16px 0; }'
    + '.sig-container { display: flex; justify-content: space-between; margin-top: 40px; }'
    + '.sig-box { text-align: center; width: 30%; }'
    + '.sig-box .label { font-size: 11px; font-weight: bold; margin-bottom: 8px; }'
    + '.sig-box .line { border-bottom: 1px solid #333; margin: 30px 10px 4px; height: 0; }'
    + '.sig-box .name { font-size: 11px; font-weight: bold; margin-top: 2px; }'
    + '.sig-box .jabatan { font-size: 10px; color: #444; margin-top: 2px; }'
    + '.sig-box .role { font-size: 9px; color: #888; }'
    + '.footer { border-top: 1px solid #ddd; margin-top: 30px; padding-top: 12px; font-size: 9px; color: #999; }'
    + '.verify-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px 14px; border-radius: 6px; margin: 12px 0; font-size: 10px; }'
    + '.verify-code { font-family: monospace; font-size: 12px; font-weight: bold; color: #166534; }'
    + '.qr-container { text-align: right; margin-top: 10px; }'
    + '</style></head><body>';

  html += '<div class="header">';
  html += '<h1>PT ENERGI BATUBARA LESTARI</h1>';
  html += '<p>Unit Nursery &mdash; Kalimantan Selatan</p>';
  html += '</div>';

  html += '<div class="title">';
  html += '<h2>SURAT JALAN DISTRIBUSI BIBIT</h2>';
  html += '<p>No: ' + nomorSurat + '</p>';
  html += '</div>';

  // Tambahkan QR code (Google Chart API, encode link verifikasi atau kode)
  var qrValue = 'https://smartnursery.montana.id/verify?kode=' + encodeURIComponent(kodeVerifikasi);
  var qrUrl = 'https://chart.googleapis.com/chart?chs=120x120&cht=qr&chl=' + encodeURIComponent(qrValue) + '&chld=L|1';
  html += '<div class="qr-container"><img src="' + qrUrl + '" width="90" height="90" alt="QR Code" /><br><span style="font-size:9px;color:#888">Verifikasi</span></div>';

  html += '<div class="info">';
  html += '<div class="info-row"><span class="info-label">Tanggal</span>: ' + tanggalFormatted + '</div>';
  html += '<div class="info-row"><span class="info-label">Jenis Bibit</span>: ' + bibit + '</div>';
  html += '<div class="info-row"><span class="info-label">Jumlah</span>: ' + keluar.toLocaleString('id-ID') + ' polybag</div>';
  html += '<div class="info-row"><span class="info-label">Asal / Sumber</span>: ' + sumber + '</div>';
  html += '<div class="info-row"><span class="info-label">Tujuan / Lokasi</span>: ' + tujuan + '</div>';
  html += '</div>';

  html += '<table>';
  html += '<tr><th>No</th><th>Jenis Bibit</th><th>Jumlah</th><th>Satuan</th><th>Keterangan</th></tr>';
  html += '<tr><td>1</td><td>' + bibit + '</td><td>' + keluar.toLocaleString('id-ID') + '</td><td>polybag</td><td>Distribusi ke ' + tujuan + '</td></tr>';
  html += '</table>';

  html += '<p class="note">Catatan: Pastikan bibit dalam kondisi baik saat penyerahan. Surat jalan ini sebagai bukti distribusi resmi.</p>';

  html += '<div class="sig-container">';
  html += '<div class="sig-box"><div class="label">Dibuat oleh</div><div class="line"></div><div class="name">' + dibuatOleh + '</div><div class="role">Petugas Nursery</div></div>';
  html += '<div class="sig-box"><div class="label">Disetujui</div><div class="line"></div>';
  if (approvedBy) {
    html += '<div class="name">' + approvedBy + '</div>';
    if (jabatanApprover) html += '<div class="jabatan">' + jabatanApprover + '</div>';
  } else {
    html += '<div class="name"></div>';
  }
  html += '<div class="role">Dept Head Revegetasi & Rehabilitasi</div></div>';
  html += '<div class="sig-box"><div class="label">Driver</div><div class="line"></div><div class="name">' + driver + '</div><div class="role">Sopir / Kurir</div></div>';
  html += '</div>';

  html += '<div class="verify-box">';
  html += '🔒 Kode Verifikasi: <span class="verify-code">' + kodeVerifikasi + '</span><br>';
  html += 'Scan QR code atau masukkan kode di aplikasi Smart Nursery untuk memverifikasi keaslian dokumen ini.';
  html += '</div>';

  html += '<div class="footer">';
  html += 'Dicetak otomatis oleh Montana AI Engine &bull; PT Energi Batubara Lestari &mdash; Unit Nursery<br>';
  html += 'Dokumen ini sah tanpa tanda tangan basah apabila terverifikasi melalui sistem.';
  html += '</div>';

  html += '</body></html>';

  // Convert HTML to PDF
  var blob = Utilities.newBlob(html, 'text/html', 'surat.html');
  var pdfBlob = blob.getAs('application/pdf');

  var fileName = 'Surat Jalan ' + tanggal + ' - ' + bibit + '.pdf';
  pdfBlob.setName(fileName);

  var file = folder.createFile(pdfBlob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return file.getUrl();
}

function normalizeHeaderText(s) {
  return (s || "").toString().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function buildHeaderMap(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const norm = headers.map(normalizeHeaderText);
  const findAny = (names) => {
    for (const n of names) {
      const idx = norm.indexOf(normalizeHeaderText(n));
      if (idx !== -1) return idx;
    }
    return -1;
  };
  return {
    tanggal: findAny(["tanggal", "tgl", "date"]),
    bulan: findAny(["bulan", "month"]),
    bibit: findAny(["bibit", "jenis bibit", "jenis_bibit"]),
    masuk: findAny(["masuk", "in"]),
    keluar: findAny(["keluar", "out"]),
    mati: findAny(["mati"]),
    total: findAny(["total", "stok", "jumlahakhir"]),
    sumber: findAny(["sumber"]),
    tujuan: findAny(["tujuan", "lokasi", "tujuan bibit"]),
    nomorsurat: findAny(["nomor surat", "nomor_surat", "nomorsurat", "no surat", "nosurat"]),
    statusapproval: findAny(["status approval", "status_approval", "statusapproval"]),
    approvedby: findAny(["approved by", "approved_by", "approvedby"]),
    approvedat: findAny(["approved at", "approved_at", "approvedat"]),
    statuskirim: findAny(["status kirim", "status_kirim", "status"]),
    kodeverifikasi: findAny(["kode verifikasi", "kode_verifikasi", "kodeverifikasi"]),
    linkpdf: findAny(["link pdf", "link_pdf", "linkpdf"]),
    dibuatoleh: findAny(["dibuat oleh", "dibuat_oleh", "dibuatoleh"]),
    driver: findAny(["driver", "sopir"])
  };
}

function safeGet(vals, idx, fallback) {
  if (fallback === undefined) fallback = "";
  return idx >= 0 ? vals[idx] : fallback;
}

function safeNum(vals, idx, fallback) {
  if (fallback === undefined) fallback = 0;
  var v = idx >= 0 ? Number(vals[idx]) : NaN;
  return Number.isFinite(v) ? v : fallback;
}

function formatTanggalWITA(val) {
  if (!val) return "-";
  var d = val instanceof Date ? val : new Date(val);
  if (isNaN(d)) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Makassar"
  });
}

function getWitaNow() {
  var now = new Date();
  var date = now.toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Makassar"
  });
  var time = now.toLocaleTimeString("id-ID", {
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Makassar"
  }).replace(":", ".");
  return date + " pukul " + time + " WITA";
}

// === Trigger utama ===
//
// !!! PENTING !!!
// Anda harus mengatur trigger secara manual agar 'scanAndSendPendingRows' berjalan otomatis.
// 1. Di editor skrip, klik ikon "Trigger" (jam alarm) di sebelah kiri.
// 2. Klik "Tambahkan Trigger" (kanan bawah).
// 3. Pilih fungsi untuk dijalankan: scanAndSendPendingRows
// 4. Pilih sumber event: Berdasarkan waktu
// 5. Pilih jenis timer: Timer menit
// 6. Pilih interval: Setiap 5 menit (atau 10 menit)
// 7. Klik "Simpan".

// === Scan dan kirim data baru ===
function scanAndSendPendingRows() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return;

  var headerMap = buildHeaderMap(sheet);
  var allData = sheet.getDataRange().getValues();
  var statusCol = headerMap.statuskirim >= 0 ? headerMap.statuskirim + 1 : sheet.getLastColumn() + 1;

  if (headerMap.statuskirim === -1) {
    headerMap.statuskirim = statusCol - 1;
    if (sheet.getLastColumn() < statusCol) {
      sheet.getRange(1, statusCol).setValue("Status Kirim");
    }
  }

  for (var i = 1; i < allData.length; i++) {
    var row = allData[i];
    if (!row || row.length === 0) continue;

    var masukVal = safeNum(row, headerMap.masuk, 0);
    var keluarVal = safeNum(row, headerMap.keluar, 0);
    var status = (safeGet(row, headerMap.statuskirim, "") || "").toString().toLowerCase();

    if (status.includes("terkirim") || status.includes("processing") || (masukVal <= 0 && keluarVal <= 0)) {
      continue;
    }

    sheet.getRange(i + 1, statusCol).setValue("PROCESSING...");
    SpreadsheetApp.flush();
    Utilities.sleep(200);

    kirimPesanFonnte(sheet, i + 1, headerMap, allData, allData[i]);
  }
}

// === Kirim Pesan ===
function kirimPesanFonnte(sheet, row, headerMap, allData, vals) {
  // Ensure status column exists - use 1-based indexing for sheet
  var statusCol = 1;
  if (typeof headerMap.statuskirim === 'number' && headerMap.statuskirim >= 0) {
    statusCol = headerMap.statuskirim + 1;
  } else {
    // Jika kolom statuskirim belum ada, tambahkan kolom baru
    statusCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, statusCol).setValue("Status Kirim");
    headerMap.statuskirim = statusCol - 1;
  }
    var tanggal = (safeGet(vals, headerMap.tanggal, "") || "").toString();
    if (tanggal instanceof Date && !isNaN(tanggal)) {
      tanggal = Utilities.formatDate(tanggal, "Asia/Makassar", "yyyy-MM-dd");
    }
    var bibit = (safeGet(vals, headerMap.bibit, "-") || "-").toString();
    var masuk = safeNum(vals, headerMap.masuk, 0);
    var keluar = safeNum(vals, headerMap.keluar, 0);
    var sumber = (safeGet(vals, headerMap.sumber, "-") || "-").toString();
    var tujuan = (safeGet(vals, headerMap.tujuan, "-") || "-").toString();
    var dibuatOleh = (safeGet(vals, headerMap.dibuatoleh, "-") || "-").toString();
    var driverName = (safeGet(vals, headerMap.driver, "-") || "-").toString();
    var header = headerMap;

    // === AGREGAT KINERJA NURSERY (TOTAL) ===
    var totalMasukAgregat = 0;
    var totalKeluarAgregat = 0;
    var totalMatiAgregat = 0;

    for (var i = 1; i < allData.length; i++) {
      var r = allData[i];
      totalMasukAgregat += safeNum(r, header.masuk, 0);
      totalKeluarAgregat += safeNum(r, header.keluar, 0);
      totalMatiAgregat += safeNum(r, header.mati, 0);
    }

    var totalHidupAgregat = totalMasukAgregat - totalMatiAgregat;
    var sr = (totalMasukAgregat > 0) ? (totalHidupAgregat / totalMasukAgregat) * 100 : 100;
    var rp = (totalMasukAgregat > 0) ? (totalKeluarAgregat / totalMasukAgregat) * 100 : 0;

    // === Rekapan per jenis bibit PER TANGGAL (harian) ===
    var rekapHarian = {};
    // Ambil tanggal baris yang sedang diproses (format sheet)
    var tanggalTarget = safeGet(vals, header.tanggal, "");
    // Normalisasi tanggal ke string (jika Date, ubah ke yyyy-mm-dd)
    if (tanggalTarget instanceof Date && !isNaN(tanggalTarget)) {
      tanggalTarget = Utilities.formatDate(tanggalTarget, "Asia/Makassar", "yyyy-MM-dd");
    } else if (typeof tanggalTarget === "string" && tanggalTarget.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      // Jika format dd/mm/yyyy, ubah ke yyyy-mm-dd
      var parts = tanggalTarget.split("/");
      tanggalTarget = parts[2] + "-" + parts[1].padStart(2, '0') + "-" + parts[0].padStart(2, '0');
    }

    for (var i = 1; i < allData.length; i++) {
      var r = allData[i];
      var jenis = (safeGet(r, header.bibit, "") || "").toString().trim();
      if (!jenis) continue;
      var tgl = safeGet(r, header.tanggal, "");
      // Normalisasi tanggal baris
      if (tgl instanceof Date && !isNaN(tgl)) {
        tgl = Utilities.formatDate(tgl, "Asia/Makassar", "yyyy-MM-dd");
      } else if (typeof tgl === "string" && tgl.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        var p = tgl.split("/");
        tgl = p[2] + "-" + p[1].padStart(2, '0') + "-" + p[0].padStart(2, '0');
      }
      if (tgl !== tanggalTarget) continue;
      if (!rekapHarian[jenis]) {
        rekapHarian[jenis] = { masuk: 0, mati: 0, keluar: 0 };
      }
      rekapHarian[jenis].masuk += safeNum(r, header.masuk, 0);
      rekapHarian[jenis].mati += safeNum(r, header.mati, 0);
      rekapHarian[jenis].keluar += safeNum(r, header.keluar, 0);
    }

    var rekapSemua = {};
    for (var i = 1; i < allData.length; i++) {
      var r = allData[i];
      var jenis = (safeGet(r, header.bibit, "") || "").toString().trim();
      if (!jenis) continue;
      if (!rekapSemua[jenis]) {
        rekapSemua[jenis] = { masuk: 0, keluar: 0, mati: 0 };
      }
      rekapSemua[jenis].masuk += safeNum(r, header.masuk, 0);
      rekapSemua[jenis].keluar += safeNum(r, header.keluar, 0);
      rekapSemua[jenis].mati += safeNum(r, header.mati, 0);
    }
    var teksRekap = "Rekapitulasi Jumlah Bibit:\n";
    Object.keys(rekapSemua).sort().forEach(function (jenis) {
      var d = rekapSemua[jenis];
      var stok = Math.max(0, d.masuk - d.keluar - d.mati);
      var statusStok = "";
      if (stok <= 0) {
        statusStok = "🚨 Habis";
      } else if (stok < 1000) {
        statusStok = "⚠ Menipis";
      } else {
        statusStok = "✅ Aman";
      }
      teksRekap += "* " + jenis.toUpperCase() + ": " + stok.toLocaleString('id-ID') + " (" + statusStok + ")\n";
    });

    // --- Analisis TIM LAPANGAN (SEMUA JENIS BIBIT) ---
    // Kumpulkan semua data yang tujuannya mengandung "TIM"
    var dataTimAll = [];
    for (var i = 1; i < allData.length; i++) {
      var r = allData[i];
      if (header.tujuan >= 0 && safeGet(r, header.tujuan).toString().toUpperCase().includes("TIM")) {
        dataTimAll.push(r);
      }
    }

    // Deteksi nama tim secara dinamis
    var timNames = {};
    dataTimAll.forEach(function (r) {
      var tuj = safeGet(r, header.tujuan).toString().toUpperCase();
      // Ekstrak nama tim: "TIM BASRI" -> "BASRI", "TIM BAHRAN" -> "BAHRAN"
      var match = tuj.match(/TIM\s+(\w+)/);
      if (match) {
        var nama = match[1];
        if (!timNames[nama]) timNames[nama] = [];
        timNames[nama].push(r);
      }
    });

    // Bangun detail per tim
    var teksTim = "";
    var timKeys = Object.keys(timNames).sort();
    var timTotals = {};

    timKeys.forEach(function (nama) {
      var rows = timNames[nama];
      var totalKeluar = 0;
      var detailBibit = {};

      rows.forEach(function (r) {
        var kel = safeNum(r, header.keluar, 0);
        totalKeluar += kel;
        var jenisBibit = (safeGet(r, header.bibit, "") || "").toString().trim().toUpperCase();
        if (jenisBibit && kel > 0) {
          detailBibit[jenisBibit] = (detailBibit[jenisBibit] || 0) + kel;
        }
      });

      timTotals[nama] = totalKeluar;

      if (totalKeluar > 0) {
        var avg = (totalKeluar / (rows.length || 1)).toFixed(0);
        teksTim += "👷‍♂ Tim " + nama.charAt(0) + nama.slice(1).toLowerCase() + ":\n";
        teksTim += "Total Realisasi : " + totalKeluar.toLocaleString('id-ID') + " bibit\n";
        teksTim += "Rata-rata : " + avg + " bibit/hari\n";
        teksTim += "__KONTRIBUSI_" + nama + "__\n";

        // Detail per jenis bibit
        var bibitKeys = Object.keys(detailBibit).sort();
        if (bibitKeys.length > 0) {
          teksTim += "Detail Bibit:\n";
          bibitKeys.forEach(function (b) {
            teksTim += "  • " + b + ": " + detailBibit[b].toLocaleString('id-ID') + " bibit\n";
          });
        }
        teksTim += "\n";
      }
    });

    // Hitung kontribusi dan selisih hanya jika ada > 1 tim
    var totalGabungan = 0;
    timKeys.forEach(function (k) { totalGabungan += (timTotals[k] || 0); });

    // Replace placeholder kontribusi dengan nilai sebenarnya
    timKeys.forEach(function (nama) {
      var placeholder = "__KONTRIBUSI_" + nama + "__\n";
      if (totalGabungan > 0 && (timTotals[nama] || 0) > 0) {
        var kontri = ((timTotals[nama] / totalGabungan) * 100).toFixed(1);
        teksTim = teksTim.replace(placeholder, "Kontribusi : " + kontri + "%\n");
      } else {
        teksTim = teksTim.replace(placeholder, "");
      }
    });

    // Hitung selisih antar tim (jika ada 2+ tim aktif)
    var activeTimKeys = timKeys.filter(function (k) { return (timTotals[k] || 0) > 0; });
    var diffPercent = "0.0";
    var kondisiSistem = "✅ Stabil & Sinkron";
    if (activeTimKeys.length >= 2) {
      var maxTim = 0, minTim = Infinity;
      activeTimKeys.forEach(function (k) {
        if (timTotals[k] > maxTim) maxTim = timTotals[k];
        if (timTotals[k] < minTim) minTim = timTotals[k];
      });
      diffPercent = totalGabungan > 0 ? ((Math.abs(maxTim - minTim) / totalGabungan) * 100).toFixed(1) : "0.0";
      if (diffPercent > 30) kondisiSistem = "⚠ Ketimpangan Terdeteksi";
    }

    // === STOK AKHIR KHUSUS SENGON POTTING ===
    var allDataPotting = [];
    for (var i = 1; i < allData.length; i++) {
      var r = allData[i];
      if (header.bibit >= 0 && safeGet(r, header.bibit).toString().toUpperCase().includes("SENGON POTTING")) {
        allDataPotting.push(r);
      }
    }

    var pottingMasuk = 0;
    var pottingKeluar = 0;
    var pottingMati = 0;

    allDataPotting.forEach(function (r) {
      pottingMasuk += safeNum(r, header.masuk, 0);
      pottingKeluar += safeNum(r, header.keluar, 0);
      pottingMati += safeNum(r, header.mati, 0);
    });

    var totalStokPotting = Math.max(0, pottingMasuk - pottingKeluar - pottingMati);

    var today = new Date();
    today.setHours(23, 59, 59, 999);
    var sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    var pottingData7Hari = allDataPotting.filter(function (r) {
      var d = new Date(safeGet(r, header.tanggal));
      return !isNaN(d) && d >= sevenDaysAgo && d <= today;
    });
    var totalKeluarPotting7Hari = pottingData7Hari.reduce(function (a, b) {
      return a + safeNum(b, header.keluar);
    }, 0);

    var avgDaily = (totalKeluarPotting7Hari / 7);

    if (avgDaily <= 0 && allDataPotting.length > 0) {
      var firstDate = new Date(safeGet(allDataPotting[0], header.tanggal));
      var totalDays = Math.max(1, Math.round((today - firstDate) / (1000 * 60 * 60 * 24)));
      avgDaily = pottingKeluar / totalDays;
    }
    if (avgDaily <= 0) avgDaily = 400;

    avgDaily = Number(avgDaily.toFixed(0));

    var daysLeft = (avgDaily > 0 && totalStokPotting > 0) ? Math.ceil(totalStokPotting / avgDaily) : 0;
    var predDate = daysLeft > 0
      ? new Date(Date.now() + daysLeft * 86400000).toLocaleDateString("id-ID", {
        day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Makassar"
      })
      : "-";

    // --- Kesimpulan ---
    var kesimpulan = "";
    if (sr >= 97 && rp >= 90 && diffPercent <= 15) {
      kesimpulan = "Distribusi lapangan berjalan efisien dan seimbang antar-tim. Tingkat hidup bibit sangat baik serta penyerapan tanam optimal. Tidak ditemukan anomali stok maupun mortalitas abnormal.";
    } else if (sr >= 90 && rp >= 80 && diffPercent <= 30) {
      kesimpulan = "Aktivitas lapangan terpantau stabil dan terkendali. Tingkat hidup bibit baik dan laju penyerapan tanam konsisten. Diperlukan pemantauan ringan terhadap area dengan mortalitas di atas normal.";
    } else if (sr < 90 || rp < 70) {
      kesimpulan = "AI mendeteksi potensi penurunan kinerja nursery. Tingkat hidup bibit menurun dan realisasi penyerapan bibit belum optimal. Disarankan evaluasi sistem penyiraman, perawatan media tanam, serta efektivitas distribusi antar-tim.";
    } else if (parseFloat(diffPercent) > 30) {
      kesimpulan = "Terdapat ketimpangan signifikan antara tim lapangan. AI merekomendasikan rotasi area kerja atau redistribusi tenaga kerja untuk menjaga keseimbangan operasional.";
    } else if (daysLeft <= 7 && daysLeft > 0) {
      kesimpulan = "Distribusi lapangan berjalan normal, namun stok bibit SENGON POTTING tersisa untuk kurang dari seminggu. AI menyarankan pembibitan ulang dan penyesuaian jadwal distribusi agar pasokan tidak terputus.";
    } else {
      kesimpulan = "Distribusi lapangan berjalan efisien tanpa anomali stok.";
    }

    // --- Pesan akhir ---
    var pesan =
      "RINGKASAN DISTRIBUSI LAPANGAN – MONTANA AI ENGINE\n" +
      "Unit Nursery PT Energi Batubara Lestari (EBL)\n\n" +
      "📅 Tanggal: " + tanggal + ", " + getWitaNow() + "\n" +
      "Jenis Bibit : " + bibit + "\n" +
      (masuk > 0 ? "Jumlah Masuk : " + masuk.toLocaleString('id-ID') + " bibit\n" : "") +
      (keluar > 0 ? "Jumlah Keluar : " + keluar.toLocaleString('id-ID') + " bibit\n" : "") +
      "\nSumber : " + sumber + "\n" +
      "Tujuan : " + tujuan + "\n" +
      (dibuatOleh !== "-" ? "Dibuat Oleh : " + dibuatOleh + "\n" : "") +
      (driverName !== "-" ? "Driver : " + driverName + "\n" : "") +
      "\n" +
      teksRekap + "\n" +
      "----------------------------------\n" +
      "📊 Analisis Aktivitas:\n" +
      "AI mendeteksi aktivitas distribusi " + bibit + " sebanyak " + keluar.toLocaleString('id-ID') + " bibit dari " + sumber + " menuju *" + tujuan + "*.\n" +
      "Aktivitas dikategorikan ⚙ Operasional Lapangan Stabil.\n\n";

    // Tambahkan bagian tim hanya jika ada data
    if (teksTim) {
      pesan += "----------------------------------\n" + teksTim;

      if (activeTimKeys.length >= 2) {
        pesan += "----------------------------------\n" +
          "📈 Analisis Komparatif:\n" +
          "Selisih distribusi antar-tim: " + diffPercent + "%\n" +
          "Kondisi sistem: " + kondisiSistem + "\n\n";
      }
    }

    pesan +=
      "----------------------------------\n" +
      "📦 Stok Akhir (SENGON POTTING):\n" +
      "Sisa SENGON POTTING: " + totalStokPotting.toLocaleString('id-ID') + " bibit\n" +
      "Rata-rata keluar: " + avgDaily.toLocaleString('id-ID') + " bibit/hari\n" +
      "Estimasi habis: ±" + daysLeft + " hari lagi (" + predDate + ")\n\n" +
      "----------------------------------\n" +
      "🌱 Kinerja Nursery (Agregat):\n" +
      "Bibit Masuk : " + totalMasukAgregat.toLocaleString('id-ID') + " bibit\n" +
      "Bibit Hidup : " + totalHidupAgregat.toLocaleString('id-ID') + " bibit\n" +
      "Bibit Mati : " + totalMatiAgregat.toLocaleString('id-ID') + " bibit\n" +
      "Persentase Hidup : " + sr.toFixed(1) + "%\n" +
      "Realisasi Penyerapan : " + rp.toFixed(1) + "% dari total bibit masuk\n" +
      "Status Efisiensi : " + (sr >= 97 && rp >= 90 ? "✅ Sangat Baik" : (sr >= 90 && rp >= 80 ? "⚙ Stabil" : "⚠ Perlu Evaluasi")) + "\n\n" +
      "----------------------------------\n" +
      "🧠 Kesimpulan:\n" +
      kesimpulan + "\n\n" +
      "> Dikirim otomatis via Fonnte\n" +
      "> Montana AI Engine 🌱\n" +
      "> Sent via fonnte.com";

    // Tambahkan link PDF jika tersedia
    var linkPdf = safeGet(vals, headerMap.linkpdf, "").toString().trim();
    if (linkPdf) {
      pesan += "\n\n📄 *Surat Jalan (PDF):*\n" + linkPdf;
    }

    // --- Kirim WhatsApp ---
    var targets = NOMOR_ADMIN.split(",");
    var allOk = true;

    for (var t = 0; t < targets.length; t++) {
      var payload = {
        target: targets[t].trim(),
        message: pesan
      };
      var options = {
        method: "post",
        headers: { Authorization: TOKEN_FONNTE },
        payload: payload,
        muteHttpExceptions: true
      };
      var res = UrlFetchApp.fetch("https://api.fonnte.com/send", options);
       // Endpoint Google Apps Script terbaru yang aktif:
       var endpoint = "https://script.google.com/macros/s/AKfycbyPV84uIj-AIIExmW8DJSz4m5oW1Md7DBFwfGniim-CCCZdFOo3chx4ZXacVJz2iKD1/exec";
      var resCode = res.getResponseCode();
      var resBody = res.getContentText();
      Logger.log("Fonnte response [" + targets[t].trim() + "]: " + resCode + " - " + resBody);
      if (resCode !== 200) allOk = false;
    }

    var statusText = (allOk ? "✅ Terkirim " : "❌ Gagal ") + getWitaNow();
    sheet.getRange(row, statusCol).setValue(statusText);

  // Blok catch dihapus karena tidak ada pasangan try
}
