// edit-vendor-dialog.jsx

"use client";

import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import EditVendorForm from "./edit-vendor-form";

export default function EditVendorDialog({
  open,
  setOpen,
  vendorData,
  refreshVendorData,
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Vendor</DialogTitle>
          <DialogDescription>
            Update the vendor details and click save when done.
          </DialogDescription>
        </DialogHeader>
        <EditVendorForm
          vendorData={vendorData}
          onCancel={() => setOpen(false)}
          refreshVendorData={refreshVendorData}
        />
      </DialogContent>
    </Dialog>
  );
}
