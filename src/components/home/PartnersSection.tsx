import { useSmartTranslation } from "@/hooks/useSmartTranslation";
import { motion } from "framer-motion";

const partners = [
  "Google", "Microsoft", "IBM", "Amazon", "Meta", "Stanford", "MIT", "Harvard"
];

export function PartnersSection() {
  const { tSmart } = useSmartTranslation();

  return (
    <section className="relative py-16 border-b border-border/50 overflow-hidden">
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      
      <div className="container">
        <motion.p 
          className="text-center text-muted-foreground mb-10 text-sm font-medium uppercase tracking-widest"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {tSmart(["home.trustedBy"], { defaultValue: "Trusted by learners from leading companies" })}
        </motion.p>
      </div>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
        <div className="flex gap-20 animate-scroll hover:[animation-play-state:paused]">
          {[...partners, ...partners, ...partners, ...partners].map((partner, index) => (
            <span
              key={`${partner}-${index}`}
              className="text-xl font-bold text-muted-foreground/40 whitespace-nowrap hover:text-accent transition-colors duration-300 cursor-default tracking-wide"
            >
              {partner}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
