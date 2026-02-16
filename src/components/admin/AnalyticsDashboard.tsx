import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, Eye, MousePointerClick, RefreshCw, Monitor, Smartphone, Tablet, Globe, FileText, Filter } from "lucide-react";

interface GARow {
  dimensionValues: { value: string }[];
  metricValues: { value: string }[];
}

interface GAReport {
  rows?: GARow[];
  totals?: { metricValues: { value: string }[] }[];
  rowCount?: number;
}

const fetchGAData = async (type: string, params?: Record<string, string>): Promise<GAReport> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error("Not authenticated");

  const queryParams = new URLSearchParams({ type, ...params });
  const { data, error } = await supabase.functions.invoke("ga-realtime", {
    headers: { Authorization: `Bearer ${token}` },
    body: null,
    method: "GET",
  });

  // Use fetch directly for query params support
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ga-realtime?${queryParams}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
    }
  );

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || "Failed to fetch analytics");
  }

  return res.json();
};

const DeviceIcon = ({ device }: { device: string }) => {
  const d = device.toLowerCase();
  if (d === "mobile") return <Smartphone className="w-4 h-4" />;
  if (d === "tablet") return <Tablet className="w-4 h-4" />;
  return <Monitor className="w-4 h-4" />;
};

const AnalyticsDashboard = () => {
  const [filterDimension, setFilterDimension] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");
  const [appliedFilter, setAppliedFilter] = useState<{ dimension: string; value: string } | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Main realtime data
  const { data: realtimeData, isLoading: realtimeLoading, refetch: refetchRealtime, error: realtimeError } = useQuery({
    queryKey: ["ga-realtime", appliedFilter],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (appliedFilter?.dimension && appliedFilter?.value) {
        params.filterDimension = appliedFilter.dimension;
        params.filterValue = appliedFilter.value;
      }
      return fetchGAData("realtime", params);
    },
    refetchInterval: autoRefresh ? 30000 : false,
    staleTime: 15000,
  });

  // Device breakdown
  const { data: deviceData, isLoading: deviceLoading, refetch: refetchDevice } = useQuery({
    queryKey: ["ga-realtime-device"],
    queryFn: () => fetchGAData("realtime-overview", { dimension: "deviceCategory" }),
    refetchInterval: autoRefresh ? 30000 : false,
    staleTime: 15000,
  });

  // Country breakdown
  const { data: countryData, isLoading: countryLoading, refetch: refetchCountry } = useQuery({
    queryKey: ["ga-realtime-country"],
    queryFn: () => fetchGAData("realtime-overview", { dimension: "country" }),
    refetchInterval: autoRefresh ? 30000 : false,
    staleTime: 15000,
  });

  // Traffic source breakdown
  const { data: sourceData, isLoading: sourceLoading, refetch: refetchSource } = useQuery({
    queryKey: ["ga-realtime-source"],
    queryFn: () => fetchGAData("realtime-overview", { dimension: "audienceName" }),
    refetchInterval: autoRefresh ? 30000 : false,
    staleTime: 15000,
  });

  const handleRefreshAll = () => {
    refetchRealtime();
    refetchDevice();
    refetchCountry();
    refetchSource();
  };

  const handleApplyFilter = () => {
    if (filterDimension && filterValue) {
      setAppliedFilter({ dimension: filterDimension, value: filterValue });
    }
  };

  const handleClearFilter = () => {
    setFilterDimension("");
    setFilterValue("");
    setAppliedFilter(null);
  };

  // Extract totals from realtime data
  const totalActiveUsers = realtimeData?.totals?.[0]?.metricValues?.[0]?.value || "0";
  const totalPageViews = realtimeData?.totals?.[0]?.metricValues?.[1]?.value || "0";
  const totalConversions = realtimeData?.totals?.[0]?.metricValues?.[2]?.value || "0";
  const totalEvents = realtimeData?.totals?.[0]?.metricValues?.[3]?.value || "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Real-Time Analytics</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Live data from Google Analytics 4
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={autoRefresh ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="w-3 h-3 mr-1" />
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleRefreshAll}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error state */}
      {realtimeError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">
              Error fetching analytics: {(realtimeError as Error).message}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="text-xs text-muted-foreground mb-1 block">Dimension</label>
              <Select value={filterDimension} onValueChange={setFilterDimension}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dimension" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unifiedScreenName">Page Title</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                  <SelectItem value="city">City</SelectItem>
                  <SelectItem value="deviceCategory">Device</SelectItem>
                  <SelectItem value="platform">Platform</SelectItem>
                  <SelectItem value="audienceName">Audience</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="text-xs text-muted-foreground mb-1 block">Contains</label>
              <Input
                placeholder="Filter value..."
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyFilter()}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleApplyFilter} disabled={!filterDimension || !filterValue}>
                Apply
              </Button>
              {appliedFilter && (
                <Button size="sm" variant="outline" onClick={handleClearFilter}>
                  Clear
                </Button>
              )}
            </div>
          </div>
          {appliedFilter && (
            <div className="mt-3">
              <Badge variant="secondary">
                {appliedFilter.dimension} contains "{appliedFilter.value}"
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                {realtimeLoading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{totalActiveUsers}</p>
                )}
                <p className="text-xs text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                {realtimeLoading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{totalPageViews}</p>
                )}
                <p className="text-xs text-muted-foreground">Page Views</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MousePointerClick className="w-5 h-5 text-primary" />
              </div>
              <div>
                {realtimeLoading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{totalEvents}</p>
                )}
                <p className="text-xs text-muted-foreground">Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                {realtimeLoading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{totalConversions}</p>
                )}
                <p className="text-xs text-muted-foreground">Conversions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Sections */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Active Pages */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {realtimeLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : realtimeData?.rows?.length ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {realtimeData.rows.map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-1.5 px-2 rounded hover:bg-muted/50 text-sm">
                    <span className="truncate flex-1 mr-2 text-foreground">{row.dimensionValues[0].value}</span>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {row.metricValues[0].value}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active pages</p>
            )}
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deviceLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : deviceData?.rows?.length ? (
              <div className="space-y-2">
                {deviceData.rows.map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-1.5 px-2 rounded hover:bg-muted/50 text-sm">
                    <div className="flex items-center gap-2">
                      <DeviceIcon device={row.dimensionValues[0].value} />
                      <span className="capitalize text-foreground">{row.dimensionValues[0].value}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {row.metricValues[0].value}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No device data</p>
            )}
          </CardContent>
        </Card>

        {/* Country Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {countryLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : countryData?.rows?.length ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {countryData.rows.map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-1.5 px-2 rounded hover:bg-muted/50 text-sm">
                    <span className="text-foreground">{row.dimensionValues[0].value}</span>
                    <Badge variant="secondary" className="text-xs">
                      {row.metricValues[0].value}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No country data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Traffic Sources */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Traffic Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sourceLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : sourceData?.rows?.length ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
              {sourceData.rows.map((row, i) => (
                <div key={i} className="flex justify-between items-center py-2 px-3 rounded-lg border border-border text-sm">
                  <span className="truncate text-foreground">{row.dimensionValues[0].value || "(direct)"}</span>
                  <Badge variant="secondary" className="text-xs ml-2 shrink-0">
                    {row.metricValues[0].value}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No traffic source data</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
