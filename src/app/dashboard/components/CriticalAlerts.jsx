
import {
    Badge,
} from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlertsData } from "@/hooks/useDashboardData";
import {
    AlertTriangle,
    Building,
    Calendar,
    CheckCircle,
    Clipboard,
    Eye,
    Wrench,
} from "lucide-react";
import { useNavigate } from "react-router";
import { formatDate } from "../utils";

export function CriticalAlerts({ filters }) {
    const navigate = useNavigate();
    const { data: alerts, isLoading, isError, error } = useAlertsData(filters);

    if (isLoading) {
        return <Skeleton className="h-[500px] w-full rounded-xl" />;
    }

    if (isError) {
        return (
            <Card className="border-red-200">
                <CardContent className="p-6 text-center text-red-500">
                    Error loading alerts: {error?.message}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="sticky top-0 z-10 bg-white dark:bg-gray-800 rounded-t-lg border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <CardTitle className="text-lg font-semibold">
                            Critical Alerts
                        </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="destructive">
                            {alerts?.certificateExpiries?.length || 0}
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-primary">
                            View All
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {alerts?.certificateExpiries?.length > 0 ? (
                    <div className="divide-y divide-red-100 dark:divide-red-900/20">
                        {alerts.certificateExpiries.map((machine) => {
                            // Calculate days until expiry for each certificate
                            const now = new Date();
                            const expiries = [
                                {
                                    type: "Pollution Cert.",
                                    date: machine.pollutionCertificateExpiry,
                                    daysLeft: Math.floor(
                                        (new Date(machine.pollutionCertificateExpiry) - now) /
                                        (1000 * 60 * 60 * 24)
                                    ),
                                },
                                {
                                    type: "Fitness Cert.",
                                    date: machine.fitnessCertificateExpiry,
                                    daysLeft: Math.floor(
                                        (new Date(machine.fitnessCertificateExpiry) - now) /
                                        (1000 * 60 * 60 * 24)
                                    ),
                                },
                                {
                                    type: "Insurance",
                                    date: machine.insuranceExpiry,
                                    daysLeft: Math.floor(
                                        (new Date(machine.insuranceExpiry) - now) /
                                        (1000 * 60 * 60 * 24)
                                    ),
                                },
                                {
                                    type: "Permit",
                                    date: machine.permitExpiryDate,
                                    daysLeft: Math.floor(
                                        (new Date(machine.permitExpiryDate) - now) /
                                        (1000 * 60 * 60 * 24)
                                    ),
                                },
                                {
                                    type: "Vehicle Tax",
                                    date: machine.motorVehicleTaxDue,
                                    daysLeft: Math.floor(
                                        (new Date(machine.motorVehicleTaxDue) - now) /
                                        (1000 * 60 * 60 * 24)
                                    ),
                                },
                            ]
                                .filter((e) => e.date)
                                .sort((a, b) => a.daysLeft - b.daysLeft);

                            const nearestExpiry = expiries[0];

                            return (
                                <div
                                    key={machine.id}
                                    className="p-4 hover:bg-red-50/50 dark:hover:bg-red-900/30 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50 mt-0.5">
                                                <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" />
                                            </div>
                                            <div className="min-w-0 space-y-1">
                                                <div className="flex items-baseline gap-2">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {machine.machineName}
                                                    </h4>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                                                        {machine.registrationNumber || machine.erpCode}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <Building className="w-3 h-3 text-gray-400" />
                                                        <span className="text-gray-500 dark:text-gray-400">
                                                            {machine.site?.name || `Site ${machine.siteId}`}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 text-gray-400" />
                                                        <span
                                                            className={
                                                                nearestExpiry.daysLeft <= 7
                                                                    ? "text-red-500 font-medium"
                                                                    : "text-gray-500 dark:text-gray-400"
                                                            }
                                                        >
                                                            {nearestExpiry.type} expires in{" "}
                                                            {nearestExpiry.daysLeft} days
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs capitalize"
                                                    >
                                                        {machine.status}
                                                    </Badge>
                                                    {machine.model && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {machine.make} {machine.model}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="shrink-0 text-gray-500 hover:text-primary"
                                            onClick={() => {
                                                navigate(`/machine/${machine.id}`);
                                            }}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Additional expiry details */}
                                    <div className="mt-3 pl-11">
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                            {expiries.map((cert) => (
                                                <div
                                                    key={`${machine.id}-${cert.type}`}
                                                    className="text-xs p-2 rounded border border-gray-200 dark:border-gray-700"
                                                >
                                                    <div className="font-medium">{cert.type}</div>
                                                    <div
                                                        className={
                                                            cert.daysLeft <= 30
                                                                ? "text-red-500"
                                                                : "text-gray-500 dark:text-gray-400"
                                                        }
                                                    >
                                                        {formatDate(cert.date)}
                                                    </div>
                                                    <div
                                                        className={
                                                            cert.daysLeft <= 30
                                                                ? "text-red-500 font-medium"
                                                                : "text-gray-500 dark:text-gray-400"
                                                        }
                                                    >
                                                        {cert.daysLeft > 0
                                                            ? `${cert.daysLeft}d left`
                                                            : "Expired"}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                        <CheckCircle className="w-12 h-12 text-green-500 opacity-50" />
                        <p className="mt-2">No critical alerts</p>
                    </div>
                )}
            </CardContent>

            {/* Additional alert summaries */}
            {(alerts?.pendingApprovals > 0 || alerts?.maintenanceOverdue > 0) && (
                <CardFooter className="bg-gray-50 dark:bg-gray-800 border-t rounded-b-lg">
                    <div className="flex flex-wrap items-center mt-4 gap-4">
                        {alerts.pendingApprovals > 0 && (
                            <div className="flex items-center gap-2">
                                <Clipboard className="w-4 h-4 text-amber-500" />
                                <span className="text-sm">
                                    <span className="font-medium">{alerts.pendingApprovals}</span>{" "}
                                    pending approvals
                                </span>
                            </div>
                        )}
                        {alerts.maintenanceOverdue > 0 && (
                            <div className="flex items-center gap-2">
                                <Wrench className="w-4 h-4 text-red-500" />
                                <span className="text-sm">
                                    <span className="font-medium">
                                        {alerts.maintenanceOverdue}
                                    </span>{" "}
                                    overdue maintenance
                                </span>
                            </div>
                        )}
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
