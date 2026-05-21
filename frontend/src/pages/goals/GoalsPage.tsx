import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Target, Plus, Check, Calendar, TrendingUp, Trophy, Trash2 } from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { Modal } from '@/components/UI/Modal';
import { ProgressBar, CircularProgress } from '@/components/UI/ProgressBar';
import { PageLoader } from '@/components/UI/LoadingSpinner';
import { Badge } from '@/components/UI/Badge';
import { goalService } from '@/services/api';
import type { Goal, GoalType } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const goalTypes: { value: GoalType; label: string }[] = [
  { value: 'weight', label: 'Peso corporal' },
  { value: 'strength', label: 'Fuerza' },
  { value: 'endurance', label: 'Resistencia' },
  { value: 'body_fat', label: 'Grasa corporal' },
  { value: 'custom', label: 'Personalizado' },
];

const goalUnits: Record<GoalType, string> = {
  weight: 'kg',
  strength: 'kg',
  endurance: 'min',
  body_fat: '%',
  custom: '',
};

function GoalCard({ goal, onDelete, onUpdate }: { goal: Goal; onDelete: () => void; onUpdate: (value: number) => void }) {
  const [showUpdate, setShowUpdate] = useState(false);
  const [newValue, setNewValue] = useState(goal.currentValue);
  const progress = Math.min(100, (goal.currentValue / goal.targetValue) * 100);
  const daysLeft = goal.targetDate
    ? Math.max(0, Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`bg-dark-card border rounded-2xl p-5 transition-all ${
        goal.status === 'achieved'
          ? 'border-neon-500/20 bg-neon-500/3'
          : 'border-dark-border hover:border-electric-500/20'
      }`}
    >
      <div className="flex items-start gap-4">
        <CircularProgress value={progress} size={64} strokeWidth={5} color={goal.status === 'achieved' ? '#39FF14' : '#00D4FF'}>
          <span className="text-xs font-bold text-white">{Math.round(progress)}%</span>
        </CircularProgress>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-base font-semibold text-white truncate">{goal.titleEs ?? goal.title}</h3>
            {goal.status === 'achieved' && <Trophy size={16} className="text-warning flex-shrink-0" />}
          </div>

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant={goal.status === 'achieved' ? 'success' : 'primary'} size="xs">
              {goalTypes.find((t) => t.value === goal.type)?.label ?? goal.type}
            </Badge>
            {daysLeft !== null && goal.status !== 'achieved' && (
              <Badge variant={daysLeft < 7 ? 'danger' : 'default'} size="xs">
                <Calendar size={10} className="mr-1" />
                {daysLeft} días
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">
              {goal.currentValue} / {goal.targetValue} {goal.unit}
            </span>
          </div>

          <ProgressBar value={progress} size="sm" color={goal.status === 'achieved' ? 'neon' : 'electric'} />

          {goal.status === 'achieved' && goal.achievedAt && (
            <p className="text-xs text-neon-400 mt-2 flex items-center gap-1">
              <Check size={12} />
              Conseguido el {format(new Date(goal.achievedAt), "dd 'de' MMMM", { locale: es })}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1 flex-shrink-0">
          {goal.status !== 'achieved' && (
            <button
              onClick={() => setShowUpdate(true)}
              className="p-2 text-gray-500 hover:text-electric-400 hover:bg-electric-500/10 rounded-lg transition-all text-xs"
              title="Actualizar progreso"
            >
              <TrendingUp size={16} />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-2 text-gray-500 hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Update progress inline */}
      {showUpdate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-dark-border flex items-center gap-3"
        >
          <input
            type="number"
            value={newValue}
            onChange={(e) => setNewValue(parseFloat(e.target.value))}
            step="0.1"
            className="flex-1 bg-dark-elevated border border-dark-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-electric-500/70"
          />
          <span className="text-sm text-gray-400">{goal.unit}</span>
          <Button size="sm" variant="primary" onClick={() => { onUpdate(newValue); setShowUpdate(false); }}>
            Guardar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowUpdate(false)}>Cancelar</Button>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function GoalsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    type: 'weight' as GoalType,
    title: '',
    targetValue: '',
    currentValue: '',
    unit: 'kg',
    targetDate: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: () => goalService.create({
      type: form.type,
      title: form.title,
      targetValue: parseFloat(form.targetValue),
      currentValue: parseFloat(form.currentValue) || 0,
      unit: form.unit,
      targetDate: form.targetDate || undefined,
      status: 'active',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setShowModal(false);
      setForm({ type: 'weight', title: '', targetValue: '', currentValue: '', unit: 'kg', targetDate: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, value }: { id: string; value: number }) =>
      goalService.update(id, { currentValue: value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => goalService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });

  if (isLoading) return <PageLoader label="Cargando objetivos..." />;

  const goals = data?.data ?? [];
  const activeGoals = goals.filter((g) => g.status === 'active');
  const achievedGoals = goals.filter((g) => g.status === 'achieved');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Mis Objetivos</h1>
          <p className="text-gray-400 text-sm mt-1">
            {activeGoals.length} activos · {achievedGoals.length} conseguidos
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus size={16} />} onClick={() => setShowModal(true)}>
          Nuevo objetivo
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <Target size={48} className="text-gray-600" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-400">Sin objetivos todavía</p>
            <p className="text-sm text-gray-600 mt-1">Define tus metas fitness para mantenerte motivado</p>
          </div>
          <Button variant="primary" onClick={() => setShowModal(true)} leftIcon={<Plus size={16} />}>
            Crear primer objetivo
          </Button>
        </div>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp size={18} className="text-electric-400" />
                En progreso
              </h2>
              <div className="space-y-3">
                {activeGoals.map((goal, i) => (
                  <motion.div key={goal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <GoalCard
                      goal={goal}
                      onDelete={() => deleteMutation.mutate(goal.id)}
                      onUpdate={(value) => updateMutation.mutate({ id: goal.id, value })}
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {achievedGoals.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <Trophy size={18} className="text-neon-400" />
                Conseguidos
              </h2>
              <div className="space-y-3">
                {achievedGoals.map((goal, i) => (
                  <motion.div key={goal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <GoalCard
                      goal={goal}
                      onDelete={() => deleteMutation.mutate(goal.id)}
                      onUpdate={(value) => updateMutation.mutate({ id: goal.id, value })}
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nuevo objetivo" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">Tipo de objetivo</label>
            <div className="grid grid-cols-2 gap-2">
              {goalTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    setForm((p) => ({ ...p, type: type.value, unit: goalUnits[type.value] }));
                  }}
                  className={`p-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                    form.type === type.value
                      ? 'border-electric-500/40 bg-electric-500/10 text-electric-400'
                      : 'border-dark-border bg-dark-elevated text-gray-400 hover:border-dark-muted'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Título *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Ej: Bajar a 70 kg"
              required
              className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-electric-500/70 text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Objetivo *</label>
              <input
                type="number"
                step="0.1"
                value={form.targetValue}
                onChange={(e) => setForm((p) => ({ ...p, targetValue: e.target.value }))}
                placeholder="70"
                className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-electric-500/70 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Actual</label>
              <input
                type="number"
                step="0.1"
                value={form.currentValue}
                onChange={(e) => setForm((p) => ({ ...p, currentValue: e.target.value }))}
                placeholder="75"
                className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-electric-500/70 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Unidad *</label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                placeholder="kg"
                className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-electric-500/70 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Fecha límite (opcional)</label>
            <input
              type="date"
              value={form.targetDate}
              onChange={(e) => setForm((p) => ({ ...p, targetDate: e.target.value }))}
              className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-electric-500/70 text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" size="md" className="flex-1" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              isLoading={createMutation.isPending}
              disabled={!form.title || !form.targetValue || !form.unit}
              onClick={() => createMutation.mutate()}
            >
              Crear objetivo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

