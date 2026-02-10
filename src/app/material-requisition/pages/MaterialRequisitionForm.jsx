"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Printer,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PDFViewer } from "@react-pdf/renderer";
import MaterialRequisitionPDF from "./MaterialRequisitionPDF";
import { useSelector } from "react-redux";
import api from "@/services/api/api-service";
import { useUserRoleLevel } from "@/utils/roles";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const MaterialRequisitionForm = () => {
  const roleLevel = useUserRoleLevel();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPdf, setShowPdf] = useState(false);

  const [formData, setFormData] = useState({
    requestingSite: {}, // Default site
    requestedFor: {
      type: "party",
      value: "",
    },
    chargeType: "foc",
    priority: "medium",
    dueDate: "",
    preparedBy: "",
    items: [],
  });

  const [itemGroups, setItemGroups] = useState([]);
  const [items, setItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [sites, setSites] = useState([]); // Mock sites
  const [machines, setMachines] = useState([]);
  const [openVehicleCombo, setOpenVehicleCombo] = useState(false);
  const [selectedItemGroup, setSelectedItemGroup] = useState("");
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedItem, setSelectedItem] = useState({});
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemSize, setItemSize] = useState("");
  const [itemWeight, setItemWeight] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [errors, setErrors] = useState({});
  const [preparedBy, setPreparedBy] = useState({});
  const [activeTab, setActiveTab] = useState("details");
  const storedItemGroups = useSelector((state) => state.itemGroups) || [];
  const storedItems = useSelector((state) => state.items) || [];
  const storedUnits = useSelector((state) => state.units) || [];
  const storedSites = useSelector((state) => state.sites) || [];
  const currentUser = useSelector((state) => state.auth.user) || {};
  const [submitLoader, setsubmitLoader] = useState(false);
  const [inventoryQuantity, setInventoryQuantity] = useState(null);
  const [loadingInventory, setLoadingInventory] = useState(false);
  useEffect(() => {
    setItemGroups(storedItemGroups.data);
    setItems(storedItems.data);
    setUnits(storedUnits.data);
    setSites(storedSites.data);
    setPreparedBy(currentUser);
    setSelectedSite(
      storedSites.data.find((site) => site.id == roleLevel.siteId)
    );
    setFormData({
      ...formData,
      requestingSite: storedSites.data.find(
        (site) => site.id == roleLevel.siteId
      ),
    });
  }, []);

  useEffect(() => {
    const fetchMachinesBySite = async () => {
      if (formData.requestingSite?.id) {
        try {
          // Fetch machines for the specific site
          const response = await api.get("/machinery", {
            params: { siteId: formData.requestingSite.id }
          });
          setMachines(response.data);
        } catch (error) {
          console.error("Error fetching machines:", error);
          toast({
            title: "Error",
            description: "Failed to fetch vehicle list",
            variant: "destructive"
          });
          setMachines([]);
        }
      } else {
        setMachines([]);
      }
    };

    fetchMachinesBySite();
  }, [formData.requestingSite?.id]);

  useEffect(() => {
    // Filter items based on selected item group
    if (selectedItemGroup) {
      const filtered = items.filter(
        (item) => item.itemGroupId === selectedItemGroup
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems([]);
    }

    // Reset selected item when item group changes
    setSelectedItem({});
  }, [selectedItemGroup, items]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleRequestedForTypeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      requestedFor: {
        type: value,
        value: "",
      },
    }));
  };

  const handleRequestedForValueChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      requestedFor: {
        ...prev.requestedFor,
        value,
      },
    }));
  };

  const addItem = () => {
    if (
      !selectedItem.id ||
      !itemQuantity ||
      Number.parseFloat(itemQuantity) <= 0
    ) {
      toast({
        title: "Invalid Item",
        description: "Please select an item and enter a valid quantity.",
        duration: 2000,
        variant: "destructive",
      });
      return;
    }

    // Check if item already exists in the list
    const existingItemIndex = formData.items.findIndex(
      (item) => item.id === selectedItem.id
    );

    if (existingItemIndex !== -1) {
      // Update existing item
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: Number.parseFloat(itemQuantity),
        size: itemSize,
        weight: itemWeight,
      };

      setFormData((prev) => ({
        ...prev,
        items: updatedItems,
      }));
    } else {
      const newItem = {
        quantity: Number.parseFloat(itemQuantity),
        weight: itemWeight,
        status: "pending", // Initial status for each item
        ...selectedItem,
      };

      setFormData((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
      }));
    }

    // Reset item selection fields
    setSelectedItem({});
    setItemQuantity("");
    setItemSize("");
    setItemWeight("");

    toast({
      title: "Item Added",
      duration: 1000,
      description: "The item has been added to the requisition.",
    });
  };

  const removeItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    toast({
      title: "Item Removed",
      description: "The item has been removed from the requisition.",
    });
  };
  const fetchInventoryQuantity = async (siteId, itemId) => {
    if (!itemId) {
      setInventoryQuantity(null);
      return;
    }

    setLoadingInventory(true);
    try {
      const response = await api.get(`/inventory/item/${itemId}`);
      const data = response.data[0];
      setInventoryQuantity(data.quantity || 0);
    } catch (error) {
      console.error("Error fetching inventory quantity:", error);
      setInventoryQuantity(0);
    } finally {
      setLoadingInventory(false);
    }
  };

  // 3. Update the item selection handler
  const handleItemChange = (item) => {
    setSelectedItem(item);
    if (item) {
      fetchInventoryQuantity(formData.siteId, item.id);
    } else {
      setInventoryQuantity(null);
    }
  };
  const validateForm = () => {
    const newErrors = {};

    if (!formData.requestingSite) {
      newErrors.requestingSite.name = "Requesting site is required";
    }
    if (!formData.requestedFor.value) {
      newErrors.requestedFor = `${formData.requestedFor.type} is required`;
    }
    if (formData.items.length === 0) {
      newErrors.items = "At least one item is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const prepareRequestPayload = () => {
    return {
      requestedAt: new Date(),
      requestingSiteId: formData.requestingSite?.id,
      requestedFor: formData.requestedFor.value,
      chargeType: formData.chargeType === "foc" ? "Foc" : "Chargeable",
      requestPriority:
        formData.priority === "low"
          ? "Low"
          : formData.priority === "medium"
            ? "Medium"
            : "High",
      dueDate: formData.dueDate || new Date().toISOString().split("T")[0],
      preparedById: preparedBy.id || currentUser.id,
      items: formData.items.map((item) => ({
        itemId: item.id,
        quantity: item.quantity,
      })),
    };
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    //Call Here API POST REQUEST

    try {
      setsubmitLoader(true);
      const payload = prepareRequestPayload();
      const res = await api.post("/requisitions", payload);
      toast({
        title: "Requisition Created",
        description: "The material requisition has been created successfully.",
        duration: 2000,
      });
      const newRequisition = res.data;
      navigate(`/requisitions/${newRequisition.id}`);
    } catch (error) {
      console.error("Error submitting requisition:", error);
      toast({
        title: "Submission Error",
        description: "Failed to create the requisition. Please try again.",
        variant: "destructive",
      });
    } finally {
      setsubmitLoader(false);
    }
  };

  const handlePrint = () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields before printing.",
        variant: "destructive",
      });
      return;
    }

    setShowPdf(true);
  };

  const goToNextTab = () => {
    if (activeTab === "details") {
      // Validate details before moving to items tab
      const detailErrors = {};

      if (!formData.requestingSite) {
        detailErrors.requestingSite = "Requesting site is required";
      }

      if (!formData.requestedFor.value) {
        detailErrors.requestedFor = `${formData.requestedFor.type} is required`;
      }

      setErrors(detailErrors);

      if (Object.keys(detailErrors).length === 0) {
        setActiveTab("items");
      } else {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
      }
    } else if (activeTab === "items") {
      if (formData.items.length === 0) {
        toast({
          title: "No Items Added",
          description: "Please add at least one item to the requisition.",
          variant: "destructive",
        });
      } else {
        setActiveTab("review");
      }
    }
  };

  return (
    <div className="space-y-6">
      {!showPdf ? (
        <>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/requisitions")}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              Create Material Requisition
            </h1>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="review">Review & Submit</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Requisition Details</CardTitle>
                  <CardDescription>
                    Enter the basic details for the material requisition
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="requestingSite">Requesting Site *</Label>
                      <Select
                        disabled={roleLevel.siteId}
                        value={formData.requestingSite}
                        onValueChange={(value) =>
                          handleSelectChange("requestingSite", value)
                        }
                      >
                        <SelectTrigger id="requestingSite">
                          <SelectValue placeholder="Select requesting site" />
                        </SelectTrigger>
                        <SelectContent>
                          {sites.map((site, index) => (
                            <SelectItem key={index} value={site}>
                              {site.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.requestingSite && (
                        <p className="text-sm text-destructive">
                          {errors.requestingSite}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        placeholder={`Enter Location`}
                        value={formData.requestingSite?.address || ""}
                        disabled
                        readOnly
                      />
                      {errors.location && (
                        <p className="text-sm text-destructive">
                          {errors.location}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Requested For *</Label>
                    <RadioGroup
                      value={formData.requestedFor.type}
                      onValueChange={handleRequestedForTypeChange}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="party" id="party" />
                        <Label htmlFor="party">Party</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="vehicle" id="vehicle" />
                        <Label htmlFor="vehicle">Vehicle</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="project" id="project" />
                        <Label htmlFor="project">Project</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="employee" id="employee" />
                        <Label htmlFor="employee">Employee</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="department" id="department" />
                        <Label htmlFor="department">Department</Label>
                      </div>
                    </RadioGroup>

                    <div className="pt-2">
                      {formData.requestedFor.type === "vehicle" ? (
                        <div className="flex flex-col gap-2">
                          <Popover open={openVehicleCombo} onOpenChange={setOpenVehicleCombo}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openVehicleCombo}
                                className="w-full justify-between"
                              >
                                {formData.requestedFor.value
                                  ? (() => {
                                    // Extract ID from the formatted string if present: "Name (Reg) [ID: 123]"
                                    const match = formData.requestedFor.value.match(/\[ID: (\d+)\]$/);
                                    const machineId = match ? parseInt(match[1]) : null;

                                    const machine = machines.find((m) =>
                                      machineId ? m.id === machineId : (m.machineName || m.name) === formData.requestedFor.value
                                    );

                                    if (machine) {
                                      const name = machine.machineName || machine.name;
                                      const reg = machine.registrationNumber ? `(${machine.registrationNumber})` : "";
                                      return `${name} ${reg}`;
                                    }
                                    return formData.requestedFor.value; // Fallback to raw value
                                  })()
                                  : "Select vehicle..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0" align="start">
                              {/* <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start"> */}
                              <Command>
                                <CommandInput placeholder="Search vehicle..." />
                                <CommandList>
                                  <CommandEmpty>No vehicle found.</CommandEmpty>
                                  <CommandGroup>
                                    {machines.map((machine) => {
                                      const name = machine.machineName || machine.name;
                                      const reg = machine.registrationNumber ? `(${machine.registrationNumber})` : "";
                                      const displayLabel = `${name} ${reg}`;
                                      const searchUnqiue = `${name} ${machine.registrationNumber || ""}`;

                                      return (
                                        <CommandItem
                                          key={machine.id}
                                          value={searchUnqiue}
                                          onSelect={() => {
                                            const formattedValue = `${name} ${reg} [ID: ${machine.id}]`.trim();
                                            handleRequestedForValueChange(
                                              formData.requestedFor.value === formattedValue
                                                ? ""
                                                : formattedValue
                                            );
                                            setOpenVehicleCombo(false);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              formData.requestedFor.value.includes(`[ID: ${machine.id}]`)
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          {displayLabel}
                                        </CommandItem>
                                      );
                                    })}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          {(!formData.requestingSite || !formData.requestingSite.id) && (
                            <p className="text-xs text-muted-foreground">Select a site first to see available vehicles</p>
                          )}
                        </div>
                      ) : (
                        <Input
                          placeholder={`Enter ${formData.requestedFor.type} details`}
                          value={formData.requestedFor.value}
                          onChange={(e) =>
                            handleRequestedForValueChange(
                              e.target.value.toUpperCase()
                            )
                          }
                        />
                      )}
                      {errors.requestedFor && (
                        <p className="text-sm text-destructive">
                          {errors.requestedFor}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Charge Type</Label>
                    <RadioGroup
                      value={formData.chargeType}
                      onValueChange={(value) =>
                        handleSelectChange("chargeType", value)
                      }
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="foc" id="foc" />
                        <Label htmlFor="foc">FOC</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="chargeable" id="chargeable" />
                        <Label htmlFor="chargeable">Chargeable</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Request Priority</Label>
                      <RadioGroup
                        value={formData.priority}
                        onValueChange={(value) =>
                          handleSelectChange("priority", value)
                        }
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="low" id="low" />
                          <Label htmlFor="low">Low</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="medium" />
                          <Label htmlFor="medium">Medium</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="urgent" id="urgent" />
                          <Label htmlFor="urgent">Urgent</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        name="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preparedBy">Prepared By *</Label>
                    <Input
                      id="preparedBy"
                      name="preparedBy"
                      value={preparedBy.name}
                      // onChange={handleChange}
                      disabled
                      readOnly
                      placeholder="Enter name of person preparing this requisition"
                    />
                    {errors.preparedBy && (
                      <p className="text-sm text-destructive">
                        {errors.preparedBy}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/requisitions/list")}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={goToNextTab}>
                    Next: Add Items
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="items" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add Items</CardTitle>
                  <CardDescription>
                    Add items to the material requisition
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="itemGroup">Item Group</Label>
                      <Select
                        value={selectedItemGroup}
                        onValueChange={setSelectedItemGroup}
                      >
                        <SelectTrigger id="itemGroup">
                          <SelectValue placeholder="Select item group" />
                        </SelectTrigger>
                        <SelectContent>
                          {itemGroups.length === 0 ? (
                            <SelectItem value={null} disabled>
                              No item groups available
                            </SelectItem>
                          ) : (
                            itemGroups.map((group) => (
                              <SelectItem key={group.id} value={group.id}>
                                {group.name.toUpperCase()}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="item">Item *</Label>
                      <Select
                        value={selectedItem}
                        onValueChange={handleItemChange}
                        disabled={!selectedItemGroup}
                      >
                        <SelectTrigger id="item">
                          <SelectValue
                            placeholder={
                              selectedItemGroup
                                ? "Select item"
                                : "Select item group first"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredItems.length === 0 ? (
                            <SelectItem value={null} disabled>
                              {selectedItemGroup
                                ? "No items in this group"
                                : "Select item group first"}
                            </SelectItem>
                          ) : (
                            filteredItems.map((item) => (
                              <SelectItem key={item.id} value={item}>
                                {item.name.toUpperCase()}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="size">Size/Part No</Label>
                      <Input
                        id="size"
                        value={selectedItem.partNumber || "NA"}
                        // onChange={(e) => setItemSize(e.target.value)}
                        disabled
                        readOnly
                        placeholder="Enter size or part number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity *</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="quantity"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={itemQuantity}
                          onChange={(e) => setItemQuantity(e.target.value)}
                          placeholder="Enter quantity"
                        />
                        <div className="w-20">
                          {selectedItem && (
                            <span className="text-sm text-muted-foreground">
                              {selectedItem?.Unit?.name || ""}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Inventory quantity display */}
                      {selectedItem && (
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-muted-foreground">
                            Available:
                          </span>
                          {loadingInventory ? (
                            <span className="text-muted-foreground">
                              Loading...
                            </span>
                          ) : (
                            <span
                              className={`font-medium ${inventoryQuantity === 0
                                ? "text-destructive"
                                : inventoryQuantity <
                                  parseFloat(itemQuantity || 0)
                                  ? "text-orange-600"
                                  : "text-green-600"
                                }`}
                            >
                              {inventoryQuantity !== null
                                ? `${inventoryQuantity} ${selectedItem?.Unit?.shortName || ""
                                }`
                                : "N/A"}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight/Unit</Label>
                      <Input
                        id="weight"
                        value={itemWeight}
                        onChange={(e) => setItemWeight(e.target.value)}
                        placeholder="Enter weight per unit"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={addItem}
                      disabled={!selectedItem || !itemQuantity}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sr. No</TableHead>
                          <TableHead>Item Group</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Part No</TableHead>
                          <TableHead>Qty/Unit</TableHead>
                          <TableHead>Weight/Unit</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.items.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="text-center py-6 text-muted-foreground"
                            >
                              No items added yet.
                            </TableCell>
                          </TableRow>
                        ) : (
                          formData.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                {item.ItemGroup.name.toUpperCase()}
                                {/* {getItemGroupName(item.itemGroupId)} */}
                              </TableCell>
                              <TableCell>{item.name.toUpperCase()}</TableCell>
                              <TableCell>
                                {item.partNumber.toUpperCase() || "-"}
                              </TableCell>
                              <TableCell>
                                {item.quantity}{" "}
                                {item.Unit.shortName.toUpperCase()}
                              </TableCell>
                              <TableCell>{item.weight || "-"}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeItem(index)}
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

                  {errors.items && (
                    <p className="text-sm text-destructive">{errors.items}</p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("details")}
                  >
                    Back to Details
                  </Button>
                  <Button type="button" onClick={goToNextTab}>
                    Next: Review
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="review" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Review & Submit</CardTitle>
                  <CardDescription>
                    Review the material requisition details before submitting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">
                        Requesting Site
                      </Label>
                      <p className="font-medium">
                        {formData.requestingSite?.name}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Location</Label>
                      <p className="font-medium">
                        {formData.requestingSite?.address}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-muted-foreground">
                        Requested For
                      </Label>
                      <p className="font-medium">
                        {formData.requestedFor.type.charAt(0).toUpperCase() +
                          formData.requestedFor.type.slice(1)}
                        : {formData.requestedFor.value}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-muted-foreground">
                        Charge Type
                      </Label>
                      <p className="font-medium">
                        {formData.chargeType === "foc" ? "FOC" : "Chargeable"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Priority</Label>
                      <p className="font-medium">
                        {formData.priority.charAt(0).toUpperCase() +
                          formData.priority.slice(1)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Due Date</Label>
                      <p className="font-medium">
                        {formData.dueDate
                          ? new Date(formData.dueDate).toLocaleDateString()
                          : "Not specified"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-muted-foreground">
                        Prepared By
                      </Label>
                      <p className="font-medium">{preparedBy.name}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Items</h3>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sr. No</TableHead>
                            <TableHead>Item Group</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Part No</TableHead>
                            <TableHead>Qty/Unit</TableHead>
                            <TableHead>Weight/Unit</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                {item.ItemGroup.name.toUpperCase()}
                              </TableCell>
                              <TableCell>{item.name.toUpperCase()}</TableCell>
                              <TableCell>
                                {item.partNumber.toUpperCase() || "-"}
                              </TableCell>
                              <TableCell>
                                {item.quantity}{" "}
                                {item.Unit.shortName.toUpperCase()}
                              </TableCell>
                              <TableCell>{item.weight || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("items")}
                  >
                    Back to Items
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      loading={submitLoader}
                      onClick={handleSubmit}
                    >
                      <Save className="mr-2 h-4 w-4" /> Save
                    </Button>
                    {/* <Button type="button" onClick={handlePrint}>
                      <Printer className="mr-2 h-4 w-4" /> Print
                    </Button> */}
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="flex flex-col h-screen">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Material Requisition Slip</h1>
            <Button variant="outline" onClick={() => setShowPdf(false)}>
              Back to Form
            </Button>
          </div>
          <div className="flex-1 border rounded">
            <PDFViewer width="100%" height="100%" className="border">
              <MaterialRequisitionPDF
                formData={formData}
                items={formData.items.map((item) => ({
                  ...item,
                  itemName: item.name,
                  unit: item.Unit.name,
                  issueTo: formData.requestedFor.type,
                  vehicleNumber:
                    formData.requestedFor.type === "vehicle"
                      ? formData.requestedFor.value
                      : "",
                  siteName:
                    formData.requestedFor.type !== "vehicle"
                      ? formData.requestedFor.value
                      : "",
                }))}
              />
            </PDFViewer>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialRequisitionForm;
