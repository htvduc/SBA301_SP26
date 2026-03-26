import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { ConnectionStatus } from '@/types/dto/notification.dto';

interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
}

export function ConnectionStatusIndicator({ status }: ConnectionStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle2,
          color: 'text-green-500',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          label: 'Connected',
          description: 'Real-time notifications active'
        };
      case 'disconnected':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          label: 'Disconnected',
          description: 'Unable to receive real-time notifications'
        };
      case 'reconnecting':
        return {
          icon: Loader2,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          label: 'Reconnecting',
          description: 'Attempting to restore connection...'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="group relative inline-flex items-center">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor}`}>
        <Icon 
          className={`h-4 w-4 ${config.color} ${status === 'reconnecting' ? 'animate-spin' : ''}`}
        />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.label}
        </span>
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
        <div className="font-medium">{config.label}</div>
        <div className="text-gray-300 dark:text-gray-400">{config.description}</div>
        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
          <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
        </div>
      </div>
    </div>
  );
}
