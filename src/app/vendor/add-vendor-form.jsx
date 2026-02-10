// add-vendor-form.jsx

"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/services/api/api-service";
import { toast } from "@/hooks/use-toast";

export default function AddVendorForm({ onCancel, refreshVendorData }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactPerson: "",
    phone: "",
    address: "",
  });

  const createVendorMutation = useMutation({
    mutationFn: (data) => api.post("/vendors", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Vendor created successfully.",
      });
      refreshVendorData();
      onCancel();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create vendor.",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createVendorMutation.mutate(formData);
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
        <Button type="submit" disabled={createVendorMutation.isLoading}>
          {createVendorMutation.isLoading ? "Creating..." : "Create Vendor"}
        </Button>
      </div>
    </form>
  );
}
