import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api/api-service";

export const InvoicePaymentDialog = ({ invoice, onPaymentCreated }) => {
  const { toast } = useToast();
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [amount, setAmount] = useState(invoice.amount.toString());
  const [paymentMethod, setPaymentMethod] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentSlipUrl, setPaymentSlipUrl] = useState(null);

  const paymentMethods = [
    { value: "CASH", label: "Cash" },
    { value: "CHEQUE", label: "Cheque" },
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
    { value: "ONLINE_PAYMENT", label: "Online Payment" },
    { value: "OTHER", label: "Other" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const requestBody = {
        invoiceId: invoice.id,
        paymentDate: paymentDate.toISOString(),
        amount: parseFloat(amount),
        paymentMethod,
        remarks,
      };

      // Only include referenceNumber if it's not empty
      if (referenceNumber.trim()) {
        requestBody.referenceNumber = referenceNumber;
      }

      const response = await api.post(
        `/invoices/${invoice.id}/payments`,
        requestBody
      );

      setPaymentSlipUrl(response.data.paymentSlipUrl);
      toast({
        title: "Payment slip generated",
        description: "Payment slip has been successfully created",
      });
      onPaymentCreated?.(response.data.payment);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to generate payment slip",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (paymentSlipUrl) {
      const link = document.createElement("a");
      link.href = paymentSlipUrl;
      link.download = `payment-slip-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Generate Payment
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Payment Slip</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Invoice Number</p>
                <p className="font-medium">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Vendor</p>
                <p className="font-medium">{invoice.vendorName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Invoice Date</p>
                <p className="font-medium">
                  {format(new Date(invoice.invoiceDate), "PPP")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-medium">
                  ₹{parseFloat(invoice.amount).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {paymentDate ? format(paymentDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={paymentDate}
                    onSelect={setPaymentDate}
                    initialFocus
                    required
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Input
                id="referenceNumber"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Transaction ID, Cheque number, etc."
              />
            </div>

            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Input
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional notes about this payment"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              {paymentSlipUrl ? (
                <Button
                  type="button"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Payment Slip
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isGenerating || !paymentMethod}
                  className="gap-2"
                >
                  {isGenerating ? "Generating..." : "Generate Payment Slip"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
