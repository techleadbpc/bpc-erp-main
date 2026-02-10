import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import api from "@/services/api/api-service";
import { AlertCircle, Info } from "lucide-react";
import { useEffect, useState } from "react";

import DeliveryInfoCard from "./components/DeliveryInfoCard";
import ItemAdjustmentTable from "./components/ItemAdjustmentTable";
import RequisitionDetailsCard from "./components/RequisitionDetailsCard";
import SubmitSection from "./components/SubmitSection";
import VendorSelectionCard from "./components/VendorSelectionCard";
import { useParams } from "react-router";

const ProcurementForm = () => {
  const params = useParams();
  const requisitionId = params.requisitionId || "1";
  const quotationComparisonId = new URLSearchParams(window.location.search).get(
    "quotationComparisonId"
  );
  const selectedVendorIdFromUrl = new URLSearchParams(window.location.search).get(
    "vendorId"
  );

  const [formData, setFormData] = useState({
    requisitionId: requisitionId,
    vendorId: selectedVendorIdFromUrl || "",
    expectedDelivery: "",
    notes: "",
    quotationComparisonId: quotationComparisonId,
  });

  const [requisition, setRequisition] = useState(null);
  const [procurementItems, setProcurementItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [showNewVendorForm, setShowNewVendorForm] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingRequisition, setFetchingRequisition] = useState(false);
  const [fetchingVendors, setFetchingVendors] = useState(false);
  const [quotationComparison, setQuotationComparison] = useState(null);

  const navigateBack = () => {
    window.history.back();
  };

  const [newVendor, setNewVendor] = useState({
    name: "",
    email: "",
    contactPerson: "",
    address: "",
  });

  // Helper function to calculate remaining quantities for each item
  const calculateRemainingQuantities = (requisitionData) => {
    if (!requisitionData.items) return [];

    return requisitionData.items
      .map((item) => {
        const itemId = item.itemId;
        const originalQuantity = item.quantity;

        // Calculate total procured quantity for this item
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

        // Calculate total issued quantity for this item
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

        return {
          ...item,
          originalQuantity,
          totalProcured,
          totalIssued,
          remainingQuantity,
          showInProcurement: remainingQuantity > 0,
        };
      })
      .filter((item) => item.showInProcurement);
  };

  // Fetch quotation comparison data
  const fetchQuotationComparison = async () => {
    console.log(quotationComparisonId)
    if (!quotationComparisonId) return null;

    try {
      const response = await api.get(
        `/quotation-comparison/${quotationComparisonId}`
      );
      if (response.status && response.data) {
        return response.data;
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch quotation comparison data",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error("Error fetching quotation comparison:", error);
      toast({
        title: "Error",
        description: "Failed to fetch quotation comparison data",
        variant: "destructive",
      });
      return null;
    }
  };

  // Populate form from quotation data
  const populateFromQuotation = (quotationData, requisitionData) => {
    if (!quotationData || !quotationData.items) return;

    // Find vendors with selected items in quotation
    const selectedVendorIds = new Set();
    quotationData.items.forEach((item) => {
      if (item.selectedVendorId) {
        selectedVendorIds.add(item.selectedVendorId);
      }
    });

    // Use URL vendorId if provided, otherwise fallback to first selected vendor
    const defaultVendorId = selectedVendorIdFromUrl || Array.from(selectedVendorIds)[0];
    if (defaultVendorId) {
      setFormData((prev) => ({
        ...prev,
        vendorId: defaultVendorId.toString(),
        notes: quotationData.remarks || "",
      }));
    }

    // Map quotation items to procurement items
    const mappedItems = quotationData.items
      .filter((item) => {
        // If a specific vendorId was passed in URL, only show items selected for THAT vendor
        if (selectedVendorIdFromUrl) {
          return item.selected && item.selectedVendorId == selectedVendorIdFromUrl;
        }
        // Otherwise show all selected items (legacy behavior)
        return item.selected;
      })
      .map((item) => {
        // Find the rate for the selected vendor
        const selectedRate = item.rates?.find(
          (rate) => rate.vendorId === item.selectedVendorId
        );

        // Calculate remaining quantities from requisition if available
        let remainingQuantity = item.quantity;
        let originalQuantity = item.quantity;
        let totalProcured = 0;
        let totalIssued = 0;

        if (requisitionData && requisitionData.items) {
          const requisitionItem = requisitionData.items.find(
            (ri) => ri.itemId === item.itemId
          );

          if (requisitionItem) {
            originalQuantity = requisitionItem.quantity;

            // Calculate procured quantity
            if (requisitionData.procurements) {
              requisitionData.procurements.forEach((procurement) => {
                if (procurement.ProcurementItems) {
                  procurement.ProcurementItems.forEach((procItem) => {
                    if (procItem.itemId === item.itemId) {
                      totalProcured += procItem.quantity || 0;
                    }
                  });
                }
              });
            }

            // Calculate issued quantity
            if (requisitionData.materialIssues) {
              requisitionData.materialIssues.forEach((materialIssue) => {
                if (materialIssue.items) {
                  materialIssue.items.forEach((issueItem) => {
                    if (issueItem.itemId === item.itemId) {
                      totalIssued += issueItem.quantity || 0;
                    }
                  });
                }
              });
            }

            remainingQuantity = originalQuantity - totalProcured - totalIssued;
          }
        }

        const rate = parseFloat(selectedRate?.rate || 0);
        const quantity = Math.min(item.quantity, remainingQuantity); // Use min of quotation quantity and remaining

        return {
          id: item.requisitionItemId,
          itemId: item.itemId,
          name: item.description || item.item?.name || "NA",
          partNumber: item.item?.partNumber || "NA",
          originalQuantity: originalQuantity,
          totalProcured: totalProcured,
          totalIssued: totalIssued,
          remainingQuantity: remainingQuantity,
          quantity: quantity,
          unitPrice: rate,
          procurementQuantity: quantity,
          rate: rate,
          amount: quantity * rate,
          unit: item.unit || item.item?.Unit?.shortName || "NA",
        };
      });

    setProcurementItems(mappedItems);
  };

  // Fetch requisition details
  const fetchRequisition = async () => {
    if (!requisitionId) {
      toast({
        title: "Error",
        description: "No requisition ID provided",
        variant: "destructive",
      });
      navigateBack();
      return null;
    }

    try {
      setFetchingRequisition(true);
      const response = await api.get(`/requisitions/${requisitionId}`);

      if (response.status && response.data) {
        setRequisition(response.data);
        return response.data;
      } else {
        toast({
          title: "Error",
          description: response.data?.message || "Failed to fetch requisition",
          variant: "destructive",
        });
        navigateBack();
        return null;
      }
    } catch (error) {
      console.error("Error fetching requisition:", error);
      toast({
        title: "Requisition Not Found",
        description: "The requisition you're looking for doesn't exist.",
        variant: "destructive",
      });
      navigateBack();
      return null;
    } finally {
      setFetchingRequisition(false);
    }
  };

  // Fetch vendors
  const fetchVendors = async () => {
    try {
      setFetchingVendors(true);
      const response = await api.get("/vendors");

      if (response.status && response.data) {
        setVendors(response.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch vendors",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast({
        title: "Error",
        description: "Failed to fetch vendors",
        variant: "destructive",
      });
    } finally {
      setFetchingVendors(false);
    }
  };

  useEffect(() => {
    const initializeForm = async () => {
      // Fetch vendors first
      setFetchingRequisition(true);
      await fetchVendors();

      // If quotationComparisonId is provided, fetch quotation data and use it to populate form
      if (quotationComparisonId) {
        const [quotationData, requisitionData] = await Promise.all([
          fetchQuotationComparison(),
          fetchRequisition(),
        ]);

        if (quotationData) {
          setQuotationComparison(quotationData);
          populateFromQuotation(quotationData, requisitionData);
        }
      } else {
        // If no quotation, fetch requisition and use default logic
        const requisitionData = await fetchRequisition();

        if (requisitionData) {
          const itemsWithRemaining =
            calculateRemainingQuantities(requisitionData);

          if (itemsWithRemaining.length === 0) {
            toast({
              title: "Info",
              description:
                "All items in this requisition have been fully fulfilled through procurements or material issues.",
              variant: "default",
            });
          }

          const items = itemsWithRemaining.map((item) => ({
            id: item.id,
            itemId: item.itemId,
            name: item.Item?.name || "NA",
            partNumber: item.Item?.partNumber || "NA",
            originalQuantity: item.originalQuantity,
            totalProcured: item.totalProcured,
            totalIssued: item.totalIssued,
            remainingQuantity: item.remainingQuantity,
            quantity: item.remainingQuantity,
            unitPrice: item.unitPrice || item.estimatedPrice || 0,
            procurementQuantity: item.remainingQuantity,
            rate: item.unitPrice || item.estimatedPrice || 0,
            amount:
              item.remainingQuantity *
              (item.unitPrice || item.estimatedPrice || 0),
            unit: item.unit,
          }));

          setProcurementItems(items);
        }
      }
      setFetchingRequisition(false);
    };

    initializeForm();
  }, [requisitionId, quotationComparisonId]);

  const handleItemUpdate = (itemId, field, value) => {
    setProcurementItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };

          if (field === "procurementQuantity" || field === "rate") {
            updatedItem.amount =
              updatedItem.procurementQuantity * updatedItem.rate;
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleItemRemove = (itemId) => {
    setProcurementItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleNewVendorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/vendors", newVendor);

      if (response.status && response.data) {
        const newVendorData = response.data;
        setVendors((prev) => [...prev, newVendorData]);
        setFormData((prev) => ({
          ...prev,
          vendorId: newVendorData.id.toString(),
        }));
        setShowNewVendorForm(false);
        setNewVendor({
          name: "",
          email: "",
          contactPerson: "",
          address: "",
        });
        toast({
          title: "Success",
          description: "Vendor created successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.data?.message || "Failed to create vendor",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating vendor:", error);
      toast({
        title: "Error",
        description: "Failed to create vendor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const procurementData = {
        requisitionId: parseInt(formData.requisitionId),
        vendorId: parseInt(formData.vendorId),
        expectedDelivery: formData.expectedDelivery,
        notes: formData.notes,
        quotationComparisonId: quotationComparisonId
          ? parseInt(quotationComparisonId)
          : null,
        items: procurementItems
          .filter((item) => item.procurementQuantity > 0)
          .map((item) => ({
            requisitionItemId: item.id,
            itemId: item.itemId,
            quantity: item.procurementQuantity,
            rate: item.rate,
            amount: item.amount,
          })),
        totalAmount: calculateTotal(),
      };

      const response = await api.post("/procurements", procurementData);

      if (response.status && response.data) {
        toast({
          title: "Success",
          description: "Procurement created successfully",
        });
        navigateBack();
      } else {
        toast({
          title: "Error",
          description: response.data?.message || "Failed to create procurement",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating procurement:", error);
      toast({
        title: "Error",
        description: "Failed to create procurement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowReviewModal(false);
    }
  };

  const calculateTotal = () => {
    return procurementItems
      .filter((item) => item.procurementQuantity > 0)
      .reduce((sum, item) => sum + item.amount, 0);
  };

  // Loading state
  if (fetchingRequisition) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading requisition details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state - if no requisition found
  if (!requisition) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-50 mx-auto mb-4" />
            <p className="text-gray-600">Requisition not found</p>
            <Button onClick={() => navigateBack()} className="mt-4">
              Back to Requisitions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No items available for procurement
  if (procurementItems.length === 0 && !requisition) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Create New Procurement</h1>
          <Button variant="outline" onClick={() => navigateBack()}>
            Back to Requisitions
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Info className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                All Items Fulfilled
              </h3>
              <p className="text-gray-600 mb-4">
                All items in this requisition have been fully fulfilled through
                existing procurements and material issues.
              </p>
              <Button onClick={() => navigateBack()}>
                Back to Requisitions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className=" p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create New Procurement</h1>
        <Button variant="outline" onClick={() => navigateBack()}>
          Back to Requisitions
        </Button>
      </div>

      {/* Requisition Details */}
      <RequisitionDetailsCard requisition={requisition} />

      {/* Vendor Selection */}
      <VendorSelectionCard
        formData={formData}
        setFormData={setFormData}
        vendors={vendors}
        fetchingVendors={fetchingVendors}
        showNewVendorForm={showNewVendorForm}
        setShowNewVendorForm={setShowNewVendorForm}
        newVendor={newVendor}
        setNewVendor={setNewVendor}
        loading={loading}
        handleNewVendorSubmit={handleNewVendorSubmit}
      />

      {/* Item Adjustment with Remaining Quantity Info */}
      {procurementItems.length > 0 && (
        <ItemAdjustmentTable
          procurementItems={procurementItems}
          handleItemUpdate={handleItemUpdate}
          handleItemRemove={handleItemRemove}
          calculateTotal={calculateTotal}
        />
      )}

      {/* Delivery & Additional Info */}
      {procurementItems.length > 0 && (
        <DeliveryInfoCard formData={formData} setFormData={setFormData} />
      )}

      {/* Submit Button */}
      {procurementItems.length > 0 && formData.vendorId && (
        <SubmitSection
          navigateBack={navigateBack}
          showReviewModal={showReviewModal}
          setShowReviewModal={setShowReviewModal}
          requisition={requisition}
          vendors={vendors}
          formData={formData}
          procurementItems={procurementItems}
          calculateTotal={calculateTotal}
          handleSubmit={handleSubmit}
          loading={loading}
        />
      )}
    </div>
  );
};

export default ProcurementForm;
