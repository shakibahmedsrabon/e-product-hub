/**
 * Shared layout component wrapping Header + Footer.
 * In Next.js, this becomes app/layout.tsx.
 */
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import React from "react";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
