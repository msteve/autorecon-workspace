import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ruleService } from '@/services/ruleService';
import { Plus, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RuleEngineListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['rules', page],
    queryFn: () => ruleService.getRules(page, 10),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rule Engine</h1>
          <p className="text-muted-foreground">Manage reconciliation and validation rules</p>
        </div>
        <Button onClick={() => navigate('/rules/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Rule
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rules</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : (
            <div className="space-y-4">
              {data?.items.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-semibold">{rule.name}</h3>
                      <Badge variant={rule.is_active ? 'success' : 'outline'}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{rule.rule_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Priority: {rule.priority} | Created: {new Date(rule.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" title={rule.is_active ? 'Deactivate' : 'Activate'}>
                      {rule.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/rules/${rule.id}/edit`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

export default RuleEngineListPage;
