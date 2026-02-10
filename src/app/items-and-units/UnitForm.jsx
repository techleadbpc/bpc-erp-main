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
import api from "@/services/api/api-service";
import { fetchUnits } from "@/features/units/units-slice";

const UnitForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const storedItemGroups = useSelector((state) => state.itemGroups) || [];
  const storedItems = useSelector((state) => state.items) || [];
  const storedUnits = useSelector((state) => state.units) || [];
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    decimalPlaces: "0",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      // Load unit data for editing
      const units = storedUnits.data || [];
      const unit = units.find((unit) => unit.id == id);

      if (unit) {
        setFormData({
          name: unit.name,
          shortName: unit.shortName,
          decimalPlaces: unit.decimalPlaces.toString(),
        });
      } else {
        // If unit not found, redirect to list
        navigate("/units");
        toast({
          title: "Unit Not Found",
          description:
            "The measurement unit you're trying to edit doesn't exist.",
          variant: "destructive",
        });
      }
    }
  }, [id, isEditMode, navigate, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // For decimal places, only allow numbers
    if (name === "decimalPlaces" && value !== "") {
      const numValue = Number.parseInt(value, 10);
      if (isNaN(numValue) || numValue < 0) {
        return;
      }
    }

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
      newErrors.name = "Unit name is required";
    }

    if (!formData.shortName.trim()) {
      newErrors.shortName = "Short name is required";
    }

    // if (formData.decimalPlaces === "") {
    //   newErrors.decimalPlaces = "Decimal places is required";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Get existing units
    const units = storedUnits.data || [];

    // Format the data
    const unitData = {
      ...formData,
      decimalPlaces: Number.parseInt(formData.decimalPlaces, 10),
    };

    if (isEditMode) {
      api
        .put(`/units/${id}`, unitData)
        .then((response) => {})
        .catch((error) => {
          console.error("Error creating item:", error);
        });

      toast({
        title: "Unit Updated",
        description: "The measurement unit has been updated successfully.",
      });
    } else {
      api
        .post("/units", unitData)
        .then((response) => {})
        .catch((error) => {
          console.error("Error creating uznit:", error);
        });

      toast({
        title: "Unit Created",
        description: "The new measurement unit has been created successfully.",
      });
    }
    dispatch(fetchUnits());
    // Redirect to units list
    navigate("/units");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate("/units")}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditMode ? "Edit Measurement Unit" : "Add Measurement Unit"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditMode
              ? "Edit Measurement Unit"
              : "Create New Measurement Unit"}
          </CardTitle>
          <CardDescription>
            {isEditMode
              ? "Update the details of an existing measurement unit"
              : "Add a new measurement unit for your inventory items"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Unit Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter unit name"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortName">Short Name *</Label>
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
              <Label htmlFor="decimalPlaces">Decimal Places</Label>
              <Input
                id="decimalPlaces"
                name="decimalPlaces"
                type="number"
                min="0"
                value={formData.decimalPlaces}
                onChange={handleChange}
                placeholder="Enter decimal places"
              />
              {errors.decimalPlaces && (
                <p className="text-sm text-destructive">
                  {errors.decimalPlaces}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/units")}
            >
              Cancel
            </Button>
            <Button type="submit">{isEditMode ? "Update" : "Create"}</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default UnitForm;
