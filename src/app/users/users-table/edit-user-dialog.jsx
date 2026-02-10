// edit-user-dialog.jsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EditUserForm from "@/components/edit-user-form";

export default function EditUserDialosg({
  open,
  setOpen,
  userData,
  refreshUserData,
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update the user details and click save when done.
          </DialogDescription>
        </DialogHeader>
        <EditUserForm
          userData={userData}
          close={() => setOpen(false)}
          fetchUsersData={refreshUserData}
        />
      </DialogContent>
    </Dialog>
  );
}
