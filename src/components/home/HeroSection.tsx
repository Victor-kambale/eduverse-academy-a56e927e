import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Star, TrendingUp, Play } from "lucide-react";
import { useSmartTranslation } from "@/hooks/useSmartTranslation";
import { motion } from "framer-motion";

export function HeroSection() {
  const { tSmart } = useSmartTranslation();

  const splitLastWord = (text: string) => {
    const parts = text.trim().split(" ");
    if (parts.length <= 1) return { rest: "", last: text.trim() };
    const last = parts.pop() || "";
    return { rest: parts.join(" "), last };
  };

  const heroTitle = tSmart(["hero.title", "home.hero.title"], {
    defaultValue: "Learn Without Limits",
  });
  const { rest: heroTitleRest, last: heroTitleLast } = splitLastWord(heroTitle);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <section className="relative gradient-hero text-primary-foreground overflow-hidden noise-overlay">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 gradient-mesh opacity-80" />
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern" />
      {/* Hero SVG pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-20" />

      {/* Animated orbs */}
      <motion.div
        className="absolute top-10 left-[10%] w-72 h-72 rounded-full bg-accent/20 orb"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-10 right-[15%] w-96 h-96 rounded-full bg-primary-foreground/5 orb"
        animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 orb"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container relative py-24 lg:py-36 z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 glass px-5 py-2.5 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>{tSmart(["hero.joinLearners", "home.hero.joinLearners"], { defaultValue: "Join 50 million learners worldwide" })}</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="font-display text-4xl md:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
              {heroTitleRest ? <span>{heroTitleRest} </span> : null}
              <span className="text-gradient relative">
                {heroTitleLast}
                <motion.span 
                  className="absolute -bottom-2 left-0 h-1 bg-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 1, ease: [0.22, 1, 0.36, 1] }}
                />
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg md:text-xl text-primary-foreground/70 max-w-xl leading-relaxed">
              {tSmart(["hero.subtitle", "home.hero.subtitle"], {
                defaultValue: "Access world-class education from top universities and industry leaders. Earn certificates and degrees that advance your career.",
              })}
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-2">
              <Link to="/courses">
                <Button variant="hero" size="lg" className="group shine-effect">
                  {tSmart(["hero.exploreCourses", "home.hero.exploreCourses"], { defaultValue: "Explore Courses" })}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button variant="hero-outline" size="lg" className="group">
                  {tSmart(["hero.startFreeTrial", "home.hero.cta", "common.getStarted"], { defaultValue: "Start Free Trial" })}
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-6 pt-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-11 h-11 rounded-full bg-accent/30 border-2 border-primary-foreground/20 flex items-center justify-center text-sm font-bold glass"
                    initial={{ scale: 0, x: -10 }}
                    animate={{ scale: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.1, type: "spring", stiffness: 300 }}
                  >
                    {["S", "M", "J", "A"][i - 1]}
                  </motion.div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-accent">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-primary-foreground/60">4.9 from 2M+ reviews</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image with advanced effects */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, scale: 0.9, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative">
              {/* Glow behind image */}
              <div className="absolute -inset-4 bg-accent/10 rounded-3xl blur-3xl" />
              
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=500&fit=crop"
                alt="Students learning together"
                className="relative rounded-2xl shadow-2xl ring-1 ring-white/10"
              />

              {/* Floating card - Career Growth */}
              <motion.div
                className="absolute -bottom-6 -left-6 glass-card p-4 rounded-xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">94%</p>
                    <p className="text-sm text-muted-foreground">Career Growth</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating card - Live Classes */}
              <motion.div
                className="absolute -top-4 -right-4 glass-card p-3 rounded-xl"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Play className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-card-foreground">Live Classes</p>
                    <p className="text-xs text-muted-foreground">Starting now</p>
                  </div>
                </div>
              </motion.div>

              {/* Decorative border gradient ring */}
              <div className="absolute -inset-[1px] rounded-2xl border-gradient pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
