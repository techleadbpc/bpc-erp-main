// add-user-dialog.jsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddUserForm from "@/components/add-user-form";

export default function AddUserDialog({ open, setOpen, refreshUserData }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New User </DialogTitle>
          <DialogDescription>
            Fill in the user details and click save when done.
          </DialogDescription>
        </DialogHeader>
        <AddUserForm
          close={() => setOpen(false)}
          fetchUsersData={refreshUserData}
        />
      </DialogContent>
    </Dialog>
  );
}
