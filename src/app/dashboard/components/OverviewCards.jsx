
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOverviewData } from "@/hooks/useDashboardData";
import {
    AlertTriangle,
    Building,
    Clipboard,
    Clock,
    Package,
    TrendingUp,
    Truck
} from "lucide-react";

export function OverviewCards({ filters }) {
    const { data: overview, isLoading, isError, error } = useOverviewData(filters);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (isError) {
        return <div className="text-red-500">Error loading overview: {error?.message}</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Total Machines
                        </CardTitle>
                        <Truck className="w-5 h-5 text-blue-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {overview?.totalMachines || 0}
                    </div>
                    <div className="flex items-center mt-2">
                        <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="text-sm text-blue-500">
                            +2.1% from last month
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Active Sites
                        </CardTitle>
                        <Building className="w-5 h-5 text-green-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {overview?.totalSites || 0}
                    </div>
                    <div className="flex items-center mt-2">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-500">
                            +1 new site this month
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-800">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Low Stock Items
                        </CardTitle>
                        <Package className="w-5 h-5 text-orange-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {overview?.lowStockItems || 0}
                    </div>
                    <div className="flex items-center mt-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500 mr-1" />
                        <span className="text-sm text-orange-500">
                            Requires attention
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Pending Requisitions
                        </CardTitle>
                        <Clipboard className="w-5 h-5 text-purple-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {overview?.pendingRequisitions || 0}
                    </div>
                    <div className="flex items-center mt-2">
                        <Clock className="w-4 h-4 text-purple-500 mr-1" />
                        <span className="text-sm text-purple-500">
                            Awaiting approval
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
