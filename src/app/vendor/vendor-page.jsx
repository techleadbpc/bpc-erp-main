// vendor-page.jsx

"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
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
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUpDown,
  Search,
  PlusCircle,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Input } from "@/components/ui/input";
import api from "@/services/api/api-service";
import { toast } from "@/hooks/use-toast";
import { useLoader } from "@/common/context/loader/loader-provider";
import { Spinner } from "@/components/ui/loader";
import AddVendorDialog from "./add-vendor-dialog.jsx";
import EditVendorDialog from "./edit-vendor-dialog.jsx";

// API functions
const fetchVendors = async () => {
  const response = await api.get("/vendors");
  return response.data;
};

const deleteVendor = async (id) => {
  await api.delete(`/vendors/${id}`);
  return id;
};

// Query keys
const vendorKeys = {
  all: ["vendors"],
  lists: () => [...vendorKeys.all, "list"],
  details: () => [...vendorKeys.all, "detail"],
  detail: (id) => [...vendorKeys.details(), id],
};

// Create column helper
const columnHelper = createColumnHelper();

export default function VendorTable() {
  const queryClient = useQueryClient();
  const { showLoader, hideLoader } = useLoader();
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  // TanStack Query for fetching vendors
  const {
    data: serverData = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: vendorKeys.lists(),
    queryFn: fetchVendors,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    placeholderData: [],
    onError: (error) => {
      toast({
        title: "Error loading vendors",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      toast({
        title: "Success",
        description: "Vendor deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete the vendor.",
      });
    },
  });

  // Ensure data is always an array
  const data = useMemo(() => serverData ?? [], [serverData]);

  // Event handlers
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this vendor?")) {
      deleteMutation.mutate(Number(id));
    }
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setOpenEdit(true);
  };

  const handleRefresh = () => {
    refetch();
  };

  const refreshVendorData = () => {
    queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
  };

  // Define columns using TanStack Table
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("email", {
        header: "Email",
        enableSorting: false,
      }),
      columnHelper.accessor("contactPerson", {
        header: "Contact Person",
        enableSorting: false,
      }),
      columnHelper.accessor("phone", {
        header: "Phone No.",
        enableSorting: false,
      }),
      columnHelper.accessor("address", {
        header: "Address",
        cell: ({ getValue }) => {
          const address = getValue();
          return address && address.length > 50
            ? `${address.substring(0, 50)}...`
            : address || "NA";
        },
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
              <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(row.original.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        enableSorting: false,
      }),
    ],
    []
  );

  // Table configuration
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-red-600">
              Error loading vendors
            </h3>
            <p className="text-sm text-gray-500 mt-2">{error?.message}</p>
            <Button onClick={handleRefresh} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-col sm:flex-row">
            <div>
              <div className="flex  items-center gap-4">
                <CardTitle>Vendor Management</CardTitle>
                <Button
                  variant="ghosts"
                  onClick={handleRefresh}
                  disabled={isFetching}
                  size="sm"
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${
                      isFetching ? "animate-spin" : ""
                    }`}
                  />
                </Button>
              </div>
              <CardDescription>
                Manage vendors and their information
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => setOpenAdd(true)} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Vendor
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center py-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                value={globalFilter ?? ""}
                onChange={(event) =>
                  setGlobalFilter(String(event.target.value))
                }
                className="pl-8"
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No vendors found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

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
              <div className="flex items-center space-x-2 flex-col sm:flex-row">
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
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddVendorDialog
        open={openAdd}
        setOpen={setOpenAdd}
        refreshVendorData={refreshVendorData}
      />
      <EditVendorDialog
        open={openEdit}
        setOpen={setOpenEdit}
        vendorData={editingVendor}
        refreshVendorData={refreshVendorData}
      />
    </div>
  );
}
