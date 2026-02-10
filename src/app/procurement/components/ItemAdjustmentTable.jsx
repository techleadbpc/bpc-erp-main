import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Info, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Trash2 
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

const ItemAdjustmentTable = ({ 
  procurementItems, 
  handleItemUpdate,
  handleItemRemove, // New prop for removing items
  calculateTotal 
}) => {
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleRemoveItem = () => {
    if (itemToDelete) {
      handleItemRemove(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Items & Pricing
          <Badge variant="secondary" className="ml-auto">
            {procurementItems.length} Item(s) with Remaining Quantities
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Info Alert */}
        <Alert className="mb-6 border-l-4 border-l-blue-500 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            Showing only items with remaining quantities that need procurement.
            Quantities have been automatically adjusted based on existing
            procurements and material issues.
          </AlertDescription>
        </Alert>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] text-center">SI No</TableHead>
                <TableHead className="min-w-[200px]">Item Details</TableHead>
                <TableHead className="text-center">Original<br />Qty</TableHead>
                <TableHead className="text-center">Procured</TableHead>
                <TableHead className="text-center">Issued</TableHead>
                <TableHead className="text-center">Remaining</TableHead>
                <TableHead className="text-center">Procurement<br />Qty</TableHead>
                <TableHead className="text-center">Rate (₹)</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[80px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {procurementItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-12 w-12 text-muted-foreground/30" />
                      <p className="text-muted-foreground">No items to display</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                procurementItems.map((item, index) => {
                  const procurementPercentage = 
                    (item.totalProcured / item.originalQuantity) * 100;
                  const issuedPercentage = 
                    (item.totalIssued / item.originalQuantity) * 100;
                  const remainingPercentage = 
                    (item.remainingQuantity / item.originalQuantity) * 100;

                  return (
                    <TableRow key={item.id}>
                      {/* SI No */}
                      <TableCell className="font-medium text-center">
                        {index + 1}
                      </TableCell>

                      {/* Item Details */}
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          {item.partNumber && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Part No: {item.partNumber}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Original Quantity */}
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono">
                          {item.originalQuantity}
                        </Badge>
                      </TableCell>

                      {/* Procured */}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Badge 
                            variant="secondary" 
                            className="bg-green-100 text-green-700 font-mono"
                          >
                            {item.totalProcured}
                          </Badge>
                          {/* <span className="text-xs text-green-600">
                            {procurementPercentage.toFixed(0)}%
                          </span> */}
                        </div>
                      </TableCell>

                      {/* Issued */}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Badge 
                            variant="secondary" 
                            className="bg-blue-100 text-blue-700 font-mono"
                          >
                            {item.totalIssued}
                          </Badge>
                          {/* <span className="text-xs text-blue-600">
                            {issuedPercentage.toFixed(0)}%
                          </span> */}
                        </div>
                      </TableCell>

                      {/* Remaining */}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Badge 
                            variant="secondary" 
                            className="bg-orange-100 text-orange-700 font-mono font-semibold"
                          >
                            {item.remainingQuantity}
                          </Badge>
                          {/* <span className="text-xs text-orange-600">
                            {remainingPercentage.toFixed(0)}%
                          </span> */}
                        </div>
                      </TableCell>

                      {/* Procurement Quantity Input */}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Input
                            type="number"
                            value={item.procurementQuantity}
                            onChange={(e) => {
                              const value = e.target.value;
                              const parsedValue =
                                value === "" ? "" : parseInt(value) || 0;
                              handleItemUpdate(
                                item.id,
                                "procurementQuantity",
                                parsedValue
                              );
                            }}
                            max={item.remainingQuantity}
                            min={0}
                            className="w-20 h-9 text-center font-mono"
                            placeholder="0"
                          />
                          {item.procurementQuantity > item.remainingQuantity && (
                            <span className="text-xs text-red-600 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Exceeds
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Rate Input */}
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          value={item.rate}
                          onChange={(e) => {
                            const value = e.target.value;
                            const parsedValue =
                              value === "" ? "" : parseFloat(value) || 0;
                            handleItemUpdate(item.id, "rate", parsedValue);
                          }}
                          min={0}
                          step="0.01"
                          className="w-24 h-9 text-center font-mono"
                          placeholder="0.00"
                        />
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="text-right">
                        <span className="font-semibold text-green-600 font-mono">
                          ₹{item.amount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setItemToDelete(item)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}

              {/* Grand Total Row */}
              {procurementItems.length > 0 && (
                <TableRow className="font-bold bg-muted">
                  <TableCell colSpan={8} className="text-right">
                    Total Procurement Amount
                  </TableCell>
                  <TableCell className="text-right bg-yellow-50">
                    <span className="text-lg font-bold font-mono">
                      ₹{calculateTotal().toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary Statistics */}
        {/* {procurementItems.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Total Items
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {procurementItems.length}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Total Original Qty
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {procurementItems.reduce(
                        (sum, item) => sum + item.originalQuantity,
                        0
                      )}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500/30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Total Remaining
                    </p>
                    <p className="text-2xl font-bold mt-1 text-orange-600">
                      {procurementItems.reduce(
                        (sum, item) => sum + item.remainingQuantity,
                        0
                      )}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500/30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Procurement Value
                    </p>
                    <p className="text-2xl font-bold mt-1 text-green-600">
                      ₹{calculateTotal().toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-green-500/30" />
                </div>
              </CardContent>
            </Card>
          </div>
        )} */}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={() => setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item from Procurement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>"{itemToDelete?.name}"</strong> from
              this procurement? This will not affect the original requisition.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ItemAdjustmentTable;
