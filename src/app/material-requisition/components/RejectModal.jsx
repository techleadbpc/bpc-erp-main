import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-dropdown-menu";
import { XCircle } from "lucide-react";

const RejectModal = ({
  showRejectModal,
  setShowRejectModal,
  rejectionRemarks,
  setRejectionRemarks,
  handleRejectRequisition,
  isRejecting,
  title = "Reject Material Requisition",
  description = "Please provide a reason for rejecting this material requisition. This action cannot be undone.",
  note = "Once rejected, this requisition will need to be resubmitted for approval.",
  actionLabel = "Reject Requisition",
}) => {
  return (
    <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rejection-remarks">
              Rejection Remarks <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="rejection-remarks"
              placeholder="Please explain the reason..."
              value={rejectionRemarks}
              onChange={(e) => setRejectionRemarks(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> {note}
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowRejectModal(false);
              setRejectionRemarks("");
            }}
            disabled={isRejecting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRejectRequisition}
            disabled={isRejecting || !rejectionRemarks.trim()}
          >
            {isRejecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                {actionLabel}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectModal;
