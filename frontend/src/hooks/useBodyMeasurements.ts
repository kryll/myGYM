import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { measurementService } from '@/services/api';
import type { BodyMeasurement } from '@/types';

export function useBodyMeasurements() {
  const queryClient = useQueryClient();

  const { data: measurementsData, isLoading } = useQuery({
    queryKey: ['measurements'],
    queryFn: () => measurementService.getAll(1, 100),
  });

  const { data: latestData } = useQuery({
    queryKey: ['measurements', 'latest'],
    queryFn: () => measurementService.getLatest(),
  });

  const addMeasurementMutation = useMutation({
    mutationFn: (measurement: Partial<BodyMeasurement>) =>
      measurementService.create(measurement),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateMeasurementMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BodyMeasurement> }) =>
      measurementService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
    },
  });

  const deleteMeasurementMutation = useMutation({
    mutationFn: (id: string) => measurementService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
    },
  });

  const measurements = measurementsData?.data ?? [];
  const latest = latestData?.data ?? null;

  // Compute weight trend
  const weightData = measurements
    .filter((m) => m.weight !== undefined)
    .slice()
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .map((m) => ({
      date: m.recordedAt,
      weight: m.weight!,
      bodyFat: m.bodyFatPercentage,
      muscleMass: m.muscleMass,
    }));

  const weightChange =
    weightData.length >= 2
      ? weightData[weightData.length - 1].weight - weightData[0].weight
      : 0;

  return {
    measurements,
    latest,
    weightData,
    weightChange,
    isLoading,
    isAdding: addMeasurementMutation.isPending,
    isUpdating: updateMeasurementMutation.isPending,
    isDeleting: deleteMeasurementMutation.isPending,
    addMeasurement: (data: Partial<BodyMeasurement>) => addMeasurementMutation.mutateAsync(data),
    updateMeasurement: (id: string, data: Partial<BodyMeasurement>) =>
      updateMeasurementMutation.mutateAsync({ id, data }),
    deleteMeasurement: (id: string) => deleteMeasurementMutation.mutateAsync(id),
  };
}
