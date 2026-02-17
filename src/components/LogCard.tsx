import { useState, useMemo } from 'react';
import ChipSelect from './ChipSelect';
import Stepper from './Stepper';
import { CravingLog } from '@/types/craving';

const FACTORS = ['Work stress', 'Deadline', 'Boredom', 'After meal', 'Tea/coffee', 'Smell of smoke', 'Seeing others smoke', 'Fatigue', 'Interpersonal tension', 'Social context', 'Habit', 'Other'];
const LOCATIONS = ['Home', 'Workplace', 'Commute', 'Outdoors', 'Social setting', 'Other'];
const MOODS = [
  { emoji: '😣', label: 'Very Low' },
  { emoji: '😟', label: 'Low' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😄', label: 'High' },
];
const COPING = ['Controlled breathing', 'Drank water', 'Distraction', 'Brief walk', 'Called someone', 'Waited it out', 'NRT used', 'Other'];

function getIntensityLabel(v: number): string {
  if (v <= 2) return 'Minimal';
  if (v <= 4) return 'Noticeable';
  if (v <= 6) return 'Moderate';
  if (v <= 8) return 'High';
  return 'Severe';
}

function formatTimeIST(date: Date): string {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
}

function formatDateIST(date: Date): string {
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Kolkata' });
}

interface LogCardProps {
  onSave: (log: CravingLog) => void;
}

const LogCard = ({ onSave }: LogCardProps) => {
  const [intensity, setIntensity] = useState(5);
  const [factors, setFactors] = useState<string[]>([]);
  const [location, setLocation] = useState<string[]>([]);
  const [mood, setMood] = useState('');
  const [outcome, setOutcome] = useState<'not_acted' | 'smoked' | ''>('');
  const [quantity, setQuantity] = useState(1);
  const [copingMethods, setCopingMethods] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [timestamp, setTimestamp] = useState(new Date());
  const [editingTime, setEditingTime] = useState(false);
  const [showToast, setShowToast] = useState('');

  const intensityLabel = useMemo(() => getIntensityLabel(intensity), [intensity]);

  const toggleFactor = (f: string) => setFactors(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  const toggleLocation = (l: string) => setLocation(prev => prev.includes(l) ? [l] : [l]);
  const toggleCoping = (c: string) => setCopingMethods(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const handleSave = () => {
    if (!outcome) return;
    const log: CravingLog = {
      id: crypto.randomUUID(),
      timestamp: timestamp.toISOString(),
      intensity,
      factors,
      location: location[0] || '',
      mood,
      outcome,
      quantity: outcome === 'smoked' ? quantity : undefined,
      copingMethods: outcome === 'not_acted' ? copingMethods : undefined,
      notes,
    };
    onSave(log);

    // Reset
    setIntensity(5);
    setFactors([]);
    setLocation([]);
    setMood('');
    setOutcome('');
    setQuantity(1);
    setCopingMethods([]);
    setNotes('');
    setTimestamp(new Date());

    const msg = outcome === 'not_acted' ? 'Entry saved — urge not acted on.' : 'Entry saved.';
    setShowToast(msg);
    setTimeout(() => setShowToast(''), 2500);
  };

  const handleTimeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m] = e.target.value.split(':').map(Number);
    const d = new Date(timestamp);
    d.setHours(h, m);
    setTimestamp(d);
  };

  return (
    <>
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-card space-y-5">
        <h2 className="font-heading text-[15px] font-semibold text-text">Log Craving</h2>

        {/* Intensity */}
        <div className="space-y-2">
          <label className="font-body text-xs text-muted-foreground">Intensity</label>
          <input
            type="range"
            min={1}
            max={10}
            value={intensity}
            onChange={e => setIntensity(Number(e.target.value))}
            className="w-full"
            style={{
              background: `linear-gradient(to right, hsl(203 92% 59%) ${((intensity - 1) / 9) * 100}%, hsl(216 22% 95%) ${((intensity - 1) / 9) * 100}%)`,
            }}
          />
          <p className="font-body text-sm text-body animate-fade-in text-center">
            {intensity}/10 — {intensityLabel}
          </p>
        </div>

        {/* Factors */}
        <div className="space-y-2">
          <label className="font-body text-xs text-muted-foreground">Contributing factors</label>
          <ChipSelect options={FACTORS} selected={factors} onToggle={toggleFactor} />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="font-body text-xs text-muted-foreground">Location</label>
          <ChipSelect options={LOCATIONS} selected={location} onToggle={(l) => toggleLocation(l)} multi={false} />
        </div>

        {/* Mood */}
        <div className="space-y-2">
          <label className="font-body text-xs text-muted-foreground">Mood</label>
          <div className="grid grid-cols-5 gap-2">
            {MOODS.map(m => (
              <button
                key={m.label}
                onClick={() => setMood(m.label)}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all
                  ${mood === m.label
                    ? 'bg-primary-light border-2 border-primary'
                    : 'bg-surface-2 border-border'
                  }`}
              >
                <span className="text-xl leading-none">{m.emoji}</span>
                <span className="font-body text-[10px] text-body">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Outcome */}
        <div className="space-y-2">
          <label className="font-body text-xs text-muted-foreground">Outcome</label>
          <div className="grid grid-cols-2 gap-0 border border-border rounded-xl overflow-hidden">
            {(['not_acted', 'smoked'] as const).map(o => (
              <button
                key={o}
                onClick={() => setOutcome(o)}
                className={`py-3 font-body text-sm transition-all
                  ${outcome === o
                    ? 'bg-primary-light border-primary text-primary-dark font-medium'
                    : 'bg-surface-2 text-muted-foreground'
                  }`}
              >
                {o === 'not_acted' ? 'Urge not acted on' : 'Smoked'}
              </button>
            ))}
          </div>
        </div>

        {/* Conditional: Smoked → Quantity */}
        {outcome === 'smoked' && (
          <div className="space-y-2 animate-fade-in">
            <label className="font-body text-xs text-muted-foreground">Quantity</label>
            <Stepper value={quantity} onChange={setQuantity} />
          </div>
        )}

        {/* Conditional: Not acted → Coping */}
        {outcome === 'not_acted' && (
          <div className="space-y-2 animate-fade-in">
            <label className="font-body text-xs text-muted-foreground">What helped?</label>
            <ChipSelect options={COPING} selected={copingMethods} onToggle={toggleCoping} />
          </div>
        )}

        {/* Recorded at */}
        <div className="space-y-1">
          <label className="font-body text-xs text-muted-foreground">Recorded at</label>
          <div className="flex items-center gap-2">
            <span className="font-body text-sm text-body">
              {formatDateIST(timestamp)}, {formatTimeIST(timestamp)}
            </span>
            {!editingTime ? (
              <button onClick={() => setEditingTime(true)} className="font-body text-xs text-primary">
                Edit time
              </button>
            ) : (
              <input
                type="time"
                onChange={handleTimeEdit}
                onBlur={() => setEditingTime(false)}
                className="font-body text-sm bg-surface-2 border border-border rounded-lg px-2 py-1"
                autoFocus
              />
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="font-body text-xs text-muted-foreground">Notes</label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Optional note..."
            className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 font-body text-sm text-text placeholder:text-muted-foreground focus:border-primary focus:bg-surface outline-none transition-colors"
          />
        </div>

        {/* Divider + CTA */}
        <div className="border-t border-border-light pt-4">
          <button
            onClick={handleSave}
            disabled={!outcome}
            className="w-full h-[52px] bg-primary text-primary-foreground font-heading text-[15px] font-semibold rounded-[14px] active:scale-[0.97] active:bg-primary-dark transition-all duration-[120ms] disabled:opacity-40 disabled:pointer-events-none"
          >
            Save Entry
          </button>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] bg-surface border border-border rounded-xl shadow-toast px-5 py-3 font-body text-sm text-text animate-slide-up-fade">
          {showToast}
        </div>
      )}
    </>
  );
};

export default LogCard;
