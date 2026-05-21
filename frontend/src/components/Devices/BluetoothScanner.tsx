import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bluetooth, BluetoothOff, BluetoothConnected, Scale, Zap, AlertCircle, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/UI/Button';
import { useDevice } from '@/hooks/useDevice';
import { isBluetoothAvailable, isSecureContext } from '@/services/bluetooth';
import type { XiaomiScaleData, XiaomiScaleMetrics } from '@/types';

interface BluetoothScannerProps {
  onData?: (data: XiaomiScaleData | XiaomiScaleMetrics) => void;
  onSave?: (data: XiaomiScaleData | XiaomiScaleMetrics) => void;
  className?: string;
}

export function BluetoothScanner({ onData, onSave, className }: BluetoothScannerProps) {
  const [lastReading, setLastReading] = useState<XiaomiScaleData | XiaomiScaleMetrics | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const {
    isConnected,
    isScanning,
    isConnecting,
    isSaving,
    connectToScale,
    disconnect,
    saveMeasurement,
    connectedScale,
  } = useDevice({
    onData: (data) => {
      // Only show stabilized readings
      if ((data as XiaomiScaleData).isStabilized && !(data as XiaomiScaleData).isWeightRemoved) {
        setLastReading(data);
        setIsSaved(false);
        onData?.(data);
      }
    },
    onConnected: () => {
      setScanError(null);
    },
    onError: (error) => {
      setScanError(error);
    },
  });

  const bluetoothAvailable = isBluetoothAvailable();
  const secureContext = isSecureContext();

  const handleConnect = async () => {
    setScanError(null);
    try {
      await connectToScale();
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'Error de conexión');
    }
  };

  const handleSave = async () => {
    if (!lastReading) return;
    try {
      await saveMeasurement(lastReading);
      setIsSaved(true);
      onSave?.(lastReading);
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'Error al guardar');
    }
  };

  if (!bluetoothAvailable || !secureContext) {
    return (
      <div className={clsx('p-4 rounded-2xl bg-dark-elevated border border-dark-border', className)}>
        <div className="flex items-center gap-3 text-gray-400">
          <BluetoothOff size={20} />
          <div>
            <p className="text-sm font-medium text-white">Bluetooth no disponible</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {!secureContext
                ? 'Se requiere HTTPS para usar Bluetooth'
                : 'Tu navegador no soporta Web Bluetooth. Usa Chrome en Android/Desktop.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('rounded-2xl border overflow-hidden', className,
      isConnected ? 'border-neon-500/30 bg-neon-500/5' : 'border-dark-border bg-dark-elevated'
    )}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={clsx(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            isConnected ? 'bg-neon-500/20' : 'bg-dark-muted',
          )}>
            {isConnected ? (
              <BluetoothConnected size={20} className="text-neon-400" />
            ) : (
              <Bluetooth size={20} className="text-gray-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {isConnected ? connectedScale?.name ?? 'Mi Scale' : 'Xiaomi Mi Scale'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={clsx(
                'w-1.5 h-1.5 rounded-full',
                isConnected ? 'bg-neon-500 animate-pulse' : 'bg-gray-600',
              )} />
              <span className="text-xs text-gray-400">
                {isConnected ? 'Conectado' : isScanning || isConnecting ? 'Conectando...' : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>

        {isConnected ? (
          <Button variant="ghost" size="sm" onClick={disconnect}>
            Desconectar
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleConnect}
            isLoading={isScanning || isConnecting}
            leftIcon={<Bluetooth size={14} />}
          >
            {isScanning || isConnecting ? 'Buscando...' : 'Conectar'}
          </Button>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {scanError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-3"
          >
            <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-xl">
              <AlertCircle size={16} className="text-danger flex-shrink-0" />
              <p className="text-xs text-danger">{scanError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanning animation */}
      {(isScanning || isConnecting) && (
        <div className="px-4 pb-4">
          <div className="relative flex items-center justify-center py-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border border-electric-500/40"
                animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                style={{ width: 40, height: 40 }}
              />
            ))}
            <div className="w-10 h-10 rounded-full bg-electric-500/20 flex items-center justify-center">
              <Bluetooth size={18} className="text-electric-400" />
            </div>
          </div>
          <p className="text-xs text-center text-gray-400">
            Buscando báscula cerca... Asegúrate de que está encendida.
          </p>
        </div>
      )}

      {/* Connected - waiting for measurement */}
      {isConnected && !lastReading && (
        <div className="px-4 pb-4">
          <div className="flex flex-col items-center gap-2 py-4">
            <motion.div
              animate={{ y: [-3, 3] }}
              transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
            >
              <Scale size={40} className="text-neon-400" />
            </motion.div>
            <p className="text-sm text-gray-300 font-medium">Sube a la báscula</p>
            <p className="text-xs text-gray-500 text-center">
              Quédate quieto y espera a que se estabilice la lectura
            </p>
          </div>
        </div>
      )}

      {/* Reading display */}
      <AnimatePresence>
        {lastReading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 pb-4"
          >
            {/* Weight */}
            <div className="text-center mb-4">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-4xl font-display font-bold text-white"
              >
                {lastReading.weight.toFixed(1)}
                <span className="text-lg text-gray-400 ml-1">{lastReading.unit}</span>
              </motion.div>
              {(lastReading as XiaomiScaleMetrics).bmi && (
                <p className="text-sm text-gray-400 mt-1">
                  IMC: {(lastReading as XiaomiScaleMetrics).bmi?.toFixed(1)}
                </p>
              )}
            </div>

            {/* Body metrics grid */}
            {(lastReading as XiaomiScaleMetrics).bodyFatPercentage && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: 'Grasa corporal', value: `${(lastReading as XiaomiScaleMetrics).bodyFatPercentage?.toFixed(1)}%`, color: 'text-warning' },
                  { label: 'Masa muscular', value: `${(lastReading as XiaomiScaleMetrics).muscleMass?.toFixed(1)} kg`, color: 'text-neon-400' },
                  { label: 'Agua corporal', value: `${(lastReading as XiaomiScaleMetrics).waterPercentage?.toFixed(1)}%`, color: 'text-electric-400' },
                  { label: 'Masa ósea', value: `${(lastReading as XiaomiScaleMetrics).boneMass?.toFixed(1)} kg`, color: 'text-gray-300' },
                ].map((metric) => (
                  <div key={metric.label} className="bg-dark-card border border-dark-border rounded-xl p-2.5">
                    <p className="text-xs text-gray-500 mb-0.5">{metric.label}</p>
                    <p className={clsx('text-sm font-semibold', metric.color)}>{metric.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Save button */}
            {isSaved ? (
              <div className="flex items-center justify-center gap-2 py-2 text-neon-400">
                <Check size={18} />
                <span className="text-sm font-medium">Guardado correctamente</span>
              </div>
            ) : (
              <Button
                onClick={handleSave}
                variant="success"
                size="md"
                fullWidth
                isLoading={isSaving}
                leftIcon={<Zap size={16} />}
              >
                Guardar medición
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BluetoothScanner;
