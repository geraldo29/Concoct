import { motion } from 'framer-motion';
import { Heart, Quote, Star } from 'lucide-react';
import { COLLECTIVE_POSTS } from '../../data/collective';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { humanize } from '../../utils/helpers';

export function ConcoctCollective() {
  const featured = COLLECTIVE_POSTS.filter((p) => p.featured);
  const community = COLLECTIVE_POSTS.filter((p) => !p.featured);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-8">
      <header className="mb-12 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-sage">Community</p>
        <h2 className="mt-2 text-4xl md:text-5xl font-heading text-charcoal">
          The <em className="text-gradient not-italic">Concoct Collective</em>
        </h2>
        <p className="mt-3 max-w-xl mx-auto text-stone">
          Discover masterworks from fellow concocters — recipes shared, refined,
          and celebrated by our growing community of artisans.
        </p>
      </header>

      {/* ─── Featured Masterworks ─── */}
      <section className="mb-16">
        <div className="mb-6 flex items-baseline justify-between">
          <h3 className="font-heading text-2xl text-charcoal">
            ✦ Featured Masterworks
          </h3>
          <span className="text-xs uppercase tracking-wider text-stone-light">
            Curated this season
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featured.map((post, idx) => (
            <motion.div
              key={post.recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
            >
              <FeaturedCard post={post} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Community Posts ─── */}
      <section>
        <h3 className="mb-6 font-heading text-2xl text-charcoal">
          From the Community
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {community.map((post, idx) => (
            <motion.div
              key={post.recipe.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
            >
              <CommunityCard post={post} />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── Subcomponents ───

function FeaturedCard({ post }: { post: (typeof COLLECTIVE_POSTS)[0] }) {
  const r = post.recipe;
  return (
    <Card className="bg-cream h-full flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <Badge variant="amber" className="mb-2">
            <Star size={10} /> Featured
          </Badge>
          <h4 className="font-heading text-3xl text-charcoal leading-tight">
            {r.name}
          </h4>
          <p className="mt-1 text-sm text-stone">
            A {humanize(r.category).toLowerCase()} in a {r.vessel.name}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-stone">
          <Heart size={14} className="text-amber" /> {post.likes}
        </div>
      </div>

      {r.aiAnalysis && (
        <p className="mt-4 font-heading italic text-lg text-charcoal-light leading-snug border-l-2 border-sage pl-4">
          "{r.aiAnalysis.poeticDescription}"
        </p>
      )}

      {post.testimonial && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-bone-light p-4">
          <Quote size={16} className="shrink-0 text-sage mt-0.5" />
          <p className="text-sm italic text-stone leading-relaxed">
            {post.testimonial}
          </p>
        </div>
      )}

      <footer className="mt-auto pt-4 flex items-center gap-3 border-t border-stone-light/20">
        {r.creatorAvatar && (
          <img
            src={r.creatorAvatar}
            alt=""
            className="h-9 w-9 rounded-full bg-bone-light"
          />
        )}
        <div>
          <p className="text-sm font-medium text-charcoal">{r.creatorName}</p>
          <p className="text-xs text-stone-light">
            {r.createdAt.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </footer>
    </Card>
  );
}

function CommunityCard({ post }: { post: (typeof COLLECTIVE_POSTS)[0] }) {
  const r = post.recipe;
  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-heading text-xl text-charcoal leading-tight">
          {r.name}
        </h4>
        <span className="flex items-center gap-1 text-xs text-stone">
          <Heart size={12} /> {post.likes}
        </span>
      </div>
      <p className="mt-1 text-xs uppercase tracking-wider text-stone-light">
        {humanize(r.category)} · {r.vessel.material}
      </p>

      {r.aiAnalysis && (
        <p className="mt-3 text-sm italic text-stone leading-relaxed flex-1">
          "{r.aiAnalysis.poeticDescription}"
        </p>
      )}

      <footer className="mt-4 flex items-center gap-2 pt-3 border-t border-stone-light/20">
        {r.creatorAvatar && (
          <img
            src={r.creatorAvatar}
            alt=""
            className="h-7 w-7 rounded-full bg-bone-light"
          />
        )}
        <span className="text-xs text-stone">{r.creatorName}</span>
      </footer>
    </Card>
  );
}
