import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CopyProtection } from "@/components/security/CopyProtection";
import { PromoBanner } from "@/components/home/PromoBanner";
import { AIChatbot } from "@/components/chatbot/AIChatbot";

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export function Layout({ children, hideFooter = false }: LayoutProps) {
  return (
    <CopyProtection>
      <div className="min-h-screen flex flex-col">
        <PromoBanner />
        <Navbar />
        <main className="flex-1">{children}</main>
        {!hideFooter && <Footer />}
        <AIChatbot />
      </div>
    </CopyProtection>
  );
}

