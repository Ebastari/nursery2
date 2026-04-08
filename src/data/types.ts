export interface PlantStock {
  id: string;
  name: string;
  stock: number;
  maxStock: number;
  healthScore: number;
  mortalityRate: number;
  totalMati: number;
  totalMasuk: number;
  lastUpdated: string;
}

export interface ActivityRecord {
  id: string;
  tanggal: string;
  bibit: string;
  masuk: number;
  keluar: number;
  mati: number;
  sumber: string;
  tujuan: string;
}

export type ShipmentStatus = 'draft' | 'dikirim' | 'diterima';

export interface Shipment {
  id: string;
  tanggal: string;
  bibit: string;
  jumlah: number;
  tujuan: string;
  status: ShipmentStatus;
  sopir: string;
  nopol: string;
}

export type DocumentStatus = 'success' | 'failed';

export interface Document {
  id: string;
  shipmentId: string;
  nomor: string;
  tanggal: string;
  status: DocumentStatus;
  pdfUrl: string;
}

export type AlertType = 'low-stock' | 'mortality' | 'document';
export type AlertSeverity = 'low' | 'medium' | 'high';

export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  read: boolean;
}

export interface Notification {
  id: string;
  tanggal: string;
  bibit: string;
  jumlah: number;
  jenis: 'masuk' | 'keluar' | 'mati';
  sumber: string;
  tujuan: string;
  statusKirim: string;
  read: boolean;
}
