import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email, source: "homepage" });

      if (error) {
        if (error.code === "23505") {
          toast.info("You're already subscribed!");
        } else {
          throw error;
        }
      } else {
        setSubscribed(true);
        toast.success("Successfully subscribed!");
      }
      setEmail("");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-secondary/40" />
      <div className="absolute inset-0 dot-pattern opacity-20" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container relative">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div 
            className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-card shadow-elevated border-gradient flex items-center justify-center"
            whileHover={{ rotate: 5, scale: 1.05 }}
          >
            <Mail className="w-9 h-9 text-accent" />
          </motion.div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-5">
            Stay Ahead of the Curve
          </h2>
          <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
            Get weekly insights on new courses, learning tips, and exclusive offers delivered to your inbox.
          </p>

          {subscribed ? (
            <motion.div
              className="flex items-center justify-center gap-3 text-success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <CheckCircle className="w-7 h-7" />
              <span className="font-semibold text-xl">You're subscribed! Check your inbox.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 h-14 text-base bg-card shadow-elevated border-border/50 focus:border-accent"
              />
              <Button type="submit" size="lg" disabled={loading} className="h-14 px-8 group shine-effect">
                {loading ? "Subscribing..." : "Subscribe"}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          )}

          <p className="text-xs text-muted-foreground mt-6">
            No spam. Unsubscribe anytime. We respect your privacy.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
