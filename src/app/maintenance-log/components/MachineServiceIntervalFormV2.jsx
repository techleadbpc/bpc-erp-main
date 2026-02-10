import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Assuming this config exists and uses non-empty string values
import { MAINTENANCE_SERVICE_TYPES } from "@/config/maintenance-service-types";
import { Checkbox } from "@radix-ui/react-checkbox";

// --- Constants for Calendar Intervals (in days) ---
const CALENDAR_INTERVAL_OPTIONS = [
  // Ensure non-empty string values, using 'none' for Not Applicable
  { value: "365", label: "1 Year" },
  { value: "180", label: "6 Months" },
  { value: "120", label: "4 Months" },
  { value: "90", label: "3 Months" },
  { value: "60", label: "2 Months" },
  { value: "30", label: "1 Month" },
  { value: "none", label: "Not Applicable" },
];

const MachineServiceIntervalFormV2 = ({
  formData,
  onInputChange,
  onSelectChange,
  onSubmit,
  onCancel,
}) => {
  // Handles updates for Input fields (KM, Hours)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onInputChange(name, value);
  };

  // Handles updates for Select fields (Service Type, Calendar Interval)
  const handleSelectChange = (name, value) => {
    // Only accept non-empty values from Selects
    if (value !== null && value !== undefined) {
      onSelectChange(name, value);
    }
  };

  const serviceTypeOptions = MAINTENANCE_SERVICE_TYPES;

  return (
    <div className="space-y-4 p-4 border rounded-md">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Define Service Interval Triggers
        </h3>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="p-3 w-1/5">
                  Service Type
                </th>
                <th scope="col" className="p-3 w-1/5">
                  Interval (KM)
                </th>
                <th scope="col" className="p-3 w-1/5">
                  Interval (Hours)
                </th>
                <th scope="col" className="p-3 w-2/5">
                  Interval (Calendar Days)
                </th>
                <th scope="col" className="p-3 w-2/5">
                  Notes
                </th>
                <th scope="col" className="p-3 w-2/5">
                  Active
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                {/* 1. Service Type (Dropdown) */}
                <td className="p-3">
                  <Select
                    value={formData.serviceType || ""} // Use "" for placeholder state
                    onValueChange={(value) =>
                      handleSelectChange("serviceType", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>

                {/* 2. Interval (Kilometers) */}
                <td className="p-3">
                  <Input
                    name="intervalKm"
                    type="number"
                    value={formData.intervalKm || ""}
                    onChange={handleInputChange}
                    placeholder="e.g., 5000"
                  />
                </td>

                {/* 3. Interval (Hours) */}
                <td className="p-3">
                  <Input
                    name="intervalHours"
                    type="number"
                    value={formData.intervalHours || ""}
                    onChange={handleInputChange}
                    placeholder="e.g., 500"
                  />
                </td>

                {/* 4. Interval (Calendar Days) */}
                <td className="p-3">
                  <Select
                    value={formData.intervalCalendarDays || "none"} // Default to 'none' if empty
                    onValueChange={(value) =>
                      handleSelectChange("intervalCalendarDays", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select days" />
                    </SelectTrigger>
                    <SelectContent>
                      {CALENDAR_INTERVAL_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                {/* 5. Notes */}
                <td className="p-3">
                  <Input
                    name="notes"
                    type="text"
                    value={formData.notes || ""}
                    onChange={handleInputChange}
                    placeholder="Additional notes"
                  />
                </td>
                {/* 6. Active */}
                <td className="p-3">
                  <Checkbox
                    name="isActive"
                    checked={formData.isActive || false}
                    onChange={(e) =>
                      handleInputChange({
                        target: { name: "isActive", value: e.target.checked },
                      })
                    }
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* --- Submit Button --- */}
        <div className="flex justify-end pt-2">
          <Button type="submit" size="lg">
            Save Interval Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MachineServiceIntervalFormV2;
