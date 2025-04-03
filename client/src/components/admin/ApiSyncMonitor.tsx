import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// API fetch function
const fetchApiSync = async (endpoint: string) => {
  const response = await fetch(`/api/sync/${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch API sync data");
  }
  return response.json();
};

// Trigger sync function
const triggerSync = async () => {
  const response = await fetch("/api/sync/trigger", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to trigger sync");
  }
  return response.json();
};

export default function ApiSyncMonitor() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("status");

  // Status query
  const statusQuery = useQuery({
    queryKey: ["apiSync", "status"],
    queryFn: () => fetchApiSync("status"),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // User stats query
  const userStatsQuery = useQuery({
    queryKey: ["apiSync", "userStats"],
    queryFn: () => fetchApiSync("user-stats"),
    refetchInterval: 60000, // Refresh every minute
  });

  // History query
  const historyQuery = useQuery({
    queryKey: ["apiSync", "history"],
    queryFn: () => fetchApiSync("history"),
    enabled: activeTab === "history", // Only fetch when tab is active
  });

  // Trigger sync mutation
  const syncMutation = useMutation({
    mutationFn: triggerSync,
    onSuccess: () => {
      toast({
        title: "Sync Initiated",
        description: "User profile sync has been triggered. Check status for updates.",
      });
      // Invalidate queries to refresh data
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["apiSync"] });
      }, 5000); // Wait 5 seconds before refreshing
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: `Failed to trigger sync: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  // Render sync status badge
  const renderSyncStatus = (timeSinceMinutes: number | null) => {
    if (timeSinceMinutes === null) return <Badge variant="outline">Never Synced</Badge>;
    if (timeSinceMinutes < 10) return <Badge className="bg-green-500">Recent</Badge>;
    if (timeSinceMinutes < 60) return <Badge className="bg-yellow-500">Within Hour</Badge>;
    return <Badge className="bg-red-500">Stale</Badge>;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">API Sync Monitor</CardTitle>
        <CardDescription>
          Monitor and manage synchronization with the external Goated.com API
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="status" className="flex-1">
              Status
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-1">
              User Stats
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              Sync History
            </TabsTrigger>
          </TabsList>

          {/* Status Tab */}
          <TabsContent value="status" className="py-4">
            {statusQuery.isLoading ? (
              <div className="flex justify-center py-8">Loading status...</div>
            ) : statusQuery.isError ? (
              <div className="text-red-500 py-8">
                Error loading sync status: {statusQuery.error instanceof Error ? statusQuery.error.message : "Unknown error"}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Last Sync</CardTitle>
                      <CardDescription>
                        {statusQuery.data?.data?.lastSync ? 
                          formatDate(statusQuery.data.data.lastSync.last_sync_time) : 
                          "Never synced"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 py-1">
                        {renderSyncStatus(statusQuery.data?.data?.timeSinceSyncMinutes)}
                        <span className="text-sm">
                          {statusQuery.data?.data?.timeSinceSyncFormatted}
                        </span>
                      </div>
                      {statusQuery.data?.data?.lastSync && (
                        <div className="mt-2 text-sm">
                          <div>
                            Records: {statusQuery.data.data.lastSync.record_count}
                          </div>
                          <div>
                            Duration: {statusQuery.data.data.lastSync.sync_duration_ms}ms
                          </div>
                          <div>
                            Type: {statusQuery.data.data.lastSync.is_full_sync ? "Full Sync" : "Incremental"}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Sync Status</CardTitle>
                      <CardDescription>
                        Current synchronization state
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Freshness</span>
                          <span>
                            {statusQuery.data?.data?.timeSinceSyncMinutes !== null ? 
                              `${statusQuery.data?.data?.timeSinceSyncMinutes} minutes` : 
                              "N/A"}
                          </span>
                        </div>
                        {statusQuery.data?.data?.timeSinceSyncMinutes !== null && (
                          <Progress 
                            value={Math.max(0, 100 - (statusQuery.data?.data?.timeSinceSyncMinutes / 60 * 100))} 
                            className="h-2" 
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Button 
                  onClick={() => syncMutation.mutate()} 
                  disabled={syncMutation.isPending}
                  className="w-full"
                >
                  {syncMutation.isPending ? "Triggering Sync..." : "Trigger Sync Now"}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* User Stats Tab */}
          <TabsContent value="users" className="py-4">
            {userStatsQuery.isLoading ? (
              <div className="flex justify-center py-8">Loading user stats...</div>
            ) : userStatsQuery.isError ? (
              <div className="text-red-500 py-8">
                Error loading user stats: {userStatsQuery.error instanceof Error ? userStatsQuery.error.message : "Unknown error"}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-3xl font-bold">
                        {userStatsQuery.data?.data?.totalUsers || 0}
                      </CardTitle>
                      <CardDescription>Total Users</CardDescription>
                    </CardHeader>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-3xl font-bold">
                        {userStatsQuery.data?.data?.usersWithGoatedIds || 0}
                      </CardTitle>
                      <CardDescription>Users with Goated IDs</CardDescription>
                      <div className="mt-2">
                        <Progress 
                          value={userStatsQuery.data?.data?.percentWithGoatedIds || 0} 
                          className="h-2" 
                        />
                        <div className="text-xs text-right mt-1">
                          {userStatsQuery.data?.data?.percentWithGoatedIds || 0}%
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-3xl font-bold">
                        {userStatsQuery.data?.data?.usersWithWagerData || 0}
                      </CardTitle>
                      <CardDescription>Users with Wager Data</CardDescription>
                      <div className="mt-2">
                        <Progress 
                          value={userStatsQuery.data?.data?.percentWithWagerData || 0} 
                          className="h-2" 
                        />
                        <div className="text-xs text-right mt-1">
                          {userStatsQuery.data?.data?.percentWithWagerData || 0}%
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="py-4">
            {historyQuery.isLoading ? (
              <div className="flex justify-center py-8">Loading history...</div>
            ) : historyQuery.isError ? (
              <div className="text-red-500 py-8">
                Error loading history: {historyQuery.error instanceof Error ? historyQuery.error.message : "Unknown error"}
              </div>
            ) : (
              <div className="space-y-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">Time</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-right">Records</th>
                      <th className="px-4 py-2 text-right">Duration</th>
                      <th className="px-4 py-2 text-center">Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyQuery.data?.data?.map((record: any) => (
                      <tr key={record.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-2 text-left whitespace-nowrap">
                          {formatDate(record.last_sync_time)}
                        </td>
                        <td className="px-4 py-2 text-left">
                          <Badge variant={record.is_full_sync ? "default" : "outline"}>
                            {record.is_full_sync ? "Full" : "Incremental"}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-right">
                          {record.record_count}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {record.sync_duration_ms ? `${record.sync_duration_ms}ms` : "N/A"}
                        </td>
                        <td className="px-4 py-2 text-center truncate max-w-xs">
                          <span className="text-xs font-mono opacity-70">
                            {record.response_hash ? record.response_hash.substring(0, 20) + "..." : "None"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(historyQuery.data?.data?.length || 0) === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No sync history available
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <div>Data refreshes automatically</div>
        <div>
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </CardFooter>
    </Card>
  );
}