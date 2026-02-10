"use client";

import { useState } from "react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Tooltip } from "@/components/ui/tooltip";

import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  IndianRupee,
  Wrench,
  Package,
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  Shield,
  Hash,
  Download,
  Printer,
  Edit,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MAINTENANCE_SERVICE_TYPES } from "@/config/maintenance-service-types";

export default function MaintenanceLogDetails({ log, onBack }) {
  const [tab, setTab] = useState("overview");

  const formatDate = (d) =>
    format(new Date(d), "MMM d, yyyy 'at' h:mm a");

  const statusBadge = {
    completed: {
      icon: <CheckCircle className="h-4 w-4" />,
      label: "Completed",
      className: "bg-green-50 text-green-70 border-green-200",
    },
    in_progress: {
      icon: <Clock className="h-4 w-4" />,
      label: "In Progress",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    scheduled: {
      icon: <AlertTriangle className="h-4 w-4" />,
      label: "Scheduled",
      className: "bg-orange-50 text-orange-700 border-orange-200",
    },
    overdue: {
      icon: <AlertTriangle className="h-4 w-4" />,
      label: "Overdue",
      className: "bg-red-50 text-red-70 border-red-200",
    },
    due_today: {
      icon: <AlertTriangle className="h-4 w-4" />,
      label: "Due Today",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
  }[log.status] || {
    icon: null,
    label: log.status,
    className: "bg-gray-100",
  };

  const serviceType = MAINTENANCE_SERVICE_TYPES.find(st => st.value === log.type);
  const typeBadge = serviceType ? [getBadgeVariant(log.type), serviceType.label] : ["default", log.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())];
  
  // Helper function to determine badge variant based on service type
  const getBadgeVariant = (type) => {
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
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <h2 className="text-2xl font-semibold">{log.title}</h2>
        {/* placeholder to balance flex */}
        <div style={{ width: 48 }} />
      </div>

      {/* Summary Card */}
      <Card className="mb-4 shadow-sm">
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Machine ID</p>
            <p className="font-medium">{log.machineId}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Type & Status</p>
            <div className="flex items-center gap-2">
              <Badge variant={typeBadge[0]}>{typeBadge[1]}</Badge>
              <Badge
                variant="outline"
                className={`${statusBadge.className} flex items-center gap-1`}
              >
                {statusBadge.icon}
                {statusBadge.label}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Cost</p>
            <p className="text-lg font-semibold">
              ₹{log.cost.toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="flex-1 overflow-auto">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vendors">Vendor & Parts</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center text-muted-foreground mb-1">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Date</span>
              </div>
              <p>{formatDate(log.date)}</p>
            </div>
            <div>
              <div className="flex items-center text-muted-foreground mb-1">
                <User className="h-4 w-4 mr-1" />
                <span>Technician</span>
              </div>
              <p>{log.technician}</p>
            </div>
            <div>
              <div className="flex items-center text-muted-foreground mb-1">
                <Wrench className="h-4 w-4 mr-1" />
                <span>Hours at Service</span>
              </div>
              <p>{log.hoursAtService}</p>
            </div>
          </div>

          {/* Additional Fields for Scheduled Maintenance */}
          {(log.status === 'scheduled' || log.status === 'overdue' || log.status === 'due_today') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 border p-4 rounded-md bg-muted/30">
              <div>
                <div className="flex items-center text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Due Date</span>
                </div>
                <p>{log.dueDate ? formatDate(log.dueDate) : 'N/A'}</p>
              </div>
              <div>
                <div className="flex items-center text-muted-foreground mb-1">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  <span>Priority</span>
                </div>
                <p className="capitalize">{log.priority || 'N/A'}</p>
              </div>
              <div>
                <div className="flex items-center text-muted-foreground mb-1">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Estimated Hours</span>
                </div>
                <p>{log.estimatedHours || 'N/A'}</p>
              </div>
              <div>
                <div className="flex items-center text-muted-foreground mb-1">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  <span>Estimated Cost</span>
                </div>
                <p>₹{log.estimatedCost || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center text-muted-foreground mb-1">
                  <User className="h-4 w-4 mr-1" />
                  <span>Assigned To</span>
                </div>
                <p>{log.assignedTo || 'N/A'}</p>
              </div>
            </div>
          )}

          <Separator />

          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-muted-foreground">{log.description}</p>
          </div>
        </TabsContent>

        {/* Vendor & Parts */}
        <TabsContent value="vendors" className="p-4 space-y-4">
          {!log.vendorAndPartsDetails?.length && (
            <p className="text-center text-muted-foreground">
              No vendors or parts recorded.
            </p>
          )}

          <Accordion type="single" collapsible>
            {log.vendorAndPartsDetails?.map((vendor, i) => (
              <AccordionItem key={vendor.id} value={`vendor-${vendor.id}`}>
                <AccordionTrigger>
                  <Building className="h-5 w-5 mr-2" />
                  {vendor.name} (Vendor #{i + 1})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Contact Person
                      </p>
                      <p>{vendor.contactPerson}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Email
                      </p>
                      <p>
                        <a
                          href={`mailto:${vendor.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {vendor.email}
                        </a>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Phone
                      </p>
                      <p>
                        <a
                          href={`tel:${vendor.phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {vendor.phone}
                        </a>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Address
                      </p>
                      <p>{vendor.address}</p>
                    </div>
                  </div>

                  {vendor.parts?.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <h4 className="font-medium mb-3">
                        <Package className="h-5 w-5 mr-2 inline-block" />
                        Parts Supplied ({vendor.parts.length})
                      </h4>
                      <div className="space-y-3">
                        {vendor.parts.map((part) => (
                          <Card key={part.id} className="bg-muted/50">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center mb-3">
                                <h5 className="font-medium">{part.name}</h5>
                                <Badge variant="secondary">
                                  Qty: {part.quantity}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground mb-1">
                                    <Hash className="h-4 w-4 inline-block mr-1" />
                                    Part Number
                                  </p>
                                  <p>{part.partNumber}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground mb-1">
                                    <Shield className="h-4 w-4 inline-block mr-1" />
                                    Warranty Period
                                  </p>
                                  <p>{part.warrantyPeriod}</p>
                                </div>
                              </div>

                              <div className="mt-3 space-y-2">
                                {(part.taxInvoiceFile || part.warrantyCardFile) ? (
                                  <>
                                    {part.taxInvoiceFile && (
                                      <Tooltip content="Download Tax Invoice">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            window.open(part.taxInvoiceFile, "_blank")
                                          }
                                        >
                                          <FileText className="h-4 w-4" />
                                        </Button>
                                      </Tooltip>
                                    )}
                                    {part.warrantyCardFile && (
                                      <Tooltip content="Download Warranty Card">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            window.open(part.warrantyCardFile, "_blank")
                                          }
                                        >
                                          <FileText className="h-4 w-4" />
                                        </Button>
                                      </Tooltip>
                                    )}
                                  </>
                                ) : (
                                  <p className="italic text-sm text-muted-foreground">
                                    No files attached
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>

        {/* Timeline */}
        <TabsContent value="timeline" className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Created At
              </p>
              <p>{formatDate(log.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Last Updated
              </p>
              <p>{formatDate(log.updatedAt)}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Sticky Actions Bar */}
      {/* <div className="flex justify-end gap-2 p-3 border-t bg-white sticky bottom-0">
        <Button variant="outline" size="sm">
          <Download className="mr-1 h-4 w-4" /> Download
        </Button>
        <Button variant="outline" size="sm">
          <Printer className="mr-1 h-4 w-4" /> Print
        </Button>
        <Button size="sm">
          <Edit className="mr-1 h-4 w-4" /> Edit
        </Button>
      </div> */}
    </div>
  );
}
