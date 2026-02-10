import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Loader2,
    Warehouse,
    ShoppingCart,
    ArrowRightLeft,
    Package,
    TrendingUp,
    TrendingDown,
    AlertCircle,
} from "lucide-react";
import api from "@/services/api/api-service";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const VirtualSitePage = () => {
    const [virtualSite, setVirtualSite] = useState(null);
    const [procurementSummary, setProcurementSummary] = useState(null);
    const [inventory, setInventory] = useState([]);
    const [movements, setMovements] = useState({ data: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Dispatch State
    const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false);
    const [viewItemsDialogOpen, setViewItemsDialogOpen] = useState(false);
    const [selectedProcurement, setSelectedProcurement] = useState(null);
    const [dispatching, setDispatching] = useState(false);
    const [dispatchForm, setDispatchForm] = useState({
        vehicleNo: "",
        driverName: "",
        remarks: ""
    });
    const [dispatchItems, setDispatchItems] = useState([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // 1. Get Virtual Site Details
            const siteRes = await api.get("/sites/virtual");
            const site = siteRes.data;
            setVirtualSite(site);

            if (site?.id) {
                // 2. Fetch all related data in parallel
                const [procRes, invRes, movRes] = await Promise.all([
                    api.get("/sites/virtual/procurement-summary"),
                    api.get(`/inventory/sites/${site.id}`),
                    api.get(`/sites/${site.id}/inventory-movement?page=1&limit=10`),
                ]);

                setProcurementSummary(procRes.data);
                setInventory(invRes.data);
                setMovements(movRes.data);
            }
        } catch (err) {
            console.error("Failed to fetch virtual site data:", err);
            setError("Failed to load virtual site data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDispatchClick = (proc) => {
        setSelectedProcurement(proc);
        // Initialize dispatch items with current available quantities
        // We need to calculate available quantity based on totalIn - totalOut for each item in this procurement
        // However, the procurement summary gives aggregated totals.
        // For simplicity, we'll assume we can dispatch up to the 'change' amount of each IN movement,
        // but ideally we should track per-item balance.
        // Given the current structure, we'll list all items from the procurement.
        // A better approach would be to filter items that have remaining balance.
        // For now, we allow dispatching any item from the procurement, but backend will validate stock.

        const itemsToDispatch = proc.items.map(item => {
            const dispatchedQty = proc.dispatchedItems?.[item.item.id] || 0;
            const remainingQty = item.change - dispatchedQty;

            return {
                itemId: item.item.id,
                itemName: item.item.name,
                maxQuantity: remainingQty,
                quantity: remainingQty
            };
        }).filter(item => item.maxQuantity > 0);

        setDispatchItems(itemsToDispatch);
        setDispatchForm({ vehicleNo: "", driverName: "", remarks: "" });
        setDispatchDialogOpen(true);
    };

    const handleViewItemsClick = (proc) => {
        setSelectedProcurement(proc);
        setViewItemsDialogOpen(true);
    };

    const confirmDispatch = async () => {
        if (!selectedProcurement || dispatchItems.length === 0) return;

        try {
            setDispatching(true);
            const payload = {
                procurementId: selectedProcurement.procurementId,
                items: dispatchItems.map(item => ({
                    itemId: item.itemId,
                    quantity: item.quantity
                })),
                vehicleNo: dispatchForm.vehicleNo,
                driverName: dispatchForm.driverName,
                remarks: dispatchForm.remarks
            };

            await api.post("/sites/virtual/dispatch", payload);

            // Refresh data
            await fetchData();
            setDispatchDialogOpen(false);
            setSelectedProcurement(null);
            setDispatchItems([]);
        } catch (err) {
            console.error("Dispatch failed:", err);
            alert("Failed to dispatch items. Please check inventory levels.");
        } finally {
            setDispatching(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Warehouse className="h-8 w-8 text-blue-600" />
                        Virtual Site Management
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage accepted procurements and virtual inventory.
                    </p>
                </div>
                {virtualSite && (
                    <Badge variant="outline" className="text-base px-4 py-1">
                        Site Code: {virtualSite.code || "VIRTUAL"}
                    </Badge>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Procurements
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {procurementSummary?.summary?.activeProcurements || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Items accepted from procurements
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Inventory Items
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inventory?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Distinct items in virtual stock
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Movements
                        </CardTitle>
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {movements?.totalCount || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            In/Out transactions recorded
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="procurements" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="procurements" className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Procurements
                    </TabsTrigger>
                    <TabsTrigger value="inventory" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Inventory
                    </TabsTrigger>
                    <TabsTrigger value="movements" className="flex items-center gap-2">
                        <ArrowRightLeft className="h-4 w-4" />
                        Movements
                    </TabsTrigger>
                </TabsList>

                {/* Procurements Tab */}
                <TabsContent value="procurements">
                    <Card>
                        <CardHeader>
                            <CardTitle>Accepted Procurements</CardTitle>
                            <CardDescription>
                                List of procurements where items have been accepted into the
                                Virtual Site.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Procurement No</TableHead>
                                        <TableHead>Requisition No</TableHead>
                                        <TableHead>Destination Site</TableHead>
                                        <TableHead className="text-center">Total Items</TableHead>
                                        <TableHead className="text-center">Total Quantity</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {procurementSummary?.procurementMovements?.length > 0 ? (
                                        procurementSummary.procurementMovements.map((proc, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>
                                                    {proc.procurementDate ? format(new Date(proc.procurementDate), "dd MMM yyyy") : "-"}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {proc.procurementNo || `Procurement #${proc.procurementId}`}
                                                </TableCell>
                                                <TableCell>{proc.requisitionNo}</TableCell>
                                                <TableCell>{proc.destinationSite}</TableCell>
                                                <TableCell className="text-center">
                                                    {proc.items.length}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                        {proc.totalIn}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleViewItemsClick(proc)}>
                                                        View Items
                                                    </Button>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() => handleDispatchClick(proc)}
                                                        disabled={proc.totalOut >= proc.totalIn} // Disable if already fully dispatched
                                                    >
                                                        {proc.totalOut >= proc.totalIn ? "Dispatched" : "Dispatch"}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                No procurement data found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Inventory Tab */}
                <TabsContent value="inventory">
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Inventory</CardTitle>
                            <CardDescription>
                                Current stock levels in the Virtual Site.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item Name</TableHead>
                                        <TableHead>Group</TableHead>
                                        <TableHead className="text-center">Quantity</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inventory?.length > 0 ? (
                                        inventory.map((inv) => (
                                            <TableRow key={inv.id}>
                                                <TableCell className="font-medium">
                                                    {inv.Item?.name}
                                                </TableCell>
                                                <TableCell>{inv.Item?.ItemGroup?.name}</TableCell>
                                                <TableCell className="text-center text-lg">
                                                    {inv.quantity}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant={
                                                            inv.quantity > 0 ? "default" : "destructive"
                                                        }
                                                        className={
                                                            inv.quantity > 0
                                                                ? "bg-blue-100 text-blue-800"
                                                                : ""
                                                        }
                                                    >
                                                        {inv.quantity > 0 ? "In Stock" : "Out of Stock"}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8">
                                                No inventory items found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Movements Tab */}
                <TabsContent value="movements">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Movements</CardTitle>
                            <CardDescription>
                                History of all stock movements in and out of the Virtual Site.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Source</TableHead>
                                        <TableHead>Destination</TableHead>
                                        <TableHead>Reference</TableHead>
                                        <TableHead className="text-center">Total In</TableHead>
                                        <TableHead className="text-center">Total Out</TableHead>
                                        <TableHead className="text-center">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {movements?.data?.length > 0 ? (
                                        movements.data.map((mov, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium">
                                                    {mov.Item?.name}
                                                </TableCell>
                                                <TableCell>{mov.sourceDescription}</TableCell>
                                                <TableCell>{mov.destinationDescription}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {mov.reference}
                                                </TableCell>
                                                <TableCell className="text-center text-green-600 font-medium">
                                                    {mov.totalIn > 0 ? `+${mov.totalIn}` : "-"}
                                                </TableCell>
                                                <TableCell className="text-center text-red-600 font-medium">
                                                    {mov.totalOut > 0 ? `-${mov.totalOut}` : "-"}
                                                </TableCell>
                                                <TableCell className="text-center text-xs">
                                                    {mov.inDates
                                                        ? format(new Date(mov.inDates), "dd MMM yyyy")
                                                        : mov.latestOutDate
                                                            ? format(new Date(mov.latestOutDate), "dd MMM yyyy")
                                                            : "-"}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                No movement history found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={dispatchDialogOpen} onOpenChange={setDispatchDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Dispatch Items</DialogTitle>
                        <DialogDescription>
                            Dispatch items from Procurement <span className="font-bold">{selectedProcurement?.procurementNo}</span>
                            {" "}to <span className="font-bold">{selectedProcurement?.destinationSite}</span>.
                            Adjust quantities if needed.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedProcurement && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Vehicle No</label>
                                    <input
                                        type="text"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Enter Vehicle No"
                                        value={dispatchForm.vehicleNo}
                                        onChange={(e) => setDispatchForm({ ...dispatchForm, vehicleNo: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Driver Name</label>
                                    <input
                                        type="text"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Enter Driver Name"
                                        value={dispatchForm.driverName}
                                        onChange={(e) => setDispatchForm({ ...dispatchForm, driverName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Remarks</label>
                                    <input
                                        type="text"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Optional Remarks"
                                        value={dispatchForm.remarks}
                                        onChange={(e) => setDispatchForm({ ...dispatchForm, remarks: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="border rounded-md max-h-[400px] overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item Name</TableHead>
                                            <TableHead className="text-center">Available</TableHead>
                                            <TableHead className="text-center w-[150px]">Dispatch Qty</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dispatchItems.map((item, idx) => (
                                            <TableRow key={item.itemId}>
                                                <TableCell className="font-medium">{item.itemName}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="secondary">{item.maxQuantity}</Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={item.maxQuantity}
                                                        className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-center"
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            if (val > item.maxQuantity) return;
                                                            const newItems = [...dispatchItems];
                                                            newItems[idx].quantity = val;
                                                            setDispatchItems(newItems);
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => {
                                                            const newItems = dispatchItems.filter((_, i) => i !== idx);
                                                            setDispatchItems(newItems);
                                                        }}
                                                    >
                                                        Remove
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {dispatchItems.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                                    No items selected for dispatch.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setDispatchDialogOpen(false)} disabled={dispatching}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={confirmDispatch}
                                    disabled={dispatching || dispatchItems.length === 0 || !dispatchForm.vehicleNo || !dispatchForm.driverName}
                                >
                                    {dispatching ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Dispatching...
                                        </>
                                    ) : (
                                        "Confirm Dispatch"
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* View Items Dialog */}
            <Dialog open={viewItemsDialogOpen} onOpenChange={setViewItemsDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Procurement Items</DialogTitle>
                        <DialogDescription>
                            Items accepted in Procurement <span className="font-bold">{selectedProcurement?.procurementNo}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item Name</TableHead>
                                    <TableHead className="text-center">Quantity Accepted</TableHead>
                                    <TableHead className="text-center">Date Accepted</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedProcurement?.items?.map((item, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="font-medium">{item.item?.name}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                {item.change}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center text-sm text-muted-foreground">
                                            {format(new Date(item.createdAt), "dd MMM yyyy HH:mm")}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default VirtualSitePage;
