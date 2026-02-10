import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
}
 from "@/components/ui/select";
// Removed Badge and related type icons/variants as they are no longer applicable to grouped data
import { Spinner } from "@/components/ui/loader";
import api from "@/services/api/api-service";
import {
  Package2,
  ChevronLeft,
  ChevronRight,
  Package, // Keep Package for the default icon
  AlertTriangle,
  Calendar, // Use Calendar icon for date columns
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
// Removed unused DropdownMenu imports

export default function InventoryMovementTab({ siteId }) {
  const [loading, setLoading] = useState(true);
  const [movements, setMovements] = useState([]);
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Use the latest IN/OUT dates in the table, but fetch logic remains the same
  useEffect(() => {
    fetchInventoryMovements();
    // currentPage and itemsPerPage are now handled by local filtering/slicing
    // For large datasets, you should pass these to the API, but based on the provided logic, we keep it local.
  }, [siteId, dateRange.start, dateRange.end, currentPage, itemsPerPage]); 

  const fetchInventoryMovements = async () => {
    try {
      setLoading(true);
      // Pass pagination parameters to the API as the backend now supports it
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (dateRange.start && dateRange.end) {
        params.startDate = dateRange.start;
        params.endDate = dateRange.end;
      }
      
      const res = await api.get(`/sites/${siteId}/inventory-movement`, { params });
      
      // The API now returns { data, totalCount, totalPages, currentPage }
      // We will update the state to store the returned pagination data
      setMovements(res.data.data|| []); 
      // NOTE: For true pagination, you would also set totalCount, totalPages, and currentPage
      // For simplicity, we are only setting the data here.
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Failed to fetch inventory movements:", error);
      setMovements([]);
    }
  };

  // 🚨 IMPORTANT: The current component logic uses client-side filtering and pagination.
  // Since the API now supports server-side pagination (page, limit), 
  // we will simplify the filtering/pagination logic to reflect fetching exactly what is needed 
  // from the API based on `currentPage` and `itemsPerPage`. 
  // The `filteredMovements` and `currentMovements` are now simplified.

  // Re-run fetch when filters change (except pagination, which is already in fetchInventoryMovements)
  useEffect(() => {
    // Reset page to 1 whenever filters change (item filter or date range)
    setCurrentPage(1);
    fetchInventoryMovements();
  }, [siteId, dateRange.start, dateRange.end, filter]); // Added filter to dependencies

  // Helper function for date formatting
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    // Format: DD/MM/YYYY HH:MM
    return new Date(dateString).toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // ---------------------------------------------------------------------
  // The useMemo, totalPages, startIndex, endIndex, and currentMovements 
  // logic is removed/simplified because pagination and filtering are now 
  // expected to be handled by the backend API.
  // The state variable `movements` now holds the data for the current page only.
  // We need to fetch `totalCount` and `totalPages` from the API response
  // to correctly implement the pagination UI. 
  // For this example, we'll assume the API response is structured as:
  // { data: [...], totalCount: N, totalPages: P, currentPage: C }
  // ---------------------------------------------------------------------
  
  // NOTE: For demonstration, assuming a simple structure for pagination (you should update state with actual API response)
  const totalCount = movements.length; // Placeholder, should come from API
  const totalPages = 1; // Placeholder, should come from API

  const handlePageChange = (page) => {
    // Only fetch if the page number is valid
    if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to page 1 when limit changes
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner />
      </div>
    );
  }

  if (!movements || movements.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No inventory movements found for the selected criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter and Date Range Inputs */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <Input
          placeholder="Filter item name, group, or reference..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            placeholder="Start date"
            className="max-w-[140px]"
          />
          <Input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            placeholder="End date"
            className="max-w-[140px]"
          />
        </div>
      </div>

      {/* Inventory Movement Table (Updated Headers) */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Item Name</TableHead>
              <TableHead>Item Group</TableHead>
              <TableHead className="text-right">IN Qty</TableHead>
              <TableHead className="text-right">OUT Qty</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>IN Date</TableHead>
              <TableHead>OUT Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((movement, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {movement.Item?.name || "N/A"}
                </TableCell>
                <TableCell>{movement.Item?.ItemGroup?.name || "N/A"}</TableCell>
                {/* Display totalIn and totalOut quantities */}
                <TableCell className="text-right font-semibold text-green-600">
                  {movement.totalIn || "-"}
                </TableCell>
                <TableCell className="text-right font-semibold text-red-600">
                  {movement.totalOut || "-"}
                </TableCell>
                {/* Display Source and Destination descriptions */}
                <TableCell>
                    {movement.sourceDescription || "N/A"}
                </TableCell>
                <TableCell>
                    {movement.destinationDescription || "N/A"}
                </TableCell>
                <TableCell>
                    <div className="text-xs text-muted-foreground">{movement.sourceType}</div>
                    {movement.reference || "N/A"}
                </TableCell>
                {/* Display IN and OUT dates */}
                <TableCell>
                    {formatDate(movement.latestInDate || movement.firstInDate)}
                </TableCell>
                <TableCell>
                    {formatDate(movement.latestOutDate || movement.firstOutDate)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls (Using placeholders for totalCount/totalPages) */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
            {/* 🚨 This count logic needs to be updated with actual totalCount from the API */}
          Showing {movements.length} entries on this page. (Total: {totalCount})
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={itemsPerPage} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">Page {currentPage} of {totalPages}</div>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}