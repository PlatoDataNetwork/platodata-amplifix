import { Code2, GitBranch, Terminal } from "lucide-react";

const Developers = () => {
  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <p className="text-primary text-sm font-medium tracking-wide uppercase">
            Developers
          </p>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Built by developers,
            <br />
            for developers
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Built for developers, by developers—engineered with precision, performance, 
            and purpose. Every line of code is crafted to empower innovation, streamline 
            workflows, and accelerate your development journey.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="p-6 rounded-xl bg-card border border-border">
              <Code2 className="w-10 h-10 text-primary mb-4 mx-auto" />
              <h4 className="font-semibold mb-2">Clean APIs</h4>
              <p className="text-sm text-muted-foreground">
                RESTful and GraphQL endpoints
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-card border border-border">
              <GitBranch className="w-10 h-10 text-primary mb-4 mx-auto" />
              <h4 className="font-semibold mb-2">Version Control</h4>
              <p className="text-sm text-muted-foreground">
                Semantic versioning for stability
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-card border border-border">
              <Terminal className="w-10 h-10 text-primary mb-4 mx-auto" />
              <h4 className="font-semibold mb-2">CLI Tools</h4>
              <p className="text-sm text-muted-foreground">
                Powerful command-line utilities
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Developers;
