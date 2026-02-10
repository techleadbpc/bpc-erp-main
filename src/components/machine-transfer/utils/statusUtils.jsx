// utils/statusUtils.js
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, Truck, Package, AlertCircle } from "lucide-react";

export const getStatusBadge = (status) => {
  switch (status.toLowerCase()) {
    case "pending":
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
    case "approved":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Approved</Badge>;
    case "dispatched":
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Dispatched</Badge>;
    case "received":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Received</Badge>;
    case "rejected":
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const getStatusIcon = (status) => {
  switch (status.toLowerCase()) {
    case "pending":
      return <Clock className="h-5 w-5 text-yellow-600" />;
    case "approved":
      return <CheckCircle className="h-5 w-5 text-blue-600" />;
    case "dispatched":
      return <Truck className="h-5 w-5 text-orange-600" />;
    case "received":
      return <Package className="h-5 w-5 text-green-600" />;
    case "rejected":
      return <XCircle className="h-5 w-5 text-red-600" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-600" />;
  }
};
