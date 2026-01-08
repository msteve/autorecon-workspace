import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, GitCompare, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MatchingDashboardPage = () => {
  const navigate = useNavigate();

  const stats = [
    { title: 'Total Records', value: '125,430', icon: GitCompare, change: '+5%' },
    { title: 'Matched', value: '112,890', icon: CheckCircle2, change: '+3%' },
    { title: 'Unmatched', value: '12,540', icon: XCircle, change: '-2%' },
    { title: 'Match Rate', value: '90.0%', icon: TrendingUp, change: '+1.2%' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Matching Dashboard</h1>
        <p className="text-muted-foreground">Overview of record matching operations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="text-sm font-medium">{stat.title}</div>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <Badge variant="success" className="mt-1">{stat.change}</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => navigate('/matching/matched')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Matched Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">View successfully matched transaction pairs</p>
            <div className="mt-4">
              <Button variant="outline">View All Matches</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => navigate('/matching/unmatched')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Unmatched Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Review records that require manual matching</p>
            <div className="mt-4">
              <Button variant="outline">View Unmatched</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MatchingDashboardPage;
