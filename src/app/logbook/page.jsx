"use client";

import { LogbookFilters } from "@/components/logbook/logbook-filters";
import { LogbookForm } from "@/components/logbook/logbook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api/api-service";
import { ROLES } from "@/utils/roles";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Edit,
  Info,
  MoreHorizontal,
  RefreshCw,
  Trash2
} from "lucide-react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

// API functions
const fetchLogEntries = async () => {
  const response = await api.get("/logbook");
  return response.data;
};

const createLogEntry = async (newEntry) => {
  const response = await api.post("/logbook", newEntry);
  return response.data;
};

const updateLogEntry = async ({ id, ...updatedEntry }) => {
  const response = await api.put(`/logbook/${id}`, updatedEntry);
  return response.data;
};

const deleteLogEntry = async (id) => {
  await api.delete(`/logbook/${id}`);
  return id;
};

// Query keys
const logbookKeys = {
  all: ["logbook"],
  lists: () => [...logbookKeys.all, "list"],
  details: () => [...logbookKeys.all, "detail"],
  detail: (id) => [...logbookKeys.details(), id],
};

// Create column helper
const columnHelper = createColumnHelper();

export function LogbookPage() {
  const navigate = useNavigate();
  const [editingEntry, setEditingEntry] = useState(null);
  const [activeTab, setActiveTab] = useState("view");
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [filters, setFilters] = useState({
    dateRange: { from: null, to: null },
    machineNo: "",
    siteName: "",
    assetCode: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // TanStack Query for fetching logbook entries
  const {
    data: serverData = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: logbookKeys.lists(),
    queryFn: fetchLogEntries,
    staleTime: 5 * 60 * 1000, // Force fresh data
    cacheTime: 10 * 60 * 1000,
    refetchOnMount: true, // key change to ensure data usually refreshes on navigation
    placeholderData: [], // Important for TanStack Table[13]
    onError: (error) => {
      toast({
        title: "Something went wrong!",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createLogEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: logbookKeys.lists() });
      setActiveTab("view");
      toast({
        title: "Success",
        description: "Log entry created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLogEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: logbookKeys.lists() });
      setDeleteConfirm({ open: false, id: null });
      toast({
        title: "Success",
        description: "Log entry deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add this mutation after createMutation:

  const updateMutation = useMutation({
    mutationFn: updateLogEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: logbookKeys.lists() });
      setEditingEntry(null);
      setActiveTab("view");
      toast({
        title: "Success",
        description: "Log entry updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Ensure data is always an array for TanStack Table[13]
  const data = useMemo(() => serverData ?? [], [serverData]);

  // Filter data based on filters
  const filteredData = useMemo(() => {
    return data.filter((entry) => {
      // Filter by date range
      if (filters.dateRange.from && filters.dateRange.to) {
        const entryDate = new Date(entry.date);
        const fromDate = new Date(filters.dateRange.from);
        const toDate = new Date(filters.dateRange.to);
        if (entryDate < fromDate || entryDate > toDate) return false;
      }

      // Filter by machine number (using machine.erpCode based on your table)
      if (
        filters.machineNo &&
        !entry.machine?.erpCode
          ?.toLowerCase()
          .includes(filters.machineNo.toLowerCase())
      ) {
        return false;
      }

      // Filter by site name
      if (
        filters.siteName &&
        !entry.site?.name
          ?.toLowerCase()
          .includes(filters.siteName.toLowerCase())
      ) {
        return false;
      }

      // Filter by asset code (using machine.erpCode)
      if (
        filters.assetCode &&
        !entry.machine?.erpCode
          ?.toLowerCase()
          .includes(filters.assetCode.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [data, filters]);

  // Define columns using TanStack Table - CORRECTED based on your actual data structure
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: ({ getValue, row }) => (
          <div
            className="text-blue-500 underline cursor-pointer"
            onClick={() => navigate(`/logbook/${row.original.id}`)}
          >
            {getValue()}
          </div>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor("date", {
        header: "Date",
        cell: ({ getValue }) => format(new Date(getValue()), "dd/MM/yyyy"),
        enableSorting: false,
        sortingFn: "datetime",
      }),
      columnHelper.accessor("machine.erpCode", {
        header: "ERP Code",
        cell: ({ getValue }) => getValue() || "-",
        enableSorting: false,
      }),
      columnHelper.accessor("machine.machineName", {
        header: "Machine Name",
        cell: ({ getValue }) => getValue() || "-",
        enableSorting: false,
      }),
      columnHelper.accessor("site.name", {
        header: "Site",
        cell: ({ getValue }) => getValue() || "-",
        enableSorting: false,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue();
          let variant = "outline";
          let className = "";

          if (status === "Pending") {
            className = "bg-yellow-100 text-yellow-800 border-yellow-200";
          } else if (status === "Approved") {
            className = "bg-green-100 text-green-800 border-green-200";
          } else if (status === "Rejected") {
            className = "bg-red-100 text-red-800 border-red-200";
          }

          return (
            <Badge variant={variant} className={className}>
              {status}
            </Badge>
          );
        },
        enableSorting: false,
      }),
      columnHelper.accessor("totalRunKM", {
        header: "KM Run",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
      }),
      columnHelper.accessor("totalRunHrsMeter", {
        header: "Hours Run",
        enableSorting: false,
        meta: {
          className: "hidden md:table-cell",
        },
      }),
      columnHelper.accessor(
        (row) => {
          return (
            row.dieselOpeningBalance +
            row.dieselIssue -
            row.dieselClosingBalance
          );
        },
        {
          id: "dieselUsed",
          header: "Diesel Used",
          cell: ({ getValue }) => `${getValue()}L`,
          enableSorting: false,
          meta: {
            className: "hidden lg:table-cell",
          },
        }
      ),
      columnHelper.accessor("dieselAvgKM", {
        header: "KM/L",
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
                onClick={() => navigate(`/logbook/${row.original.id}`)}
              >
                <Info className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEditEntry(row.original)}
                disabled={row.original.status !== "Pending" && userRoleId !== ROLES.ADMIN.id}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(row.original.id)}
                className="text-red-600"
                disabled={row.original.status !== "Pending" && userRoleId !== ROLES.ADMIN.id}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
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

  const { user } = useSelector((state) => state.auth);
  const userRoleId = user?.roleId;

  const Allowed = [
    ROLES.MECHANICAL_STORE_MANAGER.id,
  ].includes(userRoleId);

  // Event handlers
  const handleAddEntry = async (newEntry) => {
    const calculatedEntry = {
      ...newEntry,
      totalRunKM: newEntry.closingKmReading - newEntry.openingKmReading,
      dieselAvgKM: calculateDieselAvgKM(newEntry),
      totalRunHrsMeter: newEntry.closingHrsMeter - newEntry.openingHrsMeter,
      dieselAvgHrsMeter: calculateDieselAvgHrsMeter(newEntry),
    };
    createMutation.mutate(calculatedEntry);
  };

  // Add this missing function after the handleAddEntry function:

  const handleUpdateEntry = (updatedEntry) => {
    const calculatedEntry = {
      ...updatedEntry,
      id: editingEntry.id,
      totalRunKM: updatedEntry.closingKmReading - updatedEntry.openingKmReading,
      dieselAvgKM: calculateDieselAvgKM(updatedEntry),
      totalRunHrsMeter:
        updatedEntry.closingHrsMeter - updatedEntry.openingHrsMeter,
      dieselAvgHrsMeter: calculateDieselAvgHrsMeter(updatedEntry),
    };
    updateMutation.mutate(calculatedEntry);
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirm({ open: true, id });
  };

  const confirmDelete = () => {
    if (deleteConfirm.id) {
      deleteMutation.mutate(deleteConfirm.id);
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setActiveTab("form");
  };

  // Manual refresh function
  const handleRefresh = () => {
    refetch();
  };

  // Utility functions
  const calculateDieselAvgKM = (entry) => {
    const dieselUsed =
      (entry.dieselOpeningBalance || 0) +
      (entry.dieselIssue || 0) -
      (entry.dieselClosingBalance || 0);
    const kmRun = (entry.closingKmReading || 0) - (entry.openingKmReading || 0);
    return dieselUsed > 0 && kmRun > 0
      ? Number.parseFloat((kmRun / dieselUsed).toFixed(2))
      : 0;
  };

  const calculateDieselAvgHrsMeter = (entry) => {
    const dieselUsed =
      (entry.dieselOpeningBalance || 0) +
      (entry.dieselIssue || 0) -
      (entry.dieselClosingBalance || 0);
    const hoursRun =
      (entry.closingHrsMeter || 0) - (entry.openingHrsMeter || 0);
    return dieselUsed > 0 && hoursRun > 0
      ? Number.parseFloat((dieselUsed / hoursRun).toFixed(2))
      : 0;
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return (
      <div className="text-red-500">
        Error loading logbook entries: {error?.message}
        <Button onClick={handleRefresh} className="ml-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Machine Logbook</h1>
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
      </div>

      <Tabs
        defaultValue="view"
        value={activeTab}
        onValueChange={(value) => {
          if (value !== activeTab) setActiveTab(value);
        }}
        className="w-full"
      >
        {Allowed && (
          <TabsList className={`grid w-full max-w-md grid-cols-2`}>
            <TabsTrigger value="view">View Logs</TabsTrigger>
            <TabsTrigger value="form">
              {editingEntry ? "Edit Log Entry" : "New Log Entry"}
            </TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="view" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logbook Entries</CardTitle>
              <CardDescription>
                View and manage machine logbook entries. Use the filters to
                narrow down results.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LogbookFilters filters={filters} setFilters={setFilters} />

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
                                    ) : header.column.getIsSorted() ===
                                      "desc" ? (
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
                            onDoubleClick={() =>
                              navigate(`/logbook/${row.original.id}`)
                            }
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
                            No logbook entries found matching your criteria.
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
        </TabsContent>

        <TabsContent value="form" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingEntry ? "Edit Log Entry" : "New Log Entry"}
              </CardTitle>
              <CardDescription>
                {editingEntry
                  ? "Update the details for this logbook entry"
                  : "Fill in the details to create a new logbook entry"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogbookForm
                onSubmit={editingEntry ? handleUpdateEntry : handleAddEntry}
                initialData={editingEntry}
                onCancel={() => {
                  setEditingEntry(null);
                  setActiveTab("view");
                }}
                isLoading={createMutation.isLoading || updateMutation.isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this logbook entry? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm({ open: false, id: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
