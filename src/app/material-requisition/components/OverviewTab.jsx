import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Building, User, MapPin } from "lucide-react";

const OverviewTab = ({ requisition }) => {
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Requisition No</p>
              <p className="font-medium">
                {requisition?.requisitionNo}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Charge Type</p>
              <p className="font-medium">{requisition.chargeType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Due Date</p>
              <p className="font-medium">
                {requisition.dueDate
                  ? new Date(requisition.dueDate).toLocaleDateString()
                  : "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Requested For</p>
              <p className="font-medium">
                {requisition.requestedFor || "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Site Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Site Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Requesting Site</p>
            <p className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              {requisition?.requestingSite?.name || "N/A"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Personnel Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personnel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Prepared By</p>
            <p className="font-medium">
              {requisition.preparedBy?.name || "N/A"}
            </p>
          </div>
          {requisition.approvedBy && (
            <div>
              <p className="text-sm text-gray-600">Approved By</p>
              <p className="font-medium">
                {requisition.approvedBy.name}
              </p>
              <p className="text-sm text-gray-500">
                {formatDate(requisition.approvedAt)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
