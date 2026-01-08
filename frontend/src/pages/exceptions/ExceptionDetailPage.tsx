import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ExceptionDetailPage = () => {
  const { exceptionId } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exception Detail</h1>
        <p className="text-muted-foreground">Exception ID: {exceptionId}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Payment Amount Mismatch</CardTitle>
              <Badge variant="destructive">Critical</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold">Description</h3>
              <p className="text-sm text-muted-foreground">
                Source and target payment amounts do not match. Difference of $150.00 detected.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-1 text-sm font-medium">Source Amount</h4>
                <p className="text-lg font-semibold">$1,250.00</p>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-medium">Target Amount</h4>
                <p className="text-lg font-semibold">$1,100.00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full">Resolve Exception</Button>
            <Button variant="outline" className="w-full">Assign to User</Button>
            <Button variant="outline" className="w-full">Add Comment</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExceptionDetailPage;
