import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';

const GLJournalDetailPage = () => {
  const { journalId } = useParams();
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">GL Journal Detail</h1>
      <Card className="p-6">
        <p className="text-muted-foreground">Journal ID: {journalId}</p>
      </Card>
    </div>
  );
};

export default GLJournalDetailPage;
