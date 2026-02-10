"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/loader";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSiteDashboardData } from "@/hooks/useSiteDashboardData";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building,
  Calendar,
  CheckCircle,
  Clipboard,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  Filter,
  Package,
  RefreshCw,
  TrendingUp,
  Truck,
  Users,
  Wrench,
  XCircle,
  MapPin,
  Phone,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export function SiteDashboard() {
  const [timeframe, setTimeframe] = useState("month");
  const [activeTab, setActiveTab] = useState("requisitions");
  const [filters] = useState({
    months: 12,
    days: 30,
    limit: 20,
  });

  const navigate = useNavigate();

  const { data, isLoading, isError, errors, refetchAll } =
    useSiteDashboardData(filters);

  const {
    overview,
    requisitions,
    materialIssues,
    transfers,
    inventoryAlerts,
    machineAlerts,
    machineStatus,
    inventoryStatus,
    maintenanceDue,
    expenses,
    siteInfo,
  } = data;

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "in use":
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "pending":
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "low stock":
        return "bg-orange-100 text-orange-800";
      case "out of stock":
      case "maintenance":
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div className="text-center">
          <h2 className="text-xl font-semibold">Error Loading Dashboard</h2>
          <p className="text-gray-600 mt-2">
            {errors?.message || "Failed to load dashboard data"}
          </p>
          <Button onClick={refetchAll} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const totalAlerts =
    (inventoryAlerts?.lowStock?.length || 0) +
    (inventoryAlerts?.outOfStock?.length || 0) +
    (machineAlerts?.certificateExpiries?.length || 0) +
    (machineAlerts?.insuranceExpiries?.length || 0) +
    (machineAlerts?.maintenanceOverdue?.length || 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Site Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening at your site.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refetchAll} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Site Info Card */}
      {siteInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="w-5 h-5 mr-2" />
              {siteInfo.name}
              <Badge className="ml-2">{siteInfo.code}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{siteInfo.address}</span>
              </div>
              {siteInfo.mobileNumber && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{siteInfo.mobileNumber}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(siteInfo.status)}>
                  {siteInfo.status}
                </Badge>
                <Badge variant="outline">{siteInfo.type}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Banner */}
      {totalAlerts > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">
                  {totalAlerts} Alert{totalAlerts > 1 ? "s" : ""} Need Your
                  Attention
                </p>
                <p className="text-sm text-orange-700">
                  Review inventory levels, machine certificates, and maintenance
                  schedules.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("alerts")}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              View Alerts
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Machines
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.machines?.totalMachines || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {overview?.machines?.activeMachines || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inventory Items
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.inventory?.totalItems || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(overview?.inventory?.totalValue || 0)} total value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Site Personnel
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.personnel?.totalUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {overview?.personnel?.activeUsers || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(requisitions?.pendingCount || 0) +
                (materialIssues?.pendingCount || 0) +
                (transfers?.pendingCount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all activities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="requisitions">Requisitions</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="issues">Material Issues</TabsTrigger>
          <TabsTrigger value="machines">Machines</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Requisitions Tab */}
        <TabsContent value="requisitions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Requisition Status</CardTitle>
              </CardHeader>
              <CardContent>
                {requisitions?.statusBreakdown?.length > 0 ? (
                  <div className="space-y-2">
                    {requisitions.statusBreakdown.map((status, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <Badge className={getStatusColor(status.status)}>
                          {status.status}
                        </Badge>
                        <span className="font-semibold">{status.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No requisition data</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Requisitions</CardTitle>
              </CardHeader>
              <CardContent>
                {requisitions?.recentRequisitions?.length > 0 ? (
                  <div className="space-y-3">
                    {requisitions.recentRequisitions.slice(0, 5).map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                      >
                        <div>
                          <p className="font-medium">{req.requisitionNo}</p>
                          <p className="text-sm text-muted-foreground">
                            {req.requestedFor} • {req.preparedBy?.name}
                          </p>
                        </div>
                        <Badge className={getStatusColor(req.status)}>
                          {req.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No recent requisitions
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transfers Tab */}
        <TabsContent value="transfers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Transfer Status</CardTitle>
              </CardHeader>
              <CardContent>
                {transfers?.statusBreakdown?.length > 0 ? (
                  <div className="space-y-2">
                    {transfers.statusBreakdown.map((status, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <Badge className={getStatusColor(status.status)}>
                          {status.status}
                        </Badge>
                        <span className="font-semibold">{status.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No transfer data</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transfers</CardTitle>
              </CardHeader>
              <CardContent>
                {transfers?.recentTransfers?.length > 0 ? (
                  <div className="space-y-3">
                    {transfers.recentTransfers.slice(0, 5).map((transfer) => (
                      <div
                        key={transfer.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                      >
                        <div>
                          <p className="font-medium">
                            {transfer.machine?.machineName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            To: {transfer.destinationSite?.name}
                          </p>
                        </div>
                        <Badge className={getStatusColor(transfer.status)}>
                          {transfer.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recent transfers</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Material Issues Tab */}
        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Material Issues</CardTitle>
              <CardDescription>Items issued from your site</CardDescription>
            </CardHeader>
            <CardContent>
              {materialIssues?.recentIssues?.length > 0 ? (
                <div className="space-y-3">
                  {materialIssues.recentIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{issue.issueNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {issue.issueType} • {formatDate(issue.issueDate)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          To: {issue.toSite?.name}
                        </p>
                      </div>
                      <Badge className={getStatusColor(issue.status)}>
                        {issue.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No recent material issues
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Machines Tab */}
        <TabsContent value="machines" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Machine Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {machineStatus?.statusBreakdown?.length > 0 ? (
                  <div className="space-y-3">
                    {machineStatus.statusBreakdown.map((status, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(status.status)}>
                            {status.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {status.count}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No machine data</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {machineStatus?.categoryWiseBreakdown?.length > 0 ? (
                  <div className="space-y-2">
                    {machineStatus.categoryWiseBreakdown
                      .slice(0, 5)
                      .map((category, index) => (
                        <div key={index} className="text-sm">
                          <div className="flex justify-between items-center mb-1">
                            <span>
                              {category.machineCategory?.name ||
                                `Category ${category.machineCategoryId}`}
                            </span>
                            <span className="font-medium">
                              {category.count}
                            </span>
                          </div>
                          <Badge
                            className={getStatusColor(category.status)}
                            size="sm"
                          >
                            {category.status}
                          </Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No category data</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
              </CardHeader>
              <CardContent>
                {inventoryStatus?.statusBreakdown?.length > 0 ? (
                  <div className="space-y-3">
                    {inventoryStatus.statusBreakdown.map((status, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <Badge className={getStatusColor(status.status)}>
                          {status.status}
                        </Badge>
                        <div className="text-right">
                          <div className="font-bold">{status.count} items</div>
                          <div className="text-sm text-muted-foreground">
                            {status.totalQuantity} total qty
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No inventory data</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Low Stock Items</CardTitle>
              </CardHeader>
              <CardContent>
                {inventoryAlerts?.lowStock?.length > 0 ? (
                  <div className="space-y-2">
                    {inventoryAlerts.lowStock.slice(0, 5).map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-orange-50 rounded"
                      >
                        <div>
                          <p className="font-medium">{item.Item?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Current: {item.quantity}{" "}
                            {item.Item?.Unit?.shortName}
                          </p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-800">
                          Low Stock
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No low stock items</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4">
            {/* Inventory Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Inventory Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventoryAlerts?.outOfStock?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-700 mb-2">
                        Out of Stock
                      </h4>
                      <div className="space-y-2">
                        {inventoryAlerts.outOfStock.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 bg-red-50 rounded"
                          >
                            <span>{item.Item?.name}</span>
                            <Badge className="bg-red-100 text-red-800">
                              Out of Stock
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {inventoryAlerts?.lowStock?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-orange-700 mb-2">
                        Low Stock
                      </h4>
                      <div className="space-y-2">
                        {inventoryAlerts.lowStock.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 bg-orange-50 rounded"
                          >
                            <div>
                              <span>{item.Item?.name}</span>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} {item.Item?.Unit?.shortName}{" "}
                                remaining
                              </p>
                            </div>
                            <Badge className="bg-orange-100 text-orange-800">
                              Low Stock
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!inventoryAlerts?.outOfStock?.length &&
                    !inventoryAlerts?.lowStock?.length && (
                      <p className="text-muted-foreground">
                        No inventory alerts
                      </p>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Machine Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="w-5 h-5 mr-2" />
                  Machine Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {machineAlerts?.certificateExpiries?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-700 mb-2">
                        Certificate Expiries
                      </h4>
                      <div className="space-y-2">
                        {machineAlerts.certificateExpiries.map(
                          (machine, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-2 bg-red-50 rounded"
                            >
                              <div>
                                <span className="font-medium">
                                  {machine.machineName}
                                </span>
                                <p className="text-sm text-muted-foreground">
                                  {machine.registrationNumber}
                                </p>
                              </div>
                              <div className="text-right text-sm">
                                {machine.fitnessCertificateExpiry && (
                                  <p>
                                    Fitness:{" "}
                                    {formatDate(
                                      machine.fitnessCertificateExpiry
                                    )}
                                  </p>
                                )}
                                {machine.pollutionCertificateExpiry && (
                                  <p>
                                    Pollution:{" "}
                                    {formatDate(
                                      machine.pollutionCertificateExpiry
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {machineAlerts?.maintenanceOverdue?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-700 mb-2">
                        Maintenance Overdue
                      </h4>
                      <div className="space-y-2">
                        {machineAlerts.maintenanceOverdue.map(
                          (maint, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-2 bg-red-50 rounded"
                            >
                              <div>
                                <span className="font-medium">
                                  {maint.machine?.machineName}
                                </span>
                                <p className="text-sm text-muted-foreground">
                                  Due: {formatDate(maint.date)}
                                </p>
                              </div>
                              <Badge className="bg-red-100 text-red-800">
                                Overdue
                              </Badge>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {!machineAlerts?.certificateExpiries?.length &&
                    !machineAlerts?.maintenanceOverdue?.length && (
                      <p className="text-muted-foreground">No machine alerts</p>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Maintenance Due & Expenses */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            {maintenanceDue?.length > 0 ? (
              <div className="space-y-3">
                {maintenanceDue.slice(0, 5).map((maint, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium">
                        {maint.machine?.machineName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {maint.machine?.registrationNumber}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium">{formatDate(maint.date)}</p>
                      <Badge className={getStatusColor(maint.status)}>
                        {maint.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No upcoming maintenance</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {expenses &&
            (expenses.procurementExpenses?.length > 0 ||
              expenses.maintenanceExpenses?.length > 0) ? (
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Procurement</h4>
                  {expenses.procurementExpenses
                    ?.slice(0, 3)
                    .map((expense, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{formatDate(expense.month)}</span>
                        <span className="font-medium">
                          {formatCurrency(expense.totalAmount)}
                        </span>
                      </div>
                    ))}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Maintenance</h4>
                  {expenses.maintenanceExpenses
                    ?.slice(0, 3)
                    .map((expense, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{formatDate(expense.month)}</span>
                        <span className="font-medium">
                          {formatCurrency(expense.totalCost)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No expense data</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
