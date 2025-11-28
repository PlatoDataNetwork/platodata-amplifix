const Stats = () => {
  const stats = [
    { value: "35+", label: "Languages" },
    { value: "200M+", label: "Organic Impressions" },
    { value: "13M+", label: "Engagements" },
    { value: "70K+", label: "Global Enterprises" },
  ];

  return (
    <section className="py-32 relative" id="protocol">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <p className="text-primary text-sm font-medium tracking-wide uppercase">
              Content Syndication
            </p>
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              AI Powered Press Release
              <br />
              and Content Syndication
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-5xl md:text-6xl font-bold text-primary mb-3">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="text-center pt-16">
            <h3 className="text-3xl font-bold mb-4">Trusted by millions</h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Millions of users rely on our platform for secure, transparent, and reliable solutions. 
              Our commitment to excellence has earned the trust of businesses and creators worldwide, 
              empowering them to innovate with confidence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
