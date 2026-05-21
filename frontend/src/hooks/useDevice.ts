import { useCallback, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bluetoothService, type BluetoothEvent, type UserMeasurementParams } from '@/services/bluetooth';
import { useDeviceStore } from '@/store/deviceStore';
import { measurementService, deviceService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import type { XiaomiScaleData, XiaomiScaleMetrics } from '@/types';

interface UseDeviceOptions {
  onData?: (data: XiaomiScaleData | XiaomiScaleMetrics) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: string) => void;
}

export function useDevice(options: UseDeviceOptions = {}) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const {
    connectedDevices,
    isScanning,
    setScanning,
    setConnectedDevice,
    removeConnectedDevice,
    updateLastData,
    fetchDevices,
    devices,
  } = useDeviceStore();

  const callbacksRef = useRef(options);
  callbacksRef.current = options;

  // Set up user params for body metrics calculation
  useEffect(() => {
    if (user?.profile) {
      const { height, dateOfBirth, gender } = user.profile;
      if (height && dateOfBirth && gender) {
        const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
        const params: UserMeasurementParams = {
          height,
          age,
          gender: gender === 'other' ? 'male' : gender,
        };
        bluetoothService.setUserParams(params);
      }
    }
  }, [user]);

  // Listen for Bluetooth events
  useEffect(() => {
    const handleEvent = (event: BluetoothEvent) => {
      switch (event.type) {
        case 'scanning':
          setScanning(true);
          break;

        case 'found':
          setScanning(false);
          break;

        case 'connecting':
          break;

        case 'connected':
          setScanning(false);
          if (event.device) {
            setConnectedDevice({
              id: event.device.id,
              type: event.device.deviceType,
              name: event.device.name,
              status: 'connected',
            });
          }
          callbacksRef.current.onConnected?.();
          break;

        case 'disconnected':
          if (event.device) {
            removeConnectedDevice(event.device.id);
          } else {
            // Remove all Xiaomi scale connections
            connectedDevices
              .filter((d) => d.type === 'xiaomi_scale')
              .forEach((d) => removeConnectedDevice(d.id));
          }
          callbacksRef.current.onDisconnected?.();
          break;

        case 'data':
          if (event.data) {
            const deviceId = connectedDevices.find((d) => d.type === 'xiaomi_scale')?.id;
            if (deviceId) {
              updateLastData(deviceId, event.data as Record<string, unknown>);
            }
            callbacksRef.current.onData?.(event.data);
          }
          break;

        case 'error':
          setScanning(false);
          if (event.error) {
            callbacksRef.current.onError?.(event.error);
          }
          break;
      }
    };

    bluetoothService.addListener(handleEvent);
    return () => {
      bluetoothService.removeListener(handleEvent);
    };
  }, [connectedDevices, setScanning, setConnectedDevice, removeConnectedDevice, updateLastData]);

  // Load devices on mount
  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // Connect to Xiaomi Mi Scale
  const connectMutation = useMutation({
    mutationFn: async () => {
      if (!bluetoothService.isSupported()) {
        throw new Error('Web Bluetooth no está disponible en este navegador');
      }
      if (!window.isSecureContext) {
        throw new Error('Se requiere HTTPS para usar Bluetooth');
      }
      await bluetoothService.connect();
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: () => bluetoothService.disconnect(),
  });

  // Save measurement from scale
  const saveMeasurementMutation = useMutation({
    mutationFn: async (data: XiaomiScaleData | XiaomiScaleMetrics) => {
      const measurement = {
        recordedAt: (data as XiaomiScaleData).timestamp.toISOString(),
        weight: data.unit === 'kg' ? data.weight : data.unit === 'lb' ? data.weight * 0.453592 : data.weight * 0.5,
        source: 'xiaomi_scale' as const,
        bodyFatPercentage: 'bodyFatPercentage' in data ? (data as XiaomiScaleMetrics).bodyFatPercentage : undefined,
        muscleMass: 'muscleMass' in data ? (data as XiaomiScaleMetrics).muscleMass : undefined,
        boneMass: 'boneMass' in data ? (data as XiaomiScaleMetrics).boneMass : undefined,
        waterPercentage: 'waterPercentage' in data ? (data as XiaomiScaleMetrics).waterPercentage : undefined,
        bmi: 'bmi' in data ? (data as XiaomiScaleMetrics).bmi : undefined,
        visceralFat: 'visceralFat' in data ? (data as XiaomiScaleMetrics).visceralFat : undefined,
        metabolicAge: 'metabolicAge' in data ? (data as XiaomiScaleMetrics).metabolicAge : undefined,
      };
      return measurementService.create(measurement);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Register device
  const registerDeviceMutation = useMutation({
    mutationFn: (deviceInfo: { id: string; name: string; type: string }) =>
      deviceService.register({
        type: 'xiaomi_scale',
        name: deviceInfo.name,
        deviceId: deviceInfo.id,
        protocol: 'bluetooth',
        status: 'connected',
        isActive: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });

  const connectToScale = useCallback(async () => {
    await connectMutation.mutateAsync();
    const device = bluetoothService.getConnectedDevice();
    if (device) {
      await registerDeviceMutation.mutateAsync(device);
    }
  }, [connectMutation, registerDeviceMutation]);

  const disconnect = useCallback(() => {
    disconnectMutation.mutate();
  }, [disconnectMutation]);

  const saveMeasurement = useCallback(
    (data: XiaomiScaleData | XiaomiScaleMetrics) => {
      return saveMeasurementMutation.mutateAsync(data);
    },
    [saveMeasurementMutation],
  );

  const isConnected = bluetoothService.isConnected();
  const isBluetoothSupported = bluetoothService.isSupported();
  const connectedScale = connectedDevices.find((d) => d.type === 'xiaomi_scale');

  return {
    devices,
    connectedDevices,
    connectedScale,
    isConnected,
    isBluetoothSupported,
    isScanning,
    isConnecting: connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
    isSaving: saveMeasurementMutation.isPending,
    connectToScale,
    disconnect,
    saveMeasurement,
    connectError: connectMutation.error?.message,
    saveError: saveMeasurementMutation.error?.message,
  };
}
