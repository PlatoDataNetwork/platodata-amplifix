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
    <section className="py-32 relative" id="resources">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <p className="text-primary text-sm font-medium tracking-wide uppercase">Blog</p>
            <h2 className="text-6xl md:text-8xl font-bold tracking-tight leading-tight">Latest news on Plato</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 mb-6" />
                
                <div className="text-sm text-muted-foreground mb-3">{post.date}</div>
                <h3 className="text-xl font-semibold mb-4 leading-tight group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                
                <div className="flex items-center text-primary text-sm font-medium">
                  Read more
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
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
