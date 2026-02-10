import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import {
  CalendarIcon,
  Wrench,
  User,
  IndianRupee,
  Clock,
  FileText,
  AlertTriangle,
  Info,
  Package,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { maintenanceIntervalsService } from "@/services/api/maintenance-intervals-service";
import { MAINTENANCE_SERVICE_TYPES } from "@/config/maintenance-service-types";
import { VendorManager } from "./VendorManager";

const MaintenanceLogForm = ({
  formData,
  vendors,
  onInputChange,
  onSelectChange,
  onDateChange,
  onVendorsChange,
  onSubmit,
  onCancel,
  machineId,
}) => {
  const [serviceIntervals, setServiceIntervals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onInputChange(name, value);
  };

  const handleSelectChange = (name, value) => {
    onSelectChange(name, value);
  };

  const handleDateChange = (date) => {
    onDateChange(date);
  };

  const handleDueDateChange = (date) => {
    handleSelectChange("dueDate", date);
  };

  useEffect(() => {
    if (machineId) {
      const fetchServiceIntervals = async () => {
        try {
          setLoading(true);
          const intervals =
            await maintenanceIntervalsService.getMachineServiceIntervals(
              machineId
            );
          setServiceIntervals(intervals);
        } catch (err) {
          setError("Failed to load service intervals for this machine");
          console.error("Error fetching service intervals:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchServiceIntervals();
    }
  }, [machineId]);

  const allServiceTypes = [...MAINTENANCE_SERVICE_TYPES];
  serviceIntervals.forEach((interval) => {
    if (!allServiceTypes.some((type) => type.value === interval.serviceType)) {
      allServiceTypes.push({
        value: interval.serviceType,
        label: interval.serviceType
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
      });
    }
  });

  const isScheduledMaintenance = ["scheduled", "overdue", "due_today"].includes(
    formData.status
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Add Service Record
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Complete the form below to log a new maintenance service
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Basic Service Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wrench className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Enter the fundamental details of the service performed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Service Type */}
              <FormField
                label="Service Type"
                icon={<Package className="h-4 w-4" />}
              >
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {loading ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          Loading service types...
                        </div>
                      </SelectItem>
                    ) : (
                      allServiceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </FormField>

              {/* Service Date */}
              <FormField
                label="Service Date"
                icon={<CalendarIcon className="h-4 w-4" />}
              >
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date
                        ? format(formData.date, "PPP")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormField>

              {/* Title */}
              <FormField
                label="Service Title"
                required
                icon={<FileText className="h-4 w-4" />}
              >
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Routine Oil Change"
                />
              </FormField>

              {/* Technician */}
              <FormField
                label="Technician Name"
                icon={<User className="h-4 w-4" />}
              >
                <Input
                  id="technician"
                  name="technician"
                  value={formData.technician}
                  onChange={handleInputChange}
                  placeholder="Enter technician name"
                />
              </FormField>

              {/* Hours at Service */}
              <FormField
                label="Machine Hours"
                icon={<Clock className="h-4 w-4" />}
                helper="Total machine operating hours at time of service"
              >
                <Input
                  id="hoursAtService"
                  name="hoursAtService"
                  type="number"
                  step="1"
                  value={formData.hoursAtService}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </FormField>

              {/* Hours at Service */}
              <FormField
                label="Machine Kilometers"
                icon={<Clock className="h-4 w-4" />}
                helper="Total machine operating kilometers at time of service"
              >
                <Input
                  id="kilometersAtService"
                  name="kilometersAtService"
                  type="number"
                  step="1"
                  value={formData.kilometersAtService}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </FormField>

              {/* Total Cost */}
              <FormField
                label="Total Cost"
                icon={<IndianRupee className="h-4 w-4" />}
              >
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    id="cost"
                    name="cost"
                    type="number"
                    value={formData.cost}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="pl-7"
                    min="0"
                    step="0.01"
                  />
                </div>
              </FormField>
            </div>

            {/* Description - Full Width */}
            <div className="pt-2">
              <FormField
                label="Service Description"
                icon={<FileText className="h-4 w-4" />}
                helper="Provide detailed information about the service performed"
              >
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the maintenance work, issues found, parts replaced, and any recommendations..."
                  rows={4}
                  className="resize-none"
                />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Maintenance Details */}
        {isScheduledMaintenance && (
          <Card className="border-orange-200 bg-orange-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-orange-700">
                <AlertTriangle className="h-5 w-5" />
                Scheduled Maintenance Planning
              </CardTitle>
              <CardDescription>
                Additional details for scheduled or pending maintenance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Due Date */}
                <FormField
                  label="Due Date"
                  icon={<CalendarIcon className="h-4 w-4" />}
                >
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dueDate
                          ? format(formData.dueDate, "PPP")
                          : "Select due date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.dueDate}
                        onSelect={handleDueDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormField>

                {/* Priority */}
                <FormField
                  label="Priority Level"
                  icon={<AlertTriangle className="h-4 w-4" />}
                >
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      handleSelectChange("priority", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="h-2 w-2 rounded-full p-0"
                          />
                          Low Priority
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="default"
                            className="h-2 w-2 rounded-full p-0 bg-yellow-500"
                          />
                          Medium Priority
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="destructive"
                            className="h-2 w-2 rounded-full p-0"
                          />
                          High Priority
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                {/* Estimated Hours */}
                <FormField
                  label="Estimated Hours"
                  icon={<Clock className="h-4 w-4" />}
                >
                  <Input
                    id="estimatedHours"
                    name="estimatedHours"
                    type="number"
                    step="0.1"
                    value={formData.estimatedHours}
                    onChange={handleInputChange}
                    placeholder="0.0"
                    min="0"
                  />
                </FormField>

                {/* Estimated Cost */}
                <FormField
                  label="Estimated Cost"
                  icon={<IndianRupee className="h-4 w-4" />}
                >
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      ₹
                    </span>
                    <Input
                      id="estimatedCost"
                      name="estimatedCost"
                      type="number"
                      step="0.01"
                      value={formData.estimatedCost}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="pl-7"
                      min="0"
                    />
                  </div>
                </FormField>
              </div>

              {/* Assigned To - Full Width */}
              <FormField
                label="Assigned To"
                icon={<User className="h-4 w-4" />}
              >
                <Input
                  id="assignedTo"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  placeholder="Enter name of assigned person or team"
                />
              </FormField>
            </CardContent>
          </Card>
        )}

        {/* Vendor Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5" />
              Vendors & Parts
              {vendors.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {vendors.length} Vendor(s)
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Manage vendors and parts used in this service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VendorManager
              vendors={vendors}
              onVendorsChange={onVendorsChange}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Alert className="flex-1 mr-4">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              All fields marked with an asterisk (*) are required
            </AlertDescription>
          </Alert>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" size="lg" className="min-w-[180px]">
              <FileText className="h-4 w-4 mr-2" />
              Save Service Record
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

// Reusable FormField Component
function FormField({ label, children, icon, helper, required }) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm font-medium">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {helper && (
        <p className="text-xs text-muted-foreground flex items-start gap-1.5">
          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
          {helper}
        </p>
      )}
    </div>
  );
}

export default MaintenanceLogForm;
