"use client";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api/api-service";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  History,
  Package,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const MaterialDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [item, setItem] = useState(null);
  const [itemGroup, setItemGroup] = useState(null);
  const [unit, setUnit] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [stockLogs, setStockLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [filterSite, setFilterSite] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sites, setSites] = useState([]);

  // Modal State
  const [selectedLog, setSelectedLog] = useState(null);
  const [logDetails, setLogDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchInventoryByItemId = async () => {
      try {
        const response = await api.get(`/inventory/item/${id}`);
        if (!response.status || !response.data || response.data.length === 0) {
          toast({
            title: "No Inventory Found",
            description: "No inventory data available for this item.",
            variant: "destructive",
          });
          navigate("/inventory");
          return;
        }

        const firstRecord = response.data[0];
        const itemData = firstRecord.Item;
        const inventoryList = response.data.map((inv) => ({
          id: inv.id,
          itemId: inv.itemId,
          name: inv.Item?.name || "-",
          partNo: inv.Item?.partNumber || "-",
          hsnCode: inv.Item?.hsnCode || "-",
          category: inv.Item?.ItemGroup?.name || "Unknown",
          quantity: inv.quantity,
          lockedQuantity: inv.lockedQuantity || 0,
          minLevel: inv.minimumLevel,
          site: inv.Site?.name || "Unknown Site",
          lastUpdated: inv.updatedAt,
        }));
        const uniqueSites = [
          ...new Set(
            response.data.map((inv) => inv.Site?.name || "Unknown Site")
          ),
        ];

        setItem({
          id: itemData.id,
          name: itemData.name,
          partNo: itemData.partNumber,
        });

        setItemGroup(itemData.ItemGroup);
        setUnit(itemData.Unit);
        setInventory(inventoryList);
        setSites(uniqueSites);
      } catch (error) {
        console.log(error);
        toast({
          title: "Error fetching data",
          description: "Something went wrong while fetching inventory.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    const fetchStockLogs = async (itemId) => {
      try {
        const result = await api.get(`/inventory/stock-log/${itemId}`);
        const transformedLogs = result.data.map((log, index) => ({
          id: index, // Generate id if not provided by API
          date: new Date(log.dateTime),
          type: log.type,
          quantity: log.quantity,
          site: log.site,
          quantity: log.quantity,
          site: log.site,
          reference: log.reference,
          user: log.user,
          sourceType: log.sourceType,
          sourceId: log.sourceId,
        }));
        setStockLogs(transformedLogs);
      } catch (error) {
        console.log(error);
      }
    };
    fetchStockLogs(id);

    fetchInventoryByItemId();
  }, [id, navigate, toast]);

  const getStockStatus = (quantity, minLevel) => {
    if (quantity <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (quantity <= minLevel) {
      return <Badge variant="warning">Low Stock</Badge>;
    } else {
      return <Badge variant="success">In Stock</Badge>;
    }
  };

  const getTransactionBadge = (type, quantity) => {
    switch (type) {
      case "receipt":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
          >
            <TrendingUp className="h-3 w-3" /> Receipt
          </Badge>
        );
      case "issue":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
          >
            <TrendingDown className="h-3 w-3" /> Issue
          </Badge>
        );
      case "adjustment":
        return (
          <Badge
            variant="outline"
            className="bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-1"
          >
            <AlertTriangle className="h-3 w-3" /> Adjustment
          </Badge>
        );
      case "transfer":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1"
          >
            <History className="h-3 w-3" /> Transfer
          </Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "PPP p");
    } catch (error) {
      return dateString;
    }
  };

  // Calculate total stock across all sites
  const totals = inventory.reduce((acc, inv) => {
    acc.total += inv.quantity;
    acc.locked += inv.lockedQuantity;
    return acc;
  }, { total: 0, locked: 0 });

  const totalStock = totals.total;
  const totalLocked = totals.locked;
  const totalAvailable = totalStock - totalLocked;

  // Filter stock logs
  const filteredStockLogs = stockLogs.filter((log) => {
    const matchesSite = filterSite === "all" || log.site === filterSite;
    const matchesType = filterType === "all" || log.type === filterType;
    return matchesSite && matchesType;
  });

  const sortedStockLogs = [...filteredStockLogs].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const handleReferenceClick = async (log) => {
    if (!log.sourceId || !log.sourceType) return;

    setSelectedLog(log);
    setLogDetails(null);
    setIsModalOpen(true);
    setDetailsLoading(true);
    try {
      let endpoint = "/inventory/reference/stock-log?sourceId=" + log.sourceId + "&sourceType=" + log.sourceType + "&itemId=" + id;

      const response = await api.get(endpoint);
      setLogDetails(response.data);

    } catch (error) {
      console.error("Error fetching transaction details:", error);
      toast({
        title: "Error",
        description: "Failed to load transaction details",
        variant: "destructive",
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (!item) {
    return (
      <div className="flex justify-center items-center h-64">
        Item not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/inventory")}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Material Details</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{item.name}</CardTitle>
              <CardDescription>
                {itemGroup?.name} • Part No: {item.partNo || "N/A"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span className="text-xl font-semibold">
                {totalAvailable} {unit?.shortName || unit?.name} Available
              </span>
              {totalLocked > 0 && (
                <span className="text-sm text-yellow-600 font-medium">
                  ({totalLocked} Locked)
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Item Name</p>
              <p className="font-medium">{item.name}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Short Name</p>
              <p className="font-medium">{item.shortName || "N/A"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Part Number</p>
              <p className="font-medium">{item.partNo || "N/A"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{itemGroup?.name || "Unknown"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Unit of Measurement
              </p>
              <p className="font-medium">{unit?.name || "Unknown"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">HSN Code</p>
              <p className="font-medium">{item.hsnCode || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Inventory Overview</TabsTrigger>
          <TabsTrigger value="history">Stock History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Inventory</CardTitle>
              <CardDescription>
                Current stock levels across all sites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Site</TableHead>
                      <TableHead>Available Stock</TableHead>
                      <TableHead>Locked Stock</TableHead>
                      <TableHead>Total Stock</TableHead>
                      <TableHead>Minimum Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-6 text-muted-foreground"
                        >
                          No inventory data available.
                        </TableCell>
                      </TableRow>
                    ) : (
                      inventory.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">
                            {inv.site}
                          </TableCell>
                          <TableCell className="font-semibold text-green-700">
                            {inv.quantity - inv.lockedQuantity} {unit?.shortName || unit?.name}
                          </TableCell>
                          <TableCell className={inv.lockedQuantity > 0 ? "text-yellow-700" : "text-muted-foreground"}>
                            {inv.lockedQuantity} {unit?.shortName || unit?.name}
                          </TableCell>
                          <TableCell>
                            {inv.quantity} {unit?.shortName || unit?.name}
                          </TableCell>
                          <TableCell>
                            {inv.minLevel} {unit?.shortName || unit?.name}
                          </TableCell>
                          <TableCell>
                            {getStockStatus(inv.quantity - inv.lockedQuantity, inv.minLevel)}
                          </TableCell>
                          <TableCell>{formatDate(inv.lastUpdated)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Movement History</CardTitle>
              <CardDescription>
                Log of all stock movements for this item
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row">
                {/* <div className="flex-1">
                  <Select value={filterSite} onValueChange={setFilterSite}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by site" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sites</SelectItem>
                      {sites.map((site, index) => (
                        <SelectItem key={index} value={site}>
                          {site}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div> */}
                {/* <div className="flex-1">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by transaction type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="receipt">Receipt</SelectItem>
                      <SelectItem value="issue">Issue</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="Requisition">Requisition</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead>Reference</TableHead>
                      {/* <TableHead>User</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedStockLogs.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-6 text-muted-foreground"
                        >
                          No stock movement history available.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedStockLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{formatDate(log.date)}</TableCell>
                          <TableCell>
                            {getTransactionBadge(log.type, log.quantity)}
                          </TableCell>
                          <TableCell
                            className={
                              log.type == "IN"
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {log.type == "IN" ? "+" : ""}
                            {log.quantity} {unit?.shortName || unit?.name}
                          </TableCell>
                          <TableCell>{log.site}</TableCell>
                          <TableCell>
                            <button
                              type="button"
                              className="text-blue-600 hover:underline text-left"
                              onClick={() => handleReferenceClick(log)}
                            >
                              {log.reference}
                            </button>
                          </TableCell>
                          {/* <TableCell>{log.user}</TableCell> */}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              {selectedLog?.reference} - {selectedLog && formatDate(selectedLog.date)}
            </DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : logDetails ? (
            <div className="space-y-4">
              {selectedLog?.sourceType === "Issue" && logDetails?.issueItem && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-semibold">Issue No:</span> {logDetails.issueItem.MaterialIssue?.issueNumber}
                    </div>
                    <div>
                      <span className="font-semibold">Issue Type:</span> {logDetails.issueItem.MaterialIssue?.issueType}
                    </div>
                    <div>
                      <span className="font-semibold">Quantity:</span> {logDetails.issueItem.quantity}
                    </div>
                    <div>
                      <span className="font-semibold">Issued To:</span> {logDetails.issueItem.issueTo}
                    </div>
                    {logDetails.issueItem.fromSite && (
                      <div className="col-span-2">
                        <span className="font-semibold">From Site:</span> {logDetails.issueItem.fromSite.name}
                      </div>
                    )}
                    {logDetails.issueItem.toSite && (
                      <div className="col-span-2">
                        <span className="font-semibold">To Site:</span> {logDetails.issueItem.toSite.name}
                      </div>
                    )}
                    {logDetails.issueItem.machine && (
                      <div className="col-span-2">
                        <span className="font-semibold">Machine:</span> {logDetails.issueItem.machine.machineName} ({logDetails.issueItem.machine.registrationNumber})
                      </div>
                    )}
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setIsModalOpen(false);
                      navigate(`/issues/${logDetails.issueItem.materialIssueId}`);
                    }}
                  >
                    View Issue Details
                  </Button>
                </div>
              )}

              {selectedLog?.sourceType === "LogbookEntry" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-semibold">Date:</span> {logDetails.date}
                    </div>
                    <div>
                      <span className="font-semibold">Machine:</span> {logDetails.Machine?.machineName} ({logDetails.Machine?.registrationNumber})
                    </div>
                    <div>
                      <span className="font-semibold">Site:</span> {logDetails.Site?.name}
                    </div>
                    <div>
                      <span className="font-semibold">Worked:</span> {logDetails.workingDetails}
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setIsModalOpen(false);
                      navigate(`/logbook/${logDetails.id}`);
                    }}
                  >
                    View Logbook Details
                  </Button>
                </div>
              )}

              {selectedLog?.sourceType === "Procurement" && logDetails?.poItem && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-semibold">PO Number:</span> {logDetails.poItem.Procurement?.procurementNo}
                    </div>
                    <div>
                      <span className="font-semibold">Quantity:</span> {logDetails.poItem.quantity}
                    </div>
                    <div>
                      <span className="font-semibold">Rate:</span> {logDetails.poItem.rate}
                    </div>
                    <div>
                      <span className="font-semibold">Amount:</span> {logDetails.poItem.amount}
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setIsModalOpen(false);
                      navigate(`/procurements/${logDetails.poItem.procurementId}`);
                    }}
                  >
                    View Procurement Details
                  </Button>
                </div>
              )}

              {!["Issue", "LogbookEntry", "Procurement"].includes(selectedLog?.sourceType) && (
                <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[300px]">
                  {JSON.stringify(logDetails, null, 2)}
                </pre>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No details available
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaterialDetails;
