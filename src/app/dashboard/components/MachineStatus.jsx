
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useMachineStatusData, useOverviewData } from "@/hooks/useDashboardData";
import {
    Activity,
    Building,
    Truck,
} from "lucide-react";
import { useNavigate } from "react-router";
import { getStatusColor, getStatusIcon } from "../utils";

export function MachineStatus({ filters }) {
    const navigate = useNavigate();
    const { data: machineStatus, isLoading: isStatusLoading, isError: isStatusError, error: statusError } = useMachineStatusData(filters);
    const { data: overview, isLoading: isOverviewLoading } = useOverviewData(filters);

    const isLoading = isStatusLoading || isOverviewLoading;

    if (isLoading) {
        return <Skeleton className="h-[400px] w-full rounded-xl" />;
    }

    if (isStatusError) {
        return (
            <Card>
                <CardContent className="p-6 text-red-500">
                    Error loading machine status: {statusError?.message}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-gray-500" />
                        <CardTitle className="text-lg font-semibold">
                            Machine Status Overview
                        </CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary"
                        onClick={() => navigate("/machine")}
                    >
                        View All
                    </Button>
                </div>
                <CardDescription>
                    Current operational status of all machines
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="status">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="status">By Status</TabsTrigger>
                        <TabsTrigger value="site">By Site</TabsTrigger>
                        <TabsTrigger value="category">By Category</TabsTrigger>
                    </TabsList>

                    {/* Status Breakdown Tab */}
                    <TabsContent value="status" className="mt-4">
                        <div className="space-y-4">
                            {machineStatus?.statusBreakdown?.map((status) => (
                                <div
                                    key={status.status}
                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                                >
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(status.status)}
                                        <span className="font-medium">{status.status}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge className={getStatusColor(status.status)}>
                                            {status.count}
                                        </Badge>
                                        <Progress
                                            value={
                                                (parseInt(status.count) / (overview?.totalMachines || 1)) * 100
                                            }
                                            className="w-32 h-2"
                                            indicatorColor={
                                                status.status === "In Use"
                                                    ? "bg-blue-500"
                                                    : status.status === "Idle"
                                                        ? "bg-green-500"
                                                        : "bg-yellow-500"
                                            }
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Site Breakdown Tab */}
                    <TabsContent value="site" className="mt-4">
                        <div className="space-y-3">
                            {machineStatus?.siteWiseBreakdown?.map((site) => (
                                <div
                                    key={`${site.siteId}-${site.count}`}
                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Building className="w-4 h-4 text-gray-500" />
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">
                                                {site.site?.name || `Site ${site.siteId}`}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Site ID: {site.siteId}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline">{site.count} machines</Badge>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Category Breakdown Tab */}
                    <TabsContent value="category" className="mt-4">
                        <div className="space-y-3">
                            {machineStatus?.categoryWiseBreakdown?.map((category) => (
                                <div
                                    key={`${category.machineCategoryId}-${category.count}`}
                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Truck className="w-4 h-4 text-gray-500" />
                                        <p className="font-medium truncate">
                                            {category.machineCategory?.name ||
                                                `Category ${category.machineCategoryId}`}
                                        </p>
                                    </div>
                                    <Badge variant="outline">{category.count} machines</Badge>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
