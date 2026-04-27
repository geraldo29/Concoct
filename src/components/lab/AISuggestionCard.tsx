import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

interface AISuggestionCardProps {
  basedOn?: string;
  recommendation: string;
  onAccept?: () => void;
  loading?: boolean;
}

export function AISuggestionCard({
  basedOn,
  recommendation,
  onAccept,
  loading,
}: AISuggestionCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h4 className="flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-stone font-medium">
        <Sparkles size={11} className="text-amber" /> AI Suggestions
      </h4>

      <div className="mt-3 rounded-2xl border border-stone-light/30 bg-bone-light p-4">
        <p className="text-sm text-charcoal leading-relaxed italic">
          {loading ? (
            <span className="inline-flex items-center gap-2 text-stone">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-stone" />
              Reading your formulation…
            </span>
          ) : (
            <>
              {basedOn && (
                <>
                  Based on your selection of <strong className="not-italic font-semibold">{basedOn}</strong>,{' '}
                </>
              )}
              {recommendation}
            </>
          )}
        </p>

        {!loading && onAccept && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAccept}
            className="mt-3 !px-0 !text-xs uppercase tracking-[0.15em] !text-charcoal underline-offset-4 hover:underline"
          >
            Add Suggestion
          </Button>
        )}
      </div>
    </motion.section>
  );
}
