import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, TrendingUp, AlertCircle, CheckCircle2, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { exceptionsService, ExceptionsFilters } from '@/services/exceptionsService';
import { ExceptionCard } from '@/components/exceptions';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

/**
 * AssignmentRoutingPage Component
 * 
 * Team workload management and exception routing interface.
 * Displays team capacity, utilization, and enables bulk assignment.
 */
export const AssignmentRoutingPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedExceptions, setSelectedExceptions] = useState<string[]>([]);

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['team-assignments'],
    queryFn: () => exceptionsService.getTeamAssignments()
  });

  const { data: unassignedData } = useQuery({
    queryKey: ['unassigned-exceptions', selectedTeam],
    queryFn: () => {
      const filters: ExceptionsFilters = { assignedTo: 'unassigned' };
      if (selectedTeam !== 'all') {
        filters.teamId = selectedTeam;
      }
      return exceptionsService.getExceptions(filters, { page: 1, pageSize: 20 });
    }
  });

  const assignMutation = useMutation({
    mutationFn: async ({ exceptionId, userId, userName }: { 
      exceptionId: string; 
      userId: string; 
      userName: string 
    }) => {
      return exceptionsService.assignException(exceptionId, userId, userName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unassigned-exceptions'] });
      queryClient.invalidateQueries({ queryKey: ['team-assignments'] });
      toast.success('Exception assigned successfully');
    }
  });

  const bulkAssignMutation = useMutation({
    mutationFn: async ({ userId, userName }: { userId: string; userName: string }) => {
      const promises = selectedExceptions.map(id =>
        exceptionsService.assignException(id, userId, userName)
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unassigned-exceptions'] });
      queryClient.invalidateQueries({ queryKey: ['team-assignments'] });
      setSelectedExceptions([]);
      toast.success(`${selectedExceptions.length} exceptions assigned successfully`);
    }
  });

  const handleBulkAssign = (userId: string, userName: string) => {
    if (selectedExceptions.length === 0) {
      toast.error('Please select exceptions to assign');
      return;
    }
    bulkAssignMutation.mutate({ userId, userName });
  };

  const toggleExceptionSelection = (exceptionId: string) => {
    setSelectedExceptions(prev =>
      prev.includes(exceptionId)
        ? prev.filter(id => id !== exceptionId)
        : [...prev, exceptionId]
    );
  };

  const getUtilizationColor = (rate: number): string => {
    if (rate >= 90) return 'text-red-600';
    if (rate >= 70) return 'text-orange-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (teamsLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading team assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Assignment & Routing</h1>
        <p className="text-muted-foreground mt-1">
          Manage team workload and route exceptions efficiently
        </p>
      </div>

      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {teams?.map((team) => (
          <Card key={team.teamId}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{team.teamName}</CardTitle>
                  <CardDescription>{team.memberCount} members</CardDescription>
                </div>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Utilization</span>
                  <span className={`text-sm font-bold ${getUtilizationColor(team.utilizationRate)}`}>
                    {team.utilizationRate.toFixed(0)}%
                  </span>
                </div>
                <Progress value={team.utilizationRate} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold">{team.activeExceptions}</div>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div>
                  <div className="text-2xl font-bold">{team.capacity}</div>
                  <p className="text-xs text-muted-foreground">Capacity</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setSelectedTeam(team.teamId)}
              >
                View Workload
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bulk Assignment */}
      {selectedExceptions.length > 0 && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-base">
              Bulk Assignment ({selectedExceptions.length} selected)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Select
                onValueChange={(userId) => {
                  const userName = `User ${userId}`;
                  handleBulkAssign(userId, userName);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select assignee..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user1">John Doe</SelectItem>
                  <SelectItem value="user2">Jane Smith</SelectItem>
                  <SelectItem value="user3">Bob Johnson</SelectItem>
                  <SelectItem value="user4">Alice Williams</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setSelectedExceptions([])}
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unassigned Exceptions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Unassigned Exceptions</CardTitle>
              <CardDescription>
                {unassignedData?.total || 0} exceptions awaiting assignment
              </CardDescription>
            </div>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams?.map(team => (
                  <SelectItem key={team.teamId} value={team.teamId}>
                    {team.teamName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {!unassignedData || unassignedData.data.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-600 opacity-50" />
              <p className="text-muted-foreground">No unassigned exceptions</p>
              <p className="text-sm text-muted-foreground mt-1">All exceptions have been assigned</p>
            </div>
          ) : (
            <div className="space-y-4">
              {unassignedData.data.map(exception => (
                <div key={exception.id} className="flex gap-3 items-start">
                  <input
                    type="checkbox"
                    checked={selectedExceptions.includes(exception.id)}
                    onChange={() => toggleExceptionSelection(exception.id)}
                    className="mt-4"
                  />
                  <div className="flex-1">
                    <ExceptionCard
                      exception={exception}
                      onClick={() => navigate(`/exceptions/${exception.id}`)}
                      onAssign={(id) => {
                        // Show assignment dialog
                        console.log('Assign:', id);
                      }}
                      showActions
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
