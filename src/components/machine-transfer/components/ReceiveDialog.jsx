// components/ReceiveDialog.jsx
import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api/api-service";

const itemOptions = [
  { id: "toolBox", label: "Tool Box" },
  { id: "tyre", label: "Tyre" },
  { id: "fuel", label: "Fuel" },
  { id: "spanner", label: "Spanner" },
];

export default function ReceiveDialog({ open, onOpenChange, transfer, onSuccess }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [files, setFiles] = useState([]);
  const [itemsSent, setItemsSent] = useState([]); // Items that were dispatched
  const [itemsReceived, setItemsReceived] = useState([]); // Items checked by receiver

  useEffect(() => {
    if (open && transfer) {
      // Parse itemsIncluded from transfer data
      let sent = [];
      try {
        if (Array.isArray(transfer.itemsIncluded)) {
          sent = transfer.itemsIncluded;
        } else if (typeof transfer.itemsIncluded === "string") {
          sent = JSON.parse(transfer.itemsIncluded);
        }
      } catch (e) {
        console.error("Failed to parse itemsIncluded", e);
        sent = [];
      }
      setItemsSent(sent);
      // Default to assuming all sent items are received
      setItemsReceived(sent);
      setRemarks("");
      setFiles([]);
    }
  }, [open, transfer]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formData = new FormData();

      // Calculate missing items for clarity
      const missingItems = itemsSent.filter(id => !itemsReceived.includes(id));
      const receivedLabels = itemsReceived.map(id => itemOptions.find(opt => opt.id === id)?.label || id).join(", ");
      const missingLabels = missingItems.map(id => itemOptions.find(opt => opt.id === id)?.label || id).join(", ");

      // Construct a detailed remark
      let finalRemarks = remarks;
      if (itemsSent.length > 0) {
        const itemSummary = `\n\n[System Generated]\nItems Received: ${receivedLabels || "None"}\nItems Missing: ${missingLabels || "None"}`;
        finalRemarks += itemSummary;
      }

      formData.append("finalRemarks", finalRemarks);
      // Also send structured data if backend supports it (optional, but good practice)
      formData.append("itemsReceived", JSON.stringify(itemsReceived));

      // Append files if any
      if (Array.isArray(files) && files.length > 0) {
        files.forEach((file) => {
          if (file && (file instanceof File || file instanceof Blob)) {
            formData.append("files", file, file.name || "upload.bin");
          }
        });
      }

      await api.put(`/transfer/${transfer.id}/receive`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        title: "Machine Received",
        description: "The machine has been marked as received successfully.",
      });

      onOpenChange(false);
      setRemarks("");
      setFiles([]);
      onSuccess();
    } catch (error) {
      console.error("Receive error:", error);
      toast({
        title: "Error",
        description: "Failed to mark machine as received. Please try again.",
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
          <DialogTitle>Mark Machine as Received</DialogTitle>
          <DialogDescription>
            Confirm that the machine has been received at the destination site.
            Please verify the items included with the machine.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {itemsSent.length > 0 && (
            <div className="space-y-2 border rounded-md p-3 bg-muted/20">
              <Label className="mb-2 block">Verify Items Sent</Label>
              <div className="grid grid-cols-2 gap-2">
                {itemsSent.map((itemId) => {
                  const itemLabel = itemOptions.find(opt => opt.id === itemId)?.label || itemId;
                  return (
                    <div key={itemId} className="flex items-center space-x-2">
                      <Checkbox
                        id={`recv-${itemId}`}
                        checked={itemsReceived.includes(itemId)}
                        onCheckedChange={(checked) => {
                          setItemsReceived(prev =>
                            checked
                              ? [...prev, itemId]
                              : prev.filter(id => id !== itemId)
                          );
                        }}
                      />
                      <Label htmlFor={`recv-${itemId}`} className="cursor-pointer">
                        {itemLabel}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="receive-remarks">Final Remarks (Optional)</Label>
            <Textarea
              id="receive-remarks"
              placeholder="Add any final remarks or notes about condition..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="receive-files">Upload Files (Optional)</Label>
            <Input
              id="receive-files"
              type="file"
              multiple
              onChange={(e) => {
                const selectedFiles = Array.from(e.target.files);
                setFiles(selectedFiles);
              }}
            />
          </div> */}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setRemarks("");
              setFiles([]);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {loading ? "Processing..." : "Mark as Received"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
