import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Plus,
  Search,
  FileText,
  CheckCircle,
  AlertCircle,
  Truck,
  Package,
  Clock,
  PlusCircle,
  MoreHorizontal,
  Info,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";
import api from "@/services/api/api-service";
import { Spinner } from "@/components/ui/loader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserRoleLevel } from "@/utils/roles";

// API functions
const fetchProcurements = async () => {
  const response = await api.get("/procurements");
  return response.data;
};

// Query keys
const procurementKeys = {
  all: ["procurements"],
  lists: () => [...procurementKeys.all, "list"],
  details: () => [...procurementKeys.all, "detail"],
  detail: (id) => [...procurementKeys.details(), id],
};

// Utility functions
const getStatusColor = (status) => {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200";
    case "ordered":
      return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200";
    case "Delivered":
      return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
    case "Partial":
      return "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200";
    case "Cancelled":
      return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "Pending":
      return <Clock className="h-3 w-3" />;
    case "ordered":
      return <CheckCircle className="h-3 w-3" />;
    case "Delivered":
      return <Truck className="h-3 w-3" />;
    case "Partial":
      return <Package className="h-3 w-3" />;
    case "Cancelled":
      return <AlertCircle className="h-3 w-3" />;
    default:
      return <FileText className="h-3 w-3" />;
  }
};

// Create column helper
const columnHelper = createColumnHelper();

const ProcurementList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");

  // TanStack Query for fetching procurements
  const {
    data: serverData = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: procurementKeys.lists(),
    queryFn: fetchProcurements,
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    placeholderData: [], // Prevent undefined data issues
  });

  // Ensure data is always an array for TanStack Table[12][13]
  const data = useMemo(() => serverData ?? [], [serverData]);

  // Filter data based on status (before passing to table)
  const filteredData = useMemo(() => {
    if (statusFilter === "all") return data;
    return data.filter((item) => item.status === statusFilter);
  }, [data, statusFilter]);

  // Define columns using TanStack Table
  const columns = useMemo(
    () => [
      columnHelper.accessor("procurementNo", {
        header: "Procurement #",
        cell: ({ getValue, row }) => (
          <div
            className="font-medium text-blue-500 underline cursor-pointer"
            onClick={() => navigate("/procurements/" + row.original.id)}
          >
            {getValue()}
          </div>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor("Requisition.requisitionNo", {
        header: "Requisition #",
        cell: ({ getValue }) => <div>{getValue()}</div>,
        enableSorting: false,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor("Vendor.name", {
        header: "Vendor",
        cell: ({ getValue }) => <div>{getValue()}</div>,
        enableSorting: false,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor("createdAt", {
        header: "Created Date",
        cell: ({ getValue }) => (
          <div>{new Date(getValue()).toLocaleDateString("en-GB")}</div>
        ),
        enableSorting: false,
        sortingFn: "datetime",
      }),
      columnHelper.accessor("expectedDelivery", {
        header: "Expected Delivery",
        cell: ({ getValue }) => (
          <div>{new Date(getValue()).toLocaleDateString("en-GB")}</div>
        ),
        enableSorting: false,
        sortingFn: "datetime",
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => (
          <Badge
            className={`${getStatusColor(
              getValue()
            )} text-xs px-2 py-1 rounded-full border`}
          >
            {getStatusIcon(getValue())}
            <span className="ml-1">{getValue()}</span>
          </Badge>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor("totalAmount", {
        header: "Total Amount",
        cell: ({ getValue }) => (
          <div className="font-semibold">
            ₹{parseFloat(getValue()).toLocaleString()}
          </div>
        ),
        enableSorting: false,
        sortingFn: "alphanumeric",
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate("/procurements/" + row.original.id)}
              >
                <Info className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      }),
    ],
    [navigate]
  );

  // Initialize TanStack Table
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Prefetch individual procurement details on hover
  const handleProcurementHover = (procurementId) => {
    queryClient.prefetchQuery({
      queryKey: procurementKeys.detail(procurementId),
      queryFn: () =>
        api.get(`/procurements/${procurementId}`).then((res) => res.data),
      staleTime: 5 * 60 * 1000,
    });
  };

  // Manual refresh function
  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return (
      <div className="text-red-500">
        Error loading procurements: {error?.message}
        <Button onClick={handleRefresh} className="ml-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-col sm:flex-row">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Procurement Orders</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
            className="h-8 w-8 p-0"
            title="Refresh data"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
        {[2, 3].includes(useUserRoleLevel().roleId) && (
          <Button
            className="bg-primary"
            onClick={() => navigate("/requisitions")}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Procurement
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search across all columns..."
                  value={table.getState().globalFilter ?? ""}
                  onChange={(e) => table.setGlobalFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="bg-mutedd border-b">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-4 text-left text-sm font-medium"
                      >
                        <div
                          className={`flex items-center gap-2 ${header.column.getCanSort()
                            ? "cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 -my-1"
                            : ""
                            }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          {header.column.getCanSort() && (
                            <div className="flex flex-col">
                              {header.column.getIsSorted() === "asc" ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <div className="flex flex-col">
                                  <ChevronUp className="h-3 w-3 text-gray-300" />
                                  <ChevronDown className="h-3 w-3 text-gray-300 -mt-1" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      onDoubleClick={() =>
                        navigate("/procurements/" + row.original.id)
                      }
                    // onMouseEnter={() =>
                    //   handleProcurementHover(row.original.id)
                    // }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4 text-sm">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-12 text-center text-gray-600"
                    >
                      <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      No procurement orders found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {table.getPageCount() > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}{" "}
                to{" "}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}{" "}
                of {table.getFilteredRowModel().rows.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <Select
                  value={table.getState().pagination.pageSize.toString()}
                  onValueChange={(value) => table.setPageSize(Number(value))}
                >
                  <SelectTrigger className="h-8 w-24">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from(
                    { length: Math.min(5, table.getPageCount()) },
                    (_, i) => {
                      const currentPage =
                        table.getState().pagination.pageIndex + 1;
                      const totalPages = table.getPageCount();
                      let pageNum;

                      // Logic to show pages around current page
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="icon"
                          onClick={() => table.setPageIndex(pageNum - 1)}
                          className="h-8 w-8"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProcurementList;
