import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { FormItem, FormLabel } from "./form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import { Button } from "./button";
import { Input } from "./input";
import { ScrollArea } from "./scroll-area";
import { PopoverArrow } from "@radix-ui/react-popover";

function SelectDropdown({ label, name, data, control }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filteredData = data?.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem className="space-y-0">
          <FormLabel>{label}</FormLabel>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {field.value
                  ? data.find((item) => item.id === field.value)?.name
                  : "Select an option"}
              </Button>
            </PopoverTrigger>

            <PopoverContent align={"start"} className="p-2">
              {/* Search Input */}
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-2"
                autoFocus
              />

              {/* List with ScrollArea */}
              <ScrollArea className="h-48">
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <div
                      key={item.id}
                      className="p-1 text-sm hover:bg-gray-100 cursor-pointer rounded"
                      onClick={() => {
                        field.onChange(item.id);
                        setOpen(false); // Close on selection
                      }}
                    >
                      {item.name}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500">
                    No results found.
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </FormItem>
      )}
    />
  );
}

export default SelectDropdown;


// import React from "react";
// import { Controller } from "react-hook-form";
// import { FormItem, FormLabel } from "./form";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "./select";

// function SelectDropdown({ label, name, data, control }) {
//   return (
//     <Controller
//       name={name}
//       control={control}
//       render={({ field }) => (
//         <FormItem className={"space-y-0"}>
//           <FormLabel>{label}</FormLabel>
//           <Select
//             onValueChange={field.onChange}
//             defaultValue={field.value}
//             disabled={!data || data.length === 0}
//           >
//             <SelectTrigger className="w-full">
//               <SelectValue placeholder="Select an option" />
//             </SelectTrigger>
//             <SelectContent>
//               {data.map((item) => (
//                 <SelectItem key={item.id} value={String(item.id)}>
//                   {item.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </FormItem>
//       )}
//     />
//   );
// }

// export default SelectDropdown;
