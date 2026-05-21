import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { format, parseISO, startOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface FrequencyDataPoint {
  date: string;
  count: number;
}

interface WorkoutFrequencyChartProps {
  data: FrequencyDataPoint[];
  height?: number;
  weeks?: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (!active || !payload || !payload[0]) return null;

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-3 shadow-card-hover">
      <p className="text-xs text-gray-400 mb-1">
        {label ? format(parseISO(label), 'dd MMMM yyyy', { locale: es }) : ''}
      </p>
      <p className="text-sm font-semibold text-white">
        {payload[0].value} {payload[0].value === 1 ? 'entrenamiento' : 'entrenamientos'}
      </p>
    </div>
  );
};

// Generate empty data for past N weeks
function generateWeeklyData(existingData: FrequencyDataPoint[], weeks: number): FrequencyDataPoint[] {
  const today = new Date();
  const result: FrequencyDataPoint[] = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const weekStart = startOfWeek(addDays(today, -w * 7), { weekStartsOn: 1 });
    for (let d = 0; d < 7; d++) {
      const day = addDays(weekStart, d);
      if (day > today) continue;
      const dateStr = format(day, 'yyyy-MM-dd');
      const existing = existingData.find((e) => e.date.startsWith(dateStr));
      result.push({
        date: dateStr,
        count: existing?.count ?? 0,
      });
    }
  }

  return result;
}

export function WorkoutFrequencyChart({
  data,
  height = 200,
  weeks = 8,
}: WorkoutFrequencyChartProps) {
  const chartData = generateWeeklyData(data, weeks);

  const formatXAxis = (date: string) => {
    try {
      const d = parseISO(date);
      const dow = d.getDay();
      if (dow !== 1) return '';
      return format(d, 'dd/MM', { locale: es });
    } catch {
      return '';
    }
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3E" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          tick={{ fill: '#6B7280', fontSize: 10 }}
          axisLine={{ stroke: '#2A2A3E' }}
          tickLine={false}
          interval={0}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: '#6B7280', fontSize: 10 }}
          axisLine={{ stroke: '#2A2A3E' }}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 212, 255, 0.05)' }} />
        <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={16}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.count > 0 ? '#00D4FF' : '#1A1A28'}
              fillOpacity={entry.count > 0 ? 1 : 1}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default WorkoutFrequencyChart;
