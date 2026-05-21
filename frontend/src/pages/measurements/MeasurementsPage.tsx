import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Scale, TrendingDown, TrendingUp, Bluetooth } from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { Card, CardTitle } from '@/components/UI/Card';
import { Badge } from '@/components/UI/Badge';
import { WeightChart } from '@/components/Charts/WeightChart';
import { BluetoothScanner } from '@/components/Devices/BluetoothScanner';
import { PageLoader } from '@/components/UI/LoadingSpinner';
import { Modal } from '@/components/UI/Modal';
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type ChartMetric = 'weight' | 'bodyFat' | 'muscleMass';

export default function MeasurementsPage() {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);
  const [activeMetric, setActiveMetric] = useState<ChartMetric>('weight');
  const { measurements, latest, weightData, weightChange, isLoading } = useBodyMeasurements();

  if (isLoading) return <PageLoader label="Cargando medidas..." />;

  const metrics = [
    {
      key: 'weight' as ChartMetric,
      label: 'Peso',
      value: latest?.weight ? `${latest.weight.toFixed(1)} kg` : '--',
      change: weightChange,
    },
    {
      key: 'bodyFat' as ChartMetric,
      label: 'Grasa corporal',
      value: latest?.bodyFatPercentage ? `${latest.bodyFatPercentage.toFixed(1)}%` : '--',
    },
    {
      key: 'muscleMass' as ChartMetric,
      label: 'Masa muscular',
      value: latest?.muscleMass ? `${latest.muscleMass.toFixed(1)} kg` : '--',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Medidas Corporales</h1>
          <p className="text-gray-400 text-sm mt-1">Seguimiento de tu composición corporal</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" leftIcon={<Bluetooth size={16} />} onClick={() => setShowScanner(true)}>
            Báscula Mi
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus size={16} />} onClick={() => navigate('/measurements/add')}>
            Añadir medida
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <motion.button
            key={metric.key}
            whileHover={{ y: -2 }}
            onClick={() => setActiveMetric(metric.key)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeMetric === metric.key
                ? 'border-electric-500/40 bg-electric-500/5 shadow-glow-blue'
                : 'border-dark-border bg-dark-card hover:border-electric-500/20'
            }`}
          >
            <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
            <p className="text-xl font-display font-bold text-white">{metric.value}</p>
            {metric.change !== undefined && metric.change !== 0 && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${metric.change < 0 ? 'text-neon-400' : 'text-danger'}`}>
                {metric.change < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)} kg
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <Card padding="none">
        <div className="p-5 border-b border-dark-border">
          <CardTitle>Evolución</CardTitle>
          <div className="flex gap-2 mt-2">
            {metrics.map((m) => (
              <button
                key={m.key}
                onClick={() => setActiveMetric(m.key)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeMetric === m.key
                    ? 'bg-electric-500/15 text-electric-400 border border-electric-500/30'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-5">
          <WeightChart
            data={weightData}
            height={280}
            showBodyFat={activeMetric === 'bodyFat'}
            showMuscleMass={activeMetric === 'muscleMass'}
          />
        </div>
      </Card>

      {latest?.bmi && (
        <Card padding="md">
          <h3 className="text-sm font-semibold text-white mb-3">Índice de Masa Corporal</h3>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-display font-bold text-white">{latest.bmi.toFixed(1)}</div>
            <div>
              <Badge variant={latest.bmi < 18.5 ? 'info' : latest.bmi < 25 ? 'success' : latest.bmi < 30 ? 'warning' : 'danger'}>
                {latest.bmi < 18.5 ? 'Bajo peso' : latest.bmi < 25 ? 'Peso normal' : latest.bmi < 30 ? 'Sobrepeso' : 'Obesidad'}
              </Badge>
              {latest.metabolicAge && (
                <p className="text-xs text-gray-500 mt-1">Edad metabólica: {latest.metabolicAge} años</p>
              )}
            </div>
          </div>
        </Card>
      )}

      <Card padding="none">
        <div className="p-5 border-b border-dark-border">
          <CardTitle>Historial de medidas</CardTitle>
        </div>
        <div className="divide-y divide-dark-border">
          {measurements.length === 0 ? (
            <div className="py-12 text-center">
              <Scale size={48} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">Sin medidas registradas</p>
              <div className="flex gap-2 justify-center mt-4">
                <Button variant="outline" size="sm" onClick={() => navigate('/measurements/add')}>Añadir manual</Button>
                <Button variant="secondary" size="sm" onClick={() => setShowScanner(true)}>Conectar báscula</Button>
              </div>
            </div>
          ) : (
            measurements.slice(0, 20).map((m) => (
              <div key={m.id} className="flex items-center gap-4 px-5 py-3 hover:bg-dark-hover transition-colors">
                <div className="w-8 h-8 rounded-xl bg-electric-500/10 border border-electric-500/20 flex items-center justify-center flex-shrink-0">
                  <Scale size={14} className="text-electric-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">
                    {format(new Date(m.recordedAt), "dd 'de' MMMM yyyy", { locale: es })}
                  </p>
                  <p className="text-xs text-gray-500">{m.source === 'xiaomi_scale' ? 'Báscula Mi Scale' : 'Manual'}</p>
                </div>
                <div className="text-right">
                  {m.weight && <p className="text-sm font-semibold text-white">{m.weight.toFixed(1)} kg</p>}
                  {m.bodyFatPercentage && <p className="text-xs text-gray-400">{m.bodyFatPercentage.toFixed(1)}% grasa</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Modal isOpen={showScanner} onClose={() => setShowScanner(false)} title="Conectar Xiaomi Mi Scale" size="sm">
        <BluetoothScanner onSave={() => setShowScanner(false)} />
      </Modal>
    </div>
  );
}
