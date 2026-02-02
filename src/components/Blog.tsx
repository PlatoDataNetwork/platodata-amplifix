import { ArrowRight } from "lucide-react";

const Blog = () => {
  const posts = [
    {
      title: "Introducing enhanced search API functionality with Plato",
      date: "September 18, 2021",
    },
    {
      title: "Introducing standardised smart contract APIs",
      date: "September 18, 2021",
    },
    {
      title: "Partnership Marks Multi-chain Evolution for Smart Contracts",
      date: "September 18, 2021",
    },
  ];

  return (
    <section className="py-16 md:py-32 relative" id="resources">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
          <div className="text-center space-y-3 md:space-y-4">
            <p className="text-primary text-xs md:text-sm font-medium tracking-wide uppercase">Blog</p>
            <h2 className="text-3xl md:text-6xl lg:text-8xl font-bold tracking-tight leading-tight px-2">Latest news on Plato</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {posts.map((post, index) => (
              <div
                key={index}
                className="group p-5 md:p-8 rounded-xl md:rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-video rounded-lg md:rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 mb-4 md:mb-6" />
                
                <div className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">{post.date}</div>
                <h3 className="text-base md:text-xl font-semibold mb-3 md:mb-4 leading-tight group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                
                <div className="flex items-center text-primary text-xs md:text-sm font-medium">
                  Read more
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Blog;
