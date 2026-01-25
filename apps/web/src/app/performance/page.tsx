import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PerformanceOverview from '../../components/performance/PerformanceOverview';

export default function PerformancePage() {
  return (
    <DashboardLayout>
      <PerformanceOverview />
    </DashboardLayout>
  );
}
