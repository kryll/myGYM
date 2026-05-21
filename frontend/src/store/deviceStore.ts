import { create } from 'zustand';
import type { DeviceConnection, DeviceType, DeviceStatus } from '@/types';
import { deviceService } from '@/services/api';

interface ConnectedDevice {
  id: string;
  type: DeviceType;
  name: string;
  status: DeviceStatus;
  lastData?: Record<string, unknown>;
}

interface DeviceStore {
  devices: DeviceConnection[];
  connectedDevices: ConnectedDevice[];
  isLoading: boolean;
  isScanning: boolean;
  error: string | null;

  // Actions
  fetchDevices: () => Promise<void>;
  addDevice: (device: DeviceConnection) => void;
  removeDevice: (id: string) => Promise<void>;
  updateDeviceStatus: (id: string, status: DeviceStatus) => void;
  setConnectedDevice: (device: ConnectedDevice) => void;
  removeConnectedDevice: (id: string) => void;
  setScanning: (scanning: boolean) => void;
  updateLastData: (deviceId: string, data: Record<string, unknown>) => void;
  clearError: () => void;
}

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  devices: [],
  connectedDevices: [],
  isLoading: false,
  isScanning: false,
  error: null,

  fetchDevices: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await deviceService.getAll();
      set({ devices: response.data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar dispositivos';
      set({ isLoading: false, error: message });
    }
  },

  addDevice: (device) => {
    const { devices } = get();
    set({ devices: [...devices, device] });
  },

  removeDevice: async (id) => {
    try {
      await deviceService.remove(id);
      const { devices } = get();
      set({ devices: devices.filter((d) => d.id !== id) });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar dispositivo';
      set({ error: message });
    }
  },

  updateDeviceStatus: (id, status) => {
    const { devices } = get();
    set({
      devices: devices.map((d) =>
        d.id === id ? { ...d, status, updatedAt: new Date().toISOString() } : d,
      ),
    });
  },

  setConnectedDevice: (device) => {
    const { connectedDevices } = get();
    const existing = connectedDevices.findIndex((d) => d.id === device.id);
    if (existing >= 0) {
      const updated = [...connectedDevices];
      updated[existing] = device;
      set({ connectedDevices: updated });
    } else {
      set({ connectedDevices: [...connectedDevices, device] });
    }
  },

  removeConnectedDevice: (id) => {
    const { connectedDevices } = get();
    set({ connectedDevices: connectedDevices.filter((d) => d.id !== id) });
  },

  setScanning: (scanning) => {
    set({ isScanning: scanning });
  },

  updateLastData: (deviceId, data) => {
    const { connectedDevices } = get();
    set({
      connectedDevices: connectedDevices.map((d) =>
        d.id === deviceId ? { ...d, lastData: data } : d,
      ),
    });
  },

  clearError: () => set({ error: null }),
}));
