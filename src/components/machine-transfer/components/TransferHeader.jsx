// components/TransferHeader.jsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatusBadge, getStatusIcon } from "../utils/statusUtils";

export default function TransferHeader({ transfer }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(transfer.status)}
            Transfer Details
          </CardTitle>
          {getStatusBadge(transfer.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <h4 className="font-medium text-gray-600">Request ID</h4>
            <p className="font-semibold">{transfer.name}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-600">Request Type</h4>
            <p className="font-semibold">{transfer.requestType}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-600">Vehicle Type</h4>
            <p className="font-semibold">
              {transfer.vehicleType === "self_carrying"
                ? "Self-Carrying Vehicle"
                : "Other-Carrying Vehicle"}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-600">Status</h4>
            <p className="font-semibold">{transfer.status}</p>
          </div>
        </div>
        {transfer.reason && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-600 mb-1">Reason</h4>
            <p className="text-sm">{transfer.reason}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
