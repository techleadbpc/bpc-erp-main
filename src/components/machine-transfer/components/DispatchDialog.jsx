// components/DispatchDialog.jsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api/api-service";

const vehicleTypes = [
  { id: "self_carrying", name: "Self-Carrying Vehicle" },
  { id: "other_carrying", name: "Other-Carrying Vehicle" },
];

const itemOptions = [
  { id: "toolBox", label: "Tool Box" },
  { id: "tyre", label: "Tyre" },
  { id: "fuel", label: "Fuel" },
  { id: "spanner", label: "Spanner" },
];

export default function DispatchDialog({
  open,
  onOpenChange,
  transfer,
  onSuccess,
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [files, setFiles] = useState([]);
  const [transportDetails, setTransportDetails] = useState({
    vehicleType: "",
    vehicleNumber: "",
    driverName: "",
    mobileNumber: "",
    fuelGaugeReading: "",
    odometerReading: "",
    itemsIncluded: [],
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setTransportDetails({
        vehicleType: "",
        vehicleNumber: "",
        driverName: "",
        mobileNumber: "",
        fuelGaugeReading: "",
        odometerReading: "",
        itemsIncluded: [],
      });
      setRemarks("");
      setFiles([]);
    }
  }, [open]);

  const handleSubmit = async () => {
    // Validate vehicle type selection
    if (!transportDetails.vehicleType) {
      toast({
        title: "Validation Error",
        description: "Please select a vehicle type",
        variant: "destructive",
      });
      return;
    }

    // Validate transport details for Other-Carrying Vehicle
    if (
      transportDetails.vehicleType === "other_carrying" &&
      (!transportDetails.vehicleNumber ||
        !transportDetails.driverName ||
        !transportDetails.mobileNumber)
    ) {
      toast({
        title: "Validation Error",
        description:
          "Please fill all transport details for Other-Carrying Vehicle",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      // Append common fields
      formData.append("remarks", remarks);
      formData.append("vehicleType", transportDetails.vehicleType);
      formData.append("fuelGaugeReading", transportDetails.fuelGaugeReading);
      formData.append("odometerReading", transportDetails.odometerReading);
      formData.append(
        "itemsIncluded",
        JSON.stringify(transportDetails.itemsIncluded)
      );

      // Only append transport details for Other-Carrying Vehicle
      if (transportDetails.vehicleType === "other_carrying") {
        formData.append("vehicleNumber", transportDetails.vehicleNumber);
        formData.append("driverName", transportDetails.driverName);
        formData.append("mobileNumber", transportDetails.mobileNumber);
      } else {
        formData.append("vehicleNumber", "");
        formData.append("driverName", "");
        formData.append("mobileNumber", "");
      }

      // Append files
      if (Array.isArray(files) && files.length > 0) {
        files.forEach((file) => {
          if (file && (file instanceof File || file instanceof Blob)) {
            formData.append("files", file, file.name || "upload.bin");
          }
        });
      }

      await api.put(`/transfer/${transfer.id}/dispatch`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        title: "Machine Dispatched",
        description: `The machine has been dispatched successfully using ${
          transportDetails.vehicleType === "self_carrying"
            ? "Self-Carrying Vehicle"
            : "Other-Carrying Vehicle"
        }.`,
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Dispatch error:", error);
      toast({
        title: "Error",
        description: "Failed to dispatch the machine. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[800px] max-w-full">
        <DialogHeader>
          <DialogTitle>Dispatch Machine</DialogTitle>
          <DialogDescription>
            Enter transport details to dispatch this machine.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[50vh] overflow-y-auto">
          {/* Vehicle Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="dispatch-vehicle-type">Vehicle Type</Label>
            <Select
              value={transportDetails.vehicleType}
              onValueChange={(value) =>
                setTransportDetails({
                  ...transportDetails,
                  vehicleType: value,
                  // Reset transport fields when switching vehicle types
                  vehicleNumber:
                    value === "self_carrying"
                      ? ""
                      : transportDetails.vehicleNumber,
                  driverName:
                    value === "self_carrying"
                      ? ""
                      : transportDetails.driverName,
                  mobileNumber:
                    value === "self_carrying"
                      ? ""
                      : transportDetails.mobileNumber,
                })
              }
            >
              <SelectTrigger id="dispatch-vehicle-type">
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transport Details - Only for Other-Carrying Vehicle */}
          {transportDetails.vehicleType === "other_carrying" && (
            <div className="space-y-4 border rounded-md p-4">
              <h3 className="text-sm font-medium">Transport Details</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Required for Other-Carrying Vehicle (requires external
                assistance)
              </p>

              <div className="space-y-2">
                <Label htmlFor="vehicle-number">Vehicle Number</Label>
                <Input
                  id="vehicle-number"
                  placeholder="Enter vehicle number"
                  value={transportDetails.vehicleNumber}
                  onChange={(e) =>
                    setTransportDetails({
                      ...transportDetails,
                      vehicleNumber: e.target.value.toUpperCase(),
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver-name">Driver Name</Label>
                <Input
                  id="driver-name"
                  placeholder="Enter driver name"
                  value={transportDetails.driverName}
                  onChange={(e) =>
                    setTransportDetails({
                      ...transportDetails,
                      driverName: e.target.value.toUpperCase(),
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile-number">Mobile Number</Label>
                <Input
                  id="mobile-number"
                  placeholder="Enter mobile number"
                  value={transportDetails.mobileNumber}
                  onChange={(e) =>
                    setTransportDetails({
                      ...transportDetails,
                      mobileNumber: e.target.value.toUpperCase(),
                    })
                  }
                  required
                />
              </div>
            </div>
          )}

          {/* Information Display for Self-Carrying Vehicle */}
          {transportDetails.vehicleType === "self_carrying" && (
            <div className="space-y-2 border rounded-md p-4 bg-blue-50">
              <h3 className="text-sm font-medium text-blue-900">
                Self-Carrying Vehicle Selected
              </h3>
              <p className="text-xs text-blue-700">
                This vehicle has built-in handling capabilities and operates
                independently. External transport details are not required.
              </p>
            </div>
          )}

          {/* Common Fields for Both Vehicle Types */}
          <div className="space-y-2">
            <Label htmlFor="fuelGaugeReading">Fuel Gauge Reading (Ltrs)</Label>
            <Input
              id="fuelGaugeReading"
              placeholder="5L"
              value={transportDetails.fuelGaugeReading}
              onChange={(e) =>
                setTransportDetails({
                  ...transportDetails,
                  fuelGaugeReading: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="odometerReading">Odometer Reading (kms)</Label>
            <Input
              id="odometerReading"
              placeholder="1000kms"
              value={transportDetails.odometerReading}
              onChange={(e) =>
                setTransportDetails({
                  ...transportDetails,
                  odometerReading: e.target.value,
                })
              }
            />
          </div>

          <div className="w-full">
            <Label htmlFor="dispatch-files">Upload Files</Label>
            <Input
              id="dispatch-files"
              type="file"
              multiple
              onChange={(e) => {
                const selectedFiles = Array.from(e.target.files);
                setFiles(selectedFiles);
              }}
              className="mt-2"
            />
          </div>

          <div className="w-full">
            <Label>Items Included</Label>
            <div className="flex flex-row gap-6 mt-2">
              {itemOptions.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={transportDetails.itemsIncluded.includes(item.id)}
                    onCheckedChange={(checked) => {
                      setTransportDetails((prev) => {
                        const items = prev.itemsIncluded;
                        return {
                          ...prev,
                          itemsIncluded: checked
                            ? [...items, item.id]
                            : items.filter((i) => i !== item.id),
                        };
                      });
                    }}
                  />
                  <Label htmlFor={item.id}>{item.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 mt-2">
            <Label htmlFor="dispatch-remarks">Remarks (Optional)</Label>
            <Textarea
              id="dispatch-remarks"
              placeholder="Add any remarks or notes"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value.toUpperCase())}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            loading={loading}
            onClick={handleSubmit}
            disabled={!transportDetails.vehicleType}
          >
            {loading ? "Processing..." : "Dispatch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
