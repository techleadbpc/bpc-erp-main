"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api/api-service";
import { getIdByRole, useUserRoleLevel } from "@/utils/roles";
import { PDFViewer } from "@react-pdf/renderer";
import {
  CheckCircle,
  Clock,
  FileText,
  Package,
  ShieldCloseIcon,
  ShoppingCart,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import MaterialRequisitionPDF from "./MaterialRequisitionPDF";

// Import new components
import IssuesTab from "../components/IssuesTab";
import ItemsTab from "../components/ItemsTab";
import OverviewTab from "../components/OverviewTab";
import ProcurementsTab from "../components/ProcurementsTab";
import QuotationsTab from "../components/QuotationsTab";
import RejectModal from "../components/RejectModal";
import RequisitionHeader from "../components/RequisitionHeader";
import SiteRejectionTab from "../components/SiteRejectionTab";

const MaterialRequisitionView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const { user: currentUser } = useSelector((state) => state.auth);

  const [requisition, setRequisition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [close, setClose] = useState(false);
  const [itemGroups, setItemGroups] = useState([]);
  const [units, setUnits] = useState([]);
  const [showPdf, setShowPdf] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingItems, setIsEditingItems] = useState(false);
  const [tempRequisitionItems, setTempRequisitionItems] = useState([]);

  // Function to start editing items
  const startEditingItems = () => {
    if (requisition?.items) {
      setTempRequisitionItems(requisition.items.map((item) => ({ ...item })));
      setIsEditingItems(true);
    }
  };

  // Function to cancel editing items
  const cancelEditingItems = () => {
    setIsEditingItems(false);
    setTempRequisitionItems([]);
  };

  // Function to save edited items
  const saveEditedItems = async () => {
    try {
      const itemsToUpdate = tempRequisitionItems.map((item) => ({
        itemId: item.id,
        newQuantity: item.quantity,
      }));

      const response = await api.put(
        `/requisitions/${id}/item-quantity-update`,
        {
          items: itemsToUpdate,
        }
      );

      if (response.status) {
        setRequisition((prev) => ({
          ...prev,
          items: tempRequisitionItems,
        }));
        setIsEditingItems(false);
        setTempRequisitionItems([]);
        toast({
          title: "Success",
          description: "Requisition items updated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: response.data?.message || "Failed to update items",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update items",
        variant: "destructive",
      });
    }
  };

  // Function to handle quantity change in temp items
  const handleTempQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return; // Prevent quantities less than 1

    setTempRequisitionItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const storedItemGroups = useSelector((state) => state.itemGroups) || [];
  const storedUnits = useSelector((state) => state.units) || [];
  const [requisitionItemIds, setRequisitionItemIds] = useState([]);
  const [requisitionItemStocks, setRequisitionItemStocks] = useState([]);
  const userRoleLevel = useUserRoleLevel();
  const [approvingIssue, setApprovingIssue] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionRemarks, setRejectionRemarks] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionType, setRejectionType] = useState("site"); // 'site' or 'global'

  const shouldPrint =
    new URLSearchParams(location.search).get("print") === "true";

  useEffect(() => {
    const fetchRequisition = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/requisitions/${id}`);
        if (response.status && response.data) {
          // Fetch quotation comparisons for this requisition
          const quotationComparisonService = await import(
            "@/services/api/quotationComparisonService"
          );
          const quotationComparisons =
            await quotationComparisonService.default.getComparisonsForRequisition(
              id
            );

          // Add quotation comparisons to the requisition data
          const requisitionData = {
            ...response.data,
            quotationComparisons: quotationComparisons,
          };

          setRequisition(requisitionData);
          setRequisitionItemIds(
            requisitionData.items.map((item) => item.itemId)
          );
          // Load item groups and units from Redux store
          setItemGroups(storedItemGroups.data || []);
          setUnits(storedUnits.data || []);
        } else {
          toast({
            title: "Error",
            description: response.data.message || "Failed to fetch requisition",
            variant: "destructive",
          });
          navigate("/requisitions");
        }
      } catch (error) {
        toast({
          title: "Requisition Not Found",
          description: "The requisition you're looking for doesn't exist.",
          variant: "destructive",
        });
        navigate("/requisitions");
      } finally {
        setLoading(false);
      }
    };

    fetchRequisition();
  }, [id]);

  useEffect(() => {
    const fetchItemAvailability = async () => {
      try {
        // Fetch item groups if not already loaded
        if (requisitionItemIds.length > 0) {
          const isAdmin = userRoleLevel.role === "admin";
          const groupsResponse = await api.get("/inventory/stock-status/bulk", {
            params: {
              itemIds: requisitionItemIds.join(","),
              ...(isAdmin ? { siteId: requisition.requestingSite?.id } : {}),
            },
          });
          if (groupsResponse.status && groupsResponse.data) {
            setRequisitionItemStocks(groupsResponse.data);
          }
        }
      } catch (error) {
        console.error("Error fetching related data:", error);
      }
    };

    fetchItemAvailability();
  }, [requisitionItemIds]);

  useEffect(() => {
    if (shouldPrint && requisition) {
      setShowPdf(true);
    }
  }, [shouldPrint, requisition]);

  // Utility functions
  const getItemGroupName = (groupId) => {
    const group = itemGroups.find((g) => g.id === groupId);
    return group ? group.name : "Unknown Group";
  };

  const getUnitName = (unitId) => {
    const unit = units.find((u) => u.id === unitId);
    return unit ? unit.shortName || unit.name : "";
  };

  const getProcurementStatusBadge = (status) => {
    const statusConfig = {
      ordered: {
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: ShoppingCart,
      },
      delivered: {
        color: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle,
      },
      cancelled: {
        color: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
      },
      pending: {
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        icon: Clock,
      },
    };

    const config = statusConfig[status.toLowerCase()] || {
      color: "bg-gray-50 text-gray-700 border-gray-200",
      icon: Clock,
    };
    const Icon = config.icon;

    return (
      <Badge
        variant="outline"
        className={`${config.color} flex items-center gap-1`}
      >
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getIssueStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        icon: Clock,
      },
      approved: {
        color: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle,
      },
      issued: {
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Package,
      },
      dispatched: {
        color: "bg-indigo-50 text-indigo-700 border-indigo-200",
        icon: Truck,
      },
      received: {
        color: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle,
      },
      rejected: {
        color: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
      },
    };

    const config = statusConfig[status.toLowerCase()] || {
      color: "bg-gray-50 text-gray-700 border-gray-200",
      icon: Clock,
    };
    const Icon = config.icon;

    return (
      <Badge
        variant="outline"
        className={`${config.color} flex items-center gap-1`}
      >
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Action handlers
  const handlePrint = () => {
    setShowPdf(true);
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return; // Prevent quantities less than 1

    try {
      // Update the entire requisition with the new quantity for the specific item
      const updatedItems = requisition.items.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );

      const response = await api.put(`/requisitions/${id}`, {
        ...requisition,
        items: updatedItems,
      });

      if (response.status) {
        // Update the local state to reflect the change
        setRequisition((prev) => ({
          ...prev,
          items: updatedItems,
        }));
      } else {
        toast({
          title: "Error",
          description: response.data?.message || "Failed to update quantity",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  const handleApprovalByHO = async () => {
    try {
      setApproving(true);
      const response = await api.post(`/requisitions/${id}/ho-approve`);

      if (response.status) {
        toast({
          title: "Success",
          description: "Requisition has been approved successfully.",
        });

        setRequisition({
          ...requisition,
          status: "Approved",
          approvedAt: new Date().toISOString(),
        });
      } else {
        toast({
          title: "Error",
          description:
            response.data?.message || "Failed to approve requisition",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to approve requisition",
        variant: "destructive",
      });
    } finally {
      setApproving(false);
    }
  };

  const handleApprovalByPm = async () => {
    try {
      setApproving(true);
      const response = await api.post(`/requisitions/${id}/pm-approve`);

      if (response.status) {
        toast({
          title: "Success",
          description: "Requisition has been approved successfully.",
        });

        setRequisition({
          ...requisition,
          status: "Approved",
          approvedAt: new Date().toISOString(),
        });
      } else {
        toast({
          title: "Error",
          description:
            response.data?.message || "Failed to approve requisition",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to approve requisition",
        variant: "destructive",
      });
    } finally {
      setApproving(false);
    }
  };

  const handleIssueApproval = async (issueId) => {
    try {
      setApprovingIssue(true);
      const response = await api.post(`/material-issues/${issueId}/approve`);

      if (response.status) {
        toast({
          title: "Success",
          description: "Material issue has been approved successfully.",
        });

        const updatedResponse = await api.get(`/requisitions/${id}`);
        if (updatedResponse.status && updatedResponse.data) {
          setRequisition(updatedResponse.data);
        }
      } else {
        toast({
          title: "Error",
          description:
            response.data?.message || "Failed to approve material issue",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to approve material issue",
        variant: "destructive",
      });
    } finally {
      setApprovingIssue(false);
    }
  };

  const handleIssueRejection = async (issueId) => {
    try {
      setApprovingIssue(true);
      const response = await api.post(`/material-issues/${issueId}/reject`);

      if (response.status) {
        toast({
          title: "Success",
          description: "Material issue has been rejected successfully.",
        });

        const updatedResponse = await api.get(`/requisitions/${id}`);
        if (updatedResponse.status && updatedResponse.data) {
          setRequisition(updatedResponse.data);
        }
      } else {
        toast({
          title: "Error",
          description:
            response.data?.message || "Failed to reject material issue",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to reject material issue",
        variant: "destructive",
      });
    } finally {
      setApprovingIssue(false);
    }
  };

  // Button generators
  const getApprovalButton = () => {
    const isPending = requisition.status.toLowerCase() === "pending";
    const isApprovedByPm = requisition.status.toLowerCase() === "approvedbypm";
    const isProjectManager =
      currentUser.roleId === getIdByRole("Project Manager");
    const isAdmin = userRoleLevel.role === "admin";

    if (isPending && isProjectManager) {
      const isSameSite = currentUser.site.id == requisition?.requestingSite.id;
      if (isSameSite) {
        return (
          <Button
            variant="default"
            onClick={handleApprovalByPm}
            disabled={approving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {approving ? "Forwarding..." : "Forward to Head Office"}
          </Button>
        );
      }
      return null;
    } else if (isApprovedByPm && isAdmin) {
      return (
        <Button
          variant="default"
          onClick={handleApprovalByHO}
          disabled={approving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          {approving ? "Approving..." : "Approve"}
        </Button>
      );
    }

    return null;
  };

  const getProcurementButton = () => {
    const isApprovedByHo = requisition.status.toLowerCase() === "approvedbyho";
    if (isApprovedByHo) {
      const isAdmin = userRoleLevel.role === "admin";
      if (isAdmin) {
        // Check if there are any approved quotation comparisons for this requisition
        const hasApprovedQuotations =
          requisition.quotationComparisons &&
          requisition.quotationComparisons?.some(
            (qc) => qc.status === "approved" || qc.status === "locked"
          );

        // If there are approved quotations, allow procurement creation from them
        if (hasApprovedQuotations) {
          return (
            <Button
              variant="default"
              onClick={() =>
                navigate(`/procure/new?requisitionId=${requisition.id}`)
              }
              className="bg-purple-600 hover:bg-purple-70"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Procure from Quotations
            </Button>
          );
        } else {
          // If no approved quotations exist, suggest creating a quotation first
          return (
            <Button
              variant="default"
              onClick={() =>
                navigate(`/quotation-comparison/${requisition.id}`)
              }
              className="bg-purple-600 hover:bg-purple-70"
            >
              <FileText className="mr-2 h-4 w-4" />
              Create Quotation First
            </Button>
          );
        }
      }
    }
    return null;
  };

  const getIssueButton = () => {
    const isApprovedByHo = requisition.status.toLowerCase() === "approvedbyho";
    const isAdmin = userRoleLevel.role === "admin";
    if (
      requisition.siteRejections.findIndex(
        (rejectedSite) => rejectedSite.siteId == userRoleLevel.siteId
      ) != -1
    ) {
      return null;
    }
    if (isApprovedByHo && !isAdmin) {
      const alreadyIssued = requisition.issues?.some(
        (issue) => issue.siteId == currentUser.site.id
      );
      if (alreadyIssued) {
        return null;
      }
      const isSameSite = currentUser.site.id == requisition?.requestingSite.id;
      if (!isSameSite) {
        return (
          <Button
            variant="default"
            onClick={() => navigate(`/issues/new?req_id=${requisition.id}`)}
            className="bg-orange-600 hover:bg-orange-70"
          >
            <Package className="mr-2 h-4 w-4" />
            Ready to Issue
          </Button>
        );
      }
    }
    return null;
  };

  const getClosureButton = () => {
    const handleCloseRequisition = async () => {
      try {
        setClose(true);
        const response = await api.post(`/requisitions/${id}/complete`);

        if (response.status) {
          toast({
            title: "Success",
            description: "Requisition has been completed successfully.",
          });

          setRequisition({
            ...requisition,
            status: "Completed",
            approvedAt: new Date().toISOString(),
          });
        } else {
          toast({
            title: "Error",
            description:
              response.data?.message || "Failed to complete requisition",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Failed to complete requisition",
          variant: "destructive",
        });
      } finally {
        setClose(false);
      }
    };

    const isApprovedByHo = requisition.status.toLowerCase() === "approvedbyho";
    if (isApprovedByHo) {
      // const isAdmin = userRoleLevel.role === "admin";
      const submitterId = requisition.submittedById;
      if (submitterId == currentUser.id) {
        return (
          <Button
            variant="default"
            onClick={handleCloseRequisition}
            className="bg-sky-600 hover:bg-sky-700"
            disabled={close}
          >
            <ShieldCloseIcon className="mr-2 h-4 w-4" />
            {close ? "Closing..." : "Close"}
          </Button>
        );
      }
    }
    return null;
  };

  const getRejectButton = () => {
    const isAdmin = userRoleLevel.role == "admin";
    const isApprovedByHo = requisition.status.toLowerCase() === "approvedbyho";
    const isPending = requisition.status.toLowerCase() === "pending";
    const isApprovedByPm = requisition.status.toLowerCase() === "approvedbypm";

    // Global Rejection for Admin/PM/HO
    if (isAdmin || (userRoleLevel.role !== "site" && (isPending || isApprovedByPm))) {
      if (requisition.status === "rejected" || requisition.status === "completed" || isApprovedByHo) return null;

      return (
        <Button
          onClick={() => {
            setRejectionType("global");
            setShowRejectModal(true);
          }}
          variant="destructive"
          className="bg-red-600 hover:bg-red-700"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Reject Requisition
        </Button>
      );
    }

    // Site Decline (Issue Rejection logic)
    // Only show for sites and when requisition is in appropriate status
    if (
      requisition.siteRejections.findIndex(
        (rejectedSite) => rejectedSite.siteId == userRoleLevel.siteId
      ) != -1
    ) {
      return null;
    }

    // Only show site rejection if it's a site user and not the requestor
    if (userRoleLevel.role === "site" && requisition.requestingSite?.id !== currentUser.site?.id) {
      return (
        <Button
          onClick={() => {
            setRejectionType("site");
            setShowRejectModal(true);
          }}
          variant="outline"
          className="border-red-500 text-red-600 hover:bg-red-50"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Decline Request
        </Button>
      );
    }

    return null;
  };

  const handleRejectRequisition = async () => {
    if (!rejectionRemarks.trim()) {
      toast({
        title: "Error",
        description: "Please provide rejection remarks",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsRejecting(true);

      let response;
      if (rejectionType === "global") {
        response = await api.post(
          `/requisitions/${requisition.id}/reject`,
          {
            rejectionReason: rejectionRemarks,
          }
        );
      } else {
        response = await api.post(
          `/requisitions/${requisition.id}/site-reject`,
          {
            rejectionReason: rejectionRemarks,
          }
        );
      }

      if (response.status) {
        toast({
          title: "Success",
          description: "Requisition rejected successfully.",
        });

        setShowRejectModal(false);
        setRejectionRemarks("");

        // Refresh the requisition data
        const updatedResponse = await api.get(
          `/requisitions/${requisition.id}`
        );
        if (updatedResponse.status && updatedResponse.data) {
          setRequisition(updatedResponse.data);
        }
      } else {
        toast({
          title: "Error",
          description: response.data?.message || "Failed to reject requisition",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to reject requisition",
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
    }
  };

  const getCreateComparisonButton = () => {
    // Show the button if the requisition is approved by HO or has reached an appropriate status for comparison
    const isApprovedByHo = requisition.status.toLowerCase() === "approvedbyho";
    const isAdmin = userRoleLevel.role === "admin";

    if (isApprovedByHo && isAdmin) {
      return (
        <Button
          variant="default"
          onClick={async () => {
            try {
              // const result = await quotationComparisonService.createComparison(requisition.id);
              const result = await api.post("/quotation-comparison", {
                requisitionId: requisition.id,
              });
              toast({
                title: "Success",
                description: "Quotation comparison created successfully.",
              });
              // Navigate to the newly created comparison
              navigate(`/quotation-comparison/${result.data.id}`);
            } catch (error) {
              console.log(error);
              toast({
                title: "Error",
                description:
                  error.response?.data?.message ||
                  "Failed to create quotation comparison",
                variant: "destructive",
              });
            }
          }}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <FileText className="mr-2 h-4 w-4" />
          Create Comparison
        </Button>
      );
    }
    return null;
  };

  if (loading) {
    return <Spinner />;
  }

  if (!requisition) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Requisition not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!showPdf ? (
        <>
          <RequisitionHeader
            requisition={requisition}
            getApprovalButton={getApprovalButton}
            getProcurementButton={getProcurementButton}
            getIssueButton={getIssueButton}
            getClosureButton={getClosureButton}
            getRejectButton={getRejectButton}
            getCreateComparisonButton={getCreateComparisonButton}
            handlePrint={handlePrint}
          />

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full sm:grid-cols-6 grid-cols-3 gap-2 mb-10">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              {/* Visibility Logic:
                  - Admin/HO/PM/Requesting Site: See everything (Procurements, Comparisons, Issues, Rejections)
                  - Other Sites:
                    - Procurements/Comparisons: HIDDEN
                    - Issues: Visible ONLY if they have created an issue
                    - Rejections: Visible ONLY if they have created a rejection
              */}
              {(userRoleLevel.role !== "site" || requisition.requestingSite?.id === currentUser.site?.id) && (
                <>
                  <TabsTrigger value="procurements">Procurements</TabsTrigger>
                  <TabsTrigger value="quotations">Comparisons</TabsTrigger>
                </>
              )}

              {(userRoleLevel.role !== "site" ||
                requisition.requestingSite?.id === currentUser.site?.id ||
                requisition.issues?.some(issue => issue.fromSite?.id === currentUser.site?.id)) && (
                  <TabsTrigger value="issues">Issues</TabsTrigger>
                )}

              {(userRoleLevel.role !== "site" ||
                requisition.requestingSite?.id === currentUser.site?.id ||
                requisition.siteRejections?.some(rejection => rejection.siteId === currentUser.site?.id)) && (
                  <TabsTrigger value="site-rejection">Issue Rejections</TabsTrigger>
                )}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <OverviewTab requisition={requisition} />
            </TabsContent>

            {/* Items Tab */}
            <TabsContent value="items">
              <ItemsTab
                requisition={requisition}
                currentUser={currentUser}
                userRoleLevel={userRoleLevel}
                isEditingItems={isEditingItems}
                tempRequisitionItems={tempRequisitionItems}
                requisitionItemStocks={requisitionItemStocks}
                startEditingItems={startEditingItems}
                saveEditedItems={saveEditedItems}
                cancelEditingItems={cancelEditingItems}
                handleTempQuantityChange={handleTempQuantityChange}
                getUnitName={getUnitName}
              />
            </TabsContent>

            {/* Procurements Tab */}
            {(userRoleLevel.role !== "site" || requisition.requestingSite?.id === currentUser.site?.id) && (
              <TabsContent value="procurements">
                <ProcurementsTab
                  requisition={requisition}
                  navigate={navigate}
                  getProcurementStatusBadge={getProcurementStatusBadge}
                  formatCurrency={formatCurrency}
                />
              </TabsContent>
            )}

            {/* Quotations Tab */}
            {(userRoleLevel.role !== "site" || requisition.requestingSite?.id === currentUser.site?.id) && (
              <TabsContent value="quotations">
                <QuotationsTab requisition={requisition} />
              </TabsContent>
            )}

            {/* Issues Tab */}
            {(userRoleLevel.role !== "site" ||
              requisition.requestingSite?.id === currentUser.site?.id ||
              requisition.issues?.some(issue => issue.fromSite?.id === currentUser.site?.id)) && (
                <TabsContent value="issues">
                  <IssuesTab
                    requisition={requisition}
                    navigate={navigate}
                    userRoleLevel={userRoleLevel}
                    handleIssueApproval={handleIssueApproval}
                    handleIssueRejection={handleIssueRejection}
                    approvingIssue={approvingIssue}
                    getIssueStatusBadge={getIssueStatusBadge}
                    getUnitName={getUnitName}
                  />
                </TabsContent>
              )}

            {/*Site Rejection Tab */}
            {(userRoleLevel.role !== "site" ||
              requisition.requestingSite?.id === currentUser.site?.id ||
              requisition.siteRejections?.some(rejection => rejection.siteId === currentUser.site?.id)) && (
                <TabsContent value="site-rejection">
                  <SiteRejectionTab requisition={requisition} />
                </TabsContent>
              )}
          </Tabs>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Print Preview</h1>
            <Button
              onClick={() => setShowPdf(false)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Close Preview
            </Button>
          </div>
          <div className="w-full h-screen border rounded-lg overflow-hidden">
            <PDFViewer width="100%" height="100%">
              <MaterialRequisitionPDF
                formData={requisition}
                items={requisition.items}
              />
            </PDFViewer>
          </div>
        </div>
      )}
      <RejectModal
        showRejectModal={showRejectModal}
        setShowRejectModal={setShowRejectModal}
        rejectionRemarks={rejectionRemarks}
        setRejectionRemarks={setRejectionRemarks}
        handleRejectRequisition={handleRejectRequisition}
        isRejecting={isRejecting}
        title={rejectionType === "global" ? "Reject Requisition" : "Decline Request"}
        description={
          rejectionType === "global"
            ? "Please provide a reason for rejecting this requisition. This action cannot be undone."
            : "Please provide a reason why you are declining this request."
        }
        note={
          rejectionType === "global"
            ? "Once rejected, this requisition will be closed and cannot be processed further."
            : "Once declined, this requisition will be marked as rejected by your site."
        }
        actionLabel={rejectionType === "global" ? "Reject Requisition" : "Decline Request"}
      />
    </div>
  );
};

export default MaterialRequisitionView;
