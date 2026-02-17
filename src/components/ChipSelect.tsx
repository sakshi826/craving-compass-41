interface ChipSelectProps {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  multi?: boolean;
}

const ChipSelect = ({ options, selected, onToggle, multi = true }: ChipSelectProps) => {
  const handleClick = (opt: string) => {
    if (!multi) {
      onToggle(opt);
    } else {
      onToggle(opt);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const isSelected = selected.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => handleClick(opt)}
            className={`min-h-[36px] px-3.5 py-[7px] rounded-[20px] font-body text-[13px] border transition-all duration-150
              ${isSelected
                ? 'bg-primary-light border-primary text-primary-dark font-medium'
                : 'bg-surface border-border text-muted-foreground'
              }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
};

export default ChipSelect;
