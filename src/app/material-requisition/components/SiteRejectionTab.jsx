import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XCircle, MapPin } from "lucide-react";

const SiteRejectionTab = ({ requisition }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <XCircle className="h-5 w-5" />
          Site Rejections ({requisition.siteRejections?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requisition.siteRejections &&
        requisition.siteRejections.length > 0 ? (
          <div className="space-y-4">
            {requisition.siteRejections.map((rejection, index) => (
              <div
                key={rejection.id}
                className="border rounded-lg p-4 bg-red-50 border-red-20"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-red-800">
                        Rejection #{rejection.id}
                      </h3>
                      <Badge
                        variant="destructive"
                        className="bg-red-100 text-red-800"
                      >
                        Rejected
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          Rejected By
                        </p>
                        <p className="font-medium">
                          {rejection.rejectedBy?.name || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {rejection.rejectedBy?.email || ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Rejected At
                        </p>
                        <p className="font-medium">
                          {new Date(
                            rejection.rejectedAt
                          ).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(
                            rejection.rejectedAt
                          ).toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Site ID
                        </p>
                        <p className="font-medium">
                          {rejection.siteId}
                        </p>
                        {rejection.site?.name && (
                          <p className="text-sm text-gray-500">
                            {rejection.site.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rejection Reason */}
                <div className="mt-4 p-3 bg-white rounded border border-red-200">
                  <h4 className="font-medium text-sm mb-2 text-red-800">
                    Rejection Reason
                  </h4>
                  <p className="text-sm text-gray-700">
                    {rejection.rejectionReason}
                  </p>
                </div>

                {/* Additional Information */}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-500">
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(rejection.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span>{" "}
                    {new Date(rejection.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No site rejections found</p>
            <p className="text-sm text-gray-400">
              Site rejections will appear here when sites reject this
              requisition
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SiteRejectionTab;
