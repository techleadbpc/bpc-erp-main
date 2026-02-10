import React, { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ROLES, useUserRoleLevel } from "@/utils/roles";
import { useSelector } from "react-redux";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api/api-service";

export default function InventoryItemForm() {
  const { toast } = useToast();
  const roleLevel = useUserRoleLevel();

  const itemGroups = useSelector((state) => state.itemGroups?.data || []);
  const items = useSelector((state) => state.items?.data || []);
  const sites = useSelector((state) => state.sites?.data || []);

  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedItemGroup, setSelectedItemGroup] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState({});
  const [itemQuantity, setItemQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const defaultSite = sites.find((site) => site.id === roleLevel.siteId);
    setSelectedSite(defaultSite);
  }, [roleLevel.siteId, sites]);

  useEffect(() => {
    if (selectedItemGroup) {
      const filtered = items.filter(
        (item) => item.itemGroupId === selectedItemGroup
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems([]);
    }
    setSelectedItem({});
  }, [selectedItemGroup, items]);

  const addItemToInventory = async () => {
    if (!selectedSite.id) {
      toast({
        title: "Invalid Site",
        description: "Please select a site.",
        duration: 2000,
        variant: "destructive",
      });
      return;
    }

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

    try {
      setLoading(true);
      const inventoryItem = {
        siteId: selectedSite?.id,
        itemId: selectedItem.id,
        quantity: Number.parseFloat(itemQuantity),
      };

      await api.post("inventory", inventoryItem);

      toast({
        title: "Item added to inventory",
        description: "Check the inventory to find the item details.",
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Add Inventory Item
          </CardTitle>
          <CardDescription>
            Add a single inventory item with quantity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Site Selection */}
          <div className="space-y-2">
            <Label htmlFor="site">Site *</Label>
            <Select
              disabled={useUserRoleLevel().role == "site"}
              value={selectedSite}
              onValueChange={setSelectedSite}
            >
              <SelectTrigger id="site">
                <SelectValue placeholder="Select site" />
              </SelectTrigger>
              <SelectContent>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={site}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Item Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Item Group *</Label>
              <Select
                value={selectedItemGroup}
                onValueChange={setSelectedItemGroup}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select item group" />
                </SelectTrigger>
                <SelectContent>
                  {itemGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Item *</Label>
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
                    <SelectItem key={item.id} value={item}>
                      {item.name.toUpperCase()}
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
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(e.target.value)}
                  placeholder="Enter quantity"
                />
                <span className="text-sm text-muted-foreground">
                  {selectedItem?.Unit?.shortName || ""}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button loading={loading} onClick={addItemToInventory}>
              Add to Inventory
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
