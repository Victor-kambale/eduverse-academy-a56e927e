import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import {
  Check,
  X,
  Star,
  Zap,
  Award,
  Users,
  BookOpen,
  Video,
  Download,
  Clock,
  Shield,
  Sparkles,
} from "lucide-react";

const pricingPlans = [
  {
    name: "Free",
    description: "Perfect for exploring",
    monthlyPrice: 0,
    yearlyPrice: 0,
    popular: false,
    features: [
      { text: "Access to 500+ free courses", included: true },
      { text: "Community forum access", included: true },
      { text: "Basic progress tracking", included: true },
      { text: "Mobile app access", included: true },
      { text: "Certificates", included: false },
      { text: "Offline downloads", included: false },
      { text: "Priority support", included: false },
      { text: "Course completion certificates", included: false },
    ],
    cta: "Get Started",
    ctaVariant: "outline" as const,
  },
  {
    name: "Pro",
    description: "Best for serious learners",
    monthlyPrice: 29,
    yearlyPrice: 19,
    popular: true,
    features: [
      { text: "Access to all 6,000+ courses", included: true },
      { text: "Unlimited certificates", included: true },
      { text: "Offline downloads", included: true },
      { text: "Priority support", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Learning paths", included: true },
      { text: "Group learning features", included: false },
      { text: "Custom branding", included: false },
    ],
    cta: "Start Free Trial",
    ctaVariant: "accent" as const,
  },
  {
    name: "Enterprise",
    description: "For teams and organizations",
    monthlyPrice: 99,
    yearlyPrice: 79,
    popular: false,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited team members", included: true },
      { text: "Admin dashboard", included: true },
      { text: "Custom learning paths", included: true },
      { text: "API access", included: true },
      { text: "SSO integration", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Custom integrations", included: true },
    ],
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
  },
];

const faqs = [
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes! Pro plan comes with a 7-day free trial. No credit card required to start.",
  },
  {
    q: "Can I switch plans later?",
    a: "Absolutely. You can upgrade or downgrade your plan at any time from your account settings.",
  },
  {
    q: "Do certificates expire?",
    a: "No, your certificates never expire. They're yours to keep and share forever.",
  },
];

const PricingPage = () => {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container text-center">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Save 35% with yearly
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Choose the plan that's right for you. All plans include a 30-day money-back guarantee.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={!isYearly ? "font-semibold" : "text-primary-foreground/70"}>Monthly</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={isYearly ? "font-semibold" : "text-primary-foreground/70"}>
              Yearly
              <Badge variant="secondary" className="ml-2 text-xs">Save 35%</Badge>
            </span>
          </div>
        </div>
      </div>

      <div className="container py-12">
        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 -mt-8">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${plan.popular ? "border-accent shadow-xl scale-105 z-10" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-accent text-accent-foreground px-4">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="font-display text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">
                      ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {isYearly && plan.monthlyPrice > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Billed ${plan.yearlyPrice * 12}/year
                    </p>
                  )}
                </div>

                <Button
                  variant={plan.ctaVariant}
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    if (plan.name === 'Free') {
                      window.location.href = '/auth?mode=signup';
                    } else if (plan.name === 'Enterprise') {
                      window.location.href = '/contact';
                    } else {
                      window.location.href = '/auth?mode=signup&plan=pro';
                    }
                  }}
                >
                  {plan.cta}
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-success shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground shrink-0" />
                      )}
                      <span className={feature.included ? "" : "text-muted-foreground"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-20">
          <h2 className="font-display text-3xl font-bold text-center mb-12">
            What's Included
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: "6,000+ Courses", description: "Learn from industry experts" },
              { icon: Award, title: "Certificates", description: "Earn verified credentials" },
              { icon: Video, title: "HD Video", description: "Crystal clear video lessons" },
              { icon: Download, title: "Downloads", description: "Learn offline anytime" },
              { icon: Clock, title: "Lifetime Access", description: "Learn at your own pace" },
              { icon: Users, title: "Community", description: "Connect with learners" },
              { icon: Shield, title: "Money-Back", description: "30-day guarantee" },
              { icon: Zap, title: "Fast Support", description: "24/7 help available" },
            ].map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="font-display text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center bg-secondary rounded-2xl p-12">
          <h2 className="font-display text-2xl font-bold mb-4">
            Still have questions?
          </h2>
          <p className="text-muted-foreground mb-6">
            Our team is here to help you find the right plan for your needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact">
              <Button variant="default" size="lg">Contact Sales</Button>
            </Link>
            <Link to="/help">
              <Button variant="outline" size="lg">Visit Help Center</Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PricingPage;
