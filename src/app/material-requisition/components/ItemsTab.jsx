import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, CheckCircle, XCircle } from "lucide-react";
import { getIdByRole } from "@/utils/roles";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/loader";
import api from "@/services/api/api-service";

const ItemsTab = ({
  requisition,
  currentUser,
  userRoleLevel,
  isEditingItems,
  tempRequisitionItems,
  requisitionItemStocks,
  startEditingItems,
  saveEditedItems,
  cancelEditingItems,
  handleTempQuantityChange,
  getUnitName
}) => {
  const isProjectManager = currentUser.roleId === getIdByRole("Project Manager");
  const isAdmin = userRoleLevel.role === "admin";
  const isSameSite = currentUser.site?.id == requisition?.requestingSite.id;

  // const canEdit = (isProjectManager && isSameSite) || isAdmin;
  const canEdit = (isProjectManager && isSameSite && requisition.status === "pending");

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockDetails, setStockDetails] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [selectedItemName, setSelectedItemName] = useState("");

  const handleItemClick = async (item) => {
    if (!isAdmin) return;

    setSelectedItemName(item.Item?.name);
    setLoadingStock(true);
    setIsStockModalOpen(true);
    setStockDetails([]);

    try {
      const response = await api.get(`/inventory/item/${item.Item?.id}`);
      setStockDetails(response.data);
    } catch (error) {
      console.error("Error fetching stock details:", error);
    } finally {
      setLoadingStock(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Requisition Items ({requisition.items.length})
          </CardTitle>
          {(() => {
            if (canEdit && !isEditingItems) {
              return (
                <Button onClick={startEditingItems} size="sm">
                  <Package className="h-4 w-4 mr-2" />
                  Edit Items
                </Button>
              );
            } else if (isEditingItems) {
              return (
                <div className="flex gap-2">
                  <Button
                    onClick={saveEditedItems}
                    // disabled
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    onClick={cancelEditingItems}
                    size="sm"
                    variant="outline"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              );
            }
            return null;
          })()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sr. No</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Part No</TableHead>
                <TableHead>HSN Code</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Procured</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Remaining</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(isEditingItems
                ? tempRequisitionItems
                : requisition.items
              ).map((item, index) => {
                // Calculate procured quantity
                let totalProcured = 0;
                if (requisition.procurements) {
                  requisition.procurements.forEach((procurement) => {
                    if (procurement.ProcurementItems) {
                      procurement.ProcurementItems.forEach((procItem) => {
                        if (procItem.itemId === item.itemId) {
                          totalProcured += procItem.quantity || 0;
                        }
                      });
                    }
                  });
                }

                // Calculate issued quantity
                let totalIssued = 0;
                if (requisition.materialIssues) {
                  requisition.materialIssues.forEach((materialIssue) => {
                    if (materialIssue.items) {
                      materialIssue.items.forEach((issueItem) => {
                        if (issueItem.itemId === item.itemId) {
                          totalIssued += issueItem.quantity || 0;
                        }
                      });
                    }
                  });
                }

                const remaining = item.quantity - totalProcured - totalIssued;

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <span
                          className="cursor-pointer text-blue-600 hover:underline"
                          onClick={() => handleItemClick(item)}
                        >
                          {item.Item?.name || "N/A"}
                        </span>
                      ) : (
                        item.Item?.name || "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {item.Item?.partNumber || "-"}
                    </TableCell>
                    <TableCell>{item.Item?.hsnCode || "-"}</TableCell>
                    <TableCell className="font-medium">
                      {(() => {
                        if (canEdit && isEditingItems) {
                          return (
                            <div className="space-y-2">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleTempQuantityChange(
                                    item.id,
                                    parseInt(e.target.value)
                                  )
                                }
                                className="w-20 px-2 py-1 border rounded text-sm"
                              />
                              <div>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-300">
                                  {"Avl: "}
                                  {requisitionItemStocks.find(
                                    (stock) =>
                                      stock.itemId === item.Item?.id
                                  )?.quantity || 0}{" "}
                                </Badge>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div>
                              {item.quantity}
                              <div>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-300">
                                  {"Avl: "}
                                  {requisitionItemStocks.find(
                                    (stock) =>
                                      stock.itemId === item.Item?.id
                                  )?.quantity || 0}{" "}
                                </Badge>
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </TableCell>
                    <TableCell>
                      {getUnitName(item.Item?.unitId)}
                    </TableCell>
                    <TableCell>
                      {totalProcured > 0 ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {totalProcured}
                        </Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      {totalIssued > 0 ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {totalIssued}
                        </Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`
                       ${remaining > 0 ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-gray-50 text-gray-500"}
                     `}>
                        {remaining}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isStockModalOpen} onOpenChange={setIsStockModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Stock Availability: {selectedItemName}</DialogTitle>
          </DialogHeader>

          {loadingStock ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <div className="rounded-md border max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site Name</TableHead>
                    <TableHead>Available Quantity</TableHead>
                    <TableHead>Part No</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockDetails.length > 0 ? (
                    stockDetails.map((stock) => (
                      <TableRow key={stock.id}>
                        <TableCell>{stock.Site?.name || "Unknown Site"}</TableCell>
                        <TableCell className="font-medium">
                          {stock.quantity} {stock.Item?.Unit?.name}
                        </TableCell>
                        <TableCell>{stock.Item?.partNumber || "-"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                        No stock data available for this item.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ItemsTab;
