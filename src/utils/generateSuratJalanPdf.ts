import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export interface SuratJalanPdfData {
  nomorSurat: string;
  tanggal: string;
  bibit: string;
  jumlah: number;
  sumber: string;
  tujuan: string;
  stokSetelah: number;
  dibuatOleh: string;
  driver: string;
  kodeVerifikasi: string;
  logoDataUrl?: string;
  approval?: {
    approvedBy: string;
    approvedAt: string;
  };
  isDraft?: boolean;
  companyName?: string;
  companyUnit?: string;
  companyAddress?: string;
}

export async function generateSuratJalanPdf(data: SuratJalanPdfData): Promise<Blob> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentW = pageW - margin * 2;
  let y = 16;

  // Logo
  if (data.logoDataUrl) {
    doc.addImage(data.logoDataUrl, 'PNG', margin, y, 14, 14);
  }
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(data.companyName || 'PT Energi Batubara Lestari', margin + 18, y + 5);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${data.companyUnit || 'Unit Nursery'} — ${data.companyAddress || 'Kalimantan Selatan'}`,
    margin + 18,
    y + 11
  );
  y += 20;

  // Line separator
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SURAT JALAN DISTRIBUSI BIBIT', pageW / 2, y, { align: 'center' });
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`No: ${data.nomorSurat}`, pageW / 2, y, { align: 'center' });
  y += 12;

  // Info section
  const infoLeft = margin;
  const infoValX = margin + 40;
  doc.setFontSize(10);
  const infoRows = [
    ['Tanggal', data.tanggal],
    ['Jenis Bibit', data.bibit],
    ['Jumlah', `${data.jumlah.toLocaleString('id-ID')} polybag`],
    ['Asal / Sumber', data.sumber || '-'],
    ['Tujuan / Lokasi', data.tujuan || '-'],
  ];
  for (const [label, value] of infoRows) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}`, infoLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${value}`, infoValX, y);
    y += 6;
  }
  y += 6;

  // Table
  const colWidths = [12, contentW * 0.35, contentW * 0.2, contentW * 0.18, contentW * 0.27 - 12];
  const colX = [margin];
  for (let i = 1; i < colWidths.length; i++) {
    colX.push(colX[i - 1] + colWidths[i - 1]);
  }
  const rowH = 8;
  doc.setFillColor(16, 185, 129);
  doc.setTextColor(255, 255, 255);
  doc.rect(margin, y, contentW, rowH, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  const headers = ['No', 'Jenis Bibit', 'Jumlah', 'Satuan', 'Keterangan'];
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], colX[i] + 2, y + 5.5);
  }
  y += rowH;

  // Table row
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin, y, contentW, rowH);
  const tableData = [
    '1',
    data.bibit,
    data.jumlah.toLocaleString('id-ID'),
    'polybag',
    `Stok sisa: ${data.stokSetelah.toLocaleString('id-ID')}`,
  ];
  for (let i = 0; i < tableData.length; i++) {
    doc.text(tableData[i], colX[i] + 2, y + 5.5);
  }
  y += rowH;

  // Bottom line of table
  doc.line(margin, y, margin + contentW, y);
  y += 12;

  // Catatan
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'Catatan: Pastikan bibit dalam kondisi baik saat penyerahan. Surat jalan ini sebagai bukti distribusi resmi.',
    margin,
    y,
    { maxWidth: contentW }
  );
  y += 14;

  // Signature section
  const sigW = contentW / 3;
  const sigLabels = ['Dibuat oleh', 'PJ Nursery', 'Driver'];
  const sigNames = [data.dibuatOleh || '-', '', data.driver || '-'];
  const sigRoles = ['Petugas Nursery', 'DeptHead', 'Sopir / Kurir'];
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  for (let i = 0; i < 3; i++) {
    const cx = margin + sigW * i + sigW / 2;
    doc.text(sigLabels[i], cx, y, { align: 'center' });
  }
  y += 24;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  for (let i = 0; i < 3; i++) {
    const cx = margin + sigW * i + sigW / 2;
    doc.line(cx - 18, y, cx + 18, y);
    if (i === 0 || i === 2) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129);
      doc.text('✓', cx + 15, y - 2, { align: 'center' });
      doc.setTextColor(0, 0, 0);
    }
    if (sigNames[i] && sigNames[i] !== '-') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(sigNames[i], cx, y + 4, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text(sigRoles[i], cx, y + 8, { align: 'center' });
    } else {
      doc.text(sigRoles[i], cx, y + 5, { align: 'center' });
    }
  }
  y += 16;

  // QR code and footer
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 6;
  const qrContent = `VERIFY:${data.kodeVerifikasi}`;
  const qrDataUrl = await QRCode.toDataURL(qrContent, {
    width: 140,
    margin: 1,
    color: { dark: '#1a1a1a', light: '#ffffff' },
  });
  doc.addImage(qrDataUrl, 'PNG', margin, y, 28, 28);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('Scan QR Code untuk verifikasi', margin + 32, y + 6);
  doc.text('keaslian dokumen via aplikasi Smart Nursery.', margin + 32, y + 11);
  if (data.kodeVerifikasi && data.kodeVerifikasi !== 'PREVIEW') {
    doc.setFontSize(7);
    doc.setFont('courier', 'normal');
    doc.text('Kode: ' + data.kodeVerifikasi, margin + 32, y + 16);
  }
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.text(`Dicetak otomatis oleh Montana AI Engine`, margin + 32, y + 21);
  doc.text(
    `${data.companyName || 'PT Energi Batubara Lestari'} — ${data.companyUnit || 'Unit Nursery'}`,
    margin + 32,
    y + 26
  );

  // Watermark DRAFT
  if (data.isDraft) {
    doc.saveGraphicsState();
    const gState = (doc as any).GState({ opacity: 0.08 });
    doc.setGState(gState);
    doc.setFontSize(120);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    const centerX = pageW / 2;
    const centerY = doc.internal.pageSize.getHeight() / 2;
    doc.text('DRAFT', centerX, centerY, {
      align: 'center',
      angle: 45,
    });
    doc.restoreGraphicsState();
  }

  // Approval signature
  if (data.approval) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text('✓ DISAHKAN', pageW - margin, y - 8, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(`Disetujui oleh: ${data.approval.approvedBy}`, pageW - margin, y - 2, { align: 'right' });
    doc.text(
      `Tanggal: ${new Date(data.approval.approvedAt).toLocaleDateString('id-ID')}`,
      pageW - margin,
      y + 3,
      { align: 'right' }
    );
  }

  return doc.output('blob');
}
