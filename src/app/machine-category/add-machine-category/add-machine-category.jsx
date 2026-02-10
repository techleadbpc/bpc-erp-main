import React from "react";
import AddPrimaryCategoryForm from "@/components/add-primary-category-form";
import Text from "@/components/ui/text";

function AddMachineCategory() {
  return (
    <div>
      <Text>Category Management</Text>
      <div>
        <AddPrimaryCategoryForm />
      </div>
    </div>
  );
}

export default AddMachineCategory;
