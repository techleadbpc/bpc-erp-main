import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Receipt,
  CreditCard,
  Download,
  FileText,
  Paperclip,
  CheckCircle,
  Clock,
} from "lucide-react";
import { InvoicePaymentDialog } from "../InvoicePaymentDialog";
import { format } from "date-fns";

import { Package } from "lucide-react"; // Add Package icon
import api from "@/services/api/api-service"; // Import api
import { toast } from "@/hooks/use-toast";

const InvoiceCard = ({ invoice, handlePaymentCreated, onInvoiceUpdated }) => {
  const handleAcceptInvoice = async (id) => {
    try {
      await api.post(`/invoices/${id}/accept`);
      toast({
        title: "Success",
        description: "Invoice items accepted into virtual inventory",
        variant: "success",
      });
      if (onInvoiceUpdated) onInvoiceUpdated();
    } catch (error) {
      console.error("Failed to accept invoice:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to accept invoice",
        variant: "destructive",
      });
    }
  };
  const calculateTotalPayments = (invoice) => {
    return (
      invoice.payments?.reduce(
        (sum, payment) => sum + parseFloat(payment.amount),
        0
      ) || 0
    );
  };

  const getInvoiceStatus = (invoice) => {
    const totalPayments = calculateTotalPayments(invoice);
    const invoiceAmount = parseFloat(invoice.amount);

    if (totalPayments === 0)
      return { status: "Unpaid", color: "bg-red-100 text-red-800" };
    if (totalPayments >= invoiceAmount)
      return { status: "Paid", color: "bg-green-100 text-green-800" };
    return { status: "Partial", color: "bg-orange-100 text-orange-800" };
  };

  const invoiceStatus = getInvoiceStatus(invoice);
  const totalPayments = calculateTotalPayments(invoice);
  const remainingAmount = parseFloat(invoice.amount) - totalPayments;
  const paymentProgress = (totalPayments / parseFloat(invoice.amount)) * 100;

  return (
    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow mb-4">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Receipt className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              Invoice #{invoice.invoiceNumber}
            </h3>
            <Badge className={`${invoiceStatus.color} px-3 py-1`}>
              {invoiceStatus.status}
            </Badge>
          </div>

          {/* Invoice Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
            <div>
              <p className="text-gray-600 mb-1">Invoice Date</p>
              <p className="font-medium">
                {format(new Date(invoice.invoiceDate), "dd MMM yyyy")}
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Created</p>
              <p className="font-medium">
                {format(new Date(invoice.createdAt), "dd MMM yyyy")}
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Last Updated</p>
              <p className="font-medium">
                {format(new Date(invoice.updatedAt), "dd MMM yyyy")}
              </p>
            </div>
          </div>

          {/* Notes Section */}
          {invoice.notes && (
            <div className="mb-4">
              <p className="text-gray-600 text-sm mb-1">Notes</p>
              <p className="text-gray-800 bg-gray-50 p-2 rounded text-sm">
                {invoice.notes}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-4">
          {!invoice.isInventoryUpdated ? (
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
              onClick={() => handleAcceptInvoice(invoice.id)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Accept in Virtual
            </Button>
          ) : (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 px-3 py-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              Accepted in Virtual
            </Badge>
          )}
          <InvoicePaymentDialog
            invoice={invoice}
            onPaymentCreated={handlePaymentCreated}
          />
        </div>
      </div>

      {/* Invoice Items */}
      <InvoiceItemsTable items={invoice.items} />

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-600 text-sm font-medium mb-1">
            Invoice Amount
          </p>
          <p className="text-2xl font-bold text-blue-700">
            ₹{parseFloat(invoice.amount).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-green-600 text-sm font-medium mb-1">Paid Amount</p>
          <p className="text-2xl font-bold text-green-700">
            ₹{totalPayments.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600 text-sm font-medium mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-red-700">
            ₹{remainingAmount.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm font-medium mb-1">Progress</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(paymentProgress, 100)}%`,
                }}
              />
            </div>
            <span className="text-sm font-medium">
              {Math.round(paymentProgress)}%
            </span>
          </div>
        </div>
      </div>

      {/* File Attachments */}
      {invoice.files && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Paperclip className="h-4 w-4" />
            Attachments
          </h4>
          <div className="flex flex-wrap gap-2">
            {invoice?.files && (
              <Button
                key={invoice?.files}
                variant="outline"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
              >
                <a
                  href={invoice?.files?.files}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm gap-1"
                >
                  <FileText className="h-8 w-8" />
                  View Attachments
                </a>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Payment History Table */}
      {invoice.payments && invoice.payments.length > 0 && (
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-800 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-600" />
              Payment History
              <Badge variant="secondary" className="ml-2">
                {invoice.payments.length} payment
                {invoice.payments.length !== 1 ? "s" : ""}
              </Badge>
            </h4>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] text-center">SI No</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead className="text-center">Amount</TableHead>
                  <TableHead className="text-center">Method</TableHead>
                  <TableHead className="text-center">Reference</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.payments
                  .sort(
                    (a, b) =>
                      new Date(b.paymentDate) - new Date(a.paymentDate)
                  )
                  .map((payment, index) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium text-center">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${payment.status === "COMPLETED"
                              ? "bg-green-100"
                              : "bg-orange-100"
                              }`}
                          >
                            {payment.status === "COMPLETED" ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-orange-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {format(
                                new Date(payment.paymentDate),
                                "dd MMM yyyy"
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Created:{" "}
                              {format(
                                new Date(payment.createdAt),
                                "dd MMM yyyy"
                              )}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-green-600">
                          ₹
                          {parseFloat(payment.amount).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {payment.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {payment.referenceNumber}
                        </code>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            payment.status === "COMPLETED"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            payment.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payment.remarks ? (
                          <p className="text-sm text-gray-600 italic max-w-xs truncate">
                            "{payment.remarks}"
                          </p>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {payment.slipUrl ? (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={payment.slipUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Receipt
                            </a>
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            -
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}

                {/* Total Row */}
                <TableRow className="font-bold bg-muted">
                  <TableCell colSpan={2} className="text-right">
                    Total Payments
                  </TableCell>
                  <TableCell className="text-center bg-yellow-50">
                    ₹
                    {totalPayments.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell colSpan={5}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Empty Payment State */}
      {(!invoice.payments || invoice.payments.length === 0) && (
        <div className="border-t pt-6">
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No payments recorded</p>
            <p className="text-gray-400 text-sm">
              Add a payment to track progress on this invoice
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Add Items Table Component
const InvoiceItemsTable = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
        <Package className="h-4 w-4" />
        Invoice Items
      </h4>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">#</TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="text-center">{index + 1}</TableCell>
                <TableCell>
                  {item.ProcurementItem?.RequisitionItem?.Item?.name || "Item"}
                </TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">
                  ₹{parseFloat(item.rate).toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ₹{parseFloat(item.amount).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InvoiceCard;
