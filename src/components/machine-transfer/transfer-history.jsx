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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import api from "@/services/api/api-service";
import {
  Info,
  MoreHorizontal,
  Search,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  PlusCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Spinner } from "../ui/loader";
import { useUserRoleLevel } from "@/utils/roles";

// API functions
const fetchTransfers = async () => {
  const response = await api.get("/transfers");
  return response.data || [];
};

// Query keys
const transferKeys = {
  all: ["transfers"],
  lists: () => [...transferKeys.all, "list"],
  details: () => [...transferKeys.all, "detail"],
  detail: (id) => [...transferKeys.details(), id],
};

// Constants
const statuses = [
  "All Statuses",
  "Pending",
  "Approved",
  "Dispatched",
  "Received",
  "Rejected",
  "Sold",
  "Scrapped",
];

const transferTypes = ["All Types", "Site Transfer", "Sell", "Scrap"];

// Utility functions
const getStatusColor = (status) => {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "Approved":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "Dispatched":
      return "bg-purple-100 text-purple-800 hover:bg-purple-100";
    case "Received":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "Rejected":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "Sold":
      return "bg-orange-100 text-orange-800 hover:bg-orange-100";
    case "Scrapped":
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

// Create column helper
const columnHelper = createColumnHelper();

export function TransferHistory() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [siteFilter, setSiteFilter] = useState("All Sites");
  const [machineFilter, setMachineFilter] = useState("All Machines");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const role = useUserRoleLevel();

  // TanStack Query for fetching transfers
  const {
    data: serverData = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: transferKeys.lists(),
    queryFn: fetchTransfers,
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    placeholderData: [], // Prevent undefined data issues
    onError: (error) => {
      toast({
        title: "Something went wrong!",
        description: "Could not fetch list.",
        variant: "destructive",
      });
    },
  });

  // Ensure data is always an array for TanStack Table
  const data = useMemo(() => serverData ?? [], [serverData]);

  // Filter data based on filters
  const filteredData = useMemo(() => {
    return data.filter((transfer) => {
      const matchesStatus =
        statusFilter === "All Statuses" || transfer.status === statusFilter;

      const matchesSite =
        siteFilter === "All Sites" ||
        transfer.fromSite === siteFilter ||
        (transfer.toSite && transfer.toSite === siteFilter);

      const matchesMachine =
        machineFilter === "All Machines" ||
        transfer.machine?.machineName === machineFilter;

      let matchesType = true;
      if (typeFilter !== "All Types") {
        if (
          typeFilter === "Site Transfer" &&
          transfer.requestType !== "Site Transfer"
        )
          matchesType = false;
        if (typeFilter === "Sell" && transfer.requestType !== "Sell")
          matchesType = false;
        if (typeFilter === "Scrap" && transfer.requestType !== "Scrap")
          matchesType = false;
      }

      return matchesStatus && matchesSite && matchesMachine && matchesType;
    });
  }, [data, statusFilter, siteFilter, machineFilter, typeFilter]);

  // Define columns using TanStack Table - Based on your actual data structure
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Transfer No.",
        cell: ({ getValue, row }) => (
          <div
            className="text-blue-500 underline cursor-pointer"
            onClick={() => navigate(`./${row.original.id}`)}
          >
            {getValue()}
          </div>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor("machine.machineName", {
        header: "Machine Name",
        cell: ({ getValue }) => getValue() || "NA",
        enableSorting: false,
      }),
      columnHelper.accessor("requestType", {
        header: "Type",
        cell: ({ getValue }) => {
          const type = getValue();
          return type === "Site Transfer"
            ? "Site Transfer"
            : type === "Sell"
            ? "Sell"
            : "Scrap";
        },
        enableSorting: false,
      }),
      columnHelper.accessor(
        (row) => {
          const from = row.currentSite?.name || "NA";
          const to =
            row.requestType === "Site Transfer"
              ? row.destinationSite?.name || "NA"
              : row.requestType === "Sell"
              ? row.buyerName || "Buyer"
              : row.scrapVendor || "Scrap";
          return `${from} → ${to}`;
        },
        {
          id: "transfer_path",
          header: "From → To",
          cell: ({ getValue }) => <div className="w-[250px]">{getValue()}</div>,
          enableSorting: false,
        }
      ),
      columnHelper.accessor("createdAt", {
        header: "Transfer Date",
        cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
        enableSorting: false,
        sortingFn: "datetime",
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => (
          <Badge className={getStatusColor(getValue())} variant="outline">
            {getValue()}
          </Badge>
        ),
        enableSorting: false,
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate(`./${row.original.id}`)}
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
        Error loading transfers: {error?.message}
        <Button onClick={handleRefresh} className="ml-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Transfer Records
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
          <p className="text-muted-foreground mt-2">
            View list of all machine transfers
          </p>
        </div>

        {role.role == "site" && (
          <div>
            <Link to={`/machine-transfer/new`}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Transfer
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search across all columns..."
              className="pl-8"
              value={table.getState().globalFilter ?? ""}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {transferTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <div className="overflow-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b text-sm">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-center text-sm font-medium"
                    >
                      <div
                        className={`flex items-center justify-center gap-2 ${
                          header.column.getCanSort()
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
                    className="border-b hover:bg-gray-50 transition-colors cursor-pointer text-sm text-center"
                    onDoubleClick={() => navigate(`./${row.original.id}`)}
                    // onMouseEnter={() => handleTransferHover(row.original.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm">
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
                  <td colSpan={columns.length} className="text-center py-4">
                    No transfers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination */}
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
                  const currentPage = table.getState().pagination.pageIndex + 1;
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
                      variant={currentPage === pageNum ? "default" : "outline"}
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
  );
}
