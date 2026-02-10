// components/InvoiceForm.jsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, FileText } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

const InvoiceForm = ({ procurement, onSave }) => {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  // const [amount, setAmount] = useState(""); // Calculated automatically
  const [invoiceDate, setInvoiceDate] = useState(null);
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState([]);
  const [loading, setLoading] = useState(false);

  // State for item selection
  const [selectedItems, setSelectedItems] = useState(
    procurement.ProcurementItems.map((item) => ({
      ...item,
      isSelected: false,
      currentInvoiceQuantity: 0,
    }))
  );

  const handleItemSelection = (index, isSelected) => {
    const newItems = [...selectedItems];
    newItems[index].isSelected = isSelected;
    // Default to remaining quantity if selected
    if (isSelected) {
      const remaining =
        newItems[index].quantity - (newItems[index].receivedQuantity || 0);
      newItems[index].currentInvoiceQuantity = remaining > 0 ? remaining : 0;
    } else {
      newItems[index].currentInvoiceQuantity = 0;
    }
    setSelectedItems(newItems);
  };

  const handleQuantityChange = (index, quantity) => {
    const newItems = [...selectedItems];
    const item = newItems[index];
    const maxQty = item.quantity - (item.receivedQuantity || 0);

    // Validate quantity
    let newQty = parseInt(quantity) || 0;
    if (newQty < 0) newQty = 0;
    if (newQty > maxQty) newQty = maxQty;

    item.currentInvoiceQuantity = newQty;
    setSelectedItems(newItems);
  };

  // Calculate total amount based on selected items
  const totalAmount = selectedItems.reduce((sum, item) => {
    if (item.isSelected) {
      return sum + item.currentInvoiceQuantity * item.rate;
    }
    return sum;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Filter only selected items with quantity > 0
      const itemsToSubmit = selectedItems
        .filter((item) => item.isSelected && item.currentInvoiceQuantity > 0)
        .map((item) => ({
          procurementItemId: item.id,
          quantity: item.currentInvoiceQuantity,
          rate: item.rate,
          amount: item.currentInvoiceQuantity * item.rate,
        }));

      if (itemsToSubmit.length === 0) {
        alert("Please select at least one item with valid quantity");
        setLoading(false);
        return;
      }

      await onSave({
        procurementId: procurement.id,
        invoiceNumber,
        amount: totalAmount,
        invoiceDate,
        notes,
        files: file,
        items: itemsToSubmit,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Invoice Details</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="invoiceNumber">Invoice Number *</Label>
          <Input
            id="invoiceNumber"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="Enter invoice number"
            required
          />
        </div>

        {/* Item Selection Section */}
        <div className="border rounded-md p-4 bg-gray-50">
          <Label className="mb-2 block">Select Items for Invoice</Label>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {selectedItems.map((item, index) => {
              const remaining = item.quantity - (item.receivedQuantity || 0);
              const isFullyReceived = remaining <= 0;

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-2 rounded border ${isFullyReceived ? "bg-gray-100 opacity-60" : "bg-white"
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={item.isSelected}
                    onChange={(e) =>
                      handleItemSelection(index, e.target.checked)
                    }
                    disabled={isFullyReceived}
                    className="h-4 w-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {item.RequisitionItem?.Item?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Ordered: {item.quantity} | Received:{" "}
                      {item.receivedQuantity || 0} | Remaining: {remaining}
                    </p>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      value={item.currentInvoiceQuantity}
                      onChange={(e) =>
                        handleQuantityChange(index, e.target.value)
                      }
                      disabled={!item.isSelected || isFullyReceived}
                      className="h-8 text-right"
                      min="0"
                      max={remaining}
                    />
                  </div>
                  <div className="w-20 text-right text-sm font-medium">
                    ₹
                    {(item.currentInvoiceQuantity * item.rate).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <Label htmlFor="amount">Total Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            value={totalAmount}
            readOnly
            className="bg-gray-100 font-bold"
          />
        </div>

        <div>
          <Label>Invoice Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {invoiceDate
                  ? format(invoiceDate, "dd-MM-yyyy")
                  : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={invoiceDate}
                onSelect={setInvoiceDate}
                initialFocus
                required
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes here..."
          />
        </div>

        <div>
          <Label>Upload Invoice (Optional)</Label>
          <div className="mt-2 flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-34 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileText className="h-9 w-8 text-gray-400 mb-" />
                <p className="text-sm text-gray-500">Click to upload</p>
                <p className="text-xs text-gray-500">
                  PDF, PNG, JPG or JPEG (max. 10MB)
                </p>
              </div>
              <Input
                type="file"
                multiple
                className="border-l-none border-r-none rounded-none border-b-0 border-t-2"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setFile(Array.from(e.target.files))}
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={loading || totalAmount <= 0}
          >
            {loading ? "Adding..." : "Add Invoice"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
