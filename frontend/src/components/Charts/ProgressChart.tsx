import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface ProgressDataPoint {
  subject: string;
  value: number;
  fullMark: number;
}

interface ProgressChartProps {
  data: ProgressDataPoint[];
  height?: number;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { subject: string }; value: number }>;
}) => {
  if (!active || !payload || !payload[0]) return null;
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-2 shadow-card-hover">
      <p className="text-xs text-gray-400">{payload[0].payload.subject}</p>
      <p className="text-sm font-semibold text-electric-400">{payload[0].value}%</p>
    </div>
  );
};

export function ProgressChart({ data, height = 220 }: ProgressChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data}>
        <PolarGrid stroke="#2A2A3E" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#6B7280', fontSize: 11 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Radar
          name="Progreso"
          dataKey="value"
          stroke="#00D4FF"
          fill="#00D4FF"
          fillOpacity={0.15}
          strokeWidth={2}
          dot={{ fill: '#00D4FF', r: 3 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export default ProgressChart;
