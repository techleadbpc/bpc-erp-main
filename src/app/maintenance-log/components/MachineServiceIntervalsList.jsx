import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, AlertTriangle, CheckCircle } from "lucide-react";

const MachineServiceIntervalsList = ({
  intervals,
  onEdit,
  onDelete,
  machineId,
  onAddNew,
}) => {
  // Format interval type for display
  const formatIntervalType = (type) => {
    switch (type) {
      case "hours":
        return "Hours";
      case "kilometers":
        return "Kilometers";
      case "calendar":
        return "Calendar Days";
      default:
        return type;
    }
  };

  // Get status badge based on service interval status
  const getStatusBadge = (interval) => {
    // For now, we'll show if the interval is active or not
    if (!interval.isActive) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
          Inactive
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" /> Active
      </Badge>
    );
  };

  // Format calendar days value
  const formatCalendarDays = (days) => {
    if (days === null || days === undefined || days === 0) return "Not Applicable";
    if (days === 365) return "1 Year";
    if (days === 180) return "6 Months";
    if (days === 120) return "4 Months";
    if (days === 90) return "3 Months";
    if (days === 60) return "2 Months";
    if (days === 30) return "1 Month";
    return `${days} days`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Service Intervals</h3>
        <Button onClick={onAddNew}>
          Add Service Interval
        </Button>
      </div>

      {intervals.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No service intervals configured for this machine.</p>
          <p className="text-sm mt-2">Add a service interval to track maintenance schedules.</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table className="text-sm">
            <TableHeader className="bg-gray-50 dark:bg-gray-700">
              <TableRow>
                <TableHead className="p-3 w-1/5">Service Type</TableHead>
                <TableHead className="p-3 w-1/5">Interval (KM)</TableHead>
                <TableHead className="p-3 w-1/5">Interval (Hours)</TableHead>
                <TableHead className="p-3 w-2/5">Interval (Calendar Days)</TableHead>
                <TableHead className="p-3 w-2/5">Notes</TableHead>
                <TableHead className="p-3 w-2/5">Active</TableHead>
                <TableHead className="p-3 w-1/6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {intervals.map((interval) => (
                <TableRow key={interval.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="p-3 font-medium">
                    {interval.serviceType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                  </TableCell>
                  <TableCell className="p-3">
                    {interval.intervalKm || 'N/A'}
                  </TableCell>
                  <TableCell className="p-3">
                    {interval.intervalHours || 'N/A'}
                  </TableCell>
                  <TableCell className="p-3">
                    {formatCalendarDays(interval.intervalCalendarDays)}
                  </TableCell>
                  <TableCell className="p-3 max-w-xs truncate">
                    {interval.notes || 'N/A'}
                  </TableCell>
                  <TableCell className="p-3">
                    {getStatusBadge(interval)}
                  </TableCell>
                  <TableCell className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(interval)}
                        className="p-2"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(interval.id)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default MachineServiceIntervalsList;
