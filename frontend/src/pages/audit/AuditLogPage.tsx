import { Card } from '@/components/ui/card';

const AuditLogPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Audit Log</h1>
      <Card className="p-6">
        <p className="text-muted-foreground">System audit trail and activity log will be displayed here</p>
      </Card>
    </div>
  );
};

export default AuditLogPage;
