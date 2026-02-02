import { Lock, Database, FileCheck, Shield } from "lucide-react";

const Security = () => {
  return (
    <section className="py-16 md:py-32 relative" id="security">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-16 md:space-y-32">
          {/* Multi-Layer Security */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="space-y-4 md:space-y-6">
              <p className="text-primary text-xs md:text-sm font-medium tracking-wide uppercase">
                Multi Layered Security Protocol
              </p>
              <h2 className="text-3xl md:text-6xl lg:text-8xl font-bold tracking-tight leading-tight">
                Safeguarding Your Data in an Ultra Secure Private Network
              </h2>
              <p className="text-base md:text-xl text-muted-foreground leading-relaxed">
                Plato employs robust, multi-layered security protocols to protect your data 
                and ensure the integrity of the platform, providing a secure environment for 
                all your research activities.
              </p>
              
              <div className="flex flex-col gap-3 md:gap-4 pt-2 md:pt-4">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">End-to-End Encryption</h4>
                    <p className="text-muted-foreground text-xs md:text-sm">Military-grade encryption protecting all data transfers</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Database className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Decentralized Architecture</h4>
                    <p className="text-muted-foreground text-xs md:text-sm">Distributed network ensuring no single point of failure</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Continuous Monitoring</h4>
                    <p className="text-muted-foreground text-xs md:text-sm">24/7 threat detection and automated response systems</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative hidden md:block">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                <Shield className="w-32 md:w-48 h-32 md:h-48 text-primary/30" />
              </div>
            </div>
          </div>

          {/* Digital Watermarking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="relative hidden md:block order-2 lg:order-1">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                <FileCheck className="w-32 md:w-48 h-32 md:h-48 text-primary/30" />
              </div>
            </div>
            
            <div className="space-y-4 md:space-y-6 order-1 lg:order-2">
              <p className="text-primary text-xs md:text-sm font-medium tracking-wide uppercase">
                Digital Watermarking
              </p>
              <h2 className="text-3xl md:text-6xl lg:text-8xl font-bold tracking-tight leading-tight">
                Create, Embed and Validate Your Content Onchain
              </h2>
              <p className="text-base md:text-xl text-muted-foreground leading-relaxed">
                Harness the power of blockchain to create, embed, and validate data with 
                unmatched security and transparency. By embedding data directly onchain, 
                we enable decentralized trust and real-time data integrity, transforming 
                the way information is managed and shared.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Security;
