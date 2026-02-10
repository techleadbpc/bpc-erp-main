import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Spinner } from "@/components/ui/loader";
import api from "@/services/api/api-service";
import quotationComparisonService from "@/services/api/quotationComparisonService";
import { FileText, Eye, CheckCircle, Clock, XCircle, Download, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const QuotationsTab = ({ requisition }) => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        setLoading(true);
        // Get all quotation comparisons for this requisition
        const data = await quotationComparisonService.getComparisonsForRequisition(requisition.id);
        setQuotations(data);
      } catch (error) {
        console.error("Error fetching quotations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (requisition?.id) {
      fetchQuotations();
    }
  }, [requisition.id]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: Clock,
      },
      submitted: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
      },
      approved: {
        color: "bg-green-100 text-green-800 border-green-20",
        icon: CheckCircle,
      },
      rejected: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
      },
    };

    const config = statusConfig[status.toLowerCase()] || {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: Clock,
    };
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {quotations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-1">No Comparisons Found</h3>
            <p className="text-gray-500 mb-4">
              No quotation comparisons have been created for this requisition yet.
            </p>
            <Button
              onClick={() =>
                navigate(`/quotation-comparison/${requisition.id}`)
              }
            >
              <FileText className="h-4 w-4 mr-2" />
              Create Comparison
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Comparisons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Comparison No</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Vendor Count</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotations.map((quotation) => (
                      <TableRow key={quotation.id}>
                        <TableCell className="font-medium">
                          {quotation.comparisonNo}
                        </TableCell>
                        <TableCell>{formatDate(quotation.createdAt)}</TableCell>
                        <TableCell>{getStatusBadge(quotation.status)}</TableCell>
                        <TableCell>{formatCurrency(quotation.totalAmount || 0)}</TableCell>
                        <TableCell>{quotation.vendors?.length || 0}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate(`/quotation-comparison/${quotation.id}`)
                              }
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default QuotationsTab;
