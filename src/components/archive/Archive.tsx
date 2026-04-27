import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { deleteRecipe, loadUserRecipes, type SavedRecipe } from '../../services/recipesService';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { humanize } from '../../utils/helpers';

interface ArchiveProps {
  onSignInClick: () => void;
}

export function Archive({ onSignInClick }: ArchiveProps) {
  const { user, loading: authLoading } = useAuth();
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await loadUserRecipes(user.uid);
      setRecipes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleDelete(id: string) {
    if (!user) return;
    if (!confirm('Delete this formulation? This cannot be undone.')) return;
    await deleteRecipe(user.uid, id);
    setRecipes((rs) => rs.filter((r) => r.id !== id));
  }

  // ─── States ───
  if (authLoading) {
    return <Centered><Loader2 size={28} className="animate-spin text-sage" /></Centered>;
  }

  if (!user) {
    return (
      <Centered>
        <p className="text-xs uppercase tracking-[0.3em] text-sage">My Formulas</p>
        <h2 className="font-heading text-5xl text-charcoal">Sign in to begin</h2>
        <p className="text-stone leading-relaxed max-w-md text-center">
          Create an account to save formulations, build your archive, and pick up
          where you left off.
        </p>
        <Button onClick={onSignInClick}>Sign in to Concoct</Button>
      </Centered>
    );
  }

  if (loading) {
    return <Centered><Loader2 size={28} className="animate-spin text-sage" /></Centered>;
  }

  if (error) {
    return (
      <Centered>
        <p className="text-danger">{error}</p>
        <Button variant="secondary" onClick={refresh}>Retry</Button>
      </Centered>
    );
  }

  if (recipes.length === 0) {
    return (
      <Centered>
        <p className="text-xs uppercase tracking-[0.3em] text-sage">Empty Archive</p>
        <h2 className="font-heading text-5xl text-charcoal">No formulations yet</h2>
        <p className="text-stone leading-relaxed max-w-md text-center">
          Create something in the Lab and save it to see it here.
        </p>
      </Centered>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-8">
      <header className="mb-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-sage">My Formulas</p>
        <h2 className="mt-2 font-heading text-4xl md:text-5xl text-charcoal">
          Your <em className="text-gradient not-italic">Archive</em>
        </h2>
        <p className="mt-2 text-stone">
          {recipes.length} formulation{recipes.length === 1 ? '' : 's'} saved
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map((r, idx) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
          >
            <Card className="h-full flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-heading text-2xl text-charcoal leading-tight">
                  {r.name}
                </h3>
                <button
                  type="button"
                  onClick={() => handleDelete(r.id)}
                  className="rounded-full p-1.5 text-stone-light hover:bg-danger/10 hover:text-danger"
                  aria-label="Delete recipe"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <p className="mt-1 text-xs uppercase tracking-wider text-stone-light">
                {humanize(r.category)} · {r.vessel.name} · {r.vessel.capacityMl}ml
              </p>

              {r.aiAnalysis?.poeticDescription && (
                <p className="mt-3 text-sm italic text-stone leading-relaxed flex-1">
                  "{r.aiAnalysis.poeticDescription}"
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-1.5">
                {r.ingredients.slice(0, 4).map((ing) => (
                  <Badge key={ing.id} variant="stone">{ing.name}</Badge>
                ))}
                {r.ingredients.length > 4 && (
                  <Badge variant="stone">+{r.ingredients.length - 4}</Badge>
                )}
              </div>

              <p className="mt-3 pt-3 border-t border-stone-light/20 text-xs text-stone-light">
                {r.createdAt.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      {children}
    </div>
  );
}
