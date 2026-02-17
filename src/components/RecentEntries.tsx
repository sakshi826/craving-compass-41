import { useState, useRef } from 'react';
import { CravingLog } from '@/types/craving';

interface RecentEntriesProps {
  logs: CravingLog[];
  onRemove: (id: string) => void;
  onViewAll: () => void;
}

function formatTimeShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
}

function intensityBadge(v: number) {
  if (v <= 4) return { bg: 'bg-success-light', text: 'text-success' };
  if (v <= 7) return { bg: 'bg-warning-light', text: 'text-warning' };
  return { bg: 'bg-alert-light', text: 'text-alert' };
}

function outcomeBadge(o: string) {
  if (o === 'not_acted') return { bg: 'bg-success-light', text: 'text-success', label: 'Not acted on' };
  return { bg: 'bg-alert-light', text: 'text-alert', label: 'Smoked' };
}

const SwipeEntry = ({ log, onRemove }: { log: CravingLog; onRemove: () => void }) => {
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const swiping = useRef(false);

  const handleStart = (x: number) => { startX.current = x; swiping.current = true; };
  const handleMove = (x: number) => {
    if (!swiping.current) return;
    const dx = x - startX.current;
    if (dx < 0) setOffset(Math.max(dx, -80));
  };
  const handleEnd = () => {
    swiping.current = false;
    if (offset < -50) onRemove();
    else setOffset(0);
  };

  const iBadge = intensityBadge(log.intensity);
  const oBadge = outcomeBadge(log.outcome);

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-alert flex items-center justify-center rounded-r-xl">
        <span className="font-body text-xs text-primary-foreground font-medium">Remove</span>
      </div>
      <div
        className="relative bg-surface border border-border rounded-xl p-3 px-4 space-y-2 transition-transform"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={e => handleStart(e.touches[0].clientX)}
        onTouchMove={e => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
        onMouseDown={e => handleStart(e.clientX)}
        onMouseMove={e => { if (swiping.current) handleMove(e.clientX); }}
        onMouseUp={handleEnd}
        onMouseLeave={() => { if (swiping.current) handleEnd(); }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-body text-xs text-muted-foreground bg-surface-2 px-2 py-0.5 rounded-lg">
              {formatTimeShort(log.timestamp)}
            </span>
            <span className={`font-body text-xs px-2 py-0.5 rounded-lg font-medium ${iBadge.bg} ${iBadge.text}`}>
              {log.intensity}/10
            </span>
          </div>
          <span className={`font-body text-xs px-2 py-0.5 rounded-lg font-medium ${oBadge.bg} ${oBadge.text}`}>
            {oBadge.label}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {log.factors.map(f => (
            <span key={f} className="font-body text-[12px] text-muted-foreground bg-surface border border-border px-2 py-0.5 rounded-lg">{f}</span>
          ))}
          {log.location && (
            <span className="font-body text-[12px] text-muted-foreground bg-surface border border-border px-2 py-0.5 rounded-lg">{log.location}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const RecentEntries = ({ logs, onRemove, onViewAll }: RecentEntriesProps) => {
  const recent = logs.slice(0, 5);

  if (recent.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-heading text-sm font-bold text-muted-foreground">Recent Entries</h3>
      <div className="space-y-2">
        {recent.map(log => (
          <SwipeEntry key={log.id} log={log} onRemove={() => onRemove(log.id)} />
        ))}
      </div>
      {logs.length > 5 && (
        <button onClick={onViewAll} className="font-body text-sm text-primary">
          View all
        </button>
      )}
    </div>
  );
};

export default RecentEntries;
