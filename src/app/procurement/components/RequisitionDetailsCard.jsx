import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

const RequisitionDetailsCard = ({ requisition }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Requisition Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Requisition Number</Label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">
                {requisition.requisitionNo || requisition.number}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Site</Label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">
                {requisition.requestingSite?.name || "NA"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Requested Date</Label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">
                {new Date(
                  requisition.requestedAt || requisition.createdAt
                ).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <Badge variant="outline">{requisition.status}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RequisitionDetailsCard;
