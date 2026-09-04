import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ChannelChartProps {
  pos: { date: string; revenue: number }[];
  online: { date: string; revenue: number }[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number; color?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop">
      <p className="font-medium text-muted">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="mt-0.5 font-semibold" style={{ color: p.color }}>
          {p.name}: KES {(p.value ?? 0).toLocaleString('en-KE')}
        </p>
      ))}
    </div>
  );
}

export function ChannelChart({ pos, online }: ChannelChartProps) {
  const data = pos.map((p, i) => ({
    date: p.date,
    POS: p.revenue,
    Online: online[i]?.revenue ?? 0,
  }));

  const hasData = data.some((d) => d.POS > 0 || d.Online > 0);
  if (!hasData) {
    return <div className="flex h-48 items-center justify-center text-sm text-muted">No sales in this period yet</div>;
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#647067' }}
            tickFormatter={(v: string) => {
              const d = new Date(v);
              return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
            }}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#647067' }}
            tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="POS" fill="#F28C18" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Online" fill="#D96F00" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

