import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertCircle, 
  Users, 
  Database, 
  BarChart3, 
  Clock,
  LogOut
} from 'lucide-react';

// Types for the data we'll be receiving from the API
type UserData = {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  isAdmin: boolean;
};

type SystemStats = {
  wheelSpins: number;
  bonusCodes: number;
  wagerRaces: number;
  wagerRaceParticipants: number;
  supportTickets: number;
};

type AnalyticsData = {
  totalUsers: number;
  recentUsers: UserData[];
  stats: SystemStats;
};

export default function GoombasAdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check if user is authenticated as admin
  async function checkAuth() {
    try {
      const response = await fetch('/goombas.net/auth-status', {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.isAdmin) {
        setIsAuthenticated(false);
        setLocation('/goombas.net/login');
        return false;
      }
      
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.error('Auth check error:', err);
      setIsAuthenticated(false);
      setLocation('/goombas.net/login');
      return false;
    }
  }

  // Load analytics data from backend
  async function loadAnalytics() {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/goombas.net/analytics', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // If unauthorized, redirect to login
          setIsAuthenticated(false);
          setLocation('/goombas.net/login');
          return;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load analytics');
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      toast({
        variant: "destructive",
        title: "Failed to load analytics",
        description: err instanceof Error ? err.message : 'An unexpected error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Load user list
  async function loadUsers() {
    // This function would be similar to loadAnalytics
    // We're not implementing it fully here to keep the component simpler
    // It would fetch from '/goombas.net/users' and manage its own state
  }

  // Handle admin logout
  async function handleLogout() {
    try {
      const response = await fetch('/goombas.net/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        toast({
          title: "Logged out successfully",
          description: "Redirecting to login page..."
        });
        
        setIsAuthenticated(false);
        setLocation('/goombas.net/login');
      } else {
        throw new Error('Logout failed');
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: err instanceof Error ? err.message : 'An unexpected error occurred'
      });
    }
  }

  // Check authentication on mount
  useEffect(() => {
    const initialize = async () => {
      const isAuthed = await checkAuth();
      if (isAuthed) {
        loadAnalytics();
      }
    };
    
    initialize();
  }, []);

  // If auth status is still checking, show loading
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Checking authentication...</div>
      </div>
    );
  }

  // If not authenticated, should redirect, but show message just in case
  if (isAuthenticated === false) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be logged in as an admin to access this page.
            Redirecting to login...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Goombas Admin Dashboard</h1>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
                  <div className="space-y-2">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-4 bg-muted rounded w-full"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    User Statistics
                  </CardTitle>
                  <CardDescription>Total registered users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {analytics?.totalUsers ?? 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Active users across the platform
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    System Activity
                  </CardTitle>
                  <CardDescription>Key platform metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Wheel Spins</p>
                      <p className="font-medium">{analytics?.stats.wheelSpins ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bonus Codes</p>
                      <p className="font-medium">{analytics?.stats.bonusCodes ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Wager Races</p>
                      <p className="font-medium">{analytics?.stats.wagerRaces ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Race Participants</p>
                      <p className="font-medium">{analytics?.stats.wagerRaceParticipants ?? 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Support Tickets
                  </CardTitle>
                  <CardDescription>Customer support status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {analytics?.stats.supportTickets ?? 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Active support tickets in the system
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Admin Tools */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer" onClick={() => setLocation('/admin/wager-overrides')}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <BarChart3 className="h-5 w-5" />
                    Wager Overrides
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Manage user wager amount overrides</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Users */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent User Registrations
                </CardTitle>
                <CardDescription>
                  The most recently registered users on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Admin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics?.recentUsers && analytics.recentUsers.length > 0 ? (
                      analytics.recentUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {user.isAdmin ? (
                              <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                                Yes
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs">
                                No
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}