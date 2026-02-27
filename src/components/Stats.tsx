const Stats = () => {
  const stats = [
    { value: "35+", label: "Languages" },
    { value: "200M+", label: "Organic Impressions" },
    { value: "13M+", label: "Engagements" },
    { value: "70K+", label: "Global Enterprises" },
  ];

  return (
    <section className="py-16 md:py-32 relative" id="protocol">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-10 md:space-y-16">
          <div className="text-center space-y-4 md:space-y-6">
            <p className="text-primary text-xs md:text-sm font-medium tracking-wide uppercase">
              Content Syndication
            </p>
            <h2 className="text-3xl md:text-6xl lg:text-8xl font-bold tracking-tight leading-tight px-2">
              AI Powered Press Release
              <br />
              and Content Syndication
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-4 md:p-8 rounded-xl md:rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-primary mb-1 md:mb-3">
                  {stat.value}
                </div>
                <div className="text-xs md:text-base text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Stats;
