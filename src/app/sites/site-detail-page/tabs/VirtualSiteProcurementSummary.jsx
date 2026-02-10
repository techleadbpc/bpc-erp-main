import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Package, AlertTriangle, Package2 } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/services/api/api-service";
import { Spinner } from "@/components/ui/loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function VirtualSiteProcurementSummary() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchVirtualSiteProcurementSummary();
  }, []);

  const fetchVirtualSiteProcurementSummary = async () => {
    try {
      const res = await api.get(`/sites/virtual-site/procurement-summary`);
      setSummary(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch virtual site procurement summary:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No virtual site found or no procurement data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total IN Items */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total IN Items</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.summary?.totalIn || 0}</div>
            <p className="text-xs text-muted-foreground">Items procured</p>
          </CardContent>
        </Card>

        {/* Total OUT Items */}
        <Card className="border-l-4 border-l-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total OUT Items</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.summary?.totalOut || 0}</div>
            <p className="text-xs text-muted-foreground">Items distributed</p>
          </CardContent>
        </Card>

        {/* Active Procurements */}
        <Card className="border-l-4 border-l-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Procurements</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.summary?.activeProcurements || 0}</div>
            <p className="text-xs text-muted-foreground">Procurements in process</p>
          </CardContent>
        </Card>
      </div>

      {/* Procurement Movement Details */}
      <Card>
        <CardHeader>
          <CardTitle>Procurement Movements</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.procurementMovements && summary.procurementMovements.length > 0 ? (
            <div className="space-y-4">
              {summary.procurementMovements.map((procurement, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold">Procurement ID: {procurement.procurementId}</h3>
                    <div className="flex gap-4">
                      <div className="text-sm">
                        <span className="text-green-600 font-medium">IN: {procurement.totalIn}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-red-600 font-medium">OUT: {procurement.totalOut}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {procurement.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex justify-between py-1 border-b border-gray-100 last:border-0 last:pb-0">
                        <span>{item.item?.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={item.type === 'IN' ? 'default' : 'destructive'}>
                            {item.type}
                          </Badge>
                          <span className="font-medium">{item.change}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No procurement movements found for the virtual site.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
