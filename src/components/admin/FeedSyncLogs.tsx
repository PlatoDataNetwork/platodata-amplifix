import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FileText, ExternalLink, CheckCircle, XCircle, Rss, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface FeedSyncLog {
  id: string;
  feed_id: string;
  article_id: string | null;
  original_guid: string;
  original_url: string | null;
  synced_at: string;
  feed_name?: string;
}

interface RssFeed {
  id: string;
  name: string;
}

const PAGE_SIZE = 50;

const FeedSyncLogs = () => {
  const [selectedFeed, setSelectedFeed] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all feeds for filter dropdown
  const { data: feeds } = useQuery({
    queryKey: ["rss-feeds-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rss_feeds")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data as RssFeed[];
    },
  });

  // Fetch total count for pagination
  const { data: totalCount } = useQuery({
    queryKey: ["feed-sync-logs-count", selectedFeed],
    queryFn: async () => {
      let query = supabase
        .from("feed_sync_logs")
        .select("*", { count: "exact", head: true });

      if (selectedFeed !== "all") {
        query = query.eq("feed_id", selectedFeed);
      }

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch stats (all logs for selected feed)
  const { data: stats } = useQuery({
    queryKey: ["feed-sync-logs-stats", selectedFeed],
    queryFn: async () => {
      let query = supabase
        .from("feed_sync_logs")
        .select("article_id");

      if (selectedFeed !== "all") {
        query = query.eq("feed_id", selectedFeed);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      const total = data?.length || 0;
      const successful = data?.filter(log => log.article_id !== null).length || 0;
      const skipped = data?.filter(log => log.article_id === null).length || 0;
      
      return { total, successful, skipped };
    },
  });

  // Fetch paginated sync logs
  const { data: logs, isLoading } = useQuery({
    queryKey: ["feed-sync-logs", selectedFeed, currentPage],
    queryFn: async () => {
      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("feed_sync_logs")
        .select(`
          id,
          feed_id,
          article_id,
          original_guid,
          original_url,
          synced_at
        `)
        .order("synced_at", { ascending: false })
        .range(from, to);

      if (selectedFeed !== "all") {
        query = query.eq("feed_id", selectedFeed);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Map feed names to logs
      const logsWithFeedNames = data?.map(log => {
        const feed = feeds?.find(f => f.id === log.feed_id);
        return {
          ...log,
          feed_name: feed?.name || "Unknown Feed",
        };
      }) || [];

      return logsWithFeedNames as FeedSyncLog[];
    },
    enabled: !!feeds,
  });

  const totalPages = Math.ceil((totalCount || 0) / PAGE_SIZE);
  const startRecord = (currentPage - 1) * PAGE_SIZE + 1;
  const endRecord = Math.min(currentPage * PAGE_SIZE, totalCount || 0);

  const handleFeedChange = (value: string) => {
    setSelectedFeed(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Feed Sync Logs</h2>
        <p className="text-muted-foreground">
          View the history of all RSS feed synchronization activities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Syncs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{stats?.total ?? "--"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Successful Imports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-2xl font-bold text-green-600">{stats?.successful ?? "--"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Skipped (Duplicates)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-muted-foreground" />
              <p className="text-2xl font-bold text-muted-foreground">{stats?.skipped ?? "--"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Rss className="w-5 h-5 text-primary" />
                Sync History
              </CardTitle>
              <CardDescription>
                {totalCount !== undefined && totalCount > 0
                  ? `Showing ${startRecord}-${endRecord} of ${totalCount} records`
                  : "No records found"}
              </CardDescription>
            </div>
            <Select value={selectedFeed} onValueChange={handleFeedChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by feed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Feeds</SelectItem>
                {feeds?.map(feed => (
                  <SelectItem key={feed.id} value={feed.id}>
                    {feed.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : logs && logs.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Original URL</TableHead>
                    <TableHead>Synced At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Rss className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{log.feed_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.article_id ? (
                          <Badge variant="default" className="bg-green-600">
                            <FileText className="w-3 h-3 mr-1" />
                            Imported
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="w-3 h-3 mr-1" />
                            Skipped
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.original_url ? (
                          <a 
                            href={log.original_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 max-w-[300px] truncate"
                          >
                            {log.original_url}
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {format(new Date(log.synced_at), "MMM d, yyyy HH:mm")}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {/* Show page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Rss className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No sync logs yet</p>
              <p className="text-sm">Sync logs will appear here after you sync your feeds</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedSyncLogs;