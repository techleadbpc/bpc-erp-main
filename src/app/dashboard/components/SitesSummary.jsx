
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSitesSummaryData } from "@/hooks/useDashboardData";
import {
    Building,
    Truck,
    Users,
    Eye,
} from "lucide-react";
import { useNavigate } from "react-router";

export function SitesSummary({ filters }) {
    const navigate = useNavigate();
    const { data: sitesSummary, isLoading, isError, error } = useSitesSummaryData(filters);

    if (isLoading) {
        return <Skeleton className="h-[400px] w-full rounded-xl" />;
    }

    if (isError) {
        return (
            <Card>
                <CardContent className="p-6 text-red-500">
                    Error loading sites summary: {error?.message}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="sticky top-0 z-10 bg-white dark:bg-gray-800 rounded-t-lg border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Building className="w-5 h-5 text-gray-500" />
                        <CardTitle className="text-lg font-semibold">
                            Sites Summary
                        </CardTitle>
                    </div>
                    <Badge variant="outline" className="px-2 py-1 text-xs">
                        {sitesSummary?.length} sites
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {sitesSummary?.length > 0 ? (
                    <div className="max-h-[400px] overflow-y-auto">
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {sitesSummary?.map((site) => (
                                <div
                                    key={site.id}
                                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50 mt-0.5">
                                                <Building className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                            </div>
                                            <div className="min-w-0 space-y-1">
                                                <div className="flex items-baseline gap-2">
                                                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                                        {site.name}
                                                    </h4>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                                                        {site.code}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <Truck className="w-3 h-3 text-gray-400" />
                                                        <span
                                                            className={
                                                                site.activeMachines === 0
                                                                    ? "text-red-500"
                                                                    : "text-gray-500 dark:text-gray-400"
                                                            }
                                                        >
                                                            {site.activeMachines}/{site.totalMachines}{" "}
                                                            machines active
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <Users className="w-3 h-3 text-gray-400" />
                                                        <span className="text-gray-500 dark:text-gray-400">
                                                            {site.totalUsers} user
                                                            {site.totalUsers !== 1 ? "s" : ""}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs capitalize"
                                                    >
                                                        {site.department}
                                                    </Badge>
                                                    <Badge
                                                        className={
                                                            site.status === "active"
                                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                        }
                                                    >
                                                        {site.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="shrink-0 text-gray-500 hover:text-primary"
                                            onClick={() => navigate(`sites/${site.id}`)}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                        <Building className="w-12 h-12 opacity-50" />
                        <p className="mt-2">No sites data available</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
