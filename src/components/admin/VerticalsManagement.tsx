import { useState } from "react";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 30;

const VerticalsManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch verticals with article counts using SQL aggregation
  const { data: verticals, isLoading } = useQuery({
    queryKey: ["admin-verticals-detailed"],
    queryFn: async () => {
      // Use RPC or direct query with count aggregation
      const { data, error } = await supabase
        .from("articles")
        .select("vertical_slug")
        .not("vertical_slug", "is", null)
        .not("vertical_slug", "eq", "");

      if (error) throw error;

      // Count articles per vertical
      const counts: Record<string, number> = {};
      data?.forEach((article) => {
        const slug = article.vertical_slug;
        if (slug) {
          counts[slug] = (counts[slug] || 0) + 1;
        }
      });

      // Convert to array and sort by count descending
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

  // Pagination calculations
  const totalItems = verticals?.length ?? 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedVerticals = verticals?.slice(startIndex, endIndex) ?? [];

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }

    return pages;
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
          <p className="text-2xl font-bold text-primary">{totalItems || "--"}</p>
          <p className="text-sm text-muted-foreground">Total Verticals</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-2xl font-bold text-primary">
            {verticals?.reduce((sum, v) => sum + v.count, 0).toLocaleString() ?? "--"}
          </p>
          <p className="text-sm text-muted-foreground">Total Articles</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-2xl font-bold text-primary">
            {verticals?.length ? Math.round(verticals.reduce((sum, v) => sum + v.count, 0) / verticals.length).toLocaleString() : "--"}
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
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : paginatedVerticals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No verticals found
                </TableCell>
              </TableRow>
            ) : (
              paginatedVerticals.map((vertical) => (
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
                      {vertical.count.toLocaleString()}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} verticals
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {getPageNumbers().map((page, idx) =>
                page === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default VerticalsManagement;
