import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Layout } from "@/components/Layout";
import ApiSyncMonitor from "@/components/admin/ApiSyncMonitor";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function ApiSyncManagement() {
  useEffect(() => {
    // When component mounts, show info message
    toast({
      title: "API Sync Management",
      description: "Monitor and manage synchronization with the Goated.com API",
    });
  }, []);

  return (
    <Layout>
      <Helmet>
        <title>API Sync Management | Goated Affiliates</title>
      </Helmet>

      <div className="container mx-auto py-6 max-w-7xl">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">API Sync Management</h1>
          </div>

          <Alert className="border border-[#D7FF00]/30 bg-[#D7FF00]/5">
            <InfoIcon className="h-4 w-4 text-[#D7FF00]" />
            <AlertTitle>About API Synchronization</AlertTitle>
            <AlertDescription>
              This panel allows you to monitor and manage the synchronization process between 
              our database and the Goated.com API. The synchronization ensures user profiles and 
              wager statistics are kept up-to-date.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="monitor" className="w-full">
            <TabsList className="w-full max-w-md mx-auto mb-6">
              <TabsTrigger value="monitor" className="flex-1">Monitor</TabsTrigger>
              <TabsTrigger value="verification" className="flex-1">Verification</TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="monitor">
              <ApiSyncMonitor />
            </TabsContent>
            
            <TabsContent value="verification">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Verification Requests</CardTitle>
                  <CardDescription>
                    View and manage user verification requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-4 text-muted-foreground">
                    Verification requests module is coming soon.
                    <br />
                    This will allow users to claim their Goated profiles.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>API Sync Settings</CardTitle>
                  <CardDescription>
                    Configure synchronization parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-4 text-muted-foreground">
                    Settings module is coming soon.
                    <br />
                    This will allow configuring sync frequency and data retention policies.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}