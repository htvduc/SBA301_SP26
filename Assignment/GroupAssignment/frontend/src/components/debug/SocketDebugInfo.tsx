import { useEffect, useState } from 'react';
import { getSocketConfig, isDevelopment } from '@/config/socket.config';

/**
 * Debug component to display WebSocket connection info
 * Only visible in development mode
 */
export function SocketDebugInfo() {
  const [config, setConfig] = useState(getSocketConfig());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (!isDevelopment()) return;

    // Toggle visibility with Ctrl+Shift+D
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!isDevelopment() || !isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-lg text-xs font-mono z-50 max-w-md">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm">WebSocket Debug Info</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      <div className="space-y-1">
        <div>
          <span className="text-gray-400">URL:</span>{' '}
          <span className="text-green-400">{config.url}</span>
        </div>
        <div>
          <span className="text-gray-400">Transports:</span>{' '}
          <span className="text-blue-400">{config.options.transports.join(', ')}</span>
        </div>
        <div>
          <span className="text-gray-400">Auto Connect:</span>{' '}
          <span className={config.options.autoConnect ? 'text-green-400' : 'text-red-400'}>
            {config.options.autoConnect ? 'Yes' : 'No'}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Environment:</span>{' '}
          <span className="text-yellow-400">{import.meta.env.MODE}</span>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-700 text-gray-400 text-[10px]">
        Press Ctrl+Shift+D to toggle
      </div>
    </div>
  );
}
