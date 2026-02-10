import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/loader";
import api from "@/services/api/api-service";
import {
  Package2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function InventoryTab({ siteId }) {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchInventory();
  }, [siteId]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/inventory/sites/${siteId}`);
      setInventory(res.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Failed to fetch inventory:", error);
      // Mock data for demonstration
      setInventory([
        {
          id: 1,
          name: "Steel Rods",
          category: "Raw Material",
          quantity: 150,
          unit: "pieces",
          status: "In Stock",
        },
        {
          id: 2,
          name: "Cement Bags",
          category: "Construction",
          quantity: 75,
          unit: "bags",
          status: "Low Stock",
        },
        {
          id: 3,
          name: "Safety Helmets",
          category: "Safety",
          quantity: 25,
          unit: "pieces",
          status: "In Stock",
        },
        {
          id: 4,
          name: "Welding Electrodes",
          category: "Consumables",
          quantity: 200,
          unit: "pieces",
          status: "In Stock",
        },
        {
          id: 5,
          name: "Paint Buckets",
          category: "Finishing",
          quantity: 5,
          unit: "buckets",
          status: "Out of Stock",
        },
      ]);
    }
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter(
      (item) =>
        item.Item.name?.toLowerCase().includes(filter.toLowerCase()) ||
        item.ItemGroup?.name?.toLowerCase().includes(filter.toLowerCase()) ||
        item.partNumber?.toLowerCase().includes(filter.toLowerCase())
    );
  }, [inventory, filter]);

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInventory = filteredInventory.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "in stock":
        return "default";
      case "low stock":
        return "secondary";
      case "out of stock":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner />
      </div>
    );
  }

  if (!inventory || inventory.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No inventory items found for this site.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Filter inventory..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Item ID</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentInventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.Item.name}</TableCell>
                <TableCell>#{item.id}</TableCell>
                <TableCell>{item.Item?.ItemGroup?.name || "NA"}</TableCell>
                <TableCell>
                  {item.quantity} {item.unit}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to{" "}
          {Math.min(endIndex, filteredInventory.length)} of{" "}
          {filteredInventory.length} entries
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={itemsPerPage} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
