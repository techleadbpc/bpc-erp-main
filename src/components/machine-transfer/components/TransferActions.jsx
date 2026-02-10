// components/TransferActions.jsx
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  FileDown,
  Package,
  Truck,
  XCircle
} from "lucide-react";

export default function TransferActions({
  transfer,
  roleLevel,
  onApprove,
  onReject,
  onDispatch,
  onReceive,
  handleGenerateChallan,
  loading,
}) {
  // Determine which action buttons to show based on status and user role
  const canApprove =
    (transfer.status === "Pending") && roleLevel.role === "admin";

  const canDispatch =
    transfer.status === "Approved" &&
    !transfer.dispatchedAt &&
    roleLevel.role === "site" &&
    roleLevel.siteId == transfer.currentSite?.id;

  const canReceive =
    transfer.status === "Dispatched" &&
    !transfer.receivedAt &&
    roleLevel.role === "site" &&
    roleLevel.siteId == transfer.destinationSite?.id;

  const showActions = canApprove || canDispatch || canReceive;
  if (transfer.status === "Rejected") {
    return null
  }

  if (!showActions) return (<><Button
    onClick={handleGenerateChallan}
    loading={loading}
    className="gap-2"
  >
    <div className="flex items-center justify-center gap-2">
      <FileDown className="h-4 w-4" />
      <div className="h-4">Download Challan</div>
    </div>
  </Button></>);



  return (
    <div className="flex flex-wrap gap-3">
      {canApprove && (
        <>
          <Button
            onClick={onApprove}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4" />
            Approve Request
          </Button>
          <Button onClick={onReject} variant="destructive" className="gap-2">
            <XCircle className="h-4 w-4" />
            Reject Request
          </Button>
        </>
      )}

      {canDispatch && (
        <Button
          onClick={onDispatch}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Truck className="h-4 w-4" />
          Dispatch Machine
        </Button>
      )}

      {canReceive && (
        <Button
          onClick={onReceive}
          className="gap-2 bg-purple-600 hover:bg-purple-700"
        >
          <Package className="h-4 w-4" />
          Mark as Received
        </Button>
      )}

      <Button
        onClick={handleGenerateChallan}
        loading={loading}
        className="gap-2"
      >
        <div className="flex items-center justify-center gap-2">
          <FileDown className="h-4 w-4" />
          <div className="h-4">Download Challan</div>
        </div>
      </Button>
    </div>
  );
}
