import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import {
  CalendarIcon,
  FileText,
  PlusCircle,
  Trash2,
  Upload,
  Building,
  Package,
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
  Hash,
  X,
  Info,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";

export function VendorManager({
  vendors = [],
  onVendorsChange,
  className = "",
}) {
  const [expandedVendors, setExpandedVendors] = useState([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addVendor = () => {
    const newVendor = {
      id: generateId(),
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      parts: [],
    };
    const updatedVendors = [...vendors, newVendor];
    onVendorsChange(updatedVendors);
    // Auto-expand the newly added vendor
    setExpandedVendors([...expandedVendors, newVendor.id]);
  };

  const removeVendor = (vendorId) => {
    onVendorsChange(vendors.filter((v) => v.id !== vendorId));
    setExpandedVendors(expandedVendors.filter((id) => id !== vendorId));
  };

  const updateVendor = (vendorId, field, value) => {
    const updatedVendors = vendors.map((vendor) =>
      vendor.id === vendorId ? { ...vendor, [field]: value } : vendor
    );
    onVendorsChange(updatedVendors);
  };

  const addPart = (vendorId) => {
    const newPart = {
      id: generateId(),
      name: "",
      partNumber: "",
      quantity: 1,
      warrantyPeriod: "",
      warrantyStartDate: undefined,
      taxInvoiceFile: null,
      warrantyCardFile: null,
    };

    const updatedVendors = vendors.map((vendor) =>
      vendor.id === vendorId
        ? { ...vendor, parts: [...vendor.parts, newPart] }
        : vendor
    );
    onVendorsChange(updatedVendors);
  };

  const removePart = (vendorId, partId) => {
    const updatedVendors = vendors.map((vendor) =>
      vendor.id === vendorId
        ? { ...vendor, parts: vendor.parts.filter((p) => p.id !== partId) }
        : vendor
    );
    onVendorsChange(updatedVendors);
  };

  const updatePart = (vendorId, partId, field, value) => {
    const updatedVendors = vendors.map((vendor) =>
      vendor.id === vendorId
        ? {
            ...vendor,
            parts: vendor.parts.map((part) =>
              part.id === partId ? { ...part, [field]: value } : part
            ),
          }
        : vendor
    );
    onVendorsChange(updatedVendors);
  };

  const getTotalParts = () => {
    return vendors.reduce((total, vendor) => total + vendor.parts.length, 0);
  };

  return (
    <div className={className}>
      {/* Empty State */}
      {vendors.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Vendors Added</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
            Start by adding vendors who supplied parts for this maintenance
            service
          </p>
          <Button onClick={addVendor} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Your First Vendor
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Total Vendors
                    </p>
                    <p className="text-2xl font-bold mt-1">{vendors.length}</p>
                  </div>
                  <Building className="h-8 w-8 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Total Parts
                    </p>
                    <p className="text-2xl font-bold mt-1">{getTotalParts()}</p>
                  </div>
                  <Package className="h-8 w-8 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center justify-center">
                <Button onClick={addVendor} className="w-full gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Vendor
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Vendors Accordion */}
          <Accordion
            type="multiple"
            value={expandedVendors}
            onValueChange={setExpandedVendors}
            className="space-y-4"
          >
            {vendors.map((vendor, vendorIndex) => {
              const isComplete =
                vendor.name &&
                vendor.contactPerson &&
                vendor.phone &&
                vendor.email;

              return (
                <AccordionItem
                  key={vendor.id}
                  value={vendor.id}
                  className="border-2 rounded-lg overflow-hidden"
                >
                  <Card className="border-0">
                    <AccordionTrigger className="hover:no-underline p-0">
                      <CardHeader className="w-full">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Building className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-base">
                                  {vendor.name || `Vendor ${vendorIndex + 1}`}
                                </CardTitle>
                                {isComplete && (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                              <CardDescription className="mt-1">
                                {vendor.contactPerson || "No contact person"} •{" "}
                                {vendor.parts.length} part(s)
                              </CardDescription>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeVendor(vendor.id);
                            }}
                            className="mr-4"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardHeader>
                    </AccordionTrigger>

                    <AccordionContent className="pb-0">
                      <CardContent className="space-y-6 pt-0">
                        <Separator />

                        {/* Vendor Information */}
                        <div>
                          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Vendor Information
                          </h4>
                          <div className="rounded-md border overflow-hidden">
                            <Table>
                              <TableBody>
                                <TableRow>
                                  <TableCell className="font-medium w-[120px]">Vendor Name</TableCell>
                                  <TableCell className="w-[200px]">
                                    <Input
                                      value={vendor.name}
                                      onChange={(e) =>
                                        updateVendor(vendor.id, "name", e.target.value)
                                      }
                                      placeholder="e.g., ABC Parts Co."
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium w-[120px]">Contact Person</TableCell>
                                  <TableCell className="w-[200px]">
                                    <Input
                                      value={vendor.contactPerson}
                                      onChange={(e) =>
                                        updateVendor(
                                          vendor.id,
                                          "contactPerson",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Contact person name"
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium w-[120px]">Phone Number</TableCell>
                                  <TableCell>
                                    <Input
                                      value={vendor.phone}
                                      onChange={(e) =>
                                        updateVendor(vendor.id, "phone", e.target.value)
                                      }
                                      placeholder="+91 XXXXX XXXXX"
                                      type="tel"
                                    />
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium w-[120px]">Email Address</TableCell>
                                  <TableCell className="w-[200px]">
                                    <Input
                                      type="email"
                                      value={vendor.email}
                                      onChange={(e) =>
                                        updateVendor(vendor.id, "email", e.target.value)
                                      }
                                      placeholder="vendor@example.com"
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium w-[120px]">Address</TableCell>
                                  <TableCell colSpan="3">
                                    <Textarea
                                      value={vendor.address}
                                      onChange={(e) =>
                                        updateVendor(
                                          vendor.id,
                                          "address",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Complete vendor address"
                                      rows={2}
                                      className="resize-none w-full"
                                    />
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        <Separator />

                        {/* Parts Section */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Parts Supplied
                              {vendor.parts.length > 0 && (
                                <Badge variant="secondary">
                                  {vendor.parts.length}
                                </Badge>
                              )}
                            </h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addPart(vendor.id)}
                              className="gap-2"
                            >
                              <PlusCircle className="h-4 w-4" />
                              Add Part
                            </Button>
                          </div>

                          {vendor.parts.length === 0 ? (
                            <Alert>
                              <Info className="h-4 w-4" />
                              <AlertDescription>
                                No parts added yet. Click "Add Part" to record
                                parts supplied by this vendor.
                              </AlertDescription>
                            </Alert>
                          ) : (
                            <div className="rounded-md border">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[200px]">
                                      Part Name
                                    </TableHead>
                                    <TableHead>Part Number</TableHead>
                                    <TableHead className="w-[100px] text-center">
                                      Qty
                                    </TableHead>
                                    <TableHead>Warranty</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead>Documents</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {vendor.parts.map((part) => (
                                    <TableRow key={part.id}>
                                      <TableCell>
                                        <Input
                                          value={part.name}
                                          onChange={(e) =>
                                            updatePart(
                                              vendor.id,
                                              part.id,
                                              "name",
                                              e.target.value
                                            )
                                          }
                                          placeholder="Part name"
                                          className="h-9"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-1">
                                          <Hash className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                          <Input
                                            value={part.partNumber}
                                            onChange={(e) =>
                                              updatePart(
                                                vendor.id,
                                                part.id,
                                                "partNumber",
                                                e.target.value
                                              )
                                            }
                                            placeholder="Part no."
                                            className="h-9"
                                          />
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Input
                                          type="number"
                                          min="1"
                                          value={part.quantity}
                                          onChange={(e) =>
                                            updatePart(
                                              vendor.id,
                                              part.id,
                                              "quantity",
                                              Number.parseInt(e.target.value) || 1
                                            )
                                          }
                                          className="h-9 text-center"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-1">
                                          <Shield className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                          <Input
                                            value={part.warrantyPeriod}
                                            onChange={(e) =>
                                              updatePart(
                                                vendor.id,
                                                part.id,
                                                "warrantyPeriod",
                                                e.target.value
                                              )
                                            }
                                            placeholder="e.g., 12 months"
                                            className="h-9"
                                          />
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="h-9 w-full justify-start text-left font-normal"
                                            >
                                              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                              {part.warrantyStartDate
                                                ? format(
                                                    part.warrantyStartDate,
                                                    "PP"
                                                  )
                                                : "Pick date"}
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                          >
                                            <Calendar
                                              mode="single"
                                              selected={part.warrantyStartDate}
                                              onSelect={(date) =>
                                                updatePart(
                                                  vendor.id,
                                                  part.id,
                                                  "warrantyStartDate",
                                                  date
                                                )
                                              }
                                              initialFocus
                                            />
                                          </PopoverContent>
                                        </Popover>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex gap-1">
                                          <FileUploadButton
                                            vendorId={vendor.id}
                                            partId={part.id}
                                            fileType="taxInvoiceFile"
                                            file={part.taxInvoiceFile}
                                            updatePart={updatePart}
                                            icon={<FileText className="h-3.5 w-3.5" />}
                                            tooltip="Tax Invoice"
                                          />
                                          <FileUploadButton
                                            vendorId={vendor.id}
                                            partId={part.id}
                                            fileType="warrantyCardFile"
                                            file={part.warrantyCardFile}
                                            updatePart={updatePart}
                                            icon={<Shield className="h-3.5 w-3.5" />}
                                            tooltip="Warranty Card"
                                          />
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            removePart(vendor.id, part.id)
                                          }
                                          className="h-8 w-8 p-0"
                                        >
                                          <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      )}
    </div>
  );
}

// Helper Components
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

function FileUploadButton({
  vendorId,
  partId,
  fileType,
  file,
  updatePart,
  icon,
  tooltip,
}) {
  const inputId = `${fileType}-${vendorId}-${partId}`;

  return (
    <>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) =>
          updatePart(vendorId, partId, fileType, e.target.files?.[0] || null)
        }
        className="hidden"
        id={inputId}
      />
      <Button
        type="button"
        variant={file ? "default" : "outline"}
        size="sm"
        onClick={() => document.getElementById(inputId)?.click()}
        className="h-8 w-8 p-0"
        title={tooltip}
      >
        {icon}
      </Button>
    </>
  );
}
