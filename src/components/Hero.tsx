const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      
      {/* Content */}
      <div className="container mx-auto px-6 pt-32 pb-20 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-4">
            PLATO AI
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-tight">
            Secure network protocol
            <br />
            for the next web
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Web3 AI code creation, automation, and vertical data Intelligence.
            <br />
            <span className="whitespace-nowrap">A decentralized, consensus-driven AI network ensuring trust & transparency.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <button className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-medium transition-all hover:scale-105">
              Get Started
            </button>
            <button className="px-8 py-4 border border-border hover:bg-secondary rounded-full font-medium transition-all">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-muted-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
