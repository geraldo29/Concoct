import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-light/20 bg-bone-light/50 py-6 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-stone-light">
        Concoct
      </p>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-stone">
        Brewed with <Heart size={12} className="text-amber" fill="currentColor" />{' '}
        for botanical artisans everywhere.
      </p>
    </footer>
  );
}
