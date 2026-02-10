import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import quotationComparisonService from "@/services/api/quotationComparisonService";
import {
  Calendar,
  CheckCircle,
  Clock,
  Lock,
  Send,
  User,
  XCircle
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { ROLES } from "@/utils/roles";

const ApprovalWorkflow = ({ comparison, onUpdateStatus, userId }) => {
  const user = useSelector((state) => state.auth.user);
  const roleId = user?.roleId;

  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmission = async () => {
    if (!remarks.trim()) {
      setError("Please provide remarks for submission");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const result = await quotationComparisonService.submitComparison(
        comparison.id,
        remarks
      );
      onUpdateStatus(result?.status);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit comparison");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async () => {
    if (!remarks.trim()) {
      setError("Please provide remarks for approval");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const result = await quotationComparisonService.approveComparison(
        comparison.id,
        remarks
      );
      onUpdateStatus(result?.status);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve comparison");
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await quotationComparisonService.lockComparison(
        comparison.id,
        remarks
      );
      onUpdateStatus(result?.status);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to lock comparison");
    } finally {
      setLoading(false);
    }
  };

  const isMechanicalManagerOrHead =
    roleId === ROLES.MECHANICAL_MANAGER.id ||
    roleId === ROLES.MECHANICAL_HEAD.id;
  const isAdmin = roleId === ROLES.ADMIN.id;

  const canSubmit = comparison.status === "draft" && isMechanicalManagerOrHead;
  const canApprove = comparison.status === "submitted" && isAdmin;
  const canLock = comparison.status === "approved" && isAdmin;
  const canEdit = comparison.status === "draft" && isMechanicalManagerOrHead;

  const allItemsHaveVendors = comparison.items?.length > 0 &&
    comparison.items.every(item => item.selectedVendorId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Status Timeline */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              {comparison.status === "draft" ||
                comparison.status === "submitted" ||
                comparison.status === "approved" ||
                comparison.status === "locked" ? (
                <CheckCircle className="h-6 w-6 text-green-50" />
              ) : (
                <Clock className="h-6 w-6 text-gray-30" />
              )}
              <span className="text-xs mt-1">Created</span>
              <span className="text-xs text-muted-foreground">
                {comparison.createdAt
                  ? new Date(comparison.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>

            <div className="h-px w-16 bg-gray-200"></div>

            <div className="flex flex-col items-center">
              {comparison.status === "submitted" ||
                comparison.status === "approved" ||
                comparison.status === "locked" ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <Clock className="h-6 w-6 text-gray-300" />
              )}
              <span className="text-xs mt-1">Submitted</span>
              {comparison.submittedAt && (
                <span className="text-xs text-muted-foreground">
                  {new Date(comparison.submittedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="h-px w-16 bg-gray-200"></div>

            <div className="flex flex-col items-center">
              {comparison.status === "approved" ||
                comparison.status === "locked" ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <Clock className="h-6 w-6 text-gray-300" />
              )}
              <span className="text-xs mt-1">Approved</span>
              {comparison.approvedAt && (
                <span className="text-xs text-muted-foreground">
                  {new Date(comparison.approvedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="h-px w-16 bg-gray-200"></div>

            <div className="flex flex-col items-center">
              {comparison.status === "locked" ? (
                <Lock className="h-6 w-6 text-green-500" />
              ) : (
                <Clock className="h-6 w-6 text-gray-300" />
              )}
              <span className="text-xs mt-1">Locked</span>
              {comparison.lockedAt && (
                <span className="text-xs text-muted-foreground">
                  {new Date(comparison.lockedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Current Status */}
          <div className="flex items-center gap-2">
            <Badge
              variant={
                comparison.status === "draft"
                  ? "outline"
                  : comparison.status === "submitted"
                    ? "secondary"
                    : comparison.status === "approved"
                      ? "default"
                      : "destructive"
              }
            >
              {comparison.status.toUpperCase()}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {comparison.status === "draft" && "Ready for submission"}
              {comparison.status === "submitted" && "Pending approval"}
              {comparison.status === "approved" && "Approved"}
              {comparison.status === "locked" && "Locked - No further changes"}
            </span>
          </div>

          {/* Remarks Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Remarks/Justification</label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add remarks or justification for this action..."
              disabled={!canSubmit && !canApprove && !canLock}
            />
          </div>

          {canSubmit && !allItemsHaveVendors && (
            <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
              <AlertDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Please select a vendor for all items in the comparison table before submitting.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {canSubmit && (
              <Button
                onClick={handleSubmission}
                disabled={loading || !allItemsHaveVendors}
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? "Submitting..." : "Submit for Approval"}
              </Button>
            )}

            {canApprove && (
              <Button onClick={handleApproval} disabled={loading}>
                <CheckCircle className="h-4 w-4 mr-2" />
                {loading ? "Approving..." : "Approve Comparison"}
              </Button>
            )}

            {canLock && (
              <Button
                onClick={handleLock}
                disabled={loading}
                variant="secondary"
              >
                <Lock className="h-4 w-4 mr-2" />
                {loading ? "Locking..." : "Lock Comparison"}
              </Button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Approval Details */}
          {comparison.submittedBy && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Submitted By
              </h4>
              <p className="text-sm">
                {comparison.submittedBy.name} ({comparison.submittedBy.email})
              </p>
              <p className="text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 inline mr-1" />
                {comparison.submittedAt
                  ? new Date(comparison.submittedAt).toLocaleString()
                  : "N/A"}
              </p>
              {comparison.submissionRemarks && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-sm text-blue-800 italic">
                  " {comparison.submissionRemarks} "
                </div>
              )}
            </div>
          )}

          {comparison.approvedBy && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-50" />
                Approved By
              </h4>
              <p className="text-sm">
                {comparison.approvedBy.name} ({comparison.approvedBy.email})
              </p>
              <p className="text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 inline mr-1" />
                {comparison.approvedAt
                  ? new Date(comparison.approvedAt).toLocaleString()
                  : "N/A"}
              </p>
              {comparison.approvalRemarks && (
                <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded text-sm text-green-800 italic">
                  " {comparison.approvalRemarks} "
                </div>
              )}
            </div>
          )}

          {comparison.status === "locked" && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Locked
              </h4>
              <p className="text-xs text-muted-foreground">
                Finalized and generating procurements
              </p>
              {comparison.lockRemarks && (
                <div className="mt-2 p-2 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700 italic">
                  " {comparison.lockRemarks} "
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApprovalWorkflow;
