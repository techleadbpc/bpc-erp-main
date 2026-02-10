import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "@/services/api/api-service";
import { useDispatch } from "react-redux";
import { fetchSites } from "@/features/sites/sites-slice";
import { Pencil } from "lucide-react";

// ⬇️ UPDATED: Added mobileNumber and pincode
const formSchema = z.object({
  name: z.string().trim().min(1, "Site Name is required"),
  code: z.string().optional(),
  address: z.string().trim().min(1, "Site Address is required"),
  mobileNumber: z.string().trim().min(10, "Mobile Number is required"),
  pincode: z.string().trim().min(6, "Pincode is required"),
  departmentId: z.number(),
});

export default function AddSiteForm({ close }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const dispatch = useDispatch();
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      address: "",
      mobileNumber: "",
      pincode: "",
      departmentId: 1,
    },
  });

  async function onSubmit(values) {
    setLoading(true);
    try {
      const res = await api.post("/sites", values);
      toast({
        title: "Success!",
        description: "Site created successfully",
      });
      dispatch(fetchSites());
      close();
    } catch (error) {
      console.error("Form submission error", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description:
          error.response?.data?.message || "Failed to submit the form.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-3xl py-4"
      >
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Name</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Enter site name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* <div className="col-span-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Code</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Enter site code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div> */}

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Enter mobile number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="pincode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pincode</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Enter pincode" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter address" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button loading={loading} type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
}

// UPDATE FORM
export function UpdateSite({ data }) {
  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const closeForm = () => setOpenForm(false);

  const { toast } = useToast();
  const dispatch = useDispatch();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data.name || "",
      code: data.code || "",
      address: data.address || "",
      mobileNumber: data.mobileNumber || "",
      pincode: data.pincode || "",
      departmentId: 1,
    },
  });

  async function onSubmit(values) {
    delete values.code;
    setLoading(true);
    try {
      const res = await api.put(`/sites/${data.id}`, values);
      toast({
        title: "Success!",
        description: "Site updated successfully",
      });
      closeForm();
      dispatch(fetchSites());
    } catch (error) {
      console.error("Form submission error", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description:
          error.response?.data?.message || "Failed to submit the form.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={openForm}
      onOpenChange={setOpenForm}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <DialogTrigger asChild>
        <button className="flex gap-2" onClick={() => setOpenForm(true)} variant="outline">
          <Pencil className="mr-2 h-4 w-4"/>
          Edit
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Update the site</DialogTitle>
          <DialogDescription>
            Update the site details and click submit.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 max-w-3xl py-4"
          >
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Name</FormLabel>
                      <FormControl>
                        <Input {...field} onKeyDown={(e) => e.stopPropagation()} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Code</FormLabel>
                      <FormControl>
                        <Input disabled {...field} onKeyDown={(e) => e.stopPropagation()} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input {...field} onKeyDown={(e) => e.stopPropagation()} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode</FormLabel>
                      <FormControl>
                        <Input {...field} onKeyDown={(e) => e.stopPropagation()} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Address</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none" {...field} onKeyDown={(e) => e.stopPropagation()} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button loading={loading} type="submit">
              Submit
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
