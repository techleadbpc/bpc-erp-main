
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useInventoryAlertsData } from "@/hooks/useDashboardData";
import {
    Package,
    AlertTriangle,
} from "lucide-react";

export function InventoryAlerts({ filters }) {
    const { data: inventoryAlerts, isLoading, isError, error } = useInventoryAlertsData(filters);

    if (isLoading) {
        return <Skeleton className="h-[400px] w-full rounded-xl" />;
    }

    if (isError) {
        return (
            <Card>
                <CardContent className="p-6 text-red-500">
                    Error loading inventory alerts: {error?.message}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="sticky top-0 z-10 bg-white dark:bg-gray-800 rounded-t-lg border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-gray-500" />
                        <CardTitle className="text-lg font-semibold">
                            Inventory Alerts
                        </CardTitle>
                    </div>
                    <Badge variant="destructive">{inventoryAlerts?.length}</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {inventoryAlerts?.length > 0 ? (
                    <div className="relative">
                        {/* Scroll container with enhanced styling */}
                        <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                            <div className="divide-y divide-orange-100 dark:divide-orange-900/20">
                                {inventoryAlerts.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="p-4 hover:bg-orange-50/50 dark:hover:bg-orange-900/30 transition-colors"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div
                                                    className={`p-2 rounded-full ${item.status === "Out of Stock"
                                                            ? "bg-red-100 dark:bg-red-900/50"
                                                            : "bg-orange-100 dark:bg-orange-900/50"
                                                        }`}
                                                >
                                                    <Package
                                                        className={`w-4 h-4 ${item.status === "Out of Stock"
                                                                ? "text-red-500 dark:text-red-400"
                                                                : "text-orange-500 dark:text-orange-400"
                                                            }`}
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                                        {item.Item.name}
                                                    </h4>
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                        <span
                                                            className={`text-sm ${item.status === "Out of Stock"
                                                                    ? "text-red-600 dark:text-red-400"
                                                                    : "text-orange-600 dark:text-orange-400"
                                                                }`}
                                                        >
                                                            Stock: {item.quantity} {item.Item.Unit.shortName}
                                                        </span>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            Min Level: {item.minimumLevel}{" "}
                                                            {item.Item.Unit.shortName}
                                                        </span>
                                                        <span
                                                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.status === "Out of Stock"
                                                                    ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
                                                                    : "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300"
                                                                }`}
                                                        >
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            Site: {item.Site.code}
                                                        </span>
                                                        {item.Item.partNumber && (
                                                            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                                Part: {item.Item.partNumber}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                <AlertTriangle
                                                    className={`w-5 h-5 shrink-0 ${item.status === "Out of Stock"
                                                            ? "text-red-500"
                                                            : "text-orange-500"
                                                        }`}
                                                />
                                                <span className="text-xs text-gray-500 dark:text-gray-400 text-right max-w-[120px] truncate">
                                                    {item.Site.name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Scroll indicators */}
                        {inventoryAlerts.length > 5 && (
                            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none" />
                        )}

                        {/* Item counter */}
                        <div className="absolute top-2 right-2 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 text-xs px-2 py-1 rounded-full">
                            {inventoryAlerts.length} alert
                            {inventoryAlerts.length !== 1 ? "s" : ""}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                        <Package className="w-12 h-12 opacity-50" />
                        <p className="mt-2">No inventory alerts</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
