import { Brain, Hexagon, Code, Zap, Shield, Cpu, Database, Globe, Rocket } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Solutions = () => {
  const solutions = [
    {
      id: "ai-development",
      icon: Brain,
      title: "AI Development",
      tagline: "Intelligent Solutions for Tomorrow's Challenges",
      description: "Transform your business with cutting-edge artificial intelligence and machine learning solutions. Our AI development services leverage state-of-the-art technologies to build intelligent systems that learn, adapt, and deliver exceptional results.",
      features: [
        {
          icon: Cpu,
          title: "Machine Learning Models",
          description: "Custom ML models trained on your data to solve specific business problems, from predictive analytics to pattern recognition."
        },
        {
          icon: Brain,
          title: "Natural Language Processing",
          description: "Build conversational AI, sentiment analysis, and text processing systems that understand and generate human language."
        },
        {
          icon: Database,
          title: "Computer Vision",
          description: "Implement image recognition, object detection, and visual analysis systems for automated decision-making."
        },
        {
          icon: Rocket,
          title: "AI Integration",
          description: "Seamlessly integrate AI capabilities into your existing systems and workflows for enhanced automation."
        }
      ],
      benefits: [
        "Automate complex decision-making processes",
        "Reduce operational costs by up to 40%",
        "Gain actionable insights from data",
        "Scale intelligence across your organization"
      ]
    },
    {
      id: "web3-development",
      icon: Hexagon,
      title: "Web3 Development",
      tagline: "Building the Decentralized Future",
      description: "Enter the next generation of the internet with our comprehensive Web3 development services. We create decentralized applications, smart contracts, and blockchain solutions that empower users and revolutionize digital interactions.",
      features: [
        {
          icon: Hexagon,
          title: "Smart Contract Development",
          description: "Secure, audited smart contracts on Ethereum, Solana, and other leading blockchain platforms."
        },
        {
          icon: Shield,
          title: "DeFi Solutions",
          description: "Build decentralized finance applications including DEXs, lending protocols, and yield farming platforms."
        },
        {
          icon: Globe,
          title: "NFT Platforms",
          description: "Create NFT marketplaces, minting platforms, and digital collectible ecosystems with full Web3 integration."
        },
        {
          icon: Database,
          title: "Blockchain Infrastructure",
          description: "Deploy and maintain blockchain nodes, validators, and decentralized storage solutions."
        }
      ],
      benefits: [
        "True ownership and data sovereignty",
        "Transparent and immutable transactions",
        "Reduced intermediary costs",
        "Global accessibility without borders"
      ]
    },
    {
      id: "software-development",
      icon: Code,
      title: "Software Development",
      tagline: "Robust Solutions for Modern Business",
      description: "Build powerful, scalable software solutions tailored to your unique business needs. Our full-stack development expertise spans web applications, mobile apps, enterprise systems, and cloud-native architectures.",
      features: [
        {
          icon: Code,
          title: "Full-Stack Development",
          description: "End-to-end application development using modern frameworks like React, Node.js, and cloud-native technologies."
        },
        {
          icon: Zap,
          title: "API Development",
          description: "Design and build robust RESTful and GraphQL APIs that power seamless integrations and data exchange."
        },
        {
          icon: Database,
          title: "Database Architecture",
          description: "Optimize data storage with scalable database solutions including SQL, NoSQL, and distributed systems."
        },
        {
          icon: Shield,
          title: "Security & Compliance",
          description: "Implement enterprise-grade security, encryption, and compliance measures to protect your data and users."
        }
      ],
      benefits: [
        "Accelerate time-to-market",
        "Scale seamlessly with demand",
        "Reduce technical debt",
        "Enhance user experience"
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-8 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Our Solutions
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Empowering businesses with innovative technology solutions across AI, Web3, and custom software development.
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Details */}
      {solutions.map((solution, index) => {
        const Icon = solution.icon;
        return (
          <section 
            key={solution.id} 
            id={solution.id}
            className={`py-20 relative ${index % 2 === 1 ? 'bg-card/30' : ''}`}
          >
            <div className="container mx-auto px-6">
              <div className="max-w-6xl mx-auto">
                {/* Solution Header */}
                <div className="flex items-center gap-4 mb-6 animate-fade-in">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold">{solution.title}</h2>
                    <p className="text-primary text-lg mt-1">{solution.tagline}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-lg text-muted-foreground mb-12 leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  {solution.description}
                </p>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                  {solution.features.map((feature, featureIndex) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <div 
                        key={featureIndex}
                        className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in"
                        style={{ animationDelay: `${0.2 + featureIndex * 0.1}s` }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FeatureIcon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Benefits */}
                <div className="p-8 rounded-xl bg-card border border-border animate-fade-in" style={{ animationDelay: '0.6s' }}>
                  <h3 className="text-xl font-semibold mb-4">Key Benefits</h3>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {solution.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="mt-8 flex gap-4 animate-fade-in" style={{ animationDelay: '0.7s' }}>
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Get Started
                  </Button>
                  <Button size="lg" variant="outline">
                    Schedule Consultation
                  </Button>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Back to Home */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6 text-center">
          <Link to="/">
            <Button variant="ghost" size="lg">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Solutions;
