import { Users, GraduationCap, Globe, BookOpen } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const stats = [
  { number: 50, suffix: "M+", label: "Learners Worldwide", icon: Users },
  { number: 15, suffix: "M+", label: "Graduates", icon: GraduationCap },
  { number: 193, suffix: "", label: "Countries", icon: Globe },
  { number: 6000, suffix: "+", label: "Courses", icon: BookOpen },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  const display = target >= 1000 ? `${(count / 1000).toFixed(count >= target ? 0 : 0)}` : count;
  const formatted = target >= 1000 && count >= target ? `${(target / 1000).toFixed(0)},000` : target >= 1000 ? `${Math.floor(count).toLocaleString()}` : `${count}`;

  return (
    <span ref={ref} className="tabular-nums">
      {formatted}{suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-secondary/40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="group text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative mx-auto w-20 h-20 mb-5">
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-2xl bg-accent/10 blur-xl group-hover:bg-accent/20 transition-colors duration-500" />
                <div className="relative w-full h-full rounded-2xl bg-card shadow-elevated flex items-center justify-center group-hover:shadow-glow transition-shadow duration-500 border-gradient">
                  <stat.icon className="w-9 h-9 text-primary group-hover:text-accent transition-colors duration-300" />
                </div>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                <AnimatedCounter target={stat.number} suffix={stat.suffix} />
              </p>
              <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
