import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { toast } from '@/hooks/use-toast';

const MFAPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const sessionId = location.state?.sessionId;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) {
      navigate('/auth/login');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyMFA({ code, session_id: sessionId });
      setToken(response.access_token);
      setUser(response.user);
      toast({
        title: 'Verification Successful',
        description: 'You have been authenticated.',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: 'Invalid or expired code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Authentication Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              className="text-center text-2xl tracking-widest"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => navigate('/auth/login')}
          >
            Back to Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MFAPage;
