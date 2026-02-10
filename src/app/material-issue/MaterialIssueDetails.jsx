"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import api from "@/services/api/api-service";
import { getIdByRole } from "@/utils/roles";
import { PDFViewer } from "@react-pdf/renderer";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  CheckCircle,
  CheckSquare,
  Clock,
  Download,
  Printer,
  RotateCcw,
  Send,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import MaterialIssuePDF from "./MaterialIssuePDF";

const MaterialIssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPdf, setShowPdf] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const adminRoles = [1, 2, 3];
  const siteRoles = [4, 5, 6];
  const shouldPrint =
    new URLSearchParams(location.search).get("print") === "true";

  useEffect(() => {
    const fetchIssueDetails = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await api.get(`/material-issues/${id}`);

        const data = response.data;
        setIssue(data);
        // If print parameter is present, show PDF
        if (shouldPrint) {
          setShowPdf(true);
        }
      } catch (err) {
        setError(err.message);
        // If issue not found, navigate back to list
        navigate("/issues");
      } finally {
        setLoading(false);
      }
    };

    fetchIssueDetails();
  }, [id, navigate, shouldPrint]);

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    try {
      return format(parseISO(dateString), "HH:mm");
    } catch (error) {
      return "";
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" /> Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1"
          >
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
          >
            <CheckSquare className="h-3 w-3" /> Approved
          </Badge>
        );
      case "in transit":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1"
          >
            <Send className="h-3 w-3" /> In Transit
          </Badge>
        );
      case "returned":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" /> Returned
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status || "Unknown"}</Badge>;
    }
  };

  const handlePrint = () => {
    setShowPdf(true);
  };

  const handleApprove = async () => {
    try {
      setProcessingAction(true);
      // Call the API to approve the issue
      await api.post(`/material-issues/${id}/approve`);

      // Update local state
      setIssue({ ...issue, status: "Approved" });

      // Show success message
      toast({
        title: "Issue Approved",
        description: `Issue ${issue.issueNumber} has been approved successfully.`,
        variant: "success",
      });
    } catch (err) {
      console.error("Error approving issue:", err);

      // Show error message
      toast({
        title: "Approval Failed",
        description:
          "There was an error approving this issue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleIssueConsume = async () => {
    try {
      setProcessingAction(true);
      // Call the API to issue the materials
      await api.post(`/material-issues/${id}/consume`);

      // Update local state with appropriate status
      // For site transfers, set to "In Transit" rather than "Completed"
      const newStatus =
        issue.issueType?.toLowerCase() === "site transfer"
          ? "In Transit"
          : "Completed";
      setIssue({ ...issue, status: newStatus });

      // Show success message
      toast({
        title: "Materials Issued",
        description: `Issue ${issue.issueNumber} has been processed successfully.`,
        variant: "success",
      });
    } catch (err) {
      console.error("Error issuing materials:", err);

      // Show error message
      toast({
        title: "Issue Failed",
        description:
          "There was an error processing this issue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };
  const handleIssueDispatch = async () => {
    try {
      setProcessingAction(true);
      // Call the API to issue the materials
      await api.post(`/material-issues/${id}/dispatch`);

      // Update local state with appropriate status
      // For site transfers, set to "In Transit" rather than "Completed"
      const newStatus =
        issue.issueType?.toLowerCase() === "site transfer"
          ? "In Transit"
          : "Completed";
      setIssue({ ...issue, status: newStatus });

      // Show success message
      toast({
        title: "Materials Issued",
        description: `Issue ${issue.issueNumber} has been processed successfully.`,
        variant: "success",
      });
    } catch (err) {
      console.error("Error issuing materials:", err);

      // Show error message
      toast({
        title: "Issue Failed",
        description:
          "There was an error processing this issue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleReceive = async () => {
    try {
      setProcessingAction(true);
      // Call the API to mark materials as received
      await api.post(`/material-issues/${id}/receive`);

      // Update local state
      setIssue({ ...issue, status: "Completed" });

      // Show success message
      toast({
        title: "Materials Received",
        description: `Materials for ${issue.issueNumber} have been received successfully.`,
        variant: "success",
      });
    } catch (err) {
      console.error("Error marking materials as received:", err);

      // Show error message
      toast({
        title: "Receive Failed",
        description:
          "There was an error marking materials as received. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (error && !issue) {
    return (
      <div className="text-red-500">Error loading issue details: {error}</div>
    );
  }

  if (!issue) {
    return (
      <div className="flex justify-center items-center h-64">
        Issue not found
      </div>
    );
  }

  // Get from and to site data
  const fromSite = issue.fromSite || {};
  const toSite = issue.toSite || {};

  // Format data for PDF
  const pdfData = {
    issueNo: issue.issueNumber,
    issueDate: issue.issueDate,
    issueTime: formatTime(issue.issueDate),
    issueLocation: fromSite.name,
    fromSite: fromSite.name,
    toSite: toSite.name,
    status: issue.status,
  };

  // Check if status is pending or approved to show appropriate action buttons
  const isPending = issue.status?.toLowerCase() === "pending";
  const isApproved = issue.status?.toLowerCase() === "approved";
  const isInTransit = issue.status?.toLowerCase() === "dispatched";
  const isSiteTransfer = issue.issueType?.toLowerCase() === "site transfer";

  return (
    <div className="space-y-6">
      {!showPdf ? (
        <>
          <div className="flex items-center justify-between sm:flex-row flex-col gap-4 p-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/issues")}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">
                Material Issue: {issue.issueNumber}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {/* {getStatusBadge(issue.status)} */}

              {/* Action Buttons based on status */}
              {isPending &&
                adminRoles.includes(user.role?.id) &&
                issue.issueType == "Site Transfer" && (
                  <Button
                    onClick={handleApprove}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={processingAction}
                  >
                    <CheckSquare className="mr-2 h-4 w-4" /> Approve
                  </Button>
                )}

              {isPending &&
                siteRoles.includes(user.role?.id) &&
                user.role?.id === getIdByRole("Project Manager") &&
                issue.issueType == "Consumption" && (
                  <Button
                    onClick={handleApprove}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={processingAction}
                  >
                    <CheckSquare className="mr-2 h-4 w-4" /> Approve
                  </Button>
                )}

              {isApproved &&
                siteRoles.includes(user.role?.id) &&
                issue.issueType == "Consumption" &&
                issue.siteId === user?.site?.id && (
                  <Button
                    onClick={handleIssueConsume}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={processingAction}
                  >
                    <Send className="mr-2 h-4 w-4" /> Issue Materials
                  </Button>
                )}

              {isApproved &&
                siteRoles.includes(user.role?.id) &&
                issue.issueType == "Site Transfer" &&
                issue.siteId === user?.site?.id && (
                  <Button
                    onClick={handleIssueDispatch}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={processingAction}
                  >
                    <Truck className="mr-2 h-4 w-4" /> Ready to Dispatch
                  </Button>
                )}

              {isInTransit &&
                isSiteTransfer &&
                siteRoles.includes(user.role?.id) &&
                issue.otherSiteId === user?.site?.id && (
                  <Button
                    onClick={handleReceive}
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={processingAction}
                  >
                    <Download className="mr-2 h-4 w-4" /> Marked as Received
                  </Button>
                )}

              <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Issue Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Issue No</p>
                    <p className="font-medium">{issue.issueNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium">
                      {formatDate(issue.issueDate)}{" "}
                      {formatTime(issue.issueDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Issue Type</p>
                    <p className="font-medium capitalize">{issue.issueType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="font-medium">
                      {getStatusBadge(issue.status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created At</p>
                    <p className="font-medium">{formatDate(issue.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Updated At</p>
                    <p className="font-medium">{formatDate(issue.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>From / To Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">From Site</p>
                    <p className="font-medium">{fromSite.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      From Site Code
                    </p>
                    <p className="font-medium">{fromSite.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">To Site</p>
                    <p className="font-medium">{toSite.name || "NA"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      To Site Code
                    </p>
                    <p className="font-medium">{toSite.code || "NA"}</p>
                  </div>

                  {issue.items?.[0]?.issueTo
                    ?.toLowerCase()
                    ?.includes("vehicle") && (
                      <div>
                        <p className="text-sm text-muted-foreground">Vehicle</p>
                        <p className="font-medium">{issue.items[0].issueTo}</p>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr. No</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Part No.</TableHead>
                      <TableHead>HSN Code</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Issue To</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issue.items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">
                          {item.Item?.name || "N/A"}
                        </TableCell>
                        <TableCell>{item.Item?.partNumber || "N/A"}</TableCell>
                        <TableCell>{item.Item?.hsnCode || "N/A"}</TableCell>
                        <TableCell>
                          {item.quantity} {item.Item?.Unit?.shortName}
                        </TableCell>
                        <TableCell className="capitalize">
                          {issue.issueType !== "Site Transfer"
                            ? item.machine?.machineName +
                            "(" +
                            (item.machine?.registrationNumber || "N/A") +
                            ")"
                            : toSite.name}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="flex flex-col h-screen">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Material Issue PDF Preview</h1>
            <Button variant="outline" onClick={() => setShowPdf(false)}>
              Back to Details
            </Button>
          </div>
          <div className="flex-1 border rounded">
            <PDFViewer width="100%" height="100%" className="border">
              <MaterialIssuePDF formData={pdfData} items={issue.items} />
            </PDFViewer>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialIssueDetails;
