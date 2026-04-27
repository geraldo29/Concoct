import { motion } from 'framer-motion';
import { AlertTriangle, MinusCircle, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/helpers';

type Severity = 'critical' | 'caution' | 'info';

interface AISuggestionCardProps {
  basedOn?: string;
  recommendation: string;
  severity?: Severity;
  title?: string;
  /** Click "Add Suggestion" — only shown when there's something to add */
  onAccept?: () => void;
  /** Click "Remove X" — only shown for critical/caution */
  onRemove?: () => void;
  removeLabel?: string;
  /** Multiple remove buttons when many ingredients need removal */
  removeActions?: Array<{ id: string; label: string }>;
  onRemoveById?: (id: string) => void;
  loading?: boolean;
}

const STYLES: Record<Severity, {
  panel: string;
  header: string;
  icon: React.ReactNode;
  label: string;
}> = {
  critical: {
    panel: 'border-danger/40 bg-danger/5',
    header: 'text-danger',
    icon: <AlertTriangle size={11} />,
    label: 'Issue Detected',
  },
  caution: {
    panel: 'border-amber/40 bg-amber/5',
    header: 'text-amber',
    icon: <AlertTriangle size={11} />,
    label: 'Caution',
  },
  info: {
    panel: 'border-stone-light/30 bg-bone-light',
    header: 'text-stone',
    icon: <Sparkles size={11} className="text-amber" />,
    label: 'AI Suggestions',
  },
};

export function AISuggestionCard({
  basedOn,
  recommendation,
  severity = 'info',
  title,
  onAccept,
  onRemove,
  removeLabel,
  removeActions,
  onRemoveById,
  loading,
}: AISuggestionCardProps) {
  const s = STYLES[severity];

  // Prefer the multi-action list if provided
  const showMulti = removeActions && removeActions.length > 1 && onRemoveById;

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h4 className={cn('flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] font-medium', s.header)}>
        {s.icon} {s.label}
      </h4>

      <div className={cn('mt-3 rounded-2xl border p-4', s.panel)}>
        {title && (
          <p className={cn('font-medium text-sm mb-1.5', s.header)}>
            {title}
          </p>
        )}

        <p className="text-sm text-charcoal leading-relaxed italic">
          {loading ? (
            <span className="inline-flex items-center gap-2 text-stone">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-stone" />
              Reading your formulation…
            </span>
          ) : (
            <>
              {basedOn && severity === 'info' && (
                <>
                  Based on your selection of <strong className="not-italic font-semibold">{basedOn}</strong>,{' '}
                </>
              )}
              {recommendation}
            </>
          )}
        </p>

        {!loading && (onAccept || onRemove || showMulti) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {showMulti
              ? removeActions!.map((a) => (
                  <Button
                    key={a.id}
                    variant={severity === 'critical' ? 'danger' : 'secondary'}
                    size="sm"
                    onClick={() => onRemoveById!(a.id)}
                    className="!text-xs"
                  >
                    <MinusCircle size={13} /> {a.label}
                  </Button>
                ))
              : onRemove && removeLabel && (
                  <Button
                    variant={severity === 'critical' ? 'danger' : 'secondary'}
                    size="sm"
                    onClick={onRemove}
                    className="!text-xs"
                  >
                    <MinusCircle size={13} /> {removeLabel}
                  </Button>
                )}
            {onAccept && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onAccept}
                className="!text-xs uppercase tracking-[0.15em] !text-charcoal underline-offset-4 hover:underline"
              >
                Add Suggestion
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.section>
  );
}
