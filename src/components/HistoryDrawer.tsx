import { useState, useMemo } from 'react';
import { X, Download, Search } from 'lucide-react';
import { CravingLog } from '@/types/craving';

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  logs: CravingLog[];
  onRemove: (id: string) => void;
}

function formatDateHeading(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Kolkata' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
}

function intensityColor(v: number) {
  if (v <= 4) return { bg: 'bg-success-light', text: 'text-success' };
  if (v <= 7) return { bg: 'bg-warning-light', text: 'text-warning' };
  return { bg: 'bg-alert-light', text: 'text-alert' };
}

const HistoryDrawer = ({ open, onClose, logs, onRemove }: HistoryDrawerProps) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return logs;
    const q = search.toLowerCase();
    return logs.filter(l =>
      l.factors.some(f => f.toLowerCase().includes(q)) ||
      l.location.toLowerCase().includes(q) ||
      l.notes.toLowerCase().includes(q) ||
      l.mood.toLowerCase().includes(q)
    );
  }, [logs, search]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, CravingLog[]>();
    filtered.forEach(l => {
      const key = formatDateHeading(l.timestamp);
      const arr = map.get(key) || [];
      arr.push(l);
      map.set(key, arr);
    });
    return map;
  }, [filtered]);

  // 7-day chart data
  const chartData = useMemo(() => {
    const days: { label: string; avg: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const dayLogs = logs.filter(l => new Date(l.timestamp).toDateString() === key);
      const avg = dayLogs.length > 0 ? dayLogs.reduce((s, l) => s + l.intensity, 0) / dayLogs.length : 0;
      days.push({ label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), avg });
    }
    return days;
  }, [logs]);

  // 7-day stats
  const sevenDayLogs = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return logs.filter(l => new Date(l.timestamp) >= cutoff);
  }, [logs]);

  const sevenDayAvg = sevenDayLogs.length > 0
    ? (sevenDayLogs.reduce((s, l) => s + l.intensity, 0) / sevenDayLogs.length).toFixed(1)
    : '—';
  const sevenDayRestraint = sevenDayLogs.length > 0
    ? Math.round((sevenDayLogs.filter(l => l.outcome === 'not_acted').length / sevenDayLogs.length) * 100)
    : 0;

  // Hourly distribution
  const hourlyData = useMemo(() => {
    const counts = new Array(24).fill(0);
    logs.forEach(l => {
      const h = new Date(l.timestamp).getHours();
      counts[h]++;
    });
    const max = Math.max(...counts, 1);
    return counts.map(c => c / max);
  }, [logs]);

  const maxVal = Math.max(...chartData.map(d => d.avg), 1);
  const chartW = 300;
  const chartH = 120;
  const padL = 30;
  const padR = 10;
  const padT = 10;
  const padB = 20;
  const usableW = chartW - padL - padR;
  const usableH = chartH - padT - padB;

  const points = chartData.map((d, i) => {
    const x = padL + (i / 6) * usableW;
    const y = padT + usableH - (d.avg / Math.max(maxVal, 10)) * usableH;
    return { x, y };
  });
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  const handleExport = () => {
    const csv = ['id,timestamp,intensity,factors,location,mood,outcome,quantity,copingMethods,notes'];
    logs.forEach(l => {
      csv.push([l.id, l.timestamp, l.intensity, `"${l.factors.join(';')}"`, l.location, l.mood, l.outcome, l.quantity ?? '', `"${(l.copingMethods || []).join(';')}"`, `"${l.notes}"`].join(','));
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'craving-records.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-text/30" onClick={onClose} />
      <div className="relative w-full max-w-[430px] h-[90vh] bg-background rounded-t-2xl overflow-hidden animate-slide-up-fade flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3">
          <h2 className="font-heading text-base font-semibold text-text">Craving Records</h2>
          <button onClick={onClose} className="p-1">
            <X size={22} className="text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-4">
          {/* Chart */}
          <div className="bg-surface rounded-2xl p-4 border border-border">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full">
              {/* Grid */}
              {[0, 2.5, 5, 7.5, 10].map(v => {
                const y = padT + usableH - (v / 10) * usableH;
                return (
                  <g key={v}>
                    <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="hsl(216 22% 95%)" strokeWidth={0.5} />
                    <text x={padL - 4} y={y + 3} textAnchor="end" className="fill-muted-foreground" fontSize={8} fontFamily="DM Sans">{v}</text>
                  </g>
                );
              })}
              {/* Reference line at 5 */}
              <line x1={padL} y1={padT + usableH - (5 / 10) * usableH} x2={chartW - padR} y2={padT + usableH - (5 / 10) * usableH} stroke="hsl(216 26% 89%)" strokeWidth={1} strokeDasharray="4 3" />
              {/* Line */}
              <path d={linePath} fill="none" stroke="hsl(203 92% 59%)" strokeWidth={2} />
              {/* Dots + labels */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r={3} fill="hsl(203 92% 59%)" />
                  <text x={p.x} y={chartH - 4} textAnchor="middle" className="fill-muted-foreground" fontSize={7} fontFamily="DM Sans">
                    {chartData[i].label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Stats */}
          <div className="flex gap-3">
            <div className="flex-1 bg-surface-2 border border-border rounded-xl px-3 py-2 text-center">
              <p className="font-body text-xs text-muted-foreground">7-day avg</p>
              <p className="font-heading text-lg font-bold text-primary">{sevenDayAvg}</p>
            </div>
            <div className="flex-1 bg-surface-2 border border-border rounded-xl px-3 py-2 text-center">
              <p className="font-body text-xs text-muted-foreground">Restraint rate</p>
              <p className="font-heading text-lg font-bold text-primary">{sevenDayRestraint}%</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search entries..."
              className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2.5 font-body text-sm text-text placeholder:text-muted-foreground focus:border-primary focus:bg-surface outline-none"
            />
          </div>

          {/* Log list */}
          {Array.from(grouped.entries()).map(([date, entries]) => (
            <div key={date} className="space-y-2">
              <p className="font-body text-[13px] text-muted-foreground">{date}</p>
              {entries.map(log => {
                const ic = intensityColor(log.intensity);
                return (
                  <div key={log.id} className="bg-surface border border-border rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-body text-xs text-muted-foreground">{formatTime(log.timestamp)}</span>
                        <span className={`font-body text-xs px-2 py-0.5 rounded-lg font-medium ${ic.bg} ${ic.text}`}>
                          {log.intensity}/10
                        </span>
                      </div>
                      <span className={`font-body text-xs px-2 py-0.5 rounded-lg font-medium ${log.outcome === 'not_acted' ? 'bg-success-light text-success' : 'bg-alert-light text-alert'}`}>
                        {log.outcome === 'not_acted' ? 'Not acted on' : 'Smoked'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {log.factors.map(f => (
                        <span key={f} className="font-body text-[11px] text-muted-foreground bg-surface-2 px-1.5 py-0.5 rounded">{f}</span>
                      ))}
                    </div>
                    {log.notes && <p className="font-body text-xs text-body">{log.notes}</p>}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Hourly distribution */}
          {logs.length > 0 && (
            <div className="space-y-2">
              <p className="font-body text-xs text-muted-foreground">Peak hours</p>
              <div className="grid grid-cols-24 gap-[2px]" style={{ gridTemplateColumns: 'repeat(24, 1fr)' }}>
                {hourlyData.map((v, i) => (
                  <div
                    key={i}
                    className="h-6 rounded-sm transition-colors"
                    style={{
                      backgroundColor: v > 0
                        ? `hsl(203 92% ${59 + (1 - v) * 38}%)`
                        : 'hsl(210 27% 96%)',
                    }}
                    title={`${i}:00 — ${Math.round(v * 100)}%`}
                  />
                ))}
              </div>
              <div className="flex justify-between">
                {['12AM', '6AM', '12PM', '6PM'].map(t => (
                  <span key={t} className="font-body text-[10px] text-muted-foreground">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Export */}
          <button
            onClick={handleExport}
            className="w-full h-12 border border-primary bg-primary-light text-primary-dark font-heading text-sm font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryDrawer;
