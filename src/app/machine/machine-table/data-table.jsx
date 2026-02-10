import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSelector } from "react-redux";
import { ROLES } from "@/utils/roles";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TableSkeleton from "@/components/ui/table-skeleton";
import { Check, ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";

export function DataTable({ columns, data, loading }) {
  const [sorting, setSorting] = React.useState([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [openSiteFilter, setOpenSiteFilter] = React.useState(false);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({
    registrationNumber: false,
    make: false,
    FileNo: false,
    ownerName: false,
    ownerType: false,
    yom: false,
  });
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.roleId === ROLES.ADMIN.id;

  const tableColumns = React.useMemo(() => {
    return columns.map((col) => {
      if (col.accessorKey === "site") {
        return {
          ...col,
          filterFn: (row, id, value) => {
            return value === row.getValue(id)?.name;
          },
        };
      }
      return col;
    });
  }, [columns]);

  const uniqueSites = React.useMemo(() => {
    const sites = new Set();
    data?.forEach((item) => {
      if (item.site?.name) {
        sites.add(item.site.name);
      }
    });
    return Array.from(sites).sort();
  }, [data]);

  const table = useReactTable({
    data,
    columns: tableColumns,
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
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      globalFilter, // Add global filter to state
      columnVisibility,
      pagination: {
        ...pagination,
      },
    },
    onPaginationChange: setPagination,
    // Define global filtering function
    globalFilterFn: (row, columnId, filterValue) => {
      // List of columns to search in
      const searchableColumns = [
        'erpCode',
        'machineName',
        'status',
        // 'site', // This accesses the site object, we'll need to handle it specially
        'machineCode',
        'machineNumber',
        'registrationNumber',
        'chassisNumber',
        'engineNumber',
        'serialNumber',
        'model',
        'make',
        'yom'
      ];

      // Convert filter value to lowercase for case-insensitive search
      const searchValue = filterValue.toLowerCase();

      // Check if any of the searchable columns contain the filter value
      for (const colId of searchableColumns) {
        const cellValue = row.getValue(colId);
        if (cellValue !== undefined && cellValue !== null) {
          // Handle site object specially since it's an object with a name property
          if (colId === 'site' && typeof cellValue === 'object' && cellValue.name) {
            if (cellValue.name.toString().toLowerCase().includes(searchValue)) {
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
    <div className="">
      <div className="flex items-center justify-between gap-2 py-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <Input
            placeholder="Filter machines..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
          {isAdmin && (
            <Popover open={openSiteFilter} onOpenChange={setOpenSiteFilter}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openSiteFilter}
                  className="w-[300px] justify-between"
                >
                  {table.getColumn("site")?.getFilterValue()
                    ? table.getColumn("site")?.getFilterValue()
                    : "Select Site..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Search site..." />
                  <CommandList>
                    <CommandEmpty>No site found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          table.getColumn("site")?.setFilterValue(undefined);
                          setOpenSiteFilter(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !table.getColumn("site")?.getFilterValue()
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        All Sites
                      </CommandItem>
                      {uniqueSites.map((site) => (
                        <CommandItem
                          key={site}
                          value={site}
                          onSelect={(currentValue) => {
                            table.getColumn("site")?.setFilterValue(site);
                            setOpenSiteFilter(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              table.getColumn("site")?.getFilterValue() === site
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {site}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="h-[500px] overflow-auto"
              align="end"
            >
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="max-w-[95vw] lg:w-[80vw] -mt-2 overflow-x-auto rounded-md border">
        <div>
          {loading ? (
            <div className="flex-1 flex justify-center">
              <TableSkeleton />
            </div>
          ) : (
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          className={`text-xs min-w-[150px] text-nowrap ${header.column.columnDef.className || ""
                            }`}
                          key={header.id}
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
                          className={`text-xs py-[0.3rem] ${cell.column.columnDef.className || ""
                            }`}
                          key={cell.id}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                          {!cell.getValue() &&
                            ![
                              "fitnessCertificateExpiry",
                              "motorVehicleTaxDue",
                              "permitExpiryDate",
                              "nationalPermitExpiry",
                              "insuranceExpiry",
                              "pollutionCertificateExpiry",
                              "actions",
                              "Documents",
                            ].includes(cell.column.id) &&
                            "NA"}
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
