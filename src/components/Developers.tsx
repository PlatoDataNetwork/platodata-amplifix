import { Code2, GitBranch, Terminal } from "lucide-react";

const Developers = () => {
  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            <div className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--card-glow)] animate-fade-in">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Code2 className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Clean APIs</h3>
              <p className="text-muted-foreground leading-relaxed">
                RESTful and GraphQL endpoints designed for seamless integration and developer productivity.
              </p>
            </div>
            
            <div className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--card-glow)] animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <GitBranch className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Version Control</h3>
              <p className="text-muted-foreground leading-relaxed">
                Semantic versioning for stability, compatibility, and predictable updates across releases.
              </p>
            </div>
            
            <div className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--card-glow)] animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Terminal className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">CLI Tools</h3>
              <p className="text-muted-foreground leading-relaxed">
                Powerful command-line utilities that streamline workflows and boost development efficiency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Developers;
