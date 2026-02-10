import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast, useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import { fetchMachineCategories } from "@/features/machine-category/machine-category-slice";
import api from "@/services/api/api-service";
import { useLocation, useNavigate } from "react-router";
import { Plus, PlusCircle } from "lucide-react";
import { fetchPrimaryCategories } from "@/features/primary-category/primary-category-slice";

// Validation schema using zod
const formSchema = z
  .object({
    primaryCategoryId: z.string().nonempty("Primary Category is required"),
    name: z.string().nonempty("Machine Category is required"),
    machineType: z.enum(["Vehicle", "Machine", "Drilling"], {
      errorMap: () => ({ message: "Please select a Machine Type" }),
    }),
    averageBase: z.enum(["Distance", "Time", "Both", "None"], {
      errorMap: () => ({ message: "Please select the Average Base" }),
    }),
    standardKmRun: z
      .string()
      .regex(/^\d*$/, "Must be a valid number")
      .optional(),
    standardHrsRun: z
      .string()
      .regex(/^\d*$/, "Must be a valid number")
      .optional(),
    standardMileage: z
      .string()
      .regex(/^\d*$/, "Must be a valid number")
      .optional(),
    ltrPerHour: z.string().regex(/^\d*$/, "Must be a valid number").optional(),
    // applicableFor: z
    //   .array(z.string())
    //   .min(1, "You must select at least one applicable item."),
  })
  .superRefine((data, ctx) => {
    const {
      averageBase,
      standardKmRun,
      standardHrsRun,
      standardMileage,
      ltrPerHour,
    } = data;

    const isEmpty = (val) => !val || val.trim() === "";

    if (averageBase === "Distance" || averageBase === "Both") {
      if (isEmpty(standardKmRun)) {
        ctx.addIssue({
          path: ["standardKmRun"],
          message: "Required field for Distance or Both",
          code: z.ZodIssueCode.custom,
        });
      }

      if (isEmpty(standardMileage)) {
        ctx.addIssue({
          path: ["standardMileage"],
          message: "Required field for Distance or Both",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    if (averageBase === "Time" || averageBase === "Both") {
      if (isEmpty(standardHrsRun)) {
        ctx.addIssue({
          path: ["standardHrsRun"],
          message: "Required field for Time or Both",
          code: z.ZodIssueCode.custom,
        });
      }

      if (isEmpty(ltrPerHour)) {
        ctx.addIssue({
          path: ["ltrPerHour"],
          message: "Required field for Time or Both",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

// Primary category form schema
const primaryCategorySchema = z.object({
  name: z.string().nonempty("Primary Category name is required"),
  // description: z.string().optional(),
});

const items = [
  { id: "insurance", label: "Insurance" },
  { id: "permit", label: "Permit" },
  { id: "fitness", label: "Fitness" },
  { id: "tax", label: "Tax" },
  { id: "puc", label: "PUC" },
  { id: "welfare", label: "Welfare" },
  { id: "iForm", label: "I Form" },
  { id: "greenTax", label: "Green Tax" },
];

export default function AddPrimaryCategoryForm() {
  const [loading, setLoading] = useState(false);
  const [addCategoryloader, setAddCategoryloader] = useState(false);
  const [isPrimaryCategoryDialogOpen, setIsPrimaryCategoryDialogOpen] =
    useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const data = location.state?.myData;

  const { data: primaryCategories, loading: primaryCategoryLoading } =
    useSelector((state) => state.primaryCategories) || [];

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      primaryCategoryId: "",
      name: data?.name || "",
      machineType: data?.machineType || "",
      averageBase: data?.averageBase || "",
      standardKmRun: (data?.standardKmRun && String(data?.standardKmRun)) || "",
      standardHrsRun:
        (data?.standardHrsRun && String(data?.standardHrsRun)) || "",
      standardMileage:
        (data?.standardMileage && String(data?.standardMileage)) || "",
      ltrPerHour: (data?.ltrPerHour && String(data?.ltrPerHour)) || "",
    },
  });

  const primaryCategoryForm = useForm({
    resolver: zodResolver(primaryCategorySchema),
    defaultValues: {
      name: "",
    },
  });
  const cleanEmptyStrings = (values) => {
    return Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ])
    );
  };
  async function onSubmit(values) {
    setLoading(true);
    try {
      if (data) {
        const res = await api.put(
          `/category/machine/${data.id}`,
          cleanEmptyStrings(values)
        );
        toast({
          title: "Success! ",
          description: "Machine category updated successfully",
        });
      } else {
        const res = await api.post(
          "/category/machine",
          cleanEmptyStrings(values)
        );
        toast({
          title: "Success! ",
          description: "Machine category created successfully",
        });
      }
      // dispatch(fetchMachineCategories());
      dispatch(fetchPrimaryCategories());
      navigate("/list-machine-category");
    } catch (error) {
      console.error("Form submission error", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description:
          error.response.data.message || "Failed to submit the form.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitPrimaryCategory(values) {
    setAddCategoryloader(true);
    try {
      const response = await api.post("/category/primary", values);
      toast({
        title: "Success!",
        description: "Primary category created successfully",
      });

      // Refresh primary categories
      dispatch(fetchPrimaryCategories());

      // Close the dialog
      setIsPrimaryCategoryDialogOpen(false);

      // Reset the primary category form
      primaryCategoryForm.reset();
    } catch (error) {
      console.error("Primary category creation error", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create primary category",
      });
    } finally {
      setAddCategoryloader(false);
    }
  }

  useEffect(() => {
    if (data) {
      form.setValue("primaryCategoryId", data.primaryCategory?.id || "");
    }
  }, [data, form, primaryCategories]);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 max-w-3xl py-6"
        >
          {/* Primary and Machine Category */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <Controller
                name="primaryCategoryId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Category</FormLabel>
                    <div className="flex gap-2">
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                        disabled={
                          !primaryCategories || primaryCategories.length === 0
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {primaryCategories.map((item) => (
                            <SelectItem key={item.id} value={String(item.id)}>
                              {item.name.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setIsPrimaryCategoryDialogOpen(true)}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage>
                      {form.formState.errors.primaryCategoryId?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Machine Category</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Machine Category"
                        {...field}
                        // onChange={(event) => {
                        //   event.target.value = event.target.value.toUpperCase();
                        // }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Applicable For */}
          {/* <FormField
          control={form.control}
          name="applicableFor"
          render={() => (
            <FormItem>
              <FormLabel>Applicable For</FormLabel>
              <div className="flex flex-wrap gap-4">
                {items.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="applicableFor"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) =>
                              checked
                                ? field.onChange([...field.value, item.id])
                                : field.onChange(
                                    field.value.filter(
                                      (value) => value !== item.id
                                    )
                                  )
                            }
                          />
                        </FormControl>
                        <FormLabel>{item.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        /> */}

          {/* Machine Type */}
          <FormField
            control={form.control}
            name="machineType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Machine Type</FormLabel>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-row"
                >
                  <FormItem className="flex items-center space-x-2 mr-2 space-y-1">
                    <FormControl>
                      <RadioGroupItem value="Vehicle" />
                    </FormControl>
                    <FormLabel>Vehicle</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 mr-2 space-y-1">
                    <FormControl>
                      <RadioGroupItem value="Machine" />
                    </FormControl>
                    <FormLabel>Machine</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 mr-2 space-y-1">
                    <FormControl>
                      <RadioGroupItem value="Drilling" />
                    </FormControl>
                    <FormLabel>Drilling</FormLabel>
                  </FormItem>
                </RadioGroup>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="averageBase"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Average Base</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row gap-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-1">
                        <FormControl>
                          <RadioGroupItem value="Distance" />
                        </FormControl>
                        <FormLabel className="font-normal">Distance</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-1">
                        <FormControl>
                          <RadioGroupItem value="Time" />
                        </FormControl>
                        <FormLabel className="font-normal">Time</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-1">
                        <FormControl>
                          <RadioGroupItem value="Both" />
                        </FormControl>
                        <FormLabel className="font-normal">Both</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-1">
                        <FormControl>
                          <RadioGroupItem value="None" />
                        </FormControl>
                        <FormLabel className="font-normal">None</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Standard Runs and Mileage */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <FormField
                control={form.control}
                name="standardKmRun"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Standard KM Run (In Month)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter KM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-6">
              <FormField
                control={form.control}
                name="standardHrsRun"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Standard Hrs. Run (In Month)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Hours" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <FormField
                control={form.control}
                name="standardMileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Standard Mileage (Km/Ltr)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Mileage" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-6">
              <FormField
                control={form.control}
                name="ltrPerHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ltr/hour</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Litres per Hour" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button loading={loading} type="submit">
            {data ? "Update Category" : "Add Category"}
          </Button>
        </form>
      </Form>

      <Dialog
        open={isPrimaryCategoryDialogOpen}
        onOpenChange={setIsPrimaryCategoryDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Primary Category</DialogTitle>
            <DialogDescription>
              Add a new primary category that will be available for selection.
            </DialogDescription>
          </DialogHeader>

          <Form {...primaryCategoryForm}>
            <form
              onSubmit={primaryCategoryForm.handleSubmit(
                onSubmitPrimaryCategory
              )}
              className="space-y-4"
            >
              <FormField
                control={primaryCategoryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter primary category name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={primaryCategoryForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button loading={addCategoryloader} type="submit">
                  Create Primary Category
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
export function UpdateMachineCategory({ data }) {
  const [openForm, setOpenForm] = useState(false);
  const closeForm = () => setOpenForm(false);
  const { toast } = useToast();
  const dispatch = useDispatch();

  const form = useForm({
    defaultValues: {
      name: data.name || "",
      averageBase: data.averageBase || "",
      remarks: data.remarks || "",
    },
  });

  async function onSubmit(values) {
    try {
      await api.put(`/category/machine/${data.id}`, values);
      toast({
        title: "Success!",
        description: "Machine category updated successfully",
      });
      dispatch(fetchMachineCategories());
      closeForm();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update machine category",
      });
    }
  }

  return (
    <Dialog open={openForm} onOpenChange={setOpenForm}>
      <DialogTrigger>Edit</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Machine Category</DialogTitle>
          <DialogDescription>
            Modify category details and click submit.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
