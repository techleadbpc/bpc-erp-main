import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Package, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/services/api/api-service";
import { Spinner } from "@/components/ui/loader";

export default function VirtualSiteSummaryCards({ siteId }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [discrepancies, setDiscrepancies] = useState([]);

  useEffect(() => {
    fetchSummaryStats();
    fetchDiscrepancies();
  }, [siteId]);

  const fetchSummaryStats = async () => {
    try {
      const res = await api.get(`/sites/${siteId}/summary-stats`);
      setStats(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch summary stats:", error);
      setLoading(false);
    }
  };

  const fetchDiscrepancies = async () => {
    try {
      const res = await api.get(`/sites/${siteId}/discrepancy-report`);
      setDiscrepancies(res.data);
    } catch (error) {
      console.error("Failed to fetch discrepancies:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total IN Card */}
      <Card className="border-l-4 border-l-green-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total IN Items</CardTitle>
          <TrendingDown className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalIn || 0}</div>
          <p className="text-xs text-muted-foreground">
            {stats?.inTransactionCount || 0} transactions
          </p>
        </CardContent>
      </Card>

      {/* Total OUT Card */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total OUT Items</CardTitle>
          <TrendingUp className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalOut || 0}</div>
          <p className="text-xs text-muted-foreground">
            {stats?.outTransactionCount || 0} transactions
          </p>
        </CardContent>
      </Card>

      {/* Current Inventory Card */}
      <Card className="border-l-4 border-l-blue-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Inventory</CardTitle>
          <Package className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.currentInventory || 0}</div>
          <p className="text-xs text-muted-foreground">
            Net movement: {stats?.netMovement || 0}
          </p>
        </CardContent>
      </Card>

      {/* Discrepancies Card */}
      <Card className="border-l-4 border-l-yellow-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Discrepancies</CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-50" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{discrepancies?.length || 0}</div>
          <p className="text-xs text-muted-foreground">
            Items with mismatched quantities
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
