import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Beaker, Bookmark, Check, Lightbulb, Loader2, Sparkles } from 'lucide-react';
import type { AIAnalysisResult, Ingredient, ProductCategory, Vessel } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { VesselPreview } from '../ui/VesselPreview';
import { humanize } from '../../utils/helpers';
import { analyzeFormulation } from '../../services/geminiService';
import { useAuth } from '../../hooks/useAuth';
import { saveRecipe } from '../../services/recipesService';

interface StageSynthesisProps {
  category: ProductCategory | null;
  vessel: Vessel | null;
  ingredients: Ingredient[];
  result: AIAnalysisResult | null;
  isAnalyzing: boolean;
  onAnalyze: (r: AIAnalysisResult) => void;
  onSetAnalyzing: (b: boolean) => void;
  onSignInClick?: () => void;
  onReset: () => void;
}

export function StageSynthesis({
  category,
  vessel,
  ingredients,
  result,
  isAnalyzing,
  onAnalyze,
  onSetAnalyzing,
  onSignInClick,
  onReset,
}: StageSynthesisProps) {
  const { user, configured } = useAuth();
  const [recipeName, setRecipeName] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  // Auto-trigger analysis on mount if not yet done
  useEffect(() => {
    if (!result && !isAnalyzing && category && vessel && ingredients.length > 0) {
      onSetAnalyzing(true);
      analyzeFormulation(category, vessel, ingredients)
        .then((r) => onAnalyze(r))
        .finally(() => onSetAnalyzing(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!category || !vessel) {
    return (
      <p className="text-center text-stone italic py-12">
        Complete the previous stages to synthesize your concoction.
      </p>
    );
  }

  return (
    <div>
      <header className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-sage">Stage 04</p>
        <h2 className="mt-2 text-4xl md:text-5xl font-heading text-charcoal">
          The <em className="text-gradient not-italic">Synthesis</em>
        </h2>
        <p className="mt-3 max-w-xl mx-auto text-stone">
          Your formulation has been distilled. Behold the AI-curated reading of
          your creation.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">
        {/* ─── Left: vessel preview ─── */}
        <Card className="bg-cream lg:sticky lg:top-24">
          <VesselPreview vessel={vessel} ingredients={ingredients} />
          <div className="mt-4 text-center">
            <Badge variant="amber">{humanize(category)}</Badge>
          </div>
        </Card>

        {/* ─── Right: analysis ─── */}
        <div className="space-y-6">
          {isAnalyzing && <AnalyzingState />}

          {result && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Poetic description */}
              <Card className="bg-charcoal text-bone border-charcoal">
                <div className="flex items-start gap-3">
                  <Sparkles size={20} className="shrink-0 mt-1 text-amber-light" />
                  <p className="font-heading text-xl italic leading-snug">
                    "{result.poeticDescription}"
                  </p>
                </div>
              </Card>

              {/* Scores */}
              <div className="grid grid-cols-2 gap-4">
                <ScoreCard
                  label="Safety"
                  value={result.safetyScore}
                  icon={<Beaker size={18} />}
                />
                <ScoreCard
                  label="Efficacy"
                  value={result.efficacyRating}
                  icon={<Sparkles size={18} />}
                />
              </div>

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <Card className="bg-danger/5 border-danger/30">
                  <h4 className="flex items-center gap-2 font-heading text-lg text-danger">
                    <AlertTriangle size={18} /> Warnings
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-charcoal">
                    {result.warnings.map((w, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-danger">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <Card className="bg-sage/5 border-sage/30">
                  <h4 className="flex items-center gap-2 font-heading text-lg text-sage-dark">
                    <Lightbulb size={18} /> Next Evolution
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-charcoal">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-sage">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Recipe summary */}
              <Card>
                <h4 className="font-heading text-lg text-charcoal">Recipe Card</h4>
                <dl className="mt-3 space-y-1.5 text-sm">
                  <Row label="Category" value={humanize(category)} />
                  <Row label="Vessel" value={`${vessel.name} (${vessel.capacityMl}ml)`} />
                  <Row
                    label="Ingredients"
                    value={ingredients.map((i) => i.name).join(', ')}
                  />
                  <Row label="Eco Score" value={`${vessel.ecoScore}/10`} />
                </dl>
              </Card>

              {/* Save formulation */}
              <Card className="bg-cream">
                <h4 className="flex items-center gap-2 font-heading text-lg text-charcoal">
                  <Bookmark size={16} className="text-sage" /> Save to Archive
                </h4>

                {!configured ? (
                  <p className="mt-2 text-sm text-stone italic">
                    Firebase isn't configured yet — saved formulations will be enabled once env vars are set.
                  </p>
                ) : !user ? (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-stone leading-snug">
                      Sign in to save this formulation to your private archive.
                    </p>
                    <Button size="sm" onClick={onSignInClick}>
                      Sign in
                    </Button>
                  </div>
                ) : saveState === 'saved' ? (
                  <p className="mt-3 flex items-center gap-2 text-sm text-sage-dark">
                    <Check size={14} /> Saved to your archive.
                  </p>
                ) : (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      value={recipeName}
                      onChange={(e) => setRecipeName(e.target.value)}
                      placeholder="Name your concoction…"
                      className="flex-1 min-h-[44px] rounded-full border border-stone-light/40 bg-bone-light px-4 py-2 text-sm text-charcoal placeholder:text-stone-light focus:outline-none focus:ring-2 focus:ring-sage/40"
                      maxLength={60}
                    />
                    <Button
                      size="sm"
                      disabled={!recipeName.trim() || saveState === 'saving'}
                      onClick={async () => {
                        if (!user || !recipeName.trim()) return;
                        setSaveState('saving');
                        setSaveError(null);
                        try {
                          await saveRecipe(user.uid, {
                            name: recipeName.trim(),
                            category,
                            vessel,
                            ingredients,
                            aiAnalysis: result ?? undefined,
                          });
                          setSaveState('saved');
                        } catch (err) {
                          setSaveError(err instanceof Error ? err.message : 'Save failed');
                          setSaveState('error');
                        }
                      }}
                    >
                      {saveState === 'saving' ? <Loader2 size={14} className="animate-spin" /> : <Bookmark size={14} />}
                      Save
                    </Button>
                  </div>
                )}
                {saveError && (
                  <p className="mt-2 text-xs text-danger">{saveError}</p>
                )}
              </Card>

              <div className="flex justify-end">
                <Button variant="secondary" onClick={onReset}>
                  Begin a New Concoction
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Subcomponents ───

function AnalyzingState() {
  return (
    <Card className="text-center py-12 bg-cream">
      <Loader2 size={32} className="mx-auto mb-3 animate-spin text-sage" />
      <p className="font-heading text-xl text-charcoal italic">
        Analyzing botanical resonance...
      </p>
      <p className="mt-1 text-sm text-stone">
        Our AI is reading the chemistry of your creation.
      </p>
    </Card>
  );
}

function ScoreCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  const tone = value >= 80 ? 'sage' : value >= 60 ? 'amber' : 'danger';
  const colors: Record<typeof tone, string> = {
    sage: 'text-sage-dark',
    amber: 'text-amber',
    danger: 'text-danger',
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm uppercase tracking-wider text-stone">
          {icon} {label}
        </span>
      </div>
      <p className={`mt-2 font-heading text-5xl ${colors[tone]}`}>{value}</p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-light/20">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full ${
            tone === 'sage' ? 'bg-sage' : tone === 'amber' ? 'bg-amber' : 'bg-danger'
          }`}
        />
      </div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 text-stone uppercase tracking-wider text-xs pt-0.5">
        {label}
      </dt>
      <dd className="flex-1 text-charcoal">{value}</dd>
    </div>
  );
}
