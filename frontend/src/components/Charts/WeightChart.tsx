import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface WeightDataPoint {
  date: string;
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
}

interface WeightChartProps {
  data: WeightDataPoint[];
  height?: number;
  showBodyFat?: boolean;
  showMuscleMass?: boolean;
  targetWeight?: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload || !label) return null;

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-3 shadow-card-hover">
      <p className="text-xs text-gray-400 mb-2">
        {format(parseISO(label), 'dd MMM yyyy', { locale: es })}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-gray-300">
            {entry.name === 'weight' && 'Peso'}
            {entry.name === 'bodyFat' && 'Grasa corporal'}
            {entry.name === 'muscleMass' && 'Masa muscular'}:{' '}
            <span className="font-semibold text-white">
              {entry.value.toFixed(1)}
              {entry.name === 'bodyFat' ? '%' : ' kg'}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
};

export function WeightChart({
  data,
  height = 280,
  showBodyFat = false,
  showMuscleMass = false,
  targetWeight,
}: WeightChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-gray-500 text-sm">Sin datos de peso registrados</p>
      </div>
    );
  }

  const formatXAxis = (date: string) => {
    try {
      return format(parseISO(date), 'dd/MM', { locale: es });
    } catch {
      return date;
    }
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="bodyFatGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FFB800" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#FFB800" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="muscleGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#39FF14" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#39FF14" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3E" />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          tick={{ fill: '#6B7280', fontSize: 11 }}
          axisLine={{ stroke: '#2A2A3E' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#6B7280', fontSize: 11 }}
          axisLine={{ stroke: '#2A2A3E' }}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />

        {targetWeight && (
          <ReferenceLine
            y={targetWeight}
            stroke="#39FF14"
            strokeDasharray="4 4"
            strokeOpacity={0.6}
            label={{
              value: `Objetivo: ${targetWeight}kg`,
              fill: '#39FF14',
              fontSize: 11,
              position: 'right',
            }}
          />
        )}

        <Area
          type="monotone"
          dataKey="weight"
          stroke="#00D4FF"
          strokeWidth={2}
          fill="url(#weightGradient)"
          dot={{ fill: '#00D4FF', strokeWidth: 2, r: 3 }}
          activeDot={{ r: 5, fill: '#00D4FF', stroke: '#fff', strokeWidth: 2 }}
        />

        {showBodyFat && (
          <Area
            type="monotone"
            dataKey="bodyFat"
            stroke="#FFB800"
            strokeWidth={2}
            fill="url(#bodyFatGradient)"
            dot={{ fill: '#FFB800', strokeWidth: 2, r: 3 }}
          />
        )}

        {showMuscleMass && (
          <Area
            type="monotone"
            dataKey="muscleMass"
            stroke="#39FF14"
            strokeWidth={2}
            fill="url(#muscleGradient)"
            dot={{ fill: '#39FF14', strokeWidth: 2, r: 3 }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default WeightChart;
