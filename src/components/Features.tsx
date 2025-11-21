import { Zap, Box, FileCode2, Users, Shield, Plug } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: "Fast & Seamless",
      description: "Experience lightning-fast, frictionless interactions that keep you ahead of the curve.",
    },
    {
      icon: Box,
      title: "Unique Functionality",
      description: "Unlock unparalleled features designed to transform your digital experience.",
    },
    {
      icon: FileCode2,
      title: "Smart Contracts",
      description: "Automate trust and execution with self-executing, tamper-proof agreements.",
    },
    {
      icon: Users,
      title: "Community Integration",
      description: "Empower and engage a vibrant community through decentralized collaboration.",
    },
    {
      icon: Shield,
      title: "Secure & Transparent",
      description: "Trust in a platform built with cutting-edge security and full transparency.",
    },
    {
      icon: Plug,
      title: "API Functionality",
      description: "Easily integrate powerful tools with flexible, scalable APIs for limitless possibilities.",
    },
  ];

  return (
    <section className="py-32 relative" id="solutions">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--card-glow)] animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
