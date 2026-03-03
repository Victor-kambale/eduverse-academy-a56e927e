import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="py-20 gradient-hero text-primary-foreground">
      <div className="container text-center">
        <motion.div
          className="max-w-3xl mx-auto space-y-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Start Your Learning Journey Today
          </h2>
          <p className="text-lg text-primary-foreground/80">
            Join millions of learners and get access to world-class education.
            Your first course is free!
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="lg">
                Get Started for Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 pt-8">
            {["Free courses available", "Earn certificates", "Learn at your own pace"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
