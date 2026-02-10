"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchItemGroups } from "@/features/item-groups/item-groups-slice";
import api from "@/services/api/api-service";

const ItemGroupForm = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const storedItemGroups = useSelector((state) => state.itemGroups) || [];
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    itemType: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      const itemGroups = storedItemGroups.data;
      const itemGroup = itemGroups.find((group) => group.id == id);

      if (itemGroup) {
        setFormData({
          name: itemGroup.name,
          shortName: itemGroup.shortName,
          itemType: itemGroup.itemType,
        });
      } else {
        // If item group not found, redirect to list
        navigate("/item-groups");
        toast({
          title: "Item Group Not Found",
          description: "The item group you're trying to edit doesn't exist.",
          variant: "destructive",
        });
      }
    }
  }, [id, isEditMode, navigate, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Item Group name is required";
    }

    // if (!formData.shortName.trim()) {
    //   newErrors.shortName = "Short name is required";
    // }

    // if (!formData.itemType.trim()) {
    //   newErrors.itemType = "Item Type is required";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Get existing item groups
    const itemGroups = storedItemGroups.data || [];

    if (isEditMode) {
      // Update existing item group

      api
        .put(`/item-groups/${id}`, formData)
        .then((response) => {})
        .catch((error) => {
          console.error("Error creating item group:", error);
        });

      toast({
        title: "Item Group Updated",
        description: "The item group has been updated successfully.",
      });
    } else {
      // Create new item group
      api
        .post("/item-groups", formData)
        .then((response) => {})
        .catch((error) => {
          console.error("Error creating item group:", error);
        });

      toast({
        title: "Item Group Created",
        description: "The new item group has been created successfully.",
      });
    }
    dispatch(fetchItemGroups());
    // Redirect to item groups list
    navigate("/item-groups");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/item-groups")}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditMode ? "Edit Item Group" : "Add Item Group"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditMode ? "Edit Item Group" : "Create New Item Group"}
          </CardTitle>
          <CardDescription>
            {isEditMode
              ? "Update the details of an existing item group"
              : "Add a new item group to categorize your inventory items"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Group Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter item group name"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortName">Item Group Short Name</Label>
              <Input
                id="shortName"
                name="shortName"
                value={formData.shortName}
                onChange={handleChange}
                placeholder="Enter short name"
              />
              {errors.shortName && (
                <p className="text-sm text-destructive">{errors.shortName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemType">Item Type</Label>
              <Input
                id="itemType"
                name="itemType"
                value={formData.itemType}
                onChange={handleChange}
                placeholder="Enter item itemType"
              />
              {errors.itemType && (
                <p className="text-sm text-destructive">{errors.itemType}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              itemType="button"
              variant="outline"
              onClick={() => navigate("/item-groups")}
            >
              Cancel
            </Button>
            <Button itemType="submit">
              {isEditMode ? "Update" : "Create"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ItemGroupForm;
