"use client";

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
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Truck,
  XCircle,
  Search,
  PlusCircle,
  Info,
  MoreHorizontal,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/services/api/api-service";
import { Spinner } from "@/components/ui/loader";
import quotationComparisonService from "@/services/api/quotationComparisonService";
import { useUserRoleLevel } from "@/utils/roles";

// API functions
const fetchRequisitions = async () => {
  const response = await api.get("/requisitions");
  return response.data;
};

// Query keys
const requisitionKeys = {
  all: ["requisitions"],
  lists: () => [...requisitionKeys.all, "list"],
  details: () => [...requisitionKeys.all, "detail"],
  detail: (id) => [...requisitionKeys.details(), id],
};

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    return format(parseISO(dateString), "dd/MM/yyyy");
  } catch (error) {
    return dateString;
  }
};

const getPriorityBadge = (priority) => {
  if (!priority) return <Badge variant="secondary">Not Set</Badge>;

  switch (priority.toLowerCase()) {
    case "urgent":
    case "high":
      return <Badge className={"bg-red-500"}>Urgent</Badge>;
    case "medium":
      return <Badge className={"bg-orange-400"}>Medium</Badge>;
    case "low":
      return <Badge className={"bg-yellow-400"}>Low</Badge>;
    default:
      return <Badge variant="secondary">{priority}</Badge>;
  }
};

const getStatusBadge = (status) => {
  if (!status) return <Badge variant="secondary">Unknown</Badge>;

  switch (status.toLowerCase()) {
    case "pending":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1"
        >
          <Clock className="h-3 w-3" /> Pending
        </Badge>
      );
    case "approvedbypm":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
        >
          <CheckCircle className="h-3 w-3" /> Approved - PM
        </Badge>
      );
    case "approvedbyho":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
        >
          <CheckCircle className="h-3 w-3" /> Approved - HO
        </Badge>
      );
    case "forwarded":
      return (
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1"
        >
          <Truck className="h-3 w-3" /> Forwarded
        </Badge>
      );
    case "partially_approved":
      return (
        <Badge
          variant="outline"
          className="bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-1"
        >
          <AlertTriangle className="h-3 w-3" /> Partially Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1"
        >
          <XCircle className="h-3 w-3" /> Rejected
        </Badge>
      );
    case "issued":
      return (
        <Badge
          variant="outline"
          className="bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1"
        >
          <Truck className="h-3 w-3" /> Issued
        </Badge>
      );
    case "received":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
        >
          <CheckCircle className="h-3 w-3" /> Received
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

// Create column helper
const columnHelper = createColumnHelper();

const MaterialRequisitionList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSite, setFilterSite] = useState("all");
  // In a real app, these would come from auth context
  const [userRole] = useState("admin");
  const [userSite] = useState(null);

  // TanStack Query for fetching requisitions
  const {
    data: serverData = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: requisitionKeys.lists(),
    queryFn: fetchRequisitions,
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    placeholderData: [], // Prevent undefined data issues
  });

  // Ensure data is always an array for TanStack Table
  const data = useMemo(() => serverData ?? [], [serverData]);

  // Get unique sites for filter dropdown
  const sites = useMemo(() => {
    return [
      ...new Set(data.map((req) => req.requestingSite?.name).filter(Boolean)),
    ];
  }, [data]);

  // Get unique statuses for filter dropdown
  const uniqueStatuses = useMemo(() => {
    return [...new Set(data.map((req) => req.status?.toLowerCase()).filter(Boolean))];
  }, [data]);

  // Filter data based on filters and user permissions (before passing to table)
  const filteredData = useMemo(() => {
    return data.filter((req) => {
      // Filter by status
      const matchesStatus =
        filterStatus === "all" || req.status?.toLowerCase() === filterStatus;

      // Filter by site
      const matchesSite =
        filterSite === "all" || req.requestingSite?.name === filterSite;

      // Filter by user role and site
      if (userRole === "admin") {
        // Admin can see all requisitions
        return matchesStatus && matchesSite;
      } else {
        // Regular users can only see their site's requisitions or requisitions forwarded to them
        return (
          matchesStatus &&
          matchesSite &&
          (req.requestingSite?.name === userSite ||
            req.forwardedToSite === userSite)
        );
      }
    });
  }, [data, filterStatus, filterSite, userRole, userSite]);

  // Define columns using TanStack Table
  const columns = useMemo(
    () => [
      columnHelper.accessor("requisitionNo", {
        header: "Req No",
        cell: ({ getValue, row }) => (
          <Link
            to={`/requisitions/${row.original.id}`}
            className="font-medium text-blue-500 underline cursor-pointer"
          >
            {getValue()}
          </Link>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor("requestedAt", {
        header: "Date",
        cell: ({ getValue }) => <div>{formatDate(getValue())}</div>,
        enableSorting: false,
        sortingFn: "datetime",
      }),
      columnHelper.accessor("requestingSite.name", {
        header: "Site",
        cell: ({ getValue }) => <div>{getValue() || "-"}</div>,
        enableSorting: false,
        meta: {
          className: "hidden sm:table-cell",
        },
      }),
      columnHelper.accessor("requestPriority", {
        header: "Priority",
        cell: ({ getValue }) => getPriorityBadge(getValue()),
        enableSorting: false,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => getStatusBadge(getValue()),
        enableSorting: false,
      }),
      columnHelper.accessor("preparedBy.name", {
        header: "Prepared By",
        cell: ({ getValue }) => <div>{getValue() || "-"}</div>,
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
      }),
      columnHelper.accessor("chargeType", {
        header: "Charge Type",
        cell: ({ getValue }) => <div>{getValue() || "-"}</div>,
        enableSorting: false,
        meta: {
          className: "hidden lg:table-cell",
        },
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
                onClick={() => navigate(`/requisitions/${row.original.id}`)}
              >
                <Info className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    const result = await quotationComparisonService.createComparison(row.original.id);
                    toast({
                      title: "Success",
                      description: "Quotation comparison created successfully.",
                    });
                    // Navigate to the newly created comparison
                    navigate(`/quotation-comparison/${result.data.id}`);
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: error.response?.data?.message || "Failed to create quotation comparison",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                Create Quotation Comparison
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
    globalFilterFn: "includesString",
  });

  // Prefetch individual requisition details on hover
  const handleRequisitionHover = (reqId) => {
    queryClient.prefetchQuery({
      queryKey: requisitionKeys.detail(reqId),
      queryFn: () => api.get(`/requisitions/${reqId}`).then((res) => res.data),
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
        Error loading requisitions: {error?.message}
        <Button onClick={handleRefresh} className="ml-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Material Requisitions
          </h1>
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
        {useUserRoleLevel().roleId == 5 && (
          <Button>
            <Link to="/requisitions/new" className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Requisition
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Material Requisitions</CardTitle>
          <CardDescription>
            View and manage material requisitions
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search across all columns..."
                value={table.getState().globalFilter ?? ""}
                onChange={(e) => table.setGlobalFilter(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Filter options in responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {uniqueStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filterSite} onValueChange={setFilterSite}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sites</SelectItem>
                    {sites?.map((site, index) => (
                      <SelectItem key={index} value={site}>
                        {site}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className={`px-4 py-3 text-left text-sm font-medium ${header.column.columnDef.meta?.className || ""
                            }`}
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
                        className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                        onDoubleClick={() =>
                          navigate(`/requisitions/${row.original.id}`)
                        }
                      // onMouseEnter={() =>
                      //   handleRequisitionHover(row.original.id)
                      // }
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={`px-4 py-3 text-sm ${cell.column.columnDef.meta?.className || ""
                              }`}
                          >
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
                        className="px-4 py-12 text-center text-muted-foreground"
                      >
                        {table.getState().globalFilter ||
                          filterStatus !== "all" ||
                          filterSite !== "all"
                          ? "No requisitions found matching your search criteria."
                          : "No requisitions created yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>

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
      </Card>
    </div>
  );
};

export default MaterialRequisitionList;
