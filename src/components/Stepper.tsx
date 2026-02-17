import { Minus, Plus } from 'lucide-react';

interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}

const Stepper = ({ value, min = 1, max = 20, onChange }: StepperProps) => {
  return (
    <div className="flex items-center justify-center gap-6">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center active:scale-95 transition-transform"
      >
        <Minus size={18} className="text-primary" />
      </button>
      <span className="font-heading text-[32px] font-bold text-primary min-w-[48px] text-center">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus size={18} className="text-primary" />
      </button>
    </div>
  );
};

export default Stepper;
