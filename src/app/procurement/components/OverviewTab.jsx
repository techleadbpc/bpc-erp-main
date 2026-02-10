import React from "react";
import QuickStats from "./QuickStats";
import OrderInfoCard from "./OrderInfoCard";
import VendorInfoCard from "./VendorInfoCard";
import StatusTimelineCard from "./StatusTimelineCard";

const OverviewTab = ({ procurement, invoices }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        <QuickStats procurement={procurement} invoices={invoices} />
        <OrderInfoCard procurement={procurement} />
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Vendor Information */}
        <VendorInfoCard procurement={procurement} />

        {/* Status Timeline */}
        <StatusTimelineCard procurement={procurement} />
      </div>
    </div>
  );
};

export default OverviewTab;
