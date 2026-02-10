import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/services/api/api-service";
import quotationComparisonService from "@/services/api/quotationComparisonService";
import exportQuotationComparisonToExcel from "@/utils/exportQuotationComparisonToExcel";
import {
  ArrowLeft,
  CheckCircle,
  Download,
  Edit,
  Eye,
  FileText,
  Paperclip,
  PlusCircle,
  Save,
  ShoppingCart,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ApprovalWorkflow from "./components/ApprovalWorkflow";
import { Spinner } from "@/components/ui/loader";

const QuotationComparisonPage = () => {
  const { id: comparisonId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [comparison, setComparison] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedRates, setEditedRates] = useState({});
  const [editedQuantities, setEditedQuantities] = useState({});
  const [newVendor, setNewVendor] = useState({ vendorId: "" });
  const [selectedVendors, setSelectedVendors] = useState({});
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [requisitionStats, setRequisitionStats] = useState({});

  // New states for PDF attachments
  const [vendorAttachments, setVendorAttachments] = useState({});
  const [uploadingVendor, setUploadingVendor] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
  const [currentVendor, setCurrentVendor] = useState(null);
  const [pdfViewerUrl, setPdfViewerUrl] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  const fetchRequisitionStats = async (requisitionId) => {
    try {
      const response = await api.get(`/requisitions/${requisitionId}`);
      if (response.status && response.data) {
        const requisitionData = response.data;
        const stats = {};

        if (requisitionData.items) {
          requisitionData.items.forEach((item) => {
            const itemId = item.itemId;
            const originalQuantity = item.quantity;

            // Calculate procured
            let totalProcured = 0;
            if (requisitionData.procurements) {
              requisitionData.procurements.forEach((procurement) => {
                if (procurement.ProcurementItems) {
                  procurement.ProcurementItems.forEach((procItem) => {
                    if (procItem.itemId === itemId) {
                      totalProcured += procItem.quantity || 0;
                    }
                  });
                }
              });
            }

            // Calculate issued
            let totalIssued = 0;
            if (requisitionData.materialIssues) {
              requisitionData.materialIssues.forEach((materialIssue) => {
                if (materialIssue.items) {
                  materialIssue.items.forEach((issueItem) => {
                    if (issueItem.itemId === itemId) {
                      totalIssued += issueItem.quantity || 0;
                    }
                  });
                }
              });
            }

            const remainingQuantity =
              originalQuantity - totalProcured - totalIssued;

            stats[itemId] = {
              originalQuantity,
              totalProcured,
              totalIssued,
              remainingQuantity,
            };
          });
        }
        setRequisitionStats(stats);
      }
    } catch (error) {
      console.error("Error fetching requisition stats:", error);
    }
  };

  // Fetch comparison data
  const fetchComparison = async () => {
    try {
      const data = await quotationComparisonService.getComparison(comparisonId);
      setComparison(data);
      setItems(data.items);
      setVendors(data.vendors);

      // Initialize selected vendors from the comparison data
      const initialSelection = {};
      data.items.forEach((item) => {
        if (item.selectedVendorId) {
          initialSelection[item.id] = item.selectedVendorId;
        }
      });
      setSelectedVendors(initialSelection);

      if (data.requisitionId) {
        fetchRequisitionStats(data.requisitionId);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching comparison:", error);
      setLoading(false);
    }
  };

  const fetchAllAttachments = async () => {
    const attachmentsMap = {};
    for (const vendor of vendors) {
      try {
        const attachments =
          await quotationComparisonService.getVendorAttachments(
            comparisonId,
            vendor.vendorId
          );
        attachmentsMap[vendor.vendorId] = attachments;
      } catch (error) {
        console.error(
          `Error fetching attachments for vendor ${vendor.vendorId}:`,
          error
        );
        attachmentsMap[vendor.vendorId] = [];
      }
    }
    setVendorAttachments(attachmentsMap);
  };
  const fetchAllVendors = async () => {
    try {
      const vendors = await api.get("/vendors");
      setAllVendors(vendors.data);
      fetchAllAttachments();
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };
  useEffect(() => {
    if (comparisonId) {
      fetchComparison();
      fetchAllVendors();
    }
  }, [comparisonId]);

  // Fetch vendor attachments
  // useEffect(() => {
  //   if (vendors.length > 0) {
  //     fetchAllAttachments();
  //   }
  // }, [vendors, comparisonId]);

  // Initialize with any previously selected vendor
  useEffect(() => {
    // Selection logic handled by individual item selections
  }, [selectedVendors]);

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      event.target.value = null;
    }
  };

  // Upload PDF for vendor
  const handleUploadPDF = async (vendorId) => {
    if (!selectedFile) {
      toast({
        title: "Selection required",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    setUploadingVendor(vendorId);
    try {
      await quotationComparisonService.uploadVendorAttachment(
        comparisonId,
        vendorId,
        selectedFile
      );

      // Refresh attachments
      const attachments = await quotationComparisonService.getVendorAttachments(
        comparisonId,
        vendorId
      );
      setVendorAttachments((prev) => ({
        ...prev,
        [vendorId]: attachments,
      }));

      setSelectedFile(null);
      setShowAttachmentDialog(false);

      // Reset file input
      const fileInput = document.getElementById(`file-input-${vendorId}`);
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingVendor(null);
    }
  };

  // Delete attachment
  const handleDeleteAttachment = async (vendorId) => {
    if (!window.confirm("Are you sure you want to delete this attachment?")) {
      return;
    }

    try {
      await quotationComparisonService.deleteVendorAttachment(
        comparisonId,
        vendorId
      );

      // Refresh attachments
      const attachments = await quotationComparisonService.getVendorAttachments(
        comparisonId,
        vendorId
      );
      setVendorAttachments((prev) => ({
        ...prev,
        [vendorId]: attachments,
      }));
    } catch (error) {
      console.error("Error deleting attachment:", error);
      toast({
        title: "Deletion failed",
        description: "Failed to delete attachment. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Open attachment dialog
  const openAttachmentDialog = (vendor) => {
    setCurrentVendor(vendor);
    setShowAttachmentDialog(true);
    setSelectedFile(null);
  };

  // Enter edit mode
  const handleEditMode = () => {
    const initialRates = {};
    const initialQuantities = {};

    items.forEach((item) => {
      initialQuantities[item.id] = item.quantity;

      vendors.forEach((vendor) => {
        const rate = item.rates?.find((r) => r.vendor.id === vendor.vendorId);
        const key = `${item.id}-${vendor.vendorId}`;
        initialRates[key] = rate ? rate.rate : "";
      });
    });

    setEditedRates(initialRates);
    setEditedQuantities(initialQuantities);
    setIsEditMode(true);
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditedRates({});
    setEditedQuantities({});
    setIsEditMode(false);
  };

  // Update rate in edit mode
  const handleRateUpdate = (itemId, vendorId, value) => {
    const key = `${itemId}-${vendorId}`;
    setEditedRates((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Update quantity in edit mode
  const handleQuantityUpdate = (itemId, value) => {
    setEditedQuantities((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  // Remove item
  const handleRemoveItem = async (itemId) => {
    try {
      await quotationComparisonService.removeItem(comparisonId, itemId);

      const data = await quotationComparisonService.getComparison(comparisonId);
      setComparison(data);
      setItems(data.items);
      setVendors(data.vendors);

      setItemToDelete(null);
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Bulk save all edited rates and quantities
  const handleBulkSave = async () => {
    try {
      const ratesToUpdate = [];
      const quantitiesToUpdate = [];

      Object.keys(editedRates).forEach((key) => {
        const [itemId, vendorId] = key.split("-").map(Number);
        const newRate = editedRates[key];

        if (newRate !== "") {
          ratesToUpdate.push({
            itemId,
            vendorId,
            rate: parseFloat(newRate),
          });
        }
      });

      Object.keys(editedQuantities).forEach((itemId) => {
        const newQuantity = editedQuantities[itemId];
        const originalItem = items.find((item) => item.id === parseInt(itemId));

        if (originalItem && newQuantity !== originalItem.quantity) {
          quantitiesToUpdate.push({
            itemId: parseInt(itemId),
            quantity: parseFloat(newQuantity),
          });
        }
      });

      await quotationComparisonService.bulkUpdate(comparisonId, {
        rates: ratesToUpdate,
        quantities: quantitiesToUpdate,
      });

      const data = await quotationComparisonService.getComparison(comparisonId);
      setComparison(data);
      setItems(data.items);
      setVendors(data.vendors);


      setIsEditMode(false);
      setEditedRates({});
      setEditedQuantities({});
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "Save failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectItemVendor = (itemId, vendorId) => {
    setSelectedVendors((prev) => ({
      ...prev,
      [itemId]: vendorId,
    }));
  };

  const handleSaveSelections = async () => {
    try {
      setLoading(true);
      await quotationComparisonService.bulkSelectVendors(comparisonId, selectedVendors);
      toast({
        title: "Saved",
        description: "Selections saved successfully!",
      });
      const data = await quotationComparisonService.getComparison(comparisonId);
      setComparison(data);
      setItems(data.items);
      setVendors(data.vendors);
    } catch (error) {
      console.error("Error saving selections:", error);
      toast({
        title: "Error",
        description: "Failed to save selections. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addVendor = async () => {
    if (newVendor.vendorId) {
      try {
        await quotationComparisonService.addVendor(
          comparisonId,
          parseInt(newVendor.vendorId)
        );

        const data = await quotationComparisonService.getComparison(
          comparisonId
        );
        setComparison(data);
        setItems(data.items);
        setVendors(data.vendors);

        setNewVendor({ vendorId: "" });
      } catch (error) {
        console.error("Error adding vendor:", error);
      }
    }
  };

  const updateStatus = (updatedComparisonStatus) => {
    setComparison((prev) => ({
      ...prev,
      status: updatedComparisonStatus,
    }));
  };

  // Delete quotation comparison
  const handleDeleteQuotation = async () => {
    try {
      await quotationComparisonService.deleteComparison(comparisonId);
      navigate("/quotation-comparison");
    } catch (error) {
      console.error("Error deleting quotation comparison:", error);
      toast({
        title: "Error",
        description: "Failed to delete quotation comparison. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateProcurementForVendor = async (vendorId, vendorName) => {
    try {
      setLoading(true);
      // First save current selections to ensure the form sees the latest data
      await quotationComparisonService.bulkSelectVendors(comparisonId, selectedVendors);

      // Navigate to the procurement form
      const requisitionId = comparison.requisitionId;
      navigate(`/procure/${requisitionId}?quotationComparisonId=${comparisonId}&vendorId=${vendorId}`);
    } catch (error) {
      console.error("Error redirecting to procurement form:", error);
      toast({
        title: "Error",
        description: "Failed to prepare procurement form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Spinner />
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6 sm:flex-row flex-col gap-4 p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/quotation-comparison")}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Quotation Comparison</h1>
            <p className="text-muted-foreground">
              Comparison: {comparison.comparisonNo} | Requisition:{" "}
              {comparison.requisition.requisitionNo}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge
            variant={
              comparison.status === "approved"
                ? "default"
                : comparison.status === "submitted"
                  ? "secondary"
                  : "outline"
            }
          >
            {comparison.status.toUpperCase()}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (comparison) {
                exportQuotationComparisonToExcel(comparison);
              } else {
                toast({
                  title: "Warning",
                  description: "Comparison data not loaded yet. Please wait and try again.",
                });
              }
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {comparison.status.toLowerCase() !== "approved" &&
            comparison.status.toLowerCase() !== "locked" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirmation(true)}
                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
        </div>
      </div>

      {/* Vendor Management Section */}
      <Card className="mb-6 border-blue-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
            <PlusCircle className="h-5 w-5" />
            Vendor Selection for Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="vendor" className="text-slate-600 font-semibold">Select Vendor to Add</Label>
              <Select
                value={newVendor.vendorId}
                onValueChange={(value) => setNewVendor({ vendorId: value })}
                disabled={comparison.status.toLowerCase() === "locked"}
              >
                <SelectTrigger id="vendor" className="bg-white border-slate-300">
                  <SelectValue placeholder="Search and select a vendor..." />
                </SelectTrigger>
                <SelectContent>
                  {allVendors
                    .filter(av => !vendors.some(v => v.vendorId === av.id))
                    .map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id.toString()}>
                        {vendor.name} {vendor.email ? `(${vendor.email})` : ''}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={addVendor}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md active:scale-95"
                disabled={!newVendor.vendorId}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Vendor to Comparison
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vendor Comparison Table</CardTitle>
            <div className="flex gap-2">
              {comparison.status.toLowerCase() !== "approved" &&
                comparison.status.toLowerCase() !== "locked" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveSelections}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      disabled={Object.keys(selectedVendors).length === 0}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Selections
                    </Button>
                    {!isEditMode ? (
                      <Button variant="outline" size="sm" onClick={handleEditMode}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Table
                      </Button>
                    ) : (
                      <>
                        <Button variant="default" size="sm" onClick={handleBulkSave}>
                          <Save className="h-4 w-4 mr-2" />
                          Save All Changes
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </>
                )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    rowSpan={2}
                    className="text-center align-middle border-r"
                  >
                    SI No
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="text-center align-middle border-r"
                  >
                    Item Description
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="text-center align-middle border-r"
                  >
                    Unit
                  </TableHead>

                  {/* New Columns for Procured/Issued/Remaining */}
                  <TableHead
                    rowSpan={2}
                    className="text-center align-middle border-r bg-muted/30"
                  >
                    Procured
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="text-center align-middle border-r bg-muted/30"
                  >
                    Issued
                  </TableHead>
                  <TableHead
                    rowSpan={2}
                    className="text-center align-middle border-r bg-muted/30 font-semibold text-orange-700"
                  >
                    Remaining
                  </TableHead>

                  <TableHead
                    rowSpan={2}
                    className="text-center align-middle border-r"
                  >
                    Comp. Qty
                  </TableHead>
                  {vendors.map((vendor) => (
                    <TableHead
                      key={vendor.id}
                      colSpan={2}
                      className="text-center font-bold bg-muted border-r"
                    >
                      {vendor.vendor.name}
                    </TableHead>
                  ))}
                  {isEditMode && (
                    <TableHead
                      rowSpan={2}
                      className="text-center align-middle border-r"
                    >
                      Actions
                    </TableHead>
                  )}
                </TableRow>
                <TableRow>
                  {vendors.map((vendor) => (
                    <>
                      <TableHead
                        key={`${vendor.id}-rate`}
                        className="text-center bg-primary text-primary-foreground"
                      >
                        Rate
                      </TableHead>
                      <TableHead
                        key={`${vendor.id}-amount`}
                        className="text-center bg-primary text-primary-foreground border-r"
                      >
                        Amount
                      </TableHead>
                    </>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => {
                  const stats = requisitionStats[item.itemId] || {
                    totalProcured: 0,
                    totalIssued: 0,
                    remainingQuantity: 0,
                  };
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-center border-r">
                        {index + 1}
                      </TableCell>
                      <TableCell className="border-r">
                        {item.description}
                      </TableCell>
                      <TableCell className="text-center border-r">
                        {item.unit}
                      </TableCell>

                      {/* Display Procured/Issued/Remaining */}
                      <TableCell className="text-center border-r bg-muted/10">
                        {stats.totalProcured}
                      </TableCell>
                      <TableCell className="text-center border-r bg-muted/10">
                        {stats.totalIssued}
                      </TableCell>
                      <TableCell className="text-center border-r bg-muted/10 font-bold text-orange-600">
                        {stats.remainingQuantity}
                      </TableCell>

                      <TableCell className="text-center border-r">
                        {isEditMode ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editedQuantities[item.id] || ""}
                            onChange={(e) =>
                              handleQuantityUpdate(item.id, e.target.value)
                            }
                            className="w-20 h-8 text-center"
                          />
                        ) : (
                          item.quantity
                        )}
                      </TableCell>

                      {vendors.map((vendor) => {
                        const rate = item.rates.find(
                          (r) => r.vendor.id === vendor.vendorId
                        );
                        const isLowest = rate?.isLowest;
                        const key = `${item.id}-${vendor.vendorId}`;
                        const editValue = editedRates[key];

                        return (
                          <>
                            <TableCell
                              key={`${vendor.id}-rate`}
                              className={`text-center transition-all ${selectedVendors[item.id] === vendor.vendorId
                                ? "bg-blue-100 ring-2 ring-blue-400 ring-inset shadow-inner font-bold"
                                : isLowest
                                  ? "bg-green-50"
                                  : "bg-white"
                                }`}
                            >
                              {isEditMode ? (
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={editValue || ""}
                                  onChange={(e) =>
                                    handleRateUpdate(
                                      item.id,
                                      vendor.vendorId,
                                      e.target.value
                                    )
                                  }
                                  placeholder="0.00"
                                  className="w-24 h-8 text-center bg-white border-slate-300 focus:ring-blue-500"
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center gap-1.5 p-1">
                                  {rate ? (
                                    <>
                                      <div className="flex items-center gap-1.5">
                                        <span
                                          className={`${selectedVendors[item.id] ===
                                            vendor.vendorId
                                            ? "text-blue-900 text-base"
                                            : "text-slate-700"
                                            }`}
                                        >
                                          ₹
                                          {parseFloat(rate.rate).toLocaleString(
                                            "en-IN",
                                            { minimumFractionDigits: 2 }
                                          )}
                                        </span>
                                        {isLowest && (
                                          <Badge
                                            variant="outline"
                                            className="text-[9px] px-1 h-3.5 bg-green-100 text-green-700 border-green-200 uppercase tracking-tighter"
                                          >
                                            L1
                                          </Badge>
                                        )}
                                      </div>
                                      {comparison.status === "draft" && (
                                        <Button
                                          variant={
                                            selectedVendors[item.id] ===
                                              vendor.vendorId
                                              ? "default"
                                              : "outline"
                                          }
                                          size="sm"
                                          className={`h-6 px-3 text-[10px] font-bold rounded-full shadow-sm transition-all transform active:scale-90 ${selectedVendors[item.id] ===
                                            vendor.vendorId
                                            ? "bg-blue-600 hover:bg-blue-700 hover:scale-105"
                                            : "hover:bg-slate-100 border-slate-200"
                                            }`}
                                          onClick={() =>
                                            handleSelectItemVendor(
                                              item.id,
                                              vendor.vendorId
                                            )
                                          }
                                        >
                                          {selectedVendors[item.id] ===
                                            vendor.vendorId

                                            ? "✓ Selected"
                                            : "Select"}
                                        </Button>
                                      )}
                                      {comparison.status !== "draft" &&
                                        selectedVendors[item.id] ===
                                        vendor.vendorId && (
                                          <div className="flex items-center gap-1 bg-green-100 px-1.5 py-0.5 rounded-full ring-1 ring-green-500">
                                            <CheckCircle className="h-3 w-3 text-green-600" />
                                            <span className="text-[9px] font-bold text-green-700">SELECTED</span>
                                          </div>
                                        )}
                                    </>
                                  ) : (
                                    <span className="text-slate-400 text-xs italic">
                                      No Quote
                                    </span>
                                  )}
                                </div>
                              )}
                            </TableCell>
                            <TableCell
                              key={`${vendor.id}-amount`}
                              className={`text-center border-r ${isLowest ? "bg-green-50" : ""
                                }`}
                            >
                              {rate ? (
                                <span className="font-medium">
                                  ₹
                                  {rate.amount.toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          </>
                        );
                      })}

                      {isEditMode && (
                        <TableCell className="text-center border-r">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setItemToDelete(item)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}

                <TableRow className="font-bold bg-muted">
                  <TableCell colSpan={6} className="border-r">
                    Grand Total
                  </TableCell>
                  <TableCell className="text-center border-r">-</TableCell>
                  {vendors.map((vendor) => (
                    <>
                      <TableCell
                        key={`${vendor.vendorId}-total-rate`}
                        className="text-center"
                      >
                        -
                      </TableCell>
                      <TableCell
                        key={`${vendor.vendorId}-total-amount`}
                        className="text-center border-r bg-yellow-50"
                      >
                        ₹
                        {vendor.totalAmount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                    </>
                  ))}
                  {isEditMode && <TableCell className="border-r"></TableCell>}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Item Confirmation Dialog */}
      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={() => setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{itemToDelete?.description}" from
              this comparison? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleRemoveItem(itemToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Quotation Confirmation Dialog */}
      <AlertDialog
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quotation Comparison</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quotation comparison? This
              action cannot be undone and will permanently remove all data
              associated with this comparison including all items, vendor
              quotes, and rates.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQuotation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PDF Attachment Dialog */}
      <Dialog
        open={showAttachmentDialog}
        onOpenChange={setShowAttachmentDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Manage Attachments - {currentVendor?.vendor.name}
            </DialogTitle>
            <DialogDescription>
              Upload and manage PDF quotation files for this vendor
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Upload Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="flex flex-col items-center gap-4">
                <Upload className="h-10 w-10 text-gray-400" />
                <div className="text-center">
                  <Label
                    htmlFor={`file-input-${currentVendor?.vendorId}`}
                    className="cursor-pointer text-blue-600 hover:text-blue-700"
                  >
                    Click to upload
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    PDF files only (Max 10MB)
                  </p>
                </div>
                <Input
                  id={`file-input-${currentVendor?.vendorId}`}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    <span>{selectedFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <Button
                  onClick={() => handleUploadPDF(currentVendor?.vendorId)}
                  disabled={
                    !selectedFile || uploadingVendor === currentVendor?.vendorId
                  }
                >
                  {uploadingVendor === currentVendor?.vendorId ? (
                    <>Uploading...</>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload PDF
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Existing Attachments */}
            <div>
              <h4 className="font-semibold mb-3">Existing Attachments</h4>
              {vendorAttachments[currentVendor?.vendorId]?.length > 0 ? (
                <div className="space-y-2">
                  {vendorAttachments[currentVendor?.vendorId].map(
                    (attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-red-600" />
                          {/* <div>
                          <p className="font-medium text-sm">
                            {attachment.attachmentFileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(attachment.attachmentFileSize / 1024).toFixed(2)} KB •{" "}
                            {new Date(attachment.attachmentUploadedAt).toLocaleDateString()}
                          </p>
                        </div> */}
                          <Link to={attachment.attachmentFilePath}>
                            Attachement 1
                          </Link>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              window.open(
                                attachment.attachmentFilePath,
                                "_blank"
                              )
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDownloadPDF(
                                currentVendor?.vendorId,
                                attachment.attachmentFileName
                              )
                            }
                          >
                            <Download className="h-4 w-4" />
                          </Button> */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteAttachment(currentVendor?.vendorId)
                            }
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No attachments yet
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Viewer Dialog */}
      <Dialog open={showPdfViewer} onOpenChange={setShowPdfViewer}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>View PDF</DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-full">
            {pdfViewerUrl && (
              <object
                data={pdfViewerUrl}
                type="application/pdf"
                width="100%"
                height="100%"
                className="rounded-lg"
              >
                <p className="text-center p-4">
                  PDF cannot be displayed.{" "}
                  <a
                    href={pdfViewerUrl}
                    download
                    className="text-blue-600 hover:underline"
                  >
                    Download instead
                  </a>
                </p>
              </object>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-8 mb-8 mt-8">
        <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-blue-600" />
          Selection Summary by Vendor
        </h3>

        <div className="grid grid-cols-1 gap-8">
          {vendors.map((vendor) => {
            const selectedItems = items.filter(
              (item) => selectedVendors[item.id] === vendor.vendorId
            );

            if (selectedItems.length === 0) return null;

            const vendorTotal = selectedItems.reduce((sum, item) => {
              const rateRecord = item.rates.find(r => r.vendor.id === vendor.vendorId);
              return sum + (rateRecord ? Number(rateRecord.amount) : 0);
            }, 0);

            return (
              <Card key={vendor.id} className="border-slate-200 shadow-sm overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/80 border-b border-slate-200 p-0">
                  <div className="flex justify-between items-center p-4">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg font-bold text-slate-700">
                        {vendor.vendor.name}
                      </CardTitle>
                      <Badge className="bg-blue-600 shadow-sm">
                        {selectedItems.length} {selectedItems.length === 1 ? 'Item' : 'Items'} Selected
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 bg-white text-xs font-semibold border-slate-200 hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
                        onClick={() => openAttachmentDialog(vendor)}
                      >
                        <Paperclip className="h-4 w-4 mr-2 text-blue-500" />
                        Documents ({vendorAttachments[vendor.vendorId]?.length || 0})
                      </Button>
                      {(comparison.status === "approved" || comparison.status === "locked") && (
                        <Button
                          variant="default"
                          size="sm"
                          className="h-9 bg-blue-600 hover:bg-blue-700 text-xs font-bold shadow-sm transition-all active:scale-95 px-4"
                          onClick={() => handleGenerateProcurementForVendor(vendor.vendorId, vendor.vendor.name)}
                          disabled={comparison.status === "locked"}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {comparison.status === "locked" ? "Generated" : "Create Procurement"}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon" disabled={comparison.status.toLowerCase() === "locked"}
                        className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        onClick={async () => {
                          if (window.confirm(`Remove ${vendor.vendor.name} and all its selections?`)) {
                            try {
                              await quotationComparisonService.removeVendor(comparisonId, vendor.vendorId);
                              const data = await quotationComparisonService.getComparison(comparisonId);
                              setComparison(data);
                              setItems(data.items);
                              setVendors(data.vendors);
                            } catch (error) {
                              console.error("Error:", error);
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="w-[50px] text-center">#</TableHead>
                        <TableHead>Item Description</TableHead>
                        <TableHead className="text-center">Unit</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedItems.map((item, idx) => {
                        const rateRecord = item.rates.find(r => r.vendor.id === vendor.vendorId);
                        return (
                          <TableRow key={item.id} className="hover:bg-slate-50/50">
                            <TableCell className="text-center font-medium text-slate-500">{idx + 1}</TableCell>
                            <TableCell className="font-medium">{item.description}</TableCell>
                            <TableCell className="text-center">{item.unit}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">
                              ₹{rateRecord ? parseFloat(rateRecord.rate).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : '-'}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              ₹{rateRecord ? parseFloat(rateRecord.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Vendor Subtotal</span>
                    <span className="text-xl font-black text-blue-700">
                      ₹{vendorTotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {Object.keys(selectedVendors).length === 0 && (
            <div className="py-12 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <ShoppingCart className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-bold">No selections made yet.</p>
              <p className="text-slate-400 text-sm">Click "Select" on vendors in the comparison table above to build the order.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <ApprovalWorkflow
          comparison={comparison}
          onUpdateStatus={updateStatus}
          userId={1}
        />
      </div>
    </div>
  );
};

export default QuotationComparisonPage;
