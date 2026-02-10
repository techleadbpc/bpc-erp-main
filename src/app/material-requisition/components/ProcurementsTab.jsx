import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, Eye, Phone, Mail, MapPin, Info, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

const ProcurementsTab = ({ requisition, navigate, getProcurementStatusBadge, formatCurrency }) => {
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedNotes, setSelectedNotes] = useState(null);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Procurement Orders ({requisition.procurements?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requisition.procurements && requisition.procurements.length > 0 ? (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">Order No</TableHead>
                  <TableHead className="font-semibold">Vendor</TableHead>
                  <TableHead className="font-semibold">Total Amount</TableHead>
                  <TableHead className="font-semibold">Expected Delivery</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requisition.procurements.map((procurement) => (
                  <TableRow key={procurement.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium">
                      {procurement.procurementNo}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{procurement.Vendor?.name || "N/A"}</span>
                        {procurement.Vendor && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => setSelectedVendor(procurement.Vendor)}
                            title="Vendor Info"
                          >
                            <Info className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(procurement.totalAmount)}
                    </TableCell>
                    <TableCell>
                      {procurement.expectedDelivery
                        ? new Date(procurement.expectedDelivery).toLocaleDateString()
                        : "Not specified"}
                    </TableCell>
                    <TableCell>
                      {getProcurementStatusBadge(procurement?.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {procurement.notes && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setSelectedNotes({
                              no: procurement.procurementNo,
                              notes: procurement.notes
                            })}
                            title="View Notes"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          title="View Details"
                          className="h-8 w-8 p-0"
                          onClick={() => navigate(`/procurements/${procurement.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No procurement orders found</p>
            <p className="text-sm text-gray-400">
              Procurement orders will appear here once created
            </p>
          </div>
        )}

        {/* Vendor Info Dialog */}
        <Dialog open={!!selectedVendor} onOpenChange={(open) => !open && setSelectedVendor(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Vendor Details
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="pb-2 border-b">
                <h3 className="text-lg font-semibold">{selectedVendor?.name}</h3>
                <p className="text-sm text-gray-500">{selectedVendor?.contactPerson}</p>
              </div>
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Phone className="h-4 w-4 text-gray-600" />
                  </div>
                  <span>{selectedVendor?.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Mail className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="break-all">{selectedVendor?.email || "N/A"}</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-full mt-0.5">
                    <MapPin className="h-4 w-4 text-gray-600" />
                  </div>
                  <span>{selectedVendor?.address || "N/A"}</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Notes Dialog */}
        <Dialog open={!!selectedNotes} onOpenChange={(open) => !open && setSelectedNotes(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Notes for {selectedNotes?.no}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border italic text-gray-700 whitespace-pre-wrap">
              {selectedNotes?.notes}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ProcurementsTab;
