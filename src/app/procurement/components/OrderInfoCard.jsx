import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Truck, CheckCircle, Package, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const OrderInfoCard = ({ procurement }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-10 text-yellow-800 border-yellow-20";
      case "ordered":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-200";
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
      "Pending": <Calendar className="h-4 w-4" />,
      "ordered": <CheckCircle className="h-4 w-4" />,
      "Delivered": <Truck className="h-4 w-4" />,
      "Partial": <Package className="h-4 w-4" />,
      "Cancelled": <AlertCircle className="h-4 w-4" />,
    };

    return statusIcons[status] || <FileText className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Order Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Procurement No.
              </p>
              <p className="text-lg font-semibold">
                {procurement.procurementNo}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Requisition No.
              </p>
              <p className="text-lg font-semibold">
                REQ-{procurement.requisitionId}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Created Date
              </p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <p>
                  {format(
                    new Date(procurement.createdAt),
                    "dd MMM yyyy"
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Expected Delivery
              </p>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-gray-500" />
                <p>
                  {format(
                    new Date(procurement.expectedDelivery),
                    "dd MMM yyyy"
                  )}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Status
              </p>
              <Badge
                className={`${getStatusColor(
                  procurement.status
                )} px-3 py-1 border`}
              >
                {getStatusIcon(procurement.status)}
                <span className="ml-1 capitalize">
                  {procurement.status}
                </span>
              </Badge>
            </div>
          </div>
        </div>

        {procurement.notes && (
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-600 mb-2">
              Notes
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-gray-700">{procurement.notes}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderInfoCard;
