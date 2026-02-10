
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMaintenanceDueData } from "@/hooks/useDashboardData";
import {
    Wrench,
    Clock,
} from "lucide-react";
import { formatDate } from "../utils";

export function MaintenanceDue({ filters }) {
    const { data: maintenanceDue, isLoading, isError, error } = useMaintenanceDueData(filters);

    if (isLoading) {
        return <Skeleton className="h-[200px] w-full rounded-xl" />;
    }

    if (isError) {
        return (
            <Card>
                <CardContent className="p-6 text-red-500">
                    Error loading maintenance due: {error?.message}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-gray-500" />
                        <CardTitle className="text-lg font-semibold">
                            Maintenance Due
                        </CardTitle>
                    </div>
                    <Badge variant="destructive">{maintenanceDue?.length}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                {maintenanceDue?.length > 0 ? (
                    <div className="space-y-3">
                        {maintenanceDue?.map((maint) => (
                            <div
                                key={maint.machineId}
                                className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                            >
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        {maint.machineName}
                                    </h4>
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        Due: {formatDate(maint.nextDueDate)}
                                    </p>
                                </div>
                                <Clock className="w-5 h-5 text-red-500" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                        <Wrench className="w-12 h-12 opacity-50" />
                        <p className="mt-2">No maintenance due</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
