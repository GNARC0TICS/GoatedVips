import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Import admin components
import UserManagement from '@/pages/admin/UserManagement';
import WagerRaceManagement from '@/pages/admin/WagerRaceManagement';
import BonusCodeManagement from '@/pages/admin/BonusCodeManagement';
import NotificationManagement from '@/pages/admin/NotificationManagement';
import SupportManagement from '@/pages/admin/SupportManagement';

export default function GoombasAdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check if admin is authenticated
  useEffect(() => {
    const isAdmin = localStorage.getItem('isGoombasAdmin');
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You must login to access the admin dashboard',
        variant: 'destructive',
      });
      setLocation('/goombas-login');
      return;
    }

    // Fetch admin dashboard stats
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/goombas.net/dashboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isGoombasAdmin');
    
    // Call the logout endpoint
    fetch('/goombas.net/logout', { method: 'POST' })
      .then(() => {
        toast({
          title: 'Logged out',
          description: 'You have been successfully logged out',
        });
        setLocation('/goombas-login');
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#14151A]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-[#14151A] min-h-screen p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#D7FF00]">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 gap-2 mb-8">
          <TabsTrigger value="dashboard">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="races">Wager Races</TabsTrigger>
          <TabsTrigger value="bonus">Bonus Codes</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="border-[#2A2C34] bg-[#1A1C23]">
              <CardHeader>
                <CardTitle className="text-gray-200">Total Users</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold text-white">
                {stats?.userCount || 0}
              </CardContent>
            </Card>

            <Card className="border-[#2A2C34] bg-[#1A1C23]">
              <CardHeader>
                <CardTitle className="text-gray-200">Active Races</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold text-white">
                {stats?.activeRaces || 0}
              </CardContent>
            </Card>

            <Card className="border-[#2A2C34] bg-[#1A1C23]">
              <CardHeader>
                <CardTitle className="text-gray-200">Pending Bonuses</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold text-white">
                {stats?.pendingBonuses || 0}
              </CardContent>
            </Card>
          </div>

          <Card className="border-[#2A2C34] bg-[#1A1C23]">
            <CardHeader>
              <CardTitle className="text-gray-200">Quick Actions</CardTitle>
              <CardDescription className="text-gray-400">
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button variant="outline" onClick={() => setActiveTab('users')}>
                  Manage Users
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('races')}>
                  Manage Races
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('bonus')}>
                  Manage Bonuses
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('support')}>
                  View Support Tickets
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="races">
          <WagerRaceManagement />
        </TabsContent>

        <TabsContent value="bonus">
          <BonusCodeManagement />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationManagement />
        </TabsContent>

        <TabsContent value="support">
          <SupportManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}