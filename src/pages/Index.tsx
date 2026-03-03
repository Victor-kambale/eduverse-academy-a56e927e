import { Layout } from "@/components/layout/Layout";
import { PromoCarousel } from "@/components/home/PromoCarousel";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { PartnersSection } from "@/components/home/PartnersSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedCoursesSection } from "@/components/home/FeaturedCoursesSection";
import { TestimonialsSection } from "@/components/testimonials/TestimonialsSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <section className="bg-secondary/30 border-b border-border">
        <PromoCarousel speed="normal" />
      </section>

      <HeroSection />
      <StatsSection />
      <PartnersSection />
      <CategoriesSection />
      <FeaturedCoursesSection />

      {/* Testimonials */}
      <section className="py-20">
        <div className="container">
          <TestimonialsSection />
        </div>
      </section>

      <NewsletterSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
