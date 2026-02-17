import { useState, useEffect, useRef, useCallback } from 'react';

const PROMPTS = [
  'Observe the sensation without engaging with it.',
  'Breathe: 4 counts in, hold 4, 4 counts out.',
  'Cravings diminish on their own within minutes.',
];

const TOTAL_SECONDS = 300; // 5 min

const UrgeTimer = () => {
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [complete, setComplete] = useState(false);
  const [promptIdx, setPromptIdx] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const promptRef = useRef<number | null>(null);

  const start = useCallback(() => {
    setRunning(true);
    setComplete(false);
    setSecondsLeft(TOTAL_SECONDS);
    setPromptIdx(0);
  }, []);

  useEffect(() => {
    if (!running || complete) return;
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          setComplete(true);
          setRunning(false);
          if (navigator.vibrate) navigator.vibrate([200]);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    promptRef.current = window.setInterval(() => {
      setPromptIdx(prev => (prev + 1) % PROMPTS.length);
    }, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (promptRef.current) clearInterval(promptRef.current);
    };
  }, [running, complete]);

  const progress = 1 - secondsLeft / TOTAL_SECONDS;
  const radius = 47;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  const strokeColor = complete ? 'hsl(157 87% 34%)' : 'hsl(203 92% 59%)';

  return (
    <>
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-card space-y-4">
        <h2 className="font-heading text-[15px] font-semibold text-text">Urge Interval Timer</h2>
        <p className="font-body text-[13px] text-muted-foreground">
          Most cravings subside within 3–5 minutes. Observe without acting.
        </p>

        {!running && !complete && (
          <button
            onClick={start}
            className="w-full h-12 border border-primary bg-primary-light text-primary-dark font-heading text-sm font-semibold rounded-xl active:scale-[0.97] transition-transform"
          >
            Start 5-Minute Timer
          </button>
        )}

        {(running || complete) && (
          <div className="flex flex-col items-center gap-3 py-2">
            <svg width={110} height={110} className="rotate-[-90deg]">
              <circle cx={55} cy={55} r={radius} fill="none" stroke="hsl(216 22% 95%)" strokeWidth={8} />
              <circle
                cx={55} cy={55} r={radius} fill="none"
                stroke={strokeColor}
                strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="-mt-[82px] mb-[18px]">
              {complete ? (
                <span className="font-heading text-base font-semibold text-success">Complete.</span>
              ) : (
                <span className="font-heading text-[30px] font-bold text-text">{mm}:{ss}</span>
              )}
            </div>
            {running && (
              <p className="font-body text-[13px] text-muted-foreground text-center animate-fade-in max-w-[250px]">
                {PROMPTS[promptIdx]}
              </p>
            )}
            {complete && (
              <button
                onClick={start}
                className="font-body text-sm text-primary mt-1"
              >
                Restart
              </button>
            )}
          </div>
        )}
      </div>

      {showToast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] bg-surface border border-border rounded-xl shadow-toast px-5 py-3 font-body text-sm text-text animate-slide-up-fade">
          Timer complete.
        </div>
      )}
    </>
  );
};

export default UrgeTimer;
