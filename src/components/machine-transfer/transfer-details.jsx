// transfer-details.jsx
"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserRoleLevel } from "@/utils/roles";

import TransferHeader from "./components/TransferHeader";
import TransferStatusTimeline from "./components/TransferStatusTimeline";
import MachineDetails from "./components/MachineDetails";
import TransportDetails from "./components/TransportDetails";
import TransferActions from "./components/TransferActions";
import ApprovalDialog from "./components/ApprovalDialog";
import DispatchDialog from "./components/DispatchDialog";
import ReceiveDialog from "./components/ReceiveDialog";
import { generateChallanPDF } from "./utils/pdfGenerator";

export default function MachineTransferDetail({
  transferData,
  fetchTransferData,
}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const roleLevel = useUserRoleLevel();

  const [loading, setLoading] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openDispatchDialog, setOpenDispatchDialog] = useState(false);
  const [openReceiveDialog, setOpenReceiveDialog] = useState(false);

  const transfer = transferData.data;

  const handleBack = () => navigate(-1);

  const handleGenerateChallan = async () => {
    try {
      setLoading(true);
      await generateChallanPDF(transfer);
      toast({
        title: "Success",
        description: "Challan PDF generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate challan PDF",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <TransferActions
          transfer={transfer}
          roleLevel={roleLevel}
          onApprove={() => setOpenApproveDialog(true)}
          onReject={() => setOpenRejectDialog(true)}
          onDispatch={() => setOpenDispatchDialog(true)}
          onReceive={() => setOpenReceiveDialog(true)}
          handleGenerateChallan={handleGenerateChallan}
          loading={loading}
        />
      </div>

      <div className="grid gap-6">
        <TransferHeader transfer={transfer} />
        <div className="grid md:grid-cols-2 gap-6">
          <MachineDetails machine={transfer.machine} />
          {transfer.requestType === "Site Transfer" && (
            <TransportDetails
              transfer={transfer}
              currentSite={transfer.currentSite}
              destinationSite={transfer.destinationSite}
            />
          )}
        </div>
        <TransferStatusTimeline transfer={transfer} />

        {/* <TransferActions
          transfer={transfer}
          roleLevel={roleLevel}
          onApprove={() => setOpenApproveDialog(true)}
          onReject={() => setOpenRejectDialog(true)}
          onDispatch={() => setOpenDispatchDialog(true)}
          onReceive={() => setOpenReceiveDialog(true)}
        /> */}
      </div>

      {/* Dialogs */}
      <ApprovalDialog
        open={openApproveDialog}
        onOpenChange={setOpenApproveDialog}
        transfer={transfer}
        onSuccess={fetchTransferData}
      />

      <ApprovalDialog
        open={openRejectDialog}
        onOpenChange={setOpenRejectDialog}
        transfer={transfer}
        onSuccess={fetchTransferData}
        isRejection={true}
      />

      <DispatchDialog
        open={openDispatchDialog}
        onOpenChange={setOpenDispatchDialog}
        transfer={transfer}
        onSuccess={fetchTransferData}
      />

      <ReceiveDialog
        open={openReceiveDialog}
        onOpenChange={setOpenReceiveDialog}
        transfer={transfer}
        onSuccess={fetchTransferData}
      />
    </div>
  );
}
