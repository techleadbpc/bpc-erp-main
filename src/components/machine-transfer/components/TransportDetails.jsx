// components/TransportDetails.jsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Truck, Gauge, Route, FileDown, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TransportDetails({
  transfer,
  currentSite,
  destinationSite,
}) {
  const isOtherCarrying = transfer.vehicleType != "self_carrying";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Transport Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vehicle Type */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            Vehicle Type
          </span>
          <Badge variant={isOtherCarrying ? "secondary" : "default"}>
            {isOtherCarrying ? "Other-Carrying" : "Self-Carrying"}
          </Badge>
        </div>
        {/* Sites */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium">From: {currentSite?.name}</p>
              <p className="text-xs text-gray-500">{currentSite?.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm font-medium">To: {destinationSite?.name}</p>
              <p className="text-xs text-gray-500">
                {destinationSite?.address}
              </p>
            </div>
          </div>
        </div>
        {/* Transport Details - Only for Other-Carrying */}
        {isOtherCarrying && transfer.transportDetails && (
          <div className="space-y-2 border-t pt-3">
            <h4 className="font-medium text-sm">Transport Details</h4>
            <div className="space-y-2 text-sm">
              <DetailRow
                label="Vehicle Number"
                value={transfer.transportDetails.vehicleNumber}
              />
              <DetailRow
                label="Driver Name"
                value={transfer.transportDetails.driverName}
              />
              <DetailRow
                label="Mobile Number"
                value={transfer.transportDetails.mobileNumber}
              />
            </div>
          </div>
        )}
        {/* Readings */}
        {(transfer.fuelGaugeReading || transfer.odometerReading) && (
          <div className="space-y-2 border-t pt-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Readings
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {transfer.fuelGaugeReading && (
                <div>
                  <p className="text-gray-600">Fuel Gauge</p>
                  <p className="font-medium">{transfer.fuelGaugeReading}</p>
                </div>
              )}
              {transfer.odometerReading && (
                <div>
                  <p className="text-gray-600">Odometer</p>
                  <p className="font-medium">{transfer.odometerReading}</p>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Items Included */}
        {transfer.itemsIncluded && transfer.itemsIncluded.length > 0 && (
          <div className="border-t pt-3">
            <h4 className="font-medium text-sm mb-2">Items Included</h4>
            <div className="flex flex-wrap gap-1">
              {transfer.itemsIncluded.map((item, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {Array.isArray(transfer?.files) &&
          transfer?.files &&
          transfer?.files?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Attached Files</CardTitle>
                <CardDescription>
                  Files uploaded during the transfer process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {transfer.files?.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{`File ${index + 1}`}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(file.url || file.path, "_blank")
                        }
                      >
                        <FileDown className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        {!Array.isArray(transfer?.files) && transfer?.files && (
          <Card>
            <CardHeader>
              <CardTitle>Attached Files</CardTitle>
              <CardDescription>
                Files uploaded during the transfer process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div
                  key={1}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{`File 1`}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(transfer.files, "_blank")}
                  >
                    <FileDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value || "N/A"}</span>
    </div>
  );
}
