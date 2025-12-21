import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  GraduationCap, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Mail,
  Phone,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email, source: "footer" });

      if (error) {
        if (error.code === "23505") {
          toast.info("You're already subscribed!");
        } else {
          throw error;
        }
      } else {
        toast.success("Successfully subscribed! Check your inbox for updates.");
        setEmail("");
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Newsletter Section */}
      <div className="border-b border-primary-foreground/10">
        <div className="container py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl font-bold mb-2">
                Stay Updated with EduVerse
              </h3>
              <p className="text-primary-foreground/70">
                Get the latest courses, discounts, and learning tips delivered to your inbox.
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 w-full md:w-80"
              />
              <Button variant="accent" onClick={handleSubscribe} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-accent-foreground" />
              </div>
              <span className="font-display text-xl font-bold">EduVerse</span>
            </Link>
            <p className="text-primary-foreground/70 mb-6 max-w-xs">
              Empowering millions of learners worldwide with world-class education and certifications.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Courses */}
          <div>
            <h4 className="font-semibold mb-4">Courses</h4>
            <ul className="space-y-3 text-primary-foreground/70">
              <li><Link to="/courses?category=technology" className="hover:text-accent transition-colors">Technology</Link></li>
              <li><Link to="/courses?category=business" className="hover:text-accent transition-colors">Business</Link></li>
              <li><Link to="/courses?category=data-science" className="hover:text-accent transition-colors">Data Science</Link></li>
              <li><Link to="/courses?category=health" className="hover:text-accent transition-colors">Health</Link></li>
              <li><Link to="/courses?category=languages" className="hover:text-accent transition-colors">Languages</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-3 text-primary-foreground/70">
              <li><Link to="/help" className="hover:text-accent transition-colors">Help Center</Link></li>
              <li><Link to="/blog" className="hover:text-accent transition-colors">Blog</Link></li>
              <li><Link to="/community" className="hover:text-accent transition-colors">Community</Link></li>
              <li><Link to="/certificates" className="hover:text-accent transition-colors">Certificates</Link></li>
              <li><Link to="/careers" className="hover:text-accent transition-colors">Careers</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-primary-foreground/70">
              <li><Link to="/about" className="hover:text-accent transition-colors">About Us</Link></li>
              <li><Link to="/instructors" className="hover:text-accent transition-colors">Become an Instructor</Link></li>
              <li><Link to="/enterprise" className="hover:text-accent transition-colors">For Enterprise</Link></li>
              <li><Link to="/press" className="hover:text-accent transition-colors">Press</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-primary-foreground/70">
              <li><Link to="/terms" className="hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="hover:text-accent transition-colors">Cookie Policy</Link></li>
              <li><Link to="/accessibility" className="hover:text-accent transition-colors">Accessibility</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
          <p>© 2025 EduVerse. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>support@eduverse.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>+1 (555) 123-4567</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
