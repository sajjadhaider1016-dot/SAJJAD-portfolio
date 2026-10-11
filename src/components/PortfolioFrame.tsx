import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { PageTransition } from "./PageTransition";
import { ScrollProgress } from "./ScrollProgress";
import { MotionDirector } from "./MotionDirector";
import { ThemeProvider } from "./ThemeProvider";
import { PortfolioIntro } from "./PortfolioIntro";

export function PortfolioFrame({ children }: { children: ReactNode }) {
  return (
    <PageTransition>
      <ThemeProvider>
        <div className="portfolio-site min-h-screen">
          <ScrollProgress />
          <PortfolioIntro />
          <MotionDirector />
          <Navbar />
          <main id="main" className="min-h-[calc(100vh-10rem)]">{children}</main>
          <Footer />
        </div>
      </ThemeProvider>
    </PageTransition>
  );
}
