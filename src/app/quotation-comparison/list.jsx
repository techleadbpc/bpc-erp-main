import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Eye, FileText, RefreshCw } from "lucide-react";
import quotationComparisonService from "@/services/api/quotationComparisonService";
import { useUserRoleLevel } from "@/utils/roles";

const QuotationComparisonList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { roleId } = useUserRoleLevel();

  // Fetch all quotation comparisons
  const {
    data: comparisons = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["quotationComparisons"],
    queryFn: async () => {
      const response = await quotationComparisonService.getAllComparisons();
      return response || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter comparisons based on search term
  const filteredComparisons = comparisons.filter(
    (comparison) =>
      comparison.comparisonNo
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      comparison.requisition?.requisitionNo
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      comparison.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200";
      case "submitted":
        return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading quotation comparisons</p>
        <Button onClick={() => refetch()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6 flex-col sm:flex-row ">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-3xl font-bold">Quotation Comparisons</h1>
            <p className="text-muted-foreground">
              Manage and review quotation comparisons for procurement
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refetch}
            disabled={isLoading}
            className="h-8 w-8 p-0"
            title="Refresh data"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
        {[2, 3].includes(roleId) && (
          <Button
            onClick={() => navigate("/requisitions")} // Navigate to requisitions to create new comparison
            className="bg-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Comparison
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by comparison #, requisition #, or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparisons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comparison List</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredComparisons.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-1">
                No quotation comparisons found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? "No matches for your search"
                  : "Get started by creating a new quotation comparison"}
              </p>
              <Button
                onClick={() => navigate("/requisitions")}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Comparison
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Comparison #</TableHead>
                    <TableHead>Requisition #</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComparisons.map((comparison) => (
                    <TableRow key={comparison.id}>
                      <TableCell className="font-medium">
                        {comparison.comparisonNo}
                      </TableCell>
                      <TableCell>
                        {comparison.requisition?.requisitionNo || "N/A"}
                      </TableCell>
                      <TableCell>
                        {new Date(comparison.createdAt).toLocaleDateString(
                          "en-GB"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getStatusColor(
                            comparison.status
                          )} text-xs px-2 py-1 rounded-full border`}
                        >
                          {comparison.status.charAt(0).toUpperCase() +
                            comparison.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        ₹{comparison.totalAmount?.toLocaleString() || "0.00"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/quotation-comparison/${comparison.id}`)
                          }
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationComparisonList;
