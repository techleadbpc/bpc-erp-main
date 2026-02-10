"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { ArrowLeft, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { pdf, PDFViewer } from "@react-pdf/renderer";
import LogbookPDF from "./logbook-pdf";
import api from "@/services/api/api-service";
import { useNavigate, useParams } from "react-router";
import { Spinner } from "../ui/loader";
import { useSelector } from "react-redux";
import { ROLES } from "@/utils/roles";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export function LogbookDetails() {
  const [showPdf, setShowPdf] = useState(false);
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfloading, setPdfLoading] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionRemarks, setRejectionRemarks] = useState("");
  const [processing, setProcessing] = useState(false);
  const params = useParams();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const userRoleId = user?.roleId;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogbookEntry = async () => {
      try {
        setLoading(true);
        const res = await api.get(`logbook/${params.id}`);
        const data = res.data;

        const mappedEntry = {
          id: data.id,
          date: data.date,
          registrationNo: data.machine?.registrationNumber || "-",
          assetCode: data.machine?.erpCode || "-",
          machineName: data.machine?.machineName || "-",
          siteName: data.site?.name || "-",
          location: data.location,
          dieselOpeningBalance: data.dieselOpeningBalance,
          dieselIssue: data.dieselIssue,
          dieselClosingBalance: data.dieselClosingBalance,
          openingKMReading: data.openingKmReading,
          closingKMReading: data.closingKmReading,
          totalRunKM: data.totalRunKM,
          dieselAvgKM: data.dieselAvgKM,
          openingHrsMeter: data.openingHrsMeter,
          closingHrsMeter: data.closingHrsMeter,
          totalRunHrsMeter: data.totalRunHrsMeter,
          dieselAvgHrsMeter: data.dieselAvgHrsMeter,
          workingDetail: data.workingDetails,
          status: data.status,
          approvedBy: data.approvedBy?.name,
          approvedAt: data.approvedAt,
          rejectedBy: data.rejectedBy?.name,
          rejectedAt: data.rejectedAt,
          rejectionRemarks: data.rejectionRemarks,
          siteId: data.siteId,
        };

        setEntry(mappedEntry);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogbookEntry();
  }, []);


  if (loading) {
    return (
      <Spinner />
    );
  }

  if (!entry) return null;

  const dieselUsed =
    entry.dieselOpeningBalance + entry.dieselIssue - entry.dieselClosingBalance;

  const handleBack = () => {
    navigate("/logbook");
  };

  const handleGeneratePdf = async () => {
    setPdfLoading(true);
    try {
      const blob = await pdf(<LogbookPDF entry={entry} />).toBlob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setProcessing(true);
      await api.post(`logbook/${params.id}/approve`);
      toast({
        title: "Success",
        description: "Logbook entry approved successfully",
      });
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error("Approval error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionRemarks.trim()) {
      toast({
        title: "Error",
        description: "Please provide rejection remarks",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);
      await api.post(`logbook/${params.id}/reject`, { rejectionRemarks });
      toast({
        title: "Success",
        description: "Logbook entry rejected",
      });
      setRejectDialogOpen(false);
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error("Rejection error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    let className = "";
    if (status === "Pending") className = "bg-yellow-100 text-yellow-800 border-yellow-200";
    else if (status === "Approved") className = "bg-green-100 text-green-800 border-green-200";
    else if (status === "Rejected") className = "bg-red-100 text-red-800 border-red-200";

    return (
      <Badge variant="outline" className={className}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <>
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4 mx-1" />
            Back to List
          </Button>
          <Button
            loading={pdfloading}
            variant="outline"
            onClick={handleGeneratePdf}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4 mx-1" />
            Print
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <div>
                <CardTitle>Logbook Entry Details</CardTitle>
                <CardDescription>
                  Complete information for the selected logbook entry
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">
                  {format(new Date(entry.date), "PPP")}
                </div>
                <div className="flex flex-col items-end gap-1 mt-1">
                  <div className="text-sm text-muted-foreground">
                    Entry #{entry.id}
                  </div>
                  {getStatusBadge(entry.status)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {entry.status === "Pending" && userRoleId === ROLES.PROJECT_MANAGER.id && (
              <div className="bg-muted/50 p-4 rounded-lg mb-6 flex items-center justify-between border">
                <div>
                  <h4 className="font-medium">Action Required</h4>
                  <p className="text-sm text-muted-foreground">This entry is pending your approval.</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setRejectDialogOpen(true)}
                    disabled={processing}
                  >
                    Reject
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleApprove}
                    disabled={processing}
                  >
                    {processing ? "Processing..." : "Approve Entry"}
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Machine Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">
                    Asset Code:
                  </div>
                  <div>{entry.assetCode}</div>
                  <div className="text-sm text-muted-foreground">
                    Machine Name:
                  </div>
                  <div>{entry.machineName}</div>
                  <div className="text-sm text-muted-foreground">
                    Registration No:
                  </div>
                  <div>{entry.registrationNo}</div>
                  <div className="text-sm text-muted-foreground">
                    Site Name:
                  </div>
                  <div>{entry.siteName}</div>

                  <div className="text-sm text-muted-foreground">Location:</div>
                  <div>{entry.location}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Diesel Consumption</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">
                    Opening Balance:
                  </div>
                  <div>{entry.dieselOpeningBalance} L</div>

                  <div className="text-sm text-muted-foreground">
                    Diesel Issue:
                  </div>
                  <div>{entry.dieselIssue} L</div>

                  <div className="text-sm text-muted-foreground">
                    Closing Balance:
                  </div>
                  <div>{entry.dieselClosingBalance} L</div>

                  <div className="text-sm text-muted-foreground">
                    Diesel Used:
                  </div>
                  <div className="font-medium">{dieselUsed} L</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Performance Metrics</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">
                    KM Reading (Start):
                  </div>
                  <div>{entry.openingKMReading}</div>

                  <div className="text-sm text-muted-foreground">
                    KM Reading (End):
                  </div>
                  <div>{entry.closingKMReading}</div>

                  <div className="text-sm text-muted-foreground">
                    Total KM Run:
                  </div>
                  <div className="font-medium">{entry.totalRunKM}</div>

                  <div className="text-sm text-muted-foreground">
                    Diesel Efficiency:
                  </div>
                  <div className="font-medium">{entry.dieselAvgKM} KM/L</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Hours Meter</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">
                    Hours Meter (Start):
                  </div>
                  <div>{entry.openingHrsMeter}</div>

                  <div className="text-sm text-muted-foreground">
                    Hours Meter (End):
                  </div>
                  <div>{entry.closingHrsMeter}</div>

                  <div className="text-sm text-muted-foreground">
                    Total Hours Run:
                  </div>
                  <div className="font-medium">{entry.totalRunHrsMeter}</div>

                  <div className="text-sm text-muted-foreground">
                    Diesel per Hour:
                  </div>
                  <div className="font-medium">
                    {entry.dieselAvgHrsMeter} L/Hr
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-lg mb-2">Working Details</h3>
              <p className="text-muted-foreground">
                {entry.workingDetail || "No working details provided."}
              </p>
            </div>

            {entry.status !== "Pending" && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-lg mb-4">Approval Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {entry.status === "Approved" ? (
                    <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-green-700 font-medium">Approved By:</div>
                        <div className="text-green-900">{entry.approvedBy}</div>
                        <div className="text-green-700 font-medium">Approved At:</div>
                        <div className="text-green-900">
                          {entry.approvedAt ? format(new Date(entry.approvedAt), "PPP p") : "-"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="text-red-700 font-medium">Rejected By:</div>
                        <div className="text-red-900">{entry.rejectedBy}</div>
                        <div className="text-red-700 font-medium">Rejected At:</div>
                        <div className="text-red-900">
                          {entry.rejectedAt ? format(new Date(entry.rejectedAt), "PPP p") : "-"}
                        </div>
                      </div>
                      <div className="pt-2 border-t border-red-100">
                        <div className="text-red-700 font-medium text-sm mb-1">Rejection Remarks:</div>
                        <div className="text-red-900 text-sm italic">
                          "{entry.rejectionRemarks || "No remarks provided"}"
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Logbook Entry</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this entry. This will be visible to the store manager.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection remarks here..."
              value={rejectionRemarks}
              onChange={(e) => setRejectionRemarks(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectionRemarks.trim()}
            >
              {processing ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LogbookDetailsWrapper() {
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();

  const handleBack = () => {
    // Add your back navigation logic here
    console.log("Go back to list");
  };

  useEffect(() => {
    const fetchLogbookEntry = async () => {
      try {
        setLoading(true);
        const res = await api.get(`logbook/${params.id}`);
        const data = res.data;
        const mappedEntry = {
          id: data.id,
          date: data.date,
          registrationNo: data.machine?.registrationNumber || "-",
          assetCode: data.machine?.erpCode || "-",
          siteName: data.site?.name || "-",
          location: data.location,
          dieselOpeningBalance: data.dieselOpeningBalance,
          dieselIssue: data.dieselIssue,
          dieselClosingBalance: data.dieselClosingBalance,
          openingKMReading: data.openingKmReading,
          closingKMReading: data.closingKmReading,
          totalRunKM: data.totalRunKM,
          dieselAvgKM: data.dieselAvgKM,
          openingHrsMeter: data.openingHrsMeter,
          closingHrsMeter: data.closingHrsMeter,
          totalRunHrsMeter: data.totalRunHrsMeter,
          dieselAvgHrsMeter: data.dieselAvgHrsMeter,
          workingDetail: data.workingDetails,
        };

        setEntry(mappedEntry);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogbookEntry();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!entry) return <div>No logbook data found.</div>;

  return <LogbookDetails entry={entry} onBack={handleBack} />;
}

// export default LogbookDetailsWrapper;
