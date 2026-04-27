import { AlertTriangle, Lightbulb, Sparkles } from 'lucide-react';
import { cn } from '../../utils/helpers';

type Severity = 'high' | 'medium' | 'info' | 'success';

interface WarningCalloutProps {
  severity: Severity;
  title: string;
  body: string;
  suggestion?: string;
  className?: string;
}

const STYLES: Record<Severity, { border: string; bg: string; text: string; icon: React.ReactNode }> = {
  high: {
    border: 'border-l-amber',
    bg: 'bg-amber/5',
    text: 'text-amber',
    icon: <AlertTriangle size={16} />,
  },
  medium: {
    border: 'border-l-amber-light',
    bg: 'bg-amber-light/5',
    text: 'text-amber-light',
    icon: <AlertTriangle size={16} />,
  },
  info: {
    border: 'border-l-stone',
    bg: 'bg-stone-light/10',
    text: 'text-stone-dark',
    icon: <Lightbulb size={16} />,
  },
  success: {
    border: 'border-l-sage',
    bg: 'bg-sage/5',
    text: 'text-sage-dark',
    icon: <Sparkles size={16} />,
  },
};

export function WarningCallout({
  severity,
  title,
  body,
  suggestion,
  className,
}: WarningCalloutProps) {
  const s = STYLES[severity];

  return (
    <div
      className={cn(
        'flex gap-3 rounded-r-xl border-l-2 p-4',
        s.border,
        s.bg,
        className,
      )}
      role={severity === 'high' || severity === 'medium' ? 'alert' : undefined}
    >
      <div className={cn('shrink-0 mt-0.5', s.text)}>{s.icon}</div>
      <div className="min-w-0 flex-1">
        <p className={cn('font-medium text-sm leading-snug', s.text)}>
          {title}
        </p>
        <p className="mt-1 text-sm text-charcoal leading-relaxed">{body}</p>
        {suggestion && (
          <p className="mt-2 text-xs italic text-stone">
            <span className="font-medium not-italic">Suggestion:</span> {suggestion}
          </p>
        )}
      </div>
    </div>
  );
}
