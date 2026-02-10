"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Info, MoreHorizontal, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import api from "@/services/api/api-service";
import Loader from "../ui/loader";

export function LogbookTable({ entries, onEdit, tableLoader, onDelete }) {
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedEntries = entries.slice(startIndex, endIndex);
  const totalPages = Math.ceil(entries.length / rowsPerPage);

  const handleDeleteClick = (id) => {
    setDeleteConfirm({ open: true, id });
  };

  const confirmDelete = () => {
    if (deleteConfirm.id) {
      api
        .delete(`/logbook/${deleteConfirm.id}`)
        .then((response) => {})
        .catch((error) => {
          console.error("Error deleting Logbook:", error);
        });

      onDelete(deleteConfirm.id);
      setDeleteConfirm({ open: false, id: null });
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>ERP Code</TableHead>
              <TableHead>Machine Name</TableHead>
              <TableHead>Site</TableHead>
              <TableHead className="hidden md:table-cell">KM Run</TableHead>
              <TableHead className="hidden md:table-cell">Hours Run</TableHead>
              <TableHead className="hidden lg:table-cell">
                Diesel Used
              </TableHead>
              <TableHead className="hidden lg:table-cell">KM/L</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEntries.length > 0 ? (
              paginatedEntries.map((entry) => (
                <TableRow
                  onDoubleClick={() => navigate(`/logbook/${entry.id}`)}
                  className="text-sm text-center cursor-pointer"
                  key={entry.id}
                >
                  <TableCell
                    className="text-blue-500 underline"
                    onClick={() => navigate(`/logbook/${entry.id}`)}
                  >
                    {entry.name}
                  </TableCell>
                  <TableCell>
                    {format(new Date(entry.date), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>{entry.machine?.erpCode}</TableCell>
                  <TableCell>{entry.machine?.machineName}</TableCell>
                  <TableCell>{entry.site?.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {entry.totalRunKM}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {entry.totalRunHrsMeter}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {entry.dieselOpeningBalance +
                      entry.dieselIssue -
                      entry.dieselClosingBalance}
                    L
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {entry.dieselAvgKM}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => navigate(`/logbook/${entry.id}`)}
                        >
                          <Info className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem onClick={() => onEdit(entry)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem> */}
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(entry.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-6 text-muted-foreground"
                >
                  {tableLoader ? (
                    <Loader size={"sm"} />
                  ) : (
                    "No logbook entries found"
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {entries.length > rowsPerPage && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page > 1 ? page - 1 : 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

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
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
