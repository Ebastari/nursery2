import { create } from 'zustand';
import type { PlantStock, ActivityRecord, Shipment, Document, Alert, Notification } from '../data/types';
import { api } from '../data/mockData';
import { fetchApiData, clearCache } from '../data/api';
import type { ApiRow } from '../data/api';

function deriveNotifications(rows: ApiRow[]): Notification[] {
  return rows
    .filter((r) => r.masuk > 0 || r.keluar > 0 || r.mati > 0)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
    .slice(0, 50)
    .map((r, i) => {
      const jenis: 'masuk' | 'keluar' | 'mati' = r.keluar > 0 ? 'keluar' : r.masuk > 0 ? 'masuk' : 'mati';
      const jumlah = r.keluar > 0 ? r.keluar : r.masuk > 0 ? r.masuk : r.mati;
      return {
        id: `notif-${i}`,
        tanggal: r.tanggal,
        bibit: r.bibit,
        jumlah,
        jenis,
        sumber: r.sumber,
        tujuan: r.tujuan,
        statusKirim: r.statusKirim || 'Baru',
        read: false,
      };
    });
}

interface AppState {
  // Data
  plants: PlantStock[];
  activities: ActivityRecord[];
  shipments: Shipment[];
  documents: Document[];
  alerts: Alert[];
  notifications: Notification[];

  // Loading states
  loadingPlants: boolean;
  loadingActivities: boolean;
  loadingShipments: boolean;
  loadingDocuments: boolean;
  loadingAlerts: boolean;
  loadingNotifications: boolean;
  submitting: boolean;

  // Actions
  fetchPlants: () => Promise<void>;
  fetchActivities: () => Promise<void>;
  fetchShipments: () => Promise<void>;
  fetchDocuments: () => Promise<void>;
  fetchAlerts: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  refreshAll: () => Promise<void>;
  submitActivity: (record: Omit<ActivityRecord, 'id'>) => Promise<void>;
  generateDocument: (shipmentId: string) => Promise<void>;
  markAlertRead: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  plants: [],
  activities: [],
  shipments: [],
  documents: [],
  alerts: [],
  notifications: [],

  loadingPlants: false,
  loadingActivities: false,
  loadingShipments: false,
  loadingDocuments: false,
  loadingAlerts: false,
  loadingNotifications: false,
  submitting: false,

  fetchPlants: async () => {
    set({ loadingPlants: true });
    const plants = await api.getPlants();
    set({ plants, loadingPlants: false });
  },

  fetchActivities: async () => {
    set({ loadingActivities: true });
    const activities = await api.getActivities();
    set({ activities, loadingActivities: false });
  },

  fetchShipments: async () => {
    set({ loadingShipments: true });
    const shipments = await api.getShipments();
    set({ shipments, loadingShipments: false });
  },

  fetchDocuments: async () => {
    set({ loadingDocuments: true });
    const documents = await api.getDocuments();
    set({ documents, loadingDocuments: false });
  },

  fetchAlerts: async () => {
    set({ loadingAlerts: true });
    const alerts = await api.getAlerts();
    set({ alerts, loadingAlerts: false });
  },

  fetchNotifications: async () => {
    set({ loadingNotifications: true });
    try {
      const rows = await fetchApiData();
      const notifications = deriveNotifications(rows);
      set({ notifications, loadingNotifications: false });
    } catch {
      set({ loadingNotifications: false });
    }
  },

  refreshAll: async () => {
    clearCache();
    const { fetchPlants, fetchActivities, fetchAlerts, fetchNotifications } = get();
    await Promise.all([fetchPlants(), fetchActivities(), fetchAlerts(), fetchNotifications()]);
  },

  submitActivity: async (record) => {
    set({ submitting: true });
    try {
      const newActivity = await api.submitActivity(record);
      clearCache();
      set((state) => ({
        activities: [newActivity, ...state.activities],
        submitting: false,
      }));
      // Refresh data dari server setelah submit
      get().refreshAll();
    } catch (err) {
      set({ submitting: false });
      throw err;
    }
  },

  generateDocument: async (shipmentId) => {
    set({ submitting: true });
    const doc = await api.generateDocument(shipmentId);
    set((state) => ({
      documents: [doc, ...state.documents],
      submitting: false,
    }));
  },

  markAlertRead: (id) => {
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)),
    }));
  },

  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },
}));
