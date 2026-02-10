import PlacehoolderImage from "@/assets/images/placeholder-image.webp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/services/api/api-service";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Eye,
  FileText,
  Fuel,
  Info,
  MapPin,
  Package,
  Settings,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import MaintenanceSummaryCard from "@/app/maintenance-log/MaintenanceSummaryCard";

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Helper to check if a certificate is expired
const isExpired = (dateString) => {
  if (!dateString) return false;
  const expiryDate = new Date(dateString);
  const today = new Date();
  return expiryDate < today;
};

const isExpiringSoon = (dateString, days = 30) => {
  if (!dateString) return false;

  const expiryDate = new Date(dateString);
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  return expiryDate >= today && expiryDate <= futureDate;
};

export default function MachineryDetailPage() {
  // const { data } = machineryData

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState();
  const params = useParams();
  const navigate = useNavigate();
  // const { data } = siteData

  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "details";

  useEffect(() => {
    fetchMachineDetails(params.id);
  }, [params]);

  const fetchMachineDetails = async (mid) => {
    try {
      setLoading(true);
      const machineRes = await api.get(`/machinery/${mid}`);
      if (!machineRes.data) {
        throw new Error("Machine not found");
      }
      const statsRes = await api.get(`/maintanance/stats/${mid}`);
      const logEntries = await api.get(`/machinery/${mid}/log-entries`);
      const maintenanceLogsRes = await api.get(
        `/maintanance/logs/machine/${mid}`
      );
      const summaryRes = await api.get(`/maintanance/summary/${mid}`);
      setData({
        ...machineRes.data,
        logbookEntries: logEntries.data,
        maintenanceStats: statsRes.data,
        maintenanceLogs: maintenanceLogsRes.data,
        nextMaintenance: summaryRes.data?.nextMaintenance || null,
      });
      setLoading(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Certificate data for the documents tab
  const certificates = [
    {
      name: "Fitness Certificate",
      expiry: data?.fitnessCertificateExpiry,
      file: data?.fitnessCertificateFile,
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Pollution Certificate",
      expiry: data?.pollutionCertificateExpiry,
      file: data?.pollutionCertificateFile,
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Insurance",
      expiry: data?.insuranceExpiry,
      file: data?.insuranceFile,
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Permit",
      expiry: data?.permitExpiryDate,
      file: data?.permitFile,
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "National Permit",
      expiry: data?.nationalPermitExpiry,
      file: data?.nationalPermitFile,
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Motor Vehicle Tax",
      expiry: data?.motorVehicleTaxDue,
      file: data?.motorVehicleTaxFile,
      icon: <FileText className="h-5 w-5" />,
    },
  ];

  if (!loading && !data) {
    throw new Error(`Machine id "${params.id}" not found.`);
  }

  return (
    <div className="container mx-auto min-h-screen flex flex-col">
      {loading ? (
        <Spinner />
      ) : (
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  {data.machineName}
                </h1>
                <Badge
                  variant={data.status === "Active" ? "success" : "secondary"}
                  className="capitalize"
                >
                  {data.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>
                  {data.machineCode} • {data.make} {data.model}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {/* <Button variant="outline" size="sm">
                Edit
              </Button> */}
              <Button
                onClick={() => {
                  navigate(`/machine/${data.id}/logs`, {
                    state: { machineName: data?.machineName },
                  });
                }}
              >
                Servicing Log
              </Button>
            </div>
          </div>

          <div className="gap-6 mb-8">
            <div className="">
              <Tabs defaultValue={tab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="log-entries">Log Entries</TabsTrigger>
                  <TabsTrigger value="maintenance">Servicing</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">
                          Machine Information
                        </CardTitle>
                        <CardDescription>
                          Basic details about the machine
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Machine ID
                            </p>
                            <p className="font-medium">#{data.id}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              ERP Code
                            </p>
                            <p className="font-medium">{data.erpCode}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Registration No.
                            </p>
                            <p className="font-medium">
                              {data.registrationNumber}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Machine No.
                            </p>
                            <p className="font-medium">{data.machineNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Chassis No.
                            </p>
                            <p className="font-medium">{data.chassisNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Engine No.
                            </p>
                            <p className="font-medium">{data.engineNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Serial No.
                            </p>
                            <p className="font-medium">{data.serialNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Capacity
                            </p>
                            <p className="font-medium">{data.capacity}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Year of Manufacture
                            </p>
                            <p className="font-medium">{data.yom}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Purchase Date
                            </p>
                            <p className="font-medium">
                              {formatDate(data.purchaseDate)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                          <CardTitle className="text-xl">Ownership</CardTitle>
                          <CardDescription>
                            Ownership information
                          </CardDescription>
                        </div>
                        <User className="h-5 w-5 text-muted-foreground" />
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Owner Name
                            </p>
                            <p className="font-semibold">{data.ownerName}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Owner Type
                            </p>
                            <p className="font-medium">{data.ownerType}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Status
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant={
                                  data.isActive ? "success" : "destructive"
                                }
                              >
                                {data.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                          <CardTitle className="text-xl">Category</CardTitle>
                          <CardDescription>
                            Machine category information
                          </CardDescription>
                        </div>
                        <Settings className="h-5 w-5 text-muted-foreground" />
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Primary Category
                            </p>
                            <p className="font-medium">
                              {data.primaryCategory.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Machine Category
                            </p>
                            <p className="font-medium">
                              {data.machineCategory.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Machine Type
                            </p>
                            <p className="font-medium">
                              {data.machineCategory.machineType}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Used For
                            </p>
                            <p className="font-medium">
                              {data.machineCategory.useFor || "NA"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                          <CardTitle className="text-xl">Performance</CardTitle>
                          <CardDescription>
                            Machine performance metrics
                          </CardDescription>
                        </div>
                        <Info className="h-5 w-5 text-muted-foreground" />
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Average Base
                            </p>
                            <p className="font-medium">
                              {data.machineCategory.averageBase}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Standard Hours Run
                            </p>
                            <p className="font-medium">
                              {data.machineCategory.standardHrsRun} hours
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Remarks
                            </p>
                            <p className="font-medium">
                              {data.machineCategory.remarks || "NA"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Machine Image</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="relative overflow-hidden rounded-lg">
                          <img
                            src={data.machineImageFile || PlacehoolderImage}
                            alt={data.machineName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Timeline</CardTitle>
                        <CardDescription>Machine history</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">Created</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(data.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">Last Updated</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(data.updatedAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">Purchased</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(data.purchaseDate)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Location Card - Added to Details tab */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Site Location</CardTitle>
                      <CardDescription>
                        Current location of the machine
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 border rounded-lg">
                          <MapPin className="h-5 w-5 mt-1" />
                          <div>
                            <h3 className="font-medium">
                              {data?.site?.name} ({data?.site?.code})
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {data?.site?.address}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Site ID: #{data?.site?.id}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="documents" className="pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Documents & Certificates</CardTitle>
                      <CardDescription>
                        View and manage machine documents
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {certificates.map((cert, index) => (
                          <div
                            key={index}
                            className="flex items-start p-4 border rounded-lg"
                          >
                            <div className="mr-4 mt-1">{cert.icon}</div>
                            <div className="flex-1">
                              <h3 className="font-medium">{cert.name}</h3>
                              <p
                                className={`text-sm ${isExpired(cert.expiry)
                                    ? "text-destructive"
                                    : isExpiringSoon(cert.expiry)
                                      ? "text-yellow-400"
                                      : "text-green-400"
                                  }`}
                              >
                                Expires: {formatDate(cert.expiry)}
                                {isExpired(cert.expiry) && " (Expired)"}
                              </p>
                              <div className="mt-2">
                                <a
                                  href={cert.file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`text-sm ${cert.file
                                      ? "text-primary hover:underline"
                                      : "text-muted-foreground"
                                    }`}
                                >
                                  View Document
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="log-entries" className="pt-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Total Diesel Issue Card */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Total Diesel Issue
                            </p>
                            <p className="text-3xl font-bold text-orange-600">
                              {data?.sumDieselIssue?.toLocaleString() || 0}
                            </p>
                            <p className="text-sm text-gray-500">Liters</p>
                          </div>
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <Fuel className="h-6 w-6 text-orange-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Total KM Run Card */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Total KM Run
                            </p>
                            <p className="text-3xl font-bold text-green-600">
                              {data?.sumTotalRunKM?.toLocaleString() || 0}
                            </p>
                            <p className="text-sm text-gray-500">Kilometers</p>
                          </div>
                          <div className="w-12 h-12 bg-green-10 rounded-full flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Total Hours Run Card */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Total Hours Run
                            </p>
                            <p className="text-3xl font-bold text-purple-600">
                              {data?.sumTotalRunHrsMeter?.toLocaleString() || 0}
                            </p>
                            <p className="text-sm text-gray-500">Hours</p>
                          </div>
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <Clock className="h-6 w-6 text-purple-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Log Entries</CardTitle>
                      <CardDescription>
                        Log Entries of the machine
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {data?.logbookEntries?.length === 0 ? (
                        <div className="text-center py-12">
                          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg mb-2">
                            No log entries yet
                          </p>
                          <p className="text-gray-400 text-sm mb-4">
                            Log entries will appear here once they are recorded
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Table */}
                          <div className="border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                  <tr>
                                    <th className="text-left p-4 font-medium text-gray-900">
                                      Entry
                                    </th>
                                    <th className="text-left p-4 font-medium text-gray-900">
                                      Date
                                    </th>
                                    <th className="text-left p-4 font-medium text-gray-900">
                                      Work Details
                                    </th>
                                    <th className="text-left p-4 font-medium text-gray-900">
                                      KM Run
                                    </th>
                                    <th className="text-left p-4 font-medium text-gray-900">
                                      Hours Run
                                    </th>
                                    <th className="text-left p-4 font-medium text-gray-900">
                                      Diesel Used
                                    </th>
                                    <th className="text-left p-4 font-medium text-gray-900">
                                      Efficiency
                                    </th>
                                    <th className="text-left p-4 font-medium text-gray-900">
                                      Location
                                    </th>
                                    <th className="text-right p-4 font-medium text-gray-900">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {data?.logbookEntries?.map((entry) => {
                                    const dieselUsed =
                                      entry.dieselOpeningBalance +
                                      entry.dieselIssue -
                                      entry.dieselClosingBalance;

                                    return (
                                      <tr
                                        key={entry.id}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => handleRowClick(entry.id)}
                                      >
                                        <td className="p-4">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                              <FileText className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                              <p className="font-medium text-gray-900">
                                                {entry.name}
                                              </p>
                                              <p className="text-sm text-gray-500">
                                                ID #{entry.id}
                                              </p>
                                            </div>
                                          </div>
                                        </td>

                                        <td className="p-4">
                                          <div>
                                            <p className="font-medium text-gray-900">
                                              {format(
                                                new Date(entry.date),
                                                "dd MMM yyyy"
                                              )}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                              {format(
                                                new Date(entry.createdAt),
                                                "HH:mm"
                                              )}
                                            </p>
                                          </div>
                                        </td>

                                        <td className="p-4">
                                          <p
                                            className="text-gray-900 max-w-xs truncate"
                                            title={entry.workingDetails}
                                          >
                                            {entry.workingDetails}
                                          </p>
                                        </td>

                                        <td className="p-4">
                                          <div className="text-center">
                                            <p className="font-semibold text-green-600">
                                              {entry.totalRunKM?.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              KM
                                            </p>
                                          </div>
                                        </td>

                                        <td className="p-4">
                                          <div className="text-center">
                                            <p className="font-semibold text-purple-600">
                                              {entry.totalRunHrsMeter}
                                            </p>
                                            <p className="text-xs text-gray-50">
                                              Hours
                                            </p>
                                          </div>
                                        </td>

                                        <td className="p-4">
                                          <div className="text-center">
                                            <p className="font-semibold text-orange-600">
                                              {dieselUsed}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              Liters
                                            </p>
                                          </div>
                                        </td>

                                        <td className="p-4">
                                          <div className="text-center">
                                            <p className="text-sm text-gray-900">
                                              {entry.dieselAvgKM} KM/L
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              {entry.dieselAvgHrsMeter} Hrs/L
                                            </p>
                                          </div>
                                        </td>

                                        <td className="p-4">
                                          <div className="max-w-xs">
                                            <p
                                              className="text-sm text-gray-900 truncate"
                                              title={entry.location}
                                            >
                                              {entry.location}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1">
                                              <MapPin className="h-3 w-3 text-gray-400" />
                                              <p className="text-xs text-gray-500">
                                                Site #{entry.siteId}
                                              </p>
                                            </div>
                                          </div>
                                        </td>

                                        <td className="p-4">
                                          <div className="flex items-center justify-end gap-2">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={(e) => {
                                                // e.stopPropagation();
                                                navigate(
                                                  "/logbook/" + entry.id
                                                );
                                              }}
                                              className="hover:bg-blue-50"
                                            >
                                              <Eye className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="maintenance" className="pt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">Servicing History</h2>
                      <Button
                        onClick={() => {
                          navigate(`/machine/${data?.id}/logs`, {
                            state: { machineName: data?.machineName },
                          });
                        }}
                      >
                        View All Records
                      </Button>
                    </div>

                    {/* <MaintenanceSummaryCard machineId={data?.id} /> */}

                    {/* Maintenance Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Maintenance Summary */}
                      <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-2">
                          Servicing Summary
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Total Records:
                            </span>
                            <span className="font-medium">
                              {data?.maintenanceStats?.totalRecords || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Last Servicing:
                            </span>
                            <span className="font-medium">
                              {data?.maintenanceStats?.lastMaintenanceDate
                                ? format(
                                  new Date(
                                    data?.maintenanceStats?.lastMaintenanceDate
                                  ),
                                  "MMMM d, yyyy"
                                )
                                : "-"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Total Cost (YTD):
                            </span>
                            <span className="font-medium">
                              ₹
                              {data?.maintenanceStats?.totalCostYTD?.toFixed(
                                2
                              ) || "0.00"}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t">
                            <span className="text-muted-foreground">
                              Next Servicing:
                            </span>
                            <span className="font-medium">
                              {data?.nextMaintenance
                                ? format(
                                  new Date(data?.nextMaintenance.dueDate),
                                  "MMMM d, yyyy"
                                )
                                : "-"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Maintenance Types */}
                      <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-2">
                          Servicing Types
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Repairs:
                            </span>
                            <span className="font-medium">
                              {data?.maintenanceStats?.typeCounts?.repair || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Preventive:
                            </span>
                            <span className="font-medium">
                              {data?.maintenanceStats?.typeCounts?.preventive ||
                                0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Inspections:
                            </span>
                            <span className="font-medium">
                              {data?.maintenanceStats?.typeCounts?.inspection ||
                                0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Oil Changes:
                            </span>
                            <span className="font-medium">
                              {data?.maintenanceStats?.typeCounts?.oil_change ||
                                0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Parts Replacements:
                            </span>
                            <span className="font-medium">
                              {data?.maintenanceStats?.typeCounts
                                ?.parts_replacement || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Maintenance History List */}
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-4">
                        Recent Servicing Records
                      </h3>
                      <Card>
                        <CardContent className="p-4">
                          {data?.maintenanceLogs &&
                            data.maintenanceLogs.length > 0 ? (
                            <div className="space-y-4">
                              {data.maintenanceLogs.map((log) => (
                                <div
                                  key={log.id}
                                  className="border-b pb-4 last:border-0 last:pb-0"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-medium">
                                        {log.title || log.type}
                                      </h4>
                                      <p className="text-sm text-muted-foreground">
                                        {format(
                                          new Date(log.date),
                                          "MMMM d, yyyy"
                                        )}{" "}
                                        • {log.type}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium">
                                        ₹{log.cost || "0.00"}
                                      </p>
                                      <p className="text-sm text-muted-foreground capitalize">
                                        {log.status}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-sm mt-2 text-muted-foreground line-clamp-2">
                                    {log.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-center text-muted-foreground py-8">
                              No Servicing records found
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
