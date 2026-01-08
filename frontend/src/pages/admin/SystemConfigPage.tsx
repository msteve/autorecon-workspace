import { Card } from '@/components/ui/card';

const SystemConfigPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">System Configuration</h1>
      <Card className="p-6">
        <p className="text-muted-foreground">System settings and configuration will be displayed here</p>
      </Card>
    </div>
  );
};

export default SystemConfigPage;
