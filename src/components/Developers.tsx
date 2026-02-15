import { Code2, GitBranch, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLangRouting } from "@/hooks/useLangRouting";

const Developers = () => {
  const { withLang } = useLangRouting();

  return (
    <section className="py-16 md:py-32 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 md:space-y-8 mb-10 md:mb-16">
          <p className="text-primary text-xs md:text-sm font-medium tracking-wide uppercase">Developers</p>
          <h2 className="text-3xl md:text-6xl lg:text-8xl font-bold tracking-tight leading-tight px-2">
            Built by developers,
            <br />
            for developers
          </h2>
          <p className="text-base md:text-xl text-muted-foreground leading-relaxed px-2">
            Built for developers, by developers—engineered with precision, performance, and purpose. Every line of code is
            crafted to empower innovation, streamline workflows, and accelerate your development journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          <div className="group p-5 md:p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--card-glow)] animate-fade-in flex flex-col">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-secondary flex items-center justify-center mb-4 md:mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Code2 className="w-6 h-6 md:w-8 md:h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-4 text-foreground">Clean APIs</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6 md:mb-8 flex-grow">
              RESTful and GraphQL endpoints designed for seamless integration and developer productivity.
            </p>
            <Link to={withLang("/solutions")} className="w-full">
              <Button
                variant="secondary"
                size="lg"
                className="w-full bg-secondary hover:bg-secondary/80 text-foreground text-sm md:text-base"
              >
                Learn More
              </Button>
            </Link>
          </div>

          <div
            className="group p-5 md:p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--card-glow)] animate-fade-in flex flex-col"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-secondary flex items-center justify-center mb-4 md:mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <GitBranch className="w-6 h-6 md:w-8 md:h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-4 text-foreground">Version Control</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6 md:mb-8 flex-grow">
              Semantic versioning for stability, compatibility, and predictable updates across releases.
            </p>
            <Link to={withLang("/solutions")} className="w-full">
              <Button
                variant="secondary"
                size="lg"
                className="w-full bg-secondary hover:bg-secondary/80 text-foreground text-sm md:text-base"
              >
                Learn More
              </Button>
            </Link>
          </div>

          <div
            className="group p-5 md:p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--card-glow)] animate-fade-in flex flex-col"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-secondary flex items-center justify-center mb-4 md:mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Terminal className="w-6 h-6 md:w-8 md:h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-4 text-foreground">CLI Tools</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6 md:mb-8 flex-grow">
              Powerful command-line utilities that streamline workflows and boost development efficiency.
            </p>
            <Link to={withLang("/solutions")} className="w-full">
              <Button
                variant="secondary"
                size="lg"
                className="w-full bg-secondary hover:bg-secondary/80 text-foreground text-sm md:text-base"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Developers;
