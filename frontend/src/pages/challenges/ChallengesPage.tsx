import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, Flame, Clock, Users, Target, Award } from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { Card } from '@/components/UI/Card';
import { Badge } from '@/components/UI/Badge';
import { ProgressBar } from '@/components/UI/ProgressBar';
import { PageLoader } from '@/components/UI/LoadingSpinner';
import { challengeService } from '@/services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Challenge, UserChallenge } from '@/types';

const typeLabels: Record<string, string> = {
  workout_count: 'Entrenamientos',
  volume: 'Volumen',
  streak: 'Racha',
  specific_exercise: 'Ejercicio específico',
  weight_loss: 'Pérdida de peso',
  distance: 'Distancia',
};

function ChallengeCard({
  challenge,
  userChallenge,
  onJoin,
  isJoining,
}: {
  challenge: Challenge;
  userChallenge?: UserChallenge;
  onJoin?: () => void;
  isJoining?: boolean;
}) {
  const isCompleted = userChallenge?.isCompleted ?? false;
  const isActive = !!(userChallenge && !isCompleted);
  const progress = userChallenge ? (userChallenge.progress / challenge.target) * 100 : 0;
  const daysLeft = Math.max(0, Math.ceil((new Date(challenge.endDate).getTime() - Date.now()) / 86400000));

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`bg-dark-card border rounded-2xl p-5 transition-all ${
        isCompleted
          ? 'border-neon-500/20 bg-neon-500/3'
          : isActive
          ? 'border-electric-500/20 bg-electric-500/3'
          : 'border-dark-border hover:border-electric-500/20'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="text-base font-semibold text-white">{challenge.nameEs ?? challenge.name}</h3>
            {isCompleted && <Trophy size={16} className="text-warning" />}
            <Badge variant={
              challenge.status === 'active' ? 'primary' : 
              challenge.status === 'completed' ? 'success' : 'default'
            } size="xs">
              {typeLabels[challenge.type] ?? challenge.type}
            </Badge>
          </div>

          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
            {challenge.descriptionEs ?? challenge.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Target size={12} />
              Meta: {challenge.target} {challenge.unit}
            </span>
            {daysLeft > 0 && !isCompleted && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {daysLeft} días restantes
              </span>
            )}
            {challenge.participantsCount > 0 && (
              <span className="flex items-center gap-1">
                <Users size={12} />
                {challenge.participantsCount}
              </span>
            )}
          </div>

          {isActive && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">
                  {userChallenge?.progress.toFixed(1)} / {challenge.target} {challenge.unit}
                </span>
                <span className="text-electric-400">{Math.round(progress)}%</span>
              </div>
              <ProgressBar value={progress} size="sm" color="electric" />
            </div>
          )}

          {isCompleted && userChallenge?.completedAt && (
            <p className="text-xs text-neon-400 flex items-center gap-1.5 mt-2">
              <Award size={12} />
              Completado el {format(new Date(userChallenge.completedAt), "dd 'de' MMMM", { locale: es })}
            </p>
          )}

          {challenge.reward && (
            <p className="text-xs text-warning mt-2 flex items-center gap-1">
              <Trophy size={12} />
              Recompensa: {challenge.rewardEs ?? challenge.reward}
            </p>
          )}
        </div>

        {!isActive && !isCompleted && (
          <Button
            variant="primary"
            size="sm"
            onClick={onJoin}
            isLoading={isJoining}
            className="flex-shrink-0"
          >
            Unirse
          </Button>
        )}
        {isCompleted && (
          <div className="w-10 h-10 bg-neon-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Trophy size={20} className="text-neon-400" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ChallengesPage() {
  const queryClient = useQueryClient();

  const { data: allData, isLoading } = useQuery({
    queryKey: ['challenges', 'all'],
    queryFn: () => challengeService.getAll(),
  });

  const { data: userChallengesData } = useQuery({
    queryKey: ['challenges', 'user'],
    queryFn: () => challengeService.getUserChallenges(),
  });

  const joinMutation = useMutation({
    mutationFn: (id: string) => challengeService.join(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });

  if (isLoading) return <PageLoader label="Cargando retos..." />;

  const challenges = allData?.data ?? [];
  const userChallenges = userChallengesData?.data ?? [];

  const userChallengeMap = userChallenges.reduce<Record<string, UserChallenge>>((acc, uc) => {
    acc[uc.challengeId] = uc;
    return acc;
  }, {});

  const activeChallenges = challenges.filter((c) => userChallengeMap[c.id] && !userChallengeMap[c.id].isCompleted);
  const availableChallenges = challenges.filter((c) => !userChallengeMap[c.id]);
  const completedChallenges = challenges.filter((c) => userChallengeMap[c.id]?.isCompleted);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Retos y Desafíos</h1>
        <p className="text-gray-400 text-sm mt-1">
          {activeChallenges.length} activos · {completedChallenges.length} completados
        </p>
      </div>

      {activeChallenges.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <Flame size={18} className="text-warning" />
            En progreso
          </h2>
          <div className="space-y-3">
            {activeChallenges.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <ChallengeCard challenge={c} userChallenge={userChallengeMap[c.id]} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {availableChallenges.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <Target size={18} className="text-electric-400" />
            Disponibles
          </h2>
          <div className="space-y-3">
            {availableChallenges.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <ChallengeCard
                  challenge={c}
                  onJoin={() => joinMutation.mutate(c.id)}
                  isJoining={joinMutation.isPending}
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {completedChallenges.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <Trophy size={18} className="text-neon-400" />
            Completados
          </h2>
          <div className="space-y-3">
            {completedChallenges.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <ChallengeCard challenge={c} userChallenge={userChallengeMap[c.id]} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {challenges.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20">
          <Trophy size={48} className="text-gray-600" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-400">No hay retos disponibles</p>
            <p className="text-sm text-gray-600 mt-1">Vuelve pronto, se añadirán nuevos retos</p>
          </div>
        </div>
      )}
    </div>
  );
}
