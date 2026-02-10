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
  Search,
  PlusCircle,
  MoreHorizontal,
  Info,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/services/api/api-service";
import { toast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/loader";
import { useSelector } from "react-redux";

// API functions
const fetchInventory = async () => {
  const response = await api.get("/inventory");
  return response.data;
};

// Query keys
const inventoryKeys = {
  all: ["inventory"],
  lists: () => [...inventoryKeys.all, "list"],
  details: () => [...inventoryKeys.all, "detail"],
  detail: (id) => [...inventoryKeys.details(), id],
};

// Utility functions
const getStockStatus = (item) => {
  if (item.quantity <= 0) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  } else if (item.quantity <= item.minLevel) {
    return <Badge variant="warning">Low Stock</Badge>;
  } else {
    return <Badge variant="success">In Stock</Badge>;
  }
};

const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    return dateString;
  }
};

// Create column helper
const columnHelper = createColumnHelper();

const InventoryList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSite, setFilterSite] = useState("all");
  const { data: sitesData } = useSelector((s) => s.sites);

  // TanStack Query for fetching inventory
  const {
    data: serverData = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: inventoryKeys.lists(),
    queryFn: fetchInventory,
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    placeholderData: [], // Prevent undefined data issues[12]
    onError: (error) => {
      toast({
        title: "Error loading inventory",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Ensure data is always an array for TanStack Table[12]
  const data = useMemo(() => serverData ?? [], [serverData]);

  // Extract categories and sites for filters
  const { categories, sites } = useMemo(() => {
    return {
      categories: [
        ...new Set(
          data?.map((item) => item.Item?.ItemGroup?.name || "Unknown")
        ),
      ],
      sites: [...new Set(sitesData?.map((site) => site?.name || "Unknown"))],
    };
  }, [data]);

  // Filter data based on filters
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const category = item.Item?.ItemGroup?.name?.toLowerCase() || "";
      const siteName = item.Site?.name || "Unknown Site";

      const matchesCategory =
        filterCategory === "all" || category.toLowerCase() === filterCategory.toLowerCase();
      const matchesSite = filterSite === "all" || siteName === filterSite;

      return matchesCategory && matchesSite;
    });
  }, [data, filterCategory, filterSite]);

  // Define columns using TanStack Table - Based on your actual data structure
  const columns = useMemo(
    () => [
      columnHelper.accessor("Item.name", {
        header: "Name",
        cell: ({ getValue, row }) => (
          <span
            className="font-medium text-blue-500 underline cursor-pointer"
          // onClick={() =>
          //   navigate(`/inventory/${row.original.id || row.original.itemId}`)
          // }
          >
            {getValue()}
          </span>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor("Item.partNumber", {
        header: "Part No.",
        cell: ({ getValue }) => getValue() || "-",
        enableSorting: false,
      }),
      columnHelper.accessor("Item.ItemGroup.name", {
        header: "Category",
        cell: ({ getValue }) => getValue() || "-",
        enableSorting: false,
      }),
      columnHelper.accessor("quantity", {
        header: "Stock Status",
        cell: ({ getValue, row }) => {
          const total = parseFloat(row.original.totalQuantity || 0);
          const locked = parseFloat(row.original.totalLockedQuantity || 0);
          const available = total - locked;
          const unit = row.original.Item?.Unit?.name || "";

          return (
            <div className="flex flex-col gap-1">
              <div className="font-semibold text-sm">
                Available: {available} {unit}
              </div>
              <div className="flex items-center gap-3">
                {locked > 0 && (
                  <div className="text-[11px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                    {locked} Locked
                  </div>
                )}
                <div className="text-[11px] text-muted-foreground">
                  Total: {total} {unit}
                </div>
              </div>
            </div>
          );
        },
        enableSorting: false,
      }),
      // columnHelper.accessor("minLevel", {
      //   header: "Min. Level",
      //   cell: ({ getValue }) => getValue() || "—",
      //   enableSorting: false,
      //   meta: {
      //     className: "hidden md:table-cell",
      //   },
      // }),
      // columnHelper.accessor("Site.name", {
      //   header: "Site",
      //   cell: ({ getValue }) => getValue() || "Unknown Site",
      //   enableSorting: false,
      //   meta: {
      //     className: "hidden lg:table-cell",
      //   },
      // }),
      // columnHelper.accessor("updatedAt", {
      //   header: "Last Updated",
      //   cell: ({ getValue }) => formatDate(getValue()),
      //   enableSorting: false,
      //   sortingFn: "datetime",
      //   meta: {
      //     className: "hidden lg:table-cell",
      //   },
      // }),
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
                onClick={() =>
                  navigate(
                    `/inventory/${row.original.id || row.original.itemId}`
                  )
                }
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

  // Prefetch inventory item details on hover
  const handleInventoryHover = (itemId) => {
    queryClient.prefetchQuery({
      queryKey: inventoryKeys.detail(itemId),
      queryFn: () => api.get(`/inventory/${itemId}`).then((res) => res.data),
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
        Error loading inventory: {error?.message}
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
            Spare Parts Inventory
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
        <div>
          <Link to="/inventory/add">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spare Parts Inventory</CardTitle>
          <CardDescription>
            Manage your spare parts inventory across all sites
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, part number, or category..."
                value={table.getState().globalFilter ?? ""}
                onChange={(e) => table.setGlobalFilter(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex flex-1 flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((category, index) => {
                      return (
                        <SelectItem key={index} value={category}>
                          {category}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              {/* <div className="flex-1">
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
              </div> */}
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
                          navigate(
                            `/inventory/${row.original.id || row.original.itemId
                            }`
                          )
                        }
                      // onMouseEnter={() =>
                      //   handleInventoryHover(
                      //     row.original.id || row.original.itemId
                      //   )
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
                          filterCategory !== "all" ||
                          filterSite !== "all"
                          ? "No items found matching your search criteria."
                          : "No inventory items found."}
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

export default InventoryList;
