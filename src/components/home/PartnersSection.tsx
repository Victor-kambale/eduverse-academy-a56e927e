import { useSmartTranslation } from "@/hooks/useSmartTranslation";

const partners = [
  "Google", "Microsoft", "IBM", "Amazon", "Meta", "Stanford", "MIT", "Harvard"
];

export function PartnersSection() {
  const { tSmart } = useSmartTranslation();

  return (
    <section className="py-12 border-b border-border overflow-hidden">
      <div className="container">
        <p className="text-center text-muted-foreground mb-8">
          {tSmart(["home.trustedBy"], { defaultValue: "Trusted by learners from leading companies" })}
        </p>
      </div>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
        <div className="flex gap-16 animate-scroll hover:[animation-play-state:paused]">
          {[...partners, ...partners, ...partners, ...partners].map((partner, index) => (
            <span
              key={`${partner}-${index}`}
              className="text-xl font-semibold text-muted-foreground whitespace-nowrap opacity-60 hover:opacity-100 transition-opacity"
            >
              {partner}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
