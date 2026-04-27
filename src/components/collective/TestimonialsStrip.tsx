import { COLLECTIVE_POSTS } from '../../data/collective';

export function TestimonialsStrip() {
  const withTestimonials = COLLECTIVE_POSTS.filter((p) => p.testimonial).slice(0, 3);

  if (withTestimonials.length === 0) return null;

  return (
    <section className="border-t border-stone-light/20 bg-bone-light/40 py-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 md:grid-cols-3 md:px-8">
        {withTestimonials.map((p) => (
          <figure key={p.recipe.id} className="flex items-start gap-3">
            {p.recipe.creatorAvatar ? (
              <img
                src={p.recipe.creatorAvatar}
                alt=""
                className="h-9 w-9 shrink-0 rounded-full bg-stone-light/30"
              />
            ) : (
              <span className="h-9 w-9 shrink-0 rounded-full bg-stone-light/30" />
            )}
            <div className="min-w-0">
              <blockquote className="text-sm italic text-stone-dark leading-relaxed">
                "{p.testimonial}"
              </blockquote>
              <figcaption className="mt-1.5 text-xs font-medium text-charcoal">
                {p.recipe.creatorName}
              </figcaption>
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}
