import { Activity, BarChart2 } from 'lucide-react';

interface TopBarProps {
  onHistoryOpen: () => void;
}

const TopBar = ({ onHistoryOpen }: TopBarProps) => {
  return (
    <header className="sticky top-0 z-50 h-14 bg-surface border-b border-border-light shadow-topbar flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Activity size={18} className="text-primary" />
        <span className="font-heading text-[17px] font-bold text-text">Craving Tracker</span>
      </div>
      <button onClick={onHistoryOpen} className="p-2 -mr-2 active:scale-95 transition-transform">
        <BarChart2 size={20} className="text-primary" />
      </button>
    </header>
  );
};

export default TopBar;
