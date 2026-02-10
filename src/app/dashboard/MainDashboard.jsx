"use client";

import { useState } from "react";
import { CriticalAlerts } from "./components/CriticalAlerts";
import { DashboardHeader } from "./components/DashboardHeader";
import { FinancialStats } from "./components/FinancialStats";
import { InventoryAlerts } from "./components/InventoryAlerts";
import { MachineStatus } from "./components/MachineStatus";
import { MaintenanceDue } from "./components/MaintenanceDue";
import { OverviewCards } from "./components/OverviewCards";
import { RecentActivities } from "./components/RecentActivities";
import { SitesSummary } from "./components/SitesSummary";

export function MainDashboard() {
  const [timeframe, setTimeframe] = useState("month");
  const [activeTab, setActiveTab] = useState("requisitions");
  const [filters] = useState({
    siteId: 1,
    startDate: "2025-06-01",
    endDate: "2025-07-18",
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <DashboardHeader timeframe={timeframe} setTimeframe={setTimeframe} />

        {/* Overview Metrics */}
        <OverviewCards filters={filters} />

        {/* Critical Alerts */}
        <CriticalAlerts filters={filters} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-4">
            <MachineStatus filters={filters} />
            <RecentActivities
              filters={filters}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-4">
            <SitesSummary filters={filters} />
            <InventoryAlerts filters={filters} />
            <MaintenanceDue filters={filters} />
          </div>
        </div>

        {/* Financial Overview */}
        <FinancialStats filters={filters} />
      </div>
    </div>
  );
}
