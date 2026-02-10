import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, CheckCircle, Clock, Package, Printer, TrendingUp, XCircle } from "lucide-react";
import { useNavigate } from "react-router";

const RequisitionHeader = ({
  requisition,
  getApprovalButton,
  getProcurementButton,
  getIssueButton,
  getClosureButton,
  getRejectButton,
  getCreateComparisonButton,
  handlePrint,
}) => {
  const navigate = useNavigate();
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between sm:flex-row flex-col gap-4 p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/requisitions")}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {requisition?.requisitionNo}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Material Requisition Details
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {getApprovalButton()}
          {/* {getProcurementButton()} */}
          {getIssueButton()}
          {getClosureButton()}
          {getRejectButton()} {/* Add this line */}
          {getCreateComparisonButton()}
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Status and Priority Banner */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            {requisition && (
              <Badge
                variant="outline"
                className={`${requisition.status.toLowerCase() === "pending"
                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                  : requisition.status.toLowerCase() === "approvedbypm"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : requisition.status.toLowerCase() === "approvedbyho"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : requisition.status.toLowerCase() === "forwarded"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : requisition.status.toLowerCase() === "rejected"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : requisition.status.toLowerCase() === "issued"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : requisition.status.toLowerCase() === "received"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                  } flex items-center gap-1`}
              >
                {requisition.status.toLowerCase() === "pending" ||
                  requisition.status.toLowerCase() === "forwarded" ? (
                  <Clock className="h-3 w-3" />
                ) : requisition.status.toLowerCase() === "approvedbypm" ||
                  requisition.status.toLowerCase() === "approvedbyho" ||
                  requisition.status.toLowerCase() === "received" ? (
                  <CheckCircle className="h-3 w-3" />
                ) : requisition.status.toLowerCase() === "rejected" ? (
                  <XCircle className="h-3 w-3" />
                ) : requisition.status.toLowerCase() === "issued" ? (
                  <Package className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                {requisition.status}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Priority:</span>
            {requisition && (
              <Badge
                className={`${requisition.requestPriority.toLowerCase() === "urgent"
                  ? "bg-red-500"
                  : requisition.requestPriority.toLowerCase() === "high"
                    ? "bg-red-400"
                    : requisition.requestPriority.toLowerCase() === "medium"
                      ? "bg-orange-400"
                      : requisition.requestPriority.toLowerCase() === "low"
                        ? "bg-yellow-400"
                        : "bg-gray-400"
                  } text-white flex items-center gap-1`}
              >
                {requisition.requestPriority.toLowerCase() === "urgent" ||
                  requisition.requestPriority.toLowerCase() === "high" ? (
                  <>
                    {requisition.requestPriority.toLowerCase() === "urgent" ? (
                      <AlertTriangle className="h-3 w-3" />
                    ) : (
                      <TrendingUp className="h-3 w-3" />
                    )}
                  </>
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                {requisition.requestPriority}
              </Badge>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-500">
          <Clock className="inline h-4 w-4 mr-1" />
          Created: {formatDate(requisition?.requestedAt)}
        </div>
      </div>
    </>
  );
};

export default RequisitionHeader;
