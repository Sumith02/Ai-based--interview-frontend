'use client';

import { useEffect, useState } from 'react';
import { checkHealth } from '@/lib/api';

type Status = 'checking' | 'connected' | 'offline';

export default function ConnectionStatus() {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    const ping = async () => {
      try {
        await checkHealth();
        setStatus('connected');
      } catch {
        setStatus('offline');
      }
    };

    ping();
    const id = setInterval(ping, 10_000);
    return () => clearInterval(id);
  }, []);

  const styles: Record<Status, { dot: string; tag: string; label: string }> = {
    checking:  {
      dot:   'bg-warn animate-pulse',
      tag:   'text-warn/80 border-warn/20 bg-warn/8',
      label: 'Connecting…',
    },
    connected: {
      dot:   'bg-success',
      tag:   'text-success/80 border-success/20 bg-success/8',
      label: 'API connected',
    },
    offline:   {
      dot:   'bg-danger',
      tag:   'text-danger/80 border-danger/20 bg-danger/8',
      label: 'Backend offline',
    },
  };

  const s = styles[status];

  return (
    <div className="flex items-center gap-2">
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      <span className={`tag ${s.tag}`}>{s.label}</span>
    </div>
  );
}
