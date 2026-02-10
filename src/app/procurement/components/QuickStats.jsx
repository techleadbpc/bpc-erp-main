import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Package, Receipt } from "lucide-react";

const QuickStats = ({ procurement, invoices }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Total Amount
              </p>
              <p className="text-2xl font-bold text-blue-900">
                ₹
                {parseFloat(
                  procurement.totalAmount
                ).toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">
                Items
              </p>
              <p className="text-2xl font-bold text-green-900">
                {procurement.ProcurementItems.length}
              </p>
            </div>
            <Package className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">
                Invoices
              </p>
              <p className="text-2xl font-bold text-purple-900">
                {invoices.length}
              </p>
            </div>
            <Receipt className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStats;
