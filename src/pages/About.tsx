import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Users,
  Globe,
  Award,
  Target,
  Heart,
  Lightbulb,
  Rocket,
  CheckCircle,
} from "lucide-react";

const stats = [
  { number: "50M+", label: "Learners Worldwide" },
  { number: "15M+", label: "Course Completions" },
  { number: "193", label: "Countries Reached" },
  { number: "6,000+", label: "Expert-Led Courses" },
];

const values = [
  {
    icon: Target,
    title: "Excellence",
    description: "We partner with leading universities and companies to deliver world-class education.",
  },
  {
    icon: Globe,
    title: "Accessibility",
    description: "Quality education should be available to everyone, regardless of location or background.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We continuously evolve our platform to provide the best learning experience.",
  },
  {
    icon: Heart,
    title: "Community",
    description: "Learning is better together. We foster a supportive global community of learners.",
  },
];

const team = [
  {
    name: "Dr. Emily Watson",
    role: "CEO & Co-Founder",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  },
  {
    name: "Michael Chen",
    role: "CTO & Co-Founder",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
  },
  {
    name: "Sarah Johnson",
    role: "VP of Content",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
  },
  {
    name: "David Kim",
    role: "VP of Engineering",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
  },
];

const AboutPage = () => {
  return (
    <Layout>
      {/* Hero */}
      <div className="bg-primary text-primary-foreground py-20">
        <div className="container text-center">
          <Badge variant="secondary" className="mb-4">Our Story</Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 max-w-3xl mx-auto">
            Empowering Millions Through Education
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            EduVerse was founded with a simple mission: to make world-class education 
            accessible to anyone, anywhere. We believe that education is the key to 
            unlocking human potential.
          </p>
        </div>
      </div>

      {/* Stats */}
      <section className="py-16 bg-secondary/50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold text-primary">{stat.number}</p>
                <p className="text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">Our Mission</Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Education Without Boundaries
              </h2>
              <p className="text-muted-foreground mb-6">
                We partner with more than 300 leading universities and companies to bring 
                flexible, affordable, job-relevant online learning to individuals and 
                organizations worldwide.
              </p>
              <ul className="space-y-3">
                {[
                  "Access to courses from top institutions",
                  "Industry-recognized certificates",
                  "Flexible learning on your schedule",
                  "Affordable pricing and financial aid",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
                alt="Students collaborating"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-bold">Since 2015</p>
                    <p className="text-sm text-muted-foreground">Transforming Lives</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Our Values</Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              What Drives Us
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="text-center hover-lift">
                <CardContent className="pt-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Leadership</Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Meet Our Team
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <Card key={member.name} className="text-center overflow-hidden hover-lift">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="pt-4">
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-hero text-primary-foreground">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join millions of learners and transform your career with world-class education.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/courses">
              <Button variant="hero" size="lg">Browse Courses</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button variant="hero-outline" size="lg">Sign Up Free</Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
