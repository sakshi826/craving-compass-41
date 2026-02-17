import { CravingLog } from '@/types/craving';

interface TodaySnapshotProps {
  todayLogs: CravingLog[];
}

const TodaySnapshot = ({ todayLogs }: TodaySnapshotProps) => {
  const total = todayLogs.length;
  const notActed = todayLogs.filter(l => l.outcome === 'not_acted').length;
  const smoked = todayLogs.filter(l => l.outcome === 'smoked').length;
  const avgIntensity = total > 0 ? (todayLogs.reduce((s, l) => s + l.intensity, 0) / total).toFixed(1) : '—';
  const restraintRate = total > 0 ? Math.round((notActed / total) * 100) : 0;

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-card space-y-4">
      <h2 className="font-heading text-[15px] font-semibold text-text">Today</h2>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Logged', value: total },
          { label: 'Avg intensity', value: `${avgIntensity}/10` },
          { label: 'Not acted on', value: notActed },
          { label: 'Smoked', value: smoked },
        ].map(stat => (
          <div key={stat.label} className="bg-surface-2 rounded-xl p-3">
            <p className="font-body text-xs text-muted-foreground">{stat.label}</p>
            <p className="font-heading text-[26px] font-bold text-primary mt-0.5">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <div className="w-full h-1.5 bg-border-light rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${restraintRate}%` }}
          />
        </div>
        <p className="font-body text-xs text-muted-foreground">
          Restraint rate: {total > 0 ? `${restraintRate}%` : '—'} today
        </p>
      </div>
    </div>
  );
};

export default TodaySnapshot;
