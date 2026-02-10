import React from "react";
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
import TableSkeleton from "@/components/ui/table-skeleton";
import { useNavigate } from "react-router";

import { CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function DataTable({ columns, data, loading }) {
  const [sorting, setSorting] = React.useState([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const navigate = useNavigate();

  const table = useReactTable({
    data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater);
      // When column filters change, also update the global filter if needed
      const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
      // Keep the global filter if it exists
      const globalFilterObj = newFilters.find(f => f.id === 'global');
      if (globalFilterObj) {
        setGlobalFilter(globalFilterObj.value);
      }
    },
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter, // Add global filter to state
      pagination,
    },
    onPaginationChange: setPagination,
    // Define global filtering function
    globalFilterFn: (row, columnId, filterValue) => {
      // List of columns to search in
      const searchableColumns = [
        'name',
        'primaryCategory.name',
        'averageBase',
        'standardHrsRun',
        'useFor',
        'machineType',
        'remarks'
      ];
      
      // Convert filter value to lowercase for case-insensitive search
      const searchValue = filterValue.toLowerCase();
      
      // Check if any of the searchable columns contain the filter value
      for (const colId of searchableColumns) {
        const cellValue = row.getValue(colId);
        if (cellValue !== undefined && cellValue !== null) {
          // For nested properties like primaryCategory.name, we need to handle them specially
          if (colId === 'primaryCategory.name' && typeof cellValue === 'object') {
            // If cellValue is an object, it means the accessor didn't work properly
            // In this case, we'll get the nested value manually
            const nestedValue = row.original.primaryCategory?.name;
            if (nestedValue && nestedValue.toString().toLowerCase().includes(searchValue)) {
              return true;
            }
          } else {
            // For other values, convert to string and check
            if (cellValue.toString().toLowerCase().includes(searchValue)) {
              return true;
            }
          }
        }
      }
      return false;
    },
  });

  const getAddMachineCategoryButton = () => {
    return (
      <Button
        onClick={() => {
          navigate("/machine-category/add");
        }}
      >
        Add Machine Category
      </Button>
    );
  };

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
      <div className="flex items-center justify-between mt-2 py-2">
        <Input
          placeholder="Filter categories..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
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
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={`text-sm min-w-[100px] text-nowrap ${
                          header.column.columnDef.className || ""
                        }`}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={`text-sm py-[0.3rem] ${
                            cell.column.columnDef.className || ""
                          }`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                          {!cell.getValue() &&
                            cell.column.id != "actions" &&
                            "NA"}
                          {/* {cell.getValue() ? flexRender(cell.column.columnDef.cell, cell.getContext()) : "-"} */}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-12 text-left"
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
