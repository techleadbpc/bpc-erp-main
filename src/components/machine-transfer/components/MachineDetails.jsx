// components/MachineDetails.jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function MachineDetails({ machine }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Machine Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <DetailRow label="Machine Name" value={machine.machineName} />
          <DetailRow label="ERP Code" value={machine.erpCode} />
          <DetailRow label="Registration Number" value={machine.registrationNumber} />
          <DetailRow label="Machine Number" value={machine.machineNumber} />
          <DetailRow label="Model" value={machine.model} />
          <DetailRow label="Year" value={machine.year} />
        </div>
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="text-sm font-semibold">{value || "N/A"}</span>
    </div>
  );
}
