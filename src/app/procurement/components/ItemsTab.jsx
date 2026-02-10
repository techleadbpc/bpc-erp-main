import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, CheckCircle } from "lucide-react";

const ItemsTab = ({ procurement }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Items
          <Badge variant="secondary" className="ml-auto">
            {procurement.ProcurementItems.length} Item(s)
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] text-center">SI No</TableHead>
                  <TableHead>Item Description</TableHead>
                  <TableHead className="text-center">Unit</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-center">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {procurement.ProcurementItems.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-center">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {item.RequisitionItem.Item?.name}
                        </p>
                        {item.RequisitionItem.Item.shortName && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {item.RequisitionItem.Item.shortName}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        {item.RequisitionItem.Item.Unit.shortName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <Badge variant="secondary">
                          {item.receivedQuantity || 0} / {item.quantity}
                        </Badge>
                        <span className="text-xs text-muted-foreground mt-1">
                          Received
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      ₹{parseFloat(item.rate).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      ₹{parseFloat(item.amount).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Grand Total Row */}
                <TableRow className="font-bold bg-muted">
                  <TableCell colSpan={5} className="text-right">
                    Grand Total
                  </TableCell>
                  <TableCell className="text-right bg-yellow-50">
                    ₹{parseFloat(procurement.totalAmount).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Summary Section */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-muted-foreground">
                Total Items: {procurement.ProcurementItems.length}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">
                Total Procurement Value
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{parseFloat(procurement.totalAmount).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemsTab;
