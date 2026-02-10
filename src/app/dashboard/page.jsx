"use client";

import { Spinner } from "@/components/ui/loader";
import { useSelector } from "react-redux";
import { AlertCircle } from "lucide-react";
import React from "react";
import { MainDashboard } from "./MainDashboard";
import { SiteDashboard } from "./SiteDashboard";
import { useUserRoleLevel } from "@/utils/roles";

export function DashboardPage() {
  // Get current user's role and user info
  const roleLevel = useUserRoleLevel();
  const { user } = useSelector((state) => state.auth);

  // Loading or unauthenticated state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-8 h-8" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!roleLevel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-2">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <div className="text-lg font-semibold">Unauthorized</div>
        <div className="text-sm text-gray-500">
          Your account does not have access to any dashboards.
        </div>
      </div>
    );
  }

  // Conditional render
  if (roleLevel.role === "admin") {
    return <MainDashboard />;
  }
  if (roleLevel.role === "site") {
    return <SiteDashboard />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-2">
      <AlertCircle className="w-8 h-8 text-red-500" />
      <div className="text-lg font-semibold">Unknown Role</div>
      <div className="text-sm text-gray-500">
        Unable to load dashboard for your role.
      </div>
    </div>
  );
}
