import { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Eye, EyeOff } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/services/api/api-service";
import { getIdByRole, ROLES } from "@/utils/roles";
import { useSelector } from "react-redux";

// Custom Dropdown Component
const CustomDropdown = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select option...", 
  searchPlaceholder = "Search...",
  className = "",
  error = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleOptionSelect = (option) => {
    onChange(option.name);
    setIsOpen(false);
    setSearchTerm("");
  };

  const selectedOption = options.find(option => option.name === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-3 py-2 text-left bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          "flex items-center justify-between min-h-[40px]",
          error && "border-red-500",
          !value && "text-gray-400",
          className
        )}
      >
        <span className="block truncate">
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronsUpDown 
          className={cn("w-4 h-4 transition-transform opacity-50", isOpen && "rotate-180")} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No sites found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.name}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100",
                    "flex items-center justify-between",
                    value === option.name && "bg-blue-50 text-blue-600"
                  )}
                >
                  <span>{option.name}</span>
                  {value === option.name && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const editFormSchema = z.object({
  name: z.string().min(3),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10),
  code: z.string().min(3),
  roleId: z.string().min(1),
  siteId: z.string(),
  password: z.string().optional(),
  confirm_password: z.string().optional(),
});

export default function EditUserForm({ userData, fetchUsersData, close }) {
  const { toast } = useToast();
  const { data: sites } = useSelector((s) => s.sites);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: userData.name || "",
      email: userData.email || "",
      phone: userData.phone || "",
      code: userData.code || "",
      roleId: userData.Role?.name || "",
      siteId: userData.Site?.name || "",
      password: "",
      confirm_password: "",
    },
  });

  async function onSubmit(values) {
    setLoading(true);
    try {
      if (values.password && values.password !== values.confirm_password) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Password and Confirm Password must be same.",
        });
        return;
      }

      const updatedData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        code: values.code,
        roleId: getIdByRole(values.roleId),
        siteId: sites.find((site) => values.siteId === site.name)?.id,
      };

      if (values.password) {
        updatedData.password = values.password;
      }

      await api.put(`/users/${userData.id}`, updatedData);

      toast({
        title: "Success! ",
        description: "User updated successfully",
      });

      fetchUsersData();
      close();
    } catch (error) {
      console.error(
        "Form submission error",
        error.response?.data?.message || error
      );
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description:
          error.response?.data?.message || "Failed to update the user.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-3xl"
      >
        {/* Name + Email */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Wick" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="example@domain.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Phone + Employee Code */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone No.</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
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
                  <FormLabel>Employee Code</FormLabel>
                  <FormControl>
                    <Input disabled type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Role + Site */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ROLES).map((role) => (
                        <SelectItem key={role.name} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="siteId"
              render={({ field }) => (
                <FormItem className="flex flex-col mt-2">
                  <FormLabel>Site</FormLabel>
                  <FormControl>
                    <CustomDropdown
                      options={sites || []}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select site"
                      searchPlaceholder="Search sites..."
                      className="py-6"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Password (Optional) */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showConfirmPassword ? "Hide password" : "Show password"}
                        </span>
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button loading={loading} type="submit">
          Update User
        </Button>
      </form>
    </Form>
  );
}
