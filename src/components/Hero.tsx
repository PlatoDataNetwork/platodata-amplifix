const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      
      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-16 md:pb-20 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-6 md:space-y-8 animate-fade-in">
          <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs md:text-sm font-medium mb-2 md:mb-4">
            PLATO AI
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold tracking-[-0.02em] leading-[1.15] md:leading-[1.1]">
            <span className="md:whitespace-nowrap">Secure network protocol</span>
            <br />
            <span className="md:whitespace-nowrap">for the next web</span>
          </h1>
          
          <p className="text-base md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
            Web3 AI code creation, automation, and vertical data Intelligence.
            <br className="hidden md:block" />
            <span className="md:whitespace-nowrap">A decentralized, consensus-driven AI network ensuring trust & transparency.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
