import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useSmartTranslation } from "@/hooks/useSmartTranslation";
import { motion } from "framer-motion";

const categories = [
  { name: "Technology", icon: "💻", courses: 450, color: "from-blue-500 to-cyan-500" },
  { name: "Business", icon: "📊", courses: 320, color: "from-purple-500 to-pink-500" },
  { name: "Data Science", icon: "📈", courses: 280, color: "from-green-500 to-emerald-500" },
  { name: "Health", icon: "🏥", courses: 190, color: "from-red-500 to-orange-500" },
  { name: "Languages", icon: "🌍", courses: 150, color: "from-yellow-500 to-amber-500" },
  { name: "Personal Dev", icon: "🎯", courses: 210, color: "from-indigo-500 to-violet-500" },
];

export function CategoriesSection() {
  const { tSmart } = useSmartTranslation();

  return (
    <section className="py-20">
      <div className="container">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            {tSmart(["home.categories"], { defaultValue: "Explore Top Categories" })}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {tSmart(["home.whyChooseUs"], { defaultValue: "Browse courses from our extensive catalog across all major fields" })}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link to={`/courses?category=${category.name.toLowerCase()}`} className="group">
                <Card className="h-full hover-lift border-2 border-transparent hover:border-accent/50 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {category.icon}
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-accent transition-colors">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.courses} courses</p>
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
