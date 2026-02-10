import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { MAINTENANCE_SERVICE_TYPES } from "@/config/maintenance-service-types";

const MachineServiceIntervalForm = ({
  machineId,
  formData,
  onInputChange,
  onSelectChange,
  onSubmit,
  onCancel,
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onInputChange(name, value);
  };

  const handleSelectChange = (name, value) => {
    onSelectChange(name, value);
  };

  // Use centralized service type options
  const serviceTypeOptions = MAINTENANCE_SERVICE_TYPES;

  // Define interval type options
  const intervalTypeOptions = [
    { value: "hours", label: "Hours" },
    { value: "kilometers", label: "Kilometers" },
    { value: "calendar", label: "Calendar Days" },
  ];

  return (
    <div className="space-y-4 p-4 border rounded-md">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Configure Service Interval</h3>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type</Label>
            <Select
              value={formData.serviceType}
              onValueChange={(value) => handleSelectChange("serviceType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="intervalType">Interval Type</Label>
            <Select
              value={formData.intervalType}
              onValueChange={(value) => handleSelectChange("intervalType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interval type" />
              </SelectTrigger>
              <SelectContent>
                {intervalTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="intervalValue">Interval Value</Label>
            <Input
              id="intervalValue"
              name="intervalValue"
              type="number"
              value={formData.intervalValue}
              onChange={handleInputChange}
              placeholder="Enter interval value (e.g., 1000 for km/hours)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastServiceValue">Last Service Value</Label>
            <Input
              id="lastServiceValue"
              name="lastServiceValue"
              type="number"
              value={formData.lastServiceValue}
              onChange={handleInputChange}
              placeholder="Last recorded value (km/hours)"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Additional notes about this service interval"
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg">
            Save Service Interval
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MachineServiceIntervalForm;
