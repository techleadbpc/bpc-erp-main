import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
// import { toast } from "sonner";
import { Loader2, CheckCircle, Truck, CloudCog } from "lucide-react";
import { useUserRoleLevel } from "@/utils/roles";
import api from "@/services/api/api-service";

const IncomingDispatchesPage = () => {
    const { siteId } = useUserRoleLevel() || {};
    const [dispatches, setDispatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDispatch, setSelectedDispatch] = useState(null);
    const [receiving, setReceiving] = useState(false);

    useEffect(() => {
        if (siteId) {
            fetchDispatches();
        }
    }, [siteId]);

    const fetchDispatches = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/sites/${siteId}/incoming-dispatches`);
            setDispatches(response.data || []);
        } catch (error) {
            console.error("Error fetching dispatches:", error);
            // toast.error("Failed to fetch incoming dispatches");
        } finally {
            setLoading(false);
        }
    };

    const handleReceiveClick = (dispatch) => {
        setSelectedDispatch(dispatch);
    };

    const confirmReceive = async () => {
        if (!selectedDispatch) return;

        try {
            setReceiving(true);
            await api.post(`/sites/${siteId}/dispatch/${selectedDispatch.id}/receive`);
            // toast.success("Dispatch received successfully. Inventory updated.");
            setSelectedDispatch(null);
            fetchDispatches(); // Refresh list
        } catch (error) {
            console.error("Error receiving dispatch:", error);
            // toast.error(error.response?.data?.message || "Failed to receive dispatch");
        } finally {
            setReceiving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Incoming Dispatches</h1>
                <Button onClick={fetchDispatches} variant="outline" size="sm">
                    Refresh
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Receipts</CardTitle>
                </CardHeader>
                <CardContent>
                    {dispatches.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No incoming dispatches found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Dispatch Date</TableHead>
                                    <TableHead>From</TableHead>
                                    <TableHead>Procurement No</TableHead>
                                    <TableHead>Vehicle / Driver</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dispatches.map((dispatch) => (
                                    <TableRow key={dispatch.id}>
                                        <TableCell>{new Date(dispatch.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>{dispatch.fromSite?.name || "Unknown"}</TableCell>
                                        <TableCell>{dispatch.Procurement?.procurementNo || "N/A"}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{dispatch.vehicleNo || "N/A"}</span>
                                                <span className="text-xs text-muted-foreground">{dispatch.driverName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {dispatch.items?.map((item) => (
                                                    <span key={item.id} className="text-sm">
                                                        {item.Item?.name}: <strong>{item.quantity} {item.Item?.Unit?.shortName}</strong>
                                                    </span>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button onClick={() => handleReceiveClick(dispatch)} size="sm">
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Receive
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedDispatch} onOpenChange={(open) => !open && setSelectedDispatch(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Receipt</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to receive these items? This will add them to your site inventory.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDispatch && (
                        <div className="space-y-4">
                            <div className="rounded-md border p-4 bg-muted/50">
                                <h4 className="font-semibold mb-2">Items to Receive:</h4>
                                <ul className="space-y-2">
                                    {selectedDispatch.items?.map((item) => (
                                        <li key={item.id} className="flex justify-between text-sm">
                                            <span>{item.Item?.name}</span>
                                            <span className="font-bold">{item.quantity}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {selectedDispatch.remarks && (
                                <div className="text-sm text-muted-foreground">
                                    <strong>Remarks:</strong> {selectedDispatch.remarks}
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedDispatch(null)} disabled={receiving}>
                            Cancel
                        </Button>
                        <Button onClick={confirmReceive} disabled={receiving}>
                            {receiving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Receipt
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default IncomingDispatchesPage;
