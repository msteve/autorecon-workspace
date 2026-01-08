import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

export interface RetryButtonProps {
  onRetry: () => Promise<void>;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationDescription?: string;
  className?: string;
  children?: React.ReactNode;
}

export const RetryButton = ({
  onRetry,
  disabled = false,
  size = 'default',
  variant = 'outline',
  showConfirmation = true,
  confirmationTitle = 'Retry Job?',
  confirmationDescription = 'This will restart the job from the beginning. Any previous processing will be discarded.',
  className,
  children,
}: RetryButtonProps) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleClick = () => {
    if (showConfirmation) {
      setIsDialogOpen(true);
    } else {
      handleRetry();
    }
  };

  const buttonContent = (
    <>
      {isRetrying ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <RotateCw className="mr-2 h-4 w-4" />
      )}
      {children || (isRetrying ? 'Retrying...' : 'Retry')}
    </>
  );

  if (showConfirmation) {
    return (
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={disabled || isRetrying}
            className={cn(className)}
          >
            {buttonContent}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmationTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRetrying}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleRetry();
              }}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RotateCw className="mr-2 h-4 w-4" />
                  Retry Job
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRetry}
      disabled={disabled || isRetrying}
      className={cn(className)}
    >
      {buttonContent}
    </Button>
  );
};
