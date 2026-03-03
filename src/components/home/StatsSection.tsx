import { Users, GraduationCap, Globe, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { number: "50M+", label: "Learners Worldwide", icon: Users },
  { number: "15M+", label: "Graduates", icon: GraduationCap },
  { number: "193", label: "Countries", icon: Globe },
  { number: "6,000+", label: "Courses", icon: BookOpen },
];

export function StatsSection() {
  return (
    <section className="py-16 bg-secondary/50">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-8 h-8 text-primary" />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-foreground">{stat.number}</p>
              <p className="text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
