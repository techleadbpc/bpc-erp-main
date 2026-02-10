import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, UserCheck, MapPin } from "lucide-react";

const VendorSelectionCard = ({
  formData,
  vendors,
  fetchingVendors,
}) => {
  const selectedVendor = vendors.find(
    (v) => v.id.toString() === formData.vendorId?.toString()
  );

  if (fetchingVendors) {
    return (
      <Card className="border-blue-100 shadow-sm animate-pulse">
        <CardContent className="p-6">
          <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-slate-100 rounded w-full"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-100 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
            <User className="h-5 w-5" />
            Vendor Information
          </CardTitle>
          {selectedVendor && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
              Selected from Quotation
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {!selectedVendor ? (
          <div className="p-6 text-center text-slate-500 italic">
            No vendor selected or information unavailable.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="p-5 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendor Name</span>
              <span className="text-base font-semibold text-slate-800">{selectedVendor.name}</span>
            </div>

            <div className="p-5 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Mail className="h-3 w-3" /> Email Address
              </span>
              <span className="text-sm font-medium text-slate-600 break-all">
                {selectedVendor.email || "Not Provided"}
              </span>
            </div>

            <div className="p-5 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <UserCheck className="h-3 w-3" /> Contact Person
              </span>
              <span className="text-sm font-medium text-slate-600">
                {selectedVendor.contactPerson || "Not Provided"}
              </span>
            </div>

            <div className="p-5 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Office Address
              </span>
              <span className="text-sm font-medium text-slate-600 line-clamp-2">
                {selectedVendor.address || "Not Provided"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorSelectionCard;
