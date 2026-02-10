// add-vendor-dialog.jsx

"use client";

import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import AddVendorForm from "./add-vendor-form";

export default function AddVendorDialog({ open, setOpen, refreshVendorData }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Vendor</DialogTitle>
          <DialogDescription>
            Fill in the vendor details and click save when done.
          </DialogDescription>
        </DialogHeader>
        <AddVendorForm
          onCancel={() => setOpen(false)}
          refreshVendorData={refreshVendorData}
        />
      </DialogContent>
    </Dialog>
  );
}
