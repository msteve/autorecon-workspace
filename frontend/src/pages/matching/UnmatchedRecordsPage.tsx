import { Card } from '@/components/ui/card';

const UnmatchedRecordsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Unmatched Records</h1>
      <Card className="p-6">
        <p className="text-muted-foreground">Unmatched records table will be displayed here</p>
      </Card>
    </div>
  );
};

export default UnmatchedRecordsPage;
