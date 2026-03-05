import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useSmartTranslation } from "@/hooks/useSmartTranslation";
import { motion } from "framer-motion";

const categories = [
  { name: "Technology", icon: "💻", courses: 450, gradient: "from-blue-500/20 to-cyan-500/20", border: "group-hover:border-blue-400/50" },
  { name: "Business", icon: "📊", courses: 320, gradient: "from-purple-500/20 to-pink-500/20", border: "group-hover:border-purple-400/50" },
  { name: "Data Science", icon: "📈", courses: 280, gradient: "from-green-500/20 to-emerald-500/20", border: "group-hover:border-green-400/50" },
  { name: "Health", icon: "🏥", courses: 190, gradient: "from-red-500/20 to-orange-500/20", border: "group-hover:border-red-400/50" },
  { name: "Languages", icon: "🌍", courses: 150, gradient: "from-yellow-500/20 to-amber-500/20", border: "group-hover:border-yellow-400/50" },
  { name: "Personal Dev", icon: "🎯", courses: 210, gradient: "from-indigo-500/20 to-violet-500/20", border: "group-hover:border-indigo-400/50" },
];

export function CategoriesSection() {
  const { tSmart } = useSmartTranslation();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 dot-pattern opacity-30" />

      <div className="container relative">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.span 
            className="inline-block text-sm font-semibold text-accent uppercase tracking-widest mb-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Browse by Category
          </motion.span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            {tSmart(["home.categories"], { defaultValue: "Explore Top Categories" })}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {tSmart(["home.whyChooseUs"], { defaultValue: "Browse courses from our extensive catalog across all major fields" })}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link to={`/courses?category=${category.name.toLowerCase()}`} className="group block">
                <Card className={`h-full card-3d border border-border/50 ${category.border} transition-all duration-500 bg-card`}>
                  <CardContent className="p-6 text-center relative overflow-hidden">
                    {/* Background gradient on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    <div className="relative">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-md">
                        {category.icon}
                      </div>
                      <h3 className="font-semibold mb-1 group-hover:text-accent transition-colors duration-300">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.courses} courses</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
