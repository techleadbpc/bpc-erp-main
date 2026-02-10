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
import AddUserDialog from "./add-user-dialog.jsx";
import EditUserDialog from "./edit-user-dialog.jsx";

// API functions
const fetchUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

const deleteUser = async (id) => {
  await api.delete(`/users/${id}`);
  return id;
};

// Query keys
const userKeys = {
  all: ["users"],
  lists: () => [...userKeys.all, "list"],
  details: () => [...userKeys.all, "detail"],
  detail: (id) => [...userKeys.details(), id],
};

// Utility function for role mapping
const getRoleDesignation = (roleId) => {
  switch (roleId) {
    case 1:
      return "Admin";
    case 2:
      return "Mechanical Head";
    case 3:
      return "Mechanical Manager";
    case 4:
      return "Site Incharge";
    case 5:
      return "Store Manager";
    case 6:
      return "Project Manager";
    default:
      return "Unknown";
  }
};

// Create column helper
const columnHelper = createColumnHelper();

export default function UserTable() {
  const queryClient = useQueryClient();
  const { showLoader, hideLoader } = useLoader();
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // TanStack Query for fetching users
  const {
    data: serverData = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: userKeys.lists(),
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    placeholderData: [],
    onError: (error) => {
      toast({
        title: "Error loading users",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast({
        title: "Success",
        description: "User deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete the user.",
      });
    },
  });

  // Ensure data is always an array
  const data = useMemo(() => serverData ?? [], [serverData]);

  // Event handlers
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteMutation.mutate(Number(id));
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setOpenEdit(true);
  };

  const handleRefresh = () => {
    refetch();
  };

  const refreshUserData = () => {
    queryClient.invalidateQueries({ queryKey: userKeys.lists() });
  };

  // Define columns using TanStack Table
  const columns = useMemo(
    () => [
      columnHelper.accessor("code", {
        header: "Code",
        enableSorting: false,
      }),
      columnHelper.accessor("name", {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor("email", {
        header: "Email",
        enableSorting: false,
      }),
      columnHelper.accessor("phone", {
        header: "Phone No.",
        enableSorting: false,
      }),
      columnHelper.accessor("roleId", {
        header: "Designation",
        cell: ({ getValue }) => getRoleDesignation(getValue()),
        enableSorting: false,
      }),
      columnHelper.accessor("Site.name", {
        header: "Site Name",
        cell: ({ getValue }) => getValue() || "NA",
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
                className="text-red-500"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      }),
    ],
    []
  );

  // Initialize TanStack Table
  const table = useReactTable({
    data,
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

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="text-red-500 text-center">
          <h3 className="text-lg font-semibold">Error loading users</h3>
          <p>{error?.message}</p>
        </div>
        <Button onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
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
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
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
        <Button onClick={() => setOpenAdd(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex items-center space-x-2">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={table.getState().globalFilter ?? ""}
                onChange={(event) =>
                  table.setGlobalFilter(String(event.target.value))
                }
                className="pl-8"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          <div
                            className={`flex items-center gap-2 ${
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
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="hover:bg-muted/50">
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
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          {table.getPageCount() > 0 && (
            <div className="flex items-center justify-between">
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
      <AddUserDialog
        open={openAdd}
        setOpen={setOpenAdd}
        refreshUserData={refreshUserData}
      />
      <EditUserDialog
        open={openEdit}
        setOpen={setOpenEdit}
        userData={editingUser}
        refreshUserData={refreshUserData}
      />
    </div>
  );
}
