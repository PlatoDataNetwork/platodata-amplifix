import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Layers } from "lucide-react";

const VerticalsManagement = () => {
  // Fetch verticals with article counts
  const { data: verticals, isLoading } = useQuery({
    queryKey: ["admin-verticals-detailed"],
    queryFn: async () => {
      // Get all unique verticals with their article counts
      const { data, error } = await supabase
        .from("articles")
        .select("vertical_slug")
        .not("vertical_slug", "is", null);
      
      if (error) throw error;

      // Count articles per vertical
      const counts: Record<string, number> = {};
      data?.forEach((article) => {
        const slug = article.vertical_slug;
        counts[slug] = (counts[slug] || 0) + 1;
      });

      // Convert to array and sort
      return Object.entries(counts)
        .map(([slug, count]) => ({ slug, count }))
        .sort((a, b) => b.count - a.count);
    },
  });

  const formatVerticalName = (slug: string) => {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Verticals Overview</h2>
          <p className="text-muted-foreground text-sm">
            View all content verticals and their article counts
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Layers className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm text-foreground font-medium">About Verticals</p>
            <p className="text-sm text-muted-foreground mt-1">
              Verticals are automatically created when articles are published. Each vertical represents a content category derived from the article's vertical_slug field.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-2xl font-bold text-primary">{verticals?.length ?? "--"}</p>
          <p className="text-sm text-muted-foreground">Total Verticals</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-2xl font-bold text-primary">
            {verticals?.reduce((sum, v) => sum + v.count, 0) ?? "--"}
          </p>
          <p className="text-sm text-muted-foreground">Total Articles</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-2xl font-bold text-primary">
            {verticals?.length ? Math.round(verticals.reduce((sum, v) => sum + v.count, 0) / verticals.length) : "--"}
          </p>
          <p className="text-sm text-muted-foreground">Avg Articles/Vertical</p>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Vertical</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Articles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : verticals?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No verticals found
                </TableCell>
              </TableRow>
            ) : (
              verticals?.map((vertical) => (
                <TableRow key={vertical.slug} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    <Badge variant="outline" className="bg-primary/5">
                      {formatVerticalName(vertical.slug)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {vertical.slug}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm font-medium text-foreground">
                      {vertical.count}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default VerticalsManagement;
