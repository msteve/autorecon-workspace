import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { exceptionsService, AgingBucket } from '@/services/exceptionsService';
import { useNavigate } from 'react-router-dom';

/**
 * AgingAnalysisPage Component
 * 
 * Displays aging analysis of exceptions with buckets and visualizations.
 * Helps identify backlog and prioritize work.
 */
export const AgingAnalysisPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: agingData, isLoading } = useQuery({
    queryKey: ['exception-aging'],
    queryFn: () => exceptionsService.getAgingAnalysis()
  });

  const { data: statistics } = useQuery({
    queryKey: ['exception-statistics'],
    queryFn: () => exceptionsService.getStatistics()
  });

  const chartData = agingData?.map(bucket => ({
    name: bucket.label,
    count: bucket.count,
    percentage: bucket.percentage
  })) || [];

  const getBucketColor = (label: string): string => {
    if (label.includes('0-3')) return 'bg-green-100 text-green-800 border-green-300';
    if (label.includes('4-7')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (label.includes('8-14')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (label.includes('15-30')) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading aging analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Aging Analysis</h1>
        <p className="text-muted-foreground mt-1">
          Track exception age distribution and identify backlog issues
        </p>
      </div>

      {/* Key Metrics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Average Age
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statistics.averageAge.toFixed(1)}</div>
              <p className="text-sm text-muted-foreground mt-1">days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Avg Resolution Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {statistics.averageResolutionTime.toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Total Open
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statistics.openExceptions}</div>
              <p className="text-sm text-muted-foreground mt-1">exceptions</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Aging Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Age Distribution</CardTitle>
          <CardDescription>Exception count by age bucket</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Aging Buckets Detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agingData?.map((bucket) => (
          <Card key={bucket.label} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{bucket.label}</CardTitle>
                <Badge variant="outline" className={getBucketColor(bucket.label)}>
                  {bucket.percentage.toFixed(1)}%
                </Badge>
              </div>
              <CardDescription>
                {bucket.range.min === 0 
                  ? `Less than ${bucket.range.max + 1} days`
                  : bucket.range.max === 999
                  ? `More than ${bucket.range.min} days`
                  : `${bucket.range.min}-${bucket.range.max} days`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-3xl font-bold">{bucket.count}</div>
                  <p className="text-sm text-muted-foreground mt-1">exceptions</p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    navigate(`/exceptions?ageMin=${bucket.range.min}&ageMax=${bucket.range.max}`);
                  }}
                >
                  View Exceptions
                </Button>

                {bucket.exceptions.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Recent Examples:</p>
                    <div className="space-y-2">
                      {bucket.exceptions.slice(0, 3).map(ex => (
                        <div
                          key={ex.id}
                          className="text-xs p-2 rounded bg-muted cursor-pointer hover:bg-muted/80"
                          onClick={() => navigate(`/exceptions/${ex.id}`)}
                        >
                          <div className="font-mono">{ex.exceptionNumber}</div>
                          <div className="truncate mt-1">{ex.title}</div>
                          <div className="text-muted-foreground mt-1">
                            {ex.ageInDays} days old
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
