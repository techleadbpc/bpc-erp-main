"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Download,
  Search,
  X,
  Filter,
  CheckCircle,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api/api-service";
import PaymentSlipPDF from "./PaymentSlipPDF";
import { pdf } from "@react-pdf/renderer";

const mockPayments = [
  {
    id: 1,
    slipNo: "PAY-0001",
    invoice: { invoiceNo: "INV-1001" },
    vendor: { id: "v1", name: "ABC Traders" },
    paymentDate: "2025-05-10T00:00:00Z",
    amount: 15000,
    status: "Pending",
    paidAt: null,
  },
  {
    id: 2,
    slipNo: "PAY-0002",
    invoice: { invoiceNo: "INV-1002" },
    vendor: { id: "v2", name: "XYZ Supplies" },
    paymentDate: "2025-05-08T00:00:00Z",
    amount: 32000,
    status: "Paid",
    paidAt: "2025-05-09T12:00:00Z",
  },
  {
    id: 3,
    slipNo: "PAY-0003",
    invoice: { invoiceNo: "INV-1003" },
    vendor: { id: "v1", name: "ABC Traders" },
    paymentDate: "2025-05-05T00:00:00Z",
    amount: 8750,
    status: "Pending",
    paidAt: null,
  },
  {
    id: 4,
    slipNo: "PAY-0004",
    invoice: null,
    vendor: { id: "v3", name: "Global Enterprises" },
    paymentDate: "2025-05-01T00:00:00Z",
    amount: 12700,
    status: "Paid",
    paidAt: "2025-05-03T15:30:00Z",
  },
];

const mockVendors = [
  { id: "v1", name: "ABC Traders" },
  { id: "v2", name: "XYZ Supplies" },
  { id: "v3", name: "Global Enterprises" },
];

const PaymentList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showMarkPaidDialog, setShowMarkPaidDialog] = useState(false);

  // Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [dateSort, setDateSort] = useState("desc");
  const [vendors, setVendors] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPayments();
    fetchVendors();
  }, [currentPage, statusFilter, vendorFilter, dateSort]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // In a real app, you'd include filters in your API call
      //   const response = await api.get("/payments", {
      //     params: {
      //       page: currentPage,
      //       limit: itemsPerPage,
      //       status: statusFilter !== "all" ? statusFilter : undefined,
      //       vendorId: vendorFilter !== "all" ? vendorFilter : undefined,
      //       sort: dateSort,
      //       search: search || undefined,
      //     },
      //   });

      //   if (response.status && response.data) {
      //     setPayments(response.data.items || []);
      //     setTotalPages(Math.ceil((response.data.total || 0) / itemsPerPage));
      //   } else {
      //     toast({
      //       title: "Error",
      //       description: "Failed to fetch payment slips",
      //       variant: "destructive",
      //     });
      //   }

      setTimeout(() => {
        setPayments(mockPayments);
        setVendors(mockVendors);
        setTotalPages(1);
        setLoading(false);
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to fetch payment slips",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      //   const response = await api.get('/vendors');
      //   if (response.status && response.data) {
      //     setVendors(response.data || []);
      //   }
      setTimeout(() => {
        setVendors(mockVendors);
      }, 500);
    } catch (error) {
      console.error("Failed to fetch vendors", error);
    }
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setCurrentPage(1);
      fetchPayments();
    }
  };

  const clearSearch = () => {
    setSearch("");
    setCurrentPage(1);
    fetchPayments();
  };

  const handleMarkAsPaid = async () => {
    if (!selectedPayment) return;

    try {
      setUpdating(true);
      const response = await api.put(`/payments/${selectedPayment.id}/status`, {
        status: "Paid",
      });

      if (response.status) {
        toast({
          title: "Success",
          description: "Payment marked as paid successfully",
        });

        // Update the local state
        setPayments(
          payments.map((payment) =>
            payment.id === selectedPayment.id
              ? { ...payment, status: "Paid", paidAt: new Date().toISOString() }
              : payment
          )
        );

        setShowMarkPaidDialog(false);
      } else {
        toast({
          title: "Error",
          description:
            response.data?.message || "Failed to update payment status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update payment status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const openMarkAsPaidDialog = (payment) => {
    setSelectedPayment(payment);
    setShowMarkPaidDialog(true);
  };

  const handleDownloadPaymentSlip = async (paymentId) => {
    try {
      //   const response = await api.get(`/payments/${paymentId}/download`, {
      //     responseType: "blob",
      //   });

      //   // Create a download link
      //   const url = window.URL.createObjectURL(new Blob([response.data]));
      //   const link = document.createElement("a");
      //   link.href = url;
      //   link.setAttribute("download", `payment-slip-${paymentId}.pdf`);
      //   document.body.appendChild(link);
      //   link.click();
      //   document.body.removeChild(link);

      const mockPayment = {
        slipNo: "PS-2025-0012",
        paymentDate: "2025-05-15",
        status: "Paid",
        paidAt: "2025-05-16",
        amount: 45600,
        remarks: "Payment made via NEFT. Reference No: NEFT20250516XYZ",
      };

      const mockInvoice = {
        invoiceNo: "INV-2401",
        invoiceDate: "2025-04-28",
        amount: 45600,
      };

      const mockVendor = {
        name: "Ace Engineering Supplies",
        contactPerson: "Ravi Sharma",
        phoneNumber: "+91 98765 43210",
      };

      const blob = await pdf(
        <PaymentSlipPDF
          payment={mockPayment}
          invoice={mockInvoice}
          vendor={mockVendor}
        />
      ).toBlob();

      // Create a Blob URL and open it in a new tab
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      // Optional: Revoke the object URL after some time to release memory
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download payment slip",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <Badge variant="success">Paid</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleCreatePaymentSlip = () => {
    navigate("/payment/create");
  };

  // Filter the payments based on search term
  const filteredPayments = search
    ? payments.filter(
        (payment) =>
          payment.invoiceNo?.toLowerCase().includes(search.toLowerCase()) ||
          payment.vendor?.name.toLowerCase().includes(search.toLowerCase())
      )
    : payments;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Payment Slips</h1>
        {/* <Button onClick={handleCreatePaymentSlip}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Payment Slip
        </Button> */}
      </div>

      <Card>
        <div className="p-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by invoice or vendor..."
                  className="pl-8 w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearch}
                />
                {search && (
                  <button
                    className="absolute right-2.5 top-2.5"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
              {/* <Button variant="outline" onClick={() => fetchPayments()}>
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button> */}
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>

              {/* <Select
                value={vendorFilter}
                onValueChange={(value) => {
                  setVendorFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}

              <Select
                value={dateSort}
                onValueChange={(value) => {
                  setDateSort(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <p>Loading payment slips...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-32 border rounded-md">
              <p className="text-muted-foreground">No payment slips found</p>
              {(search || statusFilter !== "all" || vendorFilter !== "all") && (
                <Button
                  variant="link"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setVendorFilter("all");
                    setCurrentPage(1);
                    fetchPayments();
                  }}
                >
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Invoice No</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>
                      <div className="flex items-center">
                        Payment Date
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setDateSort(dateSort === "asc" ? "desc" : "asc")
                          }
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Paid Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.slipNo}
                      </TableCell>
                      <TableCell>{payment.invoice?.invoiceNo || "-"}</TableCell>
                      <TableCell>{payment.vendor?.name || "-"}</TableCell>
                      <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        {payment.paidAt ? formatDate(payment.paidAt) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDownloadPaymentSlip(payment.id)
                            }
                          >
                            <Download className="h-4 w-4" />
                          </Button>

                          {payment.status.toLowerCase() === "pending" && (
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => openMarkAsPaidDialog(payment)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-muted-foreground">
                Showing page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Mark as Paid Dialog */}
      <Dialog open={showMarkPaidDialog} onOpenChange={setShowMarkPaidDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Payment as Paid</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to mark this payment as paid? This action
              cannot be undone.
            </p>
            {selectedPayment && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Payment ID:
                  </span>
                  <span className="font-medium">{selectedPayment.slipNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Invoice:
                  </span>
                  <span className="font-medium">
                    {selectedPayment.invoice?.invoiceNo || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Vendor:</span>
                  <span className="font-medium">
                    {selectedPayment.vendor?.name || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="font-medium">
                    {formatCurrency(selectedPayment.amount)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMarkPaidDialog(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleMarkAsPaid}
              disabled={updating}
            >
              {updating ? "Updating..." : "Mark as Paid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentList;
