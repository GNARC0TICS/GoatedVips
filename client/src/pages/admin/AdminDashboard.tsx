import React from 'react';
import AnalyticsDashboard from './AnalyticsDashboard';
import { Link } from 'wouter';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <nav className="mb-8 flex gap-4 flex-wrap">
          <Link href="/admin/user-management" className="text-blue-500 hover:underline">User Management</Link>
          <Link href="/admin/wager-races" className="text-blue-500 hover:underline">Wager Races</Link>
          <Link href="/admin/bonus-codes" className="text-blue-500 hover:underline">Bonus Codes</Link>
          <Link href="/admin/notifications" className="text-blue-500 hover:underline">Notifications</Link>
          <Link href="/admin/support" className="text-blue-500 hover:underline">Support</Link>
        </nav>
        <AnalyticsDashboard />
      </div>
    </div>
  );
} 