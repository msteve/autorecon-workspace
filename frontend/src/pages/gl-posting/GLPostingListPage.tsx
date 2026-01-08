import { Card } from '@/components/ui/card';

const GLPostingListPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">GL Posting</h1>
      <Card className="p-6">
        <p className="text-muted-foreground">GL journal entries list will be displayed here</p>
      </Card>
    </div>
  );
};

export default GLPostingListPage;
