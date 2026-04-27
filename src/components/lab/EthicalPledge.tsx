import { Leaf } from 'lucide-react';

export function EthicalPledge() {
  return (
    <div className="rounded-2xl border border-stone-light/30 bg-stone-light/10 p-4">
      <header className="flex items-center gap-2">
        <Leaf size={14} className="text-sage" strokeWidth={1.8} />
        <h4 className="text-xs uppercase tracking-[0.2em] text-stone-dark font-medium">
          Ethical Pledge
        </h4>
      </header>
      <p className="mt-2 text-sm italic leading-relaxed text-stone-dark">
        Our containers are 100% recycled glass and we prioritize carbon-neutral
        sea freight for all ingredients.
      </p>
    </div>
  );
}
