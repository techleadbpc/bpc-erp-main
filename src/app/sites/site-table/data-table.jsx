import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddSiteForm from "@/components/add-site-form";
import TableSkeleton from "@/components/ui/table-skeleton";
import { CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";

export function DataTable({ columns, data, loading }) {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      pagination: {
        ...pagination,
      },
    },
    onPaginationChange: setPagination,
  });

  // Pagination states
  const totalItems = table.getFilteredRowModel().rows.length;
  const totalPages = table.getPageCount();
  const currentPage = pagination.pageIndex + 1;
  const itemsPerPage = pagination.pageSize;
  const indexOfFirstItem = pagination.pageIndex * pagination.pageSize;
  const indexOfLastItem = Math.min(
    indexOfFirstItem + pagination.pageSize,
    totalItems
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-2 py-2">
        <Input
          placeholder="Filter sites..."
          value={table.getColumn("name")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        {/* <AddSiteDialog /> */}
      </div>
      <div className="max-w-[95vw] lg:w-[80vw] overflow-x-auto rounded-md border">
        <div>
          {loading ? (
            <div className="flex-1 flex justify-center">
              <TableSkeleton cols={9} />
            </div>
          ) : (
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          className={`text-sm text-nowrap ${
                            header.column.columnDef.className || ""
                          }`}
                        >
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
                        <TableCell
                          className={`text-sm py-[0.3rem] ${
                            cell.column.columnDef.className || ""
                          }`}
                          key={cell.id}
                        >
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
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
        {totalItems > 0 && (
          <CardFooter className="flex flex-col sm:flex-row items-center justify-between border-t px-6 py-4">
            <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
              Showing {indexOfFirstItem + 1} to {indexOfLastItem} of{" "}
              {totalItems} entries
            </div>
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center space-x-2 mt-4 sm:mt-0">
                <Select
                  defaultValue="10"
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className="h-8 w-24">
                    <SelectValue>{itemsPerPage}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (pageNum) =>
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 &&
                          pageNum <= currentPage + 1)
                    )
                    .map((pageNum, index, array) => {
                      const showEllipsisBefore =
                        index > 0 && pageNum > array[index - 1] + 1;
                      const showEllipsisAfter =
                        index < array.length - 1 &&
                        pageNum < array[index + 1] - 1;

                      return (
                        <div key={pageNum} className="flex items-center">
                          {showEllipsisBefore && (
                            <span className="px-2 text-muted-foreground">
                              ...
                            </span>
                          )}
                          <Button
                            variant={
                              currentPage === pageNum ? "default" : "outline"
                            }
                            size="sm"
                            className="w-8 h-8"
                            onClick={() => table.setPageIndex(pageNum - 1)}
                          >
                            {pageNum}
                          </Button>
                          {showEllipsisAfter && (
                            <span className="px-2 text-muted-foreground">
                              ...
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardFooter>
        )}
      </div>
    </div>
  );
}

export function AddSiteDialog() {
  const [openForm, setOpenForm] = React.useState(false);
  const closeForm = () => {
    setOpenForm(false);
  };
  return (
    <Dialog open={openForm} onOpenChange={setOpenForm}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpenForm(true)}><PlusCircle className="mr-2 h-4 w-4" /> Add Site</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Register a new site</DialogTitle>
          <DialogDescription>
            Add site detail to create a new site. Click submit when you're done.
          </DialogDescription>
        </DialogHeader>
        <AddSiteForm close={closeForm} />
      </DialogContent>
    </Dialog>
  );
}
