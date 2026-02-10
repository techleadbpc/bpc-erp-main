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
import { fetchItemGroups } from "@/features/item-groups/item-groups-slice";
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

const ItemGroupList = () => {
  const dispatch = useDispatch();
  const [itemGroups, setItemGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemGroupToDelete, setItemGroupToDelete] = useState(null);
  const { toast } = useToast();
  const storedItemGroups = useSelector((state) => state.itemGroups) || [];
  const storedItems = useSelector((state) => state.items) || [];
  const storedUnits = useSelector((state) => state.units) || [];
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
    setItemGroups(storedItemGroups.data);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDelete = (id) => {
    const itemGroup = itemGroups.find((group) => group.id === id);
    setItemGroupToDelete(itemGroup);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // Check if this item group is used by any items
    const items = storedItems.data || [];
    const isUsed = items.some(
      (item) => item.itemGroup === itemGroupToDelete.id
    );

    if (isUsed) {
      toast({
        title: "Cannot Delete",
        description: "This item group is being used by one or more items.",
        variant: "destructive",
      });
    } else {
      const updatedItemGroups = itemGroups.filter(
        (group) => group.id !== itemGroupToDelete.id
      );
      setItemGroups(updatedItemGroups);
      api
        .delete(`/item-groups/${itemGroupToDelete.id}`)
        .then((response) => {})
        .catch((error) => {
          console.error("Error deleting item group:", error);
        });

      dispatch(fetchItemGroups());

      toast({
        title: "Item Group Deleted",
        description: "The item group has been deleted successfully.",
      });
    }

    setDeleteDialogOpen(false);
    setItemGroupToDelete(null);
  };

  const filteredItemGroups = itemGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.itemType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItemGroups = filteredItemGroups.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredItemGroups.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Item Groups</h1>
        <Button className={`${NotAllowed && "hidden"}`}>
          <Link to="/item-groups/new" className="flex">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Item Group
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search item groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Group</TableHead>
              <TableHead>Short Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead
                className={"text-right " + `${NotAllowed && "hidden"}`}
              >
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItemGroups.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-muted-foreground"
                >
                  {searchTerm
                    ? "No item groups found matching your search."
                    : "No item groups added yet."}
                </TableCell>
              </TableRow>
            ) : (
              currentItemGroups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">
                    {group.name.toUpperCase()}
                  </TableCell>
                  <TableCell>{group.shortName.toUpperCase()}</TableCell>
                  <TableCell>{group.itemType.toUpperCase()}</TableCell>
                  <TableCell
                    className={"text-right " + `${NotAllowed && "hidden"}`}
                  >
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Link to={`/item-groups/edit/${group.id}`}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(group.id)}
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
              This will permanently delete the item group "
              {itemGroupToDelete?.name}". This action cannot be undone.
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
      {filteredItemGroups?.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t px-6 py-4">
          <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredItemGroups.length)} of{" "}
            {filteredItemGroups.length} item groups
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

export default ItemGroupList;
