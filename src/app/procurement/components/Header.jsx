import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  MoreVertical,
  PlusCircle,
  Clock,
  CheckCircle,
  Truck,
  Package,
  AlertCircle,
  FileText,
  Trash2,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import InvoiceForm from "../InvoiceForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Header = ({
  procurement,
  isInvoiceDialogOpen,
  setIsInvoiceDialogOpen,
  handleDownloadPDF,
  isGeneratingPdf,
  handleStatusUpdate,
  handleInvoiceSubmit, // Add this prop
  handleDeleteProcurement, // Add delete handler
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"; // Fixed color
      case "ordered":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "accepted_at_virtual_site":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "in_transit_to_requested_site":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-2"; // Fixed color
      case "Partial":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      Pending: <Clock className="h-4 w-4" />,
      ordered: <CheckCircle className="h-4 w-4" />,
      accepted_at_virtual_site: <Package className="h-4 w-4" />,
      in_transit_to_requested_site: <Truck className="h-4 w-4" />,
      Delivered: <Truck className="h-4 w-4" />,
      Partial: <Package className="h-4 w-4" />,
      Cancelled: <AlertCircle className="h-4 w-4" />,
    };

    return statusIcons[status] || <FileText className="h-4 w-4" />;
  };

  return (
    <div className="rounded-lg shadow-sm mb-6">
      <div className="flex items-center justify-between sm:flex-row flex-col gap-4 p-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {procurement.procurementNo}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Created on{" "}
              {format(new Date(procurement.createdAt), "dd MMM yyyy")}
            </p>
          </div>
          <Badge
            className={`${getStatusColor(procurement.status)} px-3 py-1 border`}
          >
            {getStatusIcon(procurement.status)}
            <span className="ml-1 capitalize">{procurement.status}</span>
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hover:bg-gray-100"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
          >
            <Download className="h-4 w-4 mr-2" />
            {isGeneratingPdf ? "Generating..." : "Download PDF"}
          </Button>
          <Dialog
            open={isInvoiceDialogOpen}
            onOpenChange={setIsInvoiceDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="hover:bg-blue-50 hover:text-blue-600" // Fixed color
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <InvoiceForm
                procurement={procurement}
                onSave={handleInvoiceSubmit} // Use the proper prop
              />
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {procurement.status === "Pending" && (
                <DropdownMenuItem onClick={() => handleStatusUpdate("ordered")}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Order
                </DropdownMenuItem>
              )}
              {/* {procurement.status === "ordered" && (
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate("accepted_at_virtual_site")}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Accept at Virtual Site
                </DropdownMenuItem>
              )}
              {procurement.status === "accepted_at_virtual_site" && (
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate("in_transit_to_requested_site")}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Send to Requested Site
                </DropdownMenuItem>
              )}
              {procurement.status === "in_transit_to_requested_site" && (
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate("delivered")}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Accept at Requested Site
                </DropdownMenuItem>
              )} */}
              {procurement.status !== "cancelled" &&
                procurement.status !== "delivered" && (
                  <>
                    {/* <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleStatusUpdate("cancelled")}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cancel Order
                    </DropdownMenuItem>
                    <DropdownMenuSeparator /> */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="w-full px-2 py-1.5 text-sm hover:bg-red-50 hover:text-red-600 rounded-sm cursor-pointer text-red-600 flex items-center gap-2"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel Order
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            cancel the procurement order and all associated
                            data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleStatusUpdate("cancelled")}
                          >
                            Cancel Order
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Header;
