"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Printer, Save, Plus, Trash2, PlusCircle } from "lucide-react";
import MaterialIssuePDF from "./MaterialIssuePDF";
import { PDFViewer } from "@react-pdf/renderer";
import { useNavigate, useSearchParams } from "react-router";
import { useSelector } from "react-redux";
import api from "@/services/api/api-service";
import { useUserRoleLevel } from "@/utils/roles";
import { toast } from "@/hooks/use-toast";

const MaterialIssueForm = () => {
  const roleLevel = useUserRoleLevel();
  const [searchParams] = useSearchParams();
  const [requisitionData, setRequisitionData] = useState(null);
  const reqId = searchParams.get("req_id");

  const [issueType, setIssueType] = useState("Consumption");
  const [selectedItemGroup, setSelectedItemGroup] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [issueTo, setIssueTo] = useState("vehicle");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedSite, setSelectedSite] = useState("");
  const [vehicleKm, setVehicleKm] = useState("");
  const [vehicleHours, setVehicleHours] = useState("");
  const [issueItems, setIssueItems] = useState([]);
  const [showPdf, setShowPdf] = useState(false);
  const [formData, setFormData] = useState({
    issueNo: `ISS-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`,
    issueDate: format(new Date(), "yyyy-MM-dd"),
    issueTime: format(new Date(), "HH:mm"),
    issueLocation: "",
    fromSite: "",
    toSite: "",
  });

  // States for API data
  const [inventory, setInventory] = useState([]);
  const [itemGroups, setItemGroups] = useState([]);
  const [items, setItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Get sites and vehicles from Redux
  const sites = useSelector((state) => state.sites.data) || [];
  const vehicles = useSelector((state) => state.machines.data) || [];

  const navigate = useNavigate();
  const fetchRequisitionData = async (requisitionId) => {
    try {
      const response = await api.get(`/requisitions/${requisitionId}`);
      setRequisitionData(response.data);

      // Auto-populate form based on requisition
      populateFormFromRequisition(response.data);
    } catch (error) {
      console.error("Failed to fetch requisition data:", error);
    }
  };

  useEffect(() => {
    if (reqId) {
      fetchRequisitionData(reqId);
    }
  }, [reqId]);

  const populateFormFromRequisition = (reqData) => {
    // Set issue type to transfer since it's from requisition
    setIssueType("transfer");

    // Set form data
    setFormData((prev) => ({
      ...prev,
      issueLocation: roleLevel.siteName || "", // Current user's site (issuing from)
      fromSite: roleLevel.siteName || "",
      toSite: reqData.requestingSite.name,
    }));

    // Store requisition data to be processed after inventory is loaded
    setRequisitionData(reqData);
  };
  useEffect(() => {
    if (requisitionData && inventory.length > 0) {
      // Auto-populate items from requisition with inventory validation
      const mappedItems = requisitionData.items.map((reqItem, index) => {
        // Find the inventory item for this requisition item
        const inventoryItem = inventory.find(
          (inv) => inv.Item.id === reqItem.itemId
        );

        return {
          id: `req-${reqItem.id}-${Date.now()}-${index}`,
          itemId: reqItem.itemId,
          itemName: reqItem.Item.name,
          itemGroup: inventoryItem?.Item.ItemGroup.name || "",
          quantity: reqItem.quantity,
          unit:
            inventoryItem?.Item.Unit?.shortName || reqItem.Item.Unit?.shortName,
          balance: inventoryItem?.quantity || 0, // Available inventory balance
          requestedQuantity: reqItem.quantity, // Original requested quantity
          issueTo: "Other Site",
          vehicleId: null,
          vehicleNumber: "",
          vehicleKm: "",
          vehicleHours: "",
          siteId: requisitionData.requestingSiteId,
          siteName: requisitionData.requestingSite.name,
          requisitionItemId: reqItem.id,
          hasInventory: !!inventoryItem, // Flag to check if item exists in inventory
        };
      });

      setIssueItems(mappedItems);
    }
  }, [requisitionData, inventory]);

  useEffect(() => {
    setFormData({
      ...formData,
      issueLocation: roleLevel.siteName,
    });

    fetchInventoryData(roleLevel.siteId);
  }, []);

  useEffect(() => {
    // Reset issue to when issue type changes
    if (issueType === "Consumption") {
      setIssueTo("vehicle");
    } else if (issueType === "transfer") {
      setIssueTo("Other Site");

      // If toSite is already selected, set selectedSite to match
      if (formData.toSite) {
        const toSiteObj = sites.find((site) => site.name === formData.toSite);
        if (toSiteObj) {
          setSelectedSite(toSiteObj.id);
        }
      }
    }
  }, [issueType, formData.toSite, sites]);

  const fetchInventoryData = async (siteId) => {
    if (!siteId) return;

    setIsLoading(true);
    try {
      const response = await api.get(`inventory/sites/${siteId}`);

      // Set inventory data
      setInventory(response.data);

      // Extract unique item groups
      const uniqueItemGroups = [
        ...new Map(
          response.data.map((item) => [
            item.Item.ItemGroup.id,
            item.Item.ItemGroup,
          ])
        ).values(),
      ];

      setItemGroups(uniqueItemGroups);

      // Extract unique items with balance
      const uniqueItems = response.data.map((inventoryItem) => ({
        ...inventoryItem.Item,
        balance: inventoryItem.quantity,
        unit: inventoryItem.Item.Unit.shortName,
      }));

      setItems(uniqueItems);

      // Extract unique units
      const uniqueUnits = [
        ...new Map(
          response.data.map((item) => [item.Item.Unit.id, item.Item.Unit])
        ).values(),
      ];

      setUnits(uniqueUnits);
    } catch (error) {
      console.error("Failed to fetch inventory data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });

    // If selecting issue location, fetch inventory for that site
    if (name === "issueLocation") {
      const selectedSite = sites.find((site) => site.name === value);
      if (selectedSite) {
        fetchInventoryData(selectedSite.id);

        // Update the fromSite in case of transfer
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          fromSite: value,
        }));
      }
    }
  };

  const handleAddItem = () => {
    if (!selectedItem || !quantity || Number(quantity) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please select an item and enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    const item = items.find((i) => i.id === Number(selectedItem));
    const itemGroup = itemGroups.find(
      (g) => g.id === Number(selectedItemGroup)
    );

    if (!item) return;

    // Check if quantity exceeds balance
    if (Number(quantity) > item.balance) {
      toast({
        title: "Quantity Error",
        description: `Quantity exceeds available balance of ${item.balance} ${item.unit}`,
        variant: "destructive",
      });
      return;
    }

    // Validate required fields based on issueTo
    if (issueTo === "vehicle" && !selectedVehicle) {
      toast({
        title: "Selection Required",
        description: "Please select a vehicle",
        variant: "destructive",
      });
      return;
    }

    if (reqId) {
      const existingItem = issueItems.find(
        (item) => item.itemId === Number(selectedItem)
      );
      if (existingItem) {
        toast({
          title: "Duplicate Item",
          description:
            "Item already exists from requisition. Please modify the existing item instead.",
          variant: "destructive",
        });
        return;
      }
    }

    // For transfer, use the global destination site
    const selectedToSite =
      issueType === "transfer"
        ? sites.find((site) => site.name === formData.toSite)
        : null;

    const newItem = {
      id: Date.now().toString(),
      itemId: Number(selectedItem),
      itemName: item.name,
      itemGroup: itemGroup?.name || "",
      quantity: Number(quantity),
      unit: item.unit,
      balance: item.balance,
      issueTo: issueTo,
      vehicleId: issueTo === "vehicle" ? selectedVehicle : null,
      vehicleNumber:
        issueTo === "vehicle"
          ? vehicles.find((v) => v.id === selectedVehicle)?.machineName || ""
          : "",
      vehicleKm: issueTo === "vehicle" ? vehicleKm : "",
      vehicleHours: issueTo === "vehicle" ? vehicleHours : "",
      siteId: issueType === "transfer" ? selectedToSite?.id : null,
      siteName: issueType === "transfer" ? formData.toSite : "",
    };

    setIssueItems([...issueItems, newItem]);

    // Reset form fields
    setSelectedItem("");
    setQuantity("");
    setVehicleKm("");
    setVehicleHours("");
  };

  // Add function to modify existing items
  const handleModifyItem = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Quantity must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    const item = issueItems.find((i) => i.id === itemId);

    // Check against inventory balance
    if (newQuantity > item.balance) {
      toast({
        title: "Quantity Error",
        description: `Quantity exceeds available inventory balance of ${item.balance} ${item.unit}`,
        variant: "destructive",
      });
      return;
    }

    setIssueItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: newQuantity } : i))
    );
  };

  const handleRemoveItem = (id) => {
    setIssueItems(issueItems.filter((item) => item.id !== id));
  };

  const handleSave = async () => {
    if (issueItems.length === 0) {
      toast({
        title: "No Items",
        description: "Please add at least one item",
        variant: "destructive",
      });

      return;
    }

    if (reqId) {
      const itemsWithoutInventory = issueItems.filter(
        (item) => !item.hasInventory
      );
      if (itemsWithoutInventory.length > 0) {
        toast({
          title: "Items Not Available",
          description: `Cannot issue items that are not available in inventory: ${itemsWithoutInventory
            .map((i) => i.itemName)
            .join(", ")}`,
          variant: "destructive",
        });
        return;
      }

      const itemsExceedingInventory = issueItems.filter(
        (item) => item.quantity > item.balance
      );
      if (itemsExceedingInventory.length > 0) {
        toast({
          title: "Quantity Exceeded",
          description:
            "Some items exceed available inventory. Please adjust quantities.",
          variant: "destructive",
        });
        return;
      }
    }

    if (!formData.issueLocation) {
      toast({
        title: "Site Required",
        description: "Please select an issue site",
        variant: "destructive",
      });
      return;
    }

    if (issueType === "transfer" && !formData.toSite) {
      toast({
        title: "Destination Required",
        description: "Please select a destination site for transfer",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Prepare the request body
      const selectedIssueSite = sites.find(
        (site) => site.name === formData.issueLocation
      );
      const selectedToSite =
        issueType === "transfer"
          ? sites.find((site) => site.name === formData.toSite)
          : null;

      const requestBody = {
        requisitionId: reqId ? Number(reqId) : null,
        issueDate: `${formData.issueDate} ${formData.issueTime}:00.000000`,
        issueType:
          issueType === "Consumption" ? "Consumption" : "Site Transfer",
        siteId: selectedIssueSite?.id,
        otherSiteId: selectedToSite?.id || null,
        items: issueItems.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          issueTo: item.issueTo,
          siteId: selectedIssueSite?.id,
          machineId: item.issueTo === "vehicle" ? item.vehicleId : null,
          otherSiteId: issueType === "transfer" ? selectedToSite?.id : null,
        })),
      };

      // Make the API call
      await api.post("/material-issues", requestBody);

      toast({
        title: "Success",
        description: "Material issue saved successfully!",
        variant: "default", // or just omit variant for default success style
      });
      navigate("/issues");
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save material issue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    if (issueItems.length === 0) {
      toast({
        title: "No Items",
        description: "Please add at least one item",
        variant: "destructive",
      });
      return;
    }

    setShowPdf(true);
  };

  const filteredItems = selectedItemGroup
    ? items.filter((item) => item.itemGroupId === Number(selectedItemGroup))
    : [];

  // if (isLoading) {
  //   return (
  //     <div className="container mx-auto py-6 text-center">
  //       Loading inventory data...
  //     </div>
  //   );
  // }

  return (
    <div className="container py-6">
      {!showPdf ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Material Issue</h1>
              {reqId && requisitionData && (
                <p className="text-sm text-muted-foreground">
                  From Requisition: {requisitionData.requisitionNo}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
              {/* <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button> */}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Material Issue Details</CardTitle>
              <CardDescription>
                Enter the details for material issue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Issue Type</Label>
                <RadioGroup
                  value={issueType}
                  onValueChange={setIssueType}
                  className="flex flex-wrap gap-4"
                  disabled={!!reqId}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Consumption" id="Consumption" />
                    <Label htmlFor="Consumption">Consumption</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="transfer" id="transfer" />
                    <Label htmlFor="transfer">Site Transfer</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issueLocation">Issue Site *</Label>
                <Select
                  disabled={roleLevel.siteName}
                  value={formData.issueLocation}
                  onValueChange={(value) => {
                    handleSelectChange("issueLocation", value);
                  }}
                >
                  <SelectTrigger id="issueLocation">
                    <SelectValue placeholder="Select issue site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map((site) => (
                      <SelectItem key={site.id} value={site.name}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {issueType === "transfer" && (
                <div className="space-y-2">
                  <Label htmlFor="toSite">To Site *</Label>
                  <Select
                    disabled={roleLevel.siteName}
                    value={formData.toSite}
                    onValueChange={(value) =>
                      setFormData({ ...formData, toSite: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination site" />
                    </SelectTrigger>
                    <SelectContent>
                      {sites
                        .filter((site) => site.name !== formData.issueLocation)
                        .map((site) => (
                          <SelectItem key={site.id} value={site.name}>
                            {site.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {!reqId && (
                <div className="border p-4 rounded-md space-y-4">
                  <h3 className="font-medium">Add Items</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="itemGroup">Item Group *</Label>
                      <Select
                        disabled={isLoading ? true : false}
                        value={selectedItemGroup}
                        onValueChange={setSelectedItemGroup}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select item group" />
                        </SelectTrigger>
                        <SelectContent>
                          {itemGroups.map((group) => (
                            <SelectItem
                              key={group.id}
                              value={group.id.toString()}
                            >
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="item">Item *</Label>
                      <Select
                        value={selectedItem}
                        onValueChange={setSelectedItem}
                        disabled={!selectedItemGroup}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              selectedItemGroup
                                ? "Select item"
                                : "Select item group first"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredItems.map((item) => (
                            <SelectItem
                              key={item.id}
                              value={item.id.toString()}
                            >
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity *</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="quantity"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          placeholder="Enter quantity"
                        />
                        <div className="w-16 text-sm">
                          {selectedItem &&
                            items.find((i) => i.id === Number(selectedItem))
                              ?.unit}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Balance Quantity</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={
                          selectedItem
                            ? items.find((i) => i.id === Number(selectedItem))
                                ?.balance || ""
                            : ""
                        }
                        readOnly
                        disabled
                      />
                      <div className="w-16 text-sm">
                        {selectedItem &&
                          items.find((i) => i.id === Number(selectedItem))
                            ?.unit}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Issue To</Label>
                    <RadioGroup
                      value={issueTo}
                      onValueChange={setIssueTo}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="vehicle"
                          id="vehicle"
                          disabled={issueType === "transfer"}
                        />
                        <Label htmlFor="vehicle">Vehicle</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Other Site"
                          id="site"
                          disabled={issueType === "Consumption"}
                        />
                        <Label htmlFor="site">Other Site</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {issueTo === "vehicle" ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vehicle">Vehicle No *</Label>
                        <Select
                          value={selectedVehicle}
                          onValueChange={setSelectedVehicle}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicles.map((vehicle) => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                {vehicle.machineName}/{vehicle.erpCode}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="km">KM</Label>
                        <Input
                          id="km"
                          type="number"
                          value={vehicleKm}
                          onChange={(e) => setVehicleKm(e.target.value)}
                          placeholder="Enter KM reading"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hours">Hours Meter</Label>
                        <Input
                          id="hours"
                          type="number"
                          value={vehicleHours}
                          onChange={(e) => setVehicleHours(e.target.value)}
                          placeholder="Enter hours meter reading"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="site">Site Name *</Label>
                      <Select
                        value={selectedSite}
                        onValueChange={setSelectedSite}
                        disabled={issueType === "transfer"}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              issueType === "transfer"
                                ? formData.toSite ||
                                  "Select destination site first"
                                : "Select site"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {sites
                            .filter(
                              (site) => site.name !== formData.issueLocation
                            )
                            .map((site) => (
                              <SelectItem key={site.id} value={site.id}>
                                {site.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddItem}
                      disabled={
                        !selectedItem ||
                        !quantity ||
                        (issueTo === "vehicle" && !selectedVehicle) ||
                        (issueTo === "Other Site" && issueType !== "transfer")
                      }
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                  </div>
                </div>
              )}

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr. No</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      {reqId && <TableHead>Inventory</TableHead>}
                      <TableHead>Issue To</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issueItems.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-6 text-muted-foreground"
                        >
                          {reqId
                            ? "No items from requisition"
                            : "No items added yet."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      issueItems.map((item, index) => (
                        <TableRow
                          key={item.id}
                          className={!item.hasInventory ? "bg-red-50" : ""}
                        >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <div>
                              {item.itemName}
                              {reqId && !item.hasInventory && (
                                <div className="text-xs text-red-600 mt-1">
                                  Not available in inventory
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {reqId ? (
                              <div className="flex flex-col">
                                <Input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleModifyItem(
                                      item.id,
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-20"
                                  disabled={!item.hasInventory}
                                />
                                {reqId && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    Req: {item.requestedQuantity}
                                  </div>
                                )}
                              </div>
                            ) : (
                              item.quantity
                            )}
                          </TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>
                            {reqId && (
                              <div className="text-sm">
                                <div
                                  className={
                                    item.hasInventory
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  Avail: {item.balance} {item.unit}
                                </div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.issueTo === "vehicle"
                              ? "Vehicle"
                              : "Site Transfer"}
                          </TableCell>
                          <TableCell>
                            {item.issueTo === "vehicle"
                              ? `${item.vehicleNumber} (KM: ${
                                  item.vehicleKm || "N/A"
                                }, Hours: ${item.vehicleHours || "N/A"})`
                              : item.siteName}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/issues")}
              >
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
                {/* <Button onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" /> Print
                </Button> */}
              </div>
            </CardFooter>
          </Card>
        </>
      ) : (
        <div className="flex flex-col h-screen">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Material Issue PDF Preview</h1>
            <Button variant="outline" onClick={() => setShowPdf(false)}>
              Back to Form
            </Button>
          </div>
          <div className="flex-1 border rounded">
            <PDFViewer width="100%" height="100%" className="border">
              <MaterialIssuePDF formData={formData} items={issueItems} />
            </PDFViewer>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialIssueForm;
