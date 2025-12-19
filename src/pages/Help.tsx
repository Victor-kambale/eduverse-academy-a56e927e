import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Search,
  HelpCircle,
  BookOpen,
  CreditCard,
  Award,
  User,
  Settings,
  MessageCircle,
  Mail,
  Phone,
  ChevronRight,
} from "lucide-react";

const helpCategories = [
  {
    title: "Account Basics",
    icon: User,
    questions: [
      { q: "How do I create an account?", a: "Click 'Sign Up Free' on the homepage, enter your email and create a password, then verify your email address." },
      { q: "How do I reset my password?", a: "Click 'Forgot password?' on the login page, enter your email, and follow the instructions sent to your inbox." },
      { q: "How do I update my profile information?", a: "Go to Settings > Profile and update your name, photo, and other details." },
      { q: "Can I change my email address?", a: "Yes, go to Settings > Account > Email and follow the verification process." },
    ],
  },
  {
    title: "Courses",
    icon: BookOpen,
    questions: [
      { q: "What's the difference between free and paid courses?", a: "Free courses provide access to course content without certificates. Paid courses include certificates, assignments, and full support." },
      { q: "How do I enroll in a course?", a: "Navigate to the course page and click 'Enroll Now'. For paid courses, complete the checkout process." },
      { q: "Can I download course materials?", a: "Yes, most courses include downloadable resources. Look for the download icon on the course content page." },
      { q: "How long do I have access to a course?", a: "Once enrolled, you have lifetime access to the course materials." },
    ],
  },
  {
    title: "Payments & Refunds",
    icon: CreditCard,
    questions: [
      { q: "What payment methods are accepted?", a: "We accept credit/debit cards (Visa, MasterCard, Amex), PayPal, and various local payment methods." },
      { q: "How do I request a refund?", a: "Contact support within 30 days of purchase with your order ID. We offer a full money-back guarantee." },
      { q: "Are there any discounts available?", a: "Yes! Check our seasonal sales, use coupon codes, or subscribe to our newsletter for exclusive offers." },
      { q: "How do I apply a coupon code?", a: "Enter the code at checkout in the 'Apply Coupon' field before completing payment." },
    ],
  },
  {
    title: "Certificates",
    icon: Award,
    questions: [
      { q: "How do I earn a certificate?", a: "Complete all course modules and pass the final assessment with at least 80% score." },
      { q: "Are certificates verified?", a: "Yes, all certificates include a unique verification ID that employers can verify online." },
      { q: "Can I share my certificate on LinkedIn?", a: "Absolutely! Each certificate page has a 'Share on LinkedIn' button." },
      { q: "What if I don't pass the exam?", a: "You can retake the exam after 24 hours. There's no limit on attempts." },
    ],
  },
];

const topArticles = [
  "How do I apply for Financial Assistance?",
  "What does archived mean?",
  "How do I confirm my email?",
  "What does it cost to take a course?",
  "What is self-paced or instructor-paced?",
];

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = helpCategories.filter((category) => {
    if (!searchQuery) return true;
    return (
      category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.questions.some(
        (q) =>
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  });

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            How can we help you?
          </h1>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Search our help center or browse categories below
          </p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for answers..."
              className="pl-12 h-14 text-lg bg-background text-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container py-12">
        {/* Popular Topics */}
        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">Popular Topics</h2>
          <div className="flex flex-wrap gap-2">
            {["Apply for financial assistance", "Login Issues", "Certificates", "Refunds", "Course Progress"].map((topic) => (
              <Button key={topic} variant="secondary" size="sm" onClick={() => setSearchQuery(topic)}>
                {topic}
              </Button>
            ))}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {filteredCategories.map((category) => (
            <Card
              key={category.title}
              className="cursor-pointer hover-lift transition-all"
              onClick={() => setSelectedCategory(selectedCategory === category.title ? null : category.title)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <category.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{category.title}</h3>
                <p className="text-sm text-muted-foreground">{category.questions.length} articles</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Accordion */}
        {selectedCategory && (
          <div className="mb-12 animate-fade-in">
            <h2 className="font-display text-2xl font-bold mb-6">{selectedCategory}</h2>
            <Card>
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  {helpCategories
                    .find((c) => c.title === selectedCategory)
                    ?.questions.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        )}

        {/* All FAQs */}
        {!selectedCategory && (
          <div className="mb-12">
            <h2 className="font-display text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              {helpCategories.map((category) => (
                <Card key={category.title}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <category.icon className="w-5 h-5 text-accent" />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.slice(0, 2).map((item, index) => (
                        <AccordionItem key={index} value={`${category.title}-${index}`}>
                          <AccordionTrigger className="text-left text-sm">{item.q}</AccordionTrigger>
                          <AccordionContent className="text-muted-foreground text-sm">
                            {item.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                    <Button variant="ghost" size="sm" className="mt-2" onClick={() => setSelectedCategory(category.title)}>
                      View all <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div className="bg-secondary rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold mb-2">Still need help?</h2>
            <p className="text-muted-foreground">Our support team is available 24/7</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <MessageCircle className="w-10 h-10 mx-auto mb-4 text-accent" />
                <h3 className="font-semibold mb-2">Live Chat</h3>
                <p className="text-sm text-muted-foreground mb-4">Chat with our AI assistant</p>
                <Button variant="outline" size="sm">Start Chat</Button>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Mail className="w-10 h-10 mx-auto mb-4 text-accent" />
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-4">We'll respond within 24 hours</p>
                <Button variant="outline" size="sm">Send Email</Button>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Phone className="w-10 h-10 mx-auto mb-4 text-accent" />
                <h3 className="font-semibold mb-2">Phone Support</h3>
                <p className="text-sm text-muted-foreground mb-4">Mon-Fri, 9am-5pm EST</p>
                <Button variant="outline" size="sm">Call Us</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HelpPage;
