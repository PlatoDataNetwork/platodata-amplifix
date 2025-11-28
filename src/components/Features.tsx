import { Zap, Box, FileCode2, Users, Shield, Plug, Brain, Hexagon, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Development",
      description: "Build intelligent solutions with cutting-edge machine learning and AI technologies.",
    },
    {
      icon: Hexagon,
      title: "Web3 Development",
      description: "Create decentralized applications with blockchain technology and Web3 infrastructure.",
    },
    {
      icon: Code,
      title: "Software Development",
      description: "Develop robust, scalable software solutions tailored to your business needs.",
    },
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
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">Our Solutions</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover powerful tools and services designed to accelerate your digital transformation with cutting-edge technology and secure infrastructure.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[var(--card-glow)] animate-fade-in flex flex-col"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-8 flex-grow">{feature.description}</p>
                {index < 3 ? (
                  <Link to="/solutions" className="w-full">
                    <Button variant="secondary" size="lg" className="w-full bg-secondary hover:bg-secondary/80 text-foreground">
                      Learn More
                    </Button>
                  </Link>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
