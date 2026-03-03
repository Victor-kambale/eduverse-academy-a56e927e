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
    <section className="relative gradient-hero text-primary-foreground overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern opacity-30" />
      <div className="absolute top-20 left-10 w-20 h-20 bg-accent/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="container relative py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>{tSmart(["hero.joinLearners", "home.hero.joinLearners"], { defaultValue: "Join 50 million learners worldwide" })}</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {heroTitleRest ? <span>{heroTitleRest} </span> : null}
              <span className="text-gradient">{heroTitleLast}</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg md:text-xl text-primary-foreground/80 max-w-xl">
              {tSmart(["hero.subtitle", "home.hero.subtitle"], {
                defaultValue: "Access world-class education from top universities and industry leaders. Earn certificates and degrees that advance your career.",
              })}
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <Link to="/courses">
                <Button variant="hero" size="lg">
                  {tSmart(["hero.exploreCourses", "home.hero.exploreCourses"], { defaultValue: "Explore Courses" })}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button variant="hero-outline" size="lg">
                  {tSmart(["hero.startFreeTrial", "home.hero.cta", "common.getStarted"], { defaultValue: "Start Free Trial" })}
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-accent/30 border-2 border-primary flex items-center justify-center text-sm font-bold">
                    {["S", "M", "J", "A"][i - 1]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-accent">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-primary-foreground/70">4.9 from 2M+ reviews</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, scale: 0.9, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=500&fit=crop"
                alt="Students learning together"
                className="rounded-2xl shadow-2xl"
              />
              <motion.div
                className="absolute -bottom-6 -left-6 bg-card text-card-foreground p-4 rounded-xl shadow-xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">94%</p>
                    <p className="text-sm text-muted-foreground">Career Growth</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                className="absolute -top-4 -right-4 bg-card text-card-foreground p-3 rounded-xl shadow-xl"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                    <Play className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Live Classes</p>
                    <p className="text-xs text-muted-foreground">Starting now</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
