import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { Card } from '@/components/UI/Card';
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements';

export default function AddMeasurementPage() {
  const navigate = useNavigate();
  const { addMeasurement, isAdding } = useBodyMeasurements();
  const [form, setForm] = useState({
    weight: '',
    bodyFatPercentage: '',
    muscleMass: '',
    waterPercentage: '',
    chest: '',
    waist: '',
    hips: '',
    notes: '',
  });

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, number | string | undefined> = {
      recordedAt: new Date().toISOString(),
      source: 'manual',
    };
    if (form.weight) data.weight = parseFloat(form.weight);
    if (form.bodyFatPercentage) data.bodyFatPercentage = parseFloat(form.bodyFatPercentage);
    if (form.muscleMass) data.muscleMass = parseFloat(form.muscleMass);
    if (form.waterPercentage) data.waterPercentage = parseFloat(form.waterPercentage);
    if (form.chest) data.chest = parseFloat(form.chest);
    if (form.waist) data.waist = parseFloat(form.waist);
    if (form.hips) data.hips = parseFloat(form.hips);
    if (form.notes) data.notes = form.notes;

    await addMeasurement(data);
    navigate('/measurements');
  };

  const fields = [
    { key: 'weight', label: 'Peso', unit: 'kg', required: true, step: '0.1', placeholder: '70.5' },
    { key: 'bodyFatPercentage', label: 'Grasa corporal', unit: '%', step: '0.1', placeholder: '20.0' },
    { key: 'muscleMass', label: 'Masa muscular', unit: 'kg', step: '0.1', placeholder: '55.0' },
    { key: 'waterPercentage', label: 'Agua corporal', unit: '%', step: '0.1', placeholder: '60.0' },
  ];

  const circumferenceFields = [
    { key: 'chest', label: 'Pecho', unit: 'cm', placeholder: '95' },
    { key: 'waist', label: 'Cintura', unit: 'cm', placeholder: '80' },
    { key: 'hips', label: 'Caderas', unit: 'cm', placeholder: '90' },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} leftIcon={<ArrowLeft size={16} />}>
        Volver
      </Button>

      <div>
        <h1 className="text-2xl font-display font-bold text-white">Añadir medida</h1>
        <p className="text-gray-400 text-sm mt-1">Registra tu composición corporal actual</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card padding="md">
          <h3 className="text-sm font-semibold text-white mb-4">Básicos</h3>
          <div className="grid grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  {field.label} ({field.unit})
                  {field.required && <span className="text-danger ml-1">*</span>}
                </label>
                <input
                  type="number"
                  step={field.step ?? '1'}
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) => update(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-electric-500/70 text-sm"
                />
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md">
          <h3 className="text-sm font-semibold text-white mb-4">Circunferencias (cm)</h3>
          <div className="grid grid-cols-3 gap-4">
            {circumferenceFields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">{field.label}</label>
                <input
                  type="number"
                  step="0.5"
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) => update(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-electric-500/70 text-sm"
                />
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md">
          <label className="block text-xs font-medium text-gray-300 mb-1.5">Notas</label>
          <textarea
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="Observaciones..."
            rows={3}
            className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-electric-500/70 text-sm resize-none"
          />
        </Card>

        <div className="flex gap-3">
          <Button variant="ghost" size="lg" className="flex-1" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="flex-1"
            isLoading={isAdding}
            leftIcon={<Save size={18} />}
            disabled={!form.weight}
          >
            Guardar medida
          </Button>
        </div>
      </form>
    </div>
  );
}
