import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/services/api/api-service";
import { pdf } from "@react-pdf/renderer";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  Package,
  Receipt
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProcurementOrderPDF from "./ProcurementOrderPDF";

// Import new components
import { toast } from "@/hooks/use-toast";
import Header from "./components/Header";
import InvoicesTab from "./components/InvoicesTab";
import ItemsTab from "./components/ItemsTab";
import OverviewTab from "./components/OverviewTab";

const ProcurementDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [procurement, setProcurement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handlePaymentCreated = (payment) => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice) =>
        invoice.id === payment.invoiceId
          ? { ...invoice, payments: [...(invoice.payments || []), payment] }
          : invoice
      )
    );
  };

  const transformProcurementDataForPDF = (procurementData) => {
    // Transform the main procurement data
    const formData = {
      procurementNo: procurementData.procurementNo,
      status: procurementData.status,
      createdAt: procurementData.createdAt,
      expectedDelivery: procurementData.expectedDelivery,
      notes: procurementData.notes,
      totalAmount: procurementData.totalAmount,
      Vendor: procurementData.Vendor,
      Requisition: procurementData.Requisition,
    };

    // Transform the items array
    const items = procurementData.ProcurementItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
      RequisitionItem: item.RequisitionItem,
    }));

    return { formData, items };
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    const { formData, items } = transformProcurementDataForPDF(procurement);
    try {
      const blob = await pdf(
        <ProcurementOrderPDF formData={formData} items={items} />
      ).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Procurement_Order_${procurement.procurementNo}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      // Handle error (show toast notification, etc.)
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const fetchProcurement = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/procurements/${id}`);
      setProcurement(response.data);
      setInvoices(
        response.data.invoices.map((invoice) => {
          return {
            ...invoice,
            vendorName: response.data?.Vendor?.name,
          };
        })
      );
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch procurement:", err);
      setError(err.message);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProcurement();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      await api.put(`/procurements/${id}/status`, { status: newStatus });
      setProcurement((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDeleteProcurement = async () => {
    try {
      await api.delete(`/procurements/${id}`);
      //       toast({
      //   title: "Error loading inventory",
      //   description: error.message,
      //   variant: "destructive",
      // });
      toast({
        title: "Success",
        description: "Procurement deleted successfully",
        variant: "success",
      });
      navigate("/procurements"); // Redirect to procurement list page
    } catch (err) {
      console.error("Failed to delete procurement:", err);
      toast({
        title: "Error",
        description: "Failed to delete procurement",
        variant: "destructive",
      });
    }
  };

  const handleInvoiceSubmit = async (invoiceData) => {
    try {
      const formData = new FormData();
      formData.append("procurementId", invoiceData.procurementId);
      formData.append("invoiceNumber", invoiceData.invoiceNumber);
      formData.append("amount", invoiceData.amount);
      formData.append("invoiceDate", invoiceData.invoiceDate.toISOString());
      formData.append("notes", invoiceData.notes);

      if (invoiceData.items) {
        formData.append("items", JSON.stringify(invoiceData.items));
      }

      if (invoiceData.files && invoiceData.files.length > 0) {
        invoiceData.files.forEach((file) => {
          formData.append("files", file);
        });
      }

      await api.post("/invoices", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setIsInvoiceDialogOpen(false);
      // Switch to invoices tab after creating invoice
      setActiveTab("invoices");
      await fetchProcurement();
    } catch (err) {
      console.error("Failed to submit invoice:", err);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold">Error: {error}</p>
          <Button
            variant="outline"
            onClick={() => navigate("/procurements")}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Procurements
          </Button>
        </div>
      </div>
    );
  }

  if (!procurement) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-60 text-lg">Procurement not found</p>
          <Button
            variant="outline"
            onClick={() => navigate("/procurements")}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Procurements
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Header
          procurement={procurement}
          isInvoiceDialogOpen={isInvoiceDialogOpen}
          setIsInvoiceDialogOpen={setIsInvoiceDialogOpen}
          handleDownloadPDF={handleDownloadPDF}
          isGeneratingPdf={isGeneratingPdf}
          handleStatusUpdate={handleStatusUpdate}
          handleInvoiceSubmit={handleInvoiceSubmit}
          handleDeleteProcurement={handleDeleteProcurement}
        />

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 bg-white rounded-lg shadow-sm border">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Items ({procurement.ProcurementItems.length})
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Invoices ({invoices.length})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewTab procurement={procurement} invoices={invoices} />
          </TabsContent>

          {/* Items Tab */}
          <TabsContent value="items">
            <ItemsTab procurement={procurement} />
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <InvoicesTab
              invoices={invoices}
              procurement={procurement}
              isInvoiceDialogOpen={isInvoiceDialogOpen}
              setIsInvoiceDialogOpen={setIsInvoiceDialogOpen}
              handleInvoiceSubmit={handleInvoiceSubmit}
              handlePaymentCreated={handlePaymentCreated}
              onInvoiceUpdated={fetchProcurement}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProcurementDetails;
