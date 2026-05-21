// ============================================================
// myGYM - Web Bluetooth API Service
// Xiaomi Mi Scale (MIBCS / MIBCS2) BLE Protocol
// ============================================================

import type { XiaomiScaleData, XiaomiScaleMetrics, DeviceType } from '@/types';

// GATT Service & Characteristic UUIDs for Xiaomi Mi Scale
const XIAOMI_SCALE_SERVICE = '0000181b-0000-1000-8000-00805f9b34fb'; // Body Composition Service
const XIAOMI_SCALE_MEASUREMENT = '00002a9c-0000-1000-8000-00805f9b34fb'; // Body Composition Measurement
const WEIGHT_SCALE_SERVICE = '0000181d-0000-1000-8000-00805f9b34fb'; // Weight Scale Service
const WEIGHT_MEASUREMENT = '00002a9d-0000-1000-8000-00805f9b34fb'; // Weight Measurement

// Alternative UUIDs for Mi Scale 2
const MI_SCALE_SERVICE_2 = '0000181b-0000-1000-8000-00805f9b34fb';
const MI_SCALE_CHAR_2 = '00002a9c-0000-1000-8000-00805f9b34fb';

export type BluetoothEventCallback = (event: BluetoothEvent) => void;

export interface BluetoothEvent {
  type: 'scanning' | 'found' | 'connecting' | 'connected' | 'disconnected' | 'data' | 'error';
  device?: BluetoothDeviceInfo;
  data?: XiaomiScaleData | XiaomiScaleMetrics;
  error?: string;
}

export interface BluetoothDeviceInfo {
  id: string;
  name: string;
  deviceType: DeviceType;
  rssi?: number;
}

export interface UserMeasurementParams {
  height: number; // cm
  age: number;
  gender: 'male' | 'female';
}

class BluetoothService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private listeners: Set<BluetoothEventCallback> = new Set();
  private isScanning = false;
  private userParams: UserMeasurementParams | null = null;

  // --------------------------------------------------------
  // Public API
  // --------------------------------------------------------

  isSupported(): boolean {
    return 'bluetooth' in navigator;
  }

  isConnected(): boolean {
    return this.device?.gatt?.connected ?? false;
  }

  getConnectedDevice(): BluetoothDeviceInfo | null {
    if (!this.device) return null;
    return {
      id: this.device.id,
      name: this.device.name || 'Dispositivo desconocido',
      deviceType: 'xiaomi_scale',
    };
  }

  addListener(callback: BluetoothEventCallback): void {
    this.listeners.add(callback);
  }

  removeListener(callback: BluetoothEventCallback): void {
    this.listeners.delete(callback);
  }

  setUserParams(params: UserMeasurementParams): void {
    this.userParams = params;
  }

  // --------------------------------------------------------
  // Scan for Xiaomi Mi Scale
  // --------------------------------------------------------

  async scanForMiScale(): Promise<BluetoothDeviceInfo> {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth no está soportado en este navegador');
    }

    this.isScanning = true;
    this.emit({ type: 'scanning' });

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'MI' },
          { namePrefix: 'MIBCS' },
          { namePrefix: 'MI SCALE' },
          { namePrefix: 'Mi Smart Scale' },
          { namePrefix: 'Mi Body' },
          { services: [XIAOMI_SCALE_SERVICE] },
          { services: [WEIGHT_SCALE_SERVICE] },
        ],
        optionalServices: [
          XIAOMI_SCALE_SERVICE,
          WEIGHT_SCALE_SERVICE,
          MI_SCALE_SERVICE_2,
          'battery_service',
        ],
      });

      this.device = device;

      const deviceInfo: BluetoothDeviceInfo = {
        id: device.id,
        name: device.name || 'Mi Scale',
        deviceType: 'xiaomi_scale',
      };

      this.emit({ type: 'found', device: deviceInfo });

      device.addEventListener('gattserverdisconnected', () => {
        this.handleDisconnect();
      });

      return deviceInfo;
    } catch (error) {
      this.isScanning = false;
      const message = error instanceof Error ? error.message : 'Error al escanear';
      if (message.includes('User cancelled')) {
        throw new Error('Búsqueda cancelada por el usuario');
      }
      throw new Error(`Error de Bluetooth: ${message}`);
    }
  }

  // --------------------------------------------------------
  // Connect to device
  // --------------------------------------------------------

  async connect(deviceInfo?: BluetoothDeviceInfo): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth no está soportado');
    }

    this.emit({ type: 'connecting', device: deviceInfo });

    try {
      if (!this.device) {
        await this.scanForMiScale();
      }

      if (!this.device?.gatt) {
        throw new Error('Dispositivo no disponible');
      }

      this.server = await this.device.gatt.connect();

      // Try body composition service first (Mi Scale 2)
      let service: BluetoothRemoteGATTService | null = null;
      let charUuid = '';

      try {
        service = await this.server.getPrimaryService(XIAOMI_SCALE_SERVICE);
        charUuid = XIAOMI_SCALE_MEASUREMENT;
      } catch {
        try {
          service = await this.server.getPrimaryService(WEIGHT_SCALE_SERVICE);
          charUuid = WEIGHT_MEASUREMENT;
        } catch {
          throw new Error('No se encontró el servicio de báscula en el dispositivo');
        }
      }

      this.characteristic = await service.getCharacteristic(charUuid);

      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', (event) => {
        this.handleMeasurementData(event);
      });

      const connectedDevice: BluetoothDeviceInfo = {
        id: this.device.id,
        name: this.device.name || 'Mi Scale',
        deviceType: 'xiaomi_scale',
      };

      this.emit({ type: 'connected', device: connectedDevice });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error de conexión';
      this.emit({ type: 'error', error: message });
      throw error;
    }
  }

  // --------------------------------------------------------
  // Disconnect
  // --------------------------------------------------------

  async disconnect(): Promise<void> {
    try {
      if (this.characteristic) {
        await this.characteristic.stopNotifications();
        this.characteristic = null;
      }

      if (this.server?.connected) {
        this.server.disconnect();
      }

      this.server = null;
      this.device = null;
    } catch (error) {
      console.warn('Error al desconectar:', error);
    }
  }

  // --------------------------------------------------------
  // Parse Xiaomi Mi Scale Data
  // --------------------------------------------------------

  private handleMeasurementData(event: Event): void {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;

    if (!value) return;

    const data = this.parseMiScaleData(value);
    if (!data) return;

    if (this.userParams && data.impedance) {
      const metrics = this.calculateBodyMetrics(data, this.userParams);
      this.emit({ type: 'data', data: metrics });
    } else {
      this.emit({ type: 'data', data });
    }
  }

  private parseMiScaleData(dataView: DataView): XiaomiScaleData | null {
    try {
      const bytes = new Uint8Array(dataView.buffer);

      // Mi Scale 2 protocol (13 bytes)
      if (bytes.length >= 13) {
        return this.parseMiScale2(bytes);
      }

      // Mi Scale 1 protocol (10 bytes)
      if (bytes.length >= 10) {
        return this.parseMiScale1(bytes);
      }

      return null;
    } catch (error) {
      console.warn('Error al parsear datos de báscula:', error);
      return null;
    }
  }

  // Mi Scale 2 (MIBCS2) - 13 byte protocol
  private parseMiScale2(bytes: Uint8Array): XiaomiScaleData {
    const controlByte1 = bytes[1];
    const controlByte2 = bytes[0];

    // Weight unit flags
    const isLbs = (controlByte1 & 0x01) !== 0;
    const isJin = (controlByte1 & 0x02) !== 0;
    const isStabilized = (controlByte1 & 0x20) !== 0;
    const isWeightRemoved = (controlByte1 & 0x80) !== 0;

    // Weight in raw value (2 bytes, little-endian at offset 11-12)
    const rawWeight = (bytes[12] << 8) | bytes[11];

    let weight: number;
    let unit: 'kg' | 'lb' | 'jin';

    if (isLbs) {
      weight = rawWeight / 100;
      unit = 'lb';
    } else if (isJin) {
      weight = rawWeight / 100;
      unit = 'jin';
    } else {
      weight = rawWeight / 200;
      unit = 'kg';
    }

    // Impedance (bytes 9-10)
    const impedance = (bytes[10] << 8) | bytes[9];

    // Check measurement status from control bytes
    const hasImpedance = (controlByte2 & 0x02) !== 0;

    return {
      weight: Math.round(weight * 100) / 100,
      unit,
      isStabilized,
      isWeightRemoved,
      timestamp: new Date(),
      impedance: hasImpedance && impedance > 0 ? impedance : undefined,
    };
  }

  // Mi Scale 1 - 10 byte protocol
  private parseMiScale1(bytes: Uint8Array): XiaomiScaleData {
    const controlByte = bytes[0];

    const isLbs = (controlByte & 0x01) !== 0;
    const isJin = (controlByte & 0x02) !== 0;
    const isStabilized = (controlByte & 0x20) !== 0;
    const isWeightRemoved = (controlByte & 0x80) !== 0;

    const rawWeight = (bytes[2] << 8) | bytes[1];

    let weight: number;
    let unit: 'kg' | 'lb' | 'jin';

    if (isLbs) {
      weight = rawWeight / 100;
      unit = 'lb';
    } else if (isJin) {
      weight = rawWeight / 100;
      unit = 'jin';
    } else {
      weight = rawWeight / 200;
      unit = 'kg';
    }

    return {
      weight: Math.round(weight * 100) / 100,
      unit,
      isStabilized,
      isWeightRemoved,
      timestamp: new Date(),
    };
  }

  // --------------------------------------------------------
  // Calculate body metrics from impedance + weight
  // Based on Xiaomi's public algorithm (approximation)
  // --------------------------------------------------------

  private calculateBodyMetrics(data: XiaomiScaleData, user: UserMeasurementParams): XiaomiScaleMetrics {
    const { weight, impedance } = data;
    const { height, age, gender } = user;

    if (!impedance) {
      return {
        ...data,
        userHeight: height,
        userAge: age,
        userGender: gender,
      };
    }

    const bmi = this.calculateBMI(weight, height);
    const bodyFat = this.calculateBodyFat(weight, height, age, gender, impedance);
    const muscleMass = this.calculateMuscleMass(weight, bodyFat);
    const boneMass = this.calculateBoneMass(weight, muscleMass);
    const waterPercentage = this.calculateWater(bodyFat);
    const visceralFat = this.calculateVisceralFat(weight, height, age, gender);
    const metabolicAge = this.calculateMetabolicAge(bodyFat, age, gender);

    return {
      ...data,
      bmi: Math.round(bmi * 10) / 10,
      bodyFatPercentage: Math.round(bodyFat * 10) / 10,
      muscleMass: Math.round(muscleMass * 10) / 10,
      boneMass: Math.round(boneMass * 10) / 10,
      waterPercentage: Math.round(waterPercentage * 10) / 10,
      visceralFat: Math.round(visceralFat),
      metabolicAge: Math.round(metabolicAge),
      userHeight: height,
      userAge: age,
      userGender: gender,
    };
  }

  private calculateBMI(weight: number, height: number): number {
    const heightM = height / 100;
    return weight / (heightM * heightM);
  }

  private calculateBodyFat(
    weight: number,
    height: number,
    age: number,
    gender: 'male' | 'female',
    impedance: number,
  ): number {
    const bmi = this.calculateBMI(weight, height);

    // Deurenberg formula adjusted for impedance
    const genderFactor = gender === 'male' ? 1 : 0;
    let bodyFat = (1.2 * bmi) + (0.23 * age) - (10.8 * genderFactor) - 5.4;

    // Impedance correction
    const impedanceFactor = impedance / 500;
    bodyFat = bodyFat * (1 + 0.1 * impedanceFactor);

    return Math.max(3, Math.min(50, bodyFat));
  }

  private calculateMuscleMass(weight: number, bodyFat: number): number {
    const fatMass = (weight * bodyFat) / 100;
    const leanMass = weight - fatMass;
    return leanMass * 0.85; // ~85% of lean mass is muscle
  }

  private calculateBoneMass(weight: number, muscleMass: number): number {
    if (muscleMass > 60) return 3.0;
    if (muscleMass > 50) return 2.8;
    if (muscleMass > 40) return 2.5;
    if (weight > 80) return 2.3;
    if (weight > 60) return 2.0;
    return 1.8;
  }

  private calculateWater(bodyFat: number): number {
    return (100 - bodyFat) * 0.735;
  }

  private calculateVisceralFat(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
    const bmi = this.calculateBMI(weight, height);
    let vf: number;

    if (gender === 'male') {
      vf = (bmi - 18.5) * 0.7 + age * 0.1;
    } else {
      vf = (bmi - 18.5) * 0.6 + age * 0.08;
    }

    return Math.max(1, Math.min(25, vf));
  }

  private calculateMetabolicAge(bodyFat: number, age: number, gender: 'male' | 'female'): number {
    const baselineBodyFat = gender === 'male' ? 18 : 25;
    const difference = bodyFat - baselineBodyFat;
    return Math.max(15, age + difference * 0.5);
  }

  // --------------------------------------------------------
  // Handle disconnection
  // --------------------------------------------------------

  private handleDisconnect(): void {
    this.server = null;
    this.characteristic = null;
    this.emit({ type: 'disconnected' });
  }

  // --------------------------------------------------------
  // Event emission
  // --------------------------------------------------------

  private emit(event: BluetoothEvent): void {
    this.listeners.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error en listener de Bluetooth:', error);
      }
    });
  }
}

// Singleton instance
export const bluetoothService = new BluetoothService();

// ============================================================
// Utility functions
// ============================================================

export function weightToKg(weight: number, unit: 'kg' | 'lb' | 'jin'): number {
  switch (unit) {
    case 'lb':
      return weight * 0.453592;
    case 'jin':
      return weight * 0.5;
    default:
      return weight;
  }
}

export function getDeviceTypeName(deviceType: string): string {
  const names: Record<string, string> = {
    xiaomi_scale: 'Xiaomi Mi Scale',
    amazfit: 'Amazfit',
    fitbit: 'Fitbit',
    garmin: 'Garmin',
    apple_watch: 'Apple Watch',
    other: 'Dispositivo desconocido',
  };
  return names[deviceType] || 'Dispositivo';
}

export function isBluetoothAvailable(): boolean {
  return 'bluetooth' in navigator;
}

export function isSecureContext(): boolean {
  return window.isSecureContext;
}
