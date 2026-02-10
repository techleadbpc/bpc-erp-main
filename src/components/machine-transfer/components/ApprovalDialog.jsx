// components/ApprovalDialog.jsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api/api-service";

export default function ApprovalDialog({ 
  open, 
  onOpenChange, 
  transfer, 
  onSuccess, 
  isRejection = false 
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState("");

  const handleSubmit = async () => {
    if (isRejection && !remarks.trim()) {
      toast({
        title: "Validation Error",
        description: "Rejection reason is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const endpoint = isRejection 
        ? `/transfer/${transfer.id}/reject`
        : `/transfer/${transfer.id}/approve`;
      
      await api.put(endpoint, { remarks: remarks.trim() });
      
      toast({
        title: "Success",
        description: `Transfer request ${isRejection ? 'rejected' : 'approved'} successfully`,
      });
      
      onOpenChange(false);
      setRemarks("");
      onSuccess();
    } catch (error) {
      console.error("Approval/Rejection error:", error);
      toast({
        title: "Error",
        description: `Failed to ${isRejection ? 'reject' : 'approve'} transfer request`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isRejection ? 'Reject' : 'Approve'} Transfer Request
          </DialogTitle>
          <DialogDescription>
            {isRejection 
              ? 'Please provide a reason for rejecting this transfer request.'
              : 'You can optionally add remarks for this approval.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="approval-remarks">
              {isRejection ? 'Rejection Reason *' : 'Remarks (Optional)'}
            </Label>
            <Textarea
              id="approval-remarks"
              placeholder={
                isRejection 
                  ? "Enter reason for rejection..." 
                  : "Enter any remarks..."
              }
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              required={isRejection}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setRemarks("");
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
            variant={isRejection ? "destructive" : "default"}
          >
            {loading 
              ? "Processing..." 
              : (isRejection ? "Reject Request" : "Approve Request")
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
