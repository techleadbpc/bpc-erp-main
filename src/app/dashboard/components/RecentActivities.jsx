
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecentActivitiesData } from "@/hooks/useDashboardData";
import {
    Activity,
    Clipboard,
    Building,
    Users,
    Calendar,
    Truck,
    ArrowUpRight,
    ArrowDownRight,
    AlertCircle,
    Wrench,
    DollarSign,
    Eye,
} from "lucide-react";
import { useNavigate } from "react-router";
import { formatDate, formatCurrency, getStatusColor } from "../utils";

export function RecentActivities({ filters, activeTab, setActiveTab }) {
    const navigate = useNavigate();
    const { data: recentActivities, isLoading, isError, error } = useRecentActivitiesData(filters);

    if (isLoading) {
        return <Skeleton className="h-[400px] w-full rounded-xl" />;
    }

    if (isError) {
        return (
            <Card>
                <CardContent className="p-6 text-red-500">
                    Error loading activities: {error?.message}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="sticky top-0 z-10 bg-white dark:bg-gray-800 rounded-t-lg border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-gray-500" />
                        <CardTitle className="text-lg font-semibold">
                            Recent Activities
                        </CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary"
                        onClick={() => {
                            if (activeTab === "requisitions") {
                                navigate("/requisitions");
                            } else if (activeTab === "transfers") {
                                navigate("/machine-transfer");
                            } else if (activeTab === "issues") {
                                navigate("/issues");
                            } else if (activeTab === "maintenance") {
                                navigate("/machine");
                            }
                        }}
                    >
                        View All
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-2">
                <Tabs
                    defaultValue="requisitions"
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value)}
                >
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="requisitions">Requisitions</TabsTrigger>
                        <TabsTrigger value="transfers">Transfers</TabsTrigger>
                        <TabsTrigger value="issues">Issues</TabsTrigger>
                        <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                    </TabsList>

                    {/* Requisitions Tab */}
                    <TabsContent value="requisitions" className="mt-0">
                        {recentActivities?.recentRequisitions?.length > 0 ? (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {recentActivities?.recentRequisitions.map((req) => (
                                    <div
                                        key={req.id}
                                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/50 mt-0.5">
                                                    <Clipboard className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                                                </div>
                                                <div className="min-w-0 space-y-1">
                                                    <div className="flex items-baseline gap-2">
                                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                                            {req.requisitionNo}
                                                        </h4>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                                                            {req.requestedFor}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <Building className="w-3 h-3 text-gray-400" />
                                                            <span className="text-gray-500 dark:text-gray-400 ">
                                                                {req.requestingSite?.name || "Unknown site"}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-1">
                                                            <Users className="w-3 h-3 text-gray-400" />
                                                            <span className="text-gray-500 dark:text-gray-400">
                                                                {req.preparedBy?.name || "Unknown user"}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3 text-gray-400" />
                                                            <span className="text-gray-500 dark:text-gray-400">
                                                                Due: {formatDate(req.dueDate)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs capitalize"
                                                        >
                                                            {req.chargeType}
                                                        </Badge>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs capitalize"
                                                        >
                                                            {req.requestPriority}
                                                        </Badge>
                                                        <Badge className={getStatusColor(req.status)}>
                                                            {req.status
                                                                .replace(/([A-Z])/g, " $1")
                                                                .trim()}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="shrink-0 text-gray-500 hover:text-primary"
                                                onClick={() => navigate(`/requisitions/${req.id}`)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                <Clipboard className="w-12 h-12 opacity-50" />
                                <p className="mt-2">No recent requisitions</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Transfers Tab */}
                    <TabsContent value="transfers" className="mt-0">
                        {recentActivities?.recentTransfers?.length > 0 ? (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {recentActivities?.recentTransfers.map((transfer) => (
                                    <div
                                        key={transfer.id}
                                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50 mt-0.5">
                                                    <Truck className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                                </div>
                                                <div className="min-w-0 space-y-1">
                                                    <div className="flex items-baseline gap-2">
                                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                                            {transfer.name}
                                                        </h4>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                                                            {transfer.machine?.machineName ||
                                                                "Unknown machine"}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <ArrowUpRight className="w-3 h-3 text-gray-400" />
                                                            <span className="text-gray-500 dark:text-gray-400">
                                                                {transfer.currentSite?.name || "Unknown site"}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-1">
                                                            <ArrowDownRight className="w-3 h-3 text-gray-400" />
                                                            <span className="text-gray-500 dark:text-gray-400">
                                                                {transfer.destinationSiteId
                                                                    ? `Site ${transfer.destinationSiteId}`
                                                                    : "Unknown destination"}
                                                            </span>
                                                        </div>

                                                        {transfer.transportDetails?.vehicleNumber && (
                                                            <div className="flex items-center gap-1">
                                                                <Truck className="w-3 h-3 text-gray-400" />
                                                                <span className="text-gray-500 dark:text-gray-400">
                                                                    {transfer.transportDetails.vehicleNumber}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs capitalize"
                                                        >
                                                            {transfer.requestType}
                                                        </Badge>
                                                        <Badge className={getStatusColor(transfer.status)}>
                                                            {transfer.status}
                                                        </Badge>
                                                        {transfer.dispatchedAt && (
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {formatDate(transfer.dispatchedAt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="shrink-0 text-gray-500 hover:text-primary"
                                                onClick={() =>
                                                    navigate(`/machine-transfer/${transfer.id}`)
                                                }
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                <Truck className="w-12 h-12 opacity-50" />
                                <p className="mt-2">No recent transfers</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Issues Tab */}
                    <TabsContent value="issues" className="mt-0">
                        {recentActivities?.recentIssues?.length > 0 ? (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {recentActivities?.recentIssues.map((issue) => (
                                    <div
                                        key={issue.id}
                                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/50 mt-0.5">
                                                    <AlertCircle className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                                                </div>
                                                <div className="min-w-0 space-y-1">
                                                    <div className="flex items-baseline gap-2">
                                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                                            {issue.issueNumber}
                                                        </h4>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                                                            {issue.issueType}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <Building className="w-3 h-3 text-gray-400" />
                                                            <span className="text-gray-500 dark:text-gray-400">
                                                                {issue.fromSite?.name || "Unknown site"}
                                                            </span>
                                                        </div>

                                                        {issue.otherSiteId && (
                                                            <div className="flex items-center gap-1">
                                                                <Building className="w-3 h-3 text-gray-400" />
                                                                <span className="text-gray-500 dark:text-gray-400">
                                                                    To Site {issue.otherSiteId}
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3 text-gray-400" />
                                                            <span className="text-gray-500 dark:text-gray-400">
                                                                {formatDate(issue.issueDate)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                        <Badge className={getStatusColor(issue.status)}>
                                                            {issue.status}
                                                        </Badge>
                                                        {issue.approvedAt && (
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                Approved: {formatDate(issue.approvedAt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="shrink-0 text-gray-500 hover:text-primary"
                                                onClick={() => navigate(`/issues/${issue.id}`)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                <AlertCircle className="w-12 h-12 opacity-50" />
                                <p className="mt-2">No recent issues</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Maintenance Tab */}
                    <TabsContent value="maintenance" className="mt-0">
                        {recentActivities?.recentMaintenance?.length > 0 ? (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {recentActivities?.recentMaintenance.map((maint) => (
                                    <div
                                        key={maint.id}
                                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/50 mt-0.5">
                                                    <Wrench className="w-4 h-4 text-green-500 dark:text-green-400" />
                                                </div>
                                                <div className="min-w-0 space-y-1">
                                                    <div className="flex items-baseline gap-2">
                                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                                            {maint.machine?.machineName || "Unknown machine"}
                                                        </h4>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                                                            {maint.type.replace(/_/g, " ")}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <Building className="w-3 h-3 text-gray-400" />
                                                            <span className="text-gray-500 dark:text-gray-400">
                                                                {maint.machine?.siteId
                                                                    ? `Site ${maint.machine.siteId}`
                                                                    : "Unknown site"}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-1">
                                                            <DollarSign className="w-3 h-3 text-gray-400" />
                                                            <span className="text-gray-500 dark:text-gray-400">
                                                                {formatCurrency(maint.cost)}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3 text-gray-400" />
                                                            <span className="text-gray-500 dark:text-gray-400">
                                                                {formatDate(maint.date)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                        <Badge className={getStatusColor(maint.status)}>
                                                            {maint.status}
                                                        </Badge>
                                                        {maint.title && (
                                                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                {maint.title}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="shrink-0 text-gray-500 hover:text-primary"
                                                onClick={() => console.log(maint)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                <Wrench className="w-12 h-12 opacity-50" />
                                <p className="mt-2">No recent maintenance</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
