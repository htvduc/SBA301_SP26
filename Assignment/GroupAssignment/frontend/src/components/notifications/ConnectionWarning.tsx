import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ConnectionWarningProps {
  isVisible: boolean;
  retryCountdown?: number;
}

export const ConnectionWarning: React.FC<ConnectionWarningProps> = ({ 
  isVisible, 
  retryCountdown 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <Alert variant="destructive" className="shadow-lg">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Connection Lost</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>Unable to reach notification server</span>
          {retryCountdown !== undefined && (
            <span className="flex items-center gap-2 text-sm">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Retrying in {retryCountdown}s
            </span>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};
