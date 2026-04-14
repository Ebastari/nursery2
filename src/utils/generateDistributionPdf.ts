import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export interface DistributionPdfData {
  nomorSurat: string;
  tanggal: string;
  jenisBibit: string;
  jumlah: number;
  satuan: string;
  sisaStok: number;
  dibuatOleh: string;
  dibuatOlehJabatan: string;
  disetujuiOleh: string;
  disetujuiOlehJabatan: string;
  driver: string;
  driverJabatan: string;
  qrValue: string;
  perusahaan?: string;
  unit?: string;
}

const GREEN = [5, 150, 105];
const LIGHT_BLUE = [239, 246, 255];
const BLUE_BORDER = [191, 219, 254];

export async function generateDistributionPdf(data: DistributionPdfData): Promise<Blob> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = margin;

  doc.setFont('helvetica', 'normal');

  y += 8;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
  doc.text('SURAT JALAN DISTRIBUSI BIBIT', pageW / 2, y, { align: 'center' });
  y += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(`No: ${data.nomorSurat}`, pageW / 2, y, { align: 'center' });
  y += 4;
  doc.text(`Tanggal: ${data.tanggal}`, pageW / 2, y, { align: 'center' });
  y += 10;

  doc.setDrawColor(GREEN[0], GREEN[1], GREEN[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);

  const infoLeft = margin;
  const infoValX = margin + 35;
  const infoData = [
    ['Jenis Bibit', data.jenisBibit],
    ['Jumlah', `${data.jumlah.toLocaleString('id-ID')} ${data.satuan}`],
  ];

  for (const [label, value] of infoData) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, infoLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, infoValX, y);
    y += 5;
  }
  y += 5;

  const tableX = margin;
  const tableW = contentW;
  const headerH = 10;
  const rowH = 12;

  const colWidths = [12, tableW * 0.4, tableW * 0.25, tableW * 0.35 - 12];
  const colX = [tableX];
  for (let i = 1; i < colWidths.length; i++) {
    colX.push(colX[i - 1] + colWidths[i - 1]);
  }

  doc.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
  doc.roundedRect(tableX, y, tableW, headerH, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  const headers = ['No', 'Jenis Bibit', 'Jumlah', 'Satuan'];
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], colX[i] + 2, y + 6.5);
  }
  y += headerH;

  doc.setFillColor(255, 255, 255);
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'normal');
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.roundedRect(tableX, y, tableW, rowH, 2, 2, 'FD');
  
  const rowData = ['1', data.jenisBibit, data.jumlah.toLocaleString('id-ID'), data.satuan];
  for (let i = 0; i < rowData.length; i++) {
    if (i === 2) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
      doc.text(rowData[i], colX[i] + colWidths[i] - 2, y + 7.5, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
    } else {
      doc.text(rowData[i], colX[i] + 2, y + 7.5);
    }
  }
  y += rowH + 8;

  const boxW = contentW;
  const boxH = 14;
  doc.setFillColor(LIGHT_BLUE[0], LIGHT_BLUE[1], LIGHT_BLUE[2]);
  doc.roundedRect(margin, y, boxW, boxH, 1.5, 1.5, 'F');
  doc.setDrawColor(BLUE_BORDER[0], BLUE_BORDER[1], BLUE_BORDER[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, boxW, boxH, 1.5, 1.5, 'S');
  
  doc.setFontSize(9);
  doc.setTextColor(30, 58, 138);
  doc.setFont('helvetica', 'normal');
  doc.text('Sisa stok', margin + 4, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(data.jenisBibit.toUpperCase(), margin + 28, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('setelah distribusi:', margin + 4, y + 10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text(`${data.sisaStok.toLocaleString('id-ID')} ${data.satuan}`, margin + 48, y + 10);
  doc.setTextColor(40, 40, 40);
  y += boxH + 12;

  const sigW = contentW / 3;
  const sigLabels = [
    { label: 'Dibuat oleh', bold: false },
    { label: 'Disetujui', bold: true },
    { label: 'Driver', bold: false },
  ];
  const sigRoles = [data.dibuatOlehJabatan, data.disetujuiOlehJabatan, data.driverJabatan];
  const sigNames = [data.dibuatOleh, data.disetujuiOleh, data.driver];

  doc.setFontSize(10);
  // Header tanda tangan
  for (let i = 0; i < 3; i++) {
    const cx = margin + sigW * i + sigW / 2;
    doc.setFont('helvetica', sigLabels[i].bold ? 'bold' : 'normal');
    doc.setTextColor(55, 65, 81); // text-gray-700
    doc.text(sigLabels[i].label, cx, y, { align: 'center' });
  }
  y += 8;

  // Garis bawah tanda tangan + centang di semua kolom
  for (let i = 0; i < 3; i++) {
    const cx = margin + sigW * i + sigW / 2;
    doc.setDrawColor(156, 163, 175); // border-gray-400
    doc.setLineWidth(0.5);
    doc.line(cx - 16, y, cx + 16, y);
    // Centang di tengah garis
    doc.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
    doc.circle(cx, y - 3, 3.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('✓', cx, y - 1, { align: 'center' });
  }
  y += 10;

  // Nama dan jabatan
  doc.setFontSize(9);
  for (let i = 0; i < 3; i++) {
    const cx = margin + sigW * i + sigW / 2;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 94, 89); // text-emerald-700
    doc.text(sigNames[i], cx, y + 2, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175); // text-gray-400
    doc.text(sigRoles[i], cx, y + 7, { align: 'center' });
  }
  y += 15;

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  const qrSize = 32;
  const qrDataUrl = await QRCode.toDataURL(data.qrValue, { width: qrSize * 4, margin: 1 });
  doc.addImage(qrDataUrl, 'PNG', margin, y, qrSize, qrSize);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('Scan QR Code untuk verifikasi', margin + qrSize + 6, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text('Verifikasi keaslian dokumen ini melalui', margin + qrSize + 6, y + 12);
  doc.text('fitur Scanner di aplikasi Smart Nursery.', margin + qrSize + 6, y + 17);
  // Tambahkan kode verifikasi di bawah QR jika ada
  if (data.qrValue && data.qrValue !== 'PREVIEW') {
    doc.setFontSize(7);
    doc.setFont('courier', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text('Kode: ' + data.qrValue.replace('VERIFY:', ''), margin + qrSize + 6, y + 23);
  }

  y += qrSize + 30;
  if (y > pageH - 30) y = pageH - 30;

  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text('Dicetak otomatis oleh Montana AI Engine', margin, y);
  if (data.perusahaan) {
    doc.text(`${data.perusahaan}${data.unit ? ` — ${data.unit}` : ''}`, margin, y + 4);
  }

  const finalBoxY = y + 12;
  const finalBoxW = 70;
  const finalBoxH = 10;
  doc.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
  doc.roundedRect(pageW - margin - finalBoxW, finalBoxY, finalBoxW, finalBoxH, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('✓ Dokumen Final', pageW - margin - finalBoxW + finalBoxW/2, finalBoxY + 6.5, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('— Siap Distribusi', pageW - margin - finalBoxW + finalBoxW/2, finalBoxY + finalBoxH + 3, { align: 'center' });

  return doc.output('blob');
}

export function downloadDistributionPdf(data: DistributionPdfData): void {
  generateDistributionPdf(data).then((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Distribusi-${data.nomorSurat.replace(/\//g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}