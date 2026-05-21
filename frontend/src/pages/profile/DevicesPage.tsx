import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BluetoothOff, Watch, Scale, Trash2 } from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { Card } from '@/components/UI/Card';
import { Badge } from '@/components/UI/Badge';
import { BluetoothScanner } from '@/components/Devices/BluetoothScanner';
import { useDevice } from '@/hooks/useDevice';
import { useDeviceStore } from '@/store/deviceStore';
import { format } from 'date-fns';

const deviceIcons: Record<string, React.ElementType> = {
  xiaomi_scale: Scale,
  amazfit: Watch,
};

const deviceNames: Record<string, string> = {
  xiaomi_scale: 'Xiaomi Mi Scale',
  amazfit: 'Amazfit',
  fitbit: 'Fitbit',
  garmin: 'Garmin',
  apple_watch: 'Apple Watch',
  other: 'Dispositivo',
};

export default function DevicesPage() {
  const navigate = useNavigate();
  const { devices, isBluetoothSupported } = useDevice();
  const { removeDevice } = useDeviceStore();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} leftIcon={<ArrowLeft size={16} />}>
        Volver
      </Button>

      <div>
        <h1 className="text-2xl font-display font-bold text-white">Mis Dispositivos</h1>
        <p className="text-gray-400 text-sm mt-1">Gestiona tus dispositivos conectados</p>
      </div>

      {/* Xiaomi Mi Scale */}
      <Card padding="none">
        <div className="p-5 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-electric-500/10 border border-electric-500/20 flex items-center justify-center">
              <Scale size={20} className="text-electric-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Xiaomi Mi Scale</h3>
              <p className="text-xs text-gray-400">Báscula inteligente con composición corporal</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          {!isBluetoothSupported ? (
            <div className="flex items-center gap-3 text-gray-400">
              <BluetoothOff size={20} />
              <p className="text-sm">Bluetooth no disponible en este navegador. Usa Chrome.</p>
            </div>
          ) : (
            <BluetoothScanner />
          )}
        </div>
      </Card>

      {/* Amazfit */}
      <Card padding="md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-dark-muted border border-dark-border flex items-center justify-center">
            <Watch size={20} className="text-gray-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Amazfit</h3>
            <p className="text-xs text-gray-400">Smartwatch con datos de salud y entrenamiento</p>
          </div>
          <Badge variant="default" className="ml-auto">Próximamente</Badge>
        </div>
        <p className="text-sm text-gray-500">
          La integración con Amazfit está en desarrollo. Pronto podrás sincronizar pasos, sueño, frecuencia cardíaca y más.
        </p>
      </Card>

      {/* Connected devices list */}
      {devices.length > 0 && (
        <Card padding="none">
          <div className="p-5 border-b border-dark-border">
            <h3 className="text-sm font-semibold text-white">Dispositivos registrados</h3>
          </div>
          <div className="divide-y divide-dark-border">
            {devices.map((device) => {
              const Icon = deviceIcons[device.type] ?? Scale;
              return (
                <motion.div
                  key={device.id}
                  className="flex items-center gap-4 p-4"
                >
                  <div className="w-9 h-9 rounded-xl bg-dark-elevated border border-dark-border flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {device.name || deviceNames[device.type] || 'Dispositivo'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${device.status === 'connected' ? 'bg-neon-500' : 'bg-gray-600'}`} />
                      <span className="text-xs text-gray-500">
                        {device.status === 'connected' ? 'Conectado' : 'Desconectado'}
                      </span>
                      {device.lastSync && (
                        <span className="text-xs text-gray-600">
                          · Última sync: {format(new Date(device.lastSync), 'dd/MM HH:mm')}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeDevice(device.id)}
                    className="p-2 text-gray-500 hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
