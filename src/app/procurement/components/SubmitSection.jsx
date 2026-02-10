import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const SubmitSection = ({
  navigateBack,
  showReviewModal,
  setShowReviewModal,
  requisition,
  vendors,
  formData,
  procurementItems,
  calculateTotal,
  handleSubmit,
  loading,
}) => {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={() => navigateBack()}>
        Cancel
      </Button>
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogTrigger asChild>
          <Button>Review & Submit</Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Review Procurement Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Requisition:</p>
                <p>{requisition?.requisitionNo || requisition?.number}</p>
              </div>
              <div>
                <p className="font-medium">Vendor:</p>
                <p>
                  {
                    vendors.find(
                      (v) => v.id === parseInt(formData.vendorId)
                    )?.name
                  }
                </p>
              </div>
              <div>
                <p className="font-medium">Expected Delivery:</p>
                <p>
                  {formData.expectedDelivery
                    ? new Date(
                        formData.expectedDelivery
                      ).toLocaleDateString()
                    : "Not specified"}
                </p>
              </div>
              <div>
                <p className="font-medium">Total Amount:</p>
                <p className="font-bold">₹{calculateTotal().toFixed(2)}</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="font-medium mb-2">
                {`Items (Only items with procurement quantity > 0)`}:
              </p>
              <div className="rounded-md border">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center font-medium bg-gray-50 p-4 border-b">
                    <div className="flex-1">Item</div>
                    <div className="w-20">Quantity</div>
                    <div className="w-24">Rate</div>
                    <div className="w-24">Amount</div>
                  </div>
                  {procurementItems
                    .filter((item) => item.procurementQuantity > 0)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center p-4 border-b"
                      >
                        <div className="flex-1">{item.name}</div>
                        <div className="w-20">
                          {item.procurementQuantity}
                        </div>
                        <div className="w-24">
                          ₹{item?.rate ? item?.rate?.toFixed(2) : 0}
                        </div>
                        <div className="w-24">
                          ₹{item.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowReviewModal(false)}
              >
                Back to Edit
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Creating..." : "Create Procurement"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubmitSection;
