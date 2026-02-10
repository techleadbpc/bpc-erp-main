import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertTriangle, Wrench, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/services/api/api-service";
import { Spinner } from "@/components/ui/loader";
import { format } from "date-fns";

export default function MaintenanceSummaryCard({ machineId }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMaintenanceSummary();
  }, [machineId]);

  const fetchMaintenanceSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/maintanance/summary/${machineId}`);
      setSummary(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching maintenance summary:", err);
      setError("Failed to load maintenance summary");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        {error}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No maintenance data available
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return format(new Date(dateString), "h:mm a");
  };

  const getNextMaintenanceStatus = (dueDate) => {
    if (!dueDate) return null;
    const now = new Date();
    const nextDate = new Date(dueDate);
    
    if (nextDate.toDateString() === now.toDateString()) {
      return { variant: "destructive", label: "Due Today" };
    } else if (nextDate < new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2)) {
      return { variant: "warning", label: "Due Soon" };
    } else {
      return { variant: "default", label: "Upcoming" };
    }
  };

  const lastMaintenanceStatus = summary.lastMaintenance ? summary.lastMaintenance.status : null;
  const nextMaintenanceStatus = summary.nextMaintenance ? getNextMaintenanceStatus(summary.nextMaintenance.dueDate) : null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Maintenance Count */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalMaintenanceCount || 0}</div>
            <p className="text-xs text-muted-foreground">Records</p>
          </CardContent>
        </Card>

        {/* Overdue Maintenance */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Maintenance</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.overdueCount || 0}</div>
            <p className="text-xs text-muted-foreground">Tasks requiring attention</p>
          </CardContent>
        </Card>

        {/* Next Maintenance */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Maintenance</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.nextMaintenance ? formatDate(summary.nextMaintenance.dueDate) : "N/A"}</div>
            {summary.nextMaintenance && nextMaintenanceStatus && (
              <Badge variant={nextMaintenanceStatus.variant} className="mt-1">
                {nextMaintenanceStatus.label}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Last and Next Maintenance Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Last Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Last Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.lastMaintenance ? (
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{summary.lastMaintenance.title}</h3>
                    <p className="text-sm text-muted-foreground">{summary.lastMaintenance.type}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {summary.lastMaintenance.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(summary.lastMaintenance.date)} {formatTime(summary.lastMaintenance.date)}</span>
                </div>
                {summary.lastMaintenance.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {summary.lastMaintenance.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-medium">Cost: ₹{summary.lastMaintenance.cost || 0}</span>
                  <span className="text-sm">Tech: {summary.lastMaintenance.technician || "N/A"}</span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground italic">No maintenance records found</p>
            )}
          </CardContent>
        </Card>

        {/* Next Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Next Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.nextMaintenance ? (
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{summary.nextMaintenance.title}</h3>
                    <p className="text-sm text-muted-foreground">{summary.nextMaintenance.type}</p>
                  </div>
                  {nextMaintenanceStatus && (
                    <Badge variant={nextMaintenanceStatus.variant}>
                      {nextMaintenanceStatus.label}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(summary.nextMaintenance.dueDate)}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Priority: <span className="font-medium capitalize">{summary.nextMaintenance.priority}</span></p>
                  <p>Est. Cost: ₹{summary.nextMaintenance.estimatedCost || 0}</p>
                  <p>Est. Hours: {summary.nextMaintenance.estimatedHours || 0}</p>
                </div>
                {summary.nextMaintenance.assignedTo && (
                  <p className="text-sm mt-2">Assigned to: {summary.nextMaintenance.assignedTo}</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground italic">No scheduled maintenance</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Alerts */}
      {summary.alerts && summary.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Upcoming Maintenance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.alerts.map((alert, index) => {
                const alertStatus = getNextMaintenanceStatus(alert.dueDate);
                return (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg bg-muted/30">
                    <div>
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground">{formatDate(alert.dueDate)}</p>
                    </div>
                    <Badge variant={alertStatus?.variant || "outline"}>
                      {alertStatus?.label || "Upcoming"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
