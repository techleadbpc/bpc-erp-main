import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import InvoiceForm from "../InvoiceForm";
import InvoiceCard from "./InvoiceCard";

const InvoicesTab = ({
  invoices,
  procurement,
  isInvoiceDialogOpen,
  setIsInvoiceDialogOpen,
  handleInvoiceSubmit,
  handlePaymentCreated,
  onInvoiceUpdated
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Invoices ({invoices.length})
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              No invoices yet
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Add your first invoice to start tracking payments
            </p>
            <Dialog
              open={isInvoiceDialogOpen}
              onOpenChange={setIsInvoiceDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <InvoiceForm
                  procurement={procurement}
                  onSave={handleInvoiceSubmit}
                />
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-6">
            {invoices.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                handlePaymentCreated={handlePaymentCreated}
                onInvoiceUpdated={onInvoiceUpdated}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoicesTab;
