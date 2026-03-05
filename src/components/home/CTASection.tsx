import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="relative py-28 gradient-hero text-primary-foreground overflow-hidden noise-overlay">
      {/* Mesh gradient */}
      <div className="absolute inset-0 gradient-mesh opacity-70" />
      <div className="absolute inset-0 grid-pattern" />
      
      {/* Animated orbs */}
      <motion.div
        className="absolute top-1/4 left-[10%] w-64 h-64 rounded-full bg-accent/15 orb"
        animate={{ y: [0, -20, 0], x: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-[10%] w-48 h-48 rounded-full bg-primary-foreground/5 orb"
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="container relative z-10 text-center">
        <motion.div
          className="max-w-3xl mx-auto space-y-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            className="inline-block text-sm font-semibold text-accent uppercase tracking-widest"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Get Started Today
          </motion.span>
          <h2 className="font-display text-4xl md:text-6xl font-bold leading-tight">
            Start Your Learning{" "}
            <span className="text-gradient">Journey</span>
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto leading-relaxed">
            Join millions of learners and get access to world-class education.
            Your first course is free!
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="xl" className="group shine-effect">
                Get Started for Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 pt-10">
            {["Free courses available", "Earn certificates", "Learn at your own pace"].map((item, i) => (
              <motion.div
                key={item}
                className="flex items-center gap-2.5"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <CheckCircle className="w-5 h-5 text-accent" />
                <span className="text-primary-foreground/80 font-medium">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
