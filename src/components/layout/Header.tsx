import { Leaf, ShoppingBag } from 'lucide-react';
import { cn } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { UserMenu } from '../auth/UserMenu';

export type View = 'lab' | 'collective' | 'archive' | 'impact';

interface HeaderProps {
  view: View;
  cartCount?: number;
  onChange: (v: View) => void;
  onSignInClick: () => void;
}

const NAV_ITEMS: Array<{ id: View; label: string }> = [
  { id: 'lab', label: 'Lab View' },
  { id: 'collective', label: 'Collective' },
  { id: 'archive', label: 'My Formulas' },
  { id: 'impact', label: 'Impact Report' },
];

export function Header({ view, cartCount = 0, onChange, onSignInClick }: HeaderProps) {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-stone-light/20 bg-bone/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        {/* ─── Brand ─── */}
        <button
          type="button"
          onClick={() => onChange('lab')}
          className="flex items-center gap-2.5 text-charcoal text-left"
        >
          <Leaf size={22} className="text-sage" strokeWidth={1.5} />
          <div className="leading-none">
            <p className="font-heading text-2xl tracking-tight">Concoct</p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-light mt-0.5">
              Custom Lab
            </p>
          </div>
        </button>

        {/* ─── Center nav ─── */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                'text-sm tracking-wide transition-colors min-h-[44px] flex items-center',
                view === item.id
                  ? 'text-charcoal font-medium border-b-2 border-charcoal'
                  : 'text-stone hover:text-charcoal',
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* ─── Right cluster ─── */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hidden sm:flex items-center gap-1.5 text-sm text-stone hover:text-charcoal min-h-[44px] px-2"
            aria-label="Cart"
          >
            <ShoppingBag size={16} />
            <span className="tabular-nums">({cartCount})</span>
          </button>

          {loading ? (
            <span className="h-9 w-20 rounded-full bg-stone-light/20 animate-pulse" />
          ) : user ? (
            <UserMenu />
          ) : (
            <button
              type="button"
              onClick={onSignInClick}
              className="rounded-full border border-charcoal/80 px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-charcoal hover:bg-charcoal hover:text-bone transition-colors min-h-[40px]"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* ─── Mobile nav ─── */}
      <nav className="md:hidden flex justify-center gap-4 border-t border-stone-light/20 px-4 py-2 overflow-x-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              'shrink-0 text-xs tracking-wide whitespace-nowrap min-h-[36px] px-2',
              view === item.id ? 'text-charcoal font-medium' : 'text-stone',
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
