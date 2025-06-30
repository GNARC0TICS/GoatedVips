import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Settings, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Search,
  Plus,
  RefreshCw,
  AlertTriangle,
  Link,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';

// Admin dashboard tabs
type AdminTab = 'users' | 'wagers' | 'adjustments' | 'linking' | 'sync' | 'settings';

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#14151A] flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You need admin privileges to access this page.</p>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'wagers', label: 'Wager Overview', icon: DollarSign },
    { id: 'adjustments', label: 'Adjustments', icon: TrendingUp },
    { id: 'linking', label: 'Account Linking', icon: Link },
    { id: 'sync', label: 'Data Sync', icon: RefreshCw },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#14151A] text-white">
      {/* Header */}
      <div className="bg-[#1A1B21] border-b border-[#2A2B31] p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-[#D7FF00]" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-400">Welcome back, {user?.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search users, adjustments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#14151A] border-[#2A2B31] text-white w-80"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <Card className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as AdminTab)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                        isActive
                          ? 'bg-[#D7FF00] text-black font-semibold'
                          : 'text-gray-300 hover:bg-[#2A2B31] hover:text-white'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.label}
                    </motion.button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'users' && <UserManagementTab searchQuery={searchQuery} />}
              {activeTab === 'wagers' && <WagerOverviewTab />}
              {activeTab === 'adjustments' && <AdjustmentsTab searchQuery={searchQuery} />}
              {activeTab === 'linking' && <LinkingManagementTab searchQuery={searchQuery} />}
              {activeTab === 'sync' && <DataSyncTab />}
              {activeTab === 'settings' && <SettingsTab />}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// User Management Tab
function UserManagementTab({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">User Management</h2>
        <Button className="bg-[#D7FF00] text-black hover:bg-[#D7FF00]/90">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card className="p-6">
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">User Management Interface</h3>
          <p className="text-gray-400 mb-6">
            Search and manage platform users, view their profiles, and manage permissions.
          </p>
          <p className="text-sm text-yellow-500">
            Coming soon: Full user management interface with search, filtering, and bulk operations.
          </p>
        </div>
      </Card>
    </div>
  );
}

// Wager Overview Tab
function WagerOverviewTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Wager Overview</h2>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-[#D7FF00]" />
            <div>
              <p className="text-sm text-gray-400">Total Wagered</p>
              <p className="text-xl font-bold">$2,547,892</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Active Users</p>
              <p className="text-xl font-bold">2,258</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Adjustments</p>
              <p className="text-xl font-bold">47</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-8 w-8 text-purple-400" />
            <div>
              <p className="text-sm text-gray-400">Last Sync</p>
              <p className="text-xl font-bold">2m ago</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="text-center py-12">
          <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Wager Analytics Dashboard</h3>
          <p className="text-gray-400 mb-6">
            View comprehensive wager statistics, trends, and real-time data.
          </p>
          <p className="text-sm text-yellow-500">
            Coming soon: Interactive charts, filtering options, and detailed analytics.
          </p>
        </div>
      </Card>
    </div>
  );
}

// Adjustments Tab
function AdjustmentsTab({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Wager Adjustments</h2>
        <Button className="bg-[#D7FF00] text-black hover:bg-[#D7FF00]/90">
          <Plus className="h-4 w-4 mr-2" />
          New Adjustment
        </Button>
      </div>

      <Card className="p-6">
        <div className="text-center py-12">
          <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Wager Adjustment Management</h3>
          <p className="text-gray-400 mb-6">
            Create, view, and manage manual wager adjustments for abuse prevention.
          </p>
          <div className="space-y-2 text-sm text-gray-400">
            <p>• Add or subtract wager amounts for specific timeframes</p>
            <p>• Set absolute wager values for users</p>
            <p>• Track adjustment history with full audit trail</p>
            <p>• Revert adjustments when needed</p>
          </div>
          <p className="text-sm text-yellow-500 mt-6">
            Coming soon: Full adjustment interface with user search, bulk operations, and history tracking.
          </p>
        </div>
      </Card>
    </div>
  );
}

// Data Sync Tab
function DataSyncTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Data Synchronization</h2>
        <Button className="bg-[#D7FF00] text-black hover:bg-[#D7FF00]/90">
          <RefreshCw className="h-4 w-4 mr-2" />
          Sync Now
        </Button>
      </div>

      <Card className="p-6">
        <div className="text-center py-12">
          <RefreshCw className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">External API Synchronization</h3>
          <p className="text-gray-400 mb-6">
            Manage synchronization with Goated.com API and monitor data integrity.
          </p>
          <div className="space-y-2 text-sm text-gray-400">
            <p>• Manual sync for specific users or all users</p>
            <p>• Scheduled automatic synchronization</p>
            <p>• Sync logs and error monitoring</p>
            <p>• Data validation and integrity checks</p>
          </div>
          <p className="text-sm text-yellow-500 mt-6">
            Coming soon: Sync status dashboard, error logs, and sync scheduling interface.
          </p>
        </div>
      </Card>
    </div>
  );
}

// Linking Management Tab
function LinkingManagementTab({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Account Linking Management</h2>
        <Button className="bg-[#D7FF00] text-black hover:bg-[#D7FF00]/90">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Requests
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-400" />
            <div>
              <p className="text-sm text-gray-400">Pending Requests</p>
              <p className="text-xl font-bold">12</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Approved Today</p>
              <p className="text-xl font-bold">8</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-400" />
            <div>
              <p className="text-sm text-gray-400">Rejected Today</p>
              <p className="text-xl font-bold">2</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Link className="h-8 w-8 text-[#D7FF00]" />
            <div>
              <p className="text-sm text-gray-400">Total Linked</p>
              <p className="text-xl font-bold">1,847</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="text-center py-12">
          <Link className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Account Linking Management</h3>
          <p className="text-gray-400 mb-6">
            Review and approve user requests to link their platform accounts with their Goated.com accounts.
          </p>
          <div className="space-y-2 text-sm text-gray-400">
            <p>• Review verification evidence provided by users</p>
            <p>• Approve or reject linking requests with detailed notes</p>
            <p>• Verify account ownership through multiple methods</p>
            <p>• Track linking history and manage unlinking requests</p>
            <p>• Bulk operations for efficient request processing</p>
          </div>
          <p className="text-sm text-yellow-500 mt-6">
            Coming soon: Full linking management interface with request queue, verification tools, and approval workflows.
          </p>
        </div>
      </Card>
    </div>
  );
}

// Settings Tab
function SettingsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Admin Settings</h2>

      <Card className="p-6">
        <div className="text-center py-12">
          <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Platform Configuration</h3>
          <p className="text-gray-400 mb-6">
            Configure platform settings, API endpoints, and system preferences.
          </p>
          <p className="text-sm text-yellow-500">
            Coming soon: System configuration, API settings, and admin preferences.
          </p>
        </div>
      </Card>
    </div>
  );
}