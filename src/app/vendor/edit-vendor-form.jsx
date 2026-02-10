// edit-vendor-form.jsx

"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/services/api/api-service";
import { toast } from "@/hooks/use-toast";

export default function EditVendorForm({
  vendorData,
  onCancel,
  refreshVendorData,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactPerson: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (vendorData) {
      setFormData({
        name: vendorData.name || "",
        email: vendorData.email || "",
        contactPerson: vendorData.contactPerson || "",
        phone: vendorData.phone || "",
        address: vendorData.address || "",
      });
    }
  }, [vendorData]);

  const updateVendorMutation = useMutation({
    mutationFn: (data) => api.put(`/vendors/${vendorData.id}`, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Vendor updated successfully.",
      });
      refreshVendorData();
      onCancel();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update vendor.",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateVendorMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Vendor Name *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactPerson">Contact Person *</Label>
        <Input
          id="contactPerson"
          name="contactPerson"
          value={formData.contactPerson}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone *</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={updateVendorMutation.isLoading}>
          {updateVendorMutation.isLoading ? "Updating..." : "Update Vendor"}
        </Button>
      </div>
    </form>
  );
}
