import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { PageTransition } from "./PageTransition";
import { ScrollProgress } from "./ScrollProgress";
import { MotionDirector } from "./MotionDirector";
import { ThemeProvider } from "./ThemeProvider";
import { WorldTourExperience } from "./WorldTourExperience";

export function PortfolioFrame({ children }: { children: ReactNode }) {
  return (
    <PageTransition>
      <ThemeProvider>
        <div className="portfolio-site world-tour-enabled min-h-screen">
          <ScrollProgress />
          <MotionDirector />
          <WorldTourExperience />
          <Navbar />
          <main id="main" className="min-h-[calc(100vh-10rem)]">{children}</main>
          <Footer />
        </div>
      </ThemeProvider>
    </PageTransition>
  );
}
