import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FileText, CheckCircle, Truck } from "lucide-react";
import { format } from "date-fns";

const StatusTimelineCard = ({ procurement }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Status Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-60" />
            </div>
            <div>
              <p className="font-medium">Created</p>
              <p className="text-sm text-gray-600">
                {format(
                  new Date(procurement.createdAt),
                  "dd MMM yyyy"
                )}
              </p>
            </div>
          </div>

          {procurement.status === "ordered" && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Approved</p>
                <p className="text-sm text-gray-600">
                  {format(
                    new Date(procurement.updatedAt),
                    "dd MMM yyyy"
                  )}
                </p>
              </div>
            </div>
          )}

          {procurement.status === "Delivered" && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Truck className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Delivered</p>
                <p className="text-sm text-gray-60">
                  {format(
                    new Date(procurement.updatedAt),
                    "dd MMM yyyy"
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusTimelineCard;
