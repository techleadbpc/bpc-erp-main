import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building, User, Mail, Phone, MapPin } from "lucide-react";

const VendorInfoCard = ({ procurement }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Vendor Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-lg ">
              {procurement.Vendor?.name}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <User className="h-4 w-4" />
              <span>{procurement.Vendor.contactPerson}</span>
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">
                {procurement.Vendor.email}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">
                {procurement.Vendor.phone}
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
              <span className="text-gray-700">
                {procurement.Vendor.address}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorInfoCard;
