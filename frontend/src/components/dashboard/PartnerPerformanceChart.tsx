import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PartnerPerformanceChartProps {
  data: Array<{
    partner: string;
    matched: number;
    unmatched: number;
    exceptions: number;
  }>;
  loading?: boolean;
}

export function PartnerPerformanceChart({ data, loading = false }: PartnerPerformanceChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Partner Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Partner Performance</CardTitle>
        <p className="text-sm text-muted-foreground">
          Reconciliation status by partner
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="partner"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
            />
            <Legend />
            <Bar dataKey="matched" fill="hsl(142, 76%, 36%)" name="Matched" radius={[4, 4, 0, 0]} />
            <Bar dataKey="unmatched" fill="hsl(48, 96%, 53%)" name="Unmatched" radius={[4, 4, 0, 0]} />
            <Bar dataKey="exceptions" fill="hsl(0, 84%, 60%)" name="Exceptions" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
