import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, Download } from "lucide-react";

// Mock data for invoices
const mockInvoices = [
  {
    id: "inv-001",
    invoiceNo: "INV-2025-001",
    vendor: { name: "ABC Suppliers Ltd." },
    amount: 125000,
    invoiceDate: "2025-01-15",
    status: "unpaid"
  },
  {
    id: "inv-002", 
    invoiceNo: "INV-2025-002",
    vendor: { name: "XYZ Services Pvt Ltd" },
    amount: 75000,
    invoiceDate: "2025-01-20",
    status: "unpaid"
  },
  {
    id: "inv-003",
    invoiceNo: "INV-2025-003", 
    vendor: { name: "Tech Solutions Inc" },
    amount: 200000,
    invoiceDate: "2025-01-25",
    status: "unpaid"
  },
  {
    id: "inv-004",
    invoiceNo: "INV-2025-004",
    vendor: { name: "Global Manufacturing Co" },
    amount: 350000,
    invoiceDate: "2025-02-01",
    status: "unpaid"
  }
];

const PaymentSlipForm = () => {
  // Simulate getting ID from URL params - you can change this to test different invoices
  const [urlInvoiceId, setUrlInvoiceId] = useState("inv-002"); // Change this to test different scenarios
  
  const [isFromInvoice, setIsFromInvoice] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [generatedPaymentSlip, setGeneratedPaymentSlip] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    invoiceId: "",
    paymentDate: new Date(),
    amount: 0,
    remarks: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const initialSetup = async () => {
      try {
        setLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if we're coming from an invoice (simulate path check)
        const isInvoicePayment = true; // Simulate coming from invoice route
        setIsFromInvoice(isInvoicePayment);
        
        // Set mock invoices
        setInvoices(mockInvoices);
        
        // If we have an ID, it means we're creating from a specific invoice
        if (urlInvoiceId && isInvoicePayment) {
          const invoice = mockInvoices.find(inv => inv.id === urlInvoiceId);
          if (invoice) {
            setSelectedInvoice(invoice);
            setFormData(prev => ({
              ...prev,
              invoiceId: invoice.id,
              amount: invoice.amount
            }));
          } else {
            alert("Invoice not found!");
          }
        }
      } catch (error) {
        alert("Failed to load form data");
      } finally {
        setLoading(false);
      }
    };

    initialSetup();
  }, [urlInvoiceId]);

  const validateForm = (data) => {
    const newErrors = {};
    
    if (!data.invoiceId) {
      newErrors.invoiceId = "Please select an invoice";
    }
    
    if (!data.paymentDate) {
      newErrors.paymentDate = "Payment date is required";
    }
    
    if (!data.amount || data.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    
    return newErrors;
  };

  const onSubmit = async () => {
    
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockPaymentSlip = {
        id: "pay-" + Date.now(),
        slipNo: "PS-2025-" + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
        status: "Pending",
        ...formData
      };
      
      setGeneratedPaymentSlip(mockPaymentSlip);
      alert("Payment slip created successfully!");
      
    } catch (error) {
      alert("Failed to create payment slip");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInvoiceChange = (invoiceId) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setSelectedInvoice(invoice);
      setFormData(prev => ({
        ...prev,
        invoiceId,
        amount: invoice.amount
      }));
    }
  };

  const handleDownloadPaymentSlip = async () => {
    if (!generatedPaymentSlip) return;
    
    try {
      setIsGeneratingPdf(true);
      
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Payment slip ${generatedPaymentSlip.slipNo} downloaded successfully!`);
    } catch (error) {
      alert("Failed to download payment slip");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(new Date(date));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => alert("Navigate back to payments")}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {generatedPaymentSlip ? "Payment Slip Generated" : "Create Payment Slip"}
          </h1>
        </div>
        <div className="text-sm text-gray-500">
          URL Invoice ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{urlInvoiceId}</span>
        </div>
      </div>

      {!generatedPaymentSlip ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Invoice *
                </label>
                <select
                  disabled={isFromInvoice}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isFromInvoice ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                  } ${errors.invoiceId ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.invoiceId}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, invoiceId: e.target.value }));
                    handleInvoiceChange(e.target.value);
                  }}
                >
                  <option value="">Select an invoice</option>
                  {invoices.map((invoice) => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoiceNo} - {invoice.vendor?.name} ({formatCurrency(invoice.amount)})
                    </option>
                  ))}
                </select>
                {errors.invoiceId && (
                  <p className="text-sm text-red-600">{errors.invoiceId}</p>
                )}
                <p className="text-sm text-gray-500">
                  Select an unpaid invoice to generate payment slip
                </p>
              </div>

              {selectedInvoice && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">Invoice Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Invoice Number</p>
                      <p className="font-semibold text-gray-900">{selectedInvoice.invoiceNo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Vendor</p>
                      <p className="font-semibold text-gray-900">{selectedInvoice.vendor?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Invoice Date</p>
                      <p className="font-semibold text-gray-900">
                        {selectedInvoice.invoiceDate ? formatDate(selectedInvoice.invoiceDate) : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Invoice Amount</p>
                      <p className="font-semibold text-green-600 text-lg">{formatCurrency(selectedInvoice.amount)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Payment Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.paymentDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.paymentDate instanceof Date ? 
                      formData.paymentDate.toISOString().split('T')[0] : 
                      formData.paymentDate
                    }
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                  />
                </div>
                {errors.paymentDate && (
                  <p className="text-sm text-red-600">{errors.paymentDate}</p>
                )}
                <p className="text-sm text-gray-500">
                  Date when the payment is scheduled
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                />
                {errors.amount && (
                  <p className="text-sm text-red-600">{errors.amount}</p>
                )}
                <p className="text-sm text-gray-500">
                  Payment amount in rupees
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Remarks (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Add any remarks or notes"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.remarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={onSubmit}
                  disabled={submitting || !selectedInvoice}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Generating...
                    </span>
                  ) : (
                    "Generate Payment Slip"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">Payment Slip Generated Successfully</h2>
          </div>
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <p className="text-green-800 font-medium">
                Payment slip has been generated successfully.
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Payment Slip No</p>
                  <p className="text-lg font-semibold text-gray-900">{generatedPaymentSlip.slipNo}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Status</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Invoice Number</p>
                  <p className="font-semibold text-gray-900">{selectedInvoice?.invoiceNo || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Vendor</p>
                  <p className="font-semibold text-gray-900">{selectedInvoice?.vendor?.name || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Payment Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(formData.paymentDate)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-semibold text-green-600 text-lg">{formatCurrency(Number(formData.amount))}</p>
                </div>
                {formData.remarks && (
                  <div className="space-y-1 col-span-full">
                    <p className="text-sm text-gray-600">Remarks</p>
                    <p className="font-medium text-gray-900">{formData.remarks}</p>
                  </div>
                )}
              </div>

              <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  onClick={() => alert("Navigate to payments list")}
                >
                  View All Payments
                </button>
                <button
                  onClick={handleDownloadPaymentSlip}
                  disabled={isGeneratingPdf}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    {isGeneratingPdf ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Downloading...
                      </>
                    ) : (
                      "Download Payment Slip"
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Controls */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Test Controls</h3>
        <div className="flex flex-wrap gap-2">
          <label className="text-sm text-gray-600">Change URL Invoice ID:</label>
          {mockInvoices.map(invoice => (
            <button
              key={invoice.id}
              onClick={() => setUrlInvoiceId(invoice.id)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                urlInvoiceId === invoice.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {invoice.id}
            </button>
          ))}
          <button
            onClick={() => setUrlInvoiceId("invalid-id")}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              urlInvoiceId === "invalid-id" 
                ? 'bg-red-600 text-white' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            invalid-id
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSlipForm;