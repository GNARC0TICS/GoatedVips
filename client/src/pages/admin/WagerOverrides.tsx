import React from 'react';
import WagerOverrideManager from '../../components/admin/WagerOverrideManager';
import AdminLayout from '../../components/admin/AdminLayout';

export default function WagerOverridesPage() {
  return (
    <AdminLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Wager Override Management</h1>
        <p className="mb-8 text-muted-foreground">
          This tool allows administrators to manually override wager amounts for specific users.
          These overrides will take precedence over data from the API until they expire or are deactivated.
        </p>
        
        <WagerOverrideManager />
      </div>
    </AdminLayout>
  );
}