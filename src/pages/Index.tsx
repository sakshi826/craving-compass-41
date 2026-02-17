import { useState } from 'react';
import TopBar from '@/components/TopBar';
import LogCard from '@/components/LogCard';
import UrgeTimer from '@/components/UrgeTimer';
import TodaySnapshot from '@/components/TodaySnapshot';
import RecentEntries from '@/components/RecentEntries';
import HistoryDrawer from '@/components/HistoryDrawer';
import { useCravingLogs } from '@/hooks/useCravingLogs';

const Index = () => {
  const { logs, addLog, removeLog, todayLogs } = useCravingLogs();
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <TopBar onHistoryOpen={() => setHistoryOpen(true)} />

      <main className="max-w-[430px] mx-auto px-4 py-4 pb-20 space-y-3">
        <LogCard onSave={addLog} />
        <UrgeTimer />
        <TodaySnapshot todayLogs={todayLogs} />
        <RecentEntries logs={logs} onRemove={removeLog} onViewAll={() => setHistoryOpen(true)} />
      </main>

      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} logs={logs} onRemove={removeLog} />
    </div>
  );
};

export default Index;
