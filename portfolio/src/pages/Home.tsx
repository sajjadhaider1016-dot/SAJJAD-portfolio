import { About } from '../sections/About';
import { Contact } from '../sections/Contact';
import { Achievements, Certifications, Education, Experience, Services, Skills } from '../sections/Credentials';
import { District } from '../sections/District';
import { Hero } from '../sections/Hero';
import { Journey } from '../sections/Journey';
import { Work } from '../sections/Work';

export function Home() {
  return (
    <>
      <Hero />
      <main id="main" className="sheets">
        <Work />
        <About />
        <Experience />
        <Education />
        <Journey />
        <Skills />
        <Services />
        <Certifications />
        <Achievements />
        <District />
      </main>
      <Contact />
    </>
  );
}
