"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchUnits } from "@/features/units/units-slice";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api/api-service";
import { ROLES } from "@/utils/roles";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

const UnitList = () => {
  const dispatch = useDispatch();
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState(null);
  const { toast } = useToast();
  const storedUnits = useSelector((state) => state.units) || [];
  const storedItems = useSelector((state) => state.items) || [];
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { user } = useSelector((state) => state.auth);
  const userRoleId = user?.roleId;
  const NotAllowed = [
    ROLES.MECHANICAL_STORE_MANAGER.id,
    ROLES.MECHANICAL_INCHARGE.id,
    ROLES.PROJECT_MANAGER.id,
  ].includes(userRoleId);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    setUnits(storedUnits.data);
  }, [storedUnits]);

  const handleDelete = (id) => {
    const unit = units.find((unit) => unit.id === id);
    setUnitToDelete(unit);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // Check if this unit is used by any items
    const items = storedItems.data || [];
    const isUsed = items.some((item) => item.unit === unitToDelete.id);

    if (isUsed) {
      toast({
        title: "Cannot Delete",
        description: "This unit is being used by one or more items.",
        variant: "destructive",
      });
    } else {
      const updatedUnits = units.filter((unit) => unit.id !== unitToDelete.id);
      setUnits(updatedUnits);
      api
        .delete(`/units/${unitToDelete.id}`)
        .then((response) => {})
        .catch((error) => {
          console.error("Error deleting unit:", error);
        });
      dispatch(fetchUnits());
      toast({
        title: "Unit Deleted",
        description: "The measurement unit has been deleted successfully.",
      });
    }

    setDeleteDialogOpen(false);
    setUnitToDelete(null);
  };

  const filteredUnits = units.filter(
    (unit) =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.shortName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUnits.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Measurement Units</h1>
        <Button className={`${NotAllowed && "hidden"}`}>
          <Link to="/units/new" className="flex">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Unit
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search units..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unit Name</TableHead>
              <TableHead>Short Name</TableHead>
              <TableHead>Decimal Places</TableHead>
              <TableHead
                className={"text-right " + `${NotAllowed && "hidden"}`}
              >
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUnits.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-muted-foreground"
                >
                  {searchTerm
                    ? "No units found matching your search."
                    : "No measurement units added yet."}
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">
                    {unit.name.toUpperCase()}
                  </TableCell>
                  <TableCell>{unit.shortName.toUpperCase()}</TableCell>
                  <TableCell>{unit.decimalPlaces}</TableCell>
                  <TableCell
                    className={"text-right " + `${NotAllowed && "hidden"}`}
                  >
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Link to={`/units/edit/${unit.id}`}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(unit.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the unit "{unitToDelete?.name}". This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pagination */}
      {filteredUnits?.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t px-6 py-4">
          <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredUnits.length)} of{" "}
            {filteredUnits.length} item groups
          </div>
          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-2 mt-4 sm:mt-0">
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-24">
                  <SelectValue placeholder={itemsPerPage} />
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
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>

              <div className="flex items-center gap-1">
                {/* Simplified responsive pagination - show limited page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((pageNum) => {
                    // Show first page, last page, current page, and pages around current
                    return (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    );
                  })
                  .map((pageNum, index, array) => {
                    // Add ellipsis when pages are skipped
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
                          onClick={() => handlePageChange(pageNum)}
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
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitList;
