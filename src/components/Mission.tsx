const Mission = () => {
  return (
    <section className="py-32 relative" id="about">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-6 mb-16">
            <p className="text-primary text-sm font-medium tracking-wide uppercase">
              The Power of Generative AI Reimagined
            </p>
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              We are on a mission to disrupt
              <br />
              the data intelligence market
            </h2>
          </div>
          
          <div className="bg-card border border-border rounded-3xl p-12 md:p-16 space-y-8">
            <p className="text-xl text-muted-foreground leading-relaxed">
              Our mission is to use AI to revolutionize the way people discover and engage with 
              vertical data intelligence. Our platform has created a new way to drive high value 
              across both institutional and prosumer environments.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4">Validated, Realtime Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                  AI-driven data compliance ensures accurate, real-time adherence to regulations 
                  by automating audits, monitoring risks, and providing actionable insights.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4">AI-Driven Compliance</h3>
                <p className="text-muted-foreground leading-relaxed">
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
