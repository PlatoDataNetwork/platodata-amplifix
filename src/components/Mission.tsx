const Mission = () => {
  return (
    <section className="py-16 md:py-32 relative" id="about">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-4 md:space-y-6 mb-10 md:mb-16">
            <p className="text-primary text-xs md:text-sm font-medium tracking-wide uppercase">
              The Power of Generative AI Reimagined
            </p>
            <h2 className="text-3xl md:text-6xl lg:text-8xl font-bold tracking-tight leading-tight px-2">
              We are the intersection of Web3 and AI.
            </h2>
          </div>
          
          <div className="bg-card border border-border rounded-2xl md:rounded-3xl p-6 md:p-12 lg:p-16 space-y-6 md:space-y-8">
            <p className="text-base md:text-xl text-muted-foreground leading-relaxed">
              Our mission is to use AI to revolutionize the way people discover and engage with 
              vertical data intelligence. Our platform has created a new way to drive high value 
              across both institutional and prosumer environments.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-4 md:pt-8">
              <div>
                <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-4">Validated, Realtime Data</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  AI-driven data compliance ensures accurate, real-time adherence to regulations 
                  by automating audits, monitoring risks, and providing actionable insights.
                </p>
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-4">AI-Driven Compliance</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Our streamlined compliance processes mitigate potential breaches while 
                  enhancing organizational transparency and user security.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;
