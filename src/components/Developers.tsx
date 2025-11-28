import { Code2, GitBranch, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Developers = () => {
  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-8 mb-16">
          <p className="text-primary text-sm font-medium tracking-wide uppercase">
            Developers
          </p>
          <h2 className="text-5xl md:text-6xl font-bold leading-tight">
            Built by developers,
            <br />
            for developers
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Built for developers, by developers—engineered with precision, performance,
            and purpose. Every line of code is crafted to empower innovation, streamline
            workflows, and accelerate your development journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--card-glow)] animate-fade-in flex flex-col">
              <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Code2 className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Clean APIs</h3>
              <p className="text-muted-foreground leading-relaxed mb-8 flex-grow">
                RESTful and GraphQL endpoints designed for seamless integration and developer productivity.
              </p>
              <Link to="/solutions" className="w-full">
                <Button variant="secondary" size="lg" className="w-full bg-secondary hover:bg-secondary/80 text-foreground">
                  Learn More
                </Button>
              </Link>
            </div>
            
            <div className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--card-glow)] animate-fade-in flex flex-col" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <GitBranch className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Version Control</h3>
              <p className="text-muted-foreground leading-relaxed mb-8 flex-grow">
                Semantic versioning for stability, compatibility, and predictable updates across releases.
              </p>
              <Link to="/solutions" className="w-full">
                <Button variant="secondary" size="lg" className="w-full bg-secondary hover:bg-secondary/80 text-foreground">
                  Learn More
                </Button>
              </Link>
            </div>
            
            <div className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--card-glow)] animate-fade-in flex flex-col" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Terminal className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">CLI Tools</h3>
              <p className="text-muted-foreground leading-relaxed mb-8 flex-grow">
                Powerful command-line utilities that streamline workflows and boost development efficiency.
              </p>
              <Link to="/solutions" className="w-full">
                <Button variant="secondary" size="lg" className="w-full bg-secondary hover:bg-secondary/80 text-foreground">
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
