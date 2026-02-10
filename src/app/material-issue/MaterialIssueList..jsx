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
import {
  Plus,
  Eye,
  FileText,
  Search,
  PlusCircle,
  Info,
  MoreHorizontal,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import api from "@/services/api/api-service";
import { Spinner } from "@/components/ui/loader";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useUserRoleLevel } from "@/utils/roles";

// API functions
const fetchMaterialIssues = async () => {
  const response = await api.get("/material-issues");
  return response.data;
};

// Query keys
const materialIssueKeys = {
  all: ["material-issues"],
  lists: () => [...materialIssueKeys.all, "list"],
  details: () => [...materialIssueKeys.all, "detail"],
  detail: (id) => [...materialIssueKeys.details(), id],
};

// Utility functions
const formatDate = (dateString) => {
  try {
    return format(parseISO(dateString), "dd/MM/yyyy");
  } catch (error) {
    return dateString;
  }
};

const getStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return <Badge variant="success">Completed</Badge>;
    case "pending":
      return <Badge variant="warning">Pending</Badge>;
    case "returned":
      return <Badge variant="secondary">Returned</Badge>;
    default:
      return <Badge variant="secondary">{status || "Unknown"}</Badge>;
  }
};

// Create column helper
const columnHelper = createColumnHelper();

const MaterialIssueList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSite, setFilterSite] = useState("all");
  const { data: sites } = useSelector((s) => s.sites);

  // TanStack Query for fetching material issues
  const {
    data: serverData = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: materialIssueKeys.lists(),
    queryFn: fetchMaterialIssues,
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    placeholderData: [], // Prevent undefined data issues
  });

  // Ensure data is always an array for TanStack Table
  const data = useMemo(() => serverData ?? [], [serverData]);

  // Get unique values for filters
  const { uniqueSites, uniqueTypes, uniqueStatuses } = useMemo(() => {
    return {
      uniqueSites: [
        ...new Set(
          data
            .flatMap((issue) => [
              issue.fromSiteName?.split(",")[0],
              issue.toSiteNname?.split(","),
            ])
            .flat()
            .filter(Boolean)
        ),
      ],
      uniqueTypes: [
        ...new Set(data.map((issue) => issue.issueType.toUpperCase()).filter(Boolean)),
      ],
      uniqueStatuses: [
        ...new Set(data.map((issue) => issue.status.toUpperCase()).filter(Boolean)),
      ],
    };
  }, [data]);

  // Filter data based on filters (before passing to table)
  const filteredData = useMemo(() => {
    return data.filter((issue) => {
      // Get from and to site names (if they exist)
      const fromSiteName = issue.fromSiteName || "";
      const toSiteName = issue.toSiteName || "";

      // Issue type filter
      const matchesType =
        filterType === "all" ||
        (issue.issueType || "").toLowerCase() === filterType.toLowerCase();

      // Status filter
      const matchesStatus =
        filterStatus === "all" ||
        (issue.status || "").toLowerCase() === filterStatus.toLowerCase();

      // Site filter
      const matchesSite =
        filterSite === "all" ||
        fromSiteName.includes(filterSite) ||
        toSiteName.includes(filterSite);

      return matchesType && matchesStatus && matchesSite;
    });
  }, [data, filterType, filterStatus, filterSite]);

  // Define columns using TanStack Table
  const columns = useMemo(
    () => [
      columnHelper.accessor("issueNumber", {
        header: "Issue No",
        cell: ({ getValue, row }) => (
          <div
            className="font-medium text-blue-500 underline cursor-pointer"
            onClick={() => navigate(`/issues/${row.original.id}`)}
          >
            {getValue()}
          </div>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor("issueDate", {
        header: "Date",
        cell: ({ getValue }) => <div>{formatDate(getValue())}</div>,
        enableSorting: false,
        sortingFn: "datetime",
      }),
      columnHelper.accessor("issueType", {
        header: "Type",
        cell: ({ getValue }) => <div className="capitalize">{getValue()}</div>,
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
      }),
      columnHelper.accessor(
        (row) => row.fromSiteName?.split(",") || "N/A",
        {
          id: "fromSite",
          header: "From",
          cell: ({ getValue }) => <div>{getValue()}</div>,
          enableSorting: false,
          meta: {
            className: "hidden sm:table-cell",
          },
        }
      ),
      columnHelper.accessor(
        (row) => row.toSiteName?.split(",")[0] || "N/A",
        {
          id: "toSite",
          header: "To",
          cell: ({ getValue }) => <div>{getValue()}</div>,
          enableSorting: false,
          meta: {
            className: "hidden sm:table-cell",
          },
        }
      ),
      columnHelper.accessor((row) => row.itemCount || 0, {
        id: "itemsCount",
        header: "Items",
        cell: ({ getValue }) => <div>{getValue()}</div>,
        enableSorting: false,
        meta: {
          className: "hidden lg:table-cell",
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => getStatusBadge(getValue()),
        enableSorting: false,
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
                onClick={() => navigate(`/issues/${row.original.id}`)}
              >
                <Info className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  navigate(`/issues/${row.original.id}?print=true`)
                }
              >
                <FileText className="mr-2 h-4 w-4" />
                View Pdf
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
        Error loading material issues: {error?.message}
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
          <h1 className="text-3xl font-bold tracking-tight">Material Issues</h1>
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
            <Link to="/issues/new" className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Issue
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Material Issues</CardTitle>
          <CardDescription>View and manage all material issues</CardDescription>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueTypes.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase()}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {uniqueStatuses.map((status) => (
                      <SelectItem key={status} value={status.toLowerCase()}>
                        {status}
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
                    {uniqueSites.map((site) => (
                      <SelectItem key={site} value={site}>
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
                          navigate(`/issues/${row.original.id}`)
                        }
                      // onMouseEnter={() => handleIssueHover(row.original.id)}
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
                          filterType !== "all" ||
                          filterStatus !== "all" ||
                          filterSite !== "all"
                          ? "No material issues found matching your search criteria."
                          : "No material issues found."}
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

export default MaterialIssueList;
