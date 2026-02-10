import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip } from "@/components/ui/tooltip";

import {
  AlertTriangle,
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Hash,
  IndianRupee,
  Mail,
  MapPin,
  Package,
  Phone,
  Shield,
  User,
  Wrench,
  ChevronDown,
  Car
} from "lucide-react";

import { MAINTENANCE_SERVICE_TYPES } from "@/config/maintenance-service-types";
import api from "@/services/api/api-service";

export default function MaintenanceLogDetailsPage() {
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id: logId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogDetails = async () => {
      try {
        const response = await api.get(`/maintanance/logs/${logId}`);
        setLog(response.data);
      } catch (error) {
        console.error("Error fetching log details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogDetails();
  }, [logId]);

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading service record...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertTriangle className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-1">Service Record Not Found</h3>
            <p className="text-sm text-muted-foreground">
              The requested maintenance log could not be found.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mt-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (d) => format(new Date(d), "MMM d, yyyy 'at' h:mm a");

  const statusConfig = {
    completed: {
      icon: CheckCircle,
      label: "Completed",
      className: "bg-green-50 text-green-700 border-green-200",
      dotColor: "bg-green-500",
    },
    in_progress: {
      icon: Clock,
      label: "In Progress",
      className: "bg-blue-50 text-blue-700 border-blue-200",
      dotColor: "bg-blue-500",
    },
    scheduled: {
      icon: Calendar,
      label: "Scheduled",
      className: "bg-purple-50 text-purple-700 border-purple-200",
      dotColor: "bg-purple-500",
    },
    overdue: {
      icon: AlertTriangle,
      label: "Overdue",
      className: "bg-red-50 text-red-700 border-red-200",
      dotColor: "bg-red-500",
    },
    due_today: {
      icon: Clock,
      label: "Due Today",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
      dotColor: "bg-yellow-500",
    },
  }[log.status] || {
    icon: AlertTriangle,
    label: log.status,
    className: "bg-gray-50 text-gray-700 border-gray-200",
    dotColor: "bg-gray-500",
  };

  const StatusIcon = statusConfig.icon;

  const serviceType = MAINTENANCE_SERVICE_TYPES.find(
    (st) => st.value === log.type
  );
  const typeBadge = serviceType
    ? [getBadgeVariant(log.type), serviceType.label]
    : [
      "default",
      log.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    ];

  function getBadgeVariant(type) {
    switch (type) {
      case "repair":
        return "destructive";
      case "preventive":
        return "default";
      case "inspection":
        return "secondary";
      case "oil_change":
        return "outline";
      case "parts_replacement":
        return "default";
      default:
        return "default";
    }
  }

  const isScheduledMaintenance = ["scheduled", "overdue", "due_today"].includes(
    log.status
  );

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/machine/${log.machineId}/logs`)}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Service Record Details
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              View comprehensive maintenance information
            </p>
          </div>
        </div>
        {/* <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="default" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div> */}
      </div>

      {/* Hero Card - Status & Key Metrics */}
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Status & Type */}
            <div className="lg:col-span-4 flex flex-col justify-center space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Current Status
                </p>
                <Badge
                  variant="outline"
                  className={`${statusConfig.className} px-3 py-1.5 text-sm font-medium`}
                >
                  <span className={`h-2 w-2 rounded-full ${statusConfig.dotColor} mr-2`} />
                  <StatusIcon className="h-4 w-4 mr-1.5" />
                  {statusConfig.label}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Service Type
                </p>
                <Badge variant={typeBadge[0]} className="px-3 py-1.5 text-sm font-medium">
                  {typeBadge[1]}
                </Badge>
              </div>
            </div>

            {/* Center: Machine & Date */}
            <div className="lg:col-span-5 border-l border-r px-6 flex flex-col justify-center space-y-4">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Package className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    Machine ID
                  </span>
                </div>
                <p className="text-lg font-semibold">{log.machineId}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    Service Date
                  </span>
                </div>
                <p className="text-sm font-medium">{formatDate(log.date)}</p>
              </div>
            </div>

            {/* Right: Cost Highlight */}
            <div className="lg:col-span-3 bg-primary/5 rounded-lg p-6 flex flex-col items-center justify-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Total Cost
              </p>
              <div className="flex items-baseline gap-1">
                <IndianRupee className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold text-primary">
                  {log.cost.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Service Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <InfoItem
                  icon={FileText}
                  label="Title"
                  value={log.title}
                />
                <InfoItem
                  icon={User}
                  label="Technician"
                  value={log.technician}
                />
                <InfoItem
                  icon={Clock}
                  label="Hours at Service"
                  value={log.hoursAtService}
                />
                <InfoItem
                  icon={Car}
                  label="Kilometers at Service"
                  value={log.kilometersAtService}
                />
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {log.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Scheduled Maintenance Details */}
          {isScheduledMaintenance && (
            <Card className="border-orange-200 bg-orange-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="h-5 w-5" />
                  Scheduled Maintenance Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem
                    icon={Calendar}
                    label="Due Date"
                    value={log.dueDate ? formatDate(log.dueDate) : "N/A"}
                  />
                  <InfoItem
                    icon={AlertTriangle}
                    label="Priority"
                    value={
                      <Badge
                        variant={
                          log.priority === "high"
                            ? "destructive"
                            : log.priority === "medium"
                              ? "default"
                              : "secondary"
                        }
                        className="capitalize"
                      >
                        {log.priority || "N/A"}
                      </Badge>
                    }
                  />
                  <InfoItem
                    icon={Clock}
                    label="Estimated Hours"
                    value={log.estimatedHours || "N/A"}
                  />
                  <InfoItem
                    icon={IndianRupee}
                    label="Estimated Cost"
                    value={
                      log.estimatedCost
                        ? `₹${log.estimatedCost.toLocaleString("en-IN")}`
                        : "N/A"
                    }
                  />
                </div>
                <Separator />
                <InfoItem
                  icon={User}
                  label="Assigned To"
                  value={log.assignedTo || "N/A"}
                />
              </CardContent>
            </Card>
          )}

          {/* Vendors & Parts Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Vendors & Parts
                <Badge variant="secondary" className="ml-auto">
                  {log.vendorAndPartsDetails?.length || 0} Vendor(s)
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!log.vendorAndPartsDetails?.length ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No vendors or parts recorded for this service.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {log.vendorAndPartsDetails.map((vendor, i) => (
                    <VendorCard key={vendor.id} vendor={vendor} index={i} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Timeline & Metadata */}
        <div className="space-y-6">
          {/* Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TimelineItem
                  label="Created"
                  date={formatDate(log.createdAt)}
                  isFirst
                />
                <TimelineItem
                  label="Last Updated"
                  date={formatDate(log.updatedAt)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Hash className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <StatItem
                label="Total Vendors"
                value={log.vendorAndPartsDetails?.length || 0}
              />
              <StatItem
                label="Total Parts"
                value={
                  log.vendorAndPartsDetails?.reduce(
                    (acc, v) => acc + (v.parts?.length || 0),
                    0
                  ) || 0
                }
              />
              <Separator />
              <StatItem label="Service Hours" value={log.hoursAtService} />
              <StatItem
                label="Total Cost"
                value={`₹${log.cost.toLocaleString("en-IN")}`}
                highlight
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function InfoItem({ icon: Icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="text-sm font-medium">
        {typeof value === "string" ? <p>{value}</p> : value}
      </div>
    </div>
  );
}

function TimelineItem({ label, date, isFirst }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`h-2 w-2 rounded-full ${isFirst ? "bg-primary" : "bg-muted-foreground"
            }`}
        />
        {!isFirst && <div className="w-px h-full bg-border mt-1" />}
      </div>
      <div className="pb-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-medium mt-0.5">{date}</p>
      </div>
    </div>
  );
}

function StatItem({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`text-sm font-semibold ${highlight ? "text-primary" : ""
          }`}
      >
        {value}
      </span>
    </div>
  );
}

function VendorCard({ vendor, index }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
      <div
        className="p-4 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
            <Building className="h-5 w-5" />
          </div>
          <div className="grid gap-0.5">
            <h4 className="font-semibold text-sm leading-none">{vendor.name}</h4>
            <p className="text-sm text-muted-foreground">{vendor.contactPerson}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {vendor.parts?.length > 0 && (
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {vendor.parts.length} Part{vendor.parts.length !== 1 ? 's' : ''}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            <ContactItem
              icon={Mail}
              value={vendor.email}
              href={`mailto:${vendor.email}`}
            />
            <ContactItem
              icon={Phone}
              value={vendor.phone}
              href={`tel:${vendor.phone}`}
            />
            <ContactItem icon={MapPin} value={vendor.address} />
          </div>

          {vendor.parts?.length > 0 && (
            <div className="mt-2 text-sm">
              <h5 className="font-medium mb-3 flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                Supplied Parts
              </h5>
              <div className="rounded-md border bg-background overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead>Part Details</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead>Warranty</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendor.parts.map((part) => (
                      <TableRow key={part.id}>
                        <TableCell>
                          <div className="font-medium">{part.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Hash className="h-3 w-3" />
                            {part.partNumber}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-mono">
                            {part.quantity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Shield className="h-3.5 w-3.5" />
                            {part.warrantyPeriod}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {part.taxInvoiceFile && (
                              <Tooltip content="Tax Invoice">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(part.taxInvoiceFile, "_blank");
                                  }}
                                >
                                  <FileText className="h-4 w-4 text-primary" />
                                </Button>
                              </Tooltip>
                            )}
                            {part.warrantyCardFile && (
                              <Tooltip content="Warranty Card">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(part.warrantyCardFile, "_blank");
                                  }}
                                >
                                  <Shield className="h-4 w-4 text-green-600" />
                                </Button>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ContactItem({ icon: Icon, value, href }) {
  const content = (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span className="truncate">{value}</span>
    </div>
  );

  return href ? (
    <a href={href} className="text-primary hover:underline">
      {content}
    </a>
  ) : (
    content
  );
}
